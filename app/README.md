# 🐉 MESTRE20 — Escudo do Mestre Digital (Tormenta20 Edição Jogo do Ano)
**Documento de Contexto e Arquitetura para Agentes de IA (Antigravity / Cursor / Windsurf / Claude)**

> **Instrução para a IA em outro computador/plataforma:**
> Ao abrir este projeto, leia este arquivo primeiro (ou `../CONTEXTO_PROJETO.md` na raiz `mestre20/`). Ele resume todas as decisões de produto, regras do sistema **Tormenta20 (Edição Jogo do Ano)** adotadas, arquitetura técnica, estrutura de arquivos e como os dados e PDFs funcionam.

---

## 1. Visão Geral do Projeto
O **Mestre20** é uma aplicação web **100% local e portátil** (`React + TypeScript + Vite`), feita **exclusivamente para o Mestre** conduzir sessões presenciais ou online de **Tormenta20 (Edição Jogo do Ano)**.

### Decisões Fundamentais do Usuário (Mestre):
1. **Apenas para o Mestre**: Os jogadores não acessam pela rede; o Mestre controla tudo na sua tela.
2. **Padrão de Regras**: **Tormenta20 — Edição Jogo do Ano** (os atributos são apenas o modificador direto: ex. `FOR +3`, `DES +1`, `CON +2`, sem número 10–18 antigo).
3. **Fichas de Jogadores Descomplicadas**: O app **não trava o Mestre com cálculos automáticos engessados**. As fichas têm caixas de texto diretas e editáveis para Atributos, PV, PM, Defesa, Resistências (`Fortitude`, `Reflexos`, `Vontade`), Iniciativa, Percepção, Luta, Pontaria, CD de Magia, Tibares (`T$`), Ataques, Poderes/Magias e Equipamentos. O Mestre digita o bônus total (ex: `Reflexos +5`) e clica para rolar `1d20+5`.
4. **Suporte Ilimitado de Mesas e Jogadores**: Suporta qualquer quantidade de jogadores (4, 6, 8+) e múltiplas campanhas/mesas.
5. **100% Portátil (Zip & Play)**: Todo o estado da campanha é salvo automaticamente em disco no arquivo `app/data/mestre20-state.json` (além de `localStorage`). Se zipar a pasta `mestre20` e abrir em outro computador, tudo continua exatamente de onde parou.
6. **Identidade Visual**: Dark Fantasy com a essência de *Tormenta20* (preto profundo `#09090d`, vermelho rubi/carmesim `#dc2626`, laranja fogo `#f97316`, dourado `#f59e0b` e detalhes em branco/prata).

---

## 2. Livros-Fonte (PDFs) na Pasta Pai (`../`)
Na pasta pai `mestre20/` ficam os PDFs oficiais utilizados pelo sistema (servidos via streaming HTTP 206 pelo Vite em `/api/pdf/:book`):

| ID (`bookId`) | Arquivo PDF na pasta `mestre20/` | Arquivo de Texto Indexado (`app/data/books/`) | Páginas PDF | Offset (`pdfPage - bookPage`) |
| :--- | :--- | :--- | :---: | :---: |
| `basico` | `Livro Básico.pdf` | `Livro Básico.txt` | 407 | `+6` (`pdfPage = bookPage + 6`) |
| `herois` | `Heróis de Arton.pdf` | `Heróis de Arton.txt` | 332 | `+2` (`pdfPage = bookPage + 2`) |
| `ameacas` | `T20 - Ameaças de Arton.pdf` | `T20 - Ameaças de Arton.txt` | 436 | `+2` (`pdfPage = bookPage + 2`) |
| `baralho` | `Baralho de Aventuras.pdf` | `Baralho de Aventuras.txt` | 57 | `0` (`pdfPage = bookPage`) |

> *(Nota: O arquivo `Ficha Editável.pdf` na raiz deve ser **ignorado**, pois era de uma edição antiga e o usuário pediu para deixá-lo de lado).*

---

## 3. Funcionalidades Já Implementadas (Estado Atual)

- **ABA 1: 👥 Jogadores (`src/components/PlayersTab.tsx`)**: Fichas editáveis sem travas, rolagem de atributos oficial (Tabela 1-1), radar passivo do grupo, testes em grupo e descanso.
- **ABA 2: ✨ Aventuras, Bestiário & Tesouros (`src/components/AdventurePlannerTab.tsx`)**:
  - **Mesa de Encontro / Cena Atual**: Junta cartas sorteadas + monstros + tesouros, calcula ND e XP do encontro, sorteia todos os tesouros dos monstros em 1 clique, divide `T$` para as fichas dos heróis e envia o encontro direto para o Combate.
  - **Bestiário Completo (`src/data/bestiaryData.ts`)**: **502 criaturas** (428 de *Ameaças de Arton* + 74 do *Livro Básico*) com ficha interativa lado a lado com o PDF original ilustrado e **16 tabelas de Encontros Aleatórios por Região** (Apêndice D).
  - **Baralho de Aventuras (`src/data/baralhoData.ts`)**: Todas as **55 cartas** com sorteio pelo **Método Nimb** (Enredo + sub-cartas automáticas), leitor PDF da carta e link direto das cartas de Ameaça para o Bestiário.
  - **Sorteador Oficial de Tesouros (`src/utils/treasureRoller.ts`)**: Implementação completa das Tabelas 8-1 a 8-15 (moedas, riquezas menor/média/maior, itens diversos, equipamentos, itens superiores de 1 a 4 melhorias + materiais especiais, poções e itens mágicos menores/médios/maiores).
- **ABA 3: ⚔️ Combate (`src/components/CombatTab.tsx`)**: Iniciativa, rodadas/turnos, PV/PM, condições com contagem regressiva de rodadas e acesso às 502 ameaças.
- **ABA 4: 🗺️ Mapa de Arton & Tático (`src/components/ArtonMapTab.tsx`)**: Atlas interativo de Arton (`Arton`, `Doherimm`, `Lamnor`, `Moreania`, `Tamu-ra`) + Grid de Batalha Tático com tokens arrastáveis e régua (`1,5m = 1q`).
- **ABA 5: 📚 Livros (4 PDFs) & Escudo (`src/components/BooksAndShieldTab.tsx`)**: Busca instantânea nas **1.232 páginas** dos 4 livros, sumário navegável, leitor embutido multi-abas (`PDF na Tela`, `PDF + Texto`, `Só Texto`), tabelas do Escudo do Mestre, Gerador de NPC e Diário de Sessões.

---

## 4. Como Rodar
```bash
npm install
npm run dev
```
*(No Windows PowerShell com bloqueio de `.ps1`, use `npm.cmd run dev` ou `npx.cmd vite --port 5173`).*
