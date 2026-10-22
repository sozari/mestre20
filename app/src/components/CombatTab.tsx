import React, { useState } from 'react';
import { Campaign, Combatant, PlayerCharacter, ThreatSheet } from '../types';
import { DEFAULT_BESTIARY, T20_CONDITIONS } from '../data/t20Database';
import { FULL_BESTIARY } from '../data/bestiaryData';
import {
  calculateEncounterStats,
  parseCritSpec,
  parseModifier,
  rollD20Test,
  rollFormula,
} from '../utils/dice';
import {
  Swords,
  Play,
  SkipForward,
  RotateCcw,
  Plus,
  Trash2,
  Shield,
  Heart,
  Zap,
  Dices,
  Users,
  Skull,
  Search,
  Sparkles,
  Flame,
} from 'lucide-react';

interface CombatTabProps {
  campaign: Campaign;
  onUpdateCampaign: (patch: Partial<Campaign>) => void;
  onAddRoll: (roll: ReturnType<typeof rollFormula>) => void;
}

export const CombatTab: React.FC<CombatTabProps> = ({
  campaign,
  onUpdateCampaign,
  onAddRoll,
}) => {
  const { combat, players, customThreats } = campaign;
  const allThreats = [...customThreats, ...DEFAULT_BESTIARY, ...FULL_BESTIARY];

  const [searchThreat, setSearchThreat] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [spawnCount, setSpawnCount] = useState<Record<string, number>>({});
  const [customDmgInput, setCustomDmgInput] = useState<Record<string, string>>({});
  const [condRoundInput, setCondRoundInput] = useState<Record<string, string>>({});

  // Formulário de Nova Ameaça Rápida
  const [showNewThreatForm, setShowNewThreatForm] = useState(false);
  const [newThreat, setNewThreat] = useState<{
    name: string;
    nd: string;
    role: 'Solo' | 'Lacaio' | 'Especial';
    pvMax: number;
    pmMax: number;
    defesa: number;
    iniciativa: number;
    fortitude: number;
    reflexos: number;
    vontade: number;
    atkName: string;
    atkBonus: number;
    atkDamage: string;
    atkCrit: string;
    abilities: string;
  }>({
    name: 'Inimigo Personalizado',
    nd: '2',
    role: 'Solo',
    pvMax: 55,
    pmMax: 10,
    defesa: 18,
    iniciativa: 5,
    fortitude: 9,
    reflexos: 6,
    vontade: 4,
    atkName: 'Golpe Principal',
    atkBonus: 11,
    atkDamage: '1d10+8',
    atkCrit: '19/x2',
    abilities: '',
  });

  const updateCombat = (patch: Partial<Campaign['combat']>) => {
    onUpdateCampaign({
      combat: {
        ...combat,
        ...patch,
      },
    });
  };

  const syncPlayerToSheet = (c: Combatant) => {
    if (!c.isPlayer) return;
    const nextPlayers = players.map((p) =>
      p.id === c.sourceId
        ? {
            ...p,
            pvCurrent: c.pvCurrent,
            pvTemp: c.pvTemp,
            pmCurrent: c.pmCurrent,
            conditions: c.conditions.map((cond) => cond.name),
          }
        : p
    );
    onUpdateCampaign({ players: nextPlayers });
  };

  const addPlayersToCombat = (autoRollInit: boolean) => {
    const existingPlayerIds = new Set(
      combat.combatants.filter((c) => c.isPlayer).map((c) => c.sourceId)
    );
    const added: Combatant[] = [];

    players.forEach((pj, idx) => {
      if (existingPlayerIds.has(pj.id)) return;
      const initBonus = parseModifier(pj.iniciativa);
      let initTotal = initBonus;
      if (autoRollInit) {
        const r = rollD20Test(pj.name, 'Iniciativa', initBonus);
        onAddRoll(r);
        initTotal = r.total;
      }
      added.push({
        id: `comb-pj-${pj.id}-${Date.now()}`,
        sourceId: pj.id,
        name: pj.name,
        isPlayer: true,
        initiativeRoll: initTotal,
        initiativeBonus: initBonus,
        pvCurrent: pj.pvCurrent,
        pvMax: pj.pvMax,
        pvTemp: pj.pvTemp,
        pmCurrent: pj.pmCurrent,
        pmMax: pj.pmMax,
        defesa: parseModifier(pj.defesa) || 10,
        fortitude: parseModifier(pj.fortitude),
        reflexos: parseModifier(pj.reflexos),
        vontade: parseModifier(pj.vontade),
        rd: pj.rd,
        sizeCategory: pj.size,
        conditions: pj.conditions.map((name) => ({ name })),
        attacks: pj.attacks.map((a) => ({
          name: a.name,
          bonus: parseModifier(a.bonus),
          damage: a.damage,
          crit: a.crit,
        })),
        abilitiesSummary: pj.powersAndSpells,
        notes: pj.notes,
        color: pj.color || '#e11d48',
        gridX: 2,
        gridY: 2 + idx * 2,
      });
    });

    const merged = [...combat.combatants, ...added].sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll || b.initiativeBonus - a.initiativeBonus
    );
    updateCombat({ active: true, combatants: merged });
  };

  const addThreatToCombat = (threat: ThreatSheet, count: number) => {
    // Regra Livro Básico pág. 231: "O mestre faz um único teste de Iniciativa para os inimigos"
    const initEntry = rollD20Test(threat.name, 'Iniciativa (Inimigo)', threat.iniciativa, {
      secret: true,
    });
    onAddRoll(initEntry);

    const created: Combatant[] = [];
    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? ` #${i + 1}` : '';
      created.push({
        id: `comb-mob-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        sourceId: threat.id,
        name: `${threat.name}${suffix}`,
        isPlayer: false,
        role: threat.role,
        nd: threat.nd,
        initiativeRoll: initEntry.total,
        initiativeBonus: threat.iniciativa,
        pvCurrent: threat.pvMax,
        pvMax: threat.pvMax,
        pvTemp: 0,
        pmCurrent: threat.pmMax,
        pmMax: threat.pmMax,
        defesa: threat.defesa,
        fortitude: threat.fortitude,
        reflexos: threat.reflexos,
        vontade: threat.vontade,
        rd: threat.resistances,
        sizeCategory: threat.sizeCategory,
        conditions: [],
        attacks: threat.attacks,
        abilitiesSummary: threat.abilities,
        notes: threat.equipmentAndTreasure || '',
        color:
          threat.role === 'Solo'
            ? '#dc2626'
            : threat.role === 'Especial'
            ? '#a855f7'
            : '#ea580c',
        gridX: Math.min(15, 10 + (i % 5)),
        gridY: Math.min(10, 2 + i * 2),
      });
    }

    const merged = [...combat.combatants, ...created].sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll || b.initiativeBonus - a.initiativeBonus
    );
    updateCombat({ active: true, combatants: merged });
  };

  const sortByInitiative = () => {
    const sorted = [...combat.combatants].sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll || b.initiativeBonus - a.initiativeBonus
    );
    updateCombat({ combatants: sorted, turnIndex: 0 });
  };

  const rerollAllInitiatives = () => {
    const updated = combat.combatants.map((c) => {
      const r = rollD20Test(c.name, 'Iniciativa', c.initiativeBonus);
      onAddRoll(r);
      return { ...c, initiativeRoll: r.total };
    });
    updated.sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll || b.initiativeBonus - a.initiativeBonus
    );
    updateCombat({ active: true, round: 1, turnIndex: 0, combatants: updated });
  };

  const nextTurn = () => {
    if (combat.combatants.length === 0) return;
    let nextIdx = combat.turnIndex + 1;
    let nextRound = combat.round;
    if (nextIdx >= combat.combatants.length) {
      nextIdx = 0;
      nextRound += 1;
    }

    // Decrementa condições com duração em rodadas da criatura cujo turno está começando
    const targetId = combat.combatants[nextIdx]?.id;
    const nextCombatants = combat.combatants.map((c) => {
      if (c.id !== targetId) return c;
      const nextConds = c.conditions
        .map((cond) =>
          cond.roundsLeft !== undefined ? { ...cond, roundsLeft: cond.roundsLeft - 1 } : cond
        )
        .filter((cond) => cond.roundsLeft === undefined || cond.roundsLeft > 0);
      return { ...c, conditions: nextConds };
    });

    updateCombat({
      active: true,
      round: nextRound,
      turnIndex: nextIdx,
      combatants: nextCombatants,
    });
  };

  const updateCombatant = (id: string, patch: Partial<Combatant>) => {
    const nextList = combat.combatants.map((c) => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch };
      return updated;
    });
    const changed = nextList.find((c) => c.id === id);

    if (changed && changed.isPlayer) {
      const nextPlayers = players.map((p) =>
        p.id === changed.sourceId
          ? {
              ...p,
              pvCurrent: changed.pvCurrent,
              pvTemp: changed.pvTemp,
              pmCurrent: changed.pmCurrent,
              conditions: changed.conditions.map((cond) => cond.name),
            }
          : p
      );
      onUpdateCampaign({
        players: nextPlayers,
        combat: { ...combat, combatants: nextList },
      });
    } else {
      updateCombat({ combatants: nextList });
    }
  };

  const adjustCombatantPv = (c: Combatant, delta: number) => {
    let nextTemp = c.pvTemp;
    let nextPv = c.pvCurrent;
    if (delta < 0) {
      const dmg = Math.abs(delta);
      const absorbed = Math.min(nextTemp, dmg);
      nextTemp -= absorbed;
      nextPv -= dmg - absorbed;
    } else {
      nextPv = Math.min(c.pvMax, nextPv + delta);
    }

    let nextConds = [...c.conditions];
    if (c.isPlayer) {
      if (nextPv <= 0 && !nextConds.some((cd) => cd.name === 'Sangrando')) {
        nextConds.push({ name: 'Sangrando' });
      } else if (nextPv > 0 && nextConds.some((cd) => cd.name === 'Sangrando')) {
        nextConds = nextConds.filter((cd) => cd.name !== 'Sangrando');
      }
    }
    updateCombatant(c.id, { pvCurrent: nextPv, pvTemp: nextTemp, conditions: nextConds });
  };

  const createCustomThreat = (addToFight: boolean) => {
    const created: ThreatSheet = {
      id: `custom-threat-${Date.now()}`,
      name: newThreat.name || 'Ameaça',
      nd: newThreat.nd || '1',
      role: newThreat.role,
      typeAndSize: 'Criatura Média',
      sizeCategory: 'Médio',
      category: 'Custom',
      iniciativa: Number(newThreat.iniciativa) || 0,
      percepcao: Number(newThreat.iniciativa) || 0,
      senses: 'Normal',
      defesa: Number(newThreat.defesa) || 15,
      fortitude: Number(newThreat.fortitude) || 5,
      reflexos: Number(newThreat.reflexos) || 5,
      vontade: Number(newThreat.vontade) || 5,
      pvMax: Number(newThreat.pvMax) || 30,
      pmMax: Number(newThreat.pmMax) || 0,
      deslocamento: '9m (6q)',
      attacks: [
        {
          name: newThreat.atkName || 'Ataque',
          bonus: Number(newThreat.atkBonus) || 8,
          damage: newThreat.atkDamage || '1d8+4',
          crit: newThreat.atkCrit || '20/x2',
        },
      ],
      abilities: newThreat.abilities,
      forca: '2',
      destreza: '2',
      constituicao: '2',
      inteligencia: '0',
      sabedoria: '0',
      carisma: '0',
    };

    const nextCustom = [created, ...customThreats];
    if (addToFight) {
      onUpdateCampaign({ customThreats: nextCustom });
      setTimeout(() => addThreatToCombat(created, 1), 20);
    } else {
      onUpdateCampaign({ customThreats: nextCustom });
    }
    setShowNewThreatForm(false);
  };

  // Cálculo de ND e XP dos inimigos presentes no combate
  const enemyNds = combat.combatants
    .filter((c) => !c.isPlayer && c.nd)
    .map((c) => c.nd as string);
  const encounterStats = calculateEncounterStats(enemyNds, Math.max(1, players.length));

  const categories = [
    'Todas',
    'Masmorras',
    'Ermos',
    'Puristas',
    'Reino dos Mortos',
    'Duyshidakk',
    'Trolls Nobres',
    'Dragões',
    'Tormenta',
    'Custom',
  ];

  const filteredThreats = allThreats.filter((t) => {
    if (categoryFilter !== 'Todas' && t.category !== categoryFilter) return false;
    if (!searchThreat.trim()) return true;
    const q = searchThreat.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.nd.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q)
    );
  });

  const activeTurnCombatant = combat.combatants[combat.turnIndex];

  return (
    <div className="combat-layout">
      {/* COLUNA ESQUERDA: RASTREADOR DE INICIATIVA E COMBATE ATIVO */}
      <div className="combat-tracker-panel">
        <div className="t20-toolbar combat-toolbar">
          <div className="toolbar-group">
            <span className="round-badge">
              <Swords size={16} /> RODADA {combat.round}
            </span>
            <button className="btn-t20 btn-primary" onClick={nextTurn}>
              <SkipForward size={15} /> Próximo Turno
            </button>
            <button
              className="btn-t20 btn-orange"
              onClick={rerollAllInitiatives}
              title="Rolar 1d20 + Iniciativa de todos no combate e ordenar"
            >
              <Dices size={15} /> Rolar Iniciativas
            </button>
            <button
              className="btn-t20 btn-secondary"
              onClick={sortByInitiative}
              title="Ordenar pela Iniciativa digitada"
            >
              Ordenar
            </button>
          </div>

          <div className="toolbar-group">
            <button
              className="btn-t20 btn-ghost"
              onClick={() => addPlayersToCombat(true)}
              title="Adicionar todos os jogadores da mesa já rolando Iniciativa"
            >
              <Users size={15} /> + PJs (Rolando Ini)
            </button>
            <button
              className="btn-t20 btn-ghost"
              onClick={() =>
                updateCombat({
                  round: 1,
                  turnIndex: 0,
                  combatants: combat.combatants.filter((c) => c.isPlayer),
                })
              }
              title="Remover todos os monstros e reiniciar rodada"
            >
              Limpar Inimigos
            </button>
            <button
              className="btn-t20 btn-danger-outline"
              onClick={() => {
                if (window.confirm('Encerrar e limpar todo o rastreador de combate?')) {
                  updateCombat({ active: false, round: 1, turnIndex: 0, combatants: [] });
                }
              }}
            >
              <RotateCcw size={14} /> Zerar
            </button>
          </div>
        </div>

        {/* Calculadora Automática de ND do Combate & XP (Livro Básico pág. 282 e 326) */}
        <div className="nd-banner">
          <div>
            <strong>Inimigos em Cena:</strong> {enemyNds.length}
          </div>
          <div>
            <strong>ND do Encontro (pág. 282):</strong>{' '}
            <span className="text-orange">{encounterStats.encounterNd}</span>
          </div>
          <div>
            <strong>XP Total:</strong> {encounterStats.totalXp} XP
          </div>
          <div>
            <strong>XP por Jogador ({players.length} PJs):</strong>{' '}
            <span className="text-gold">{encounterStats.xpPerPlayer} XP</span>
          </div>
        </div>

        {/* Lista de Combatentes */}
        {combat.combatants.length === 0 ? (
          <div className="empty-combat-box">
            <Swords size={38} className="text-red" />
            <h3>Nenhum combatente na iniciativa</h3>
            <p>
              Clique em <strong>"+ PJs (Rolando Ini)"</strong> acima para puxar os jogadores da mesa
              e escolha ameaças no <strong>Bestiário</strong> ao lado para começar a batalha!
            </p>
          </div>
        ) : (
          <div className="combatants-list">
            {combat.combatants.map((c, idx) => {
              const isTurn = idx === combat.turnIndex;
              const isDeadOrDown = c.pvCurrent <= 0;
              const pvPct = Math.max(
                0,
                Math.min(100, Math.round((c.pvCurrent / Math.max(1, c.pvMax)) * 100))
              );

              return (
                <div
                  key={c.id}
                  className={`combatant-row ${isTurn ? 'combatant-active-turn' : ''} ${
                    isDeadOrDown ? 'combatant-down' : ''
                  }`}
                  style={{ borderLeftColor: c.color }}
                >
                  {/* Coluna Iniciativa */}
                  <div className="comb-init-col">
                    <span className="init-label">INI</span>
                    <input
                      type="number"
                      className="comb-init-input"
                      value={c.initiativeRoll}
                      onChange={(e) =>
                        updateCombatant(c.id, {
                          initiativeRoll: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      title="Valor da Iniciativa (edite se o jogador rolou no dado físico)"
                    />
                    <button
                      className="btn-reroll-mini"
                      title="Rolar Iniciativa individual"
                      onClick={() => {
                        const r = rollD20Test(c.name, 'Iniciativa', c.initiativeBonus);
                        onAddRoll(r);
                        updateCombatant(c.id, { initiativeRoll: r.total });
                      }}
                    >
                      <Dices size={11} />
                    </button>
                  </div>

                  {/* Coluna Principal */}
                  <div className="comb-main-col">
                    <div className="comb-top-line">
                      <div className="comb-title-group">
                        {isTurn && <span className="turn-indicator">▶ TURNO ATUAL</span>}
                        <input
                          type="text"
                          className="comb-name-input"
                          value={c.name}
                          onChange={(e) => updateCombatant(c.id, { name: e.target.value })}
                        />
                        <span className={`role-tag ${c.isPlayer ? 'tag-pj' : 'tag-mob'}`}>
                          {c.isPlayer ? 'JOGADOR' : `${c.role || 'Ameaça'} • ND ${c.nd || '1'}`}
                        </span>
                        {isDeadOrDown && (
                          <span className="down-badge">
                            <Skull size={12} /> {c.isPlayer ? 'CAÍDO / SANGRANDO' : 'DERROTADO'}
                          </span>
                        )}
                      </div>

                      {/* Defesa e Resistências Rápidas */}
                      <div className="comb-defenses">
                        <span className="def-chip" title="Defesa">
                          <Shield size={12} /> Def{' '}
                          <input
                            type="number"
                            value={c.defesa}
                            onChange={(e) =>
                              updateCombatant(c.id, {
                                defesa: parseInt(e.target.value, 10) || 10,
                              })
                            }
                          />
                        </span>
                        <button
                          className="save-chip"
                          onClick={() =>
                            onAddRoll(rollD20Test(c.name, 'Fortitude', c.fortitude))
                          }
                        >
                          Fort {c.fortitude >= 0 ? `+${c.fortitude}` : c.fortitude}
                        </button>
                        <button
                          className="save-chip"
                          onClick={() =>
                            onAddRoll(rollD20Test(c.name, 'Reflexos', c.reflexos))
                          }
                        >
                          Ref {c.reflexos >= 0 ? `+${c.reflexos}` : c.reflexos}
                        </button>
                        <button
                          className="save-chip"
                          onClick={() =>
                            onAddRoll(rollD20Test(c.name, 'Vontade', c.vontade))
                          }
                        >
                          Von {c.vontade >= 0 ? `+${c.vontade}` : c.vontade}
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          title="Remover do combate"
                          onClick={() =>
                            updateCombat({
                              combatants: combat.combatants.filter((item) => item.id !== c.id),
                            })
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Barra de PV e PM em Combate */}
                    <div className="comb-resources-line">
                      <div className="comb-pv-box">
                        <Heart size={13} className="text-red" />
                        <input
                          type="number"
                          className="comb-res-input"
                          value={c.pvCurrent}
                          onChange={(e) =>
                            updateCombatant(c.id, {
                              pvCurrent: parseInt(e.target.value, 10) || 0,
                            })
                          }
                        />
                        <span>/ {c.pvMax} PV</span>
                        <div className="comb-mini-bar">
                          <div className="pv-fill" style={{ width: `${pvPct}%` }} />
                        </div>
                        <button className="step-mini" onClick={() => adjustCombatantPv(c, -5)}>
                          -5
                        </button>
                        <button className="step-mini" onClick={() => adjustCombatantPv(c, -1)}>
                          -1
                        </button>
                        <input
                          type="number"
                          placeholder="Dano/Cura"
                          className="comb-delta-input"
                          value={customDmgInput[c.id] || ''}
                          onChange={(e) =>
                            setCustomDmgInput((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                        />
                        <button
                          className="step-mini btn-dmg"
                          onClick={() => {
                            const v = parseInt(customDmgInput[c.id] || '0', 10);
                            if (v) adjustCombatantPv(c, -Math.abs(v));
                          }}
                        >
                          Dano
                        </button>
                        <button
                          className="step-mini btn-heal"
                          onClick={() => {
                            const v = parseInt(customDmgInput[c.id] || '0', 10);
                            if (v) adjustCombatantPv(c, Math.abs(v));
                          }}
                        >
                          Cura
                        </button>
                        <button className="step-mini" onClick={() => adjustCombatantPv(c, 5)}>
                          +5
                        </button>
                      </div>

                      {c.pmMax > 0 && (
                        <div className="comb-pm-box">
                          <Zap size={13} className="text-blue" />
                          <input
                            type="number"
                            className="comb-res-input"
                            value={c.pmCurrent}
                            onChange={(e) =>
                              updateCombatant(c.id, {
                                pmCurrent: parseInt(e.target.value, 10) || 0,
                              })
                            }
                          />
                          <span>/ {c.pmMax} PM</span>
                          <button
                            className="step-mini"
                            onClick={() =>
                              updateCombatant(c.id, {
                                pmCurrent: Math.max(0, c.pmCurrent - 1),
                              })
                            }
                          >
                            -1
                          </button>
                          <button
                            className="step-mini"
                            onClick={() =>
                              updateCombatant(c.id, {
                                pmCurrent: Math.min(c.pmMax, c.pmCurrent + 1),
                              })
                            }
                          >
                            +1
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ataque Rápido do Combatente */}
                    {c.attacks.length > 0 && (
                      <div className="comb-attacks-bar">
                        {c.attacks.map((atq, aIdx) => {
                          const crit = parseCritSpec(atq.crit);
                          return (
                            <div key={aIdx} className="comb-atq-pill">
                              <strong>{atq.name}</strong>
                              <button
                                className="btn-atq-roll"
                                onClick={() =>
                                  onAddRoll(
                                    rollD20Test(c.name, `Ataque: ${atq.name}`, atq.bonus, {
                                      critSpec: atq.crit,
                                    })
                                  )
                                }
                              >
                                <Dices size={11} /> {atq.bonus >= 0 ? `+${atq.bonus}` : atq.bonus}
                              </button>
                              <button
                                className="btn-dmg-roll"
                                onClick={() =>
                                  onAddRoll(
                                    rollFormula(atq.damage, {
                                      actor: c.name,
                                      label: `Dano: ${atq.name}`,
                                      detail: atq.extra,
                                    })
                                  )
                                }
                              >
                                {atq.damage}
                              </button>
                              <button
                                className="btn-crit-roll"
                                title={`Rolar Dano Crítico (multiplica os dados por x${crit.mult})`}
                                onClick={() =>
                                  onAddRoll(
                                    rollFormula(atq.damage, {
                                      actor: c.name,
                                      label: `CRÍTICO: ${atq.name}`,
                                      multiplyDiceBy: crit.mult,
                                      detail: atq.extra,
                                    })
                                  )
                                }
                              >
                                x{crit.mult}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {c.abilitiesSummary && (
                      <div className="comb-abilities-note">{c.abilitiesSummary}</div>
                    )}

                    {/* Condições com Duração em Rodadas */}
                    <div className="comb-conditions-line">
                      {c.conditions.map((cond, cIdx) => {
                        const info = T20_CONDITIONS.find((item) => item.name === cond.name);
                        return (
                          <span
                            key={cIdx}
                            className="cond-badge"
                            title={info ? `${info.name}: ${info.description}` : cond.name}
                          >
                            {cond.name}
                            {cond.roundsLeft !== undefined && (
                              <strong> ({cond.roundsLeft} rod)</strong>
                            )}
                            <button
                              onClick={() =>
                                updateCombatant(c.id, {
                                  conditions: c.conditions.filter((_, i) => i !== cIdx),
                                })
                              }
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}

                      <div className="comb-add-cond">
                        <input
                          type="number"
                          placeholder="Rod"
                          className="cond-rounds-input"
                          title="Duração em rodadas (vazio = até o fim da cena)"
                          value={condRoundInput[c.id] || ''}
                          onChange={(e) =>
                            setCondRoundInput((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                        />
                        <select
                          className="cond-select"
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const rLeft = parseInt(condRoundInput[c.id] || '', 10);
                            updateCombatant(c.id, {
                              conditions: [
                                ...c.conditions,
                                {
                                  name: val,
                                  roundsLeft: !isNaN(rLeft) && rLeft > 0 ? rLeft : undefined,
                                },
                              ],
                            });
                          }}
                        >
                          <option value="">+ Condição...</option>
                          {T20_CONDITIONS.map((item) => (
                            <option key={item.name} value={item.name}>
                              {item.name} ({item.summary})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COLUNA DIREITA: BESTIÁRIO DE AMEAÇAS (LIVRO BÁSICO + CUSTOM) */}
      <div className="bestiary-panel">
        <div className="bestiary-header">
          <div>
            <h3>
              <Flame size={17} className="text-orange" /> Bestiário & Ameaças
            </h3>
            <small>Fichas oficiais do Livro Básico + Ameaças do Mestre</small>
          </div>
          <button
            className="btn-t20 btn-primary btn-xs"
            onClick={() => setShowNewThreatForm(!showNewThreatForm)}
          >
            <Plus size={14} /> {showNewThreatForm ? 'Fechar' : 'Criar Ameaça/NPC'}
          </button>
        </div>

        {/* Formulário de Criação Rápida de Ameaça */}
        {showNewThreatForm && (
          <div className="new-threat-card">
            <h4>Criar Ameaça ou NPC de Combate</h4>
            <div className="threat-form-grid">
              <input
                type="text"
                placeholder="Nome (ex: Capitão Mercenário)"
                value={newThreat.name}
                onChange={(e) => setNewThreat({ ...newThreat, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="ND (ex: 3)"
                value={newThreat.nd}
                onChange={(e) => setNewThreat({ ...newThreat, nd: e.target.value })}
              />
              <select
                value={newThreat.role}
                onChange={(e) => setNewThreat({ ...newThreat, role: e.target.value as any })}
              >
                <option value="Solo">Solo</option>
                <option value="Lacaio">Lacaio</option>
                <option value="Especial">Especial</option>
              </select>
              <label>
                PV:
                <input
                  type="number"
                  value={newThreat.pvMax}
                  onChange={(e) =>
                    setNewThreat({ ...newThreat, pvMax: parseInt(e.target.value, 10) || 10 })
                  }
                />
              </label>
              <label>
                Defesa:
                <input
                  type="number"
                  value={newThreat.defesa}
                  onChange={(e) =>
                    setNewThreat({ ...newThreat, defesa: parseInt(e.target.value, 10) || 10 })
                  }
                />
              </label>
              <label>
                Iniciativa:
                <input
                  type="number"
                  value={newThreat.iniciativa}
                  onChange={(e) =>
                    setNewThreat({ ...newThreat, iniciativa: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </label>
              <label>
                Fort:
                <input
                  type="number"
                  value={newThreat.fortitude}
                  onChange={(e) =>
                    setNewThreat({ ...newThreat, fortitude: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </label>
              <label>
                Ref:
                <input
                  type="number"
                  value={newThreat.reflexos}
                  onChange={(e) =>
                    setNewThreat({ ...newThreat, reflexos: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </label>
              <label>
                Von:
                <input
                  type="number"
                  value={newThreat.vontade}
                  onChange={(e) =>
                    setNewThreat({ ...newThreat, vontade: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </label>
              <input
                type="text"
                placeholder="Nome do Ataque"
                value={newThreat.atkName}
                onChange={(e) => setNewThreat({ ...newThreat, atkName: e.target.value })}
              />
              <input
                type="number"
                placeholder="Bônus Atq (+10)"
                value={newThreat.atkBonus}
                onChange={(e) =>
                  setNewThreat({ ...newThreat, atkBonus: parseInt(e.target.value, 10) || 0 })
                }
              />
              <input
                type="text"
                placeholder="Dano (2d6+8)"
                value={newThreat.atkDamage}
                onChange={(e) => setNewThreat({ ...newThreat, atkDamage: e.target.value })}
              />
            </div>
            <textarea
              rows={2}
              placeholder="Habilidades especiais, RD, magias..."
              value={newThreat.abilities}
              onChange={(e) => setNewThreat({ ...newThreat, abilities: e.target.value })}
            />
            <div className="threat-form-actions">
              <button
                className="btn-t20 btn-orange btn-xs"
                onClick={() => createCustomThreat(true)}
              >
                Salvar e Jogar no Combate
              </button>
              <button
                className="btn-t20 btn-secondary btn-xs"
                onClick={() => createCustomThreat(false)}
              >
                Apenas Salvar no Bestiário
              </button>
            </div>
          </div>
        )}

        {/* Busca e Filtro do Bestiário */}
        <div className="bestiary-filters">
          <div className="search-input-wrap">
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar monstro por nome, ND, papel..."
              value={searchThreat}
              onChange={(e) => setSearchThreat(e.target.value)}
            />
          </div>
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${categoryFilter === cat ? 'cat-pill-active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Fichas de Criaturas */}
        <div className="bestiary-list">
          {filteredThreats.map((threat) => {
            const count = spawnCount[threat.id] || 1;
            return (
              <div key={threat.id} className="threat-card">
                <div className="threat-card-top">
                  <div>
                    <strong>{threat.name}</strong>
                    <span className="threat-nd-badge">ND {threat.nd}</span>
                    <span className="threat-role-badge">{threat.role}</span>
                  </div>
                  <div className="threat-spawn-controls">
                    <select
                      value={count}
                      onChange={(e) =>
                        setSpawnCount((prev) => ({
                          ...prev,
                          [threat.id]: parseInt(e.target.value, 10),
                        }))
                      }
                      title="Quantidade de inimigos para adicionar"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}x
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-t20 btn-xs btn-primary"
                      onClick={() => addThreatToCombat(threat, count)}
                    >
                      <Play size={11} /> + Combate
                    </button>
                  </div>
                </div>

                <div className="threat-stats-mini">
                  <span>
                    <strong>PV:</strong> {threat.pvMax}
                  </span>
                  <span>
                    <strong>Def:</strong> {threat.defesa}
                  </span>
                  <span>
                    <strong>Ini:</strong> +{threat.iniciativa}
                  </span>
                  <span>
                    <strong>Fort/Ref/Von:</strong> +{threat.fortitude} / +{threat.reflexos} /{' '}
                    {threat.vontade >= 0 ? `+${threat.vontade}` : threat.vontade}
                  </span>
                </div>

                <div className="threat-attacks-mini">
                  {threat.attacks.map((atq, i) => (
                    <span key={i} className="threat-atq-chip">
                      {atq.name} +{atq.bonus} ({atq.damage})
                      <button
                        title="Rolar ataque direto da ficha"
                        onClick={() =>
                          onAddRoll(
                            rollD20Test(threat.name, atq.name, atq.bonus, {
                              critSpec: atq.crit,
                            })
                          )
                        }
                      >
                        <Dices size={11} />
                      </button>
                    </span>
                  ))}
                </div>

                {threat.abilities && <p className="threat-ability-text">{threat.abilities}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
