import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export type BookId = 'basico' | 'herois' | 'ameacas' | 'baralho';

interface BookPage {
  bookId: BookId;
  bookTitle: string;
  page: number;      // Página real do arquivo PDF (1-indexed)
  bookPage: number;  // Página impressa no rodapé do livro
  text: string;
  normText: string;
}

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const BOOK_META: Record<BookId, { title: string; offset: number; defaultTotal: number }> = {
  basico: { title: 'Tormenta20 — Livro Básico (Jogo do Ano)', offset: 6, defaultTotal: 407 },
  herois: { title: 'Heróis de Arton', offset: 2, defaultTotal: 332 },
  ameacas: { title: 'Ameaças de Arton (Bestiário)', offset: 2, defaultTotal: 436 },
  baralho: { title: 'Baralho de Aventuras', offset: 0, defaultTotal: 57 },
};

function loadBooksIndex(booksDir: string): BookPage[] {
  const pages: BookPage[] = [];
  if (!fs.existsSync(booksDir)) return pages;

  const files = fs.readdirSync(booksDir);
  for (const file of files) {
    if (!file.endsWith('.txt')) continue;
    const lower = normalizeStr(file);
    let bookId: BookId | null = null;

    if (lower.includes('basico') || lower.includes('sico')) {
      bookId = 'basico';
    } else if (lower.includes('ameaca')) {
      bookId = 'ameacas';
    } else if (lower.includes('baralho')) {
      bookId = 'baralho';
    } else if (lower.includes('herois')) {
      bookId = 'herois';
    }
    if (!bookId) continue;

    const meta = BOOK_META[bookId];
    const raw = fs.readFileSync(path.join(booksDir, file), 'utf-8');
    // Suporta tanto LF (\n) quanto CRLF (\r\n) do Windows
    const parts = raw.split(/\r?\n\r?\n===== PAGINA (\d+) =====\r?\n/);
    for (let i = 1; i < parts.length; i += 2) {
      const pageNum = parseInt(parts[i], 10);
      const text = (parts[i + 1] || '').trim();
      pages.push({
        bookId,
        bookTitle: meta.title,
        page: pageNum,
        bookPage: Math.max(1, pageNum - meta.offset),
        text,
        normText: normalizeStr(text),
      });
    }
  }
  console.log(`[Mestre20] 4 Livros indexados em memória: ${pages.length} páginas.`);
  return pages;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mestre20-local-api',
      configureServer(server) {
        const dataDir = path.resolve(__dirname, 'data');
        const booksDir = path.join(dataDir, 'books');
        const stateFile = path.join(dataDir, 'mestre20-state.json');
        const pdfRootDir = path.resolve(__dirname, '..');

        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        let bookPages: BookPage[] | null = null;
        const getBookPages = () => {
          if (!bookPages) {
            bookPages = loadBooksIndex(booksDir);
          }
          return bookPages;
        };

        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const url = new URL(req.url, 'http://localhost');

          // 1. Save / Load state on disk
          if (url.pathname === '/api/state') {
            if (req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              if (fs.existsSync(stateFile)) {
                res.end(fs.readFileSync(stateFile, 'utf-8'));
              } else {
                res.end(JSON.stringify({ empty: true }));
              }
              return;
            }
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  fs.writeFileSync(stateFile, body, 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err?.message || 'Erro ao salvar' }));
                }
              });
              return;
            }
          }

          // 2. Search across all 4 books (Livro Básico, Heróis de Arton, Ameaças de Arton, Baralho de Aventuras)
          if (url.pathname === '/api/books/search' && req.method === 'GET') {
            const q = (url.searchParams.get('q') || '').trim();
            const bookFilter = url.searchParams.get('book') || 'all';
            res.setHeader('Content-Type', 'application/json; charset=utf-8');

            if (!q || q.length < 2) {
              res.end(JSON.stringify({ results: [] }));
              return;
            }

            const pages = getBookPages();
            const qNorm = normalizeStr(q);
            const terms = qNorm.split(/\s+/).filter(Boolean);

            const results: Array<{
              bookId: BookId;
              bookTitle: string;
              page: number;
              bookPage: number;
              score: number;
              matchesCount: number;
              snippet: string;
            }> = [];

            for (const p of pages) {
              if (bookFilter !== 'all' && p.bookId !== bookFilter) continue;
              if (!p.text) continue;

              let score = 0;
              let matchesCount = 0;
              const exactIdx = p.normText.indexOf(qNorm);

              if (exactIdx !== -1) {
                score += 30;
                let pos = exactIdx;
                while (pos !== -1) {
                  matchesCount += 1;
                  score += 4;
                  pos = p.normText.indexOf(qNorm, pos + qNorm.length);
                }
              }

              let allTermsMatch = true;
              let firstTermIdx = exactIdx;
              for (const t of terms) {
                const idx = p.normText.indexOf(t);
                if (idx === -1) {
                  allTermsMatch = false;
                  break;
                }
                if (firstTermIdx === -1) firstTermIdx = idx;
                score += 5;
              }

              if (!allTermsMatch) continue;
              if (matchesCount === 0) matchesCount = terms.length;

              // Bonus se o termo aparece logo no começo da página (título de seção/capítulo)
              if (firstTermIdx >= 0 && firstTermIdx < 160) {
                score += 25;
              }

              const start = Math.max(0, firstTermIdx - 90);
              const end = Math.min(p.text.length, firstTermIdx + 240);
              const snippet =
                (start > 0 ? '…' : '') +
                p.text.slice(start, end).replace(/\s+/g, ' ').trim() +
                (end < p.text.length ? '…' : '');

              results.push({
                bookId: p.bookId,
                bookTitle: p.bookTitle,
                page: p.page,
                bookPage: p.bookPage,
                score,
                matchesCount,
                snippet,
              });
            }

            results.sort((a, b) => b.score - a.score || a.page - b.page);
            res.end(JSON.stringify({ results: results.slice(0, 100) }));
            return;
          }

          // 3. Get full page text from any of the 4 books
          if (url.pathname === '/api/books/page' && req.method === 'GET') {
            const rawBook = (url.searchParams.get('book') || 'basico') as BookId;
            const bookId: BookId = BOOK_META[rawBook] ? rawBook : 'basico';
            const meta = BOOK_META[bookId];
            const pageNum = parseInt(url.searchParams.get('page') || '1', 10);
            const pages = getBookPages();
            const bookPagesList = pages.filter((p) => p.bookId === bookId);
            const totalPages = bookPagesList.length || meta.defaultTotal;
            const clampedPage = Math.max(1, Math.min(totalPages, pageNum));
            const found = bookPagesList.find((p) => p.page === clampedPage);

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                bookId,
                bookTitle: meta.title,
                page: clampedPage,
                bookPage: found ? found.bookPage : Math.max(1, clampedPage - meta.offset),
                totalPages,
                text:
                  found && found.text
                    ? found.text
                    : '[Página composta por arte/ilustração de página inteira — visualize no modo PDF ao lado]',
              })
            );
            return;
          }

          // 4. Stream original PDF file with HTTP Range (206 Partial Content) support for instant embedded viewing
          if (url.pathname.startsWith('/api/pdf/') && req.method === 'GET') {
            const bookKey = url.pathname.replace('/api/pdf/', '').toLowerCase();
            const rootFiles = fs.existsSync(pdfRootDir) ? fs.readdirSync(pdfRootDir) : [];
            const matchFile = rootFiles.find((f) => {
              const l = normalizeStr(f);
              if (!l.endsWith('.pdf')) return false;
              if (bookKey.includes('ameaca')) return l.includes('ameaca');
              if (bookKey.includes('baralho')) return l.includes('baralho');
              if (bookKey.includes('herois')) return l.includes('herois');
              if (bookKey.includes('basico')) return l.includes('basico') || l.includes('sico');
              return false;
            });

            if (matchFile) {
              const fullPath = path.join(pdfRootDir, matchFile);
              const stat = fs.statSync(fullPath);
              const fileSize = stat.size;
              const range = req.headers.range;

              res.setHeader('Accept-Ranges', 'bytes');
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'inline');

              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = end - start + 1;

                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Content-Length': chunksize,
                  'Content-Type': 'application/pdf',
                });
                fs.createReadStream(fullPath, { start, end }).pipe(res);
              } else {
                res.writeHead(200, {
                  'Content-Length': fileSize,
                  'Content-Type': 'application/pdf',
                });
                fs.createReadStream(fullPath).pipe(res);
              }
              return;
            }
            res.statusCode = 404;
            res.end('PDF not found');
            return;
          }

          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
  },
});
