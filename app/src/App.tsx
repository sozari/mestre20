import React, { useEffect, useRef, useState } from 'react';
import { AppState, Campaign, Combatant, DiceRollEntry, ThreatSheet } from './types';
import { INITIAL_CAMPAIGN } from './data/t20Database';
import { PlayersTab } from './components/PlayersTab';
import { CombatTab } from './components/CombatTab';
import { ArtonMapTab } from './components/ArtonMapTab';
import { BooksAndShieldTab } from './components/BooksAndShieldTab';
import { AdventurePlannerTab } from './components/AdventurePlannerTab';
import { DiceDock } from './components/DiceDock';
import { parseModifier, rollD20Test } from './utils/dice';
import {
  Users,
  Swords,
  Map,
  BookOpen,
  Sparkles,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Flame,
  Calendar,
  MapPin,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mestre20_app_state_v1';

const DEFAULT_STATE: AppState = {
  activeCampaignId: INITIAL_CAMPAIGN.id,
  campaigns: [INITIAL_CAMPAIGN],
  diceHistory: [],
};

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const [activeTab, setActiveTab] = useState<'players' | 'planner' | 'combat' | 'map' | 'books'>('planner');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialLoadedRef = useRef(false);

  // Carrega do disco local (/api/state) ao abrir
  useEffect(() => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((diskState) => {
        if (diskState && Array.isArray(diskState.campaigns) && diskState.campaigns.length > 0) {
          setState(diskState);
        }
        initialLoadedRef.current = true;
      })
      .catch(() => {
        initialLoadedRef.current = true;
      });
  }, []);

  // Salva automaticamente no localStorage e no arquivo local em disco (/api/state)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    if (!initialLoadedRef.current) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state, null, 2),
      })
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('saved'));
    }, 350);
    return () => clearTimeout(timer);
  }, [state]);

  const activeCampaign =
    state.campaigns.find((c) => c.id === state.activeCampaignId) || state.campaigns[0];

  const updateActiveCampaign = (patch: Partial<Campaign>) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) =>
        c.id === activeCampaign.id ? { ...c, ...patch } : c
      ),
    }));
  };

  const addRoll = (entry: DiceRollEntry) => {
    setState((prev) => ({
      ...prev,
      diceHistory: [entry, ...prev.diceHistory.slice(0, 99)],
    }));
  };

  const createNewCampaign = () => {
    const name = window.prompt('Nome da nova Campanha / Mesa:', `Mesa ${state.campaigns.length + 1}`);
    if (!name) return;
    const newCamp: Campaign = {
      ...INITIAL_CAMPAIGN,
      id: `camp-${Date.now()}`,
      name,
      players: [],
      customThreats: [],
      plannedEncounters: [],
      combat: {
        active: false,
        round: 1,
        turnIndex: 0,
        combatants: [],
        tacticalGridCols: 18,
        tacticalGridRows: 12,
      },
      mapPins: [],
      travelRoute: [],
      sessions: [
        {
          id: `sess-${Date.now()}`,
          number: 1,
          title: 'Sessão 1',
          date: new Date().toLocaleDateString('pt-BR'),
          summary: '',
          npcsMet: '',
          rewardsAndXp: '',
        },
      ],
    };
    setState((prev) => ({
      ...prev,
      activeCampaignId: newCamp.id,
      campaigns: [...prev.campaigns, newCamp],
    }));
  };

  const handleSendPlayersToCombat = () => {
    const existingPlayerIds = new Set(
      activeCampaign.combat.combatants.filter((c) => c.isPlayer).map((c) => c.sourceId)
    );
    const added: Combatant[] = [];
    const newRolls: DiceRollEntry[] = [];

    activeCampaign.players.forEach((pj, idx) => {
      if (existingPlayerIds.has(pj.id)) return;
      const initBonus = parseModifier(pj.iniciativa);
      const r = rollD20Test(pj.name, 'Iniciativa', initBonus);
      newRolls.push(r);

      added.push({
        id: `comb-pj-${pj.id}-${Date.now()}`,
        sourceId: pj.id,
        name: pj.name,
        isPlayer: true,
        initiativeRoll: r.total,
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

    const merged = [...activeCampaign.combat.combatants, ...added].sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll || b.initiativeBonus - a.initiativeBonus
    );

    setState((prev) => ({
      ...prev,
      diceHistory: [...newRolls, ...prev.diceHistory.slice(0, 99)],
      campaigns: prev.campaigns.map((c) =>
        c.id === activeCampaign.id
          ? {
              ...c,
              combat: {
                ...c.combat,
                active: true,
                combatants: merged,
              },
            }
          : c
      ),
    }));
    setActiveTab('combat');
  };

  const handleSendEncounterToCombat = (
    monsters: { threat: ThreatSheet; count: number }[]
  ) => {
    const added: Combatant[] = [];
    const newRolls: DiceRollEntry[] = [];
    let spawnIndex = 0;

    monsters.forEach(({ threat, count }) => {
      for (let i = 0; i < count; i++) {
        const displayName = count > 1 ? `${threat.name} #${i + 1}` : threat.name;
        const r = rollD20Test(displayName, 'Iniciativa', threat.iniciativa);
        newRolls.push(r);

        added.push({
          id: `comb-th-${threat.id}-${Date.now()}-${spawnIndex}`,
          sourceId: threat.id,
          name: displayName,
          isPlayer: false,
          role: threat.role,
          nd: threat.nd,
          initiativeRoll: r.total,
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
          sizeCategory: threat.sizeCategory || 'Médio',
          conditions: [],
          attacks: threat.attacks.map((a) => ({
            name: a.name,
            bonus: a.bonus,
            damage: a.damage,
            crit: a.crit,
            extra: a.extra,
          })),
          abilitiesSummary: threat.abilities,
          notes: `${threat.typeAndSize} • Tesouro: ${threat.treasureType || 'Padrão'}`,
          color: '#dc2626',
          gridX: Math.min(16, 10 + (spawnIndex % 6)),
          gridY: Math.min(11, 2 + Math.floor(spawnIndex / 6) * 2),
        });
        spawnIndex++;
      }
    });

    const merged = [...activeCampaign.combat.combatants, ...added].sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll || b.initiativeBonus - a.initiativeBonus
    );

    setState((prev) => ({
      ...prev,
      diceHistory: [...newRolls, ...prev.diceHistory.slice(0, 99)],
      campaigns: prev.campaigns.map((c) =>
        c.id === activeCampaign.id
          ? {
              ...c,
              combat: {
                ...c.combat,
                active: true,
                combatants: merged,
              },
            }
          : c
      ),
    }));
    setActiveTab('combat');
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mestre20-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && Array.isArray(parsed.campaigns)) {
          setState(parsed);
        }
      } catch {
        window.alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-shell">
      {/* TOP BAR TORMENTA 20 */}
      <header className="t20-topbar">
        <div className="brand-block">
          <div className="brand-emblem">
            <Flame size={22} />
          </div>
          <div>
            <h1 className="brand-title">
              MESTRE<span>20</span>
            </h1>
            <span className="brand-subtitle">
              Escudo Digital • T20, Heróis, Ameaças & Baralho de Aventuras
            </span>
          </div>
        </div>

        {/* Navegação Principal */}
        <nav className="main-nav">
          <button
            className={`nav-tab ${activeTab === 'players' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <Users size={16} />
            <span>Jogadores ({activeCampaign.players.length})</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'planner' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            <Sparkles size={16} />
            <span>Aventuras, Bestiário & Tesouros</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'combat' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('combat')}
          >
            <Swords size={16} />
            <span>
              Combate
              {activeCampaign.combat.combatants.length > 0 && (
                <em className="nav-badge">R{activeCampaign.combat.round}</em>
              )}
            </span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'map' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={16} />
            <span>Mapa de Arton & Tático</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'books' ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <BookOpen size={16} />
            <span>Livros (4 PDFs) & Escudo</span>
          </button>
        </nav>

        {/* Seletor de Campanha / Mesa + Status de Salvamento */}
        <div className="topbar-right">
          <div className="campaign-meta-inputs">
            <span className="meta-chip" title="Localização atual do grupo">
              <MapPin size={13} className="text-orange" />
              <input
                type="text"
                value={activeCampaign.currentLocation}
                onChange={(e) => updateActiveCampaign({ currentLocation: e.target.value })}
              />
            </span>
            <span className="meta-chip" title="Data ou dia da aventura">
              <Calendar size={13} className="text-orange" />
              <input
                type="text"
                value={activeCampaign.currentDay}
                onChange={(e) => updateActiveCampaign({ currentDay: e.target.value })}
              />
            </span>
          </div>

          <select
            className="campaign-selector"
            value={activeCampaign.id}
            onChange={(e) => setState((prev) => ({ ...prev, activeCampaignId: e.target.value }))}
            title="Alternar entre Campanhas / Mesas"
          >
            {state.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                Mesa: {c.name} ({c.players.length} PJs)
              </option>
            ))}
          </select>

          <button
            className="icon-btn"
            title="Criar nova Campanha / Mesa"
            onClick={createNewCampaign}
          >
            <Plus size={16} />
          </button>
          <button
            className="icon-btn"
            title="Exportar Backup JSON"
            onClick={exportBackup}
          >
            <Download size={15} />
          </button>
          <button
            className="icon-btn"
            title="Importar Backup JSON"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importBackup}
          />

          <span className="save-indicator" title="Salvo automaticamente em disco (data/mestre20-state.json)">
            <CheckCircle2 size={14} /> {saveStatus === 'saved' ? 'Salvo' : '...'}
          </span>
        </div>
      </header>

      {/* CORPO PRINCIPAL + DOCK DE DADOS */}
      <div className="app-body">
        <main className="main-workspace">
          {activeTab === 'players' && (
            <PlayersTab
              players={activeCampaign.players}
              onChangePlayers={(players) => updateActiveCampaign({ players })}
              onAddRoll={addRoll}
              onSendPlayersToCombat={handleSendPlayersToCombat}
            />
          )}

          {activeTab === 'planner' && (
            <AdventurePlannerTab
              campaign={activeCampaign}
              onUpdateCampaign={updateActiveCampaign}
              onAddRoll={addRoll}
              onSendEncounterToCombat={handleSendEncounterToCombat}
            />
          )}

          {activeTab === 'combat' && (
            <CombatTab
              campaign={activeCampaign}
              onUpdateCampaign={updateActiveCampaign}
              onAddRoll={addRoll}
            />
          )}

          {activeTab === 'map' && (
            <ArtonMapTab
              campaign={activeCampaign}
              onUpdateCampaign={updateActiveCampaign}
            />
          )}

          {activeTab === 'books' && (
            <BooksAndShieldTab
              campaign={activeCampaign}
              onUpdateCampaign={updateActiveCampaign}
            />
          )}
        </main>

        <DiceDock
          history={state.diceHistory}
          onAddRoll={addRoll}
          onClearHistory={() => setState((prev) => ({ ...prev, diceHistory: [] }))}
        />
      </div>
    </div>
  );
};
export default App;
