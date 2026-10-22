import React, { useEffect, useState } from 'react';
import { Campaign, SessionLog } from '../types';
import { NPC_GENERATOR_TABLES, T20_CONDITIONS } from '../data/t20Database';
import { BOOKS_TOC } from '../data/booksToc';
import {
  BookOpen,
  Search,
  ShieldAlert,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  UserPlus,
  ListTree,
  Columns,
  FileSpreadsheet,
  Copy,
  Check,
} from 'lucide-react';

interface BooksAndShieldTabProps {
  campaign: Campaign;
  onUpdateCampaign: (patch: Partial<Campaign>) => void;
}

export type LibraryBookId = 'basico' | 'herois' | 'ameacas' | 'baralho';

const BOOK_CONFIG: Record<
  LibraryBookId,
  { short: string; name: string; offset: number; total: number; badgeClass: string; dotClass: string }
> = {
  basico: {
    short: 'LB',
    name: 'Livro Básico',
    offset: 6,
    total: 407,
    badgeClass: 'badge-basico',
    dotClass: 'dot-basico',
  },
  herois: {
    short: 'HA',
    name: 'Heróis de Arton',
    offset: 2,
    total: 332,
    badgeClass: 'badge-herois',
    dotClass: 'dot-herois',
  },
  ameacas: {
    short: 'AA',
    name: 'Ameaças de Arton',
    offset: 2,
    total: 436,
    badgeClass: 'badge-basico',
    dotClass: 'dot-basico',
  },
  baralho: {
    short: 'BA',
    name: 'Baralho de Aventuras',
    offset: 0,
    total: 57,
    badgeClass: 'badge-herois',
    dotClass: 'dot-herois',
  },
};

interface SearchHit {
  bookId: LibraryBookId;
  bookTitle: string;
  page: number;      // Página do PDF
  bookPage: number;  // Página impressa no livro
  score: number;
  matchesCount: number;
  snippet: string;
}

interface ReaderTabItem {
  id: string;
  bookId: LibraryBookId;
  pdfPage: number;
  bookPage: number;
  label: string;
  highlightQuery?: string;
}

function highlightTextReact(text: string, query: string): React.ReactNode {
  if (!query || query.trim().length < 2) return text;
  const escaped = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!escaped) return text;

  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="t20-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const BooksAndShieldTab: React.FC<BooksAndShieldTabProps> = ({
  campaign,
  onUpdateCampaign,
}) => {
  // Abre direto na consulta aos livros para facilitar o mestre
  const [subTab, setSubTab] = useState<'books' | 'shield' | 'sessions'>('books');

  // Modo da barra esquerda: 'search' (Busca) ou 'toc' (Sumário Navegável)
  const [leftMode, setLeftMode] = useState<'search' | 'toc'>('search');
  const [tocBookFilter, setTocBookFilter] = useState<'all' | LibraryBookId>('all');

  // Busca nos 4 Livros
  const [query, setQuery] = useState('');
  const [bookFilter, setBookFilter] = useState<'all' | LibraryBookId>('all');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchHit[]>([]);

  // Múltiplas Abas Internas de Leitura (para o mestre não precisar abrir vários PDFs fora)
  const [readerTabs, setReaderTabs] = useState<ReaderTabItem[]>([
    {
      id: 'tab-init-1',
      bookId: 'basico',
      pdfPage: 236,
      bookPage: 230,
      label: 'LB • Combate (Pág. 230)',
    },
    {
      id: 'tab-init-2',
      bookId: 'ameacas',
      pdfPage: 20,
      bookPage: 18,
      label: 'AA • Áreas de Tormenta (Pág. 18)',
    },
    {
      id: 'tab-init-3',
      bookId: 'baralho',
      pdfPage: 3,
      bookPage: 3,
      label: 'BA • Enredo (Pág. 3)',
    },
    {
      id: 'tab-init-4',
      bookId: 'herois',
      pdfPage: 15,
      bookPage: 13,
      label: 'HA • Galokk (Pág. 13)',
    },
  ]);
  const [activeReaderTabId, setActiveReaderTabId] = useState<string>('tab-init-1');

  // Modo de visualização da página à direita: 'split' (PDF + Texto), 'pdf' (Só PDF embutido), 'text' (Só Texto grifado)
  const [viewerMode, setViewerMode] = useState<'pdf' | 'split' | 'text'>('split');

  // Dados da página atualmente carregada
  const [loadedPageData, setLoadedPageData] = useState<{
    bookId: LibraryBookId;
    bookTitle: string;
    page: number;
    bookPage: number;
    totalPages: number;
    text: string;
  } | null>(null);

  const [copiedNote, setCopiedNote] = useState(false);

  // Filtro de Condições no Escudo
  const [condFilter, setCondFilter] = useState('');

  // Gerador de NPC
  const [generatedNpc, setGeneratedNpc] = useState<{
    name: string;
    race: string;
    role: string;
    appearance: string;
    quirk: string;
    secret: string;
  } | null>(null);

  const activeReaderTab =
    readerTabs.find((t) => t.id === activeReaderTabId) || readerTabs[0];

  // Carrega o texto da página sempre que a aba ativa ou página mudar
  useEffect(() => {
    if (!activeReaderTab) return;
    fetch(
      `/api/books/page?book=${encodeURIComponent(activeReaderTab.bookId)}&page=${
        activeReaderTab.pdfPage
      }`
    )
      .then((r) => r.json())
      .then((data) => {
        setLoadedPageData(data);
      })
      .catch(() => {
        // ignore
      });
  }, [activeReaderTab?.bookId, activeReaderTab?.pdfPage]);

  // Busca automática ao digitar (com pequeno debounce de 220ms)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      return;
    }
    const timer = setTimeout(() => {
      runBookSearch(q, bookFilter);
    }, 220);
    return () => clearTimeout(timer);
  }, [query, bookFilter]);

  const runBookSearch = async (customQuery?: string, customFilter?: 'all' | LibraryBookId) => {
    const q = (customQuery ?? query).trim();
    const bf = customFilter ?? bookFilter;
    if (q.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(q)}&book=${encodeURIComponent(bf)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const openPageInActiveTab = (
    bookId: LibraryBookId,
    pdfPage: number,
    customLabel?: string,
    highlightQuery?: string
  ) => {
    const cfg = BOOK_CONFIG[bookId] || BOOK_CONFIG.basico;
    const clampedPdf = Math.max(1, Math.min(cfg.total, pdfPage));
    const calcBookPage = Math.max(1, clampedPdf - cfg.offset);
    const label = customLabel || `${cfg.short} • Pág. ${calcBookPage}`;

    setReaderTabs((prev) =>
      prev.map((t) =>
        t.id === activeReaderTab.id
          ? {
              ...t,
              bookId,
              pdfPage: clampedPdf,
              bookPage: calcBookPage,
              label,
              highlightQuery: highlightQuery ?? t.highlightQuery,
            }
          : t
      )
    );
  };

  const openPageInNewTab = (
    bookId: LibraryBookId,
    pdfPage: number,
    customLabel?: string,
    highlightQuery?: string
  ) => {
    const cfg = BOOK_CONFIG[bookId] || BOOK_CONFIG.basico;
    const clampedPdf = Math.max(1, Math.min(cfg.total, pdfPage));
    const calcBookPage = Math.max(1, clampedPdf - cfg.offset);
    const newId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const newTab: ReaderTabItem = {
      id: newId,
      bookId,
      pdfPage: clampedPdf,
      bookPage: calcBookPage,
      label: customLabel || `${cfg.short} • Pág. ${calcBookPage}`,
      highlightQuery,
    };
    setReaderTabs((prev) => [...prev, newTab]);
    setActiveReaderTabId(newId);
  };

  const closeReaderTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readerTabs.length <= 1) return;
    const next = readerTabs.filter((t) => t.id !== id);
    setReaderTabs(next);
    if (activeReaderTabId === id) {
      setActiveReaderTabId(next[next.length - 1].id);
    }
  };

  const jumpByBookPageNumber = (bookPageNum: number) => {
    const cfg = BOOK_CONFIG[activeReaderTab.bookId] || BOOK_CONFIG.basico;
    openPageInActiveTab(activeReaderTab.bookId, bookPageNum + cfg.offset);
  };

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateRandomNpc = () => {
    setGeneratedNpc({
      name: pickRandom(NPC_GENERATOR_TABLES.names),
      race: pickRandom(NPC_GENERATOR_TABLES.races),
      role: pickRandom(NPC_GENERATOR_TABLES.roles),
      appearance: pickRandom(NPC_GENERATOR_TABLES.appearances),
      quirk: pickRandom(NPC_GENERATOR_TABLES.quirks),
      secret: pickRandom(NPC_GENERATOR_TABLES.secretsOrGoals),
    });
  };

  const filteredConditions = T20_CONDITIONS.filter(
    (c) =>
      !condFilter.trim() ||
      c.name.toLowerCase().includes(condFilter.toLowerCase()) ||
      c.summary.toLowerCase().includes(condFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(condFilter.toLowerCase())
  );

  return (
    <div className="tab-container">
      {/* Sub-navegação */}
      <div className="t20-toolbar">
        <div className="toolbar-group">
          <button
            className={`btn-t20 ${subTab === 'books' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('books')}
          >
            <BookOpen size={15} /> Consulta & Leitor dos 4 Livros (Básico, Heróis, Ameaças e Baralho)
          </button>
          <button
            className={`btn-t20 ${subTab === 'shield' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('shield')}
          >
            <ShieldAlert size={15} /> Escudo Rápido & Gerador de NPC
          </button>
          <button
            className={`btn-t20 ${subTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('sessions')}
          >
            <FileText size={15} /> Diário de Sessões & Notas da Campanha
          </button>
        </div>
      </div>

      {/* ========================================================================
          ABA 1: CONSULTA E LEITOR EMBUTIDO DOS 4 LIVROS
         ======================================================================== */}
      {subTab === 'books' && (
        <div className="books-workspace">
          {/* PAINEL ESQUERDO: BUSCA INSTANTÂNEA OU SUMÁRIO NAVEGÁVEL */}
          <div className="books-search-panel">
            <div className="left-mode-switch">
              <button
                className={`mode-btn ${leftMode === 'search' ? 'mode-btn-active' : ''}`}
                onClick={() => setLeftMode('search')}
              >
                <Search size={14} /> Busca por Palavra ({results.length})
              </button>
              <button
                className={`mode-btn ${leftMode === 'toc' ? 'mode-btn-active' : ''}`}
                onClick={() => setLeftMode('toc')}
              >
                <ListTree size={14} /> Sumário & Capítulos
              </button>
            </div>

            {leftMode === 'search' ? (
              <>
                <div className="books-search-bar">
                  <select
                    className="t20-select"
                    value={bookFilter}
                    onChange={(e) => setBookFilter(e.target.value as any)}
                  >
                    <option value="all">Todos os 4 (1.232p)</option>
                    <option value="basico">Livro Básico</option>
                    <option value="herois">Heróis de Arton</option>
                    <option value="ameacas">Ameaças de Arton</option>
                    <option value="baralho">Baralho de Aventuras</option>
                  </select>
                  <input
                    type="text"
                    className="books-query-input"
                    placeholder="Digite magia, poder, raça, regra, monstro..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runBookSearch()}
                  />
                  {query && (
                    <button
                      className="btn-clear-q"
                      onClick={() => {
                        setQuery('');
                        setResults([]);
                      }}
                      title="Limpar busca"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Atalhos Rápidos de Consulta */}
                <div className="quick-topic-chips">
                  {[
                    'Galokk',
                    'Machado de Pedra',
                    'Treinador',
                    'Complicações',
                    'De Peito Aberto',
                    'Distinções',
                    'Dragão',
                    'Lefeu',
                    'Duyshidakk',
                    'Puristas',
                    'Sckhar',
                    'Tesouro',
                    'Manobras de Combate',
                    'Itens Superiores',
                    'Culinária Avançada',
                  ].map((topic) => (
                    <button
                      key={topic}
                      className="topic-chip"
                      onClick={() => {
                        setQuery(topic);
                        runBookSearch(topic);
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {/* Lista de Resultados com Grifo */}
                <div className="book-results-list">
                  {searching ? (
                    <div className="muted-hint">Pesquisando nos 4 livros...</div>
                  ) : results.length === 0 ? (
                    <div className="muted-hint">
                      Digite qualquer termo acima (ex: <em>"Agarrar"</em>, <em>"Galokk"</em>,{' '}
                      <em>"Dragão"</em>, <em>"Lefeu"</em>) ou mude para a aba{' '}
                      <strong>Sumário & Capítulos</strong> para navegar pelos índices completos dos
                      quatro livros.
                    </div>
                  ) : (
                    results.map((hit, idx) => {
                      const isCurrent =
                        activeReaderTab.bookId === hit.bookId &&
                        activeReaderTab.pdfPage === hit.page;
                      const cfg = BOOK_CONFIG[hit.bookId] || BOOK_CONFIG.basico;
                      return (
                        <div
                          key={`${hit.bookId}-${hit.page}-${idx}`}
                          className={`book-hit-card ${isCurrent ? 'hit-active' : ''}`}
                          onClick={() =>
                            openPageInActiveTab(
                              hit.bookId,
                              hit.page,
                              `${cfg.short} • ${query.slice(0, 12)} (P.${hit.bookPage})`,
                              query
                            )
                          }
                        >
                          <div className="hit-head">
                            <div>
                              <span className={`book-badge ${cfg.badgeClass}`}>
                                {cfg.name}
                              </span>
                              <strong className="hit-page-label">
                                Pág. {hit.bookPage}{' '}
                                <small className="text-muted">(PDF {hit.page})</small>
                              </strong>
                            </div>

                            <div className="hit-right-meta">
                              <span className="hit-count-pill">{hit.matchesCount}x</span>
                              <button
                                className="btn-open-new-tab"
                                title="Abrir esta página em uma nova aba interna de consulta"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPageInNewTab(
                                    hit.bookId,
                                    hit.page,
                                    `${cfg.short} • Pág. ${hit.bookPage}`,
                                    query
                                  );
                                }}
                              >
                                + Aba
                              </button>
                            </div>
                          </div>
                          <p className="hit-snippet">
                            {highlightTextReact(hit.snippet, query)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* MODO SUMÁRIO E CAPÍTULOS NAVEGÁVEIS */
              <>
                <div className="toc-filter-row">
                  <button
                    className={`cat-pill ${tocBookFilter === 'all' ? 'cat-pill-active' : ''}`}
                    onClick={() => setTocBookFilter('all')}
                  >
                    Todos
                  </button>
                  <button
                    className={`cat-pill ${tocBookFilter === 'basico' ? 'cat-pill-active' : ''}`}
                    onClick={() => setTocBookFilter('basico')}
                  >
                    Básico
                  </button>
                  <button
                    className={`cat-pill ${tocBookFilter === 'herois' ? 'cat-pill-active' : ''}`}
                    onClick={() => setTocBookFilter('herois')}
                  >
                    Heróis
                  </button>
                  <button
                    className={`cat-pill ${tocBookFilter === 'ameacas' ? 'cat-pill-active' : ''}`}
                    onClick={() => setTocBookFilter('ameacas')}
                  >
                    Ameaças
                  </button>
                  <button
                    className={`cat-pill ${tocBookFilter === 'baralho' ? 'cat-pill-active' : ''}`}
                    onClick={() => setTocBookFilter('baralho')}
                  >
                    Baralho
                  </button>
                </div>

                <div className="toc-sections-list">
                  {BOOKS_TOC.filter(
                    (sec) => tocBookFilter === 'all' || sec.bookId === tocBookFilter
                  ).map((sec, sIdx) => {
                    const cfg = BOOK_CONFIG[sec.bookId] || BOOK_CONFIG.basico;
                    return (
                      <div key={sIdx} className="toc-group-card">
                        <div
                          className="toc-group-header"
                          onClick={() =>
                            openPageInActiveTab(
                              sec.bookId,
                              sec.pdfPage,
                              `${cfg.short} • ${sec.title.slice(0, 16)}`
                            )
                          }
                        >
                          <span className={`book-badge ${cfg.badgeClass}`}>
                            {cfg.short}
                          </span>
                          <strong>{sec.title}</strong>
                          <small>Pág. {sec.bookPage}</small>
                        </div>
                        <div className="toc-items-grid">
                          {sec.items.map((item, iIdx) => (
                            <div key={iIdx} className="toc-item-row">
                              <button
                                className="toc-item-btn"
                                onClick={() =>
                                  openPageInActiveTab(
                                    sec.bookId,
                                    item.pdfPage,
                                    `${cfg.short} • ${item.label.slice(0, 16)}`
                                  )
                                }
                              >
                                <span>{item.label}</span>
                                <span className="toc-p-num">Pág. {item.bookPage}</span>
                              </button>
                              <button
                                className="btn-open-new-tab"
                                title="Abrir em nova aba interna"
                                onClick={() =>
                                  openPageInNewTab(
                                    sec.bookId,
                                    item.pdfPage,
                                    `${cfg.short} • ${item.label.slice(0, 15)}`
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* PAINEL DIREITO: LEITOR EMBUTIDO MULTI-ABAS (PDF DIRETO NA PÁGINA + TEXTO GRIFADO) */}
          <div className="book-reader-panel">
            {/* Barra de Abas Internas de Consulta (evita abrir vários PDFs fora!) */}
            <div className="internal-reader-tabs">
              {readerTabs.map((tab) => {
                const cfg = BOOK_CONFIG[tab.bookId] || BOOK_CONFIG.basico;
                return (
                  <div
                    key={tab.id}
                    className={`reader-tab-pill ${
                      tab.id === activeReaderTab.id ? 'reader-tab-active' : ''
                    }`}
                    onClick={() => setActiveReaderTabId(tab.id)}
                  >
                    <span className={`mini-dot ${cfg.dotClass}`} />
                    <span className="reader-tab-title">{tab.label}</span>
                    {readerTabs.length > 1 && (
                      <button
                        className="reader-tab-close"
                        onClick={(e) => closeReaderTab(tab.id, e)}
                        title="Fechar esta aba"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                className="btn-add-reader-tab"
                onClick={() => {
                  const cfg = BOOK_CONFIG[activeReaderTab.bookId] || BOOK_CONFIG.basico;
                  openPageInNewTab(
                    activeReaderTab.bookId,
                    activeReaderTab.pdfPage,
                    `${cfg.short} • Pág. ${activeReaderTab.bookPage}`
                  );
                }}
                title="Duplicar aba atual para consultar outra página sem perder esta"
              >
                <Plus size={13} /> Nova Aba
              </button>
            </div>

            {/* Controles da Página Atual */}
            <div className="reader-toolbar">
              <div className="reader-nav-controls">
                <select
                  className="t20-select"
                  value={activeReaderTab.bookId}
                  onChange={(e) => {
                    const nextBook = e.target.value as LibraryBookId;
                    openPageInActiveTab(nextBook, nextBook === 'baralho' ? 3 : 15);
                  }}
                >
                  <option value="basico">📘 Livro Básico (Jogo do Ano)</option>
                  <option value="herois">📙 Heróis de Arton</option>
                  <option value="ameacas">📕 Ameaças de Arton (Bestiário)</option>
                  <option value="baralho">🃏 Baralho de Aventuras</option>
                </select>

                <button
                  className="btn-t20 btn-xs btn-secondary"
                  disabled={activeReaderTab.pdfPage <= 1}
                  onClick={() =>
                    openPageInActiveTab(
                      activeReaderTab.bookId,
                      activeReaderTab.pdfPage - 1
                    )
                  }
                >
                  <ChevronLeft size={14} /> Anterior
                </button>

                <label className="page-jump-box" title="Número impresso no rodapé do livro">
                  Pág. Livro:
                  <input
                    type="number"
                    value={activeReaderTab.bookPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) jumpByBookPageNumber(val);
                    }}
                  />
                </label>

                <label className="page-jump-box" title="Página real do arquivo PDF">
                  PDF:
                  <input
                    type="number"
                    value={activeReaderTab.pdfPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) openPageInActiveTab(activeReaderTab.bookId, val);
                    }}
                  />
                  <span>/ {(BOOK_CONFIG[activeReaderTab.bookId] || BOOK_CONFIG.basico).total}</span>
                </label>

                <button
                  className="btn-t20 btn-xs btn-secondary"
                  disabled={
                    activeReaderTab.pdfPage >=
                    (BOOK_CONFIG[activeReaderTab.bookId] || BOOK_CONFIG.basico).total
                  }
                  onClick={() =>
                    openPageInActiveTab(
                      activeReaderTab.bookId,
                      activeReaderTab.pdfPage + 1
                    )
                  }
                >
                  Próxima <ChevronRight size={14} />
                </button>
              </div>

              {/* Alternador de Modo: PDF Embutido vs Dividido vs Texto */}
              <div className="viewer-mode-toggle">
                <button
                  className={`btn-t20 btn-xs ${
                    viewerMode === 'pdf' ? 'btn-orange' : 'btn-secondary'
                  }`}
                  onClick={() => setViewerMode('pdf')}
                  title="Mostrar a página original ilustrada do PDF direto aqui dentro"
                >
                  <FileSpreadsheet size={13} /> Só PDF na Tela
                </button>
                <button
                  className={`btn-t20 btn-xs ${
                    viewerMode === 'split' ? 'btn-orange' : 'btn-secondary'
                  }`}
                  onClick={() => setViewerMode('split')}
                  title="Mostrar o PDF ilustrado e o Texto grifado lado a lado"
                >
                  <Columns size={13} /> PDF + Texto
                </button>
                <button
                  className={`btn-t20 btn-xs ${
                    viewerMode === 'text' ? 'btn-orange' : 'btn-secondary'
                  }`}
                  onClick={() => setViewerMode('text')}
                  title="Mostrar apenas o texto extraído com destaques da busca"
                >
                  <FileText size={13} /> Só Texto
                </button>
              </div>
            </div>

            {/* Corpo do Visualizador Embutido */}
            <div className={`reader-body-grid mode-${viewerMode}`}>
              {/* Coluna do PDF Original Embutido */}
              {(viewerMode === 'pdf' || viewerMode === 'split') && (
                <div className="embedded-pdf-pane">
                  <iframe
                    key={`${activeReaderTab.bookId}-${activeReaderTab.pdfPage}`}
                    src={`/api/pdf/${activeReaderTab.bookId}#page=${activeReaderTab.pdfPage}&view=FitH&toolbar=1`}
                    title="Leitor de PDF Embutido Mestre20"
                    className="embedded-pdf-iframe"
                  />
                </div>
              )}

              {/* Coluna do Texto Extraído com Grifo da Busca */}
              {(viewerMode === 'text' || viewerMode === 'split') && (
                <div className="extracted-text-pane">
                  <div className="extracted-text-header">
                    <span>
                      Texto da Página {activeReaderTab.bookPage} (PDF {activeReaderTab.pdfPage})
                    </span>
                    <button
                      className="btn-t20 btn-xs btn-ghost"
                      onClick={() => {
                        if (!loadedPageData?.text) return;
                        navigator.clipboard?.writeText(loadedPageData.text);
                        const cfg = BOOK_CONFIG[activeReaderTab.bookId] || BOOK_CONFIG.basico;
                        const snippet = `\n[${cfg.name}, pág. ${activeReaderTab.bookPage}]:\n${loadedPageData.text.slice(
                          0,
                          400
                        )}...`;
                        onUpdateCampaign({
                          gmQuickNotes: (campaign.gmQuickNotes || '') + snippet,
                        });
                        setCopiedNote(true);
                        setTimeout(() => setCopiedNote(false), 1800);
                      }}
                    >
                      {copiedNote ? (
                        <>
                          <Check size={12} /> Copiado p/ Notas!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Enviar Trecho p/ Notas
                        </>
                      )}
                    </button>
                  </div>
                  <div className="reader-page-content">
                    {loadedPageData ? (
                      highlightTextReact(
                        loadedPageData.text,
                        activeReaderTab.highlightQuery || query
                      )
                    ) : (
                      'Carregando texto da página...'
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          ABA 2: ESCUDO DO MESTRE & GERADOR DE NPC
         ======================================================================== */}
      {subTab === 'shield' && (
        <div className="shield-grid">
          <div className="shield-col">
            <div className="shield-card">
              <div className="shield-card-head">
                <h4>
                  <Sparkles size={16} className="text-orange" /> Gerador Rápido de NPC (Heróis de
                  Arton)
                </h4>
                <button className="btn-t20 btn-xs btn-orange" onClick={generateRandomNpc}>
                  <UserPlus size={13} /> Sortear NPC
                </button>
              </div>
              {generatedNpc ? (
                <div className="npc-gen-box">
                  <div className="npc-gen-title">
                    <strong>{generatedNpc.name}</strong> — {generatedNpc.race} ({generatedNpc.role})
                  </div>
                  <p>
                    <strong>Aparência:</strong> {generatedNpc.appearance}
                  </p>
                  <p>
                    <strong>Trejeito:</strong> {generatedNpc.quirk}
                  </p>
                  <p>
                    <strong>Objetivo / Gancho:</strong> {generatedNpc.secret}
                  </p>
                  <button
                    className="btn-t20 btn-xs btn-secondary"
                    onClick={() => {
                      const text = `\n• NPC: ${generatedNpc.name} (${generatedNpc.race}, ${generatedNpc.role}) — ${generatedNpc.appearance}. Trejeito: ${generatedNpc.quirk}. Gancho: ${generatedNpc.secret}`;
                      onUpdateCampaign({
                        gmQuickNotes: (campaign.gmQuickNotes || '') + text,
                      });
                    }}
                  >
                    + Salvar nas Notas do Mestre
                  </button>
                </div>
              ) : (
                <p className="muted-hint">
                  Clique em "Sortear NPC" para gerar instantaneamente um coadjuvante com nome, raça,
                  aparência, trejeito e gancho de aventura.
                </p>
              )}
            </div>

            <div className="shield-card">
              <h4>Classes de Dificuldade (CDs Padrão — Livro Básico)</h4>
              <table className="t20-table">
                <thead>
                  <tr>
                    <th>Dificuldade</th>
                    <th>CD</th>
                    <th>Exemplo de Tarefa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Muito Fácil</td>
                    <td><strong>0</strong></td>
                    <td>Notar algo grande à vista, subir corda com nós</td>
                  </tr>
                  <tr>
                    <td>Fácil</td>
                    <td><strong>5</strong></td>
                    <td>Escalar muro com apoios, seguir trilha recente na lama</td>
                  </tr>
                  <tr>
                    <td>Média</td>
                    <td><strong>10</strong></td>
                    <td>Ouvir guarda se aproximando, nadar em água agitada</td>
                  </tr>
                  <tr>
                    <td>Difícil</td>
                    <td><strong>15</strong></td>
                    <td>Estabilizar sangramento (Cura/Con), arrombar porta comum</td>
                  </tr>
                  <tr>
                    <td>Muito Difícil</td>
                    <td><strong>20</strong></td>
                    <td>Agarrar-se na beirada de precipício (Ref), fechadura superior</td>
                  </tr>
                  <tr>
                    <td>Heroica</td>
                    <td><strong>25</strong></td>
                    <td>Convencer guarda hostil, decifrar texto arcano ancestral</td>
                  </tr>
                  <tr>
                    <td>Lendária</td>
                    <td><strong>30+</strong></td>
                    <td>Rastrear no chão de pedra após chuva, nadar contra cachoeira</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="shield-card">
              <h4>Modificadores de Situações Especiais (pág. 239)</h4>
              <table className="t20-table">
                <thead>
                  <tr>
                    <th>Situação</th>
                    <th>Modificador</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Atacante <strong>Flanqueando</strong> (corpo a corpo, lados opostos)</td>
                    <td className="text-green"><strong>+2 no ataque</strong></td>
                  </tr>
                  <tr>
                    <td>Atacante em <strong>Posição Elevada</strong></td>
                    <td className="text-green"><strong>+2 no ataque</strong></td>
                  </tr>
                  <tr>
                    <td>Atacante <strong>Invisível</strong></td>
                    <td className="text-green"><strong>+5 no ataque</strong> (e alvo desprevenido)</td>
                  </tr>
                  <tr>
                    <td>Atacante <strong>Caído</strong> ou Atirando em Corpo a Corpo (sem Mirar)</td>
                    <td className="text-red"><strong>–5 no ataque</strong></td>
                  </tr>
                  <tr>
                    <td>Alvo <strong>Caído</strong></td>
                    <td><strong>–5 na Defesa</strong> (corpo a corpo) / <strong>+5</strong> (à distância)</td>
                  </tr>
                  <tr>
                    <td>Alvo <strong>Desprevenido</strong> ou <strong>Cego</strong></td>
                    <td className="text-red"><strong>–5 na Defesa</strong></td>
                  </tr>
                  <tr>
                    <td>Alvo sob <strong>Cobertura Leve</strong> / <strong>Total</strong></td>
                    <td><strong>+5 na Defesa</strong> / Não pode ser atacado</td>
                  </tr>
                  <tr>
                    <td>Alvo sob <strong>Camuflagem Leve</strong> / <strong>Total</strong></td>
                    <td><strong>20% falha</strong> (1-2 no d10) / <strong>50% falha</strong> (1-5 no d10)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="shield-card">
              <h4>Manobras de Combate (Teste de Ataque Corpo a Corpo Oposto — pág. 234)</h4>
              <ul className="t20-bullet-list">
                <li>
                  <strong>Agarrar:</strong> Só com ataque desarmado ou arma natural. Alvo fica{' '}
                  <em>agarrado</em> (desprevenido, imóvel, –2 ataque, só armas leves).
                </li>
                <li>
                  <strong>Derrubar:</strong> Deixa o alvo <em>caído</em>. Se vencer por 5 ou mais,
                  empurra 1 quadrado (1,5m) em direção à escolha.
                </li>
                <li>
                  <strong>Desarmar:</strong> Derruba item segurado no mesmo quadrado. Se vencer por
                  5 ou mais, joga o item a 1 quadrado de distância.
                </li>
                <li>
                  <strong>Empurrar:</strong> Empurra 1,5m (+1,5m para cada 5 pontos de diferença).
                </li>
                <li>
                  <strong>Quebrar:</strong> Causa dano ao item segurado (veja RD e PV de objetos:
                  arma leve metal RD 10/PV 2; uma mão metal RD 10/PV 5; duas mãos metal RD 10/PV 10;
                  porta de madeira Def 8, RD 5, PV 20).
                </li>
              </ul>
            </div>
          </div>

          <div className="shield-col">
            <div className="shield-card conditions-reference-card">
              <div className="shield-card-head">
                <h4>Todas as Condições (Livro Básico pág. 394)</h4>
                <input
                  type="text"
                  className="cond-filter-input"
                  placeholder="Filtrar condição (ex: medo, cansaço, caído)..."
                  value={condFilter}
                  onChange={(e) => setCondFilter(e.target.value)}
                />
              </div>
              <div className="conditions-ref-list">
                {filteredConditions.map((c) => (
                  <div key={c.name} className="cond-ref-item">
                    <div className="cond-ref-top">
                      <strong>{c.name}</strong>
                      <span className="cond-cat-tag">{c.category}</span>
                    </div>
                    <p>{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          ABA 3: DIÁRIO DE SESSÕES E NOTAS DA CAMPANHA
         ======================================================================== */}
      {subTab === 'sessions' && (
        <div className="sessions-grid">
          <div className="sessions-list-col">
            <div className="shield-card-head">
              <h3>Diário de Sessões</h3>
              <button
                className="btn-t20 btn-xs btn-primary"
                onClick={() => {
                  const nextNum = campaign.sessions.length + 1;
                  const newSess: SessionLog = {
                    id: `sess-${Date.now()}`,
                    number: nextNum,
                    title: `Sessão ${nextNum}`,
                    date: new Date().toLocaleDateString('pt-BR'),
                    summary: '',
                    npcsMet: '',
                    rewardsAndXp: '',
                  };
                  onUpdateCampaign({ sessions: [newSess, ...campaign.sessions] });
                }}
              >
                <Plus size={14} /> Nova Sessão
              </button>
            </div>

            {campaign.sessions.map((sess, sIdx) => {
              const updateSess = (patch: Partial<SessionLog>) => {
                const next = campaign.sessions.map((item, i) =>
                  i === sIdx ? { ...item, ...patch } : item
                );
                onUpdateCampaign({ sessions: next });
              };
              return (
                <div key={sess.id} className="session-card">
                  <div className="session-head">
                    <input
                      type="text"
                      className="session-title-input"
                      value={sess.title}
                      onChange={(e) => updateSess({ title: e.target.value })}
                    />
                    <input
                      type="text"
                      className="session-date-input"
                      value={sess.date}
                      onChange={(e) => updateSess({ date: e.target.value })}
                    />
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() =>
                        onUpdateCampaign({
                          sessions: campaign.sessions.filter((_, i) => i !== sIdx),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Resumo dos acontecimentos da sessão..."
                    value={sess.summary}
                    onChange={(e) => updateSess({ summary: e.target.value })}
                  />
                  <div className="session-sub-grid">
                    <input
                      type="text"
                      placeholder="NPCs encontrados / Locais visitados"
                      value={sess.npcsMet}
                      onChange={(e) => updateSess({ npcsMet: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Tesouros (T$) e XP distribuídos"
                      value={sess.rewardsAndXp}
                      onChange={(e) => updateSess({ rewardsAndXp: e.target.value })}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="gm-notes-col">
            <div className="shield-card">
              <h4>Bloco de Notas Geral do Mestre (Campanha: {campaign.name})</h4>
              <textarea
                className="gm-master-textarea"
                rows={18}
                value={campaign.gmQuickNotes}
                placeholder="Segredos da campanha, planos dos vilões, lembretes de regras opcionais..."
                onChange={(e) => onUpdateCampaign({ gmQuickNotes: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
