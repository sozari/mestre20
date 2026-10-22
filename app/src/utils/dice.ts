import { DiceRollEntry } from '../types';

export function parseModifier(val: string | number | undefined): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/\s+/g, '').replace('–', '-');
  // Support expressions like "4+1"
  const parts = cleaned.match(/[+-]?\d+/g);
  if (!parts) return 0;
  return parts.reduce((acc, p) => acc + parseInt(p, 10), 0);
}

export function formatSigned(n: number | string): string {
  const num = typeof n === 'number' ? n : parseModifier(n);
  return num >= 0 ? `+${num}` : `${num}`;
}

export function parseCritSpec(critStr?: string): { threat: number; mult: number } {
  if (!critStr) return { threat: 20, mult: 2 };
  const s = critStr.toLowerCase().trim();
  let threat = 20;
  let mult = 2;

  const threatMatch = s.match(/(\d{2})(?:\s*[-/]|$)/);
  if (threatMatch) {
    const t = parseInt(threatMatch[1], 10);
    if (t >= 10 && t <= 20) threat = t;
  }
  const multMatch = s.match(/x\s*(\d+)/);
  if (multMatch) {
    mult = parseInt(multMatch[1], 10);
  }
  return { threat, mult };
}

export function rollFormula(
  formulaInput: string,
  options?: {
    actor?: string;
    label?: string;
    critThreat?: number;
    critMult?: number;
    multiplyDiceBy?: number; // Para dano crítico em T20 (multiplica apenas os dados!)
    secret?: boolean;
    detail?: string;
  }
): DiceRollEntry {
  const clean = (formulaInput || '1d20').replace(/\s+/g, '').replace(/–/g, '-').toLowerCase();
  const diceMult = options?.multiplyDiceBy && options.multiplyDiceBy > 1 ? options.multiplyDiceBy : 1;

  // Tokenize terms like +2d6, -1d4, +5, -2
  const tokens = clean.match(/[+-]?[^+-]+/g) || ['1d20'];

  const allRolls: number[] = [];
  let flatMod = 0;
  let total = 0;
  let isD20 = false;
  let naturalD20: number | undefined;

  for (const tok of tokens) {
    const sign = tok.startsWith('-') ? -1 : 1;
    const unsigned = tok.replace(/^[+-]/, '');

    if (unsigned.includes('d')) {
      const [cntStr, facesRaw] = unsigned.split('d');
      const baseCount = cntStr ? Math.max(1, Math.min(100, parseInt(cntStr, 10) || 1)) : 1;
      const count = baseCount * diceMult;
      const faces = facesRaw === '%' ? 100 : Math.max(2, Math.min(1000, parseInt(facesRaw, 10) || 20));

      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * faces) + 1;
        allRolls.push(r * sign);
        total += r * sign;
        if (faces === 20 && naturalD20 === undefined && sign === 1) {
          isD20 = true;
          naturalD20 = r;
        }
      }
    } else {
      const n = parseInt(unsigned, 10);
      if (!isNaN(n)) {
        flatMod += n * sign;
        total += n * sign;
      }
    }
  }

  const threat = options?.critThreat ?? 20;
  const isCrit = isD20 && naturalD20 !== undefined && naturalD20 >= threat;
  const isFumble = isD20 && naturalD20 === 1;

  return {
    id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    actor: options?.actor || 'Mestre',
    label: options?.label || 'Rolagem',
    formula: diceMult > 1 ? `${formulaInput} (Crítico x${diceMult} nos dados)` : formulaInput,
    rolls: allRolls,
    modifier: flatMod,
    total,
    isD20,
    naturalD20,
    isCrit,
    isFumble,
    secret: options?.secret,
    detail: options?.detail,
  };
}

export function rollD20Test(
  actor: string,
  label: string,
  bonusVal: string | number,
  options?: { critSpec?: string; secret?: boolean; cd?: number }
): DiceRollEntry {
  const mod = parseModifier(bonusVal);
  const { threat } = parseCritSpec(options?.critSpec);
  const formula = `1d20${mod >= 0 ? `+${mod}` : mod}`;
  const entry = rollFormula(formula, {
    actor,
    label,
    critThreat: threat,
    secret: options?.secret,
  });

  if (options?.cd && options.cd > 0) {
    const passed = entry.isCrit || (!entry.isFumble && entry.total >= options.cd);
    entry.detail = `CD ${options.cd}: ${passed ? 'SUCESSO ✓' : 'FALHA ✗'}`;
  }
  return entry;
}

// Regra Oficial de T20 Jogo do Ano (pág. 17) — Tabela 1-1: Atributos
export function rollT20AttributeSet(): Array<{ dice: number[]; sum3: number; mod: number }> {
  const convertSumToMod = (sum: number): number => {
    if (sum <= 7) return -2;
    if (sum <= 9) return -1;
    if (sum <= 11) return 0;
    if (sum <= 13) return 1;
    if (sum <= 15) return 2;
    if (sum <= 17) return 3;
    return 4;
  };

  const rollOne = () => {
    const dice = [1, 2, 3, 4].map(() => Math.floor(Math.random() * 6) + 1);
    const sorted = [...dice].sort((a, b) => a - b);
    const sum3 = sorted[1] + sorted[2] + sorted[3];
    return { dice, sum3, mod: convertSumToMod(sum3) };
  };

  const set = [1, 2, 3, 4, 5, 6].map(() => rollOne());
  // Regra do Livro Básico pág. 17: "Caso seus atributos não somem pelo menos 6, role novamente o menor valor."
  let guard = 0;
  while (set.reduce((acc, s) => acc + s.mod, 0) < 6 && guard < 30) {
    guard++;
    let minIdx = 0;
    for (let i = 1; i < set.length; i++) {
      if (set[i].sum3 < set[minIdx].sum3) minIdx = i;
    }
    set[minIdx] = rollOne();
  }
  return set;
}

// Cálculo oficial do ND do Combate (Livro Básico pág. 282)
export function parseNdNumeric(nd: string): number {
  const s = (nd || '1').trim();
  if (s === '1/4' || s === '0.25') return 0.25;
  if (s === '1/2' || s === '0.5') return 0.5;
  const n = parseFloat(s);
  return isNaN(n) ? 1 : n;
}

export function calculateEncounterStats(ndStrings: string[], partySize: number): {
  encounterNd: string;
  totalXp: number;
  xpPerPlayer: number;
} {
  if (ndStrings.length === 0) {
    return { encounterNd: '0', totalXp: 0, xpPerPlayer: 0 };
  }

  const numericNds = ndStrings.map(parseNdNumeric);
  // XP: No T20, cada criatura derrotada concede (ND * 1.000) XP divididos pelo grupo (ou 1.000 XP por ponto de ND para o grupo)
  const totalNdSum = numericNds.reduce((acc, n) => acc + n, 0);
  const totalXp = Math.round(totalNdSum * 1000);
  const xpPerPlayer = Math.round(totalXp / Math.max(1, partySize));

  // Regra pág. 282:
  // Criaturas com ND < 1: ND = ND * quantidade
  // Criaturas com ND >= 1: ND + 2 para cada vez que a quantidade dobrar
  const maxNd = Math.max(...numericNds);
  let encounterNdNum = 0;
  if (maxNd < 1) {
    encounterNdNum = totalNdSum;
  } else {
    // Aproximação combinada por potência equivalendo ao dobro (+2 ND)
    const countGe1 = numericNds.filter((n) => n >= 1).length;
    const highest = Math.max(...numericNds);
    const doublings = countGe1 > 1 ? Math.floor(Math.log2(countGe1) * 2) : 0;
    encounterNdNum = highest + doublings;
  }

  const formattedNd =
    encounterNdNum === 0.25
      ? '1/4'
      : encounterNdNum === 0.5
      ? '1/2'
      : String(Math.round(encounterNdNum * 10) / 10);

  return {
    encounterNd: formattedNd,
    totalXp,
    xpPerPlayer,
  };
}
