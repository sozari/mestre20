import React, { useState } from 'react';
import { DiceRollEntry } from '../types';
import { rollFormula, rollT20AttributeSet } from '../utils/dice';
import { Dices, Trash2, Sparkles, EyeOff, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

interface DiceDockProps {
  history: DiceRollEntry[];
  onAddRoll: (roll: DiceRollEntry) => void;
  onClearHistory: () => void;
}

export const DiceDock: React.FC<DiceDockProps> = ({
  history,
  onAddRoll,
  onClearHistory,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [diceCount, setDiceCount] = useState(1);
  const [flatBonus, setFlatBonus] = useState(0);
  const [customExpr, setCustomExpr] = useState('1d20+5');
  const [secretMode, setSecretMode] = useState(false);
  const [attrRollResult, setAttrRollResult] = useState<
    Array<{ dice: number[]; sum3: number; mod: number }> | null
  >(null);

  const quickRollDie = (faces: number | '%') => {
    const modStr = flatBonus > 0 ? `+${flatBonus}` : flatBonus < 0 ? `${flatBonus}` : '';
    const formula = `${diceCount}d${faces}${modStr}`;
    onAddRoll(
      rollFormula(formula, {
        actor: 'Mestre',
        label: `Rolagem d${faces}`,
        secret: secretMode,
      })
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExpr.trim()) return;
    onAddRoll(
      rollFormula(customExpr, {
        actor: 'Mestre',
        label: 'Fórmula Livre',
        secret: secretMode,
      })
    );
  };

  if (collapsed) {
    return (
      <div className="dice-dock-collapsed">
        <button
          className="btn-expand-dock"
          onClick={() => setCollapsed(false)}
          title="Abrir Rolador de Dados do Mestre"
        >
          <ChevronLeft size={18} />
          <Dices size={22} className="text-orange" />
          <span className="vertical-label">ROLADOR T20</span>
        </button>
      </div>
    );
  }

  const latestRoll = history[0];

  return (
    <aside className="dice-dock">
      <div className="dock-header">
        <div className="dock-title">
          <Dices size={18} className="text-orange" />
          <span>ROLADOR DO MESTRE</span>
        </div>
        <div className="dock-header-btns">
          <button
            className={`icon-btn ${secretMode ? 'text-orange' : ''}`}
            title={secretMode ? 'Modo Secreto do Mestre ATIVO' : 'Modo Público'}
            onClick={() => setSecretMode(!secretMode)}
          >
            {secretMode ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button
            className="icon-btn"
            title="Limpar histórico de rolagens"
            onClick={onClearHistory}
          >
            <Trash2 size={15} />
          </button>
          <button
            className="icon-btn"
            title="Recolher painel de dados"
            onClick={() => setCollapsed(true)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Seletores Rápidos de Quantidade e Bônus */}
      <div className="dock-controls">
        <div className="dock-qty-row">
          <label>
            Qtd:
            <div className="qty-pills">
              {[1, 2, 3, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  className={diceCount === n ? 'qty-active' : ''}
                  onClick={() => setDiceCount(n)}
                >
                  {n}d
                </button>
              ))}
            </div>
          </label>
          <label className="mod-inline-label">
            Mod:
            <input
              type="number"
              value={flatBonus}
              onChange={(e) => setFlatBonus(parseInt(e.target.value, 10) || 0)}
            />
          </label>
        </div>

        {/* Botões dos Dados de Tormenta20 (pág. 9: d4, d6, d8, d10, d12, d20, d%, d2, d3) */}
        <div className="dice-buttons-grid">
          <button className="die-btn die-d20" onClick={() => quickRollDie(20)}>
            <span className="die-tag">d20</span>
            <small>{diceCount}d20</small>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(12)}>
            <span className="die-tag">d12</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(10)}>
            <span className="die-tag">d10</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(8)}>
            <span className="die-tag">d8</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(6)}>
            <span className="die-tag">d6</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(4)}>
            <span className="die-tag">d4</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie('%')}>
            <span className="die-tag">d%</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(3)}>
            <span className="die-tag">d3</span>
          </button>
          <button className="die-btn" onClick={() => quickRollDie(2)}>
            <span className="die-tag">d2</span>
          </button>
        </div>

        {/* Expressão Livre */}
        <form className="custom-expr-form" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            value={customExpr}
            placeholder="Ex: 2d6+1d4+5"
            onChange={(e) => setCustomExpr(e.target.value)}
          />
          <button type="submit" className="btn-t20 btn-orange btn-xs">
            Rolar
          </button>
        </form>

        {/* Gerador de Atributos 4d6 (Tabela 1-1 Livro Básico pág. 17) */}
        <button
          className="btn-t20 btn-ghost btn-full-width"
          onClick={() => setAttrRollResult(rollT20AttributeSet())}
          title="Rola 6 conjuntos de 4d6 (descarta o menor) e converte pela Tabela 1-1 da página 17 do Livro Básico"
        >
          <Sparkles size={13} className="text-orange" /> Rolar 6 Atributos (4d6 → T20 JdA)
        </button>

        {attrRollResult && (
          <div className="attr-gen-popup">
            <div className="attr-gen-head">
              <strong>Atributos Sorteados (pág. 17)</strong>
              <button onClick={() => setAttrRollResult(null)}>✕</button>
            </div>
            <div className="attr-gen-chips">
              {attrRollResult.map((item, i) => (
                <div key={i} className="attr-gen-chip">
                  <span className="attr-gen-mod">
                    {item.mod >= 0 ? `+${item.mod}` : item.mod}
                  </span>
                  <small>
                    ({item.sum3} nos 3d6)
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Destaque da Última Rolagem */}
      {latestRoll && (
        <div
          className={`latest-roll-spotlight ${
            latestRoll.isCrit
              ? 'spotlight-crit'
              : latestRoll.isFumble
              ? 'spotlight-fumble'
              : ''
          }`}
        >
          <div className="spotlight-top">
            <span className="spotlight-actor">{latestRoll.actor}</span>
            <span className="spotlight-label">{latestRoll.label}</span>
          </div>
          <div className="spotlight-main">
            <span className="spotlight-total">{latestRoll.total}</span>
            <div className="spotlight-breakdown">
              <div>
                <code>{latestRoll.formula}</code>
              </div>
              <div>
                Dados: [{latestRoll.rolls.join(', ')}]
                {latestRoll.modifier !== 0 &&
                  ` ${latestRoll.modifier > 0 ? `+ ${latestRoll.modifier}` : latestRoll.modifier}`}
              </div>
              {latestRoll.isCrit && (
                <span className="crit-tag">★ ACERTO CRÍTICO! (d20 = {latestRoll.naturalD20})</span>
              )}
              {latestRoll.isFumble && (
                <span className="fumble-tag">💀 FALHA CRÍTICA! (1 natural)</span>
              )}
              {latestRoll.detail && <div className="roll-detail-tag">{latestRoll.detail}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Histórico Completo */}
      <div className="dock-history">
        {history.length === 0 ? (
          <div className="dock-empty">
            Clique em qualquer dado acima ou nas perícias e ataques das fichas para rolar!
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className={`roll-log-item ${
                item.isCrit ? 'log-crit' : item.isFumble ? 'log-fumble' : ''
              }`}
            >
              <div className="log-left">
                <div className="log-actor-line">
                  <strong>{item.actor}</strong> — <span>{item.label}</span>
                  {item.secret && <span className="secret-pill">SECRETO</span>}
                </div>
                <div className="log-formula-line">
                  <code>{item.formula}</code> → [{item.rolls.join(', ')}]
                  {item.detail && <span className="log-detail"> • {item.detail}</span>}
                </div>
              </div>
              <div className="log-right">
                <span className="log-total">{item.total}</span>
                <small>{item.timestamp}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
