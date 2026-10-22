// Gerador Oficial de Tesouros e Recompensas — Tormenta20 Jogo do Ano (Capítulo 8, Tabelas 8-1 a 8-15)

export type TreasureModifier = 'Nenhum' | 'Metade' | 'Padrão' | 'Dobro';

export interface RolledLootItem {
  category: 'Moedas' | 'Riqueza' | 'Diverso' | 'Equipamento' | 'Superior' | 'Poção' | 'Mágico';
  name: string;
  details: string;
  valueTibares: number; // Valor estimado em T$
  rollDebug: string;
}

export interface TreasureRollResult {
  id: string;
  timestamp: string;
  sourceName: string;
  nd: string;
  modifier: TreasureModifier;
  moneyRollD100: number[];
  itemRollD100: number[];
  coinsText: string;
  coinsValueT$: number;
  items: RolledLootItem[];
  totalEstimatedT$: number;
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice(count: number, faces: number, mult = 1, add = 0): { total: number; text: string } {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(rnd(1, faces));
  const raw = rolls.reduce((a, b) => a + b, 0) + add;
  const total = raw * mult;
  return {
    total,
    text: `${count}d${faces}${add ? `+${add}` : ''}${mult > 1 ? `x${mult}` : ''} [${rolls.join(', ')}] = ${total}`,
  };
}

// Tabela 8-2: Riquezas
interface RiquezaTierRow {
  menor?: [number, number];
  media?: [number, number];
  maior?: [number, number];
  dice: [number, number, number]; // count, faces, mult
  avg: number;
  examples: string[];
}

const TABELA_8_2_RIQUEZAS: RiquezaTierRow[] = [
  {
    menor: [1, 25],
    dice: [4, 4, 1],
    avg: 10,
    examples: ['Ágata (1/2 esp.)', 'Hematita (1/2 esp.)', 'Barril de farinha (5 esp.)', 'Gaiola com galinhas (5 esp.)'],
  },
  {
    menor: [26, 40],
    dice: [1, 4, 10],
    avg: 25,
    examples: ['Quartzo rosa (1/2 esp.)', 'Topázio (1/2 esp.)', 'Caixa de tabaco (1 esp.)', 'Rolo de linho (1 esp.)', 'Jarro de especiarias — gorad, canela ou pimenta (2 esp.)'],
  },
  {
    menor: [41, 55],
    media: [1, 10],
    dice: [2, 4, 10],
    avg: 50,
    examples: ['Bracelete de ouro finamente trabalhado (1/2 esp.)', 'Estatueta de marfim entalhado (1 esp.)', 'Rolo de seda (1 esp.)', 'Vaso de prata (2 esp.)'],
  },
  {
    menor: [56, 70],
    media: [11, 30],
    dice: [4, 6, 10],
    avg: 140,
    examples: ['Ametista (1/2 esp.)', 'Pérola branca (1/2 esp.)', 'Lingote de prata (1 esp.)', 'Cálice de prata com gemas de lápis-lazúli (1 esp.)', 'Tapeçaria grande de lã (5 esp.)'],
  },
  {
    menor: [71, 85],
    media: [31, 50],
    maior: [1, 5],
    dice: [1, 6, 100],
    avg: 350,
    examples: ['Alexandrita (1/2 esp.)', 'Pérola negra (1/2 esp.)', 'Espada cerimonial ornada com prata e gema negra (1 esp.)', 'Pente de prata com pedras preciosas (1 esp.)'],
  },
  {
    menor: [86, 95],
    media: [51, 65],
    maior: [6, 15],
    dice: [2, 6, 100],
    avg: 700,
    examples: ['Pente em forma de dragão com olhos de rubi (1 esp.)', 'Harpa de madeira exótica com zircão e marfim (5 esp.)'],
  },
  {
    menor: [96, 99],
    media: [66, 80],
    maior: [16, 25],
    dice: [2, 8, 100],
    avg: 900,
    examples: ['Opala negra (1/2 esp.)', 'Tapa-olho com olho falso de safira (1/2 esp.)', 'Pingente de opala vermelha com corrente de ouro (1 esp.)', 'Lingote de ouro (2 esp.)', 'Pintura antiga (2 esp.)'],
  },
  {
    menor: [100, 100],
    media: [81, 90],
    maior: [26, 40],
    dice: [4, 10, 100],
    avg: 2200,
    examples: ['Esmeralda verde (1/2 esp.)', 'Pingente de safira (1/2 esp.)', 'Caixinha de música de ouro (1 esp.)', 'Manto bordado em veludo e pedras preciosas (2 esp.)'],
  },
  {
    media: [91, 95],
    maior: [41, 60],
    dice: [6, 12, 100],
    avg: 3900,
    examples: ['Anel de prata e safira (1/2 esp.)', 'Diamante branco (1/2 esp.)', 'Ídolo de ouro puro maciço (5 esp.)'],
  },
  {
    media: [96, 99],
    maior: [61, 75],
    dice: [2, 10, 1000],
    avg: 11000,
    examples: ['Anel de ouro e rubi (1/2 esp.)', 'Diamante vermelho (1/2 esp.)', 'Conjunto de taças de ouro com esmeraldas (2 esp.)'],
  },
  {
    media: [100, 100],
    maior: [76, 85],
    dice: [6, 8, 1000],
    avg: 27000,
    examples: ['Coroa de ouro adornada com gemas de antigo monarca (1 esp.)', 'Baú de mitral com coleção de diamantes (2 esp.)'],
  },
  {
    maior: [86, 95],
    dice: [1, 10, 10000],
    avg: 55000,
    examples: ['Arca reforçada repleta de lingotes de ouro, prata e pedras preciosas (20 esp.)'],
  },
  {
    maior: [96, 100],
    dice: [4, 12, 10000],
    avg: 260000,
    examples: ['Sala forrada de moedas e relíquias imperiais (exige carroças para transporte)'],
  },
];

function rollRiqueza(tier: 'menor' | 'media' | 'maior', plusPercent = false): RolledLootItem {
  const rawD100 = rnd(1, 100);
  const d100 = plusPercent ? Math.min(100, rawD100 + 20) : rawD100;
  const row =
    TABELA_8_2_RIQUEZAS.find((r) => {
      const range = r[tier];
      return range && d100 >= range[0] && d100 <= range[1];
    }) || TABELA_8_2_RIQUEZAS[0];

  const [c, f, m] = row.dice;
  const valRoll = rollDice(c, f, m);
  const example = row.examples[rnd(0, row.examples.length - 1)];
  const tierLabel = tier === 'menor' ? 'Menor' : tier === 'media' ? 'Média' : 'Maior';

  return {
    category: 'Riqueza',
    name: `💎 Riqueza ${tierLabel}: ${example}`,
    details: `Valor de venda integral: T$ ${valRoll.total.toLocaleString('pt-BR')} (média T$ ${row.avg})`,
    valueTibares: valRoll.total,
    rollDebug: `d%=${rawD100}${plusPercent ? '+20' : ''} (${valRoll.text})`,
  };
}

// Tabela 8-3: Itens Diversos
const TABELA_8_3_DIVERSOS: Array<[number, number, string, number]> = [
  [1, 2, 'Ácido', 10],
  [3, 4, 'Água benta', 10],
  [5, 5, 'Alaúde élfico', 300],
  [6, 6, 'Algemas', 15],
  [7, 8, 'Baga-de-fogo', 30],
  [9, 23, 'Bálsamo restaurador (cura 2d4 PV)', 10],
  [24, 24, 'Bandana', 5],
  [25, 25, 'Bandoleira de poções', 20],
  [26, 30, 'Bomba (6d6 impacto, Ref CD Des reduz à metade)', 50],
  [31, 31, 'Botas reforçadas', 20],
  [32, 32, 'Camisa bufante', 25],
  [33, 33, 'Capa esvoaçante', 25],
  [34, 34, 'Capa pesada', 15],
  [35, 35, 'Casaco longo', 20],
  [36, 36, 'Chapéu arcano', 50],
  [37, 38, 'Coleção de livros (+1 em perícia de Conhecimento)', 75],
  [39, 40, 'Cosmético', 30],
  [41, 42, 'Dente-de-dragão', 45],
  [43, 43, 'Enfeite de elmo', 15],
  [44, 44, 'Elixir do amor', 100],
  [45, 46, 'Equipamento de viagem', 10],
  [47, 56, 'Essência de mana (recupera 1d4 PM)', 50],
  [57, 57, 'Estojo de disfarces', 50],
  [58, 58, 'Farrapos de ermitão', 1],
  [59, 59, 'Flauta mística', 150],
  [60, 66, 'Fogo alquímico (1d6 fogo + em chamas)', 10],
  [67, 67, 'Gorro de ervas', 75],
  [68, 69, 'Líquen lilás', 30],
  [70, 70, 'Luneta', 100],
  [71, 71, 'Luva de pelica', 5],
  [72, 73, 'Maleta de medicamentos', 50],
  [74, 74, 'Manopla', 10],
  [75, 75, 'Manto eclesiástico', 20],
  [76, 78, 'Mochila de aventureiro (+2 espaços)', 50],
  [79, 80, 'Musgo púrpura', 45],
  [81, 81, 'Organizador de pergaminhos', 25],
  [82, 83, 'Ossos de monstro', 45],
  [84, 85, 'Pó de cristal', 30],
  [86, 87, 'Pó de giz', 1],
  [88, 88, 'Pó do desaparecimento', 100],
  [89, 89, 'Robe místico', 50],
  [90, 91, 'Saco de sal', 1],
  [92, 92, 'Sapatos de camurça', 8],
  [93, 94, 'Seixo de âmbar', 30],
  [95, 95, 'Sela', 20],
  [96, 96, 'Tabardo', 10],
  [97, 97, 'Traje da corte', 100],
  [98, 99, 'Terra de cemitério', 30],
  [100, 100, 'Veste de seda', 25],
];

// Tabela 8-4: Equipamentos
const TABELA_8_4_ARMAS: Array<[number, number, string, number]> = [
  [1, 3, 'Adaga', 2],
  [4, 5, 'Alabarda', 10],
  [6, 7, 'Alfange', 75],
  [8, 10, 'Arco curto', 30],
  [11, 13, 'Arco longo', 100],
  [14, 15, 'Azagaia', 1],
  [16, 16, 'Balas (20)', 20],
  [17, 18, 'Besta leve', 35],
  [19, 20, 'Besta pesada', 50],
  [21, 23, 'Bordão', 0],
  [24, 24, 'Chicote', 2],
  [25, 27, 'Cimitarra', 15],
  [28, 30, 'Clava', 0],
  [31, 31, 'Corrente de espinhos', 25],
  [32, 33, 'Espada bastarda', 35],
  [34, 38, 'Espada curta', 10],
  [39, 43, 'Espada longa', 15],
  [44, 46, 'Flechas (20)', 1],
  [47, 49, 'Florete', 20],
  [50, 51, 'Foice', 4],
  [52, 53, 'Funda', 0],
  [54, 55, 'Gadanho', 18],
  [56, 56, 'Katana', 100],
  [57, 59, 'Lança', 2],
  [60, 60, 'Lança montada', 10],
  [61, 63, 'Maça', 12],
  [64, 66, 'Machadinha', 6],
  [67, 67, 'Machado anão', 30],
  [68, 70, 'Machado de batalha', 10],
  [71, 73, 'Machado de guerra', 20],
  [74, 74, 'Machado táurico', 50],
  [75, 76, 'Mangual', 8],
  [77, 77, 'Marreta', 20],
  [78, 80, 'Martelo de guerra', 12],
  [81, 83, 'Montante', 50],
  [84, 84, 'Mosquete', 500],
  [85, 85, 'Pedras (20)', 0],
  [86, 88, 'Picareta', 8],
  [89, 90, 'Pique', 2],
  [91, 92, 'Pistola', 250],
  [93, 93, 'Rede', 20],
  [94, 96, 'Tacape', 0],
  [97, 98, 'Tridente', 15],
  [99, 100, 'Virotes (20)', 2],
];

const TABELA_8_4_ARMADURAS: Array<[number, number, string, number, boolean]> = [
  [1, 5, 'Armadura de couro', 20, false],
  [6, 10, 'Brunea', 50, false],
  [11, 25, 'Armadura completa', 3000, false],
  [26, 30, 'Cota de malha', 150, false],
  [31, 45, 'Couraça', 500, false],
  [46, 55, 'Couro batido', 35, false],
  [56, 65, 'Escudo leve', 5, true],
  [66, 80, 'Escudo pesado', 15, true],
  [81, 85, 'Gibão de peles', 25, false],
  [86, 90, 'Loriga segmentada', 250, false],
  [91, 100, 'Meia armadura', 600, false],
];

const TABELA_8_4_ESOTERICOS: Array<[number, number, string, number]> = [
  [1, 10, 'Bolsa de pó', 300],
  [11, 25, 'Cajado arcano', 1000],
  [26, 35, 'Cetro elemental', 750],
  [36, 42, 'Costela de lich', 300],
  [43, 50, 'Dedo de ente', 200],
  [51, 55, 'Luva de ferro', 150],
  [56, 65, 'Medalhão de prata', 750],
  [66, 75, 'Orbe cristalina', 750],
  [76, 85, 'Tomo hermético', 1500],
  [86, 100, 'Varinha arcana', 100],
];

const MATERIAIS_ESPECIAIS = [
  'de Aço-Rubi',
  'de Adamante',
  'de Gelo Eterno',
  'de Madeira Tollon',
  'de Matéria Vermelha',
  'de Mitral',
];

function lookupD100<T extends [number, number, ...any[]]>(table: T[], roll: number): T {
  return table.find((r) => roll >= r[0] && roll <= r[1]) || table[0];
}

function rollEquipamentoBase(twoDice = false): {
  type: 'arma' | 'armadura' | 'esoterico';
  isShield?: boolean;
  name: string;
  basePrice: number;
  debug: string;
} {
  const d1 = rnd(1, 6);
  const d2 = twoDice ? rnd(1, 6) : d1;
  const chosenD6 = Math.max(d1, d2);
  const d100 = rnd(1, 100);

  if (chosenD6 <= 3) {
    const row = lookupD100(TABELA_8_4_ARMAS, d100);
    return { type: 'arma', name: row[2], basePrice: row[3], debug: `1d6=${chosenD6}, d%=${d100}` };
  } else if (chosenD6 <= 5) {
    const row = lookupD100(TABELA_8_4_ARMADURAS, d100);
    return { type: 'armadura', isShield: row[4], name: row[2], basePrice: row[3], debug: `1d6=${chosenD6}, d%=${d100}` };
  } else {
    const row = lookupD100(TABELA_8_4_ESOTERICOS, d100);
    return { type: 'esoterico', name: row[2], basePrice: row[3], debug: `1d6=${chosenD6}, d%=${d100}` };
  }
}

const MELHORIAS_PRECO: Record<number, number> = { 1: 300, 2: 3000, 3: 9000, 4: 18000 };

function rollSuperior(melhoriasTarget: number, twoDice = false): RolledLootItem {
  const base = rollEquipamentoBase(twoDice);
  const mods: string[] = [];
  let slotsUsed = 0;
  let safety = 0;

  while (slotsUsed < melhoriasTarget && safety < 25) {
    safety++;
    const r = rnd(1, 100);
    const remaining = melhoriasTarget - slotsUsed;

    if (base.type === 'arma') {
      let mod = 'Certeira (+1 ataque)';
      let cost = 1;
      if (r <= 10) { mod = 'Atroz (+2 dano, requer Cruel)'; cost = 2; }
      else if (r <= 13) mod = 'Banhada a ouro (+2 Diplomacia)';
      else if (r <= 23) mod = 'Certeira (+1 ataque)';
      else if (r <= 26) mod = 'Cravejada de gemas';
      else if (r <= 36) mod = 'Cruel (+1 dano)';
      else if (r <= 39) mod = 'Discreta (+5 Ladinagem para ocultar)';
      else if (r <= 44) mod = 'Equilibrada (+2 manobras)';
      else if (r <= 48) mod = 'Harmonizada (-1 PM em habilidade)';
      else if (r <= 53) mod = 'Injeção alquímica';
      else if (r <= 55) mod = 'Macabra (+2 Intimidação)';
      else if (r <= 65) mod = 'Maciça (+1 multiplicador de crítico)';
      else if (r <= 75) mod = `Material Especial (${MATERIAIS_ESPECIAIS[rnd(0, 5)]})`;
      else if (r <= 80) mod = 'Mira telescópica';
      else if (r <= 90) mod = 'Precisa (+1 margem de ameaça)';
      else { mod = 'Pungente (+2 ataque, requer Certeira)'; cost = 2; }

      if (cost > remaining) continue;
      if (!mods.includes(mod)) {
        mods.push(mod);
        slotsUsed += cost;
      }
    } else if (base.type === 'armadura') {
      let mod = 'Reforçada (+1 Defesa)';
      let cost = 1;
      if (r <= 15) mod = 'Ajustada (-1 penalidade de armadura)';
      else if (r <= 19) mod = 'Banhada a ouro';
      else if (r <= 23) mod = 'Cravejada de gemas';
      else if (r <= 28) mod = 'Delicada (aplica +1 da Des na Defesa)';
      else if (r <= 32) mod = 'Discreta';
      else if (r <= 37) mod = 'Espinhos (causa 1d6 perfuração ao agarrar)';
      else if (r <= 40) mod = 'Macabra';
      else if (r <= 50) mod = `Material Especial (${MATERIAIS_ESPECIAIS[rnd(0, 5)]})`;
      else if (r <= 55) mod = 'Polida (+5 Defesa na 1ª rodada em luz)';
      else if (r <= 80) mod = 'Reforçada (+1 Defesa)';
      else if (r <= 90) mod = 'Selada (+1 em todos os testes de resistência)';
      else { mod = 'Sob medida (-2 penalidade de armadura, requer Ajustada)'; cost = 2; }

      if (cost > remaining) continue;
      if (!mods.includes(mod)) {
        mods.push(mod);
        slotsUsed += cost;
      }
    } else {
      let mod = 'Canalizador (+1 limite de PM)';
      if (r <= 4) mod = 'Banhado a ouro';
      else if (r <= 19) mod = 'Canalizador (+1 limite de PM)';
      else if (r <= 23) mod = 'Cravejado de gemas';
      else if (r <= 27) mod = 'Discreto';
      else if (r <= 42) mod = 'Energético (+1d6 dano em magias)';
      else if (r <= 57) mod = 'Harmonizado (-1 PM em uma magia)';
      else if (r <= 60) mod = 'Macabro';
      else if (r <= 69) mod = `Material Especial (${MATERIAIS_ESPECIAIS[rnd(0, 5)]})`;
      else if (r <= 85) mod = 'Poderoso (+1 CD nas magias)';
      else mod = 'Vigilante (+2 Defesa)';

      if (!mods.includes(mod)) {
        mods.push(mod);
        slotsUsed += 1;
      }
    }
  }

  const price = base.basePrice + (MELHORIAS_PRECO[melhoriasTarget] || 300);
  return {
    category: 'Superior',
    name: `⚒️ ${base.name} Superior (${melhoriasTarget} ${melhoriasTarget === 1 ? 'melhoria' : 'melhorias'})`,
    details: `Melhorias: ${mods.join('; ')} — Valor: T$ ${price.toLocaleString('pt-BR')}`,
    valueTibares: price,
    rollDebug: `${base.debug}`,
  };
}

// Tabela 8-12: Poções
const TABELA_8_12_POCOES: Array<[number, number, string, number]> = [
  [1, 1, 'Óleo de Abençoar Alimentos', 30],
  [2, 3, 'Granada de Área Escorregadia', 30],
  [4, 6, 'Óleo de Arma Mágica (+1)', 30],
  [7, 7, 'Poção de Compreensão', 30],
  [8, 15, 'Poção de Curar Ferimentos (2d8+2 PV)', 30],
  [16, 18, 'Poção de Disfarce Ilusório', 30],
  [19, 20, 'Óleo de Escuridão', 30],
  [21, 22, 'Óleo de Luz', 30],
  [23, 24, 'Granada de Névoa', 30],
  [25, 26, 'Poção de Primor Atlético', 30],
  [27, 28, 'Poção de Proteção Divina (+2 resistências)', 30],
  [29, 30, 'Poção de Resistência a Energia (RD 10)', 30],
  [31, 32, 'Poção de Sono', 30],
  [33, 33, 'Poção de Suporte Ambiental', 30],
  [34, 34, 'Óleo de Tranca Arcana', 30],
  [35, 35, 'Poção de Visão Mística', 30],
  [36, 36, 'Poção de Vitalidade Fantasma (2d10 PV temp.)', 30],
  [37, 38, 'Poção de Escudo da Fé (+2 Defesa pela cena)', 120],
  [39, 40, 'Poção de Alterar Tamanho', 270],
  [41, 42, 'Poção de Aparência Perfeita', 270],
  [43, 43, 'Óleo de Armamento da Natureza', 270],
  [44, 49, 'Granada de Bola de Fogo (6d6 fogo)', 270],
  [50, 51, 'Poção de Camuflagem Ilusória', 270],
  [52, 53, 'Poção de Concentração de Combate (cena)', 270],
  [54, 62, 'Poção de Curar Ferimentos (4d8+4 PV)', 270],
  [63, 66, 'Poção de Físico Divino (+2 For, Des ou Con)', 270],
  [67, 68, 'Poção de Mente Divina (+2 Int, Sab ou Car)', 270],
  [69, 70, 'Poção de Metamorfose', 270],
  [71, 75, 'Poção de Purificação (remove condições)', 270],
  [76, 77, 'Poção de Velocidade (ação extra)', 270],
  [78, 79, 'Óleo de Vestimenta da Fé (+2 Defesa)', 270],
  [80, 80, 'Poção de Voz Divina', 270],
  [81, 82, 'Óleo de Arma Mágica (+3)', 750],
  [83, 88, 'Poção de Curar Ferimentos (7d8+7 PV)', 1080],
  [89, 89, 'Poção de Físico Divino (+2 nos 3 atributos físicos)', 1080],
  [90, 92, 'Poção de Invisibilidade (duração cena)', 1080],
  [93, 96, 'Granada de Bola de Fogo Aprimorada (10d6 fogo)', 1470],
  [97, 100, 'Poção de Curar Ferimentos Maior (11d8+11 PV)', 3000],
];

function rollPocao(plusPercent = false): RolledLootItem {
  const raw = rnd(1, 100);
  const d100 = plusPercent ? Math.min(100, raw + 20) : raw;
  const row = lookupD100(TABELA_8_12_POCOES, d100);
  return {
    category: 'Poção',
    name: `🧪 ${row[2]}`,
    details: `Preço de mercado: T$ ${row[3].toLocaleString('pt-BR')} (0,5 espaço)`,
    valueTibares: row[3],
    rollDebug: `d%=${raw}${plusPercent ? '+20' : ''}`,
  };
}

// Tabelas 8-8 a 8-15: Itens Mágicos
const ENCANTOS_ARMAS = [
  'Ameaçadora (duplica margem de ameaça)',
  'Anticriatura (+4d8 contra um tipo de criatura)',
  'Arremesso (volta voando)',
  'Assassina (dano furtivo d8)',
  'Caçadora (ignora camuflagem/cobertura leve)',
  'Congelante (+1d6 frio e enreda)',
  'Conjuradora (armazena 1 magia)',
  'Corrosiva (+1d6 ácido + 4d4 ácido)',
  'Dançarina (flutua e ataca sozinha)',
  'Defensora (+2 Defesa)',
  'Destruidora (+2 ataque e +2d8 vs construtos)',
  'Dilacerante (+10 dano no crítico)',
  'Drenante (crítico dá 2d10 PV temp e deixa fraco)',
  'Elétrica (+1d6 eletricidade + raio 3d8)',
  'Flamejante (+1d6 fogo ou Bola de Fogo 6d6)',
  'Formidável (+2 ataque e dano)',
  'Piedosa (+1d8 não letal)',
  'Profana (+2d8 vs devotos do Bem)',
  'Sagrada (+2d8 vs devotos do Mal)',
  'Sanguinária (causa sangramento cumulativo)',
  'Trovejante (crítico atordoa)',
  'Tumular (+1d8 trevas)',
  'Veloz (fornece Ataque Extra)',
  'Venenosa (1d12 veneno por 3 rodadas)',
];

const ARMAS_ESPECIFICAS: Array<[string, number, string]> = [
  ['Azagaia dos Relâmpagos', 30000, 'Transforma-se num Relâmpago de 8d6 eletricidade'],
  ['Espada Baronial', 30000, 'Espada longa +1 a +4 para devotos de Khalmyr/Nobreza'],
  ['Lâmina da Luz', 45000, 'Espada bastarda formidável que ofusca inimigos'],
  ['Lança Animalesca', 45000, 'Aplica +2 ataque/dano em Forma Selvagem'],
  ['Maça do Terror', 45000, 'Maça formidável que lança Amedrontar'],
  ['Florete Fugaz', 50000, 'Florete formidável com ataque extra no crítico'],
  ['Cajado da Destruição', 60000, 'Bordão/Cajado arcano formidável (+1 dano por dado em magias)'],
  ['Cajado da Vida', 60000, 'Bordão formidável (+2 PV curados por dado em magias divinas)'],
  ['Machado Silvestre', 70000, 'Machado de batalha formidável (+1d8 e Trespassar nos ermos)'],
  ['Martelo de Doherimm', 70000, 'Martelo de guerra formidável (+2d8 vs Grandes para anões)'],
  ['Arco do Poder', 90000, 'Arco longo formidável que cria flechas de essência (3d8) ou explosivas'],
  ['Língua do Deserto', 90000, 'Cimitarra formidável de chamas'],
  ['Besta Explosiva', 100000, 'Besta pesada formidável que dispara Bola de Fogo (6d6)'],
  ['Punhal Sszzaazita', 100000, 'Adaga assassina formidável venenosa que se disfarça'],
  ['Espada Sortuda', 110000, 'Espada curta formidável (+2 resistências e permite rerrolar)'],
  ['Avalanche', 140000, 'Machado de guerra de gelo eterno congelante formidável'],
  ['Cajado do Poder', 180000, 'Bordão defensor magnífico (-1 PM e +3 CD em magias arcanas)'],
  ['Vingadora Sagrada', 200000, 'Espada longa lendária (+5 ataque/dano e RM +5 para paladinos)'],
];

const ENCANTOS_ARMADURAS = [
  'Abascanto (Resistência a magia +5)',
  'Abençoado (RD trevas 10 e +5 contra necromancia)',
  'Acrobático (+5 Acrobacia e sem penalidade)',
  'Alado (voo 12m por 2 PM)',
  'Assustador (aura de medo em alcance curto)',
  'Cáustica (RD ácido 10 e +1d4 ácido nos ataques)',
  'Defensor (+2 Defesa)',
  'Escorregadio (+10 para escapar/evitar agarrar)',
  'Fantasmagórico (lança Manto de Sombras)',
  'Fortificado (ignora crítico 25%/50%)',
  'Gélido (RD frio 10 e +10 PV temp)',
  'Incandescente (RD fogo 10 e 1d6 fogo adjacente)',
  'Invulnerável (RD 2 em escudo / RD 5 em armadura)',
  'Opaco (RD 10 a ácido, eletricidade, fogo e frio)',
  'Protetor (+2 em testes de resistência)',
  'Refletor (reflete magias de volta ao conjurador)',
  'Relampejante (RD eletricidade 10 e 2d6 dano a atacantes)',
  'Reluzente (cega inimigos em alcance curto)',
  'Sombrio (+5 Furtividade e sem penalidade)',
  'Zeloso (recebe ataques no lugar de aliado adjacente)',
];

const ARMADURAS_ESPECIFICAS: Array<[string, number, string]> = [
  ['Cota Élfica', 30000, 'Cota de malha defensora de mitral leve'],
  ['Couro de Monstro', 36000, 'Gibão de peles defensor (+2d6 dano em investida/Ataque Poderoso)'],
  ['Escudo do Conjurador', 45000, 'Escudo leve defensor que guarda 1 magia'],
  ['Loriga do Centurião', 45000, 'Loriga segmentada defensora (+2d6 fogo ao liderar)'],
  ['Manto da Noite', 45000, 'Couro batido ajustado defensor sombrio'],
  ['Couraça do Comando', 45000, 'Couraça banhada a ouro sob medida defensora (+1 Carisma)'],
  ['Baluarte Anão', 50000, 'Armadura completa reforçada defensora de adamante (RD 10 parado)'],
  ['Escudo Espinhoso', 50000, 'Escudo pesado defensor (dispara espinho 1d10+2 automático)'],
  ['Escudo do Leão', 50000, 'Escudo pesado defensor (mordida 2d6+2 automática)'],
  ['Carapaça Demoníaca', 63000, 'Armadura completa macabra reforçada guardiã (+1d8 trevas)'],
  ['Escudo do Eclipse', 70000, 'Escudo pesado defensor (RD trevas 10 e lança Escuridão)'],
  ['Escudo de Azgher', 140000, 'Escudo pesado guardião (cone de luz solar 6d6/6d8)'],
  ['Armadura da Luz', 150000, 'Armadura completa guardiã zelosa (RD igual ao Carisma)'],
];

const ACESSORIOS_MENORES: Array<[string, number, string]> = [
  ['Anel do Sustento', 3000, 'Dispensa comida/bebida e reduz sono para 2h'],
  ['Bainha Mágica', 3000, 'Lança Arma Mágica sem custo em PM'],
  ['Corda da Escalada', 3000, 'Corda de 15m que se move e amarra sozinha'],
  ['Ferraduras da Velocidade', 3000, '+3m no deslocamento de montaria'],
  ['Garrafa da Fumaça Eterna', 3000, 'Gera Névoa continuamente sem gastar PM'],
  ['Gema da Luminosidade', 3000, 'Ilumina como tocha ou cega alvo por 1d4 rodadas'],
  ['Manto Élfico', 3000, '+5 em Furtividade'],
  ['Mochila de Carga', 3000, '+10 espaços de capacidade de carga'],
  ['Brincos da Sagacidade', 4500, '+1 em Inteligência'],
  ['Luvas da Delicadeza', 4500, '+1 em Destreza'],
  ['Manoplas da Força do Ogro', 4500, '+1 em Força'],
  ['Manto da Resistência', 4500, '+2 em todos os testes de resistência'],
  ['Manto do Fascínio', 4500, '+1 em Carisma'],
  ['Pingente da Sensatez', 4500, '+1 em Sabedoria'],
  ['Torque do Vigor', 4500, '+1 em Constituição'],
  ['Chapéu do Disfarce', 6000, 'Lança Disfarce Ilusório (+20 Enganação) sem PM'],
  ['Flauta Fantasma', 6000, 'Lança Esculpir Sons sem PM'],
  ['Lanterna da Revelação', 6000, 'Revela criaturas e objetos invisíveis'],
  ['Anel da Proteção', 9000, '+2 na Defesa'],
  ['Anel do Escudo Mental', 9000, 'Imunidade a magias de adivinhação'],
  ['Pingente da Saúde', 9000, 'Imunidade a doenças e venenos'],
];

const ACESSORIOS_MEDIOS: Array<[string, number, string]> = [
  ['Anel de Telecinesia', 10500, 'Permite lançar Telecinesia'],
  ['Bola de Cristal', 10500, 'Permite lançar Vidência'],
  ['Caveira Maldita', 10500, 'Emana aura de Profanar'],
  ['Botas Aladas', 15000, 'Deslocamento de voo 12m'],
  ['Braceletes de Bronze', 16500, '+4 na Defesa (não cumulativo com armadura)'],
  ['Anel da Energia', 21000, '+5 Pontos de Mana máximos'],
  ['Anel da Vitalidade', 21000, '+10 Pontos de Vida máximos'],
  ['Anel de Invisibilidade', 21000, 'Mantém usuário sob efeito de Invisibilidade'],
  ['Braçadeiras do Arqueiro', 21000, '+2 nas rolagens de dano à distância'],
  ['Brincos de Marah', 21000, '1º atacante na cena deve passar em Vontade ou perde a ação'],
  ['Faixas do Pugilista', 21000, '+2 em ataque e dano desarmado'],
  ['Manto da Aranha', 21000, 'Escalada, imunidade a teias, +5 contra veneno e lança Teia'],
  ['Vassoura Voadora', 21000, 'Voo 12m para até 2 pessoas'],
  ['Símbolo Abençoado', 21000, '-1 PM em todas as magias divinas do deus'],
  ['Amuleto da Robustez', 25500, '+2 em Constituição'],
  ['Botas Velozes', 25500, '+3m de deslocamento e lança Velocidade'],
  ['Cinto da Força do Gigante', 25500, '+2 em Força'],
  ['Coroa Majestosa', 25500, '+2 em Carisma'],
  ['Estola da Serenidade', 25500, '+2 em Sabedoria'],
  ['Manto do Morcego', 25500, '+5 Furtividade e transforma-se em morcego'],
  ['Pulseiras da Celeridade', 25500, '+2 em Destreza'],
  ['Tiara da Sapiência', 25500, '+2 em Inteligência'],
];

const ACESSORIOS_MAIORES: Array<[string, number, string]> = [
  ['Elmo do Teletransporte', 30000, 'Lança Salto Dimensional e Teletransporte'],
  ['Gema da Telepatia', 30000, 'Lança Compreensão e Enfeitiçar sem PM'],
  ['Gema Elemental', 30000, 'Lança Conjurar Elemental sem PM'],
  ['Manual da Saúde Corporal', 30000, '+1 permanente em Constituição após 1 semana de leitura'],
  ['Manual do Bom Exercício', 30000, '+1 permanente em Força após 1 semana de leitura'],
  ['Manual dos Movimentos Precisos', 30000, '+1 permanente em Destreza após 1 semana de leitura'],
  ['Medalhão de Lena', 30000, 'Cura 100 PV automaticamente ao cair a 0 PV (1x/dia)'],
  ['Tomo da Compreensão', 30000, '+1 permanente em Sabedoria'],
  ['Tomo da Liderança e Influência', 30000, '+1 permanente em Carisma'],
  ['Tomo dos Grandes Pensamentos', 30000, '+1 permanente em Inteligência'],
  ['Anel Refletor', 51000, 'Reflete magias de volta ao conjurador'],
  ['Cinto do Campeão', 51000, '+1 Força, Briga aprimorada e Torcida +3'],
  ['Colar Guardião', 51000, '+5 na Defesa'],
  ['Estatueta Animista', 51000, 'Transforma-se em parceiro animal veterano'],
  ['Anel da Liberdade', 60000, 'Efeito permanente de Libertação'],
  ['Tapete Voador', 60000, 'Voo 12m para até 6 criaturas Médias'],
  ['Braceletes de Ouro', 64500, '+8 na Defesa (não cumulativo com armadura)'],
  ['Espelho da Oposição', 75000, 'Cria duplicata hostil de quem se olha nele'],
  ['Robe do Arquimago', 90000, '+5 + círculo máximo na Defesa e metade nas resistências'],
  ['Orbe das Tempestades', 97500, 'Lança Controlar o Clima, Fúria do Panteão e Suporte Ambiental'],
  ['Anel da Regeneração', 150000, 'Cura Acelerada 5 permanente'],
  ['Espelho do Aprisionamento', 150000, 'Aprisiona criaturas que vejam seu reflexo em semiplano'],
];

const ENCANTOS_PRECO: Record<number, number> = { 1: 18000, 2: 36000, 3: 72000 };

function rollMagico(tier: 'menor' | 'medio' | 'maior', twoDice = false): RolledLootItem {
  const d1 = rnd(1, 6);
  const d2 = twoDice ? rnd(1, 6) : d1;
  const chosenD6 = Math.max(d1, d2);
  const numEncantos = tier === 'menor' ? 1 : tier === 'medio' ? 2 : 3;
  const tierLabel = tier === 'menor' ? 'Menor' : tier === 'medio' ? 'Médio' : 'Maior';

  if (chosenD6 <= 2) {
    // Arma mágica
    const specificRoll = rnd(1, 100);
    if (specificRoll >= 91 && tier !== 'menor') {
      const spec = ARMAS_ESPECIFICAS[rnd(0, ARMAS_ESPECIFICAS.length - 1)];
      return {
        category: 'Mágico',
        name: `✨ Arma Mágica Específica: ${spec[0]}`,
        details: `${spec[2]} — Valor: T$ ${spec[1].toLocaleString('pt-BR')}`,
        valueTibares: spec[1],
        rollDebug: `1d6=${chosenD6}, Específica (${specificRoll}%)`,
      };
    }
    const baseRow = lookupD100(TABELA_8_4_ARMAS, rnd(1, 100));
    const chosenEncantos: string[] = [];
    while (chosenEncantos.length < numEncantos) {
      const enc = ENCANTOS_ARMAS[rnd(0, ENCANTOS_ARMAS.length - 1)];
      if (!chosenEncantos.includes(enc)) chosenEncantos.push(enc);
    }
    const price = baseRow[3] + ENCANTOS_PRECO[numEncantos];
    return {
      category: 'Mágico',
      name: `✨ ${baseRow[2]} Mágica (${tierLabel})`,
      details: `Encantos: ${chosenEncantos.join('; ')} — Valor: T$ ${price.toLocaleString('pt-BR')}`,
      valueTibares: price,
      rollDebug: `1d6=${chosenD6} (Arma)`,
    };
  } else if (chosenD6 === 3) {
    // Armadura / Escudo mágico
    const specificRoll = rnd(1, 100);
    if (specificRoll >= 91 && tier !== 'menor') {
      const spec = ARMADURAS_ESPECIFICAS[rnd(0, ARMADURAS_ESPECIFICAS.length - 1)];
      return {
        category: 'Mágico',
        name: `🛡️ Armadura/Escudo Específico: ${spec[0]}`,
        details: `${spec[2]} — Valor: T$ ${spec[1].toLocaleString('pt-BR')}`,
        valueTibares: spec[1],
        rollDebug: `1d6=${chosenD6}, Específico (${specificRoll}%)`,
      };
    }
    const baseRow = lookupD100(TABELA_8_4_ARMADURAS, rnd(1, 100));
    const chosenEncantos: string[] = [];
    while (chosenEncantos.length < numEncantos) {
      const enc = ENCANTOS_ARMADURAS[rnd(0, ENCANTOS_ARMADURAS.length - 1)];
      if (!chosenEncantos.includes(enc)) chosenEncantos.push(enc);
    }
    const price = baseRow[3] + ENCANTOS_PRECO[numEncantos];
    return {
      category: 'Mágico',
      name: `🛡️ ${baseRow[2]} Mágica (${tierLabel})`,
      details: `Encantos: ${chosenEncantos.join('; ')} — Valor: T$ ${price.toLocaleString('pt-BR')}`,
      valueTibares: price,
      rollDebug: `1d6=${chosenD6} (Armadura/Escudo)`,
    };
  } else {
    // Acessório mágico
    const list = tier === 'menor' ? ACESSORIOS_MENORES : tier === 'medio' ? ACESSORIOS_MEDIOS : ACESSORIOS_MAIORES;
    const acc = list[rnd(0, list.length - 1)];
    return {
      category: 'Mágico',
      name: `💍 Acessório Mágico (${tierLabel}): ${acc[0]}`,
      details: `${acc[2]} — Valor: T$ ${acc[1].toLocaleString('pt-BR')}`,
      valueTibares: acc[1],
      rollDebug: `1d6=${chosenD6} (Acessório ${tierLabel})`,
    };
  }
}

// Resolve 1 roll on Dinheiro column of Tabela 8-1 for a given ND
function resolveMoneyColumn(nd: string, d100: number): {
  coinsT$: number;
  coinsText: string;
  riquezas: RolledLootItem[];
} {
  const r: RolledLootItem[] = [];
  const pushRiquezas = (count: number, tier: 'menor' | 'media' | 'maior', plus = false) => {
    for (let i = 0; i < count; i++) r.push(rollRiqueza(tier, plus));
  };

  switch (nd) {
    case '1/4':
      if (d100 <= 30) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 70) { const x = rollDice(1, 6, 10); return { coinsT$: Math.round(x.total / 10), coinsText: `${x.total} TC (T$ ${(x.total / 10).toFixed(1)})`, riquezas: r }; }
      if (d100 <= 95) { const x = rollDice(1, 4, 100); return { coinsT$: Math.round(x.total / 10), coinsText: `${x.total} TC (T$ ${x.total / 10})`, riquezas: r }; }
      { const x = rollDice(1, 6, 10); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }

    case '1/2':
      if (d100 <= 25) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 70) { const x = rollDice(2, 6, 10); return { coinsT$: Math.round(x.total / 10), coinsText: `${x.total} TC (T$ ${x.total / 10})`, riquezas: r }; }
      if (d100 <= 95) { const x = rollDice(2, 8, 10); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      { const x = rollDice(1, 4, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }

    case '1':
      if (d100 <= 20) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 70) { const x = rollDice(3, 8, 10); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 95) { const x = rollDice(4, 12, 10); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      pushRiquezas(1, 'menor');
      return { coinsT$: 0, coinsText: '1 riqueza menor', riquezas: r };

    case '2':
      if (d100 <= 15) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 55) { const x = rollDice(3, 10, 10); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 85) { const x = rollDice(2, 4, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 95) { const x = rollDice(2, 6, 100, 1); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      pushRiquezas(1, 'menor');
      return { coinsT$: 0, coinsText: '1 riqueza menor', riquezas: r };

    case '3':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 20) { const x = rollDice(4, 12, 10); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 60) { const x = rollDice(1, 4, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 90) { const x = rollDice(1, 8, 10); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${x.total * 10})`, riquezas: r }; }
      pushRiquezas(rnd(1, 3), 'menor');
      return { coinsT$: 0, coinsText: `${r.length} riqueza(s) menor(es)`, riquezas: r };

    case '4':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 50) { const x = rollDice(1, 6, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 80) { const x = rollDice(1, 12, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 90) { pushRiquezas(1, 'menor', true); return { coinsT$: 0, coinsText: '1 riqueza menor (+20%)', riquezas: r }; }
      pushRiquezas(rnd(1, 3), 'menor', true);
      return { coinsT$: 0, coinsText: `${r.length} riqueza(s) menor(es) (+20%)`, riquezas: r };

    case '5':
      if (d100 <= 15) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 65) { const x = rollDice(1, 8, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 95) { const x = rollDice(3, 4, 10); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${x.total * 10})`, riquezas: r }; }
      pushRiquezas(1, 'media');
      return { coinsT$: 0, coinsText: '1 riqueza média', riquezas: r };

    case '6':
      if (d100 <= 15) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 60) { const x = rollDice(2, 6, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 90) { const x = rollDice(2, 10, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      pushRiquezas(rnd(1, 3) + 1, 'menor');
      return { coinsT$: 0, coinsText: `${r.length} riquezas menores`, riquezas: r };

    case '7':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 60) { const x = rollDice(2, 8, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 90) { const x = rollDice(2, 12, 10); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${x.total * 10})`, riquezas: r }; }
      pushRiquezas(rnd(1, 4) + 1, 'menor');
      return { coinsT$: 0, coinsText: `${r.length} riquezas menores`, riquezas: r };

    case '8':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 55) { const x = rollDice(2, 10, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 95) { pushRiquezas(rnd(1, 4) + 1, 'menor'); return { coinsT$: 0, coinsText: `${r.length} riquezas menores`, riquezas: r }; }
      pushRiquezas(1, 'media', true);
      return { coinsT$: 0, coinsText: '1 riqueza média (+20%)', riquezas: r };

    case '9':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 35) { pushRiquezas(1, 'media'); return { coinsT$: 0, coinsText: '1 riqueza média', riquezas: r }; }
      if (d100 <= 85) { const x = rollDice(4, 6, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      pushRiquezas(rnd(1, 3), 'media');
      return { coinsT$: 0, coinsText: `${r.length} riqueza(s) média(s)`, riquezas: r };

    case '10':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 30) { const x = rollDice(4, 6, 100); return { coinsT$: x.total, coinsText: `T$ ${x.total}`, riquezas: r }; }
      if (d100 <= 85) { const x = rollDice(4, 10, 10); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${x.total * 10})`, riquezas: r }; }
      pushRiquezas(rnd(1, 3) + 1, 'media');
      return { coinsT$: 0, coinsText: `${r.length} riquezas médias`, riquezas: r };

    case '11':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 45) { const x = rollDice(2, 4, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      if (d100 <= 85) { pushRiquezas(rnd(1, 3), 'media'); return { coinsT$: 0, coinsText: `${r.length} riqueza(s) média(s)`, riquezas: r }; }
      { const x = rollDice(2, 6, 100); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }

    case '12':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 45) { pushRiquezas(1, 'media', true); return { coinsT$: 0, coinsText: '1 riqueza média (+20%)', riquezas: r }; }
      if (d100 <= 80) { const x = rollDice(2, 6, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      pushRiquezas(rnd(1, 4) + 1, 'media');
      return { coinsT$: 0, coinsText: `${r.length} riquezas médias`, riquezas: r };

    case '13':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 45) { const x = rollDice(4, 4, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      if (d100 <= 80) { pushRiquezas(rnd(1, 3) + 1, 'media'); return { coinsT$: 0, coinsText: `${r.length} riquezas médias`, riquezas: r }; }
      { const x = rollDice(4, 6, 100); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }

    case '14':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 45) { pushRiquezas(rnd(1, 3) + 1, 'media'); return { coinsT$: 0, coinsText: `${r.length} riquezas médias`, riquezas: r }; }
      if (d100 <= 80) { const x = rollDice(3, 6, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      pushRiquezas(1, 'maior');
      return { coinsT$: 0, coinsText: '1 riqueza maior', riquezas: r };

    case '15':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 45) { pushRiquezas(1, 'media', true); return { coinsT$: 0, coinsText: '1 riqueza média (+20%)', riquezas: r }; }
      if (d100 <= 80) { const x = rollDice(2, 10, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      { const x = rollDice(1, 4, 1000); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }

    case '16':
      if (d100 <= 10) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 40) { const x = rollDice(3, 6, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      if (d100 <= 75) { const x = rollDice(3, 10, 100); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }
      pushRiquezas(rnd(1, 3), 'maior');
      return { coinsT$: 0, coinsText: `${r.length} riqueza(s) maior(es)`, riquezas: r };

    case '17':
      if (d100 <= 5) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 40) { const x = rollDice(4, 6, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      if (d100 <= 75) { pushRiquezas(rnd(1, 3), 'media', true); return { coinsT$: 0, coinsText: `${r.length} riqueza(s) média(s) (+20%)`, riquezas: r }; }
      { const x = rollDice(2, 4, 1000); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }

    case '18':
      if (d100 <= 5) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 40) { const x = rollDice(4, 10, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      if (d100 <= 75) { pushRiquezas(1, 'maior'); return { coinsT$: 0, coinsText: '1 riqueza maior', riquezas: r }; }
      pushRiquezas(rnd(1, 3) + 1, 'maior');
      return { coinsT$: 0, coinsText: `${r.length} riquezas maiores`, riquezas: r };

    case '19':
      if (d100 <= 5) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 40) { const x = rollDice(4, 12, 1000); return { coinsT$: x.total, coinsText: `T$ ${x.total.toLocaleString('pt-BR')}`, riquezas: r }; }
      if (d100 <= 75) { pushRiquezas(1, 'maior', true); return { coinsT$: 0, coinsText: '1 riqueza maior (+20%)', riquezas: r }; }
      { const x = rollDice(1, 12, 1000); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }

    default: // '20', 'S', 'S+'
      if (d100 <= 5) return { coinsT$: 0, coinsText: '—', riquezas: r };
      if (d100 <= 40) { const x = rollDice(2, 4, 1000); return { coinsT$: x.total * 10, coinsText: `${x.total} TO (T$ ${(x.total * 10).toLocaleString('pt-BR')})`, riquezas: r }; }
      if (d100 <= 75) { pushRiquezas(rnd(1, 3), 'maior'); return { coinsT$: 0, coinsText: `${r.length} riqueza(s) maior(es)`, riquezas: r }; }
      pushRiquezas(rnd(1, 3) + 1, 'maior', true);
      return { coinsT$: 0, coinsText: `${r.length} riquezas maiores (+20%)`, riquezas: r };
  }
}

// Resolve 1 roll on Itens column of Tabela 8-1 for a given ND
function resolveItemColumn(nd: string, d100: number): RolledLootItem[] {
  const out: RolledLootItem[] = [];
  const pushDiverso = () => {
    const r = rnd(1, 100);
    const row = lookupD100(TABELA_8_3_DIVERSOS, r);
    out.push({
      category: 'Diverso',
      name: `🎒 Item Diverso: ${row[2]}`,
      details: `Preço: T$ ${row[3].toLocaleString('pt-BR')}`,
      valueTibares: row[3],
      rollDebug: `Tabela 8-3 d%=${r}`,
    });
  };
  const pushEquip = (twoDice = false) => {
    const b = rollEquipamentoBase(twoDice);
    out.push({
      category: 'Equipamento',
      name: `⚔️ Equipamento: ${b.name}`,
      details: `Preço: T$ ${b.basePrice.toLocaleString('pt-BR')}`,
      valueTibares: b.basePrice,
      rollDebug: `Tabela 8-4 (${b.debug})`,
    });
  };
  const pushPocoes = (count: number, plus = false) => {
    for (let i = 0; i < count; i++) out.push(rollPocao(plus));
  };

  switch (nd) {
    case '1/4':
      if (d100 <= 50) return out;
      if (d100 <= 75) pushDiverso();
      else pushEquip();
      return out;

    case '1/2':
      if (d100 <= 45) return out;
      if (d100 <= 70) pushDiverso();
      else pushEquip();
      return out;

    case '1':
      if (d100 <= 40) return out;
      if (d100 <= 65) pushDiverso();
      else if (d100 <= 90) pushEquip();
      else pushPocoes(1);
      return out;

    case '2':
      if (d100 <= 30) return out;
      if (d100 <= 40) pushDiverso();
      else if (d100 <= 70) pushEquip();
      else if (d100 <= 90) pushPocoes(1);
      else out.push(rollSuperior(1));
      return out;

    case '3':
      if (d100 <= 25) return out;
      if (d100 <= 35) pushDiverso();
      else if (d100 <= 60) pushEquip();
      else if (d100 <= 85) pushPocoes(1);
      else out.push(rollSuperior(1));
      return out;

    case '4':
      if (d100 <= 20) return out;
      if (d100 <= 30) pushDiverso();
      else if (d100 <= 55) pushEquip(true);
      else if (d100 <= 80) pushPocoes(1, true);
      else out.push(rollSuperior(1, true));
      return out;

    case '5':
      if (d100 <= 20) return out;
      if (d100 <= 70) pushPocoes(1);
      else if (d100 <= 90) out.push(rollSuperior(1));
      else out.push(rollSuperior(2));
      return out;

    case '6':
      if (d100 <= 20) return out;
      if (d100 <= 65) pushPocoes(1, true);
      else if (d100 <= 95) out.push(rollSuperior(1));
      else out.push(rollSuperior(2, true));
      return out;

    case '7':
      if (d100 <= 20) return out;
      if (d100 <= 60) pushPocoes(rnd(1, 3));
      else if (d100 <= 90) out.push(rollSuperior(2));
      else out.push(rollSuperior(3));
      return out;

    case '8':
      if (d100 <= 20) return out;
      if (d100 <= 75) pushPocoes(rnd(1, 3));
      else if (d100 <= 95) out.push(rollSuperior(2));
      else out.push(rollSuperior(3, true));
      return out;

    case '9':
      if (d100 <= 20) return out;
      if (d100 <= 70) pushPocoes(1, true);
      else if (d100 <= 95) out.push(rollSuperior(3));
      else out.push(rollMagico('menor'));
      return out;

    case '10':
      if (d100 <= 50) return out;
      if (d100 <= 75) pushPocoes(rnd(1, 3) + 1);
      else if (d100 <= 90) out.push(rollSuperior(3));
      else out.push(rollMagico('menor'));
      return out;

    case '11':
      if (d100 <= 45) return out;
      if (d100 <= 70) pushPocoes(rnd(1, 4) + 1);
      else if (d100 <= 90) out.push(rollSuperior(3));
      else out.push(rollMagico('menor', true));
      return out;

    case '12':
      if (d100 <= 45) return out;
      if (d100 <= 70) pushPocoes(rnd(1, 3) + 1, true);
      else if (d100 <= 85) out.push(rollSuperior(4));
      else out.push(rollMagico('menor'));
      return out;

    case '13':
      if (d100 <= 40) return out;
      if (d100 <= 65) pushPocoes(rnd(1, 4) + 1, true);
      else if (d100 <= 95) out.push(rollSuperior(4));
      else out.push(rollMagico('medio'));
      return out;

    case '14':
      if (d100 <= 40) return out;
      if (d100 <= 65) pushPocoes(rnd(1, 4) + 1, true);
      else if (d100 <= 90) out.push(rollSuperior(4));
      else out.push(rollMagico('medio'));
      return out;

    case '15':
      if (d100 <= 35) return out;
      if (d100 <= 45) pushPocoes(rnd(1, 6) + 1);
      else if (d100 <= 85) out.push(rollSuperior(4, true));
      else out.push(rollMagico('medio'));
      return out;

    case '16':
      if (d100 <= 35) return out;
      if (d100 <= 45) pushPocoes(rnd(1, 6) + 1, true);
      else if (d100 <= 80) out.push(rollSuperior(4, true));
      else out.push(rollMagico('medio'));
      return out;

    case '17':
      if (d100 <= 20) return out;
      if (d100 <= 40) out.push(rollMagico('menor'));
      else if (d100 <= 80) out.push(rollMagico('medio'));
      else out.push(rollMagico('maior'));
      return out;

    case '18':
      if (d100 <= 15) return out;
      if (d100 <= 40) out.push(rollMagico('menor', true));
      else if (d100 <= 70) out.push(rollMagico('medio'));
      else out.push(rollMagico('maior'));
      return out;

    case '19':
      if (d100 <= 10) return out;
      if (d100 <= 40) out.push(rollMagico('menor', true));
      else if (d100 <= 60) out.push(rollMagico('medio', true));
      else out.push(rollMagico('maior'));
      return out;

    default: // '20', 'S', 'S+'
      if (d100 <= 5) return out;
      if (d100 <= 40) out.push(rollMagico('menor', true));
      else if (d100 <= 50) out.push(rollMagico('medio', true));
      else out.push(rollMagico('maior', true));
      return out;
  }
}

export function rollTreasureByND(
  nd: string,
  modifier: TreasureModifier = 'Padrão',
  sourceName = `Desafio ND ${nd}`
): TreasureRollResult {
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (modifier === 'Nenhum') {
    return {
      id: `loot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now,
      sourceName,
      nd,
      modifier,
      moneyRollD100: [],
      itemRollD100: [],
      coinsText: 'Nenhum tesouro (criatura não carrega posses)',
      coinsValueT$: 0,
      items: [],
      totalEstimatedT$: 0,
    };
  }

  const effectiveMod = nd === 'S' || nd === 'S+' ? 'Dobro' : modifier;
  const rollsCount = effectiveMod === 'Dobro' ? 2 : 1;
  const moneyRollD100: number[] = [];
  const itemRollD100: number[] = [];
  const items: RolledLootItem[] = [];
  let coinsValueT$ = 0;
  const coinTexts: string[] = [];

  for (let i = 0; i < rollsCount; i++) {
    const mD100 = rnd(1, 100);
    const iD100 = rnd(1, 100);
    moneyRollD100.push(mD100);
    itemRollD100.push(iD100);

    const mRes = resolveMoneyColumn(nd, mD100);
    let cVal = mRes.coinsT$;
    if (effectiveMod === 'Metade' && cVal > 0) {
      cVal = Math.floor(cVal / 2);
    }
    coinsValueT$ += cVal;
    if (mRes.coinsText !== '—') {
      coinTexts.push(effectiveMod === 'Metade' && mRes.coinsT$ > 0 ? `${mRes.coinsText} (Metade = T$ ${cVal})` : mRes.coinsText);
    }
    for (const riq of mRes.riquezas) {
      if (effectiveMod === 'Metade') {
        riq.valueTibares = Math.floor(riq.valueTibares / 2);
        riq.details += ` (Metade: T$ ${riq.valueTibares.toLocaleString('pt-BR')})`;
      }
      items.push(riq);
    }

    const iRes = resolveItemColumn(nd, iD100);
    items.push(...iRes);
  }

  const itemsTotalT$ = items.reduce((acc, it) => acc + it.valueTibares, 0);

  return {
    id: `loot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now,
    sourceName,
    nd,
    modifier: effectiveMod,
    moneyRollD100,
    itemRollD100,
    coinsText: coinTexts.length > 0 ? coinTexts.join(' + ') : 'Nenhuma moeda solta',
    coinsValueT$,
    items,
    totalEstimatedT$: coinsValueT$ + itemsTotalT$,
  };
}
