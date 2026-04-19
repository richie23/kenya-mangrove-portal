'use client';
'use client';
import { useRef, useCallback, useState } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerControl from './LayerControl';
import StatsPanel from './StatsPanel';
import AIChat from './AIChat';

const DEFAULT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DARK_STYLE    = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const SAT_STYLE     = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

const COUNTY_CENTERS = [
  { name: 'Lamu',       lng: 41.12, lat: -2.08, zoom: 9  },
  { name: 'Kilifi',     lng: 39.87, lat: -3.55, zoom: 10 },
  { name: 'Kwale',      lng: 39.38, lat: -4.42, zoom: 10 },
  { name: 'Mombasa',    lng: 39.62, lat: -4.02, zoom: 12 },
  { name: 'Tana River', lng: 40.52, lat: -2.52, zoom: 10 },
];

const COUNTY_DATA = [
  { name: 'Lamu',       area: 37350, degraded: 38.6, healthy: 61.4, blocks: ['Northern Swamps','North Central Swamps','Mongoni-Dodori Creek','Pate Island Swamps','Southern Swamps'], species: [{n:'Rhizophora mucronata',p:35},{n:'Ceriops tagal',p:28},{n:'Avicennia marina',p:22},{n:'Sonneratia alba',p:15}] },
  { name: 'Kilifi',     area: 8536,  degraded: 40.0, healthy: 60.0, blocks: ['Mtwapa Creek','Kilifi-Takaungu','Mida Creek','Ngomeni'],                                                  species: [{n:'Avicennia marina',p:42},{n:'Rhizophora mix',p:31},{n:'Ceriops mix',p:18},{n:'Sonneratia alba',p:9}] },
  { name: 'Kwale',      area: 8354,  degraded: 44.6, healthy: 55.4, blocks: ['Vanga-Funzi System','Gazi Bay','Ukunda'],                                                                  species: [{n:'Ceriops mix',p:40},{n:'Rhizophora mix',p:28},{n:'Avicennia marina',p:20},{n:'Sonneratia alba',p:12}] },
  { name: 'Mombasa',    area: 3771,  degraded: 49.1, healthy: 50.9, blocks: ['Port Reitz Creek','Tudor Creek','Mwache Creek','Bonje','Tsunza'],                                          species: [{n:'Rhizophora mucronata',p:46},{n:'Ceriops tagal',p:30},{n:'Avicennia marina',p:24}] },
  { name: 'Tana River', area: 3260,  degraded: 36.2, healthy: 63.8, blocks: ['Kipini Estuarine System','Mto Tana'],                                                                     species: [{n:'Avicennia marina',p:65},{n:'Avicennia mix',p:20},{n:'Bruguiera-Heritiera',p:15}] },
];

const BASEMAPS = [
  { id: 'light',   label: 'Light',  style: DEFAULT_STYLE },
  { id: 'dark',    label: 'Dark',   style: DARK_STYLE    },
  { id: 'voyager', label: 'Street', style: SAT_STYLE     },
];

interface ClickedFeature {
  longitude: number; latitude: number;
  county: string; species: string; area_ha: number; mgt_block: string;
}

interface DrawnResult {
  county: string; area: number; degraded: number; healthy: number;
  blocks: string[]; species: {n:string;p:number}[];
  carbonMin: number; carbonMax: number;
  featureCount: number; dominantSpecies: string; dominantBlock: string;
}

// Calculate polygon area in hectares using shoelace formula
function polygonAreaHa(points: [number,number][]): number {
  if (points.length < 3) return 0;
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  // Convert from degrees squared to hectares (rough at Kenya latitude)
  const DEG_TO_M = 111320;
  return Math.abs(area / 2) * DEG_TO_M * DEG_TO_M * Math.cos(-3 * Math.PI / 180) / 10000;
}

// Check if a point is inside a polygon using ray casting
function pointInPolygon(point: [number,number], polygon: [number,number][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export default function MangroveMap() {
  const mapRef = useRef<MapRef>(null);
  const [clicked, setClicked] = useState<ClickedFeature | null>(null);
  const [mapStyle, setMapStyle] = useState(DEFAULT_STYLE);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    'mangrove-fill': true,
    'mangrove-outline': true,
  });
  const [drawing, setDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number,number][]>([]);
  const [drawn, setDrawn] = useState<DrawnResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [analysing, setAnalysing] = useState(false);

  const handleFlyTo = useCallback((lng: number, lat: number, zoom: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat], zoom, duration: 2000,
        padding: { left: 420, top: 60, right: 60, bottom: 60 },
      });
    }
  }, []);

  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setLayerVisibility(prev => ({ ...prev, [layerId]: visible }));
  }, []);

  const startDrawing = useCallback(() => {
    setDrawing(true);
    setDrawPoints([]);
    setDrawn(null);
    setClicked(null);
    if (mapRef.current) mapRef.current.getMap().getCanvas().style.cursor = 'crosshair';
  }, []);

  const cancelDrawing = useCallback(() => {
    setDrawing(false);
    setDrawPoints([]);
    if (mapRef.current) mapRef.current.getMap().getCanvas().style.cursor = '';
  }, []);

  const finishDrawing = useCallback(() => {
    if (drawPoints.length < 3) {
      alert('Draw at least 3 points to form a polygon.');
      return;
    }
    setDrawing(false);
    if (mapRef.current) mapRef.current.getMap().getCanvas().style.cursor = '';
    setAnalysing(true);

    // Calculate polygon center
    const centerLng = drawPoints.reduce((s, p) => s + p[0], 0) / drawPoints.length;
    const centerLat = drawPoints.reduce((s, p) => s + p[1], 0) / drawPoints.length;

    // Calculate area
    const areaHa = polygonAreaHa(drawPoints);

    // Find nearest county by center point
    let matched = COUNTY_DATA[0];
    let minDist = Infinity;
    for (const cc of COUNTY_CENTERS) {
      const dist = Math.hypot(centerLng - cc.lng, centerLat - cc.lat);
      if (dist < minDist) {
        minDist = dist;
        matched = COUNTY_DATA.find(c => c.name === cc.name) || COUNTY_DATA[0];
      }
    }

    // Query rendered features from the map
    const countyCounts: Record<string,number> = {};
    const blockCounts: Record<string,number> = {};
    const speciesCounts: Record<string,number> = {};
    let featureCount = 0;

    if (mapRef.current) {
      try {
        const map = mapRef.current.getMap();
        const renderedFeatures = map.queryRenderedFeatures(undefined, {
          layers: ['mangrove-fill'],
        });

        // Filter features whose centroid is inside the drawn polygon
        for (const f of renderedFeatures) {
          if (!f.geometry) continue;
          let fLng = 0; let fLat = 0; let coordCount = 0;
          const geom = f.geometry as any;
          if (geom.type === 'Polygon' && geom.coordinates[0]) {
            for (const [x, y] of geom.coordinates[0]) { fLng += x; fLat += y; coordCount++; }
          } else if (geom.type === 'MultiPolygon' && geom.coordinates[0]?.[0]) {
            for (const [x, y] of geom.coordinates[0][0]) { fLng += x; fLat += y; coordCount++; }
          }
          if (coordCount === 0) continue;
          fLng /= coordCount; fLat /= coordCount;

          if (pointInPolygon([fLng, fLat], drawPoints)) {
            const p = f.properties || {};
            const county  = p.County    || 'Unknown';
            const block   = p.Mgt_Block || 'Unknown';
            const species = p.N_9       || 'Unknown';
            const area    = parseFloat(p.Area_ha || '0') || 0;
            countyCounts[county]   = (countyCounts[county]   || 0) + area;
            blockCounts[block]     = (blockCounts[block]     || 0) + area;
            speciesCounts[species] = (speciesCounts[species] || 0) + area;
            featureCount++;
          }
        }
      } catch { /* use fallback */ }
    }

    // Override matched county if we found real data
    const topCounty = Object.entries(countyCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
    if (topCounty && topCounty !== 'Unknown') {
      matched = COUNTY_DATA.find(c => c.name === topCounty) || matched;
    }

    const uniqueBlocks = [...new Set(
      Object.entries(blockCounts).sort((a,b)=>b[1]-a[1]).map(([b])=>b).filter(b=>b!=='Unknown')
    )].slice(0, 5);

    const totalSpArea = Object.values(speciesCounts).reduce((s,v)=>s+v, 0);
    const speciesBreakdown = Object.entries(speciesCounts)
      .sort((a,b)=>b[1]-a[1]).slice(0, 5)
      .map(([name, area]) => ({
        n: name,
        p: totalSpArea > 0 ? Math.round((area / totalSpArea) * 100) : 0,
      }));

    setDrawn({
      county: matched.name,
      area: Math.round(areaHa),
      degraded: matched.degraded,
      healthy: matched.healthy,
      blocks: uniqueBlocks.length > 0 ? uniqueBlocks : matched.blocks.slice(0, 3),
      species: speciesBreakdown.length > 0 ? speciesBreakdown : matched.species,
      carbonMin: Math.floor(areaHa * 500),
      carbonMax: Math.floor(areaHa * 1000),
      featureCount,
      dominantSpecies: speciesBreakdown[0]?.n || matched.species[0]?.n || 'Unknown',
      dominantBlock: uniqueBlocks[0] || matched.blocks[0] || 'Unknown',
    });

    setAnalysing(false);
    setDrawPoints([]);
  }, [drawPoints]);

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (drawing) {
      setDrawPoints(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
      return;
    }
    const features = e.features;
    if (!features || features.length === 0) { setClicked(null); return; }
    const props = features[0].properties;
    setClicked({
      longitude: e.lngLat.lng, latitude: e.lngLat.lat,
      county:    props?.County    || 'Unknown',
      species:   props?.N_9       || 'Unknown',
      area_ha:   props?.Area_ha   || 0,
      mgt_block: props?.Mgt_Block || 'Unknown',
    });
  }, [drawing]);

  // Build drawing preview GeoJSON
  const drawingGeoJSON = {
    type: 'FeatureCollection' as const,
    features: drawPoints.length >= 2 ? [
      {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: drawPoints.length >= 3
            ? [...drawPoints, drawPoints[0]]
            : drawPoints,
        },
      },
      ...drawPoints.map((pt, i) => ({
        type: 'Feature' as const,
        properties: { index: i },
        geometry: { type: 'Point' as const, coordinates: pt },
      })),
    ] : drawPoints.length === 1 ? [{
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Point' as const, coordinates: drawPoints[0] },
    }] : [],
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 52px)' }}>

      {/* Loading overlay */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(8,80,65,0.88)',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
          <div style={{
            width: '52px', height: '52px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTop: '4px solid #9FE1CB', borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: 0 }}>
            Loading Kenya Mangrove Data...
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
            Kenya Forest Service | KMFRI
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Analysing overlay */}
      {analysing && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(8,80,65,0.7)',
          zIndex: 40, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px',
        }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #9FE1CB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 }}>Analysing polygon...</p>
        </div>
      )}

      {/* Drawing instructions */}
      {drawing && (
        <div style={{
          position: 'absolute', top: '20px', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(8,80,65,0.92)', color: 'white',
          padding: '12px 20px', borderRadius: '12px',
          zIndex: 20, textAlign: 'center', pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700' }}>
            Drawing polygon â€” {drawPoints.length} point{drawPoints.length !== 1 ? 's' : ''} added
          </p>
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>
            Click on the map to add points. Click <strong>Finish</strong> when done (min 3 points).
          </p>
        </div>
      )}

      {/* Drawing control buttons */}
      {drawing && (
        <div style={{
          position: 'absolute', bottom: '100px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: '10px', zIndex: 20,
        }}>
          <button onClick={finishDrawing} disabled={drawPoints.length < 3}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: drawPoints.length >= 3 ? '#1D9E75' : '#888',
              color: 'white', fontSize: '13px', fontWeight: '700',
              cursor: drawPoints.length >= 3 ? 'pointer' : 'not-allowed',
              boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
            }}>
            Finish Polygon ({drawPoints.length} pts)
          </button>
          <button onClick={cancelDrawing}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: '#E24B4A', color: 'white',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
            }}>
            Cancel
          </button>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={{ longitude: 40.2, latitude: -3.0, zoom: 7 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactiveLayerIds={['mangrove-fill']}
        onClick={handleMapClick}
        cursor={drawing ? 'crosshair' : 'pointer'}
        onLoad={() => setLoaded(true)}
      >
        {/* Mangrove layer */}
        <Source
          id="kenya-mangroves"
          type="geojson"
          data="https://github.com/richie23/kenya-mangrove-portal/releases/download/v1.0/kenya_mangroves_4326.geojson"
          generateId={true}
          buffer={0}
          tolerance={0.5}
        >
          <Layer
            id="mangrove-fill"
            type="fill"
            layout={{ visibility: layerVisibility['mangrove-fill'] ? 'visible' : 'none' }}
            paint={{
              'fill-color': [
                'match', ['get', 'County'],
                'Lamu',       '#1D9E75',
                'Kilifi',     '#0F6E56',
                'Kwale',      '#5DCAA5',
                'Tana River', '#085041',
                'Mombasa',    '#9FE1CB',
                '#1D9E75'
              ],
              'fill-opacity': drawing ? 0.85 : 0.75,
            }}
          />
          <Layer
            id="mangrove-outline"
            type="line"
            layout={{ visibility: layerVisibility['mangrove-outline'] ? 'visible' : 'none' }}
            paint={{
              'line-color': drawing ? '#FFD700' : '#085041',
              'line-width': drawing ? 1.5 : 0.4,
            }}
          />
        </Source>

        {/* Drawing preview */}
        {drawing && drawPoints.length > 0 && (
          <Source id="drawing" type="geojson" data={drawingGeoJSON}>
            <Layer
              id="drawing-line"
              type="line"
              filter={['==', '$type', 'LineString']}
              paint={{
                'line-color': '#FFD700',
                'line-width': 2.5,
                'line-dasharray': [2, 1],
              }}
            />
            <Layer
              id="drawing-points"
              type="circle"
              filter={['==', '$type', 'Point']}
              paint={{
                'circle-radius': 6,
                'circle-color': '#FFD700',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#085041',
              }}
            />
          </Source>
        )}

        {clicked && !drawing && (
          <Popup
            longitude={clicked.longitude}
            latitude={clicked.latitude}
            anchor="bottom"
            onClose={() => setClicked(null)}
            closeButton={true}
            closeOnClick={false}
            maxWidth="300px"
          >
            <div style={{ padding: '6px 4px', fontFamily: 'Arial' }}>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#0F6E56',
                margin: '0 0 10px', borderBottom: '2px solid #E1F5EE', paddingBottom: '8px' }}>
                {clicked.county} County
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Species',   clicked.species],
                    ['Area',      `${Number(clicked.area_ha).toFixed(2)} ha`],
                    ['Mgt Block', clicked.mgt_block],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ fontSize: '12px', color: '#888', padding: '4px 0', width: '40%' }}>{label}</td>
                      <td style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '600',
                        padding: '4px 0', paddingLeft: '10px' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Popup>
        )}
      </Map>

      <StatsPanel
        onFlyTo={handleFlyTo}
        onStartDraw={startDrawing}
        isDrawing={drawing}
        drawnResult={drawn}
        onClearDraw={() => setDrawn(null)}
      />

      <LayerControl onToggle={handleLayerToggle} />

      {/* Basemap toggle â€” right side above chat */}
      <div style={{
        position: 'absolute', bottom: '120px', right: '10px', zIndex: 10,
        background: 'white', borderRadius: '10px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        overflow: 'hidden', border: '0.5px solid #ddd',
      }}>
        <p style={{ fontSize: '9px', color: '#888', margin: 0,
          padding: '6px 10px 4px', fontWeight: '700',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          borderBottom: '0.5px solid #eee' }}>Basemap</p>
        {BASEMAPS.map(b => (
          <button key={b.id} onClick={() => setMapStyle(b.style)}
            style={{
              display: 'block', width: '100%', padding: '7px 14px',
              textAlign: 'left', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: mapStyle === b.style ? '700' : '400',
              color: mapStyle === b.style ? '#0F6E56' : '#555',
              background: mapStyle === b.style ? '#E1F5EE' : 'white',
              borderLeft: mapStyle === b.style ? '3px solid #0F6E56' : '3px solid transparent',
            }}>
            {b.label}
          </button>
        ))}
      </div>

      <AIChat />
    </div>
  );
}

