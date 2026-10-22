import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Campaign, CustomMapPin } from '../types';
import { citiesDef, kingdomsDef, ArtonCity } from '../data/artonMapData';
import {
  MapPin,
  Compass,
  Navigation,
  Ruler,
  Plus,
  Trash2,
  Search,
  Eye,
  Grid,
  Globe,
  Flag,
} from 'lucide-react';

interface ArtonMapTabProps {
  campaign: Campaign;
  onUpdateCampaign: (patch: Partial<Campaign>) => void;
}

type WorldMapId = 'arton' | 'doherimm' | 'lamnor' | 'moreania' | 'tamura';

const MAP_CONFIGS: Record<
  WorldMapId,
  { label: string; url: string; minZoom: number; maxZoom: number; center: [number, number]; zoom: number }
> = {
  arton: {
    label: 'Arton (Reinado & Além)',
    url: 'https://raw.githubusercontent.com/YuriAlessandro/artonMap/master/map_tiles/arton/{z}/{x}/{y}.png',
    minZoom: 3,
    maxZoom: 5,
    center: [-76, 93],
    zoom: 4,
  },
  doherimm: {
    label: 'Doherimm (Subterrâneo)',
    url: 'https://raw.githubusercontent.com/YuriAlessandro/artonMap/master/map_tiles/doherimm/{z}/{x}/{y}.png',
    minZoom: 2,
    maxZoom: 4,
    center: [-60, 60],
    zoom: 3,
  },
  lamnor: {
    label: 'Lamnor (Continente Sul)',
    url: 'https://raw.githubusercontent.com/YuriAlessandro/artonMap/master/map_tiles/lamnor/{z}/{x}/{y}.png',
    minZoom: 2,
    maxZoom: 4,
    center: [-60, 60],
    zoom: 3,
  },
  moreania: {
    label: 'Moreania (Ilha Nobre)',
    url: 'https://raw.githubusercontent.com/YuriAlessandro/artonMap/master/map_tiles/moreania/{z}/{x}/{y}.png',
    minZoom: 2,
    maxZoom: 4,
    center: [-60, 60],
    zoom: 3,
  },
  tamura: {
    label: 'Tamu-ra (Império de Jade)',
    url: 'https://raw.githubusercontent.com/YuriAlessandro/artonMap/master/map_tiles/tamura/{z}/{x}/{y}.png',
    minZoom: 2,
    maxZoom: 4,
    center: [-60, 60],
    zoom: 3,
  },
};

function createCircleDivIcon(bgColor: string, borderColor: string, size: number, label?: string) {
  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${bgColor};
      border:2px solid ${borderColor};
      box-shadow:0 0 8px rgba(0,0,0,0.85);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fff;
      font-weight:800;
      font-size:10px;
    ">${label || ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const ArtonMapTab: React.FC<ArtonMapTabProps> = ({ campaign, onUpdateCampaign }) => {
  const [viewType, setViewType] = useState<'world' | 'tactical'>('world');
  const [activeMapId, setActiveMapId] = useState<WorldMapId>('arton');
  const [toolMode, setToolMode] = useState<'pan' | 'moveParty' | 'measure' | 'addPin'>('pan');

  // Filtros do Mapa de Arton
  const [showCapitals, setShowCapitals] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showKingdoms, setShowKingdoms] = useState(false);
  const [showGmPins, setShowGmPins] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<ArtonCity | null>(null);

  // Novo Pino do Mestre
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinCat, setNewPinCat] = useState<CustomMapPin['category']>('Missão');
  const [newPinDesc, setNewPinDesc] = useState('');

  // Mapa Tático (Grid 1,5m)
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [tacticalMeasureStart, setTacticalMeasureStart] = useState<[number, number] | null>(null);
  const [tacticalMeasureEnd, setTacticalMeasureEnd] = useState<[number, number] | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlaysGroupRef = useRef<L.LayerGroup | null>(null);

  // Cálculo da distância da rota medida no mapa de Arton (fórmula oficial Fichas de Nimb: val * 43 km)
  const routePoints = campaign.travelRoute || [];
  let totalRouteKm = 0;
  for (let i = 1; i < routePoints.length; i++) {
    const [lat1, lng1] = routePoints[i - 1];
    const [lat2, lng2] = routePoints[i];
    const euclid = Math.hypot(lat2 - lat1, lng2 - lng1);
    totalRouteKm += Math.round(euclid * 43);
  }

  // Inicializa o Leaflet quando estiver no modo world
  useEffect(() => {
    if (viewType !== 'world' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const cfg = MAP_CONFIGS[activeMapId];
      const map = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple,
        minZoom: cfg.minZoom,
        maxZoom: cfg.maxZoom,
        zoomControl: true,
      });

      const tile = L.tileLayer(cfg.url, {
        minZoom: cfg.minZoom,
        maxZoom: cfg.maxZoom,
        tms: true,
        attribution: 'Mapa de Arton &copy; Jambô Editora / Fichas de Nimb',
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      map.setView(campaign.partyCoordinates || cfg.center, cfg.zoom);

      mapInstanceRef.current = map;
      tileLayerRef.current = tile;
      overlaysGroupRef.current = group;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        overlaysGroupRef.current = null;
      }
    };
  }, [viewType]);

  // Troca de mapa (Arton / Doherimm / Lamnor / Moreania / Tamu-ra)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;
    const cfg = MAP_CONFIGS[activeMapId];
    tileLayerRef.current.setUrl(cfg.url);
    map.setMinZoom(cfg.minZoom);
    map.setMaxZoom(cfg.maxZoom);
    map.setView(cfg.center, cfg.zoom);
  }, [activeMapId]);

  // Eventos de clique no mapa conforme a ferramenta ativa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const coord: [number, number] = [
        Number(e.latlng.lat.toFixed(4)),
        Number(e.latlng.lng.toFixed(4)),
      ];

      if (toolMode === 'moveParty') {
        onUpdateCampaign({ partyCoordinates: coord });
        setToolMode('pan');
      } else if (toolMode === 'measure') {
        onUpdateCampaign({ travelRoute: [...(campaign.travelRoute || []), coord] });
      } else if (toolMode === 'addPin') {
        const title = newPinTitle.trim() || window.prompt('Título do marcador do Mestre:') || '';
        if (!title) return;
        const pin: CustomMapPin = {
          id: `pin-${Date.now()}`,
          mapId: activeMapId,
          coordinates: coord,
          title,
          category: newPinCat,
          description: newPinDesc.trim() || 'Marcador personalizado do Mestre.',
          color: '#f97316',
        };
        onUpdateCampaign({ mapPins: [...campaign.mapPins, pin] });
        setNewPinTitle('');
        setNewPinDesc('');
        setToolMode('pan');
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [toolMode, activeMapId, campaign.travelRoute, campaign.mapPins, newPinTitle, newPinCat, newPinDesc]);

  // Renderiza camadas (Capitais, Cidades, Fronteiras dos Reinos, Pinos do Mestre, Posição do Grupo e Rota)
  useEffect(() => {
    const group = overlaysGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (activeMapId === 'arton') {
      // 1. Fronteiras dos Reinos
      if (showKingdoms) {
        kingdomsDef.forEach((k) => {
          const poly = L.polygon(k.coordinates, {
            color: k.color,
            weight: 2,
            fillOpacity: 0.14,
          });
          poly.bindTooltip(k.name, { sticky: true });
          poly.addTo(group);
        });
      }

      // 2. Capitais e Cidades Oficiais
      citiesDef.forEach((city) => {
        if (city.isCapital && !showCapitals) return;
        if (!city.isCapital && !showCities) return;

        const icon = city.isCapital
          ? createCircleDivIcon('#f59e0b', '#ffffff', 16, '★')
          : createCircleDivIcon('#dc2626', '#fca5a5', 11);

        const m = L.marker(city.coordinates, { icon, title: city.name });
        m.bindPopup(
          `<div style="max-width:260px;font-family:Inter,sans-serif;">
            <strong style="font-size:14px;color:#b91c1c;">${city.name}</strong>
            ${city.kingdom ? `<div style="font-size:11px;color:#555;margin-bottom:4px;">Reino: <b>${city.kingdom}</b> ${city.isCapital ? '(Capital)' : ''}</div>` : ''}
            <div style="font-size:12px;line-height:1.4;color:#222;">${
              city.description || 'Localidade registrada na cartografia de Arton.'
            }</div>
          </div>`
        );
        m.on('click', () => setSelectedCity(city));
        m.addTo(group);
      });
    }

    // 3. Pinos Personalizados do Mestre
    if (showGmPins) {
      campaign.mapPins
        .filter((p) => p.mapId === activeMapId)
        .forEach((pin) => {
          const icon = createCircleDivIcon('#9333ea', '#ffffff', 18, '!');
          const m = L.marker(pin.coordinates, { icon, title: pin.title });
          m.bindPopup(
            `<div style="max-width:240px;">
              <strong style="color:#9333ea;">[${pin.category}] ${pin.title}</strong>
              <p style="margin:6px 0;font-size:12px;">${pin.description}</p>
            </div>`
          );
          m.addTo(group);
        });
    }

    // 4. Rota de Viagem Medida
    if (routePoints.length > 0) {
      const polyline = L.polyline(routePoints, {
        color: '#f97316',
        weight: 4,
        dashArray: '8, 6',
      });
      polyline.addTo(group);
      routePoints.forEach((pt, idx) => {
        L.marker(pt, {
          icon: createCircleDivIcon('#f97316', '#fff', 14, String(idx + 1)),
        }).addTo(group);
      });
    }

    // 5. Posição Atual do Grupo (Party Token)
    if (activeMapId === 'arton' && campaign.partyCoordinates) {
      const partyIcon = L.divIcon({
        className: 'party-leaflet-icon',
        html: `<div style="
          padding:3px 8px;
          background:linear-gradient(135deg,#dc2626,#ea580c);
          color:#fff;
          font-weight:800;
          font-size:11px;
          border:2px solid #fff;
          border-radius:999px;
          box-shadow:0 0 14px rgba(220,38,38,0.95);
          white-space:nowrap;
        ">⚔ GRUPO</div>`,
        iconSize: [74, 26],
        iconAnchor: [37, 13],
      });
      const pm = L.marker(campaign.partyCoordinates, {
        icon: partyIcon,
        zIndexOffset: 1000,
      });
      pm.bindPopup(
        `<strong>Posição Atual do Grupo</strong><br/>Local: ${campaign.currentLocation}`
      );
      pm.addTo(group);
    }
  }, [
    activeMapId,
    showCapitals,
    showCities,
    showKingdoms,
    showGmPins,
    campaign.mapPins,
    campaign.partyCoordinates,
    campaign.travelRoute,
  ]);

  const flyToCity = (city: ArtonCity) => {
    setSelectedCity(city);
    if (activeMapId !== 'arton') setActiveMapId('arton');
    setTimeout(() => {
      mapInstanceRef.current?.setView(city.coordinates, 5);
    }, 50);
  };

  const filteredCities = citiesDef
    .filter(
      (c) =>
        !citySearch.trim() ||
        c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
        (c.kingdom && c.kingdom.toLowerCase().includes(citySearch.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Helpers para o Mapa Tático de Batalha
  const sizeToSquares = (sz: string): number => {
    if (sz === 'Grande') return 2;
    if (sz === 'Enorme') return 3;
    if (sz === 'Colossal') return 6;
    return 1;
  };

  const tacticalSquaresDist =
    tacticalMeasureStart && tacticalMeasureEnd
      ? Math.max(
          Math.abs(tacticalMeasureEnd[0] - tacticalMeasureStart[0]),
          Math.abs(tacticalMeasureEnd[1] - tacticalMeasureStart[1])
        )
      : 0;

  return (
    <div className="map-tab-wrapper">
      {/* Barra Superior de Alternância: Mapa de Arton vs Mapa Tático de Batalha */}
      <div className="t20-toolbar map-toolbar">
        <div className="toolbar-group">
          <button
            className={`btn-t20 ${viewType === 'world' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewType('world')}
          >
            <Globe size={15} /> Mapa de Arton (Atlas)
          </button>
          <button
            className={`btn-t20 ${viewType === 'tactical' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewType('tactical')}
          >
            <Grid size={15} /> Mapa Tático de Batalha (Grid 1,5m)
          </button>
        </div>

        {viewType === 'world' && (
          <>
            <div className="toolbar-group">
              {(Object.keys(MAP_CONFIGS) as WorldMapId[]).map((mId) => (
                <button
                  key={mId}
                  className={`btn-t20 btn-xs ${
                    activeMapId === mId ? 'btn-orange' : 'btn-ghost'
                  }`}
                  onClick={() => setActiveMapId(mId)}
                >
                  {mId.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="toolbar-group">
              <button
                className={`btn-t20 btn-xs ${
                  toolMode === 'moveParty' ? 'btn-orange' : 'btn-secondary'
                }`}
                onClick={() => setToolMode(toolMode === 'moveParty' ? 'pan' : 'moveParty')}
                title="Clique no mapa para posicionar o marcador do grupo"
              >
                <Navigation size={13} />{' '}
                {toolMode === 'moveParty' ? 'Clique no Mapa...' : 'Mover Grupo'}
              </button>
              <button
                className={`btn-t20 btn-xs ${
                  toolMode === 'measure' ? 'btn-orange' : 'btn-secondary'
                }`}
                onClick={() => setToolMode(toolMode === 'measure' ? 'pan' : 'measure')}
                title="Clique em vários pontos do mapa para medir distância em km e dias de viagem"
              >
                <Ruler size={13} />{' '}
                {toolMode === 'measure' ? 'Medindo Rota (Ativo)' : 'Régua de Viagem'}
              </button>
              {routePoints.length > 0 && (
                <button
                  className="btn-t20 btn-xs btn-danger-outline"
                  onClick={() => onUpdateCampaign({ travelRoute: [] })}
                >
                  Limpar Rota
                </button>
              )}
              <button
                className={`btn-t20 btn-xs ${
                  toolMode === 'addPin' ? 'btn-orange' : 'btn-secondary'
                }`}
                onClick={() => setToolMode(toolMode === 'addPin' ? 'pan' : 'addPin')}
              >
                <MapPin size={13} />{' '}
                {toolMode === 'addPin' ? 'Clique p/ Fixar Pino...' : '+ Pino do Mestre'}
              </button>
            </div>
          </>
        )}
      </div>

      {viewType === 'world' ? (
        <div className="arton-map-workspace">
          {/* Mapa Leaflet */}
          <div className="arton-leaflet-box">
            <div ref={mapContainerRef} className="leaflet-container-el" />

            {/* Banner Flutuante da Calculadora de Viagem quando há rota traçada */}
            {totalRouteKm > 0 && (
              <div className="travel-Overlay-card">
                <h4>
                  <Compass size={16} /> Calculadora de Viagem em Arton ({totalRouteKm} km)
                </h4>
                <div className="travel-speeds-grid">
                  <span>
                    🚶 <strong>A pé (36 km/dia):</strong> {Math.max(1, Math.round(totalRouteKm / 36))}{' '}
                    dias
                  </span>
                  <span>
                    ⛰️ <strong>Terreno Difícil / Carga (18 km/dia):</strong>{' '}
                    {Math.max(1, Math.round(totalRouteKm / 18))} dias
                  </span>
                  <span>
                    🐎 <strong>Cavalo / Montaria (54 km/dia):</strong>{' '}
                    {Math.max(1, Math.round(totalRouteKm / 54))} dias
                  </span>
                  <span>
                    ⛵ <strong>Navio (120 km/dia):</strong>{' '}
                    {Math.max(1, Math.round(totalRouteKm / 120))} dias
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Barra Lateral de Localidades de Arton, Camadas e Pinos do Mestre */}
          <div className="arton-sidebar">
            <div className="sidebar-section">
              <h4>Camadas do Mapa</h4>
              <div className="layer-toggles">
                <label>
                  <input
                    type="checkbox"
                    checked={showCapitals}
                    onChange={(e) => setShowCapitals(e.target.checked)}
                  />
                  ★ Capitais
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showCities}
                    onChange={(e) => setShowCities(e.target.checked)}
                  />
                  ● Cidades & Locais ({citiesDef.length})
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showKingdoms}
                    onChange={(e) => setShowKingdoms(e.target.checked)}
                  />
                  ⬡ Fronteiras dos Reinos
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showGmPins}
                    onChange={(e) => setShowGmPins(e.target.checked)}
                  />
                  ! Pinos do Mestre ({campaign.mapPins.length})
                </label>
              </div>
            </div>

            {/* Detalhe da Cidade Selecionada */}
            {selectedCity && (
              <div className="sidebar-section selected-city-card">
                <div className="city-card-head">
                  <strong>
                    {selectedCity.isCapital ? '★ ' : ''}
                    {selectedCity.name}
                  </strong>
                  {selectedCity.kingdom && (
                    <span className="kingdom-tag">{selectedCity.kingdom}</span>
                  )}
                </div>
                <p>
                  {selectedCity.description ||
                    'Localidade oficial do mapa de Arton.'}
                </p>
                <div className="city-card-actions">
                  <button
                    className="btn-t20 btn-xs btn-orange"
                    onClick={() =>
                      onUpdateCampaign({
                        partyCoordinates: selectedCity.coordinates,
                        currentLocation: `${selectedCity.name}${
                          selectedCity.kingdom ? ` (${selectedCity.kingdom})` : ''
                        }`,
                      })
                    }
                  >
                    <Flag size={12} /> Mover Grupo para Cá
                  </button>
                  <button
                    className="btn-t20 btn-xs btn-secondary"
                    onClick={() =>
                      onUpdateCampaign({
                        travelRoute: [...(campaign.travelRoute || []), selectedCity.coordinates],
                      })
                    }
                  >
                    + Traçar Rota até Aqui
                  </button>
                </div>
              </div>
            )}

            {/* Busca nas 223 Localidades Oficiais de Arton */}
            <div className="sidebar-section city-search-section">
              <h4>Localidades de Arton ({filteredCities.length})</h4>
              <div className="search-input-wrap">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Buscar cidade ou reino (ex: Valkaria, Tiberus, Ahlen)..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
              <div className="city-scroll-list">
                {filteredCities.map((city, i) => (
                  <button
                    key={`${city.name}-${i}`}
                    className="city-list-item"
                    onClick={() => flyToCity(city)}
                  >
                    <span>
                      {city.isCapital ? '★ ' : ''}
                      <strong>{city.name}</strong>
                    </span>
                    {city.kingdom && <small>{city.kingdom}</small>}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinos Personalizados do Mestre */}
            <div className="sidebar-section">
              <h4>Pinos do Mestre na Campanha</h4>
              <div className="pin-creator-mini">
                <input
                  type="text"
                  placeholder="Título do pino (ex: Ruínas de Ignis)"
                  value={newPinTitle}
                  onChange={(e) => setNewPinTitle(e.target.value)}
                />
                <div className="pin-row-2">
                  <select
                    value={newPinCat}
                    onChange={(e) => setNewPinCat(e.target.value as any)}
                  >
                    <option value="Missão">Missão</option>
                    <option value="Masmorra">Masmorra</option>
                    <option value="NPC">NPC</option>
                    <option value="Perigo">Perigo / Tormenta</option>
                    <option value="Cidade">Cidade / Vila</option>
                    <option value="Nota">Nota</option>
                  </select>
                  <button
                    className="btn-t20 btn-xs btn-primary"
                    onClick={() => setToolMode('addPin')}
                  >
                    Clicar no Mapa
                  </button>
                </div>
              </div>

              <div className="gm-pins-list">
                {campaign.mapPins.map((pin) => (
                  <div key={pin.id} className="gm-pin-item">
                    <div
                      className="gm-pin-text"
                      onClick={() => {
                        setActiveMapId(pin.mapId);
                        setTimeout(() => {
                          mapInstanceRef.current?.setView(pin.coordinates, 5);
                        }, 50);
                      }}
                    >
                      <strong>
                        [{pin.category}] {pin.title}
                      </strong>
                      <small>{pin.description}</small>
                    </div>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() =>
                        onUpdateCampaign({
                          mapPins: campaign.mapPins.filter((p) => p.id !== pin.id),
                        })
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODO MAPA TÁTICO DE BATALHA (GRID DE 1,5m SINCRONIZADO COM O COMBATE) */
        <div className="tactical-workspace">
          <div className="tactical-controls-bar">
            <span>
              <strong>Tabuleiro de Batalha (1 quadrado = 1,5m)</strong> — Arraste os tokens dos
              Jogadores e Ameaças do Combate!
            </span>
            <div className="tactical-inputs">
              <label>
                Imagem de Fundo (URL opcional):
                <input
                  type="text"
                  placeholder="https://... (ou deixe vazio para grid escuro)"
                  value={campaign.combat.tacticalBgUrl || ''}
                  onChange={(e) =>
                    onUpdateCampaign({
                      combat: { ...campaign.combat, tacticalBgUrl: e.target.value },
                    })
                  }
                />
              </label>
              {tacticalSquaresDist > 0 && (
                <span className="tactical-ruler-badge">
                  📏 Distância: <strong>{tacticalSquaresDist}q</strong> (
                  {tacticalSquaresDist * 1.5}m)
                </span>
              )}
            </div>
          </div>

          <div
            className="tactical-board-scroll"
            onMouseUp={() => setDraggingTokenId(null)}
          >
            <div
              className="tactical-grid"
              style={{
                gridTemplateColumns: `repeat(${campaign.combat.tacticalGridCols || 18}, 48px)`,
                gridTemplateRows: `repeat(${campaign.combat.tacticalGridRows || 12}, 48px)`,
                backgroundImage: campaign.combat.tacticalBgUrl
                  ? `url(${campaign.combat.tacticalBgUrl})`
                  : undefined,
              }}
            >
              {Array.from({
                length:
                  (campaign.combat.tacticalGridCols || 18) *
                  (campaign.combat.tacticalGridRows || 12),
              }).map((_, cellIdx) => {
                const cols = campaign.combat.tacticalGridCols || 18;
                const x = cellIdx % cols;
                const y = Math.floor(cellIdx / cols);
                return (
                  <div
                    key={cellIdx}
                    className="tactical-cell"
                    onMouseEnter={() => {
                      if (draggingTokenId) {
                        const nextCombatants = campaign.combat.combatants.map((c) =>
                          c.id === draggingTokenId ? { ...c, gridX: x, gridY: y } : c
                        );
                        onUpdateCampaign({
                          combat: { ...campaign.combat, combatants: nextCombatants },
                        });
                      } else if (tacticalMeasureStart) {
                        setTacticalMeasureEnd([x, y]);
                      }
                    }}
                    onClick={() => {
                      if (!tacticalMeasureStart) {
                        setTacticalMeasureStart([x, y]);
                        setTacticalMeasureEnd([x, y]);
                      } else {
                        setTacticalMeasureStart(null);
                        setTacticalMeasureEnd(null);
                      }
                    }}
                  >
                    <span className="cell-coord">
                      {x},{y}
                    </span>
                  </div>
                );
              })}

              {/* Tokens dos Combatentes */}
              {campaign.combat.combatants.map((c, idx) => {
                const sq = sizeToSquares(c.sizeCategory);
                const isTurn = idx === campaign.combat.turnIndex;
                return (
                  <div
                    key={c.id}
                    className={`tactical-token ${isTurn ? 'token-active-turn' : ''} ${
                      c.pvCurrent <= 0 ? 'token-down' : ''
                    }`}
                    style={{
                      left: `${(c.gridX || 0) * 48}px`,
                      top: `${(c.gridY || 0) * 48}px`,
                      width: `${sq * 48 - 4}px`,
                      height: `${sq * 48 - 4}px`,
                      backgroundColor: c.color,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingTokenId(c.id);
                    }}
                    title={`${c.name} (${c.sizeCategory}) — PV: ${c.pvCurrent}/${c.pvMax} | Def: ${c.defesa}`}
                  >
                    <span className="token-name">{c.name.slice(0, 10)}</span>
                    <span className="token-hp">
                      {c.pvCurrent}/{c.pvMax}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
