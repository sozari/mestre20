import React, { useState } from 'react';
import { PlayerAttack, PlayerCharacter } from '../types';
import { T20_CONDITIONS } from '../data/t20Database';
import { parseCritSpec, parseModifier, rollD20Test, rollFormula } from '../utils/dice';
import {
  Plus,
  Trash2,
  Shield,
  Heart,
  Zap,
  Dices,
  Skull,
  AlertTriangle,
  Moon,
  Users,
  Swords,
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  LayoutGrid,
} from 'lucide-react';

interface PlayersTabProps {
  players: PlayerCharacter[];
  onChangePlayers: (players: PlayerCharacter[]) => void;
  onAddRoll: (roll: ReturnType<typeof rollFormula>) => void;
  onSendPlayersToCombat: () => void;
}

const PLAYER_COLORS = [
  '#e11d48',
  '#f97316',
  '#eab308',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

function extractLevel(classAndLevel: string): number {
  const m = classAndLevel.match(/(\d+)/g);
  if (!m) return 1;
  const sum = m.reduce((acc, n) => acc + parseInt(n, 10), 0);
  return Math.max(1, Math.min(20, sum));
}

export const PlayersTab: React.FC<PlayersTabProps> = ({
  players,
  onChangePlayers,
  onAddRoll,
  onSendPlayersToCombat,
}) => {
  const [compactMode, setCompactMode] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [customDelta, setCustomDelta] = useState<Record<string, string>>({});
  const [groupSkill, setGroupSkill] = useState<
    'percepcao' | 'reflexos' | 'fortitude' | 'vontade' | 'iniciativa'
  >('percepcao');
  const [groupCd, setGroupCd] = useState<string>('15');
  const [lastGroupSummary, setLastGroupSummary] = useState<
    Array<{ name: string; total: number; nat?: number; passed: boolean }>
  >([]);

  const updatePlayer = (id: string, patch: Partial<PlayerCharacter>) => {
    onChangePlayers(players.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addNewPlayer = () => {
    const idx = players.length;
    const newPj: PlayerCharacter = {
      id: `pj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `Herói ${idx + 1}`,
      player: `Jogador ${idx + 1}`,
      race: 'Humano',
      classAndLevel: 'Guerreiro 1',
      origin: 'Aventureiro',
      deity: 'Valkaria',
      size: 'Médio',
      displacement: '9m (6q)',
      forca: '+0',
      destreza: '+0',
      constituicao: '+0',
      inteligencia: '+0',
      sabedoria: '+0',
      carisma: '+0',
      pvCurrent: 20,
      pvMax: 20,
      pvTemp: 0,
      pmCurrent: 3,
      pmMax: 3,
      pmTemp: 0,
      defesa: '10',
      rd: '0',
      fortitude: '+0',
      reflexos: '+0',
      vontade: '+0',
      iniciativa: '+0',
      percepcao: '+0',
      luta: '+0',
      pontaria: '+0',
      cdMagia: '10',
      tibares: '0 T$',
      conditions: [],
      attacks: [
        {
          id: `atq-${Date.now()}`,
          name: 'Arma Principal',
          bonus: '+0',
          damage: '1d8',
          crit: '19/x2',
          type: 'Corte',
          range: 'Corpo a corpo',
        },
      ],
      powersAndSpells: '',
      equipment: '',
      complicationOrDistinction: '',
      notes: '',
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    };
    onChangePlayers([...players, newPj]);
    setExpandedIds((prev) => ({ ...prev, [newPj.id]: true }));
  };

  const duplicatePlayer = (pj: PlayerCharacter) => {
    const copy: PlayerCharacter = {
      ...pj,
      id: `pj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${pj.name} (Cópia)`,
      attacks: pj.attacks.map((a) => ({ ...a, id: `atq-${Date.now()}-${Math.random()}` })),
    };
    onChangePlayers([...players, copy]);
  };

  const deletePlayer = (id: string, name: string) => {
    if (!window.confirm(`Remover a ficha de "${name}"?`)) return;
    onChangePlayers(players.filter((p) => p.id !== id));
  };

  const adjustPv = (pj: PlayerCharacter, delta: number) => {
    let nextTemp = pj.pvTemp;
    let nextPv = pj.pvCurrent;

    if (delta < 0) {
      // Dano consome PV temporários primeiro (Livro Básico pág. 106)
      const dmg = Math.abs(delta);
      const absorbed = Math.min(nextTemp, dmg);
      nextTemp -= absorbed;
      const rem = dmg - absorbed;
      nextPv -= rem;
    } else {
      nextPv = Math.min(pj.pvMax, nextPv + delta);
    }

    // Regra de Sangrando automático ao cair a 0 PV ou menos
    let nextConds = [...pj.conditions];
    if (nextPv <= 0 && !nextConds.includes('Sangrando')) {
      nextConds.push('Sangrando');
    } else if (nextPv > 0 && nextConds.includes('Sangrando')) {
      nextConds = nextConds.filter((c) => c !== 'Sangrando');
    }

    updatePlayer(pj.id, { pvCurrent: nextPv, pvTemp: nextTemp, conditions: nextConds });
  };

  const adjustPm = (pj: PlayerCharacter, delta: number) => {
    let nextTemp = pj.pmTemp;
    let nextPm = pj.pmCurrent;
    if (delta < 0) {
      const cost = Math.abs(delta);
      const absorbed = Math.min(nextTemp, cost);
      nextTemp -= absorbed;
      nextPm = Math.max(0, nextPm - (cost - absorbed));
    } else {
      nextPm = Math.min(pj.pmMax, nextPm + delta);
    }
    updatePlayer(pj.id, { pmCurrent: nextPm, pmTemp: nextTemp });
  };

  const addConditionWithEscalation = (pj: PlayerCharacter, condName: string) => {
    if (!condName) return;
    const info = T20_CONDITIONS.find((c) => c.name === condName);
    const hasAlready = pj.conditions.includes(condName);

    if (hasAlready && info?.escalatesTo) {
      // Escalonamento oficial T20: Abalado -> Apavorado, Fraco -> Debilitado, Fatigado -> Exausto
      const next = pj.conditions.filter((c) => c !== condName);
      if (!next.includes(info.escalatesTo)) next.push(info.escalatesTo);
      updatePlayer(pj.id, { conditions: next });
      return;
    }

    if (!hasAlready) {
      updatePlayer(pj.id, { conditions: [...pj.conditions, condName] });
    }
  };

  const removeCondition = (pj: PlayerCharacter, condName: string) => {
    updatePlayer(pj.id, { conditions: pj.conditions.filter((c) => c !== condName) });
  };

  const applyPartyRest = (multiplier: 0.5 | 1 | 2 | 3 | 'full') => {
    const updated = players.map((pj) => {
      if (multiplier === 'full') {
        return {
          ...pj,
          pvCurrent: pj.pvMax,
          pmCurrent: pj.pmMax,
          pvTemp: 0,
          pmTemp: 0,
          conditions: pj.conditions.filter((c) => c !== 'Sangrando' && c !== 'Fatigado' && c !== 'Exausto'),
        };
      }
      const lv = extractLevel(pj.classAndLevel);
      const rec = Math.max(1, Math.floor(lv * multiplier));
      const nextPv = Math.min(pj.pvMax, pj.pvCurrent + rec);
      const nextPm = Math.min(pj.pmMax, pj.pmCurrent + rec);
      return {
        ...pj,
        pvCurrent: nextPv,
        pmCurrent: nextPm,
        pvTemp: 0,
        pmTemp: 0,
        conditions: nextPv > 0 ? pj.conditions.filter((c) => c !== 'Sangrando') : pj.conditions,
      };
    });
    onChangePlayers(updated);
  };

  const runGroupTest = () => {
    const cdNum = parseInt(groupCd, 10) || 15;
    const labelMap: Record<typeof groupSkill, string> = {
      percepcao: 'Percepção',
      reflexos: 'Reflexos',
      fortitude: 'Fortitude',
      vontade: 'Vontade',
      iniciativa: 'Iniciativa',
    };

    const summary: Array<{ name: string; total: number; nat?: number; passed: boolean }> = [];
    players.forEach((pj) => {
      const val = pj[groupSkill];
      const entry = rollD20Test(pj.name, `${labelMap[groupSkill]} (Grupo)`, val, { cd: cdNum });
      onAddRoll(entry);
      const passed = Boolean(entry.isCrit || (!entry.isFumble && entry.total >= cdNum));
      summary.push({
        name: pj.name,
        total: entry.total,
        nat: entry.naturalD20,
        passed,
      });
    });
    setLastGroupSummary(summary);
  };

  const rollBleedingTest = (pj: PlayerCharacter) => {
    const conMod = parseModifier(pj.constituicao);
    const entry = rollD20Test(pj.name, 'Teste contra Sangramento (Con CD 15)', conMod, { cd: 15 });
    onAddRoll(entry);
    const passed = entry.isCrit || (!entry.isFumble && entry.total >= 15);
    if (passed) {
      removeCondition(pj, 'Sangrando');
    } else {
      const bleedRoll = rollFormula('1d6', {
        actor: pj.name,
        label: 'Perda de PV por Sangramento',
      });
      onAddRoll(bleedRoll);
      adjustPv(pj, -bleedRoll.total);
    }
  };

  return (
    <div className="tab-container">
      {/* Barra de Ferramentas do Grupo */}
      <div className="t20-toolbar">
        <div className="toolbar-group">
          <button className="btn-t20 btn-primary" onClick={addNewPlayer}>
            <Plus size={16} /> Novo Jogador ({players.length} na Mesa)
          </button>
          <button
            className="btn-t20 btn-secondary"
            onClick={() => setCompactMode(!compactMode)}
            title="Alternar entre visão compacta para 6-8+ jogadores e visão completa"
          >
            <LayoutGrid size={16} />
            {compactMode ? 'Visão Completa' : 'Visão Compacta (Mesa Cheia)'}
          </button>
          <button className="btn-t20 btn-accent" onClick={onSendPlayersToCombat}>
            <Swords size={16} /> Enviar Grupo ao Combate
          </button>
        </div>

        {/* Teste em Grupo para o Mestre */}
        <div className="toolbar-group group-roller-bar">
          <Users size={16} className="text-orange" />
          <span className="toolbar-label">Teste do Grupo:</span>
          <select
            className="t20-select"
            value={groupSkill}
            onChange={(e) => setGroupSkill(e.target.value as any)}
          >
            <option value="percepcao">Percepção</option>
            <option value="reflexos">Reflexos</option>
            <option value="fortitude">Fortitude</option>
            <option value="vontade">Vontade</option>
            <option value="iniciativa">Iniciativa</option>
          </select>
          <span className="toolbar-label">CD:</span>
          <input
            type="number"
            className="t20-input-mini"
            value={groupCd}
            onChange={(e) => setGroupCd(e.target.value)}
          />
          <button className="btn-t20 btn-orange" onClick={runGroupTest}>
            <Dices size={15} /> Rolar Todos
          </button>
        </div>

        {/* Descanso Oficial Livro Básico pág. 106 */}
        <div className="toolbar-group">
          <Moon size={16} className="text-orange" />
          <span className="toolbar-label">Descanso:</span>
          <button
            className="btn-t20 btn-ghost"
            onClick={() => applyPartyRest(0.5)}
            title="Condição Ruim: recupera metade do nível em PV e PM"
          >
            Ruim (½x)
          </button>
          <button
            className="btn-t20 btn-ghost"
            onClick={() => applyPartyRest(1)}
            title="Condição Normal: recupera 1x o nível em PV e PM"
          >
            Normal (1x)
          </button>
          <button
            className="btn-t20 btn-ghost"
            onClick={() => applyPartyRest(2)}
            title="Condição Confortável: recupera 2x o nível em PV e PM"
          >
            Confortável (2x)
          </button>
          <button
            className="btn-t20 btn-ghost"
            onClick={() => applyPartyRest('full')}
            title="Restaurar 100% de PV e PM de todos os personagens"
          >
            Total (100%)
          </button>
        </div>
      </div>

      {/* Resultado do Último Teste em Grupo */}
      {lastGroupSummary.length > 0 && (
        <div className="group-test-banner">
          <div className="group-test-title">
            <Eye size={16} /> Resultado do Teste em Grupo (CD {groupCd}):
          </div>
          <div className="group-test-chips">
            {lastGroupSummary.map((item, idx) => (
              <span
                key={idx}
                className={`group-chip ${item.passed ? 'chip-pass' : 'chip-fail'}`}
              >
                <strong>{item.name}:</strong> {item.total}{' '}
                <small>(d20: {item.nat})</small> {item.passed ? '✓' : '✗'}
              </span>
            ))}
          </div>
          <button className="btn-close-mini" onClick={() => setLastGroupSummary([])}>
            ✕
          </button>
        </div>
      )}

      {/* Grid de Fichas dos Jogadores */}
      <div className={`players-grid ${compactMode ? 'players-grid-compact' : ''}`}>
        {players.map((pj) => {
          const deathLimit = -Math.max(10, Math.floor(pj.pvMax / 2));
          const isDead = pj.pvCurrent <= deathLimit;
          const isDown = pj.pvCurrent <= 0 && !isDead;
          const pvPct = Math.max(0, Math.min(100, Math.round((pj.pvCurrent / Math.max(1, pj.pvMax)) * 100)));
          const pmPct = Math.max(0, Math.min(100, Math.round((pj.pmCurrent / Math.max(1, pj.pmMax)) * 100)));
          const isExpanded = expandedIds[pj.id] ?? !compactMode;

          return (
            <div
              key={pj.id}
              className={`pj-card ${isDead ? 'pj-card-dead' : isDown ? 'pj-card-down' : ''}`}
              style={{ borderTopColor: pj.color || '#e11d48' }}
            >
              {/* Cabeçalho do Card */}
              <div className="pj-header">
                <div className="pj-identity">
                  <div className="pj-name-row">
                    <input
                      type="color"
                      className="pj-color-picker"
                      value={pj.color || '#e11d48'}
                      onChange={(e) => updatePlayer(pj.id, { color: e.target.value })}
                      title="Cor do personagem"
                    />
                    <input
                      type="text"
                      className="pj-name-input"
                      value={pj.name}
                      placeholder="Nome do Personagem"
                      onChange={(e) => updatePlayer(pj.id, { name: e.target.value })}
                    />
                    <span className="pj-player-tag">
                      Jog:
                      <input
                        type="text"
                        className="pj-small-inline"
                        value={pj.player}
                        placeholder="Jogador"
                        onChange={(e) => updatePlayer(pj.id, { player: e.target.value })}
                      />
                    </span>
                  </div>

                  <div className="pj-sub-row">
                    <input
                      type="text"
                      className="pj-meta-input"
                      value={pj.race}
                      placeholder="Raça"
                      title="Raça"
                      onChange={(e) => updatePlayer(pj.id, { race: e.target.value })}
                    />
                    <input
                      type="text"
                      className="pj-meta-input"
                      value={pj.classAndLevel}
                      placeholder="Classe & Nível"
                      title="Classe e Nível"
                      onChange={(e) => updatePlayer(pj.id, { classAndLevel: e.target.value })}
                    />
                    <input
                      type="text"
                      className="pj-meta-input"
                      value={pj.origin}
                      placeholder="Origem"
                      title="Origem"
                      onChange={(e) => updatePlayer(pj.id, { origin: e.target.value })}
                    />
                    <input
                      type="text"
                      className="pj-meta-input"
                      value={pj.deity}
                      placeholder="Divindade"
                      title="Divindade"
                      onChange={(e) => updatePlayer(pj.id, { deity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pj-header-actions">
                  <button
                    className="icon-btn"
                    title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    onClick={() =>
                      setExpandedIds((prev) => ({ ...prev, [pj.id]: !isExpanded }))
                    }
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    className="icon-btn"
                    title="Duplicar ficha"
                    onClick={() => duplicatePlayer(pj)}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    className="icon-btn icon-btn-danger"
                    title="Excluir ficha"
                    onClick={() => deletePlayer(pj.id, pj.name)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Alerta de Sangrando / Morte (Livro Básico pág. 236) */}
              {(isDown || isDead) && (
                <div className={`pj-status-alert ${isDead ? 'alert-dead' : 'alert-down'}`}>
                  {isDead ? (
                    <>
                      <Skull size={16} />
                      <span>
                        <strong>MORTO</strong> (Atingiu {pj.pvCurrent} PV; limite é {deathLimit} PV)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} />
                      <span>
                        <strong>INCONSCIENTE & SANGRANDO</strong> (Morte em {deathLimit} PV)
                      </span>
                      <button
                        className="btn-t20 btn-xs btn-orange"
                        onClick={() => rollBleedingTest(pj)}
                      >
                        <Dices size={13} /> Rolar Con CD 15
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Barras de PV e PM + Controles Rápidos */}
              <div className="pj-bars-section">
                {/* PV */}
                <div className="resource-block">
                  <div className="resource-top">
                    <span className="resource-label pv-label">
                      <Heart size={14} /> PV
                    </span>
                    <div className="resource-numbers">
                      <input
                        type="number"
                        className="res-num-input"
                        value={pj.pvCurrent}
                        onChange={(e) =>
                          updatePlayer(pj.id, { pvCurrent: parseInt(e.target.value, 10) || 0 })
                        }
                        title="PV Atuais"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        className="res-num-input"
                        value={pj.pvMax}
                        onChange={(e) =>
                          updatePlayer(pj.id, { pvMax: parseInt(e.target.value, 10) || 1 })
                        }
                        title="PV Máximos"
                      />
                      <span className="temp-badge" title="PV Temporários">
                        +Temp:
                        <input
                          type="number"
                          className="res-temp-input"
                          value={pj.pvTemp}
                          onChange={(e) =>
                            updatePlayer(pj.id, {
                              pvTemp: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                        />
                      </span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill pv-fill" style={{ width: `${pvPct}%` }} />
                  </div>
                  <div className="resource-Step-btns">
                    <button onClick={() => adjustPv(pj, -5)}>-5</button>
                    <button onClick={() => adjustPv(pj, -1)}>-1</button>
                    <input
                      type="number"
                      placeholder="Valor"
                      className="delta-input"
                      value={customDelta[pj.id] || ''}
                      onChange={(e) =>
                        setCustomDelta((prev) => ({ ...prev, [pj.id]: e.target.value }))
                      }
                    />
                    <button
                      className="btn-dmg"
                      onClick={() => {
                        const v = parseInt(customDelta[pj.id] || '0', 10);
                        if (v) adjustPv(pj, -Math.abs(v));
                      }}
                    >
                      Dano
                    </button>
                    <button
                      className="btn-heal"
                      onClick={() => {
                        const v = parseInt(customDelta[pj.id] || '0', 10);
                        if (v) adjustPv(pj, Math.abs(v));
                      }}
                    >
                      Cura
                    </button>
                    <button onClick={() => adjustPv(pj, 1)}>+1</button>
                    <button onClick={() => adjustPv(pj, 5)}>+5</button>
                  </div>
                </div>

                {/* PM */}
                <div className="resource-block">
                  <div className="resource-top">
                    <span className="resource-label pm-label">
                      <Zap size={14} /> PM
                    </span>
                    <div className="resource-numbers">
                      <input
                        type="number"
                        className="res-num-input"
                        value={pj.pmCurrent}
                        onChange={(e) =>
                          updatePlayer(pj.id, { pmCurrent: parseInt(e.target.value, 10) || 0 })
                        }
                        title="PM Atuais"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        className="res-num-input"
                        value={pj.pmMax}
                        onChange={(e) =>
                          updatePlayer(pj.id, { pmMax: parseInt(e.target.value, 10) || 0 })
                        }
                        title="PM Máximos"
                      />
                      <span className="temp-badge" title="PM Temporários">
                        +Temp:
                        <input
                          type="number"
                          className="res-temp-input"
                          value={pj.pmTemp}
                          onChange={(e) =>
                            updatePlayer(pj.id, {
                              pmTemp: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                        />
                      </span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill pm-fill" style={{ width: `${pmPct}%` }} />
                  </div>
                  <div className="resource-Step-btns">
                    <button onClick={() => adjustPm(pj, -5)}>-5</button>
                    <button onClick={() => adjustPm(pj, -2)}>-2</button>
                    <button onClick={() => adjustPm(pj, -1)}>-1</button>
                    <button onClick={() => adjustPm(pj, 1)}>+1</button>
                    <button onClick={() => adjustPm(pj, 2)}>+2</button>
                    <button onClick={() => adjustPm(pj, 5)}>+5</button>
                  </div>
                </div>
              </div>

              {/* 6 Atributos (Livro Básico pág. 17) */}
              <div className="pj-attributes-row">
                {(
                  [
                    ['FOR', 'forca', 'Força'],
                    ['DES', 'destreza', 'Destreza'],
                    ['CON', 'constituicao', 'Constituição'],
                    ['INT', 'inteligencia', 'Inteligência'],
                    ['SAB', 'sabedoria', 'Sabedoria'],
                    ['CAR', 'carisma', 'Carisma'],
                  ] as const
                ).map(([short, key, fullName]) => (
                  <div key={key} className="attr-box">
                    <button
                      className="attr-roll-label"
                      title={`Rolar teste de ${fullName} (1d20 ${pj[key]})`}
                      onClick={() =>
                        onAddRoll(rollD20Test(pj.name, `Teste de ${fullName}`, pj[key]))
                      }
                    >
                      {short} <Dices size={11} />
                    </button>
                    <input
                      type="text"
                      className="attr-input"
                      value={pj[key]}
                      onChange={(e) => updatePlayer(pj.id, { [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              {/* Defesa + Resistências (Fortitude, Reflexos, Vontade) + Perícias-Chave */}
              <div className="pj-keystats-grid">
                <div className="stat-pill stat-defesa">
                  <span className="stat-pill-label">
                    <Shield size={13} /> DEFESA
                  </span>
                  <input
                    type="text"
                    value={pj.defesa}
                    onChange={(e) => updatePlayer(pj.id, { defesa: e.target.value })}
                  />
                </div>

                <div className="stat-pill">
                  <span className="stat-pill-label">RD</span>
                  <input
                    type="text"
                    value={pj.rd}
                    onChange={(e) => updatePlayer(pj.id, { rd: e.target.value })}
                  />
                </div>

                {(
                  [
                    ['Fortitude', 'fortitude'],
                    ['Reflexos', 'reflexos'],
                    ['Vontade', 'vontade'],
                    ['Iniciativa', 'iniciativa'],
                    ['Percepção', 'percepcao'],
                    ['Luta', 'luta'],
                    ['Pontaria', 'pontaria'],
                  ] as const
                ).map(([label, field]) => (
                  <div key={field} className="stat-pill stat-rollable">
                    <button
                      className="stat-roll-trigger"
                      title={`Rolar ${label} de ${pj.name}`}
                      onClick={() => onAddRoll(rollD20Test(pj.name, label, pj[field]))}
                    >
                      <Dices size={12} /> {label}
                    </button>
                    <input
                      type="text"
                      value={pj[field]}
                      onChange={(e) => updatePlayer(pj.id, { [field]: e.target.value })}
                    />
                  </div>
                ))}

                <div className="stat-pill">
                  <span className="stat-pill-label">CD Magia</span>
                  <input
                    type="text"
                    value={pj.cdMagia}
                    onChange={(e) => updatePlayer(pj.id, { cdMagia: e.target.value })}
                  />
                </div>
              </div>

              {/* Condições Ativas */}
              <div className="pj-conditions-bar">
                <div className="cond-chips">
                  {pj.conditions.length === 0 ? (
                    <span className="cond-none">Sem condições ativas</span>
                  ) : (
                    pj.conditions.map((cName) => {
                      const cInfo = T20_CONDITIONS.find((c) => c.name === cName);
                      return (
                        <span
                          key={cName}
                          className="cond-badge"
                          title={cInfo ? `${cInfo.name}: ${cInfo.description}` : cName}
                        >
                          {cName}
                          {cInfo && <small> ({cInfo.summary})</small>}
                          <button onClick={() => removeCondition(pj, cName)}>✕</button>
                        </span>
                      );
                    })
                  )}
                </div>
                <select
                  className="cond-select"
                  value=""
                  onChange={(e) => addConditionWithEscalation(pj, e.target.value)}
                >
                  <option value="">+ Condição...</option>
                  {T20_CONDITIONS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.summary})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seção Expandida: Ataques, Poderes, Equipamento e Notas */}
              {isExpanded && (
                <div className="pj-expanded-body">
                  {/* Ataques Rápidos */}
                  <div className="pj-section-box">
                    <div className="pj-section-header">
                      <span>ATAQUES & ARMAS</span>
                      <button
                        className="btn-link-add"
                        onClick={() => {
                          const nextAtq: PlayerAttack = {
                            id: `atq-${Date.now()}`,
                            name: 'Novo Ataque',
                            bonus: pj.luta || '+0',
                            damage: '1d8+2',
                            crit: '20/x2',
                            type: 'Corte',
                            range: 'Corpo a corpo',
                          };
                          updatePlayer(pj.id, { attacks: [...pj.attacks, nextAtq] });
                        }}
                      >
                        + Adicionar Ataque
                      </button>
                    </div>

                    {pj.attacks.map((atq, aIdx) => {
                      const updateAtq = (patch: Partial<PlayerAttack>) => {
                        const next = pj.attacks.map((item, i) =>
                          i === aIdx ? { ...item, ...patch } : item
                        );
                        updatePlayer(pj.id, { attacks: next });
                      };
                      const critSpec = parseCritSpec(atq.crit);
                      return (
                        <div key={atq.id} className="pj-attack-row">
                          <input
                            type="text"
                            className="atq-name"
                            value={atq.name}
                            placeholder="Arma / Ataque"
                            onChange={(e) => updateAtq({ name: e.target.value })}
                          />
                          <input
                            type="text"
                            className="atq-bonus"
                            value={atq.bonus}
                            placeholder="Atq (+5)"
                            title="Bônus de Ataque"
                            onChange={(e) => updateAtq({ bonus: e.target.value })}
                          />
                          <input
                            type="text"
                            className="atq-dmg"
                            value={atq.damage}
                            placeholder="Dano (1d8+3)"
                            title="Fórmula de Dano"
                            onChange={(e) => updateAtq({ damage: e.target.value })}
                          />
                          <input
                            type="text"
                            className="atq-crit"
                            value={atq.crit}
                            placeholder="19/x2"
                            title="Margem de Ameaça / Multiplicador"
                            onChange={(e) => updateAtq({ crit: e.target.value })}
                          />
                          <button
                            className="btn-t20 btn-xs btn-primary"
                            title={`Rolar Ataque (1d20 ${atq.bonus}, crítico ${critSpec.threat}/x${critSpec.mult})`}
                            onClick={() =>
                              onAddRoll(
                                rollD20Test(pj.name, `Ataque: ${atq.name}`, atq.bonus, {
                                  critSpec: atq.crit,
                                })
                              )
                            }
                          >
                            <Dices size={12} /> Atq
                          </button>
                          <button
                            className="btn-t20 btn-xs btn-orange"
                            title={`Rolar Dano Normal (${atq.damage})`}
                            onClick={() =>
                              onAddRoll(
                                rollFormula(atq.damage, {
                                  actor: pj.name,
                                  label: `Dano: ${atq.name}`,
                                })
                              )
                            }
                          >
                            Dano
                          </button>
                          <button
                            className="btn-t20 btn-xs btn-crit"
                            title={`Rolar Dano Crítico (multiplica os dados por x${critSpec.mult}, regra T20 pág. 231)`}
                            onClick={() =>
                              onAddRoll(
                                rollFormula(atq.damage, {
                                  actor: pj.name,
                                  label: `DANO CRÍTICO: ${atq.name}`,
                                  multiplyDiceBy: critSpec.mult,
                                })
                              )
                            }
                          >
                            Crít x{critSpec.mult}
                          </button>
                          <button
                            className="icon-btn icon-btn-danger"
                            onClick={() =>
                              updatePlayer(pj.id, {
                                attacks: pj.attacks.filter((_, i) => i !== aIdx),
                              })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Caixas de Texto Livres para o Mestre */}
                  <div className="pj-textareas-grid">
                    <div className="pj-textarea-field">
                      <label>Poderes, Habilidades & Magias</label>
                      <textarea
                        rows={4}
                        value={pj.powersAndSpells}
                        placeholder="Digite poderes de raça, classe, magias e custos em PM..."
                        onChange={(e) => updatePlayer(pj.id, { powersAndSpells: e.target.value })}
                      />
                    </div>
                    <div className="pj-textarea-field">
                      <label>Equipamento, Complicação / Distinção & Notas</label>
                      <textarea
                        rows={4}
                        value={pj.notes}
                        placeholder="Itens importantes, Complicação (Heróis de Arton), Distinção, anotações do mestre..."
                        onChange={(e) => updatePlayer(pj.id, { notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pj-footer-meta">
                    <label>
                      Tamanho:
                      <select
                        value={pj.size}
                        onChange={(e) => updatePlayer(pj.id, { size: e.target.value as any })}
                      >
                        <option value="Minúsculo">Minúsculo (+5 Furt / -5 Man)</option>
                        <option value="Pequeno">Pequeno (+2 Furt / -2 Man)</option>
                        <option value="Médio">Médio (1,5m / 0)</option>
                        <option value="Grande">Grande (3m / -2 Furt / +2 Man)</option>
                        <option value="Enorme">Enorme (4,5m / -5 Furt / +5 Man)</option>
                        <option value="Colossal">Colossal (9m / -10 Furt / +10 Man)</option>
                      </select>
                    </label>
                    <label>
                      Deslocamento:
                      <input
                        type="text"
                        value={pj.displacement}
                        onChange={(e) => updatePlayer(pj.id, { displacement: e.target.value })}
                      />
                    </label>
                    <label>
                      Tibares (T$):
                      <input
                        type="text"
                        value={pj.tibares}
                        onChange={(e) => updatePlayer(pj.id, { tibares: e.target.value })}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
