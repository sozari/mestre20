# 🐉 MESTRE20 — Escudo do Mestre Digital (Tormenta20 Edição Jogo do Ano)
**Documento de Contexto e Arquitetura para Agentes de IA (Antigravity / Cursor / Windsurf / Claude)**

> **Instrução para a IA em outro computador/plataforma:**
> Ao abrir este projeto, leia este arquivo primeiro. Ele resume todas as decisões de produto, regras do sistema **Tormenta20 (Edição Jogo do Ano)** adotadas, arquitetura técnica, estrutura de arquivos e como os dados e PDFs funcionam.

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

## 2. Livros-Fonte (PDFs) na Pasta Raiz (`mestre20/`)
Na pasta raiz `mestre20/` ficam os PDFs oficiais utilizados pelo sistema (servidos via streaming HTTP 206 pelo Vite em `/api/pdf/:book`):

| ID (`bookId`) | Arquivo PDF na pasta `mestre20/` | Arquivo de Texto Indexado (`app/data/books/`) | Páginas PDF | Offset (`pdfPage - bookPage`) |
| :--- | :--- | :--- | :---: | :---: |
| `basico` | `Livro Básico.pdf` | `Livro Básico.txt` | 407 | `+6` (`pdfPage = bookPage + 6`) |
| `herois` | `Heróis de Arton.pdf` | `Heróis de Arton.txt` | 332 | `+2` (`pdfPage = bookPage + 2`) |
| `ameacas` | `T20 - Ameaças de Arton.pdf` | `T20 - Ameaças de Arton.txt` | 436 | `+2` (`pdfPage = bookPage + 2`) |
| `baralho` | `Baralho de Aventuras.pdf` | `Baralho de Aventuras.txt` | 57 | `0` (`pdfPage = bookPage`) |

> *(Nota: O arquivo `Ficha Editável.pdf` na raiz deve ser **ignorado**, pois era de uma edição antiga e o usuário pediu para deixá-lo de lado).*

---

## 3. Funcionalidades Já Implementadas (Estado Atual)

### ABA 1: 👥 Jogadores (`src/components/PlayersTab.tsx`)
- **Cards de Fichas Editáveis**: Suporta qualquer número de jogadores na mesa, com edição direta de PV Atual/Máx/Temp, PM Atual/Máx, Defesa, RD, Atributos (`FOR`, `DES`, `CON`, `INT`, `SAB`, `CAR`), Perícias-chave (`Iniciativa`, `Percepção`, `Fortitude`, `Reflexos`, `Vontade`, `Luta`, `Pontaria`), CD de Magia e Tibares (`T$`).
- **Rolagens em 1 Clique**: Clicar em qualquer atributo, perícia ou ataque rola `1d20 + bônus` (e dano/crítico para ataques, multiplicando apenas os dados no crítico conforme regra do T20).
- **Rolador Oficial de Atributos (Tabela 1-1)**: Gera os 6 atributos rolando `4d6` (descartando o menor), convertendo pela Tabela 1-1 do *Livro Básico* (pág. 17) e aplicando a regra de re-rolar o menor se a soma dos modificadores for menor que `+6`.
- **Radar Passivo do Grupo**: Mostra no topo a maior Percepção, maior Iniciativa e menor Defesa do grupo, além de botão de **Teste em Grupo** (rola Percepção, Furtividade, Fortitude, Reflexos ou Vontade para todos os PJs de uma vez) e **Descanso** (curto, normal, confortável ou luxuoso recuperando PV/PM).

### ABA 2: ✨ Aventuras, Bestiário & Tesouros (`src/components/AdventurePlannerTab.tsx`)
Central que mescla preparação de sessão, sorteio de cartas, bestiário e recompensas:
- **⚔️ Mesa de Encontro / Cena Atual (Topo)**:
  - Combina **Cartas do Baralho de Aventuras** + **Monstros do Bestiário** + **Tesouros Sorteados**.
  - Calcula automaticamente o **ND Total do Encontro** e o **XP Total / XP por Jogador**.
  - **`💰 Sortear Tesouro dos Monstros`**: Rola automaticamente o tesouro oficial de cada criatura do encontro conforme seu `ND` e padrão (`Padrão`, `Dobro`, `Metade`, `Nenhum`).
  - **`🪙 Dividir T$ p/ Grupo`** e **`➔ Dar p/ Herói`**: Soma os Tibares divididos diretamente nas fichas dos jogadores ou adiciona o item sorteado direto no campo `equipment` do jogador escolhido.
  - **`⚔️ Enviar p/ Combate!`**: Envia todos os monstros do encontro direto para o Rastreador de Combate já com Iniciativa rolada.
  - **`✓ Salvar Encontro`**: Salva o encontro planejado em `campaign.plannedEncounters`.
- **🐲 Bestiário Completo (502 Criaturas) & Encontros Aleatórios (`src/data/bestiaryData.ts`)**:
  - **502 criaturas completas** (**428** do *Ameaças de Arton* + **74** do *Livro Básico*) com busca por nome, filtro por livro, facção/capítulo, papel (*Solo*, *Lacaio*, *Especial*) e faixa de ND (`1/4` a `20`, `S`, `S+`).
  - **Visualização Dividida (Ficha + PDF Ilustrado)**: Exibe a ficha com botões de rolagem ao lado da página original ilustrada do PDF (`/api/pdf/ameacas#page=...` ou `/api/pdf/basico#page=...`).
  - **Encontros Aleatórios por Região (Apêndice D do *Ameaças de Arton*)**: 16 tabelas oficiais de terreno/região com rolagem de `1d100` ajustada pelo patamar do grupo (*Iniciante +0, Veterano +30, Campeão +70, Lenda +110*) e botão para adicionar os monstros sorteados ao encontro.
- **🃏 Baralho de Aventuras — 55 Cartas (`src/data/baralhoData.ts`)**:
  - **Método Nimb (1 clique)**: Sorteia uma carta de *Enredo* e puxa todas as sub-cartas da receita (*Personagem*, *Ameaça*, *Local*, *Objeto*, *Evento*).
  - **Ponte Carta de Ameaça ➔ Bestiário**: Botão em cada carta de *Ameaça* que filtra o Bestiário automaticamente pelos monstros daquela ameaça.
  - **Leitor Embutido da Carta**: Mostra a carta ilustrada de `Baralho de Aventuras.pdf` direto na tela.
- **💰 Sorteador Oficial de Tesouros por ND (`src/utils/treasureRoller.ts`)**:
  - Implementação completa do **Capítulo 8 (Tabelas 8-1 a 8-15)** para qualquer ND (`1/4` a `20`, `S`, `S+`): rola `d%` de Dinheiro e `d%` de Itens, resolvendo **Riquezas** (Menor, Média, Maior), **Itens Diversos**, **Equipamentos**, **Itens Superiores** (`1` a `4` melhorias + **Materiais Especiais**), **Poções** e **Itens Mágicos** (Armas, Armaduras/Escudos e Acessórios Menores/Médios/Maiores).

### ABA 3: ⚔️ Combate (`src/components/CombatTab.tsx`)
- Rastreador de Iniciativa, contador de Rodadas e Turnos, controle de PV/PM/PV Temp, aplicação de Condições com duração em rodadas (que decrementam automaticamente a cada turno) e integração com todas as 502 criaturas do Bestiário + criação rápida de inimigos customizados.

### ABA 4: 🗺️ Mapa de Arton & Tático (`src/components/ArtonMapTab.tsx`)
- **Atlas Interativo de Arton** inspirado no *Mapa de Arton (Fichas de Nimb)* com zoom/pan, busca de localidades, pinos customizados do Mestre, cálculo de rota/viagem e alternância entre os mapas oficiais (`Arton`, `Doherimm`, `Lamnor`, `Moreania`, `Tamu-ra` em `app/public/maps/`).
- **Grid de Batalha Tático**: Tabuleiro quadriculado com tokens arrastáveis sincronizados com o combate ativo e régua de distância em metros/quadrados (`1,5m = 1q`).

### ABA 5: 📚 Livros (4 PDFs) & Escudo (`src/components/BooksAndShieldTab.tsx`)
- **Motor de Busca Instantânea nos 4 Livros (1.232 páginas)** com trechos grifados.
- **Sumário & Capítulos Navegáveis** (`src/data/booksToc.ts`) dos 4 livros.
- **Leitor Multi-Abas Embutido (`PDF na Tela`, `PDF + Texto` ou `Só Texto`)**: Abre as páginas originais dos PDFs direto dentro da interface sem precisar abrir janelas externas.
- **Escudo do Mestre Rápido**: Tabelas de Condições, CDs por Nível/Dificuldade, Preços, Manobras, Clima, Portas/Paredes e Gerador de NPC instantâneo + Diário de Sessões.

### 🎲 Rolador de Dados Lateral (`src/components/DiceDock.tsx`)
- Sempre visível na direita com dados rápidos (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d%`), expressões livres (`2d6+4`, `8d6`), modo de rolagem secreta do Mestre e histórico detalhado com destaque de Crítico e Falha Crítica.

---

## 4. Estrutura de Pastas Principal
```text
mestre20/
├── CONTEXTO_PROJETO.md          <-- Este arquivo de documentação para a IA
├── Livro Básico.pdf             <-- PDF oficial (407 págs)
├── Heróis de Arton.pdf          <-- PDF oficial (332 págs)
├── T20 - Ameaças de Arton.pdf   <-- PDF oficial (436 págs)
├── Baralho de Aventuras.pdf     <-- PDF oficial (57 págs)
└── app/                         <-- Projeto Web (React + TypeScript + Vite)
    ├── package.json
    ├── vite.config.ts           <-- Middleware que salva data/mestre20-state.json, busca nos 4 .txt e faz streaming dos 4 PDFs
    ├── data/
    │   ├── mestre20-state.json  <-- Banco de dados local automático de todas as campanhas/fichas/encontros
    │   └── books/               <-- Textos extraídos página a página dos 4 PDFs para busca instantânea
    ├── public/
    │   └── maps/                <-- Mapas de Arton em alta resolução
    └── src/
        ├── App.tsx              <-- Shell principal e navegação entre as 5 abas
        ├── types.ts             <-- Todas as interfaces TypeScript do sistema
        ├── styles.css           <-- Tema Dark Fantasy Tormenta20 completo
        ├── components/
        │   ├── PlayersTab.tsx           <-- Fichas dos jogadores e radar do grupo
        │   ├── AdventurePlannerTab.tsx  <-- Mesa de Encontro + Bestiário (502) + Baralho (55) + Tesouros (Cap. 8)
        │   ├── CombatTab.tsx            <-- Rastreador de iniciativa e combate
        │   ├── ArtonMapTab.tsx          <-- Mapa de Arton interativo + Grid Tático
        │   ├── BooksAndShieldTab.tsx    <-- Busca e leitor embutido dos 4 PDFs + Escudo + Sessões
        │   └── DiceDock.tsx             <-- Rolador de dados lateral
        ├── data/
        │   ├── bestiaryData.ts          <-- 502 criaturas extraídas de Ameaças de Arton e Livro Básico
        │   ├── baralhoData.ts           <-- 55 cartas do Baralho de Aventuras + 16 tabelas de encontros regionais
        │   ├── booksToc.ts              <-- Índices navegáveis dos 4 livros
        │   └── t20Database.ts           <-- Condições, cidades do mapa, tabelas do escudo e campanha inicial
        └── utils/
            ├── dice.ts                  <-- Motor de rolagem de dados, críticos de T20 e cálculo de ND/XP
            └── treasureRoller.ts        <-- Motor oficial de sorteio de tesouros do Cap. 8 (Tabelas 8-1 a 8-15)
```

---

## 5. Como Rodar em Qualquer Computador
1. Certifique-se de ter o **Node.js** instalado.
2. Entre na pasta `mestre20/app`:
   ```bash
   cd app
   npm install
   npm run dev
   ```
   *(No Windows PowerShell com bloqueio de execução de scripts `.ps1`, use `npm.cmd run dev` ou `npx.cmd vite --port 5173`).*
3. Acesse **`http://localhost:5173`** no navegador.
