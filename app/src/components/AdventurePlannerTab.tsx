import React, { useState, useMemo } from 'react';
import {
  Campaign,
  ThreatSheet,
  DiceRollEntry,
  PlannedEncounter,
  PlannedEncounterMonster,
} from '../types';
import { FULL_BESTIARY } from '../data/bestiaryData';
import {
  BARALHO_AVENTURAS,
  AdventureCard,
  AdventureCardCategory,
  DrawnAdventureSlot,
  drawNimbAdventure,
  RANDOM_ENCOUNTER_TABLES,
  rollRandomEncounter,
} from '../data/baralhoData';
import {
  TreasureRollResult,
  TreasureModifier,
  rollTreasureByND,
} from '../utils/treasureRoller';
import {
  rollD20Test,
  rollFormula,
  parseModifier,
  parseNdNumeric,
  calculateEncounterStats,
} from '../utils/dice';
import {
  Sparkles,
  Skull,
  Coins,
  Swords,
  Dices,
  Plus,
  Trash2,
  Search,
  MapPin,
  Check,
  FileSpreadsheet,
  FolderKanban,
  RefreshCw,
} from 'lucide-react';

interface AdventurePlannerTabProps {
  campaign: Campaign;
  onUpdateCampaign: (partial: Partial<Campaign>) => void;
  onAddRoll: (entry: DiceRollEntry) => void;
  onSendEncounterToCombat: (
    monsters: { threat: ThreatSheet; count: number }[],
    encounterTitle?: string
  ) => void;
}

type PlannerSubTab = 'bestiario' | 'baralho' | 'tesouros' | 'salvos';

const CARD_CATEGORY_META: Record<
  AdventureCardCategory,
  { label: string; icon: string; color: string }
> = {
  Enredo: { label: 'Enredo', icon: '📜', color: '#f59e0b' },
  Personagem: { label: 'Personagem', icon: '👑', color: '#38bdf8' },
  Ameaça: { label: 'Ameaça', icon: '💀', color: '#ef4444' },
  Local: { label: 'Local', icon: '🏰', color: '#10b981' },
  Objeto: { label: 'Objeto', icon: '🗡️', color: '#a855f7' },
  Evento: { label: 'Evento', icon: '⚡', color: '#f97316' },
};

const ALL_NDS = [
  '1/4',
  '1/2',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  'S',
  'S+',
];

export const AdventurePlannerTab: React.FC<AdventurePlannerTabProps> = ({
  campaign,
  onUpdateCampaign,
  onAddRoll,
  onSendEncounterToCombat,
}) => {
  const [subTab, setSubTab] = useState<PlannerSubTab>('bestiario');

  // ==========================================================================
  // CATEGORIAS ÚNICAS DO BESTIÁRIO (EXTRAÍDAS DAS 502 CRIATURAS)
  // ==========================================================================
  const bestiaryCategories = useMemo(() => {
    const set = new Set<string>();
    for (const m of FULL_BESTIARY) {
      if (m.category) set.add(m.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, []);

  // ==========================================================================
  // ESTADO DA MESA DE ENCONTRO / CENA ATUAL (INTEGRA CARTAS + MONSTROS + TESOURO)
  // ==========================================================================
  const [editingEncounterId, setEditingEncounterId] = useState<string | null>(null);
  const [encTitle, setEncTitle] = useState<string>('Emboscada na Estrada');
  const [encNotes, setEncNotes] = useState<string>('');
  const [encCards, setEncCards] = useState<{ role: string; card: AdventureCard }[]>([]);
  const [encMonsters, setEncMonsters] = useState<{ threat: ThreatSheet; count: number }[]>([]);
  const [encTreasures, setEncTreasures] = useState<TreasureRollResult[]>([]);
  const [showWorkbench, setShowWorkbench] = useState<boolean>(true);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // ==========================================================================
  // ESTADO ABA 1: BARALHO DE AVENTURAS
  // ==========================================================================
  const [currentDraw, setCurrentDraw] = useState(() => drawNimbAdventure());
  const [selectedCard, setSelectedCard] = useState<AdventureCard>(() => BARALHO_AVENTURAS[0]);
  const [cardCatFilter, setCardCatFilter] = useState<AdventureCardCategory | 'all'>('all');
  const [showCardPdf, setShowCardPdf] = useState<boolean>(true);

  // ==========================================================================
  // ESTADO ABA 2: BESTIÁRIO COMPLETO (502 CRIATURAS) & ENCONTROS ALEATÓRIOS
  // ==========================================================================
  const [monsterQuery, setMonsterQuery] = useState<string>('');
  const [monsterBookFilter, setMonsterBookFilter] = useState<'all' | 'ameacas' | 'basico'>('all');
  const [monsterCategoryFilter, setMonsterCategoryFilter] = useState<string>('all');
  const [monsterRoleFilter, setMonsterRoleFilter] = useState<string>('all');
  const [monsterNdGroup, setMonsterNdGroup] = useState<string>('all');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>(
    FULL_BESTIARY[0]?.id || ''
  );
  const [monsterAddQty, setMonsterAddQty] = useState<number>(1);
  const [monsterRightView, setMonsterRightView] = useState<'split' | 'statblock' | 'pdf'>('split');
  const [lastMonsterLoot, setLastMonsterLoot] = useState<TreasureRollResult | null>(null);

  // Gerador de Encontros Aleatórios por Região (Apêndice D)
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    RANDOM_ENCOUNTER_TABLES[0].id
  );
  const [selectedPatamar, setSelectedPatamar] = useState<
    'iniciante' | 'veterano' | 'campeao' | 'lenda'
  >('iniciante');
  const [lastRegionEncounter, setLastRegionEncounter] = useState<{
    terrainName: string;
    pdfPage: number;
    rawD100: number;
    modifier: number;
    finalRoll: number;
    resultText: string;
    quantityResolved: number;
    matchedMonsters: ThreatSheet[];
  } | null>(null);

  // ==========================================================================
  // ESTADO ABA 3: SORTEADOR OFICIAL DE TESOUROS (CAPÍTULO 8)
  // ==========================================================================
  const [manualNd, setManualNd] = useState<string>('3');
  const [manualModifier, setManualModifier] = useState<TreasureModifier>('Padrão');
  const [manualSourceLabel, setManualSourceLabel] = useState<string>('Tesouro de Encontro');
  const [treasureHistory, setTreasureHistory] = useState<TreasureRollResult[]>([]);
  const [targetPlayerForItem, setTargetPlayerForItem] = useState<string>(
    campaign.players[0]?.id || ''
  );

  // ==========================================================================
  // CÁLCULO DE ND TOTAL E XP DO ENCONTRO ATUAL
  // ==========================================================================
  const encounterStats = useMemo(() => {
    const ndStrings: string[] = [];
    let totalCreatures = 0;
    for (const m of encMonsters) {
      totalCreatures += m.count;
      for (let i = 0; i < m.count; i++) {
        ndStrings.push(m.threat.nd);
      }
    }
    const stats = calculateEncounterStats(ndStrings, Math.max(1, campaign.players.length));
    return {
      totalNdLabel: stats.encounterNd,
      totalXp: stats.totalXp,
      xpPerPlayer: stats.xpPerPlayer,
      totalCreatures,
    };
  }, [encMonsters, campaign.players.length]);

  const totalEncounterTibares = useMemo(
    () => encTreasures.reduce((acc, t) => acc + t.coinsValueT$, 0),
    [encTreasures]
  );

  // ==========================================================================
  // FILTRO DO BESTIÁRIO (502 CRIATURAS)
  // ==========================================================================
  const filteredBestiary = useMemo(() => {
    const q = monsterQuery.trim().toLowerCase();
    return FULL_BESTIARY.filter((m) => {
      if (monsterBookFilter !== 'all' && m.bookId !== monsterBookFilter) return false;
      if (monsterCategoryFilter !== 'all' && m.category !== monsterCategoryFilter) return false;
      if (monsterRoleFilter !== 'all' && m.role !== monsterRoleFilter) return false;
      if (monsterNdGroup !== 'all') {
        const num = parseNdNumeric(m.nd);
        if (monsterNdGroup === 'iniciante' && num > 1) return false;
        if (monsterNdGroup === '2-4' && (num < 2 || num > 4)) return false;
        if (monsterNdGroup === '5-9' && (num < 5 || num > 9)) return false;
        if (monsterNdGroup === '10-14' && (num < 10 || num > 14)) return false;
        if (monsterNdGroup === '15-19' && (num < 15 || num > 19)) return false;
        if (monsterNdGroup === '20+' && num < 20) return false;
      }
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.typeAndSize.toLowerCase().includes(q) ||
        m.nd.toLowerCase() === q
      );
    });
  }, [
    monsterQuery,
    monsterBookFilter,
    monsterCategoryFilter,
    monsterRoleFilter,
    monsterNdGroup,
  ]);

  const selectedMonster = useMemo(
    () =>
      FULL_BESTIARY.find((m) => m.id === selectedMonsterId) ||
      filteredBestiary[0] ||
      FULL_BESTIARY[0],
    [selectedMonsterId, filteredBestiary]
  );

  // ==========================================================================
  // FUNÇÕES DA MESA DE ENCONTRO (WORKBENCH)
  // ==========================================================================
  function showToast(msg: string) {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3000);
  }

  function addMonsterToEncounter(threat: ThreatSheet, qty = 1) {
    setEncMonsters((prev) => {
      const idx = prev.findIndex((item) => item.threat.id === threat.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], count: copy[idx].count + qty };
        return copy;
      }
      return [...prev, { threat, count: Math.max(1, qty) }];
    });
    setShowWorkbench(true);
    showToast(`+${qty}x ${threat.name} adicionado ao Encontro Atual!`);
  }

  function updateMonsterQty(threatId: string, nextQty: number) {
    if (nextQty <= 0) {
      setEncMonsters((prev) => prev.filter((m) => m.threat.id !== threatId));
      return;
    }
    setEncMonsters((prev) =>
      prev.map((m) => (m.threat.id === threatId ? { ...m, count: nextQty } : m))
    );
  }

  function pinCardToEncounter(card: AdventureCard, roleLabel?: string) {
    const role = roleLabel || CARD_CATEGORY_META[card.category].label;
    setEncCards((prev) => {
      if (prev.some((c) => c.card.id === card.id && c.role === role)) {
        return prev;
      }
      return [...prev, { role, card }];
    });
    setShowWorkbench(true);
    showToast(`Carta "${card.title}" fixada no Encontro Atual!`);
  }

  function pinAllDrawnCardsToEncounter() {
    const allSlots: { role: string; card: AdventureCard }[] = [
      { role: 'Enredo Principal', card: currentDraw.enredo },
      ...currentDraw.slots.map((s) => ({ role: s.role, card: s.card })),
    ];
    setEncCards(allSlots);
    setEncTitle(`Aventura: ${currentDraw.enredo.title}`);
    const summaryLines = allSlots
      .map((s) => `• ${s.role}: [${s.card.title}] — ${s.card.description}`)
      .join('\n');
    setEncNotes(summaryLines);
    setShowWorkbench(true);
    showToast('Todas as cartas sorteadas foram enviadas para o Encontro Atual!');
  }

  function rollAllEncounterTreasures() {
    if (encMonsters.length === 0) return;
    const rolledList: TreasureRollResult[] = [];
    for (const m of encMonsters) {
      const mod = m.threat.treasureType || 'Padrão';
      for (let i = 0; i < m.count; i++) {
        const label = m.count > 1 ? `${m.threat.name} #${i + 1}` : m.threat.name;
        const res = rollTreasureByND(m.threat.nd, mod, label);
        rolledList.push(res);
      }
    }
    setEncTreasures((prev) => [...rolledList, ...prev]);
    setTreasureHistory((prev) => [...rolledList, ...prev]);

    const totalT = rolledList.reduce((acc, r) => acc + r.coinsValueT$, 0);
    const totalItems = rolledList.reduce((acc, r) => acc + r.items.length, 0);

    onAddRoll({
      id: `log-loot-enc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actor: 'Tesouro do Encontro',
      label: `${encTitle} (${rolledList.length} criaturas)`,
      formula: 'Tabelas 8-1 a 8-15',
      rolls: [totalT],
      modifier: totalItems,
      total: totalT,
      isD20: false,
      detail: `Moedas: ${totalT} T$ + ${totalItems} item(ns)/riqueza(s)`,
    });
    showToast(`Tesouros sorteados: ${totalT.toLocaleString('pt-BR')} T$ e ${totalItems} item(ns)!`);
  }

  function saveCurrentEncounterToCampaign() {
    const cardsSummary = encCards.map((c) => `${c.role}: ${c.card.title}`).join(' | ');
    const treasureSummary = encTreasures
      .map(
        (t) =>
          `${t.sourceName}: ${t.coinsText}${
            t.items.length > 0 ? ' + ' + t.items.map((i) => i.name).join(', ') : ''
          }`
      )
      .join(' ; ');

    const mappedMonsters: PlannedEncounterMonster[] = encMonsters.map((m) => ({
      threatId: m.threat.id,
      name: m.threat.name,
      nd: m.threat.nd,
      count: m.count,
      treasureType: m.threat.treasureType || 'Padrão',
      bookId: m.threat.bookId,
      pdfPage: m.threat.pdfPage,
    }));

    const newEnc: PlannedEncounter = {
      id: editingEncounterId || `enc-${Date.now()}`,
      title: encTitle.trim() || 'Encontro Sem Título',
      notes: encNotes,
      cardsSummary,
      monsters: mappedMonsters,
      treasureSummary,
      treasureCoinsT$: totalEncounterTibares,
    };

    const existing = campaign.plannedEncounters || [];
    const nextList = editingEncounterId
      ? existing.map((e) => (e.id === editingEncounterId ? newEnc : e))
      : [newEnc, ...existing];

    onUpdateCampaign({ plannedEncounters: nextList });
    setEditingEncounterId(newEnc.id);
    showToast(`Encontro "${newEnc.title}" salvo na campanha!`);
  }

  function clearEncounterWorkbench() {
    setEditingEncounterId(null);
    setEncTitle('Novo Encontro');
    setEncNotes('');
    setEncCards([]);
    setEncMonsters([]);
    setEncTreasures([]);
  }

  function distributeTibaresToParty(amount: number) {
    if (amount <= 0 || campaign.players.length === 0) return;
    const share = Math.floor(amount / campaign.players.length);
    if (share <= 0) return;

    const updatedPlayers = campaign.players.map((p) => {
      const currentNum = parseInt(String(p.tibares || '0').replace(/\D/g, ''), 10) || 0;
      return {
        ...p,
        tibares: `${currentNum + share} T$`,
      };
    });
    onUpdateCampaign({ players: updatedPlayers });
    showToast(
      `Distribuído ${amount.toLocaleString('pt-BR')} T$ (${share.toLocaleString(
        'pt-BR'
      )} T$ somados direto na ficha de cada um dos ${campaign.players.length} heróis)!`
    );
  }

  function giveItemToPlayer(itemText: string, playerId: string) {
    const target = campaign.players.find((p) => p.id === playerId);
    if (!target) return;
    const updatedPlayers = campaign.players.map((p) => {
      if (p.id !== playerId) return p;
      const prefix = p.equipment?.trim() ? `${p.equipment.trim()}\n` : '';
      return {
        ...p,
        equipment: `${prefix}• ${itemText}`,
      };
    });
    onUpdateCampaign({ players: updatedPlayers });
    showToast(`Item "${itemText}" adicionado ao equipamento de ${target.name}!`);
  }

  // ==========================================================================
  // FUNÇÕES DE ROLAGEM DE MONSTRO E TESOURO INDIVIDUAL
  // ==========================================================================
  function rollSingleMonsterTreasure(monster: ThreatSheet) {
    const mod = monster.treasureType || 'Padrão';
    const result = rollTreasureByND(monster.nd, mod, monster.name);
    setLastMonsterLoot(result);
    setTreasureHistory((prev) => [result, ...prev]);

    onAddRoll({
      id: `log-loot-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actor: monster.name,
      label: `Tesouro (ND ${monster.nd} • ${mod})`,
      formula: `d% $${result.moneyRollD100.join(',')} / Item ${result.itemRollD100.join(',')}`,
      rolls: [...result.moneyRollD100, ...result.itemRollD100],
      modifier: 0,
      total: result.totalEstimatedT$,
      isD20: false,
      detail: `${result.coinsText}${
        result.items.length > 0 ? ' | ' + result.items.map((i) => i.name).join('; ') : ''
      }`,
    });
  }

  function handleRollRegionalEncounter() {
    const r = rollRandomEncounter(selectedRegionId, selectedPatamar);

    // Procura monstros correspondentes no Bestiário a partir de palavras do resultado
    const words = r.resultText
      .toLowerCase()
      .replace(/[(),.;:]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !['para', 'como', 'mais', 'cada', 'grupo', 'área'].includes(w));

    const matched: ThreatSheet[] = [];
    for (const m of FULL_BESTIARY) {
      const mName = m.name.toLowerCase();
      if (words.some((w) => mName.includes(w.replace(/s$/, '')))) {
        matched.push(m);
        if (matched.length >= 4) break;
      }
    }

    // Tenta extrair quantidade (ex: "2d6 gnolls", "1d4+1 ogros")
    let qty = 1;
    const diceMatch = r.resultText.match(/(\d+d\d+(?:[+-]\d+)?)/i);
    if (diceMatch) {
      const rolledQty = rollFormula(diceMatch[1]);
      if (rolledQty && rolledQty.total > 0) qty = rolledQty.total;
    }

    setLastRegionEncounter({
      terrainName: r.terrainName,
      pdfPage: r.pdfPage,
      rawD100: r.rawD100,
      modifier: r.modifier,
      finalRoll: r.finalRoll,
      resultText: r.resultText,
      quantityResolved: qty,
      matchedMonsters: matched,
    });

    onAddRoll({
      id: `log-reg-enc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actor: `Encontro (${r.terrainName})`,
      label: r.resultText,
      formula: `1d100+${r.modifier}`,
      rolls: [r.rawD100],
      modifier: r.modifier,
      total: r.finalRoll,
      isD20: false,
      detail: `Quantidade sugerida: ${qty}x`,
    });
  }

  function drawRandomByCategory(cat: AdventureCardCategory): AdventureCard {
    const pool = BARALHO_AVENTURAS.filter((c) => c.category === cat);
    return pool[Math.floor(Math.random() * pool.length)] || BARALHO_AVENTURAS[0];
  }

  return (
    <div className="tab-container">
      {/* BANNER DE FEEDBACK RÁPIDO */}
      {savedBanner && (
        <div className="planner-toast-banner">
          <Check size={15} /> {savedBanner}
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO DO PLANEJADOR */}
      <div className="t20-toolbar">
        <div className="toolbar-group">
          <button
            className={`btn-t20 ${subTab === 'bestiario' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('bestiario')}
          >
            <Skull size={15} /> Bestiário ({FULL_BESTIARY.length} Ameaças) & Encontros Regionais
          </button>
          <button
            className={`btn-t20 ${subTab === 'baralho' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('baralho')}
          >
            <Sparkles size={15} /> Baralho de Aventuras (55 Cartas)
          </button>
          <button
            className={`btn-t20 ${subTab === 'tesouros' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('tesouros')}
          >
            <Coins size={15} /> Sorteador Oficial de Tesouros (Cap. 8)
          </button>
          <button
            className={`btn-t20 ${subTab === 'salvos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSubTab('salvos')}
          >
            <FolderKanban size={15} /> Encontros Salvos (
            {(campaign.plannedEncounters || []).length})
          </button>
        </div>

        <div className="toolbar-group">
          <button
            className={`btn-t20 ${showWorkbench ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setShowWorkbench(!showWorkbench)}
            title="Mostrar/ocultar a Mesa de Montagem do Encontro Atual"
          >
            <Swords size={15} /> Mesa de Encontro ({encMonsters.length} tipos •{' '}
            {encTreasures.length} tesouros)
          </button>
        </div>
      </div>

      {/* ========================================================================
          MESA DE MONTAGEM DO ENCONTRO ATUAL (INTEGRA CARTAS + MONSTROS + TESOURO)
         ======================================================================== */}
      {showWorkbench && (
        <div className="encounter-workbench-card">
          <div className="workbench-header">
            <div className="workbench-title-inputs">
              <span className="workbench-badge">⚔️ MESA DE ENCONTRO / CENA</span>
              <input
                type="text"
                className="workbench-input-title"
                value={encTitle}
                onChange={(e) => setEncTitle(e.target.value)}
                placeholder="Título do Encontro ou Cena..."
              />
            </div>

            <div className="workbench-stats-pills">
              <span className="nd-pill-large" title="Nível de Desafio Calculado do Encontro">
                ND do Encontro: <strong>{encounterStats.totalNdLabel}</strong>
              </span>
              <span className="xp-pill-large" title="XP Total do Encontro (ND x 1.000)">
                XP Total: <strong>{encounterStats.totalXp.toLocaleString('pt-BR')}</strong> (
                {encounterStats.xpPerPlayer.toLocaleString('pt-BR')}/PJ)
              </span>
              <span className="loot-pill-large">
                Moedas: <strong>{totalEncounterTibares.toLocaleString('pt-BR')} T$</strong>
              </span>
            </div>

            <div className="workbench-actions">
              <button
                className="btn-t20 btn-xs btn-orange"
                disabled={encMonsters.length === 0}
                onClick={rollAllEncounterTreasures}
                title="Rola automaticamente o tesouro oficial de cada monstro deste encontro!"
              >
                <Coins size={13} /> Sortear Tesouro dos Monstros
              </button>
              <button
                className="btn-t20 btn-xs btn-primary"
                onClick={saveCurrentEncounterToCampaign}
              >
                <Check size={13} /> Salvar Encontro
              </button>
              <button
                className="btn-t20 btn-xs btn-secondary"
                disabled={encMonsters.length === 0}
                onClick={() => onSendEncounterToCombat(encMonsters, encTitle)}
                title="Envia todas as criaturas deste encontro direto para o Rastreador de Combate!"
              >
                <Swords size={13} /> Enviar p/ Combate!
              </button>
              <button
                className="btn-t20 btn-xs btn-ghost"
                onClick={clearEncounterWorkbench}
                title="Limpar mesa para montar outro encontro"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="workbench-columns">
            {/* COLUNA 1: CARTAS DE AVENTURA E NOTAS */}
            <div className="workbench-col">
              <div className="workbench-col-head">
                <span>🃏 Cartas & Ganchos da Cena ({encCards.length})</span>
                <button className="btn-link-xs" onClick={() => setSubTab('baralho')}>
                  + Sortear no Baralho
                </button>
              </div>
              {encCards.length > 0 && (
                <div className="workbench-cards-chips">
                  {encCards.map((c, idx) => (
                    <span
                      key={idx}
                      className="workbench-card-chip"
                      onClick={() => {
                        setSelectedCard(c.card);
                        setSubTab('baralho');
                      }}
                    >
                      <strong>{c.role}:</strong> {c.card.title}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEncCards((prev) => prev.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <textarea
                className="workbench-notes-area"
                rows={2}
                placeholder="Anotações da cena, armadilhas, táticas dos monstros ou descrição do ambiente..."
                value={encNotes}
                onChange={(e) => setEncNotes(e.target.value)}
              />
            </div>

            {/* COLUNA 2: MONSTROS DO ENCONTRO */}
            <div className="workbench-col">
              <div className="workbench-col-head">
                <span>
                  🐲 Ameaças no Encontro ({encounterStats.totalCreatures} criatura
                  {encounterStats.totalCreatures === 1 ? '' : 's'})
                </span>
                <button className="btn-link-xs" onClick={() => setSubTab('bestiario')}>
                  + Buscar no Bestiário
                </button>
              </div>
              {encMonsters.length === 0 ? (
                <div className="workbench-empty">
                  Nenhuma criatura adicionada ainda. Clique em <strong>+ Encontro</strong> em
                  qualquer monstro do Bestiário abaixo ou role um Encontro Aleatório!
                </div>
              ) : (
                <div className="workbench-monsters-list">
                  {encMonsters.map((m) => (
                    <div key={m.threat.id} className="workbench-monster-row">
                      <div className="wm-qty-ctrl">
                        <button onClick={() => updateMonsterQty(m.threat.id, m.count - 1)}>
                          -
                        </button>
                        <span>{m.count}x</span>
                        <button onClick={() => updateMonsterQty(m.threat.id, m.count + 1)}>
                          +
                        </button>
                      </div>
                      <div
                        className="wm-info"
                        onClick={() => {
                          setSelectedMonsterId(m.threat.id);
                          setSubTab('bestiario');
                        }}
                      >
                        <strong>{m.threat.name}</strong>
                        <small>
                          ND {m.threat.nd} • {m.threat.role} • PV {m.threat.pvMax} • Tesouro:{' '}
                          {m.threat.treasureType || 'Padrão'}
                        </small>
                      </div>
                      <button
                        className="btn-t20 btn-xs btn-ghost"
                        title="Sortear tesouro individual deste monstro"
                        onClick={() => {
                          const res = rollTreasureByND(
                            m.threat.nd,
                            m.threat.treasureType || 'Padrão',
                            m.threat.name
                          );
                          setEncTreasures((prev) => [res, ...prev]);
                        }}
                      >
                        <Coins size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUNA 3: TESOUROS E RECOMPENSAS DO ENCONTRO */}
            <div className="workbench-col">
              <div className="workbench-col-head">
                <span>💰 Recompensas Sorteadas ({encTreasures.length})</span>
                {totalEncounterTibares > 0 && (
                  <button
                    className="btn-link-xs"
                    onClick={() => distributeTibaresToParty(totalEncounterTibares)}
                    title="Divide os Tibares igualmente e soma direto na ficha de cada jogador!"
                  >
                    🪙 Dividir {totalEncounterTibares} T$ p/ Grupo
                  </button>
                )}
              </div>
              {encTreasures.length === 0 ? (
                <div className="workbench-empty">
                  Clique em <strong>"Sortear Tesouro dos Monstros"</strong> acima para rolar as
                  tabelas de dinheiro, riquezas, itens superiores, poções e itens mágicos!
                </div>
              ) : (
                <div className="workbench-treasures-list">
                  {encTreasures.map((t) => (
                    <div key={t.id} className="workbench-treasure-item">
                      <div className="wt-head">
                        <strong>
                          {t.sourceName} <small>(ND {t.nd} • {t.modifier})</small>
                        </strong>
                        <button
                          className="wt-del"
                          onClick={() =>
                            setEncTreasures((prev) => prev.filter((x) => x.id !== t.id))
                          }
                        >
                          ✕
                        </button>
                      </div>
                      <div className="wt-body">
                        <span className="wt-money">🪙 {t.coinsText}</span>
                        {t.items.length > 0 ? (
                          t.items.map((it, idx) => (
                            <div key={idx} className="wt-item-line">
                              <span>
                                🎁 <strong>{it.name}</strong> — {it.details}
                              </span>
                              {campaign.players.length > 0 && (
                                <button
                                  className="btn-give-mini"
                                  title="Enviar este item para o equipamento do jogador selecionado"
                                  onClick={() =>
                                    giveItemToPlayer(
                                      `${it.name} (${it.details})`,
                                      targetPlayerForItem || campaign.players[0].id
                                    )
                                  }
                                >
                                  ➔ Dar p/ Herói
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="wt-no-item">Nenhum item extra</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          ABA 1: BESTIÁRIO COMPLETO (502 CRIATURAS) & ENCONTROS ALEATÓRIOS
         ======================================================================== */}
      {subTab === 'bestiario' && (
        <div className="bestiary-workspace">
          {/* COLUNA ESQUERDA: GERADOR DE ENCONTRO REGIONAL + LISTA FILTRÁVEL DE 502 MONSTROS */}
          <div className="bestiary-left-panel">
            {/* Sorteador Oficial de Encontros Aleatórios (Apêndice D - Ameaças de Arton) */}
            <div className="regional-encounter-box">
              <div className="regional-head">
                <strong>🎲 Encontros Aleatórios por Região (Apêndice D)</strong>
                <small>Ameaças de Arton pág. 401</small>
              </div>
              <div className="regional-controls">
                <select
                  className="t20-select"
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                >
                  {RANDOM_ENCOUNTER_TABLES.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      🗺️ {reg.name}
                    </option>
                  ))}
                </select>

                <select
                  className="t20-select"
                  value={selectedPatamar}
                  onChange={(e) => setSelectedPatamar(e.target.value as any)}
                  title="Patamar do Grupo ajusta automaticamente o bônus na tabela de d100"
                >
                  <option value="iniciante">Iniciante (+0)</option>
                  <option value="veterano">Veterano (+30)</option>
                  <option value="campeao">Campeão (+70)</option>
                  <option value="lenda">Lenda (+110)</option>
                </select>

                <button
                  className="btn-t20 btn-xs btn-orange"
                  onClick={handleRollRegionalEncounter}
                >
                  <Dices size={13} /> Rolar d100
                </button>
              </div>

              {lastRegionEncounter && (
                <div className="regional-result-banner">
                  <div className="reg-res-top">
                    <span>
                      <strong>{lastRegionEncounter.terrainName}</strong> (d100:{' '}
                      {lastRegionEncounter.rawD100}
                      {lastRegionEncounter.modifier > 0
                        ? `+${lastRegionEncounter.modifier}=${lastRegionEncounter.finalRoll}`
                        : ''}
                      ):
                    </span>
                    <strong className="reg-res-text">{lastRegionEncounter.resultText}</strong>
                  </div>
                  {lastRegionEncounter.matchedMonsters.length > 0 && (
                    <div className="reg-res-matches">
                      {lastRegionEncounter.matchedMonsters.map((mm) => (
                        <div key={mm.id} className="reg-match-chip">
                          <span
                            onClick={() => setSelectedMonsterId(mm.id)}
                            className="reg-match-name"
                          >
                            🐲 {mm.name} (ND {mm.nd})
                          </span>
                          <button
                            className="btn-t20 btn-xs btn-primary"
                            onClick={() =>
                              addMonsterToEncounter(mm, lastRegionEncounter.quantityResolved)
                            }
                          >
                            + {lastRegionEncounter.quantityResolved}x ao Encontro
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filtros do Bestiário */}
            <div className="bestiary-filters-box">
              <div className="bestiary-search-row">
                <Search size={14} className="search-ico" />
                <input
                  type="text"
                  placeholder="Buscar entre 502 criaturas (ex: Dragão, Goblin, Sckhar, Purista)..."
                  value={monsterQuery}
                  onChange={(e) => setMonsterQuery(e.target.value)}
                />
                {monsterQuery && (
                  <button className="btn-clear-q" onClick={() => setMonsterQuery('')}>
                    ✕
                  </button>
                )}
              </div>

              <div className="bestiary-filter-selects">
                <select
                  className="t20-select"
                  value={monsterBookFilter}
                  onChange={(e) => setMonsterBookFilter(e.target.value as any)}
                >
                  <option value="all">📚 Todos (502)</option>
                  <option value="ameacas">📕 Ameaças de Arton (428)</option>
                  <option value="basico">📘 Livro Básico (74)</option>
                </select>

                <select
                  className="t20-select"
                  value={monsterCategoryFilter}
                  onChange={(e) => setMonsterCategoryFilter(e.target.value)}
                >
                  <option value="all">🏷️ Todas as Facções/Capítulos</option>
                  {bestiaryCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  className="t20-select"
                  value={monsterNdGroup}
                  onChange={(e) => setMonsterNdGroup(e.target.value)}
                >
                  <option value="all">⚡ Todos os NDs</option>
                  <option value="iniciante">ND 1/4 a 1 (Iniciante)</option>
                  <option value="2-4">ND 2 a 4 (Iniciante)</option>
                  <option value="5-9">ND 5 a 9 (Veterano)</option>
                  <option value="10-14">ND 10 a 14 (Campeão)</option>
                  <option value="15-19">ND 15 a 19 (Lenda)</option>
                  <option value="20+">ND 20 / S / S+ (Épico)</option>
                </select>

                <select
                  className="t20-select"
                  value={monsterRoleFilter}
                  onChange={(e) => setMonsterRoleFilter(e.target.value)}
                >
                  <option value="all">🎯 Papel (Todos)</option>
                  <option value="Solo">Solo</option>
                  <option value="Lacaio">Lacaio</option>
                  <option value="Especial">Especial</option>
                </select>
              </div>
            </div>

            {/* Lista de Criaturas */}
            <div className="bestiary-results-count">
              Exibindo <strong>{filteredBestiary.length}</strong> ameaças
            </div>
            <div className="bestiary-list">
              {filteredBestiary.map((m) => {
                const isSelected = selectedMonster?.id === m.id;
                return (
                  <div
                    key={m.id}
                    className={`bestiary-card-item ${isSelected ? 'bestiary-card-active' : ''}`}
                    onClick={() => setSelectedMonsterId(m.id)}
                  >
                    <div className="bc-left">
                      <div className="bc-title-row">
                        <span
                          className={`book-badge ${
                            m.bookId === 'ameacas' ? 'badge-ameacas' : 'badge-basico'
                          }`}
                        >
                          {m.bookId === 'ameacas' ? 'AA' : 'LB'}
                        </span>
                        <strong>{m.name}</strong>
                      </div>
                      <small className="bc-sub">
                        {m.category} • {m.role} • PV {m.pvMax} • Def {m.defesa} • Tesouro:{' '}
                        {m.treasureType || 'Padrão'}
                      </small>
                    </div>
                    <div className="bc-right">
                      <span className="nd-badge">ND {m.nd}</span>
                      <button
                        className="btn-t20 btn-xs btn-primary"
                        title="Adicionar esta criatura ao Encontro Atual"
                        onClick={(e) => {
                          e.stopPropagation();
                          addMonsterToEncounter(m, 1);
                        }}
                      >
                        + Encontro
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA DIREITA: FICHA DA CRIATURA + LEITOR DA PÁGINA DO PDF ORIGINAL + ROLADOR DE TESOURO */}
          {selectedMonster && (
            <div className="bestiary-right-panel">
              {/* Cabeçalho de Ações Rápidas da Criatura */}
              <div className="monster-detail-toolbar">
                <div className="mdt-title">
                  <h3>{selectedMonster.name}</h3>
                  <span className="nd-badge-lg">ND {selectedMonster.nd}</span>
                  <span className="role-badge">{selectedMonster.role}</span>
                  <span className="cat-badge">{selectedMonster.category}</span>
                  <small className="text-muted">
                    ({selectedMonster.bookId === 'ameacas' ? 'Ameaças de Arton' : 'Livro Básico'}{' '}
                    pág. {selectedMonster.bookPage})
                  </small>
                </div>

                <div className="mdt-actions">
                  <div className="qty-Quick-add">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={monsterAddQty}
                      onChange={(e) =>
                        setMonsterAddQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                    />
                    <button
                      className="btn-t20 btn-xs btn-primary"
                      onClick={() => addMonsterToEncounter(selectedMonster, monsterAddQty)}
                    >
                      <Plus size={13} /> Add ao Encontro
                    </button>
                  </div>

                  <button
                    className="btn-t20 btn-xs btn-orange"
                    onClick={() => rollSingleMonsterTreasure(selectedMonster)}
                    title="Rolar imediatamente o Tesouro oficial desta criatura nas tabelas do Cap. 8"
                  >
                    <Coins size={13} /> Sortear Tesouro ({selectedMonster.treasureType || 'Padrão'})
                  </button>

                  <button
                    className="btn-t20 btn-xs btn-secondary"
                    onClick={() =>
                      onSendEncounterToCombat(
                        [{ threat: selectedMonster, count: monsterAddQty }],
                        selectedMonster.name
                      )
                    }
                    title="Enviar direto para o Rastreador de Combate"
                  >
                    <Swords size={13} /> Combate
                  </button>

                  <div className="viewer-mode-toggle">
                    <button
                      className={`btn-t20 btn-xs ${
                        monsterRightView === 'split' ? 'btn-orange' : 'btn-secondary'
                      }`}
                      onClick={() => setMonsterRightView('split')}
                    >
                      Ficha + PDF
                    </button>
                    <button
                      className={`btn-t20 btn-xs ${
                        monsterRightView === 'pdf' ? 'btn-orange' : 'btn-secondary'
                      }`}
                      onClick={() => setMonsterRightView('pdf')}
                    >
                      Só PDF Ilustrado
                    </button>
                    <button
                      className={`btn-t20 btn-xs ${
                        monsterRightView === 'statblock' ? 'btn-orange' : 'btn-secondary'
                      }`}
                      onClick={() => setMonsterRightView('statblock')}
                    >
                      Só Ficha
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner do Último Tesouro Sorteado para o Monstro */}
              {lastMonsterLoot && (
                <div className="instant-loot-banner">
                  <div className="ilb-left">
                    <strong>
                      💰 Tesouro Sorteado — {lastMonsterLoot.sourceName} (ND {lastMonsterLoot.nd} •{' '}
                      {lastMonsterLoot.modifier}):
                    </strong>
                    <span className="ilb-money">🪙 {lastMonsterLoot.coinsText}</span>
                    <span className="ilb-items">
                      🎁{' '}
                      {lastMonsterLoot.items.length > 0
                        ? lastMonsterLoot.items.map((i) => `${i.name} (${i.details})`).join(' | ')
                        : 'Nenhum item extra'}
                    </span>
                  </div>
                  <div className="ilb-actions">
                    <button
                      className="btn-t20 btn-xs btn-primary"
                      onClick={() => {
                        setEncTreasures((prev) => [lastMonsterLoot, ...prev]);
                        showToast('Tesouro anexado ao Encontro Atual!');
                      }}
                    >
                      + Anexar ao Encontro
                    </button>
                    {lastMonsterLoot.coinsValueT$ > 0 && (
                      <button
                        className="btn-t20 btn-xs btn-orange"
                        onClick={() => distributeTibaresToParty(lastMonsterLoot.coinsValueT$)}
                      >
                        🪙 Dividir {lastMonsterLoot.coinsValueT$} T$ p/ Grupo
                      </button>
                    )}
                    <button
                      className="btn-t20 btn-xs btn-ghost"
                      onClick={() => setLastMonsterLoot(null)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Corpo Dividido: Ficha Interativa (com rolagens) + Página Original do PDF */}
              <div className={`monster-body-grid mode-${monsterRightView}`}>
                {(monsterRightView === 'statblock' || monsterRightView === 'split') && (
                  <div className="monster-statblock-pane">
                    <div className="ms-type-line">
                      {selectedMonster.typeAndSize} • Sentidos: {selectedMonster.senses}
                      {selectedMonster.resistances ? ` • ${selectedMonster.resistances}` : ''}
                    </div>

                    <div className="ms-vitals-grid">
                      <div className="ms-vital-box hp">
                        <span>PV</span>
                        <strong>{selectedMonster.pvMax}</strong>
                      </div>
                      <div className="ms-vital-box mp">
                        <span>PM</span>
                        <strong>{selectedMonster.pmMax}</strong>
                      </div>
                      <div className="ms-vital-box def">
                        <span>Defesa</span>
                        <strong>{selectedMonster.defesa}</strong>
                      </div>
                      <div className="ms-vital-box">
                        <span>Deslocamento</span>
                        <strong>{selectedMonster.deslocamento}</strong>
                      </div>
                    </div>

                    {/* Perícias Clicáveis (Iniciativa, Percepção, Resistências) */}
                    <div className="ms-rolls-bar">
                      {[
                        { label: 'Iniciativa', mod: selectedMonster.iniciativa },
                        { label: 'Percepção', mod: selectedMonster.percepcao },
                        { label: 'Fortitude', mod: selectedMonster.fortitude },
                        { label: 'Reflexos', mod: selectedMonster.reflexos },
                        { label: 'Vontade', mod: selectedMonster.vontade },
                      ].map((sk) => (
                        <button
                          key={sk.label}
                          className="ms-skill-btn"
                          onClick={() => {
                            onAddRoll(rollD20Test(selectedMonster.name, sk.label, sk.mod));
                          }}
                        >
                          <Dices size={12} /> {sk.label}{' '}
                          <strong>{sk.mod >= 0 ? `+${sk.mod}` : sk.mod}</strong>
                        </button>
                      ))}
                    </div>

                    {/* Atributos */}
                    <div className="ms-attrs-row">
                      {[
                        { k: 'FOR', v: selectedMonster.forca },
                        { k: 'DES', v: selectedMonster.destreza },
                        { k: 'CON', v: selectedMonster.constituicao },
                        { k: 'INT', v: selectedMonster.inteligencia },
                        { k: 'SAB', v: selectedMonster.sabedoria },
                        { k: 'CAR', v: selectedMonster.carisma },
                      ].map((attr) => {
                        const num = parseModifier(attr.v);
                        return (
                          <button
                            key={attr.k}
                            className="ms-attr-box"
                            onClick={() =>
                              onAddRoll(
                                rollD20Test(selectedMonster.name, `Teste de ${attr.k}`, num)
                              )
                            }
                          >
                            <span>{attr.k}</span>
                            <strong>{attr.v}</strong>
                          </button>
                        );
                      })}
                    </div>

                    {/* Ataques */}
                    <div className="ms-section">
                      <h4>⚔️ Ataques (Clique para Rolar)</h4>
                      {selectedMonster.attacks.length === 0 ? (
                        <p className="text-muted">Consulte o texto completo ou o PDF ao lado.</p>
                      ) : (
                        selectedMonster.attacks.map((atk, idx) => (
                          <div key={idx} className="ms-attack-row">
                            <div>
                              <strong>{atk.name}</strong>
                              <small>
                                {' '}
                                ({atk.bonus >= 0 ? `+${atk.bonus}` : atk.bonus} • {atk.damage}{' '}
                                {atk.crit ? `• Crít ${atk.crit}` : ''}{' '}
                                {atk.extra ? `• ${atk.extra}` : ''})
                              </small>
                            </div>
                            <div className="ms-atk-btns">
                              <button
                                className="btn-t20 btn-xs btn-primary"
                                onClick={() => {
                                  onAddRoll(
                                    rollD20Test(
                                      selectedMonster.name,
                                      `Ataque: ${atk.name}`,
                                      atk.bonus,
                                      { critSpec: atk.crit }
                                    )
                                  );
                                  onAddRoll(
                                    rollFormula(atk.damage, {
                                      actor: selectedMonster.name,
                                      label: `Dano: ${atk.name}`,
                                      detail: atk.extra,
                                    })
                                  );
                                }}
                              >
                                <Dices size={12} /> Rolar Ataque & Dano
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Habilidades e Texto Extraído */}
                    <div className="ms-section">
                      <h4>
                        ✨ Habilidades, Perícias & Tesouro (
                        {selectedMonster.treasureType || 'Padrão'})
                      </h4>
                      <div className="ms-ability-item">
                        <p>{selectedMonster.abilities}</p>
                        {selectedMonster.skills && (
                          <p>
                            <strong>Perícias:</strong> {selectedMonster.skills}
                          </p>
                        )}
                        {selectedMonster.equipmentAndTreasure && (
                          <p>
                            <strong>Equipamento & Tesouro:</strong>{' '}
                            {selectedMonster.equipmentAndTreasure}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(monsterRightView === 'pdf' || monsterRightView === 'split') && (
                  <div className="monster-pdf-pane">
                    <iframe
                      key={`${selectedMonster.bookId}-${selectedMonster.pdfPage}`}
                      src={`/api/pdf/${selectedMonster.bookId || 'ameacas'}#page=${
                        selectedMonster.pdfPage || 15
                      }&view=FitH&toolbar=1`}
                      title={`PDF ${selectedMonster.name}`}
                      className="embedded-pdf-iframe"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          ABA 2: BARALHO DE AVENTURAS (55 CARTAS + MÉTODO NIMB & KHALMYR + PDF)
         ======================================================================== */}
      {subTab === 'baralho' && (
        <div className="baralho-workspace">
          {/* PAINEL ESQUERDO: SORTEIO NIMB, SORTEIO POR CATEGORIA E LISTA DE 55 CARTAS */}
          <div className="baralho-left-panel">
            <div className="baralho-generator-box">
              <div className="bg-header">
                <div>
                  <h4>🃏 Gerador do Baralho de Aventuras</h4>
                  <small>
                    Use o <strong>Método Nimb</strong> para sortear uma aventura completa (Enredo +
                    Sub-cartas) ou clique em qualquer carta para ver a arte no PDF e puxar os
                    monstros correspondentes do Bestiário!
                  </small>
                </div>
                <div className="bg-actions">
                  <button
                    className="btn-t20 btn-orange"
                    onClick={() => {
                      const drawn = drawNimbAdventure();
                      setCurrentDraw(drawn);
                      setSelectedCard(drawn.enredo);
                      onAddRoll({
                        id: `log-baralho-${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        actor: 'Baralho de Aventuras',
                        label: `Método Nimb: ${drawn.enredo.title}`,
                        formula: `${drawn.slots.length + 1} cartas sorteadas`,
                        rolls: [drawn.enredo.pdfPage, ...drawn.slots.map((s) => s.card.pdfPage)],
                        modifier: 0,
                        total: drawn.slots.length + 1,
                        isD20: false,
                        detail: drawn.slots.map((s) => `${s.role}: ${s.card.title}`).join(' | '),
                      });
                    }}
                  >
                    <Dices size={15} /> Sortear Aventura Completa (Método Nimb)
                  </button>

                  <button
                    className="btn-t20 btn-primary"
                    onClick={pinAllDrawnCardsToEncounter}
                    title="Envia todo o sorteio atual para a Mesa de Encontro no topo!"
                  >
                    <Plus size={14} /> Enviar Sorteio p/ Mesa de Encontro
                  </button>
                </div>
              </div>

              {/* Carta de Enredo Principal + Slots Sorteados */}
              <div className="drawn-cards-grid">
                {/* Enredo */}
                <div
                  className={`drawn-card-slot ${
                    selectedCard.id === currentDraw.enredo.id ? 'drawn-slot-active' : ''
                  }`}
                  style={{ borderColor: CARD_CATEGORY_META.Enredo.color }}
                  onClick={() => setSelectedCard(currentDraw.enredo)}
                >
                  <div className="dcs-top">
                    <span className="dcs-role" style={{ color: CARD_CATEGORY_META.Enredo.color }}>
                      📜 Enredo Principal
                    </span>
                    <button
                      className="btn-redraw-slot"
                      title="Sortear outro Enredo"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextEnredo = drawRandomByCategory('Enredo');
                        const nextDraw = drawNimbAdventure(nextEnredo.id);
                        setCurrentDraw(nextDraw);
                        setSelectedCard(nextDraw.enredo);
                      }}
                    >
                      <RefreshCw size={11} />
                    </button>
                  </div>
                  <strong className="dcs-title">{currentDraw.enredo.title}</strong>
                  <p className="dcs-summary">{currentDraw.enredo.description}</p>
                  <div className="dcs-footer">
                    <button
                      className="btn-link-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        pinCardToEncounter(currentDraw.enredo, 'Enredo Principal');
                      }}
                    >
                      + Fixar na Cena
                    </button>
                  </div>
                </div>

                {/* Sub-Cartas do Enredo */}
                {currentDraw.slots.map((slot, idx) => {
                  const info = CARD_CATEGORY_META[slot.card.category];
                  const isSel = selectedCard.id === slot.card.id;
                  return (
                    <div
                      key={idx}
                      className={`drawn-card-slot ${isSel ? 'drawn-slot-active' : ''}`}
                      style={{ borderColor: isSel ? info.color : undefined }}
                      onClick={() => setSelectedCard(slot.card)}
                    >
                      <div className="dcs-top">
                        <span className="dcs-role" style={{ color: info.color }}>
                          {info.icon} {slot.role}
                        </span>
                        <button
                          className="btn-redraw-slot"
                          title="Sortear outra carta para este papel"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextCard = drawRandomByCategory(slot.card.category);
                            setCurrentDraw((prev) => ({
                              ...prev,
                              slots: prev.slots.map((item, i) =>
                                i === idx ? { ...item, card: nextCard } : item
                              ),
                            }));
                            setSelectedCard(nextCard);
                          }}
                        >
                          <RefreshCw size={11} />
                        </button>
                      </div>
                      <strong className="dcs-title">
                        {slot.card.title} <small>({slot.card.category})</small>
                      </strong>
                      <p className="dcs-summary">{slot.card.description}</p>
                      <div className="dcs-footer">
                        <button
                          className="btn-link-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            pinCardToEncounter(slot.card, slot.role);
                          }}
                        >
                          + Fixar na Cena
                        </button>
                        {slot.card.bestiaryCategories &&
                          slot.card.bestiaryCategories.length > 0 && (
                            <button
                              className="btn-link-xs text-orange"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMonsterCategoryFilter('all');
                                setMonsterQuery(slot.card.bestiaryCategories![0]);
                                setSubTab('bestiario');
                              }}
                            >
                              🐲 Ver Monstros ({slot.card.bestiaryCategories[0]}) ➔
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navegador de Todas as 55 Cartas (Método Khalmyr / Sorteio Individual) */}
            <div className="baralho-catalog-box">
              <div className="bc-filter-bar">
                <button
                  className={`cat-pill ${cardCatFilter === 'all' ? 'cat-pill-active' : ''}`}
                  onClick={() => setCardCatFilter('all')}
                >
                  Todas (55)
                </button>
                {(Object.keys(CARD_CATEGORY_META) as AdventureCardCategory[]).map((cat) => {
                  const info = CARD_CATEGORY_META[cat];
                  return (
                    <button
                      key={cat}
                      className={`cat-pill ${cardCatFilter === cat ? 'cat-pill-active' : ''}`}
                      onClick={() => setCardCatFilter(cat)}
                    >
                      {info.icon} {info.label}
                    </button>
                  );
                })}
              </div>

              <div className="baralho-catalog-grid">
                {BARALHO_AVENTURAS.filter(
                  (c) => cardCatFilter === 'all' || c.category === cardCatFilter
                ).map((card) => {
                  const info = CARD_CATEGORY_META[card.category];
                  const active = selectedCard.id === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`catalog-card-pill ${active ? 'catalog-card-active' : ''}`}
                      onClick={() => setSelectedCard(card)}
                    >
                      <span style={{ color: info.color }}>
                        {info.icon} P.{card.pdfPage}
                      </span>
                      <strong>{card.title}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO: DETALHES DA CARTA SELECIONADA + PÁGINA ILUSTRADA DO PDF */}
          <div className="baralho-right-panel">
            <div className="card-viewer-header">
              <div>
                <span
                  className="book-badge badge-baralho"
                  style={{
                    backgroundColor: CARD_CATEGORY_META[selectedCard.category].color,
                  }}
                >
                  {CARD_CATEGORY_META[selectedCard.category].icon}{' '}
                  {CARD_CATEGORY_META[selectedCard.category].label}
                </span>
                <h3>{selectedCard.title}</h3>
                <small className="text-muted">
                  Baralho de Aventuras • Pág. {selectedCard.pdfPage}
                </small>
              </div>
              <div className="cv-actions">
                <button
                  className="btn-t20 btn-xs btn-primary"
                  onClick={() => pinCardToEncounter(selectedCard)}
                >
                  <Plus size={13} /> Fixar Carta no Encontro
                </button>
                {selectedCard.bestiaryCategories &&
                  selectedCard.bestiaryCategories.length > 0 && (
                    <button
                      className="btn-t20 btn-xs btn-orange"
                      onClick={() => {
                        setMonsterCategoryFilter('all');
                        setMonsterQuery(selectedCard.bestiaryCategories![0]);
                        setSubTab('bestiario');
                      }}
                    >
                      <Skull size={13} /> Buscar "{selectedCard.bestiaryCategories[0]}" no Bestiário
                    </button>
                  )}
                <button
                  className="btn-t20 btn-xs btn-secondary"
                  onClick={() => setShowCardPdf(!showCardPdf)}
                >
                  <FileSpreadsheet size={13} /> {showCardPdf ? 'Ocultar PDF' : 'Mostrar PDF'}
                </button>
              </div>
            </div>

            <div className="card-detail-summary">
              <p>
                <strong>Descrição & Uso na Mesa:</strong> {selectedCard.description}
              </p>
              {selectedCard.examples && selectedCard.examples.length > 0 && (
                <div className="card-twists-list">
                  <strong>Sugestões / Exemplos (1d6):</strong>
                  <ul>
                    {selectedCard.examples.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {showCardPdf && (
              <div className="card-pdf-container">
                <iframe
                  key={`baralho-${selectedCard.pdfPage}`}
                  src={`/api/pdf/baralho#page=${selectedCard.pdfPage}&view=FitH&toolbar=1`}
                  title={`Carta ${selectedCard.title}`}
                  className="embedded-pdf-iframe"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          ABA 3: GERADOR OFICIAL DE TESOUROS & RECOMPENSAS (CAPÍTULO 8)
         ======================================================================== */}
      {subTab === 'tesouros' && (
        <div className="treasure-workspace">
          <div className="treasure-controls-panel">
            <div className="tc-card">
              <h3>💰 Sorteador Oficial de Tesouro por ND (Tabela 8-1)</h3>
              <p className="text-muted">
                Rola automaticamente <strong>d% de Dinheiro</strong> e <strong>d% de Itens</strong>{' '}
                para o ND escolhido, resolvendo sub-tabelas de Riquezas, Equipamentos, Itens
                Superiores (com melhorias e materiais especiais), Poções e Itens Mágicos!
              </p>

              <div className="tc-form-grid">
                <label>
                  Nível de Desafio (ND):
                  <select
                    className="t20-select"
                    value={manualNd}
                    onChange={(e) => setManualNd(e.target.value)}
                  >
                    {ALL_NDS.map((nd) => (
                      <option key={nd} value={nd}>
                        ND {nd}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Padrão de Tesouro:
                  <select
                    className="t20-select"
                    value={manualModifier}
                    onChange={(e) => setManualModifier(e.target.value as TreasureModifier)}
                  >
                    <option value="Padrão">Padrão (1x)</option>
                    <option value="Dobro">Dobro (2 rolagens de Dinheiro + 2 de Itens)</option>
                    <option value="Metade">Metade (50% das moedas/riquezas)</option>
                  </select>
                </label>

                <label>
                  Origem / Identificação:
                  <input
                    type="text"
                    value={manualSourceLabel}
                    onChange={(e) => setManualSourceLabel(e.target.value)}
                    placeholder="Ex: Baú do Chefe, Covil do Dragão..."
                  />
                </label>
              </div>

              <div className="tc-btn-row">
                <button
                  className="btn-t20 btn-orange"
                  onClick={() => {
                    const res = rollTreasureByND(manualNd, manualModifier, manualSourceLabel);
                    setTreasureHistory((prev) => [res, ...prev]);
                    onAddRoll({
                      id: `log-manual-loot-${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      actor: manualSourceLabel,
                      label: `Tesouro ND ${manualNd} (${manualModifier})`,
                      formula: `d% $${res.moneyRollD100.join(',')} / Item ${res.itemRollD100.join(
                        ','
                      )}`,
                      rolls: [...res.moneyRollD100, ...res.itemRollD100],
                      modifier: 0,
                      total: res.totalEstimatedT$,
                      isD20: false,
                      detail: `${res.coinsText}${
                        res.items.length > 0
                          ? ' | ' + res.items.map((i) => i.name).join('; ')
                          : ''
                      }`,
                    });
                  }}
                >
                  <Dices size={15} /> Rolar Tesouro Completo (ND {manualNd})
                </button>
              </div>

              {/* Seletor de Jogador para Entrega Rápida de Itens */}
              {campaign.players.length > 0 && (
                <div className="player-delivery-selector">
                  <span>🎒 Jogador-alvo para receber itens clicados:</span>
                  <select
                    className="t20-select"
                    value={targetPlayerForItem}
                    onChange={(e) => setTargetPlayerForItem(e.target.value)}
                  >
                    {campaign.players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.race} {p.classAndLevel} • {p.tibares || '0 T$'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* HISTÓRICO DE TESOUROS ROLADOS */}
          <div className="treasure-history-panel">
            <div className="th-header">
              <h4>📜 Resultados de Tesouros ({treasureHistory.length})</h4>
              {treasureHistory.length > 0 && (
                <button
                  className="btn-t20 btn-xs btn-ghost"
                  onClick={() => setTreasureHistory([])}
                >
                  Limpar Histórico
                </button>
              )}
            </div>

            {treasureHistory.length === 0 ? (
              <div className="muted-hint">
                Nenhum tesouro sorteado ainda. Escolha um ND ao lado ou clique em{' '}
                <strong>"Sortear Tesouro"</strong> em qualquer monstro do Bestiário!
              </div>
            ) : (
              <div className="th-list">
                {treasureHistory.map((tr) => (
                  <div key={tr.id} className="th-card">
                    <div className="th-card-head">
                      <div>
                        <strong>{tr.sourceName}</strong>
                        <span className="nd-badge">
                          ND {tr.nd} • {tr.modifier}
                        </span>
                      </div>
                      <div className="th-card-actions">
                        <button
                          className="btn-t20 btn-xs btn-primary"
                          onClick={() => {
                            setEncTreasures((prev) => [tr, ...prev]);
                            showToast('Tesouro enviado para a Mesa de Encontro!');
                          }}
                        >
                          + Mesa de Encontro
                        </button>
                        {tr.coinsValueT$ > 0 && (
                          <button
                            className="btn-t20 btn-xs btn-orange"
                            onClick={() => distributeTibaresToParty(tr.coinsValueT$)}
                          >
                            🪙 Dividir {tr.coinsValueT$} T$ p/ Grupo
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="th-card-body">
                      <div className="th-row">
                        <span className="th-label">
                          Moedas (d% = {tr.moneyRollD100.join(', ')}):
                        </span>
                        <strong className="text-gold">{tr.coinsText}</strong>
                      </div>
                      <div className="th-row">
                        <span className="th-label">
                          Itens / Riquezas (d% = {tr.itemRollD100.join(', ')}):
                        </span>
                        {tr.items.length > 0 ? (
                          <div className="th-items-col">
                            {tr.items.map((it, i) => (
                              <div key={i} className="th-item-pill">
                                <span>
                                  🎁 <strong>[{it.category}] {it.name}:</strong> {it.details}{' '}
                                  <small className="text-muted">({it.rollDebug})</small>
                                </span>
                                {campaign.players.length > 0 && (
                                  <button
                                    className="btn-give-mini"
                                    onClick={() =>
                                      giveItemToPlayer(
                                        `${it.name} (${it.details})`,
                                        targetPlayerForItem || campaign.players[0].id
                                      )
                                    }
                                  >
                                    ➔ Entregar p/ Herói
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>Nenhum item extra rolado</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          ABA 4: ENCONTROS & CENAS SALVAS DA CAMPANHA
         ======================================================================== */}
      {subTab === 'salvos' && (
        <div className="saved-encounters-workspace">
          {(campaign.plannedEncounters || []).length === 0 ? (
            <div className="muted-hint">
              Você ainda não salvou nenhum encontro planejado. Use a{' '}
              <strong>Mesa de Encontro</strong> no topo para combinar cartas do Baralho de
              Aventuras, monstros do Bestiário e seus tesouros, e clique em{' '}
              <strong>"Salvar Encontro"</strong>!
            </div>
          ) : (
            <div className="saved-encounters-grid">
              {(campaign.plannedEncounters || []).map((enc) => {
                const resolvedMonsters = enc.monsters
                  .map((m) => {
                    const found = FULL_BESTIARY.find((b) => b.id === m.threatId);
                    return found ? { threat: found, count: m.count } : null;
                  })
                  .filter(Boolean) as { threat: ThreatSheet; count: number }[];

                return (
                  <div key={enc.id} className="saved-enc-card">
                    <div className="sec-head">
                      <div>
                        <h4>{enc.title}</h4>
                      </div>
                      <span className="status-pill status-planned">Salvo na Campanha</span>
                    </div>

                    {enc.cardsSummary && (
                      <div className="sec-cards">
                        <strong>🃏 Cartas:</strong> {enc.cardsSummary}
                      </div>
                    )}

                    {enc.notes && <p className="sec-notes">{enc.notes}</p>}

                    <div className="sec-monsters">
                      <strong>🐲 Criaturas:</strong>{' '}
                      {enc.monsters.length === 0 ? (
                        <span>Nenhuma</span>
                      ) : (
                        enc.monsters.map((m) => (
                          <span key={m.threatId} className="sec-monster-tag">
                            {m.count}x {m.name} (ND {m.nd})
                          </span>
                        ))
                      )}
                    </div>

                    <div className="sec-loot">
                      <strong>💰 Recompensas:</strong>{' '}
                      {enc.treasureCoinsT$.toLocaleString('pt-BR')} T${' '}
                      {enc.treasureSummary ? `• ${enc.treasureSummary}` : ''}
                    </div>

                    <div className="sec-actions">
                      <button
                        className="btn-t20 btn-xs btn-orange"
                        onClick={() => onSendEncounterToCombat(resolvedMonsters, enc.title)}
                        disabled={resolvedMonsters.length === 0}
                      >
                        <Swords size={13} /> Iniciar Combate!
                      </button>

                      <button
                        className="btn-t20 btn-xs btn-primary"
                        onClick={() => {
                          setEditingEncounterId(enc.id);
                          setEncTitle(enc.title);
                          setEncNotes(enc.notes);
                          setEncMonsters(resolvedMonsters);
                          setShowWorkbench(true);
                          showToast(`Encontro "${enc.title}" carregado na Mesa de Encontro!`);
                        }}
                      >
                        Carregar na Mesa
                      </button>

                      {enc.treasureCoinsT$ > 0 && (
                        <button
                          className="btn-t20 btn-xs btn-secondary"
                          onClick={() => distributeTibaresToParty(enc.treasureCoinsT$)}
                        >
                          🪙 Dividir {enc.treasureCoinsT$} T$
                        </button>
                      )}

                      <button
                        className="btn-t20 btn-xs btn-ghost"
                        onClick={() => {
                          const next = (campaign.plannedEncounters || []).filter(
                            (x) => x.id !== enc.id
                          );
                          onUpdateCampaign({ plannedEncounters: next });
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
