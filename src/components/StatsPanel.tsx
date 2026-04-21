'use client';
import { useState, useRef, useMemo } from 'react';

const COUNTIES = [
  { name: 'Lamu',       area: 37350, degraded: 38.6, healthy: 61.4, color: '#1D9E75', lng: 41.12, lat: -2.08, zoom: 9,  blocks: ['Northern Swamps','North Central Swamps','Mongoni-Dodori Creek','Pate Island Swamps','Southern Swamps'], species: [{n:'Rhizophora mucronata',p:35},{n:'Ceriops tagal',p:28},{n:'Avicennia marina',p:22},{n:'Sonneratia alba',p:15}], carbon_min:500, carbon_max:1000, fishers:8000, threats:['Illegal harvesting','Pollution and oil spills','Overexploitation of poles','Coastal development'], ecosystem_val:269448, restoration_target:1000, density:2225, volume:383, note:'Largest county - 62% of Kenya mangroves. Kiunga Marine Reserve holds 7,628 ha.' },
  { name: 'Kilifi',     area: 8536,  degraded: 40.0, healthy: 60.0, color: '#0F6E56', lng: 39.87, lat: -3.55, zoom: 10, blocks: ['Mtwapa Creek','Kilifi-Takaungu','Mida Creek','Ngomeni'],                                                  species: [{n:'Avicennia marina',p:42},{n:'Rhizophora mix',p:31},{n:'Ceriops mix',p:18},{n:'Sonneratia alba',p:9}],  carbon_min:500, carbon_max:1000, fishers:4500, threats:['Illegal harvesting','Climate change','Soil erosion','Aquaculture conversion'], ecosystem_val:269448, restoration_target:800, density:3227, volume:102, note:'Longest coastline. Ngomeni covers 50% of county total. Mida Creek in Watamu MPA.' },
  { name: 'Kwale',      area: 8354,  degraded: 44.6, healthy: 55.4, color: '#5DCAA5', lng: 39.38, lat: -4.42, zoom: 10, blocks: ['Vanga-Funzi System','Gazi Bay','Ukunda'],                                                                  species: [{n:'Ceriops mix',p:40},{n:'Rhizophora mix',p:28},{n:'Avicennia marina',p:20},{n:'Sonneratia alba',p:12}], carbon_min:500, carbon_max:1000, fishers:3500, threats:['Illegal harvesting','Rice farm conversion','Climate change','River damming'], ecosystem_val:269448, restoration_target:900, density:3327, volume:94, note:'Mikoko Pamoja carbon project at Gazi Bay earns KES 1.2M/yr for the community.' },
  { name: 'Mombasa',    area: 3771,  degraded: 49.1, healthy: 50.9, color: '#085041', lng: 39.62, lat: -4.02, zoom: 12, blocks: ['Port Reitz Creek','Tudor Creek','Mwache Creek','Bonje','Tsunza'],                                          species: [{n:'Rhizophora mucronata',p:46},{n:'Ceriops tagal',p:30},{n:'Avicennia marina',p:24}],             carbon_min:100, carbon_max:400,  fishers:2000, threats:['Oil pollution','Urban encroachment','Illegal harvesting','Sedimentation'], ecosystem_val:269448, restoration_target:400, density:1636, volume:7, note:'Most degraded county at 49.1%. Tudor Creek lost 80% cover. Makupa Creek destroyed 1988.' },
  { name: 'Tana River', area: 3260,  degraded: 36.2, healthy: 63.8, color: '#9FE1CB', lng: 40.52, lat: -2.52, zoom: 10,  blocks: ['Kipini Estuarine System','Mto Tana'],                                                                     species: [{n:'Avicennia marina',p:65},{n:'Avicennia mix',p:20},{n:'Bruguiera-Heritiera',p:15}],             carbon_min:500, carbon_max:800,  fishers:2500, threats:['Illegal cutting','Sea level rise','Settlement encroachment','River diversion'], ecosystem_val:269448, restoration_target:300, density:2218, volume:207, note:'Only riverine mangrove in Kenya. Only Heritiera stand. Ramsar site designated 2012.' },
];

const SPECIES_DATA = [
  { name: 'Rhizophora mucronata', local: 'Mkoko',        area: 31000, risk: 'High risk', rcolor: '#E24B4A', use: 'Construction poles, fuel wood', dominant: 'Lamu, Kwale, Kilifi' },
  { name: 'Ceriops tagal',        local: 'Mkandaa',      area: 20000, risk: 'High risk', rcolor: '#E24B4A', use: 'Construction poles, fuel wood', dominant: 'Kwale, Lamu' },
  { name: 'Avicennia marina',     local: 'Mchu',         area: 15000, risk: 'Stable',    rcolor: '#1D9E75', use: 'Fuel wood, medicine',           dominant: 'Tana River, Lamu' },
  { name: 'Sonneratia alba',      local: 'Msambarau',    area: 2800,  risk: 'Stable',    rcolor: '#1D9E75', use: 'Limited commercial use',        dominant: 'Lamu, Kilifi' },
  { name: 'Bruguiera gymnorhiza', local: 'Muia',         area: 1200,  risk: 'Stable',    rcolor: '#1D9E75', use: 'Timber, traditional medicine',  dominant: 'Kwale (Gazi)' },
  { name: 'Xylocarpus granatum',  local: 'Mkomafi',      area: 400,   risk: 'At risk',   rcolor: '#BA7517', use: 'High quality timber',           dominant: 'Kwale, Kilifi' },
  { name: 'Heritiera littoralis', local: 'Msanga',       area: 300,   risk: 'Unique',    rcolor: '#534AB7', use: 'Boat masts, timber',            dominant: 'Tana River ONLY' },
  { name: 'Lumnitzera racemosa',  local: 'Mzingifungu',  area: 10,    risk: 'Rare',      rcolor: '#888888', use: 'Fuel wood',                     dominant: 'Kwale (Vanga)' },
  { name: 'Ceriops decandra',     local: 'Mkandaa mdogo',area: 50,    risk: 'Rare',      rcolor: '#888888', use: 'Limited use',                   dominant: 'South coast' },
];

const ECOSYSTEM_SERVICES = [
  { service: 'Shoreline protection', value: 134866 },
  { service: 'Education & Research', value: 65470 },
  { service: 'Building poles', value: 30660 },
  { service: 'Carbon sequestration', value: 21896 },
  { service: 'Onsite fisheries', value: 9613 },
  { service: 'Fuel wood', value: 4505 },
  { service: 'Beekeeping', value: 1250 },
  { service: 'Tourism', value: 782 },
  { service: 'Aquaculture', value: 408 },
];

const PROGRAMMES = [
  { name: 'Forest Conservation and Utilization', budget: 420, lead: 'KFS' },
  { name: 'Fisheries Development and Management', budget: 180, lead: 'State Dept of Fisheries' },
  { name: 'Community Programme', budget: 310, lead: 'KFS + County Governments' },
  { name: 'Research and Education', budget: 250, lead: 'KMFRI + KEFRI + Universities' },
  { name: 'Tourism Development', budget: 290, lead: 'KFS + KWS + KTB' },
  { name: 'Human Resource and Operations', budget: 360, lead: 'KFS + KWS' },
];

const DEGRADATION_DATA = [
  { county:'Lamu',       station:'Lamu',          sites:73, degraded:56, rehabilitated:11, restored:6,  ha:64,  pctDeg:76.7, pctReh:15.1, pctRes:8.2  },
  { county:'Kilifi',     station:'Jilore/Gede/Arabuko', sites:37, degraded:25, rehabilitated:2,  restored:10, ha:656, pctDeg:67.6, pctReh:5.4,  pctRes:27.0 },
  { county:'Kwale',      station:'Mwache/Buda',   sites:68, degraded:33, rehabilitated:28, restored:7,  ha:277, pctDeg:48.5, pctReh:41.2, pctRes:10.3 },
  { county:'Mombasa',    station:'Mombasa',        sites:6,  degraded:4,  rehabilitated:1,  restored:1,  ha:153, pctDeg:66.7, pctReh:16.7, pctRes:16.7 },
  { county:'Tana River', station:'Kipini',         sites:8,  degraded:7,  rehabilitated:0,  restored:1,  ha:22,  pctDeg:87.5, pctReh:0.0,  pctRes:12.5 },
];

const DEG_BY_LEVEL = [
  { level:'Highly Degraded',     count:57, color:'#E24B4A' },
  { level:'Moderately Degraded', count:63, color:'#BA7517' },
  { level:'Intact/Low Degraded', count:5,  color:'#1D9E75' },
  { level:'Unknown',             count:67, color:'#aaaaaa' },
];

const DEG_BY_NATURE = [
  { nature:'Degraded',        count:125, color:'#E24B4A' },
  { nature:'Rehabilitation',  count:42,  color:'#BA7517' },
  { nature:'Restored',        count:25,  color:'#1D9E75' },
];

const DEG_STATIONS = [
  { station:'Lamu',          county:'Lamu',       count:73, color:'#1D9E75' },
  { station:'Buda',          county:'Kwale',      count:45, color:'#5DCAA5' },
  { station:'Mwache',        county:'Kwale',      count:23, color:'#5DCAA5' },
  { station:'Jilore',        county:'Kilifi',     count:21, color:'#0F6E56' },
  { station:'Arabuko Sokoke',county:'Kilifi',     count:9,  color:'#0F6E56' },
  { station:'Kipini',        county:'Tana River', count:8,  color:'#9FE1CB' },
  { station:'Gede',          county:'Kilifi',     count:7,  color:'#0F6E56' },
  { station:'Mombasa',       county:'Mombasa',    count:6,  color:'#085041' },
];

const STAKEHOLDERS_DATA = [
  { restored:'Eden Project',     station:'Sokoke', block:'Mida',    category:'Private Company', framework:'With',    species:'Avicennia marina (Mchu)',       source:'Community', survival:'21-40%'  },
  { restored:'Eden Project',     station:'Jilore', block:'Ngomeni', category:'NGO',             framework:'With',    species:'Mixed Species',                 source:'CFA',       survival:'81-100%' },
  { restored:'Nature Kenya',     station:'Sokoke', block:'Ngomeni', category:'NGO',             framework:'Without', species:'Ceriops tagal (Mkandaa)',       source:'CFA',       survival:'0-20%'   },
  { restored:'KFS Restoration',  station:'Gede',   block:'Mida',    category:'Government Agency',framework:'With',    species:'Rhizophora mucronata (Mkoko)',  source:'KFS',       survival:'61-80%'  },
  { restored:'WWF Project',      station:'Jilore', block:'Ngomeni', category:'NGO',             framework:'With',    species:'Mixed Species',                 source:'CFA',       survival:'41-60%'  },
];

const STAK_CATEGORIES = [
  { category:'NGO',              count:84, color:'#185FA5' },
  { category:'Government Agency',count:5,  color:'#0F6E56' },
  { category:'Private Company',  count:1,  color:'#534AB7' },
];

const STAK_FRAMEWORK = [
  { label:'With Framework',    count:57, color:'#1D9E75' },
  { label:'Without Framework', count:33, color:'#E24B4A' },
];

const STAK_SPECIES = [
  { species:'Rhizophora mucronata (Mkoko)', count:32, color:'#1D9E75'  },
  { species:'Ceriops tagal (Mkandaa)',      count:31, color:'#0F6E56'  },
  { species:'Mixed Species',               count:19, color:'#5DCAA5'  },
  { species:'Avicennia marina (Mchu)',      count:2,  color:'#085041'  },
  { species:'Sonneratia alba (Mlilana)',    count:1,  color:'#9FE1CB'  },
  { species:'Bruguiera gymnorhiza (Muia)', count:1,  color:'#534AB7'  },
];

const STAK_SOURCES = [
  { source:'CFA',               count:42, color:'#1D9E75' },
  { source:'Community',         count:22, color:'#0F6E56' },
  { source:'Individuals',       count:22, color:'#5DCAA5' },
  { source:'Kenya Forest Service',count:2,color:'#085041' },
  { source:'Private Nursery',   count:2,  color:'#9FE1CB' },
];

const STAK_SURVIVAL = [
  { range:'61-80%',  count:36, color:'#1D9E75' },
  { range:'41-60%',  count:29, color:'#5DCAA5' },
  { range:'81-100%', count:17, color:'#085041' },
  { range:'21-40%',  count:5,  color:'#BA7517' },
  { range:'0-20%',   count:3,  color:'#E24B4A' },
];

const STAK_STATIONS = [
  { station:'Sokoke', count:37, color:'#1D9E75' },
  { station:'Jilore', count:33, color:'#0F6E56' },
  { station:'Gede',   count:20, color:'#5DCAA5' },
];


const TABS = [
  { key: 'map',         label: 'Map',         emoji: 'MAP', color: '#0F6E56' },
  { key: 'species',     label: 'Species',     emoji: 'SPP', color: '#1D9E75' },
  { key: 'totals',      label: 'Totals',      emoji: 'TOT', color: '#085041' },
  { key: 'carbon',      label: 'Blue Carbon', emoji: 'BLC', color: '#0F6E56' },
  { key: 'documents',   label: 'Documents',   emoji: 'DOC', color: '#185FA5' },
  { key: 'restoration', label: 'Restoration', emoji: 'RES', color: '#5DCAA5' },
  { key: 'degradation', label: 'Degradation', emoji: 'DEG', color: '#E24B4A' },
  { key: 'stakeholders', label: 'Stakeholders', emoji: 'STK', color: '#534AB7' },
  { key: 'alldata',     label: 'All Data',    emoji: 'ALL', color: '#E24B4A' },
];

const LANGS: Record<string, { welcome: string; title: string; sub: string; search: string; draw: string; cancel: string }> = {
  English:   { welcome: 'WELCOME TO THE', title: 'Kenya Mangrove Portal',   sub: 'National Mangrove Ecosystem Data | KFS | KMFRI', search: 'Search county, species, block...', draw: 'Draw on Map',    cancel: 'Cancel' },
  Kiswahili: { welcome: 'KARIBU',         title: 'Mfumo wa Mikoko Kenya',   sub: 'Takwimu za Mfumo wa Ikolojia | KFS | KMFRI',    search: 'Tafuta wilaya, spishi...',         draw: 'Chora Ramani',  cancel: 'Ghairi' },
  French:    { welcome: 'BIENVENUE',      title: 'Portail Mangroves Kenya', sub: 'Donnees Ecosysteme National | KFS | KMFRI',      search: 'Rechercher...',                    draw: 'Dessiner Carte', cancel: 'Annuler' },
  Spanish:   { welcome: 'BIENVENIDO',     title: 'Portal Manglares Kenya',  sub: 'Datos Ecosistema Nacional | KFS | KMFRI',        search: 'Buscar...',                        draw: 'Dibujar Mapa',  cancel: 'Cancelar' },
  Italian:   { welcome: 'BENVENUTO',      title: 'Portale Mangrovie Kenya', sub: 'Dati Ecosistema Nazionale | KFS | KMFRI',        search: 'Cerca...',                         draw: 'Disegna Mappa', cancel: 'Annulla' },
};

const PIE_COLORS = ['#1D9E75', '#0F6E56', '#5DCAA5', '#085041', '#9FE1CB', '#E24B4A'];
const DATA_SOURCE = 'Source: Kenya National Mangrove Ecosystem Management Plan 2017-2027 | KFS | KMFRI';

interface DrawnResult {
  county: string; area: number; degraded: number; healthy: number;
  blocks: string[]; species: { n: string; p: number }[];
  carbonMin: number; carbonMax: number;
}
interface StatsPanelProps {
  onFlyTo?: (lng: number, lat: number, zoom: number) => void;
  onStartDraw?: () => void;
  isDrawing?: boolean;
  drawnResult?: DrawnResult | null;
  onClearDraw?: () => void;
  onViewReport?: (name: string) => void;
  onViewAll?: () => void;
}

function PieChart({ data, size = 90 }: { data: { n: string; p: number }[]; size?: number }) {
  let offset = 0; const r = 15.9; const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      {data.map((s, i) => {
        const dash = (s.p / 100) * circ; const gap = circ - dash;
        const el = <circle key={s.n} cx="18" cy="18" r={r} fill="none" stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth="5" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-(offset / 100) * circ} />;
        offset += s.p; return el;
      })}
      <circle cx="18" cy="18" r="10" fill="white" />
    </svg>
  );
}

function MiniBarChart({ data, color = '#1D9E75', height = 110 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: `${height}px`, padding: '0 2px' }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '9px', color: '#555', fontWeight: '700', textAlign: 'center' }}>{d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}</span>
          <div style={{ width: '100%', background: '#e8e8e8', borderRadius: '3px 3px 0 0', height: `${Math.max((d.value / max) * 80, 4)}px` }}>
            <div style={{ background: color, borderRadius: '3px 3px 0 0', height: '100%', width: '100%' }} />
          </div>
          <span style={{ fontSize: '8px', color: '#888', textAlign: 'center', lineHeight: 1.1 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 80 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0; const r = 15.9; const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {data.map(d => {
        const pct = d.value / total; const dash = pct * circ; const gap = circ - dash;
        const el = <circle key={d.label} cx="18" cy="18" r={r} fill="none" stroke={d.color} strokeWidth="6" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} />;
        offset += pct * circ; return el;
      })}
      <circle cx="18" cy="18" r="11" fill="white" />
    </svg>
  );
}

// - CSV EXPORTS -
function exportCountyCSV(c: typeof COUNTIES[0]) {
  const dHa = Math.round(c.area * c.degraded / 100);
  const hHa = Math.round(c.area * c.healthy / 100);
  const rows: (string | number)[][] = [
    ['KENYA NATIONAL MANGROVE ECOSYSTEM MANAGEMENT PLAN 2017-2027'],
    [`${c.name} County - Full Dataset Report`],
    [`Generated: ${new Date().toLocaleDateString()}`],
    ['Lead Agency: Kenya Forest Service (KFS) | Research: KMFRI | KEFRI'],
    [''],
    ['SECTION 1: AREA DATA'],
    ['Parameter', 'Value', 'Unit'],
    ['Total mangrove area', c.area, 'ha'],
    ['Degraded area', dHa, 'ha'],
    ['Healthy area', hHa, 'ha'],
    ['Degradation rate', c.degraded, '%'],
    ['National share', +((c.area / 61271) * 100).toFixed(1), '% of Kenya total'],
    ['Stand density', c.density, 'stems/ha'],
    ['Standing volume', c.volume, 'm3/ha'],
    ['Restoration target', c.restoration_target, 'ha/yr'],
    [''],
    ['SECTION 2: MANAGEMENT BLOCKS'],
    ['Block Name'],
    ...c.blocks.map(b => [b]),
    [''],
    ['SECTION 3: SPECIES COMPOSITION'],
    ['Species', 'Proportion (%)'],
    ...c.species.map(s => [s.n, s.p]),
    [''],
    ['SECTION 4: BLUE CARBON DATA'],
    ['Parameter', 'Value', 'Unit'],
    ['Carbon stock minimum', c.carbon_min, 'tC/ha'],
    ['Carbon stock maximum', c.carbon_max, 'tC/ha'],
    ['Total carbon minimum', c.area * c.carbon_min, 'tC'],
    ['Total carbon maximum', c.area * c.carbon_max, 'tC'],
    [''],
    ['SECTION 5: ECOSYSTEM SERVICES'],
    ['Service', 'Value (KES/ha/yr)', 'County Total (KES/yr)'],
    ...ECOSYSTEM_SERVICES.map(e => [e.service, e.value, c.area * e.value]),
    ['TOTAL', c.ecosystem_val, c.area * c.ecosystem_val],
    [''],
    ['SECTION 6: DRIVERS OF DEGRADATION'],
    ['Rank', 'Threat / Driver'],
    ...c.threats.map((t, i) => [i + 1, t]),
    [''],
    ['SECTION 7: SOCIOECONOMIC DATA'],
    ['Artisanal fishers supported', c.fishers],
    ['Restoration target (ha/yr)', c.restoration_target],
    [''],
    ['SECTION 8: MANAGEMENT PROGRAMMES'],
    ['Programme', 'Budget (KES M)', 'Lead Agency'],
    ...PROGRAMMES.map(p => [p.name, p.budget, p.lead]),
    ['TOTAL', PROGRAMMES.reduce((s, p) => s + p.budget, 0), ''],
    [''],
    ['NOTES'], [c.note],
    ['SOURCE: GoK (2017). National Mangrove Ecosystem Management Plan. KFS, Nairobi.'],
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `Kenya_Mangrove_${c.name}_Report.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportAllCSV() {
  const rows: (string | number)[][] = [
    ['KENYA NATIONAL MANGROVE ECOSYSTEM MANAGEMENT PLAN 2017-2027'],
    ['ALL COUNTIES - COMPREHENSIVE DATASET'],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [''],
    ['SECTION 1: COUNTY SUMMARY'],
    ['County', 'Total Area (ha)', 'Degraded (ha)', 'Healthy (ha)', '% Degraded', '% Healthy', 'Density (stems/ha)', 'Volume (m3/ha)', 'Fishers', 'Carbon Min (tC/ha)', 'Carbon Max (tC/ha)', 'Total Carbon Min (tC)', 'Total Carbon Max (tC)', 'Ecosystem Value (KES/yr)', 'Restoration Target (ha/yr)', 'Mgt Blocks'],
    ...COUNTIES.map(c => [c.name, c.area, Math.round(c.area*c.degraded/100), Math.round(c.area*c.healthy/100), c.degraded, c.healthy, c.density, c.volume, c.fishers, c.carbon_min, c.carbon_max, c.area*c.carbon_min, c.area*c.carbon_max, c.area*c.ecosystem_val, c.restoration_target, c.blocks.length]),
    ['KENYA TOTAL', 61271, 24585, 36686, 40.1, 59.9, '', '', 20000, '', '', COUNTIES.reduce((s,c)=>s+c.area*c.carbon_min,0), COUNTIES.reduce((s,c)=>s+c.area*c.carbon_max,0), COUNTIES.reduce((s,c)=>s+c.area*c.ecosystem_val,0), COUNTIES.reduce((s,c)=>s+c.restoration_target,0), COUNTIES.reduce((s,c)=>s+c.blocks.length,0)],
    [''],
    ['SECTION 2: MANAGEMENT BLOCKS BY COUNTY'],
    ['County', 'Block Name'],
    ...COUNTIES.flatMap(c => c.blocks.map(b => [c.name, b])),
    [''],
    ['SECTION 3: SPECIES BY COUNTY'],
    ['County', 'Species', 'Proportion (%)'],
    ...COUNTIES.flatMap(c => c.species.map(s => [c.name, s.n, s.p])),
    [''],
    ['SECTION 4: THREATS BY COUNTY'],
    ['County', 'Rank', 'Threat / Driver'],
    ...COUNTIES.flatMap(c => c.threats.map((t,i) => [c.name, i+1, t])),
    [''],
    ['SECTION 5: NATIONAL SPECIES INVENTORY'],
    ['Scientific Name', 'Local Name', 'Area (ha)', 'Risk Status', 'Primary Use', 'Dominant Counties'],
    ...SPECIES_DATA.map(s => [s.name, s.local, s.area, s.risk, s.use, s.dominant]),
    [''],
    ['SECTION 6: ECOSYSTEM SERVICES (KES/ha/yr)'],
    ['Service', 'National Value', ...COUNTIES.map(c => `${c.name} (KES/yr)`), 'Kenya Total (KES/yr)'],
    ...ECOSYSTEM_SERVICES.map(e => [e.service, e.value, ...COUNTIES.map(c => c.area*e.value), COUNTIES.reduce((s,c)=>s+c.area*e.value,0)]),
    ['TOTAL', 269448, ...COUNTIES.map(c => c.area*269448), COUNTIES.reduce((s,c)=>s+c.area*269448,0)],
    [''],
    ['SECTION 7: MANAGEMENT PROGRAMMES'],
    ['Programme', 'Budget (KES M)', 'Lead Agency'],
    ...PROGRAMMES.map(p => [p.name, p.budget, p.lead]),
    ['TOTAL', PROGRAMMES.reduce((s,p)=>s+p.budget,0), '10-year 2017-2027'],
    [''],
    ['SECTION 8: LEGAL FRAMEWORK'],
    ['Legislation', 'Relevance'],
    ['Forest Conservation and Management Act 2016', 'Primary legislation'],
    ['Wildlife Conservation and Management Act 2013', 'Marine Protected Areas'],
    ['EMCA 1999', 'Environmental safeguards'],
    ['Fisheries Act 2012', 'Fish breeding area protection'],
    ['Constitution of Kenya 2010 Art 69', 'Sustainable environment'],
    ['UNFCCC / REDD+', 'Carbon credit mechanisms'],
    ['Ramsar Convention 1971', 'Tana River Delta 2012'],
    [''],
    ['SOURCE: GoK (2017). National Mangrove Ecosystem Management Plan. KFS, Nairobi.'],
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = 'Kenya_Mangrove_All_Counties_Report.csv'; a.click();
  URL.revokeObjectURL(url);
}

// - PDF HELPERS -
function hexToRgb(hex: string): [number, number, number] {
  try {
    const clean = (hex || '#085041').replace('#', '').replace(/[^0-9a-fA-F]/g, '0').padEnd(6, '0').slice(0, 6);
    const r = parseInt(clean.slice(0,2), 16);
    const g = parseInt(clean.slice(2,4), 16);
    const b = parseInt(clean.slice(4,6), 16);
    const safe = (n: number) => isNaN(n) ? 0 : Math.min(255, Math.max(0, n));
    return [safe(r), safe(g), safe(b)];
  } catch {
    return [8, 80, 65];
  }
}

// - COUNTY PDF -
async function exportCountyPDF(c: typeof COUNTIES[0]) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; const H = 297; const M = 14; const CW = W - M * 2;
  let y = M;

  function rgb(hex: string): [number,number,number] {
    try {
      const h = (hex||'#000000').replace('#','').replace(/[^0-9a-fA-F]/g,'0').padEnd(6,'0').slice(0,6);
      const safe = (n:number) => isNaN(n)?0:Math.min(255,Math.max(0,n));
      return [safe(parseInt(h.slice(0,2),16)),safe(parseInt(h.slice(2,4),16)),safe(parseInt(h.slice(4,6),16))];
    } catch { return [8,80,65]; }
  }
  const sf = (hex:string) => { const [r,g,b]=rgb(hex); doc.setFillColor(r,g,b); };
  const st = (hex:string) => { const [r,g,b]=rgb(hex); doc.setTextColor(r,g,b); };
  const sd = (hex:string) => { const [r,g,b]=rgb(hex); doc.setDrawColor(r,g,b); };
  const check = (n=12) => { if (y+n>H-M-14) { doc.addPage(); y=M; } };

  const section = (title:string) => {
    check(16); y+=4;
    sf('#085041'); doc.rect(M,y-6,CW,10,'F');
    doc.setFontSize(11); doc.setFont('helvetica','bold'); st('#FFFFFF');
    doc.text(title, M+3, y); y+=9;
  };
  const kv = (label:string, value:string, col='#085041') => {
    check(8);
    doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#555555');
    doc.text(label, M+3, y);
    doc.setFont('helvetica','bold'); st(col);
    doc.text(value, M+CW-2, y, {align:'right'});
    y+=7; sd('#e8e8e8'); doc.line(M,y-1,M+CW,y-1);
  };
  const writeup = (text:string, bcol='#0F6E56', bg='#f0f7f4') => {
    const lines = doc.splitTextToSize(text, CW-8);
    const h = lines.length*5+10; check(h+4);
    sf(bg); doc.rect(M,y-2,CW,h,'F');
    sf(bcol); doc.rect(M,y-2,3,h,'F');
    doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#333333');
    doc.text(lines, M+6, y+3); y+=h+4;
  };
  const barChart = (data:{label:string;value:number;color:string}[], chartH=32, title='') => {
    if (title) { check(10); doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text(title, M, y); y+=6; }
    check(chartH+20);
    const max = Math.max(...data.map(d=>d.value),1);
    const bW = (CW-8)/data.length;
    data.forEach((d,i) => {
      const bH = Math.max((d.value/max)*chartH,1.5);
      const x = M+4+i*bW;
      sf(d.color); doc.rect(x+bW*0.08,y+chartH-bH,bW*0.75,bH,'F');
      const lbl = d.value>=1000?`${(d.value/1000).toFixed(0)}k`:String(d.value);
      doc.setFontSize(7); doc.setFont('helvetica','bold'); st('#333333');
      doc.text(lbl, x+bW*0.45, y+chartH-bH-1.5, {align:'center'});
      doc.setFont('helvetica','normal'); st('#666666');
      doc.text(d.label, x+bW*0.45, y+chartH+4, {align:'center'});
    });
    y+=chartH+12;
  };
  const hbar = (data:{label:string;value:number;max:number;color:string}[], title='') => {
    if (title) { check(10); doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text(title, M, y); y+=6; }
    data.forEach(d => {
      check(11);
      const bLen = (d.value/d.max)*(CW-52);
      sf('#f0f0f0'); doc.rect(M+46,y-5,CW-48,7,'F');
      sf(d.color); doc.rect(M+46,y-5,Math.max(bLen,1),7,'F');
      doc.setFontSize(8); doc.setFont('helvetica','normal'); st('#444444');
      doc.text(d.label, M, y);
      doc.setFont('helvetica','bold'); st(d.color);
      doc.text(`${d.value.toLocaleString()}`, M+46+bLen+2, y);
      y+=11;
    });
  };
  const pieSlices = (cx:number,cy:number,r:number,data:{p:number;color:string}[]) => {
    let angle=-Math.PI/2;
    data.forEach(d => {
      const sweep=(d.p/100)*2*Math.PI; const steps=Math.max(Math.ceil(sweep*16),3);
      sf(d.color);
      for (let j=0;j<steps;j++) {
        const a1=angle+(j/steps)*sweep; const a2=angle+((j+1)/steps)*sweep;
        doc.triangle(cx,cy,cx+r*Math.cos(a1),cy+r*Math.sin(a1),cx+r*Math.cos(a2),cy+r*Math.sin(a2),'F');
      }
      angle+=sweep;
    });
    sf('#FFFFFF'); doc.circle(cx,cy,r*0.48,'F');
  };
  const donutSlices = (cx:number,cy:number,r:number,data:{value:number;color:string}[]) => {
    const total=data.reduce((s,d)=>s+d.value,0); let angle=-Math.PI/2;
    data.forEach(d => {
      const sweep=(d.value/total)*2*Math.PI; const steps=Math.max(Math.ceil(sweep*16),3);
      sf(d.color);
      for (let j=0;j<steps;j++) {
        const a1=angle+(j/steps)*sweep; const a2=angle+((j+1)/steps)*sweep;
        doc.triangle(cx,cy,cx+r*Math.cos(a1),cy+r*Math.sin(a1),cx+r*Math.cos(a2),cy+r*Math.sin(a2),'F');
      }
      angle+=sweep;
    });
    sf('#FFFFFF'); doc.circle(cx,cy,r*0.52,'F');
  };

  const dHa=Math.round(c.area*c.degraded/100); const hHa=Math.round(c.area*c.healthy/100);
  const PIE_COLS=['#1D9E75','#0F6E56','#5DCAA5','#085041','#9FE1CB','#E24B4A'];

  // COVER
  sf('#085041'); doc.rect(0,0,W,65,'F');
  doc.setFontSize(11); doc.setFont('helvetica','bold'); st('#9FE1CB');
  doc.text('KENYA NATIONAL MANGROVE ECOSYSTEM MANAGEMENT PLAN 2017-2027', M, 20);
  doc.setFontSize(18); st('#FFFFFF');
  doc.text(`${c.name.toUpperCase()} COUNTY`, M, 34);
  doc.setFontSize(12); st('#9FE1CB');
  doc.text('COMPREHENSIVE DATA REPORT', M, 44);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); st('#9FE1CB');
  doc.text(`Lead Agency: KFS | Research: KMFRI | ${new Date().toLocaleDateString('en-GB')}`, M, 56);
  sf(c.color); doc.rect(0,65,W,6,'F');
  y=80;
  sf('#E1F5EE'); doc.rect(M,y-3,CW,14,'F'); sf(c.color); doc.rect(M,y-3,4,14,'F');
  doc.setFontSize(8); doc.setFont('helvetica','italic'); st('#085041');
  const nL=doc.splitTextToSize(c.note,CW-10); doc.text(nL,M+7,y+3); y+=20;

  section('1. AREA DATA');
  writeup(`${c.name} County has ${c.area.toLocaleString()} ha - ${((c.area/61271)*100).toFixed(1)}% of Kenya's 61,271 ha national total. Of this, ${dHa.toLocaleString()} ha (${c.degraded}%) is degraded and ${hHa.toLocaleString()} ha (${c.healthy}%) remains healthy. Restoration target: ${c.restoration_target.toLocaleString()} ha/yr under the 2017-2027 plan.`, '#0F6E56');
  kv('Total mangrove area',`${c.area.toLocaleString()} ha`,'#0F6E56');
  kv('National share',`${((c.area/61271)*100).toFixed(1)}% of Kenya total`,'#0F6E56');
  kv('Degraded area',`${dHa.toLocaleString()} ha (${c.degraded}%)`,'#E24B4A');
  kv('Healthy area',`${hHa.toLocaleString()} ha (${c.healthy}%)`,'#1D9E75');
  kv('Stand density',`${c.density.toLocaleString()} stems/ha`,'#085041');
  kv('Standing volume',`${c.volume} m3/ha`,'#085041');
  kv('Restoration target',`${c.restoration_target.toLocaleString()} ha/yr`,'#185FA5');
  y+=4;
  barChart([{label:'Total',value:c.area,color:'#0F6E56'},{label:'Healthy',value:hHa,color:'#1D9E75'},{label:'Degraded',value:dHa,color:'#E24B4A'},{label:'Restore',value:c.restoration_target,color:'#5DCAA5'}],38,'Area breakdown (ha)');
  check(20);
  doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text('Canopy condition', M, y); y+=6;
  sf('#1D9E75'); doc.rect(M,y-4,CW*(c.healthy/100),10,'F');
  sf('#E24B4A'); doc.rect(M+CW*(c.healthy/100),y-4,CW*(c.degraded/100),10,'F');
  doc.setFontSize(8); doc.setFont('helvetica','bold'); st('#FFFFFF');
  doc.text(`Healthy ${c.healthy}%`, M+4, y+2);
  doc.text(`Degraded ${c.degraded}%`, M+CW*(c.healthy/100)+4, y+2);
  y+=14;

  section('2. SPECIES COMPOSITION');
  writeup(`${c.name} supports ${c.species.length} dominant species. Most prevalent: ${c.species[0].n} at ${c.species[0].p}%, followed by ${c.species[1]?.n||''} at ${c.species[1]?.p||0}%.`,'#1D9E75','#f0faf7');
  check(65);
  const pR=20; const pCx=M+24; const pCy=y+pR+2;
  pieSlices(pCx,pCy,pR,c.species.map((s,i)=>({p:s.p,color:PIE_COLS[i%PIE_COLS.length]})));
  let legY=y+4;
  c.species.forEach((s,i)=>{
    sf(PIE_COLS[i%PIE_COLS.length]); doc.rect(M+52,legY-3,5,5,'F');
    doc.setFontSize(9); doc.setFont('helvetica','italic'); st('#1a1a1a');
    doc.text(s.n, M+60, legY);
    doc.setFont('helvetica','bold'); st(PIE_COLS[i%PIE_COLS.length]);
    doc.text(`${s.p}%`, M+CW-2, legY, {align:'right'});
    legY+=8;
  });
  y=Math.max(pCy+pR+8,legY+4);

  section('3. MANAGEMENT BLOCKS');
  writeup(`${c.name} is divided into ${c.blocks.length} management block${c.blocks.length>1?'s':''}, each administered under KFS with Community Forest Associations (CFAs).`,'#5DCAA5','#f0faf7');
  c.blocks.forEach((b,i)=>{
    check(10); sf(i%2===0?'#f5f5f0':'#ffffff'); doc.rect(M,y-4,CW,9,'F');
    sf('#5DCAA5'); doc.rect(M,y-4,3,9,'F');
    doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041');
    doc.text(`${i+1}.`, M+6, y+1);
    doc.setFont('helvetica','normal'); st('#1a1a1a');
    doc.text(b, M+14, y+1); y+=11;
  });

  section('4. BLUE CARBON STOCKS');
  writeup(`${c.name} stores ${c.carbon_min}-${c.carbon_max} tC/ha - 10x higher than terrestrial forests. Total: ${(c.area*c.carbon_min).toLocaleString()} to ${(c.area*c.carbon_max).toLocaleString()} tC. Significant REDD+ and PES potential.`,'#085041');
  kv('Carbon stock',`${c.carbon_min}-${c.carbon_max} tC/ha`,'#0F6E56');
  kv('Total carbon (min)',`${(c.area*c.carbon_min).toLocaleString()} tC`,'#0F6E56');
  kv('Total carbon (max)',`${(c.area*c.carbon_max).toLocaleString()} tC`,'#0F6E56');
  y+=4; check(55);
  doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text('Carbon share of national total', M, y); y+=6;
  const cR=18; const cCx=M+22; const cCy=y+cR;
  const cVal=c.area*((c.carbon_min+c.carbon_max)/2); const cOth=(61271-c.area)*700;
  donutSlices(cCx,cCy,cR,[{value:cVal,color:c.color},{value:cOth,color:'#e8e8e8'}]);
  const pct=((cVal/(cVal+cOth))*100).toFixed(1);
  doc.setFontSize(14); doc.setFont('helvetica','bold'); st(c.color); doc.text(`${pct}%`, M+48, cCy-4);
  doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#555555'); doc.text('of national carbon stock', M+48, cCy+3);
  doc.setFontSize(11); doc.setFont('helvetica','bold'); st(c.color); doc.text(`${(c.area*c.carbon_min).toLocaleString()} tC min`, M+48, cCy+12);
  y=cCy+cR+10;

  section('5. ECOSYSTEM SERVICES VALUE');
  writeup(`${c.name} ecosystem services are valued at KES ${(c.area*c.ecosystem_val).toLocaleString()}/yr. Shoreline protection (KES 134,866/ha/yr) is the highest value service, followed by education and research.`,'#185FA5','#f0f5ff');
  kv('Total annual value',`KES ${(c.area*c.ecosystem_val).toLocaleString()}/yr`,'#0F6E56');
  y+=4;
  hbar(ECOSYSTEM_SERVICES.map(e=>({label:e.service,value:e.value,max:134866,color:'#085041'})),'Service values (KES/ha/yr)');

  section('6. DRIVERS OF DEGRADATION');
  writeup(`Primary drivers in ${c.name}: ${c.threats[0].toLowerCase()} and ${c.threats[1].toLowerCase()}, contributing to ${c.degraded}% degradation. Sustained intervention is urgently required.`,'#E24B4A','#fff5f5');
  const tcols=['#E24B4A','#BA7517','#BA7517','#888888'];
  c.threats.forEach((t,i)=>{
    check(16); sf(tcols[i]||'#888'); doc.circle(M+6,y-1,4,'F');
    doc.setFontSize(9); doc.setFont('helvetica','bold'); st('#FFFFFF'); doc.text(String(i+1),M+6,y+0.5,{align:'center'});
    doc.setFontSize(10); st('#1a1a1a'); doc.text(t,M+15,y);
    sf('#f0f0f0'); doc.rect(M+15,y+3,CW-17,4,'F');
    sf(tcols[i]||'#888'); doc.rect(M+15,y+3,(CW-17)*(100-i*20)/100,4,'F');
    y+=15;
  });

  section('7. DEGRADATION TREND 2000-2024');
  writeup(`Based on Kenya's ~450 ha/yr loss rate, degradation in ${c.name} has increased steadily. Urgent action under Management Plan Programmes 1 and 3 is needed.`,'#BA7517','#fffbf0');
  check(55);
  doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text('Estimated degradation rate over time (%)', M, y); y+=6;
  const yrs=[2000,2004,2008,2012,2016,2020,2024]; const tH=32; const tBW=(CW-8)/yrs.length;
  yrs.forEach((yr,i)=>{
    const pct2=Math.min(((i*4*450)/c.area)*100+(c.degraded*0.3),c.degraded);
    const bH=Math.max((pct2/c.degraded)*tH,1.5); const x=M+4+i*tBW;
    sf('#E24B4A'); doc.rect(x+tBW*0.08,y+tH-bH,tBW*0.75,bH,'F');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); st('#E24B4A');
    doc.text(`${pct2.toFixed(0)}%`,x+tBW*0.45,y+tH-bH-1.5,{align:'center'});
    doc.setFont('helvetica','normal'); st('#666666');
    doc.text(String(yr),x+tBW*0.45,y+tH+5,{align:'center'});
  });
  y+=tH+12;

  section('8. SOCIOECONOMIC DATA');
  writeup(`${c.fishers.toLocaleString()} artisanal fishers in ${c.name} depend on mangroves. Over 70% of commercial fish species use mangroves for breeding. Key livelihoods: fishing, poles, fuel wood, beekeeping.`,'#185FA5','#f0f5ff');
  kv('Artisanal fishers',c.fishers.toLocaleString(),'#185FA5');
  kv('Poverty rate (coast)','>70%','#BA7517');
  kv('Fisheries dependence','70% of commercial species','#0F6E56');

  section('9. RESTORATION PROGRAMME');
  writeup(`Annual restoration target for ${c.name}: ${c.restoration_target.toLocaleString()} ha/yr. Activities include community nurseries, replanting, and silvofishery development.`,'#1D9E75','#f0faf7');
  kv('Annual target',`${c.restoration_target.toLocaleString()} ha/yr`,'#1D9E75');
  kv('Restored (est.)',`${Math.floor(c.restoration_target*0.3).toLocaleString()} ha`,'#1D9E75');
  kv('In progress',`${Math.floor(c.restoration_target*0.4).toLocaleString()} ha`,'#5DCAA5');
  kv('Pending',`${Math.floor(c.restoration_target*0.3).toLocaleString()} ha`,'#888888');
  y+=4; check(55);
  doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text('Restoration progress vs annual target', M, y); y+=6;
  const rR=18; const rCx=M+22; const rCy=y+rR;
  donutSlices(rCx,rCy,rR,[{value:Math.floor(c.restoration_target*0.3),color:'#1D9E75'},{value:Math.floor(c.restoration_target*0.4),color:'#9FE1CB'},{value:Math.floor(c.restoration_target*0.3),color:'#e0e0e0'}]);
  const rLbls=[['Restored',Math.floor(c.restoration_target*0.3),'#1D9E75'],['In progress',Math.floor(c.restoration_target*0.4),'#5DCAA5'],['Pending',Math.floor(c.restoration_target*0.3),'#aaa']];
  let rLY=y+4;
  rLbls.forEach(([l,v,col])=>{ sf(col as string); doc.rect(M+48,rLY-3.5,5,5,'F'); doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#333333'); doc.text(l as string,M+55,rLY); doc.setFont('helvetica','bold'); st(col as string); doc.text(`${(v as number).toLocaleString()} ha`,M+CW-2,rLY,{align:'right'}); rLY+=9; });
  y=Math.max(rCy+rR+8,rLY+4);

  section('10. RECOMMENDED ACTIONS');
  ['Enforce laws and regulations on mangrove harvesting',
   'Initiate reforestation - establish community nurseries in all blocks',
   'Empower communities to form and strengthen CFAs and BMUs',
   'Develop county-specific harvesting plans with KFS',
   'Promote PES and carbon trading (REDD+)',
   'Establish permanent sample plots (PSP) for monitoring',
   'Develop tourism and ecotourism infrastructure',
   'Integrate mangrove conservation into county development plans',
  ].forEach((a,i)=>{
    check(12); sf('#085041'); doc.circle(M+5,y-1,3.5,'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); st('#FFFFFF'); doc.text(String(i+1),M+5,y+0.5,{align:'center'});
    doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#333333');
    const aL=doc.splitTextToSize(a,CW-12); doc.text(aL,M+12,y); y+=aL.length*5+5;
  });

  const total=(doc as any).internal.getNumberOfPages();
  for (let i=1;i<=total;i++) {
    doc.setPage(i); sf('#085041'); doc.rect(0,H-14,W,14,'F');
    doc.setFontSize(7); doc.setFont('helvetica','normal'); st('#9FE1CB');
    doc.text('Kenya Mangrove Portal | Data source: Kenya National Mangrove Ecosystem Management Plan 2017-2027 | KFS | KMFRI', M, H-8);
    doc.text(`${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})} | Page ${i} of ${total}`, W-M, H-8, {align:'right'});
  }
  doc.save(`Kenya_Mangrove_${c.name}_County_Report.pdf`);
}
async function exportAllPDF() {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W=210; const H=297; const M=14; const CW=W-M*2;
  let y=M;

  function rgb(hex:string):[number,number,number] {
    try {
      const h=(hex||'#000000').replace('#','').replace(/[^0-9a-fA-F]/g,'0').padEnd(6,'0').slice(0,6);
      const safe=(n:number)=>isNaN(n)?0:Math.min(255,Math.max(0,n));
      return [safe(parseInt(h.slice(0,2),16)),safe(parseInt(h.slice(2,4),16)),safe(parseInt(h.slice(4,6),16))];
    } catch { return [8,80,65]; }
  }
  const sf=(hex:string)=>{ const [r,g,b]=rgb(hex); doc.setFillColor(r,g,b); };
  const st=(hex:string)=>{ const [r,g,b]=rgb(hex); doc.setTextColor(r,g,b); };
  const sd=(hex:string)=>{ const [r,g,b]=rgb(hex); doc.setDrawColor(r,g,b); };
  const check=(n=12)=>{ if (y+n>H-M-14) { doc.addPage(); y=M; } };

  const section=(title:string)=>{
    check(16); y+=4;
    sf('#085041'); doc.rect(M,y-5,CW,9,'F');
    doc.setFontSize(11); doc.setFont('helvetica','bold'); st('#FFFFFF');
    doc.text(title, M+3, y); y+=8;
  };
  const kv=(label:string,value:string,col='#085041')=>{
    check(8);
    doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#555555'); doc.text(label,M+2,y);
    doc.setFont('helvetica','bold'); st(col); doc.text(value,M+CW-2,y,{align:'right'});
    y+=7; sd('#e8e8e8'); doc.line(M,y-1,M+CW,y-1);
  };

  // COVER
  sf('#085041'); doc.rect(0,0,W,70,'F');
  doc.setFontSize(13); doc.setFont('helvetica','bold'); st('#9FE1CB');
  doc.text('KENYA NATIONAL MANGROVE ECOSYSTEM MANAGEMENT PLAN 2017-2027', M, 22);
  doc.setFontSize(17); st('#FFFFFF');
  doc.text('ALL COUNTIES - COMPREHENSIVE REPORT', M, 36);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); st('#9FE1CB');
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Lead Agency: Kenya Forest Service (KFS)`, M, 50);
  y=80;

  section('1. NATIONAL OVERVIEW');
  [['Total mangrove area','61,271 ha','#0F6E56'],['Total degraded area','24,585 ha (40.1%)','#E24B4A'],['Total healthy area','36,686 ha (59.9%)','#1D9E75'],
   ['Annual cover loss (1985-2009)','~450 ha/yr','#BA7517'],['Number of counties','5','#0F6E56'],['Number of species','9','#0F6E56'],
   ['Artisanal fishers','20,000+','#085041'],['Total ecosystem value','KES 269,448/ha/yr','#085041'],['Plan budget','KES 3.8 billion','#085041'],
   ['Plan period','2017-2027 (10 years)','#666666'],
  ].forEach(([l,v,c])=>kv(l,v,c));

  section('2. COUNTY AREA COMPARISON (ha)');
  const maxA=Math.max(...COUNTIES.map(c=>c.area));
  COUNTIES.forEach(c=>{
    check(14); const bLen=(c.area/maxA)*(CW-50);
    sf(c.color); doc.rect(M+40,y-5,bLen,7,'F');
    doc.setFontSize(9); doc.setFont('helvetica','bold'); st('#085041'); doc.text(c.name,M,y);
    doc.setFont('helvetica','normal'); st('#555555'); doc.text(`${c.area.toLocaleString()} ha`,M+42+bLen,y);
    y+=11;
  });

  section('3. DEGRADATION RATE BY COUNTY (%)');
  COUNTIES.forEach(c=>{
    check(14); const bLen=(c.degraded/60)*(CW-50);
    const col=c.degraded>45?'#E24B4A':'#BA7517'; sf(col); doc.rect(M+40,y-5,bLen,7,'F');
    doc.setFontSize(9); doc.setFont('helvetica','bold'); st('#085041'); doc.text(c.name,M,y);
    doc.setFont('helvetica','bold'); st(col); doc.text(`${c.degraded}%`,M+42+bLen+1,y);
    y+=11;
  });

  section('4. COUNTY-BY-COUNTY SUMMARY');
  COUNTIES.forEach(c=>{
    const dHa=Math.round(c.area*c.degraded/100); const hHa=Math.round(c.area*c.healthy/100);
    check(14); sf(c.color); doc.rect(M,y-2,CW,8,'F');
    doc.setFontSize(10); doc.setFont('helvetica','bold'); st('#FFFFFF');
    doc.text(`${c.name.toUpperCase()} COUNTY`, M+2, y+3); y+=12;
    sf('#f0f7f4'); doc.rect(M,y-2,CW,10,'F');
    doc.setFontSize(8); doc.setFont('helvetica','normal'); st('#085041');
    const nL=doc.splitTextToSize(c.note,CW-4); doc.text(nL,M+2,y+3); y+=14;
    kv('Total area',`${c.area.toLocaleString()} ha (${((c.area/61271)*100).toFixed(1)}% national)`,'#0F6E56');
    kv('Degraded',`${dHa.toLocaleString()} ha (${c.degraded}%)`,'#E24B4A');
    kv('Healthy',`${hHa.toLocaleString()} ha (${c.healthy}%)`,'#1D9E75');
    kv('Carbon stocks',`${c.carbon_min}-${c.carbon_max} tC/ha`,'#0F6E56');
    kv('Ecosystem value',`KES ${(c.area*c.ecosystem_val).toLocaleString()}/yr`,'#085041');
    kv('Artisanal fishers',c.fishers.toLocaleString(),'#185FA5');
    check(10); doc.setFontSize(9); doc.setFont('helvetica','bold'); st('#085041'); doc.text('Management blocks:', M, y); y+=5;
    c.blocks.forEach(bl=>{ check(7); doc.setFont('helvetica','normal'); st('#444444'); doc.text(`  - ${bl}`,M+2,y); y+=5; });
    check(10); doc.setFont('helvetica','bold'); st('#085041'); doc.text('Species:', M, y); y+=5;
    c.species.forEach(s=>{ check(7); doc.setFont('helvetica','normal'); st('#444444'); doc.text(`  - ${s.n}: ${s.p}%`,M+2,y); y+=5; });
    check(10); doc.setFont('helvetica','bold'); st('#A32D2D'); doc.text('Primary threats:', M, y); y+=5;
    c.threats.forEach((t,i)=>{ check(7); doc.setFont('helvetica','normal'); st('#555555'); doc.text(`  ${i+1}. ${t}`,M+2,y); y+=5; });
    y+=6;
  });

  section('5. NATIONAL SPECIES INVENTORY');
  SPECIES_DATA.forEach(s=>{
    check(14);
    doc.setFontSize(9); doc.setFont('helvetica','bold'); st('#1a1a1a'); doc.text(`${s.name} (${s.local})`,M,y);
    const [r2,g2,b2]=rgb(s.rcolor); doc.setFont('helvetica','bold'); doc.setTextColor(r2,g2,b2);
    doc.text(s.risk,M+CW-2,y,{align:'right'}); y+=5;
    doc.setFontSize(8); doc.setFont('helvetica','normal'); st('#888888');
    doc.text(`~${s.area.toLocaleString()} ha | ${s.use} | ${s.dominant}`,M+2,y); y+=8;
  });

  section('6. ECOSYSTEM SERVICES VALUATION (KES/ha/yr)');
  const esMax=Math.max(...ECOSYSTEM_SERVICES.map(e=>e.value));
  ECOSYSTEM_SERVICES.forEach(e=>{
    check(10); const bLen=(e.value/esMax)*(CW-55);
    sf('#085041'); doc.rect(M+50,y-5,bLen,6,'F');
    doc.setFontSize(8); doc.setFont('helvetica','normal'); st('#555555'); doc.text(e.service,M,y);
    doc.setFont('helvetica','bold'); st('#085041'); doc.text(`KES ${e.value.toLocaleString()}`,M+51+bLen+1,y);
    y+=9;
  });

  section('7. MANAGEMENT PROGRAMMES');
  const maxB=Math.max(...PROGRAMMES.map(p=>p.budget));
  PROGRAMMES.forEach(p=>{
    check(14); const bLen=(p.budget/maxB)*(CW-30);
    sf('#1D9E75'); doc.rect(M+28,y-5,bLen,7,'F');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); st('#085041'); doc.text(`KES ${p.budget}M`,M,y);
    doc.setFont('helvetica','normal'); st('#444444'); doc.text(`${p.name} - ${p.lead}`,M+29+bLen+1,y); y+=11;
  });

  section('8. KEY FINDINGS AND RECOMMENDATIONS');
  ['Mombasa County most degraded (49.1%) - urgent intervention needed',
   'Lamu County holds 62% of Kenya mangroves - priority conservation',
   'Tana River Delta unique riverine system - Ramsar conservation',
   'Gazi Bay Mikoko Pamoja carbon project should be scaled nationally',
   'Rhizophora and Ceriops face highest over-exploitation pressure',
   '450 ha/yr cover loss must be reduced through enforcement',
   'Community Forest Associations are key implementation partners',
   'Carbon trading offers significant revenue for coastal communities',
  ].forEach((f,i)=>{
    check(10); sf('#085041'); doc.circle(M+4,y-1,3,'F');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); st('#FFFFFF'); doc.text(String(i+1),M+4,y,{align:'center'});
    doc.setFontSize(9); doc.setFont('helvetica','normal'); st('#333333'); doc.text(f,M+10,y); y+=9;
  });

  const total=(doc as any).internal.getNumberOfPages();
  for (let i=1;i<=total;i++) {
    doc.setPage(i); sf('#085041'); doc.rect(0,H-12,W,12,'F');
    doc.setFontSize(7); doc.setFont('helvetica','normal'); st('#9FE1CB');
    doc.text('Kenya Mangrove Portal | Data source: Kenya National Mangrove Ecosystem Management Plan 2017-2027 | KFS | KMFRI', M, H-5);
    doc.text(`${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})} | Page ${i} of ${total}`, W-M, H-5, {align:'right'});
  }
  doc.save('Kenya_Mangrove_All_Counties_Report.pdf');
}

// â”€â”€ CONTACT FORM (sends via Anthropic API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [topic, setTopic] = useState('General');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!name || !email || !message) { setError('Please fill in name, email and message.'); return; }
    setSending(true); setError('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `PORTAL CONTACT FORM SUBMISSION:\nName: ${name}\nOrganization: ${org}\nTopic: ${topic}\nEmail: ${email}\nMessage: ${message}\n\nReply with just: "Message received. Thank you ${name}."`,
          }],
        }),
      });
      const data = await response.json();
      if (data.content?.[0]?.text) { setSent(true); }
      else { setError('Failed to send. Please try again.'); }
    } catch { setError('Network error. Please try again.'); }
    setSending(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, display:'flex', alignItems:'stretch', justifyContent:'flex-start' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'480px', height:'100vh', overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,0.18)' }}>
        <div style={{ background:'linear-gradient(135deg,#085041,#0F6E56)', padding:'20px 24px', borderRadius:'0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:'16px', fontWeight:'800', color:'white', margin:0 }}>Contact Us</p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:'2px 0 0' }}>Kenya Mangrove Portal | KFS | KMFRI</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'32px', height:'32px', color:'white', cursor:'pointer', fontSize:'16px', fontWeight:'800' }}>X</button>
        </div>
        <div style={{ padding:'24px' }}>
          {sent ? (
            <div style={{ textAlign:'center', padding:'20px' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>(OK)</div>
              <p style={{ fontSize:'16px', fontWeight:'800', color:'#085041', margin:'0 0 8px' }}>Message Sent!</p>
              <p style={{ fontSize:'13px', color:'#666', margin:'0 0 20px' }}>Thank you for contacting us. We will get back to you shortly.</p>
              <button onClick={onClose} style={{ padding:'10px 24px', background:'#085041', color:'white', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>Close</button>
            </div>
          ) : (
            <>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 16px' }}>Tell us about this Mangrove Portal</p>
              {error && <div style={{ background:'#fff5f5', border:'1px solid #E24B4A', borderRadius:'8px', padding:'10px', marginBottom:'12px', fontSize:'12px', color:'#E24B4A' }}>{error}</div>}
              <div style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#555', display:'block', marginBottom:'4px' }}>Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #ddd', fontSize:'13px', boxSizing:'border-box', outline:'none' }}/>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#555', display:'block', marginBottom:'4px' }}>Organization</label>
                <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Your organization or institution"
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #ddd', fontSize:'13px', boxSizing:'border-box', outline:'none' }}/>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#555', display:'block', marginBottom:'4px' }}>Topic</label>
                <select value={topic} onChange={e => setTopic(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #ddd', fontSize:'13px', boxSizing:'border-box', outline:'none', background:'white' }}>
                  <option>General</option>
                  <option>Blue Carbon</option>
                  <option>Stakeholders</option>
                  <option>Mangrove Restoration</option>
                </select>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#555', display:'block', marginBottom:'4px' }}>Email *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #ddd', fontSize:'13px', boxSizing:'border-box', outline:'none' }}/>
              </div>
              <div style={{ marginBottom:'16px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#555', display:'block', marginBottom:'4px' }}>Message * <span style={{ fontWeight:'400', color:'#888' }}>({message.length}/500 characters)</span></label>
                <textarea value={message} onChange={e => { if (e.target.value.length <= 500) setMessage(e.target.value); }} placeholder="Your message..." rows={5}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #ddd', fontSize:'13px', boxSizing:'border-box', outline:'none', resize:'vertical', fontFamily:'Arial' }}/>
              </div>
              <button onClick={handleSend} disabled={sending}
                style={{ width:'100%', padding:'13px', background:sending?'#888':'#085041', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'800', cursor:sending?'wait':'pointer' }}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€ ABOUT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, display:'flex', alignItems:'stretch', justifyContent:'flex-start' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'560px', height:'100vh', overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,0.18)' }}>
        <div style={{ background:'linear-gradient(135deg,#085041,#0F6E56)', padding:'20px 24px', borderRadius:'0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:'16px', fontWeight:'800', color:'white', margin:0 }}>About the Kenya Mangrove Portal</p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:'2px 0 0' }}>Kenya Forest Service | KMFRI | 2024</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'32px', height:'32px', color:'white', cursor:'pointer', fontSize:'16px', fontWeight:'800' }}>X</button>
        </div>
        <div style={{ padding:'24px' }}>
          <div style={{ background:'#f0f7f4', borderRadius:'12px', padding:'16px', marginBottom:'16px', borderLeft:'5px solid #0F6E56' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 8px' }}>What is this Portal?</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              The Kenya Mangrove Portal is a web-based Geographic Information System (GIS) platform for visualising, analysing, and managing Kenya's national mangrove ecosystem data. Built by the Kenya Forest Service (KFS) in partnership with KMFRI, the portal provides open access to spatial and attribute data covering all 5 coastal counties - Lamu, Kilifi, Kwale, Mombasa, and Tana River.
            </p>
          </div>

          <div style={{ background:'#f5f0ff', borderRadius:'12px', padding:'16px', marginBottom:'16px', borderLeft:'5px solid #534AB7' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#3C3489', margin:'0 0 8px' }}>Mangroves, Blue Carbon and Climate Change</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              Kenya's 61,271 ha of mangroves are among the most carbon-dense ecosystems on Earth, storing 500-1,000 tC per hectare - ten times more than terrestrial forests. As globally recognised blue carbon sinks, mangroves directly support Kenya's commitments under the Paris Agreement, the UN Decade on Ecosystem Restoration (2021-2030), and Sustainable Development Goals 13 (Climate Action), 14 (Life Below Water), and 15 (Life on Land). Mangroves also protect coastlines from erosion, support over 20,000 artisanal fishers, and generate ecosystem services valued at KES 269,448/ha/yr.
            </p>
          </div>

          <div style={{ background:'#E1F5EE', borderRadius:'12px', padding:'16px', marginBottom:'16px', borderLeft:'5px solid #1D9E75' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 8px' }}>Restoration and Community Forest Associations</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              Mangrove restoration is central to Kenya's goal of achieving 10% forest cover and contributing to the Africa Forest Landscape Restoration Initiative (AFR100). Community Forest Associations (CFAs) are the backbone of restoration on the ground - sourcing planting material, monitoring survival rates, and ensuring long-term stewardship. The Kenya Mangrove Portal supports CFAs by providing spatial data and evidence-based tools for planning, monitoring, and reporting restoration activities.
            </p>
          </div>

          <div style={{ background:'#fff5f5', borderRadius:'12px', padding:'16px', marginBottom:'16px', borderLeft:'5px solid #BA7517' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#854F0B', margin:'0 0 8px' }}>Data Sources</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              Most data on this portal is sourced from the <strong>Kenya National Mangrove Ecosystem Management Plan 2017-2027</strong> (GoK/KFS), complemented by field surveys from KMFRI, CIFOR-ICRAF, Blue Carbon Project, and IUCN. The degradation survey (2023-2024) and stakeholder monitoring data (2024) represent the most recent ground-truthed field datasets covering all 5 counties.
            </p>
          </div>

          <div style={{ background:'#f0f5ff', borderRadius:'12px', padding:'16px', marginBottom:'20px', borderLeft:'5px solid #185FA5' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#0C447C', margin:'0 0 8px' }}>Restoration Partners</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              Remarkable restoration work is underway across all 5 counties, led by partners including Eden People+Planet, COBEC, Earthlungs, WWF Kenya, Plan International, Nature Kenya, Leaf Charity, and the Grow Initiative - together planting over 15 million propagules and seedlings since 2019 and restoring more than 1,434 ha in Kilifi County alone. Their continued engagement with KFS, local CFAs, and coastal communities is essential for achieving Kenya's restoration goals.
            </p>
          </div>

          {/* Partner logos */}
          <p style={{ fontSize:'12px', fontWeight:'800', color:'#085041', margin:'0 0 12px', textAlign:'center' }}>Partners</p>
            {/* Real partner logos - embedded as base64 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'12px' }}>
              {[
                { name:'Ministry of Environment', sub:'Kenya', color:'#085041', bg:'#f0f7f4', src:'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABxASwDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAcIBAUGAwIBCf/EAFMQAAEDAwMDAQUDBwgECA8AAAECAwQFBhEABxITITFBCBQiUWEVMnEWIzZ0gZGyFxg1QlJic6EJM4KzJCY0N0OV0fBTVFVjcnaDhJKTsbTS4fH/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAgUDBAYBB//EADURAAIBAwIFAgMGBQUAAAAAAAABAgMEESExBRJBUXETYYGRoRQyscHh8AYiIzVyFTM0gvH/2gAMAwEAAhEDEQA/ALl6aaaAa8J8yNAiqlTHksMIICnFfdTkgAk+gyR38Dye2vfWPUobFRp0mnyklTEllbLoBxlKgQR+46AyNNRjstc8lEyp7c3C+pVct5fSaddyFTYv/RujPk8SkH9h1J2vE09idSnKm8SGmmmvSA0015S5DESK9KkupaYZQpxxxRwEpAySfoANAfL8uMxIjx3nkIekqKWUE91kJKjj8ACde+ov2nqUi+7sq+4Cw4ijtA02hsuAd2wQXX/xWrAz8hj8ZQ14nlZROpTdOTjLdDTTTXpA85b7UWK7KkL4MsoU44rBOEgZJ7fTXM7c7g2ruDBkzLWqKpjUVaUPcmVtlJUMj7wGcjW3uz9Fav8AqL38B1XP/R8/olc361H/AN2dAWf0000A0000A0000A0000A0000A0000A0000A0000A0000A0000A0000A001yW8Vyt2jtnXq8pzg5HiLSxhfFRdUOKAD8+RHjQEebue0NRbWclUy2YZrtSZISuSD/wJlWcFKlpOVKHyT8x3102x256b7oTSa1GZpNwcl84Q5J6iE4w4gK9CD4yT2J8ao3DZly7fp7b0SWkIAbSekXBKKVLWoj659CDnGc6kybXESacisRZalRpQ4tPKe6bcDgAOSk8SeQKvqc+NVFXiNSnUjFRym2t/l7d/l3LWlw+FSnKTlhpJ7fP37fPsTP7SlLqlt3PRNz7cDqZcY+7yygZBABKeQ8lJTySfTxqabWrMa4Leg1iKUBEuO26UBwLLRUkKKCR6jODrQXA+uJs1KccqfvT5ofTTNyT13VM8UrB8/Eog9/nqvHs83LPsm96tRas62xTkxHXGY6nVEOYwppDZ8cu5BJ8ZP4ncdWNOvyZ1lrj8zycpXNpHMdaeVnut8PxrgsruBeNIsuiLqdVcAAQpTaM45cR3JPoBkZPc9xgEkAxFtJ7RdMuu436XUgmOhSlFlam+mQn54ycp+n3h5ORnFZt+Ny6lf90vrMkmnNL4tJQo8V4zggf2Rk4H4k9ydR3EkPxJLUmM6tl5pQW24g4UlQ8EHW2VZ/VxCkrQlaFBSVDIIOQR89QR7Tty1Oc/TtuLeSp2RVFJVKLKuSinnxDRCTkDPdWfTH11y+xe9iZe2Nbh1eaiNUafBdWw4rlgOlJ4AfIKPceMEKHgp1rfZkFYG6Ka5VH1x/tEPMEvKyt1PHkG1ZPY8+4Pk8frrUuasYuNNvHNoWXDs0p/aOXm5NcdPPw3LLWnSKfZtmQKQJDbUSnRghbzqwlOfKlEnAGSSf26g+6vaVfo+4a6bFtkVK3ELS2mWytYefyASpsEYOM544ycedbD2sJbsGZbrxlGSy51UGlpfDa3FApUHU57EgZHfH0z3xX3cOWjhAoqqk7JmQHveFOKa5lpCuIShRQkfF3wMdz48nWtcX06NeNGMdH1/T6fHQlRtI16Uq85a5+vku3t9etv31QxVrfl9VAPF5hwcXmFd/hcRnKT27fP010eqV+yzdTlF3xZpU9D8Zqq04U89fI5uoytpePmoAp79xnGrqasKU+eCl3K6pDkk4msuz9Fav8AqL38B1XP/R8/olc361H/AN2dWMuz9Fav+ovfwHVc/wDR8/olc361H/3Z1kIFn9NNNANNNNANNQXsx7RdP3C3KrNky7d+w3YCX1R5K54eTJ6K+Kxjpp4HieWMnsD8u/PWx7VsW4GL2lQbKc90tunOVCO6up4M5tLyWx26X5vIVnyrGMd/OgLK6ar9uD7TEGy2LAmVK1HHIV10qPU5Drc/vT23QgkBPT/O8Qv5ozj0zre3BvoxTahuQxGt9ucxZdOhT2pDdQATUUyWkuDGGz0wArzlefPbQEyaag25d96k09YFItq0I0+vXlRmqs3HmVVMZiOhbYWG+qpH5xWeQHZOcDt3wPPdje6+9u7ahXHVtnV/ZjrDXvbq7jYSYslalAscUtqUvGAeYGDy9NATtpqBavvfuHS7mt+0pezCWrmriJLsenruljAbZRz5dVLRR3CV9iRjj9dYdK9p6FMtK3bsfs6REok6uLolXlOTgRS3wlCkq7N/nWyleeWUY4kYPbIFhtNR3s3uady5tzP0+hGLQaRUTAhVMyuf2ipOeako4DgkDiQeSs8h4wdctde9Vyv7j1ixtstvlXdMoTQXVZLtRRFaaWRkNp5A8lZ7eR3BGCAToCbdNV1PtPInWRbdZt6xX6jWK1XDQl0h6pJjKjy8JKU9RTZCgrqIwSEgZOcYOpn28q901ugKmXdZ/wCSdRD6kCD9pNzctgDC+o2AnuSRjyMfXQHR6aaaAaaaaAaaaaA/FqShBWtQSlIySTgAaire2oUe9/Z9umTbkyJWGhBU8hTJ5lJQQonA7pUAlXY4/dqU5CXFsOIad6TikkIc4hXE47HB841QuzxfGyO5zset0iYmFMc92f5NlUWWyV91Z+6pJTy+o+mCNeN4WT1LLwYF01D/AIqUqTRK0yxjpOMRGThbjqQAcAD64ODgY9c69KG3cVPeVWnrY68KbN6r8KQtSFEju4kFshSUHB+f1HrrsalZsCwb5nUOdAXNp8tHXoEltPPLKlAqbBHYFKinv8sHt41n0+pPwpTEOcplL05pTqEJJWlRHkpwPPjKfHqD51x1xcTsZulCCbWuvVPXTx1ydZQt4XsFVnLCemnRrTXz7HYVzdSgX7b1PolHiSKexEQlcyC4nCm1oPFtkY8gYz9fh+uuPTbF03zZ9QpdrRYjlTdluqdU8sNGM2QlCkhRHYkJx/tnWvTQqampSKvQ62ul1GVhLiHUAtrUPAU2rBz9QQfx1qqq3WrcYaY68toBslb7D6h7y8VKUpRIxgnPYH0Gtiz4hTq3kq0nrhJReU13x0JrhFSpRjawaWrbl0fbbXJgfzXd3P8AxCjf9Yj/APHX5/Ne3d/8n0f/AKxT/wBmujt6n12sXQxR13cW4vuyJcqW1UnSlpCuwRkkfGVYH0zrdWXRJF4XHUI9Muus0+lRGm1cpUlbj5UcgpACsEZSe/n6a6P1nppuU74XDMn6ukUm3h4Wdl3y/Bzdn+z7urbdZTUp1LpL0AIKZjQnhXNrye2O5BAUPqka6oTlt3ZUJzLgjvtTUT4zqE/m47xAUWyfCvi5ZHyP4a5S5jcFAuOZSJFaqTvTXmO4mU5+daJwkjv5OD2+es6DSKmmKl9VWTRGJTLaZIUlK3XHUpCeYKuyFED6/s1Scauoelyt8sk01+mMlrY8KlQ5KykpwmnovzzjwdBvZu1Rr4ZgQbWtx6dUYhQp6a7z4RyoDmykII6hBKckkAYOPOoVqf2/Sqgmnzm10pMuopkyZbvZlShgoSFdwUjHr2B/DOpSo0ei2lSpSKbIDkdsKeeekqJHInyVgYP/ANfGvmY/CXBJuaD7xDU0Xw+Ry7qBB5IH3e3jz+/VdV4y6tRv08x+r+Ht2PafCFSp49TEvov/AHufu08Jip+0FaDZXEqEqG3IkzH2sYUQ2opcOAe+Sn9vr66tzGrtGk1x+hxqlFeqUdrrPRm3ApbaOXHKgPHftg99VCt5mftZYgvJ9L0Kr3S+mJEy1zep1PCcpIHkKPwpJ9OQ9cakH2QrPqlNrNfuxcCXApVQZSwwJiSl6UsLKi8AruE98ZPkn6a6Wzi6EI0Wnos56eP0Odu2q0pVk1vt18k+XO249bVUaabU44uG8lCEjJUSggAD1Oq++wnSarRbTuRNYpk2nqVIYUlMmOtokBs5ICgM6sPXXHGaHPdaWUOIjOKSoeQQkkHUUey5X63X6JV3q1VJdQcbdaCFSHSspBSScZ8a2ZVVGpGHfP0MtDhs61nVu01im4prq+Z4Jj0001lK4aa8Z0qLBhPzp0lmLFjtqdffeWENtISMqUpR7BIAJJPYAa5ym7j7eVJx5unX5a0xbDC5DqY9XYcLbSByW4oJWcJSO5UewHnQFQavsbumxZEus2/QpUW6m7sqgQ22+0lx6mzIzbZc5FWMZStOM5HUJ10svY+7qFKv6k0O33JECTY8SlU99txtIlyke7l3AKgQSpLiiSAPOrSovOz10BFwIuugqo63eiioCotGOpzOOAc5cSrPbGc51mUqvUOqz58Cl1mnTpdOcDc5iNKQ45FWc4S4lJJQfhV2VjwfloCvD+0dauGubVU24aA6aLBsRdHrSytB91fVFCAnznkF+CAQCAc64awdmd0qHZe79Dq9JenSqhS4tNo74ebxOQwVIb4Dl8IDaUYCsYGB51bCDfNlT1wkQbwt6Uqe8uPDSzUmVmQ6gJK0N4V8akhScgZI5DPka8l7h2Aisroq75thNTQ+Y6oRqzAfS6DgtlHLkFA9uOM50BXrdyzK7UdobOtCobNzbjmwbTiR4tVhVBtuRTKglkIW0tPq2ClBJyUnuPIyM7cjbncqq+xtRLKlxX63dzDrKpDQkIUtKA6tSUlalYUUIKEk5P3e2dT9d162haIZN0XNSaMX89FMyWhpTmPJSCckD5jX5IvezI9vR7ikXbQWKNJWG2Kg7UWkR3FkE8UuFXEqwlXYHPY/LQEPb/bTTtyd9LLXOpcp61WaZOj1KYzIDZjrU050iMKCieZQcAEHwcjI1o7M24vE+ydd22NyWgymqQlSEUnpdFInkELZeBSR8XMYyrBICc+urGKrtETVIdKVWacmoTmi9EimSjqyGwMlbaM5UkDvkAjWPbV12vc/vH5N3JRq17sUh/7PnNyOlyzjlwUeOcHGfkdAc57PtsO2fsza9vyqcKdNjwUGYxkEpkK+JzJBIJ5E+uoijUzcraLencCv0Pb+XeVFu5xuXHchykNrZeTzUELB7pGXVjOPASRnuBOrV/2I7EqEtq9bbcj0wpE91NUYKIhUrgnqnlhGVfCOWMntryibj7eS4cubFvy1n4sJCVy3mquwpDCVKCUlagvCQVEJBOMkgaAqtG9n6+HLOsyJX6OqTJqV7GrXCxGlIT7jFc6aFDkFDvxSs5QSRkY7jVsrAs+h2NbqKDbzUhqCh1ToS/IW8rkrz8SyTrJ/Ki2fd6XI/KKkdGrrCKa5763xmqPhLJzhwn5JzrSubrbXNrU25uTZyFpJCkqrkYEEeh+PQHY6a/G1ocQlxtSVoUAUqScgg+o1+6AaaaaAaaaaAa4D2g3YTW09WVMLfMloReWM9bqJ4FP1Hk49AfTOu/1Ce4y3r23bhWg7j7GpSkvSG+QIec6fJSiPolSUD5FajrBcT5YY6vRfEzUIc089Fr8jmb3dVLpto0qStaFRKUiS8jGVALCeIPbOcIx+3UfXZAhTG3ZsqQ4ZowiAWCUvNFRwkNAeSfH97xjtrvbyqsCoXpVK4iQj3dsop7ATjB6YwcfirOPoB89cZYU+TUrjVdcMtwmmyU09LjKHV/CSC8AoFKe/g4+Z1xV3XUr6dSUmoQws/kvP70OwtaLjZQpxinKWXj834J22X2ppFu7ZwKVclLh1KqvhUma7KYS4tDjncoCiMjiMDOfIJHnVXLqXWuvNoqZIVEaIbR1sqXjCVceRP1Iz/wD3VyNp7hmXDbC3KmvnUIklyO+viE9QA5QvA7DKVJ8eoOqxzaadwdxLlNktxn4kOSUqK5KUc/jWAtPLBKcAD9n111VaFO4pQqU4p7NFTwZUad3Oley5Y4aerWuTnLBqSWaqht5I+zGk+7S+ooISlxPIoewDyVwPEgHsSPoNSOuXZlDiquuDNkSKq+WFq6L3H3guD84SzywMnkr+6e3prRL2fvjPUTToRWPBM5vOM9wDntnv+/WXUtqb0lzzIjUGHGaS02020J7SylKUgd1ZGSSCSfmTqcJVIx+74LK5t+H166/rpJ/ea0TWcpPXLe2uMaI4m9q3U7gu5qutEtpjoUyw24rPweRy/E9yP8/lNXszUGDcsGp1e6IcervtrbbjpkN82WgFOA8UKynl8Iye5z41wTu018tNLdcpsVKEJKlKM1rAA8nzqU/ZBr1Kq1lT4sVRROhyAiQ0VA9inIWOw7KUVn/LWOhRc63qVY64MXG/9Po2sadjUy864fTHX4kb727cRqDusua91W7XrqQtuK2eEZMhIwptQGAB25AeuT8tYLkJqRQnIKpZe6CSphZOAW/GCf6wGfP0Hy1JG7dfqVwTa9QVvsM0dh7oNB2OheVISObmT8SSHOYBBHYfXUWWLVEKZlWzVGg1NigILie7bzaieCkH5Eeh1zPGa0KlWU6EsuDWV291+DM/CKU6dKMKyxzrR9/Z/iiUqhOYq27e3E2oe7uUyTFyEqSCgP8ATdCR/wDM6YH1A1Puq3qpqK9s/wBNh8CsWrIXh1OOaUcuYWPrxIV48oI+epq2wuNd02VBqshARMwpiWlPgPNqKFkfQkch9CBrrbWsp/8AZKXzX7+hy1zRcPg2vr+/qbe4/wBHql+qO/wHUMex9+j9b/xmP4Fame4/0eqX6o7/AAHUMex9+j9b/wAZj+BWlX/k0/DL7h39ivP8qf4snbTTTW4cscZvt/zIX5/6t1H/AO2c1WzaaFMR7NVflTG9uPdlWJU/dVU6OU1rn0V/69ZOCOPPOAP6v11b+pQolSp0mnVCM1KhymlMyGHUhSHW1ApUlQPYggkEfXXJUrajbSlOSHKbY1AiLkxnIrxahISXGXE8VtnA7pUCQR6jQFCqs1XbB27olrvdaTbV6s0yvQHFDsxLQUB9H7QRn6dL6nU0+0FcErZTe66bghJdRCvu13UMqR2S3UW08Er/ANn4T+Lp1Z2pWJZlSo9No1QtekS6dSykwIz0VCm43EYHAEfD27dtZF12ha91iILlt+m1gQ1lyN75HS70lHGSnI7ZwP3DQFWRZ/5C132ZLfda6ctL8+RMBHcPuiO4sH/0Srj+CRqI9y4M957dKS/SqQbd/lDdZqNW9061RgZfdwWgSkcCMgjkMkgds51/QmrW7QqtVabVanSYcyfSlrXAkPNBS4ylY5FBP3SeKc4+Q1grsazVwKxAXbFJVFrcgyaoyqKkpmOlXLm4MfErl3yfXvoCtFqtWRM9ru7GdwZFLnwolAiJoK60ttcdyOGWTzQXPgUSkqVkf2nD88REqkxK1YdXolMceRZk/duLEpK2zlKWltykkoz69Ms/5avLcu1u3dyRYEat2bR5rdOYTGh844CmWUjCW0qGCEAeE5xrYCx7OTRKbRE2xSU02mSUS4MVMVAbjvJzxcSkDAWOSvi89z89AVG2Kn3HE9pyzdvrrQtVTsuJUqWiQRgPxukpTCh9OB7f3eHrnUV7T3PWtobYZvWlpfdj3ZSqjSUhPhma0odJ3/Z5owPqvX9FV2rbS7rRdaqFTjXm2uiio+7p64RgjjzxnGCR+BxrXI24sFFHh0ZNn0QU6DK97ixvc0dNl7/wiRjAV9dAUQatV6yts98LYkqJkwoFvCRn0dVIZW4PwClKA/DUp7hwpkb2SLwcqLe3CXFwaR7ubYjluRw97Z5e9Ek5P3MYx35fTVo6hYdmVBdYXOtekyVVrp/aZdjJV750yC31Mj4uJAIz4wNa6HtRtpDp86nxLGoDESoIQiYyiEgIfShYWkLGO4CkhQ+oGgKe0lqu2TvDt/tFVutIp1MuqNVqFKWPvRJGCUfsXnx/W6n01Ktw2LZA9tqhUMWdb32U/aC5T0H7MZ6Dj3XfHUU3x4leAPiIz2GrDVO0rYqdWplWqNApsqoUrHuEl2OlTkbBBHBRGRggEfLXu7btCduZm53aTDXW2Y3urU8tAvIZyT0wryE5Uo4+p0B8UK4bdqs+o0mi1any5VIWlmdGjOpUqIo5CUrSPun4VDB/sn5a2+uI2q24plgrr01ibJqVWuCorn1KfIAC3VEqKUADsEJ5KwP7x+gHb6AaaaaAaaaaAajLcja77fuMXPRrhXQZ5bCJalNKcbdSBx59loKVBGUnuQQACO2dSbqLvaWZfVYsWWhtT7Eae2ZDOcJUlYUhJOe331JHceusNxj022s41M1DLqJJ4zoQxTKU0w9VaNKktVFtmY8286AOK1JXhKk47Y4gH6a3NiWGIm2Fy1WlKqTkmnS1IhwUcFpLaQ2s+E8lZStWBnPbWVtvaluu2k5cN516NSKKZ7kZMZ5YjF0Nk/CXSoHKilR4oAJA7a3O8u6tv7f7dQ6ftuKdLk1lp0RHYchKkxU8Rl9WCSVfF2z6jv8AdI1z1hwpznOrWx6c9VHfw+2mxeX/ABWNOEIU2+eG8tvK7nGWLTqhcs1yBSHw1BkLwfepSooJI+5wUorcIAP3U4A1pb/sym2dXPsN1+mqqr7SX2Y8RHwttjOEEkBRWvDisYx8Kfn3hic7Vo0+jOxYqE1CKtLwnNLUpTiirPJR9e/qD8++vi8bjuCqV964a3KUa04pKG3ASVICPChyJ7+APlqytLKlRjlZb21ef0Kq9uafFIzoRnFway2ljHz1znRe+CQeizjPSR/8I19JbQn7qEpz8hrAt+tx69AEtsIakowmWwMDgv8AtJH9g/5HI+WdiApRCUgEnJ7kAADuSSewAHcn0GkoyjLlPh95a3tpc/Z22301evbB8SZUenQJNTlI5MxG+pxzjqLzhCP9pX+QUfTW62Ihy7jodQmW7GjR67CUESI7MpTDziDkoUMgAjAI7nyPTUeXjUn3nGWUMdOlNIS6H1J/5SpXYOgn+qD90HwO57q1qIsqvs1VUuPxhZbKUu9PKFYz6+n3j41KVGFVKE/mnj8D63wC1jwjhsqtWpmplcyazus7vbTbvqWN20pMquXu3b8oVSK5yck1LlFUhTCOJwnkvkkErI8E5z21q49nxKLdddkq68uaxLcjNPvBKeaGyQk8EAJB898fPWw9mLeiZBiPWVeKqjUXow6sCaVBxamPhHBXJQKgPIxk4OPTUkX3T7FrZ+34f2lDqqjyLrERYSvt8XUS5xQcDyeQPrk60LvgnNbOFu/5m8tvdrtk6Wy43GVaNSqswxolsvfBH22thVq7ma3LpN0sQYjk0RpTK2VqWPgQtRISoBScqICVY8HViLKt2HatsxKHCW463HSeTrmObq1EqUtWPUkk/wCWqs2lHkr3Fiw6eorkKq7bTUtpJbHEJQsnyVDCSQcEjsfTVv8AW9wuKVNpxw46PrsanEpN1E1LKlqum5gXH+j1S/VHf4DqGPY+/R+t/wCMx/ArU11npfY83rpUpr3dzmEnBKeJzj641G3s6m1/siqJtiDUYjYdb6wmPJcKjxOMYAx6626kG68Jdsk7bjFrb2FawqP+pVcXFf4vLJLqkxqnUyVUH+XRisrec4jJ4pSScfsGq37MVDe/dajJ3Lj7hQqHAeqZTDoApjbkdcZtzitK3McwT8QB7ntnIyMWVksNSYzsZ9tLjLqChxCvCkkYIP7NQFYmyu5dgOu0Czd0o8Ozl1AS0x5FLS9KaQVAraSonHxAYJ7fMAEnOyVR0Xs83nct13VufCr9S98j0O6ZECnI6DbfQYQtYSjKEgqwAO6sn66hOTvNuu97K1u3bAuQG6ald32UZRgxvjaLbxSjgW+A+JKe/HPbzqW7O2iv+0dyK7X6FuHAYoleuFdXqFNXR0rW42t4rU0HSolJ4qKeQA+eNaiD7OM2Ps1blgG646naPc6K4qX7keLqUhY6QTz7H4/OT48aA4C9vaNvGRsRaL9rT0x74mGV9sOCK0tTKISFF9RbUkpQVjgv7vYcgMenR7h7s7jfyR7YQLOqQVfd0wPf35CYjKytpmOXHfzZQUArJBGE4+FWMa3X82KC1d+4Vei11lCbpgS40FhUQkU9ckhTi88vi75AAx8KiNe1D9malyLhpc2+qv8AlDTqRb0ajU+Gx1ofSU2BydK23Ao5Jc+HxhffOAdAfD163xfXsxwNy7QvtNuVGk0eXKrDSaSxK99fjtnkj852ZBU2pQIB7ODt21H1x7gbx27sBa+4k3dYvuXLVYbHEW7ESYDKm5JcxhB6ueCD90H4cDydS9Ymxz1oWHuLY9OuFBod0JkilsKYUTTeuytohSislzALfyJ4d+51j3XsXUavsdZu3sO6I8SbbM9iameuEVoeU0l0AcOYx3dB8n7v10B1OwFZeuC259SVuNKvlkTOgiVIoQphYUlCVKQEcEFQwtJ5Y9cZ7HUWWjXt395bovKqWpf7Fn0SgVJdOpcVNMakCS4g/eeK/iAICSfP3uw7HM6bfU69adDlIvW5KdXZC3AY7kOn+6htGO4I5K5HPrqKEbJ3/al4XJUdrtxolApNxyDKlRJdNEhUV1RJKmsnB+8cZx2wDnAOgNUN+WrJ9oO8bX3Pu5uHRIUGAKe03TlOIEhcZlbxSppouEFSlEczgZwNYtib1XOz7HlY3IuSqpnXA26/FhvmO03l5S0ts/AhISeJVyIx3CTnUp2NtnNt3eK6NwJdeRUDXYEOKpn3bgtK2GW21LJ5EHkWycADGcajqnezM/8Ayb2pYFXuxqXRKTXHKrUmW4q2jPBwEthQXlvALgJGT8eRgjQGLtXuruC7thutSb1qAF92hT5M1h8xWmz0zFUtpXTSkJVxWjPdPhaQc6jyje0ZuN/JRMgVqr+6XqxNgS4swwmB73TpJT3COHDI5JBISDhafUK1Lk/2a6bTrrq1SsWr/YNMrNtTKJUIL/Wll1T7S0pdDjjhV8Ki0eP/AJvtjOsK/wD2X4tz21YkVm4WYVYtiEzAkTfcypMxlvBA48xxIVyI7n75z6aA1+4m5N2Vzc28KXC3BY27syzBGYn1JNNTLfkSX+yBxIJCeQWO39nvnl2w9xd1rwofs725cVF3Mg1aXIulNMfuGHSEjqxSh5R5MONkBY4JJ4p9BgnJJ767toLtiboVPcLa+9o9vT6yyhuqwpsESI76kgAODv2V2B8eSo57kHn/AObfUmtjKDt7FvGM3PpNwJrgnKp5U2pYS4A3w55wCsHOe+PHfQEh7AVl64Lbn1JW40q+WRM6CJUihCmFhSUJUpARwQVDC0nlj1xnsdV2353V3BTvtX7Ltu76jHmtORI9twqT7sY7j6+BcTKUvuFZKhxPg4GAPNqtvqdetOhykXrclOrshbgMdyHT/dQ2jHcEclcjn11AN5+yxVarW7jRTLrpLVIr9VFVU5MphcnQXuSlHpOpWnIPNQwcAjHbIyQLB7c3HEui0INTjVSFU3UthmY/Dz0jJQAHQnPoFZ10Wo49nnbyq7X2Ku0p9aiVaLHmOuQXWYnQUGlnlhwZOVcirvk9sDPbUj6AaaaaAajv2jpKIez1ZlOSWmEMllwpW3z6vF5BDYHzJAx/2akTWsumh065bem0GrMl2FNaLbqQcEeoIPoQQCD8wNRnFSi4vqTpy5Zp9j+d9/Vn8qKhGiw689JiIUp1iIeQaacWfzihkDBOE9+/44wNafpxIOFCKS42fzYb7leD35EeRjOu6rWzt+U+qSIjlkVOSW3FBLzEQvIWM9lBSQQf+/Ya3FvbFbm1dOU22achIwFTnUNfs45KvT5a06cHCCpxTwtCyr8MhWrevUrxS303znPf8n1OE9+ioqTLsX3tUdtjiC+McScZAA9MD9+Prr8cjxanXWWpLHFxlkF1Dn3jnuCDnuPw+ettTLHuCc+lv3UNBa32W1uqwlx1oHk0Mf1sjABxrZRLYgS5dIny6vylPLZbm0xlSkOtRyriCgJ7qITklPdQ/brHGLi0vYjxfgVGtGUrRqEpdtI7Y2S06vy/BydwwV0Yt1ikqLDrbiis8hhQPkYPkH5HWVU639usJhQm+EIozMDayFPK8hPI5wkdjxHr5JwCJQg7Vuybhjy4Fk1ufSUscSythxnm5niVc3VDtglQwfQZHkazF7N1qn0/3WXZFWlFMvrsyozjRcWzyA6biUrOMpyew5AjHrrK1PGm5r8J4Ra20FC9mqj6PaS9k86e+ngjmUiHULZp0FtLhaaSE/FjkUggd/w1qLybZYnwo1LdKG4qELLfcjuACB3+Q/79tSLW7ZptHpk9EmHVKFPVNeEJuUy620G1OpDaTzHH7pKic/tGubq1hqdq9WkUmtCdGYwtciT8KFEqKEpQUjBzgkdsYHc61oW3pyTT2y/mTs7K7darGvJOlUSTa3/lWF0xl6NvXbGxxjk+BxUmdGccSjIaUpjkEgj5+R/+9ercqhVJwQ4sWXIcdUQEAr7AjBwM+T4+pOussbbK8L0pc+o29BamMwnOm4kvpSpSuPLCeRAPbH7xrEm7c31SZIckWbW47xJCXG4a1E4+SkA62Hzcuh5D+FbKFdJV2knqs4fuSF7MLsaHuTbtqxJKW34xky3g40eQV0lBSE+AMhR/cfXVytV39lLbSpUedPuy66LLhVIYap4ldlpSQoOL4+QTkDvjtnViNZbSj6VP3by/LJcSlD13Gm8xjovCMKv/ANBVD9Wc/hOoi9lT+hq3/jM/wq1Ltf8A6CqH6s5/CdRF7Kn9DVv/ABmf4VanL/dj8Tk7z+6W3if4E1aaaazF6NNNNANcNuVu3t7txNhwrzuD7LfmNqdjo9zfe5pBwTlpCgO/zxrudVm9oWFcNQ9q7bCHataZolYcps/3ec9FEhDWGnSrLZ7KykKT9M59NASxWt6NtKRYtNvWdczbdFqpUKe57u71JJSopUENcep2I7kpAHbPka8rb3w2xuC26zX6fcqfc6I31Kml2K8h6MjOORaKeZGf7IPy89tQtvSuZZm/e0F0bm1BFUo0GI/Hm1NMQoYEzDmHC2nIRgrZV/7Mn+qdcHuJUKfe+4G8l9WaC/bTNpCFJqDbakNSZBUx2GQMn82f2Iz6jIFpbQ3x2su2c9BoV2NSJTMZUtTLsR9hamkp5KUgOoTzwkE4Tk4Gdedo77bV3ZVmKXQbmclSH0OLbK6ZKZb4toUtZLjjSUJAShR7keMedVcsqLPpG4tlyb+qS6kJu2//ABTktNJYajJVCX/wZwAfGpKVuJ5FWSVJJ+8AOh9la56FH2oi0S4t2UOU00qqe82e3TG+q00Ou44pLyU9VR6YW5jP9bA8DQE9Ub2gdqKuZxh3I8WocV6Yt5dOkpbcZZ/1q2yW/j4+oGT8gdYtJ9pTZSq1JinQL06sqQvg0j7MmJ5H8S0AP2nUOezRdcqgbz0vbCzbzbvuwnoD8tl9cJTbtJGFr4lRAIyoJSR4/ODsk9tdNtd/zne0p/7v/uZegJLtXf3aO6K1Eo1Fu9t6dMJEVp2DJY6yv7KFONpClE9gAck9h31l/wAtm2H5Ffll+VKPsX3/AOzut7nI6nvOM9LpcOpyx3xx8d/GqebWRZ9Ob2Frl51Jc2y11OWKUyy0ln7NmiYrHVXglxKnEoX3I7BQ7BJ5Sd/JtSf58xpHWd+xCx+Vv2d/0PvmeGceP9Z8fj+740BbdCgpAUM4IyMgg/uPjX7ppoBpppoBpppoBpppoBrkaRuXY1VW6iDcMdwtMOSDybWgKbbBK1JKkjngAk8c9gdddqAqFs5cdLoVDaM5cqUzTanFlsSJpXHjrfZcQ0plPHtkqAUfkToCR2t17AcprtSTXwIbQbKnlRH0pPNQSjiSj4skgDGfOtnRb5tOtPxI9MrcaQ/LdcaZaAUFlbaOa0lJAKSE98KxqGKZtVfTtjM2zJiiE405T1GS5cDkpP5h5Cl9NCkYR2BI/DGuzq23E23q/R7os5n7XqMaovyqg3UppS5LDzAZJDnHCSkAYGMaA5KLbOy9DlPwqrdtSqaV1B2b7s6txSEOIWptaiWkZ7HkkqJwcft1LtmMWQw65EtWLSm3Y7DLzhisgKDbySptRXj4goAkHJ1Ck3aK+RNaniKw+7LgyxKbiVpcToPPyVu8OQTlxKQoA+ATnXZWPbF/WPWnxFpNIrUaVTKfEckCb7t03GELSohHA5T8fbwTj014opbGSdapP70mzspm5dixIUGY/ccQMTmy9HUlK1ZbCikuEAEpRyBHJWB2Pftra3BdNv0ClsVOq1RhiLJUlMdacuF4qGQEJQCV5HfsD276iCwtv7+sSKl2nUyiViRPpCIEpqXLKW4q0OuKB+6eo2pLndIwcjXbXxa9fectGuUVmnTKlb3UQ5BUox2H0utBtZbODwKcApBGMEjXpjNhUdxbA+yIkmXWosiHUVONsoDC3i4pvHUSUJSSCnIyFAEZGuduSyNpqs3BkvR2qM7XUH3V6KVwy+A0pRJQQEZCMq+JOuepm0VwTrtp9wVuWacXqhOnTWqXPW0uL1G20NJQsAFR+DKiMd9dRvJtm7fsa2KUJ77VPp77vvj3vKhILao62wQrHxnkRnJGcn668aT3JwqSg8xeDRbUy9s9sKI5Gg3hIqEesyFyIy1RXF80tgIVxDaDyAP9bwe2PGpEYv8As55moOorsbFOjtyZiVJUlbLTgyhakkcsH8O3rqKK/t3uFOftqXIhwpMikxJEF80+rrgdVJUjpuJKU9gpKe6PQ/s1j3Vs7dlXj3DVoaoUGuTxFbZSZRdS5H6KUPMuLKQSQpIUFY8pz66JJLCPJzlUk5SeWyZ4942y+GujV2Fl2oGmoSArkZIGS3xxnIHcnxjvnGsm27iodxsSX6HUmJ7cWQuM+po54Op+8k/Ua4G6LAqadxa3eduR4wnSKEpmEXHyhLc9RKC9xAwD0uI5eexGmzW3lf2/rcth6qxKjSZlOYDim4/RUiU18OeOTy5IJJXkZKR216RJGr/9BVD9Wc/hOoi9lT+hq3/jM/wq1MFXacfpMxhpPJxxhaEDOMkpIGo82CtKu2pTaozXYiIy5Dramwl1K8gJIJ+EnHnWKSfqRfkprulUlxK3mk8JSy+i0JN0001lLkaaaaAa+FssreQ8tptTreeCykFSc+cH0196aA8ZsWLNjLjTIzMlhf3m3UBaVfiD2OviNT4EaF7jGgxmYvf8w20lLffz8IGNZOmgPJcWMstFcdlRaGG8oB4fh8tebFOp7DodYgxWnE+FIaSCP2gaydNAYlPplNpynVU+nxIhdOXCwylHM/M4HfXsiPHQp1aGGkqd/wBYQgAr/H569dNAeBhxCyhgxWC02eSEdMcUn5geh7nX30GPePeOi31uPHqcRyx8s+ca9NNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNANNNNAf/9k=' },
                { name:'Kenya Forest Service',     sub:'Kenya', color:'#0F6E56', bg:'#E1F5EE', src:'data:image/jpeg;base64,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lMobwVgO8/XkQHIwqwze1vCAP9DvzWNG+CcvZOy6+P3zgKrGWfyO7jWbz/J35NYePuhV7dJeAFs20FenryXLU30bwFsOMZgYXe2Xr5IEpivvhT7T1I8VKx5bMNkDP87C2/zy1+hx++QnZaP5RB1e/E3n+TvyMgEZ+iGR4UzIGNCg5L1sX1SktKYvMuHans4HZN3Yh5AAhe6XAEA2NS8wH2enLYt8dLWMbUar4/fITASZJncvfWJvP8nfmd95+uTRSsjq3ECJuwg1pRnSZozfR4+qppcZCXeJtM/FpejrG6DXN6EoyccPDI7EexHsRzjBuvXjU1ilzsRrKxWoWFMv6p2I18001y5/EGY60trkes+VY4DpXdLEsqZ2tYt9NK/+zkjuUo5uVQYs0/iYUHhX9PEAAfbL4jK3tg7sIoG0VOhwOtfBZQAuj1hSCmKn0eVYK4CQxKJ16RlB7Sa2r3Oe0RC7QgF9cIyVLRNymE4sDvRKhUnU1rAFExSeHDPpNXgbQOs6HCoiyEvSZmK8QGIUcalPPBltpetdYWA90ZfxAjNolyttzukM6qHmkqfZQVjrDqDRS8QYW2vpCDIUIBcXF1VwFDctXXWbSPg6EwEHKG8qorU+72hJ5rVUwXAwMzKQpJ6dCRlsFGV9/HAFySvaVP0mTbyLsHR31vPD9AffggTAYLNNjJdDMRoRiHzJgRgYzvIDafhgAfqAmE9y5Osblu3UHkn2MI7x0r20E0VHoqY7EUREKyR94QRkrhOdjhgtlpn2Jd+0/fFExwe0/wAXeYr1CNo4YlS30n0lCIGspH2qxATcFF9fHxM4VDeJroTGVZGbeqY7OxWWCaQUhnulkPsDpKTGhCQ7f17MHOFaivWFOdXZVyI1WfaBYetsjE15GkyyLyshBC6oauAfHmsrLg7v0lOWBW/UzNIcLSVoxumiH2p3LUwVgW7zKq1LvGOGM0GoRRxWi28QkLVCYrlmjvBkmpOg6MGjFVm3rMaqKDbDpmSnTt6Sof0JMsjZbK/+yv/aAAwDAQACAAMAAAAQ888888888888888888888888888888888h0Gyyy0UF888888888888888cRc88888shx888888888888lOF888888888Z/t88888888842c8NJLz2ioD888C888888888Bt88Qv+/wD/AP8AOZS8Nl8888888lR88CH/AP8A/wD/AP8A/wD708Vx888888s888W//wD/AP8A/wD/AP8AuI8+z888888W88sa/wD/APH7r/8A/wDoPPPvPPPPPCvASH//AP3tbbX/AP8A/oPAPPPPPOCfBMP/AP8A/WEdU/8A/wD5zwbzzzzzyHzjnfDz/wDsr+/7nL88S888888E886DvCj8dUCv8X588F888888QAhXaMcnqN7PsDywgwT888888p5U8xBW87EDMMEIBjJ0888888SlZ8/3/wDPRV/M0QvDM/PPPPPPApZPP+IfPYvPPF3PpGNPPPPPPLjTXLTjvHunvPDfHfl/vPPPPPADPPPPPG/KIvPPPI/PPPPPPPPA+ZQ/LIkI/rg3nrHoZtfPPPPPGjeQKLOYhqk4a2cqHyZvPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP/xAAoEQEAAgICAgICAgEFAAAAAAABABEhMRAgQWEwUXGxkaFAUGCBwdH/2gAIAQMBAT8Q/wBBHgTDepfgufUJ+CX7EvxJMt7isH/AE3/GJVYHwJVZESL+WCtEw/f6RSt+ISsn/D+0aYfjx7n9cqG4YQyo+0TLueWj4Y1TmeQz0/if38RDaKq3lijLZsOwwUBLOEVkBPu+AtBAumjpg1CvhET5sz8wU098L+vR/SfFQxjzfA1Mk+3dwe+mPvfSyTdRKhTEdStXfP8AW98QeuFqAGmLc8i01L+3BgXUrgmJGXo5syOMw9d9j8cKzab061aqQGOlQmAeZfv/AM6EY8/o7+b1yOgoeB68xyuCfx8QJHiT8SxPKQZdT2hqsjnVeu+Sc1MxNUxBNR1H1ofGZlm/jINtxVDTKwc4t++73gj7qau0MNygPJPOlyQxDJcYI/7CS8/vGapKUM80sSARIbTmZxme7j0jXCT0cGkHATY4BuiV1UVscAnISuooynFcoI+5ANd9sb2Tx+QbhFAHjZMEzTxmmmVnepxS3BjfBtgHFxXkYjeXw2y6qaeRcvXAuBsQdUtzuqsiWM1OEVnAFTwNRBlEGp6+7WQamaGIre5WIyq3Ydngykt9ShdV0VTUK+OwmFRgsy65yO5mu1lGkt+5eW/h4gXHySpUZJvxESFJiNAS3KW9FS5DjUsZgxBNsrCOav5lsXfrUSHn3KxKlBbJc0WpZOo1MqjXyphT6xBS3GSiIprhj4iqfmodyFSgPqiPaoBZpBRX+6P/xAAmEQEAAgEEAwABBAMAAAAAAAABABEhECAxQTBRYXFAgZGhUGCx/9oACAECAQE/EP8AAjkzLjc9mp7FPySrhSvtCvGoDI/QLVSXOT4E84MGq8tQLZ+wQAUeIBTP3D/kG8nj/gP72AYHOfeY7lfWmVur2fwPiaqwAUa9HgcwMNCFMaN+vAQtgaty6mbZZvwjVamseoqWb3de+yx4hdJWrRLjq11vMz62WdgnTBe201/s35q+6jnY1C2pSUjwpxxrDZRq52/g/nRGhEuTaIxpDyMpxmCq2C9fT87+x91aq0WAsfnoqAIS2ORlmCaET0tLDXmPu/ANVdxMqQVkfCUVUwJOKGaYau9DdwDWuRPW9EJGeGCriJ3Bdky8T4S3qWLZgaj0w9iW9R9CEQ4q3Ay73qHMEck++iyM+04F0FzPaDcOhPCzHMHwOh5Gcf4OOYRC56ijKCbenDMhzk0rUloVraWkR4XwcURYpb6hlra08cpAnJqjH7otRdSJulG7xFMAUTkaAKdBKzRS2LWRazb1CmLWQOUA0bwFss63IOdKGiDe2hfjfbMVsvaN2zJxcsWeJVBgVFG4czM1ZcbaXLoeoJVgi0ozBRcvWd9CnR9JSoolMK9y3uKFQKjbuACoU70FCoAKIAIKdzDhhj/aP//EACwQAQACAQMBBwUBAQEBAQAAAAEAESExQVFhECAwcYGRobHB0fDxQOFQYID/2gAIAQEAAT8Q/wDtXsXnmoBE3ig+vSCVDuov2uNeguj9XFWUvT+sAUVtk/COZZNq/CGtK8v9JxUaszERblU96lWt4q+7EHMelg7CV/4KhrCxx/e2jQdgHzXCDUsm38JOWLMPsQAKHSm4DQDy7K6Sunz2aKXmS9D6o37znXq89mO87rKfTRgg5h/is3ocX95f+/bSPx1Z9vz4jqlRxK6749r3cAfLeARfBXPFZMuGzA2/Nl2+pAblrKx0/ODBBM6vQ3l4v/YcpLbQSz175n7DrDLxvnD1QPTaHQRf8AhVodjHW3gPd9oW0+Eb6fvBbXarE/1FPB1HgIwDI+B15YcEsws/n/k2jQhGF73JD6ezMlcrZ6QPbajlcJs/59pleaG+UI3rvPBX75gnNoX+cDzaJkeThhPoQicPD1gWNfufD/mCEbBu9glPAuzX72yjRZqA7lS+x7rpDSY6e8z1S+IVU2gxe+toJUsLTo8PAhTbRcdHr/kUYNWgIdbJNhy82Etol9e6M0GvmIm3fdYvygFM0qX2iD6LUBGrJGpS8kqvNwb7zE0f3YJalan1DbWHW5VADgN3WJDR434gUkZM/wCspqHDoB03+sxx7FB+ZsEM4p6TSzv93gdo0Rse8QUNPK2TrMfDeynQfeG7Ww0T/EmMyoE49R2/OGqDB/c7DuLlaPwBcAjQPCuGuXsr1W/fxNpbK0fPwTQ9oukmPt1fdebBTSVYb/yrEmIHdKHMIRolk27WAEAeBw8mMKZN2jX0y9/8KjSnqX8awFFTuba+vvrxRZ64+81f4ELbzindebMwK4ATbuhwG6Tt9sI4H0fqf4HSPIttNKP5wGJJtg7u3ZwjCL4bazV/hreFXmI37ow2FdYkEvLpe/1Ox8Vge44OIAci60/L3mDUP5TbIesNrVf8VXmm6jHY8HKxV6kCvGiNj3DGJSpJ13LD6MG6YabHDNfGcEloer7EqZMegd5KcOA8+hGGZRtV/wAlf4gLb0mYJ+djYcmJXcNcUu9uGO/ag+T8Ki+K2dJboFwoqNby8d4OiArLCZbYGgP8o/17QMfidDHupfPg2/OMzYCPTxbNULz4ZtFN5NDvGnv+8jvhduXD7f5VOhj1EjXGAttR9dZhO6WMS36THZ2fU4Q8RsMsz4IeNFF6d8Fo3JFYDvnaVvtvHfbJTj90m8kWw9Ll+hL/AC9lRNC6sNU8Q5lNziLXJr4Jift2AVfGYJWsWB9e6Shdo8zP2iuMgPMz8+KVLNevWQrBp3Kg3GZMWgbJwpS3knfeHBdKtTNg1wLdW9mo/KF5Her8QsKveJvrzl41b948cQxexNGrEp7KsDqRDxS01+TrLK3wS7+Bj5b914YUKwFLzNu3VcAxecOJ1Px8Rlc+Iek9u01gf2l7CUlnRQP1j6eXprWvA2wSkQxczPDs3i0YoRXonJ0gANQH3n67nNdKEkirtgh3zKKo2fONzbbW1fAueB5ujcFWC4pLIdjCDdR9J4jpFd20vajubR2NTN9n3+GTEdF0ekqA/q21DNkXMzWjmIx1yvr/ANzQzZ6E8yiiWnkR7v8ANzotbyuuK+NbePAeq4Nz1fGYAAKO4Roisy/WTw9MxFxdHcNolgNIvjpGe2DWvowerBKtevg4XGV+/wAs3iSkNRjMEpNU0YZU+eRLhxQaevf0iyslVsGVYMUCnK+sNqjBfwKSG1VlyvhO6RuUHuw08N0lk73nqDN+6hE1qaAgINn76DkPBNjcmix9e/vKhfva9MWUzdIaxa7bDqMaFZF+5hed8XUJj844xl0wLwjud/duRjrUJG41c93wkTpaCU7rvB5q/Hi7A0+vL3LZSt1W4uEwDEr77pCGpMbqm0YAo27o1YlJLCJSTET1/K/ceBHjTqpcoosxK6se727gzhEaFap85+n+l8xeAax7eXr2Gngo062Ylf4zYBinhiXHzdka7CUFbZvhgPpB7VFWivKuhCmSUKR7GmxG4TA9ZqUYe6RZOiY/HiivwK3l+LAM0Szu2P25iZhVSmgC47gBYbqjrKsJsSLVeOYYvpwhfQFteVpcEaGmxh/pC722i4OXpKjfFS3NECFyLpUsNmdQurqwcFP0dTrEu21WPy9g8u35jGE2rVVfd/CNyjWlPcIbVX/pA1vtCAOlY6HmbQWpap+vCkZXsGwBzKBXdQLHtpc1VGL1W+KTWkvi/wCS8YWXpDuEdKj2J5TOj7p3cADE6aFKwKKILQ6MvS0IXa2nRDP7XyDy90obI/O77GNMQ16e5TYJRoY7WfMoQAYgdxGjcPdh5mEe0mfQweKnhul0LuDsYqazx65bxXdHNfPSD58oB9dgpY0bPK3I2shtYebpH8xQPWdSKO0AL0BuzTaQZPNNIyWl/wDQgu/NHr56Q+9bgkCnJl+1TJ1MMD0dL6TCX5BxlkFj9sFeU88rH8ypgQFnSp7pcCJyRNCfyUrV3LI2xAtA6/klda2AvYmSIU0SBGLVavVKJYjBj1wr2iAkdhH5l+J5AxjGGIRwEvz3KXUOJc6/bbLyIKa9e8+iHxZ1sq8ohB8PocSKaW08OvoxVsQz4Xr1hrfrSni25DfVAhUT6VqY4n679p+u/afrv2iJkPP8MstTcGVknBc/oPxDKAeI/wBV+JtCCuI4RNX1gbT3H4j1meq/EYN0RrIf9p+I7WT/AHc/q5YFegxWU3PKVX72f3EIHGiUSdAPw88m/wDMIpU3HNh/UBH5B0/zKPyZ/Qz+hn9TP6Gf0MBaVIabgPDDJ4yLKvlP4KfwU/ioXRXUz+Gn8NP56fx0/jp/HT+On8NP4afw0/jp/PeCRRYYccZYSx7bLPHLS6/hn6H9p+//AGn739p+9/afuf2igEsEj7SvFZZy4MT7SwoWVj1IbGAtXaWspTT/AGllcjqvtEAGjmVMypsGWFdwhMWyBNKZUqBEuiaE/W/t2ZOsFdVuxP2H7Q+JrPftYRlnS/SdL7pREAdyPIe3QE6X3RYFTNAvzmZmMIRYs0L2lCa2rT+ZX+BORmPGZ8hHTdf1nGFO0cfvDrlNAbwXiVi08+fbvPjI8SjO7P5KfwUZtcPbPb8lLmgrKrj/AKTPs/8AtOfach+AmMVdXXrNCKyro/qzaAUHQ2h7w4nLBqEustXtTIPQAikWHyxNJm7f0T8P8HzUsZlyjePxba9VgR/XGPuwrt3nx0bgMg0sD/CgYavRANKBrxZ3aGWCNjBxaxuNE/dPnfq7bJV1hQHrekSeOvCRi1iy10AXbd3HWQHszFsoV6sfjq5ppT9JjzxK7cnxf+D5rsaZ9XYRWXLq/WHtDNuPbvPjoXCQ0iD/AK/pDjRv70iNhQadDu0VYQmnO00urBs+p2Pnfq7gl2pHRItFtA4uamifV4M1ALji2DuZB6Pjey/8WTbbpGXKgoz84hCAFdGWHiHmTnxvmo3djgZoPSDwAqDgye0KVhNZv1YXXf6e3efHRARKhq/WfxH4n8T+I+0s2xU1r3aBBW23GCor1L0hHzv1d39ZxPkvr7ieg3Pnb5jqGkvVjCTotjFpILYQKsJNWfuTJ420JLZHahvleoXEujB4w7Ut0QJiRz6RpMmtsHftKSrWBvuJSnNCW2zNu3LNl6i+x+PbL1lw5btrF8p47E547t2ar3QJrLE4IZdhc90e2uJUSxK0XaZdJ39gEN3eEq0cQnM5aNLiENYlc3s1/wChf+DSefi+nc9uz08FgvSbf4+k1BrpcO5KbL3GlLmwp+WZFOB17LOfBusssrCg20WwewwDt9A+hK+kiOtsUvvBI5IC2IVTPXvjH6waFriXc5UVLYx2h/kZrIrB5qh0IOkADYm+D5k0SCHzwaUcy6P0dVbGzDaw0KK6ibMoCRDQqrWYGciCM78+JX929gcn0uY1zLZtdaQ6wlWRdfUeYpRnUA1pu5idOMmByXWJtt0GjZW+Ih6FWmmGpm5wZL6zeNvNnxawG8Na/QtjO6g7nsMMa6jhn8JFp6GMXG3Vj2HyIJoLuXrMNgdXbmUaSoIZcODEIeYwB1NOM+k0jSwk0x5wBYFCgyqiuDQmoOn5hJdMAam0GIk6AJAsrqtOaM15wry24jurARCCXphTgh1UsaN2HUiCsM4XsOj43EAq2qQ4C0W5UR8IR2zQ1Lx638Pui4a1mJ5HbX7Z+n4IdtTA3crGiBn61+VxrsTi9KxDLcWzMmNBJ2usibjGRrKz+Sm9oe5/4z9jxAJvBZoQsSYpTzZrOgJnC67JcetF7jdl/aI8QJY0iGDeykLueafMICGfLXu0FQ5AkHcYpvHnRb6WNhDIaAZPtDWERsFSfP8A0xukomzRf3gJ6TjpVYjSKMPW7QTZJX7dvWPPdY5EpgETzYBW8x8XrCI6RK57wYaK+ECaJYvLq/crZHiXGD3qty8Q4qIml9S7rLCNMVbw1mcid3SQvGt2A+lKKYPenTDWKCRlQ4qCliVrdiBsy5+2vSbDbY2qAleGKB5TuMNDdHe6V2U4LAO9a1lEVVbY65hYK0M8jpwQgfVgtw9GaqCl6ejrXRlU3fVOrlpeFAsMtZYxhV2RliMOvVwarN28M0gJSze31lapbyoy4xWVWrWJ+rFZa6zWG89BphrFVLk85GJFFFjZzlhk7LoUzzwoqegxDxdo9e32nn2MIkXGZWK2hQQmJ6QPLszt2NQJWKhKJR2PUlFSsQrbsaqogkCtJtmB/wDpj//Z' },
                { name:'KMFRI',                    sub:'Kenya', color:'#1D9E75', bg:'#f0faf7', src:'data:image/png;base64,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' },
                { name:'IUCN',                     sub:'Global',color:'#185FA5', bg:'#f0f5ff', src:'data:image/jpeg;base64,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' },
                { name:'UNEP',                     sub:'UN',    color:'#0891B2', bg:'#f0faff', src:'data:image/webp;base64,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' },
                { name:'Wetlands International', sub:'Global', color:'#1a7fb5', bg:'#f0f8ff', src:'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PEhUQEBIWFhUREB4QFxcVFRkXFhUYGhUXGBYVGhcYHSgiGBolGxMVITIiJSkrOi4yGCAzODMtNygtLisBCgoKDg0OGxAQGzUlICYwMC4tLSsyLS0yLy0tLS03NS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAJcBTgMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYCBAcDAQj/xABFEAACAQMCAwUEBwYDBQkAAAABAgADBBEFEgYhMRNBUWGBByJxkRQyQqGiscFSU2JygpKy0fAVM5PC8RYXIyQlQ1Rzg//EABoBAQACAwEAAAAAAAAAAAAAAAACAwEEBQb/xAAyEQACAgIABAUDAgYCAwAAAAAAAQIDBBEFEiExE0FRYXEiMpGBoSMzQrHB8BUkFFLR/9oADAMBAAIRAxEAPwDuMAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEA86tZUGWYAeZxITsjBbk9A0qmtUB9on4A/rNOfEsePnv4M6MP8AbtHwb5D/ADlf/K0e/wCBo9qWrUG+3j+YEffLocQon/Vr5GjcRwRkEEeU24yUltMwZSQEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEA87iulNS7sFVRkknAA8zMpNvSIykorcn0KDq3tFIcC2phkB5s+QXH8IGNvxOfhOnVw3cfremcO/jOparW17mxpuo0NQz2TMlbGTSqNnPjsfvHx+6ee4lwOcPri9/7+x0cTiFeR0XR+h8cFSQRgg4IPdPMyg4vT7m8fN0joH0NMaMntQuXpnKMR8P1HfLK7rKnuD0Cd0/Wg3u1MA+Pcfj4Tt4vE1P6bOj9TGiYnXMCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIBhWqqil2ICqNxJ5AAcyTMpNvSMSkorbOQ8X8UPevtTK0VPur0Lfxt+g7p3cTFVS2+55XPzZXy5Y/b/cruZu7ObozoVmpsHQlWU7gR1BHQyMoqS0+xKEpQaku6Or3uLm2pXijm1MF8eY5/I8v+k8JxfE03JLqu/we2os8SuM/VEPunn9Fp9DTGgZBpjRkyDTGgTeiapgilUPI8lJ7vI+U6/D85xfh2Pp5MMsM7xgQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQDnntQ10jbZ0z1HaVceH2E+7J9PGdPAp3/Ef6HF4rkNLwo/qc73Tq7OFoZjZjR9BmdkWie4f4rubIbFw9POezfpz67T1X/XKat+JXd1fc3cXPtx+i6r0LPb8TaZX/3tN6DHvAyv4f1E4eRwFPql+Oh2KuLUS+7oStvpVGuN1tcK4HwOPI46fKce7g0oeevk6FdsLFuD2ad9YVaBG8cj0I5gzlX4tlP3FprBpraBmDMGS26He9qmD9ZOR8x3H/XhPS8PyPFr0+6MEjN8CAVrV+NrO0qtQqipuTGcJkcwCMHPPkZsQxZzjzI0rc+qufJLeyyKcjI7+c1zdT2VyjxtZPXFspfcavZA7fdLZx1z0yOs2Hi2KHMaaz6XZ4a79iw1qoRS7HAVSxPgAMmUJbejbbSW2QehcW219UNKiKmQm8llwMAgdc+cusx51rcjVozK7pcsCflBtiAIBijgjIII8ucGN7K3xHxpQsKvY1KdRiaYqZTbjBLDHNhz92bNWNKyPMjTyM6FE+WSLHQqh1Vx0ZQ3PrzGZrtaNxPa2ZzBkQBAEAQBAEAquk8c291cLapSqhnZlDMF2+6rMejZ6Ke6bM8WUIc7Zo1Z8LLfDSe//haprG8IAgCAIAgCAIAgGNRwoLHkAMn4CEtmG9LZwDVr83NapXbrVqFvgPsj0UAek9FVFQgonk7puyxyfmauZPZVoZmdmNGQMzsi0ZAzOyLRkDM7INF29mukO9b6Vv2rSymAfeclehH7PPPPvAnO4hclHw9dTrcIx5Ofi76It/Fl1hVpY+sd+ccsDuB8ec8lxOz6VDR6NlaDTiNAzBkdGSU0G42VgO5/cPr0+/Hzm7w+zkuS9egLdPSgQDkntUttt2H/AHtAH1BZT922dbBlutr3PPcVjq1S9UXx9W7LTRdd/wBDVx/MUG0f3ETQ8Pd3J7nWd3LjeJ7HGbKsaVSnUP2Ki1Mn+Fgc+fSdma3Fo8zXLU1J+p2Pj2+7KwqkdaqiiPPecH8JacfGhzWo9LnWctEn69PyQfsosAlGrcty7R9gJ/ZTqf7if7ZdnT3JRXkavCq+WDm/P/BJ3/tAsKTbAz1Mciaa5X5kgH0zK44lslvRfZxGiD1vfwSuhcR2t8D2L+8oyUYYcDxx3jzGZVZTOv7kX0ZVd32Mq/GnG6or21qW7XeaTvgjs8HDbSerHoCOnXwm1jYrbUpdjQzeIKKcK+/Z+xt8EcS2hpW9mrHtdm3Gw43AFm97p3GQyaJqUp+RbhZdThGtPqU72msWvnHhSVR/bn9Zt4f8o5vEnvI/RHYlAUADoBicjzPRroipXHtG09The0ceKpy/EQZtLDtZoS4nQnrZKaFxTaXp20nIcDOxxtbHiO4+hldlE6/uRfRl1XdIvqe2v6/QsVVq27322gKMnkMmYqqlY9RJX5EKUnM0L7jaxoojl2Y1UDqirl9p7yCcL6mTji2SbSXYqnn0wim33NjQOKrS+JSkxDgbtjjDEeI5kH0Mjbjzr6yJUZlVz1F9SWu7qnRQ1KrBFXmWY4AlUYuT0jYnOMFuT0iq3HtGsFJVe1b+IJ7v4iD902lhWGhLidC6Ipvs4XfqCMeoR39SpH/MZuZfSnXwc3h31ZO/lnTNd4jtbIDt395hkIo3MfPHcPM4nNrpnZ9qO3flV0/eyHtvaJYOwUiqueWWTI/CSZa8O1LZrx4nRJ6LdNU6AgCAIAgCAIBD8YXBpWVw469gwHxYbR+ctoW7Ir3KMmXLTJr0OEZne2eZURujY5T6DGzGj6DM7ItGQMkQaMwZLZW0b2lahVtqgqUnKkHn4EZ6MO8eUhbXGyOpInTbOqalF6O031Jbuh/4ZVtwDIwOVz4gj1E8pl0OcHDXU9jGSnFNFJdSpKsMFTgjwI6zzMouL0wfQZXoye1GrtYN+yQ3yOZmD5ZJ+hk6BPXoyIBzz2u23u29XwZqZ/qAYf4DOhgS6tHG4vD6YyIjW9W/9JtKI61Cc/y0mI/xbflLaq/+xJ/71KL7/wDqQj6/4NXi/RfotvZZHvNRYP8AzFg+Cf8A9GHpJ49vPOZXmUeFXX8dfk3uO9W7W0skH26Irt45CBB95f5SvFr1ZNlufdz1VpefU3+L6jWGnW9khw1VcVMeAG6oPV2+WZXjpW3Smy7Lboxo1Lz7kTwvW0alRzeAvVYnIKOwQZwAMcs45585der3L6OxrYssSMP4vVmjpFxTo6lTa0Ymk1ytNdwIOyowVlIPPluI5+AMnZFyofP30VUyjDKXhPpv9mbvtNsaVC6HZLt7Wmar8ycuztk8zy6SOFOUodfIt4nXGFi5V37l54Y4ZtKVOhcCkBWFFWLbm+s1PDHBOPtHu75oXXzk3FvodXGxKoKM0uuigcWZfVXHXNeko/tpjHzm/R0x/wBGcjK65mvdHYnYAEsQABkk9AO/M5B6N611OZXd7w7RJVaD1eZyU3Y9CzqMfCdKMMqXno4k7cGD1y7K5pFamNQotbblpm7QIGxuCM4UqcE9zEdZs2J+C1Lvo0aZRWTF19FtFu9rtTlbr5u33IP1mpgLrJnR4u+kUY8G8FW1xbLXuAzNVyVAYqFUEhenUnGefiIyMqcZ8sfIYeBXOpTn3ZW+EaZp6lSRTnZXZM+ICup+YmzkPdDZpYi5cpJeTZIe0nVKlxdfRVztokKFH2qjAEnzPvAD18ZXh1qNfOy7iVsrLfDXZf3LR/2Ksra0cvTFSolFnZ2Lc2Ck8gDyGRymq8qyU+j0jeWBTXU9rb13Kt7KUzeMf2bZj+OmP1m3nP8Ahr5Ofwpbub9iP4xYjUaprqSBVB25xupjGAD3AqPzk8fXgrl/1lWbtZLc+2/2LfotTQrt6a06K06qsGVWBQkqcgZU7X6dMnM1LFkVp7fQ6VEsO1rlWmXyaJ1RAEAQBAEAQCv8ejOn3H/15+TKZfjfzYmtlr+DL4OGZnZ2cHlGY2NH0GZ2RaMgZnZBozBkiDRmDJIraMwZJFTR1X2ca1SqURa4C1KIJx+2pOS488nnONnUyjPn8mej4XkwnX4fZocSaY1JzVHNKjZP8LHnj4TymdjOEnNdmdNoiFM5zRgzBkNGTo09euxITIKn7TbffYs37qqj/M7PyebWHLVqOfxOO6G/TRznhm1a7ubeg3NEbOO4ICajj1OR6zo3yVcJS9Ti4sHbbGHki/e1W23WiuP/AG64J+DBl/MrNDBlqzXqdfikN079GUbhag15eW1Jua0ceiU2apg/Fjj+qb17VdcmvP8AycrFi7roRfl/ZFs9rVkzJRrge7TZqbeW7btPzXHqJqYE0pOJ0OLVtxjP0Izhi50RqKrd01WqowxYPh8HkwI5Zxjl8ZZdG9Sbg+hTi2YjglYkmWHQKWiXFfba0galECsDtcAbWGCN3UglZr2+PGP1vozdoWJOeq11XUq3tURvpgJ6G3XH9z5m3g/y38nP4qn4yfsXnhvimzuRToU2PadkMoUYY2qMjdjBx8Zo3UThuT7HVxsuq3UYvro5xrlbsdUepUBxTvVqnx2hlbl/TOjUuajS9Di5EuTLcpeTRc+Mdbp3enVKlq5ZO1Wm52spAyCRhgDjmvzmnj1OFyU0dLLvjbjOVb+SC9n99ptGnU+lbBVNTkaibvc2rgKcEDnuzL8uFspfT2NXh9mPCL8TW/cjNHenV1VGQDY12XXAwMAkqQO7oDLLNxx9Pvo16XGeWmu2yY9rlTNWgvhSZvmwH/KZVgLo2bPF39UV7F34TXbY2+f/AI6t81z+s0butsvk6mL0oj8HMeBAX1Ok3X3qjn/h1OfzInTyelGvg4mF9WWn8/5PvHNGpb6g9Uj6zrXQno2Av6qRGK1Onl/QZylXk83wy3arxzY1rSqquRUqUWQIUbIZlIxkDHf1zNSGLZGxbXQ6FvEKZ0vT6tdiG9klMdtXbvFEL825/wCES7Pf0pGtwhfXJ+xY9Q13RrotTuGQmmxT30YEYJB2sB05dxmtCq+HWJu2ZGLZuM2unqc4q0KVS+CWG4oay9lnOeW0k8+eAQxye4To7kqm7O5xeWMshKnttaO6TiHqhAEAQBAEAQDS1qz7e3rUf3lFk9SpAkoS5ZJkLI80Gj865PfyPePCdvZwOUZjY0fQZnZFozBkkVtGYMkitozQ5OBzPgJLZW1vsSNppF1V/wB3QqtnvCNj54xIu6uPdhY9s/tiy+8C8JXFvVFzcYTapCoDlssMEtjljGeXP7pz8zLjOPJE63D8CyufiT6excNdC/R6m7psPz+z9+JxcrXhS2dl9igqZ5xkDd02lvqovi4+Wcn7gZOiHPbFe5JHQJ6gkIBrajZU7im1GoMpUG04OD85KMnF7RCytWRcZdmRmicK2lk5q0VbcV2ZZi3IkE4+QllmROxakUU4dVMuaC6khqunUrqk1CqCUfGcHB5EEYPdzErhNwfMi62qNseWXY0ND4VtLJzUoq25l2ZZi3LIJA+Qlll87FqRTTiVUvmgiXr0UqKUdQysMFWGQR4EHrKk2ntGzKKktMq1x7PNPY5AqJzzhX5fiBmysy1I0JcMob3rRJaHwtaWTGpRQ7yuwszsTgkEjGcdQO6V2XzsWpMvoxKqXuC6m1rOiW14oW4p7tvNTkhl+DDn4cvKRrtlW9xZO7HruWpo0dH4Qs7SoK1JW3gFQWckAHryk7Mic1yyKqcKqqXNFdT11vhezvWD1qfvgY3KxViPA46+sxXfOvpFkrsSq57mup7aVoFtbUmoU0zTqEsyud27IAOc92AOUjO6c5czfUlVjV1wcIroyGuPZ5p7HIFROecK/L8QMuWZajWlwyhvetG7pPB1jauKtNGLr9VmdjjIweWcdCe6QsybJrTfQtqwaapc0V1PXXOFrW9dalcMWVdg2sRyyT+ZMxVfOtaiSvxK7nuZKW1qlOmtFc7UpimOeTtAwOfwEqcm3svjBRjyrsQ+jcI2dnU7aiGDBSvvOSMHry9JdZkTsWpGvTh1VS5oLqSOraRb3abK9MOBzHUFT4hhzHpK4WSg9xZbbTC1amtld/7ubDOc1ceG8Y/LM2P/ADbTT/4ujfn+Sb0Th61st30dCpfG4lmYnGcdTy6npiU2XTs+5m1TjV075EQ9f2d6exyoqJ5LUJH4smWrMtSNaXDKG9ktonDVpZZajTwxGC7Es2PDJ6DpyGJVZfOz7mbFOLVT9iJeVGwIAgCAIAgCAIBwj2haQbS9qADCVj26eHvH319Gzy8CPGdTHs5ofByMirlm/crYMv2UtE9w9wreX3OjTxT/AHj+6nocZb0B9JXO+EO5OvHnZ2RftM9l1smDcVnqHvCYpr8O9vvE1JZsn9q0bcOHw/qeyx2nCGnUvq2yEjvcFz+MmUyyLH5l8cWmPaJLULSlT5JTRcfsqB+QlTk33ZcoRXZGtd6xbUuT1VB8Adx+S5MpnfXDuzLkiMr8X24+ort6BR95z901pZ9a7LZHnRA6rrtW590gKmc7Rzz8T3zn5GVK3p2RFy2aCmabBZOELTLNWPRRtX4nr8h+c6XDqdydjJxLXOwSEAjNf1JramrqoZnrJRAPL67hfyJk64cz0U3WeHHful+TW1jiAW1zb0GUbLgEF8/UOVVPQswHqJOFXPByXkQtyFXZGD8z0sdSr3FGq9JKe9Lh6KB2YIQlQrkkAkEgE8hMSgoySZmFspwbiuu3+x5cL6nc3SdtVSktM5C7GYsSrFSSCoAXkcc5m2EYPSZjHtnYuaSSRr8L65cXm12FsEZNxVKrNWXuGU24HPzmbqow6df8Eca+dqTetfPU8n4mrrWYGnTNEXwseTkVSxCncFxggb+fPuMkqY8vfrrZB5UlPWlrevc3tT4gFvd0bZl92upy/wCyxbagPkW5fEiQhVzQcvQtsyFC2MH5+Zs6Nqnb0WrOAoWpUXkeW2nUZd34cyM4cstL2J1W88HJ+/7Gpwzrz3tOq3ZhHpv7qknmjU1ekzHHLIaStqVbXUrx8h3JvWtGOjalfVq1SnUp0AtCp2dQpUctk0w67AUAI95Qc474nCEYppvqKrbZTaaWl/vobNjrIcXTuAqWtZqefFURWZj6kj0mJV65UvMlC9Pnb/peiOt+IrkdhVrUEShdVFpoRUJqpvBNMuu3HPl0PLMm6Y9Un1RUsmf0ylHUX+f1Ny/4gFG8pWjqNtannfn6rliEB8jjHxIkY0uVbmvInPJULlW/PzPfR9XFa2+k1AEUFyefIKjsA3qFzIzr5Z8qJ1Xc9fO/f9jx4V1tr2m7PT7NkqbSp67WRXRvVXHyMzdV4b0nsjjX+LFtrWja0PUWuUdyoG2vUpDBzkI5UH1xI2Q5XonTY7E37tfgkZAuEAQBAEAQBAEAQBAEAQBAK5x1w2NQtyq4FWl79InxxzQnwYD5gHultNnJLZTdXzxKpwT7ORgV79efVaB6DzqeP8vz8Jfbk+UCmrGXef4OmooAAAAAGAByAHhNM3D7AILiDiSna+4o31MfVzyXzY/pNe69V9PMhOaiUq/125uPr1Dj9lfdX5Dr6znWXTn3ZS5tmiplDMHqpkGZPRTIMkblhavWcU0HM/IDvJ8pmuqVkuVEl1OiWVqtFFpr0UY+J7zPQ1VquKii095YBAIvX7CpcCiEKjs7unXbcT9VG3EDA68hLK5KO9+jKbq3Pl16p/g1tV0L6TXZqmOzazNv194OagbcPhtU58RJQt5Y6Xrshbj+JPb7a0evC2mVLW2WjVYNUDOzMCSGLOzA5PkRMXWKc+ZDGplVVyvv1MtD06pQtFoMV3qjDKk7cszEc8fxTE5qU9olVW41cr7mlwnpVxaqtOpStwFpbDUpkmo5BH1sqOXXvk7pxm9psqxap1rlkl8o1bfhirTrC6Uoav02pVIOcNRqHG3OOTqACPUd8k7048vlpfkhHFlGfiLvt/hm9q2gG6ruzkCm1n9HXB95X7QOH/pKoRz6iQhbyRWu+9ltuP4k2321r9dmtR0G4GniyLrvdiKrgn6j1C1Qry5sVYjn4ybti7ecrjjzWP4W+vn+TZ0bQqlrcvUWoXpVaCoTUILh0YhRyUDbsbEjZapwS11J047rsb3tNefsbWiac9Brh3IPb3JqjH7O1VUHz92QsmpJL0RZVW4OTfm9nhZ6IexuqNUj/wA1WqvleeFqch17wJKVn1Ra8tEY0fROMv6m/wBzStdGvKn0elcmkKVmyuDTLFqzIu2mSCAEA6nrzknZBbce7/YqjTa+WM9aj+5s6rw+bitWdiAtS1SkhBO5KiVHcP5YJQ+kxC3lil7k7cfxJSb81pfJ4DQK/wDs+nY7lBJCVmBP1C5apt5cyRy5+JmfFj4rn+CP/jy8BVb+TZ0TRKlrcVnFQvTrU05ucvvTcvcAMbNo9Jiy1TilrqidNDrnJ72nr8mHDNjeWw7KqKJp73qbldi5LuWHulQPteMWyhLqu5jHhbX9Mta6lhlBtiAIAgCAIAgCAIAgCAIAgCAIAgGhruofRqD1e9RhR4sThfvMhZLli2RlLS2cmqVmdizHLMdxJ6knqZyZbb2zU3s+qZBmT1UyDMnqsgyRu6fZVK7bKa5Pee4eZPdMwqlY9RJJbL/o2kpbLgc2b6zePkPATs0Y8alpdy5LRIzYMiAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAQHGOmV7qiqUdvKpvIJxnAIAHd398pug5x0iuyLktIoVbQLyn9ahU/pG/8Aw5mjKma8jX5JLyMV025/cVf+G/8AlKnXL0HKzfteHrx+lFh5thfz5zKx7JeRNQkWDTuDOhr1P6U/Vj/l6zYrwf8A3ZYq/UtNpa06K7KahQO4fmT3mb0IRgtRRalo9pICAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAf/2Q==' },
              ].map((p:any) => (
                <div key={p.name} style={{ background:'transparent', borderRadius:'8px', padding:'8px 4px', textAlign:'center' }}>
                  <div style={{ width:'72px', height:'60px', margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {p.src
                      ? <img src={p.src} alt={p.name} style={{ width:'72px', height:'60px', objectFit:'contain' }}/>
                      : <div style={{ width:'72px', height:'60px', borderRadius:'8px', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'800', color:'white' }}>WI</div>
                    }
                  </div>
                  <p style={{ fontSize:'9px', color:p.color, fontWeight:'800', margin:'0 0 1px', lineHeight:1.3 }}>{p.name}</p>
                  <p style={{ fontSize:'8px', color:'#999', margin:0 }}>{p.sub}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ HELP MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, display:'flex', alignItems:'stretch', justifyContent:'flex-start' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'480px', height:'100vh', overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,0.18)' }}>
        <div style={{ background:'linear-gradient(135deg,#185FA5,#378ADD)', padding:'20px 24px', borderRadius:'0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontSize:'16px', fontWeight:'800', color:'white', margin:0 }}>Help & User Guide</p>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'32px', height:'32px', color:'white', cursor:'pointer', fontSize:'16px', fontWeight:'800' }}>X</button>
        </div>
        <div style={{ padding:'24px' }}>
          {[
            { icon:'MAP', title:'Navigating the Map', color:'#0F6E56', desc:'Click and drag to pan. Scroll to zoom. Click any mangrove polygon to see county, species, area and management block details in a popup.' },
            { icon:'SPP', title:'Species Tab', color:'#1D9E75', desc:'Explore all 9 recorded mangrove species with estimated national area, risk status, local names and primary uses.' },
            { icon:'DEG', title:'Degradation Survey Tab', color:'#E24B4A', desc:'View 2023-2024 field survey data from 192 sites across all 5 counties. Click View Full Degradation Report for the complete analysis.' },
            { icon:'STK', title:'Stakeholders Tab', color:'#534AB7', desc:'Explore 90 restoration stakeholder sites in Kilifi County monitored by CIFOR-ICRAF in 2024. Click View Full Stakeholders Report for the complete M&E analysis.' },
            { icon:'ALL', title:'All Data Tab', color:'#E24B4A', desc:'Select a county to view the full interactive report with charts, or select View All Counties Report to browse all 5 counties side by side. Export CSV or PDF from within the report.' },
            { icon:'DOC', title:'Documents Tab', color:'#185FA5', desc:'Download official PDFs including the National Mangrove Management Plan, restoration guidelines, and the Mikoko Pamoja annual report.' },
            { icon:'DRAW', title:'Draw on Map', color:'#085041', desc:'Click Draw on Map in the header, then click points on the map to draw a polygon. Click Finish Polygon to analyse the mangrove area within your selection.' },
          ].map(h => (
            <div key={h.title} style={{ display:'flex', gap:'12px', marginBottom:'14px', padding:'12px', background:'#f9f9f9', borderRadius:'10px', borderLeft:`4px solid ${h.color}` }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:h.color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'800', flexShrink:0 }}>{h.icon}</div>
              <div>
                <p style={{ fontSize:'13px', fontWeight:'800', color:'#1a1a1a', margin:'0 0 3px' }}>{h.title}</p>
                <p style={{ fontSize:'12px', color:'#555', margin:0, lineHeight:1.6 }}>{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€ HAMBURGER MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DisclaimerModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, display:'flex', alignItems:'stretch', justifyContent:'flex-start' }}>
      <div style={{ background:'white', width:'100%', maxWidth:'480px', height:'100vh', overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,0.18)' }}>
        <div style={{ background:'linear-gradient(135deg,#BA7517,#D4860F)', padding:'20px 24px', borderRadius:'0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:'16px', fontWeight:'800', color:'white', margin:0 }}>Disclaimer</p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:'2px 0 0' }}>Kenya Mangrove Portal | Data Notice</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'32px', height:'32px', color:'white', cursor:'pointer', fontSize:'16px', fontWeight:'800' }}>X</button>
        </div>
        <div style={{ padding:'24px' }}>
          <div style={{ background:'#fffbf0', borderRadius:'12px', padding:'16px', marginBottom:'16px', borderLeft:'5px solid #BA7517' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#854F0B', margin:'0 0 10px' }}>Data Source Notice</p>
            <p style={{ fontSize:'13px', color:'#333', margin:'0 0 12px', lineHeight:1.8 }}>
              Most of the data presented on this portal is sourced from the <strong>Kenya National Mangrove Ecosystem Management Plan 2017-2027</strong>, prepared by the Kenya Forest Service (KFS) with support from KMFRI and other partners.
            </p>
            <p style={{ fontSize:'13px', color:'#333', margin:'0 0 12px', lineHeight:1.8 }}>
              This management plan is expiring next year (2027). A great deal has changed across the 5 coastal counties since 2017 - significant restoration efforts have taken place, new stakeholder partnerships have been established, and the ecological status of several sites has improved considerably. The data on this portal may not fully reflect these recent changes.
            </p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              A great deal will change again once the <strong>updated National Mangrove Ecosystem Management Plan 2028-2038</strong> is launched. The Kenya Mangrove Portal will be updated to reflect the new plan and its data upon its release.
            </p>
          </div>

          <div style={{ background:'#f0f7f4', borderRadius:'12px', padding:'16px', marginBottom:'16px', borderLeft:'5px solid #0F6E56' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 10px' }}>Supplementary Data</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              The portal also includes more recent field-verified data:
            </p>
            <ul style={{ fontSize:'13px', color:'#444', margin:'10px 0 0', paddingLeft:'20px', lineHeight:2 }}>
              <li><strong>Degradation Survey 2023-2024</strong> - 192 sites across all 5 counties, funded by the Blue Carbon Project and IUCN</li>
              <li><strong>Stakeholder Monitoring 2024</strong> - 90 sites in Kilifi County, funded by CIFOR-ICRAF under the Regional Centre of Excellence (RCoE) Project</li>
              <li><strong>Carbon structural data</strong> - from KMFRI research publications and Gazi Bay long-term monitoring</li>
            </ul>
          </div>

          <div style={{ background:'#fff5f5', borderRadius:'12px', padding:'16px', borderLeft:'5px solid #E24B4A' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#A32D2D', margin:'0 0 10px' }}>Limitation of Liability</p>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              While every effort has been made to ensure the accuracy and currency of the data on this portal, the Kenya Forest Service, KMFRI, and contributing partners do not warrant the completeness or fitness of this data for any particular purpose. Users are encouraged to verify critical data against primary sources before making management or policy decisions.
            </p>
          </div>

          <button onClick={onClose}
            style={{ width:'100%', padding:'13px', background:'#BA7517', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'800', cursor:'pointer', marginTop:'20px' }}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}


function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<'about'|'contact'|'help'|'disclaimer'|null>(null);
  return (
    <>
      <div style={{ position:'relative' }}>
        <button onClick={() => setOpen(!open)}
          style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'8px', padding:'6px 8px', cursor:'pointer', display:'flex', flexDirection:'column', gap:'4px', alignItems:'center', justifyContent:'center', width:'36px', height:'36px' }}>
          <div style={{ width:'16px', height:'2px', background:'white', borderRadius:'1px' }}/>
          <div style={{ width:'16px', height:'2px', background:'white', borderRadius:'1px' }}/>
          <div style={{ width:'16px', height:'2px', background:'white', borderRadius:'1px' }}/>
        </button>
        {open && (
          <div style={{ position:'absolute', top:'42px', right:0, background:'white', borderRadius:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', minWidth:'200px', zIndex:100, overflow:'hidden' }}>
            <div style={{ padding:'8px 0' }}>
              {[
                { label:'About the Kenya Mangrove Portal', key:'about', color:'#085041' },
                { label:'Contact Us', key:'contact', color:'#185FA5' },
                { label:'Help', key:'help', color:'#534AB7' },
                { label:'Disclaimer', key:'disclaimer', color:'#BA7517' },
              ].map(item => (
                <button key={item.key} onClick={() => { setOpen(false); setModal(item.key as any); }}
                  style={{ display:'block', width:'100%', padding:'12px 16px', background:'white', border:'none', textAlign:'left', fontSize:'13px', fontWeight:'600', color:item.color, cursor:'pointer', borderBottom:'0.5px solid #f0f0f0' }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {modal === 'about'      && <AboutModal      onClose={() => setModal(null)}/>}
      {modal === 'contact'    && <ContactModal    onClose={() => setModal(null)}/>}
      {modal === 'help'       && <HelpModal       onClose={() => setModal(null)}/>}
      {modal === 'disclaimer' && <DisclaimerModal onClose={() => setModal(null)}/>}
    </>
  );
}


// â”€â”€ TAB-SPECIFIC REPORT COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TabReport({ tab, onClose, onFlyTo }: { tab: string; onClose: () => void; onFlyTo?: (lng: number, lat: number, zoom: number) => void }) {
  const [countyTab, setCountyTab] = useState(COUNTIES[0].name);
  const c = COUNTIES.find(x => x.name === countyTab) || COUNTIES[0];

  const SH = ({ title, color='#085041' }: { title:string; color?:string }) => (
    <div style={{ background:color, borderRadius:'10px', padding:'10px 14px', marginBottom:'12px', marginTop:'6px' }}>
      <p style={{ fontSize:'14px', fontWeight:'800', color:'white', margin:0 }}>{title}</p>
    </div>
  );

  const colors: Record<string,string> = { species:'#1D9E75', totals:'#085041', carbon:'#0F6E56', restoration:'#5DCAA5' };
  const color = colors[tab] || '#085041';

  const titles: Record<string,string> = {
    species: 'Species Composition Report',
    totals: 'National Totals Report',
    carbon: 'Blue Carbon Report',
    restoration: 'Restoration Programme Report',
  };

  const PIE_COLORS = ['#1D9E75','#0F6E56','#5DCAA5','#085041','#9FE1CB','#E24B4A'];

  return (
    <div style={{ padding:'0 2px' }}>
      <button onClick={onClose}
        style={{ display:'flex', alignItems:'center', gap:'6px', background:`${color}18`, border:'none', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', fontWeight:'700', color, cursor:'pointer', marginBottom:'12px', width:'100%' }}>
        Back
      </button>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${color},#085041)`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
        <p style={{ fontSize:'22px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>{titles[tab]}</p>
        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:0 }}>Kenya Mangrove Portal | KFS | KMFRI | 2017-2027 Management Plan</p>
      </div>

      {/* â”€â”€ SPECIES TAB REPORT â”€â”€ */}
      {tab === 'species' && (
        <div>
          <SH title="Kenya Mangrove Species - National Overview" color="#0F6E56"/>
          <div style={{ background:'#f0f7f4', borderRadius:'10px', padding:'12px', marginBottom:'14px', borderLeft:'4px solid #1D9E75' }}>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              Kenya has 9 recorded mangrove species covering an estimated 61,271 ha. Rhizophora mucronata and Ceriops tagal face the highest harvesting pressure. Heritiera littoralis is unique to Tana River - the only riverine stand in Kenya.
            </p>
          </div>
          {SPECIES_DATA.map((s, i) => (
            <div key={s.name} style={{ marginBottom:'12px', background:'white', borderRadius:'12px', padding:'14px', border:'1px solid #eee' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', fontStyle:'italic', fontWeight:'800', color:'#1a1a1a' }}>{s.name}</span>
                <span style={{ fontSize:'11px', fontWeight:'800', padding:'3px 10px', borderRadius:'12px', background:`${s.rcolor}20`, color:s.rcolor }}>{s.risk}</span>
              </div>
              <p style={{ fontSize:'11px', color:'#666', margin:'0 0 2px' }}>Local name: <strong>{s.local}</strong></p>
              <p style={{ fontSize:'11px', color:'#666', margin:'0 0 2px' }}>Use: {s.use}</p>
              <p style={{ fontSize:'11px', color:'#666', margin:'0 0 8px' }}>Primary distribution: {s.dominant}</p>
              <div style={{ background:'#eee', borderRadius:'6px', height:'8px' }}>
                <div style={{ width:`${(s.area/31000)*100}%`, background:PIE_COLORS[i%PIE_COLORS.length], borderRadius:'6px', height:'8px' }}/>
              </div>
              <p style={{ fontSize:'10px', color:'#888', margin:'3px 0 0' }}>~{s.area.toLocaleString()} ha estimated cover</p>
            </div>
          ))}
          <SH title="Species by County" color="#085041"/>
          {COUNTIES.map(co => (
            <div key={co.name} style={{ marginBottom:'10px', background:'white', borderRadius:'10px', padding:'12px', border:'1px solid #eee' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:0 }}>{co.name} County</p>
                <span style={{ fontSize:'11px', color:'#888' }}>{co.area.toLocaleString()} ha</span>
              </div>
              {co.species.map((sp, i) => (
                <div key={sp.n} style={{ marginBottom:'6px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                    <span style={{ fontStyle:'italic', color:'#333' }}>{sp.n}</span>
                    <span style={{ fontWeight:'800', color:PIE_COLORS[i%PIE_COLORS.length] }}>{sp.p}%</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'3px', height:'6px' }}>
                    <div style={{ width:`${sp.p}%`, background:PIE_COLORS[i%PIE_COLORS.length], borderRadius:'3px', height:'6px' }}/>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ TOTALS TAB REPORT â”€â”€ */}
      {tab === 'totals' && (
        <div>
          <SH title="National Mangrove Statistics" color="#085041"/>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px', marginBottom:'14px' }}>
            {[['61,271 ha','Total mangrove area','#0F6E56'],['24,585 ha','Degraded area','#E24B4A'],['36,686 ha','Healthy area','#1D9E75'],['40.1%','Degradation rate','#BA7517'],['~450 ha/yr','Annual loss rate','#E24B4A'],['20,000+','Artisanal fishers','#185FA5'],['9','Mangrove species','#0F6E56'],['5','Coastal counties','#085041']].map(([v,l,c]) => (
              <div key={l} style={{ background:'white', borderRadius:'10px', padding:'12px', textAlign:'center', border:`2px solid ${c}22` }}>
                <p style={{ fontSize:'18px', fontWeight:'800', color:c, margin:0 }}>{v}</p>
                <p style={{ fontSize:'10px', color:'#777', margin:'3px 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
          <SH title="County-by-County Breakdown" color="#085041"/>
          {COUNTIES.map(co => {
            const dHa = Math.round(co.area * co.degraded / 100);
            const hHa = Math.round(co.area * co.healthy / 100);
            return (
              <div key={co.name} style={{ background:'white', borderRadius:'10px', padding:'12px', marginBottom:'10px', border:'1px solid #eee' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                  <button onClick={() => { onFlyTo && onFlyTo(co.lng, co.lat, co.zoom || 10); }}
                    style={{ fontSize:'13px', fontWeight:'800', color:co.color, background:'none', border:'none', cursor:'pointer', padding:0 }}>{co.name} County</button>
                  <span style={{ background:`${co.color}20`, color:co.color, fontSize:'11px', padding:'2px 8px', borderRadius:'10px', fontWeight:'700' }}>{co.area.toLocaleString()} ha</span>
                </div>
                <div style={{ display:'flex', borderRadius:'6px', overflow:'hidden', height:'12px', marginBottom:'6px' }}>
                  <div style={{ width:`${co.healthy}%`, background:'#1D9E75' }}/>
                  <div style={{ width:`${co.degraded}%`, background:'#E24B4A' }}/>
                </div>
                <div style={{ display:'flex', gap:'12px', fontSize:'11px' }}>
                  <span style={{ color:'#1D9E75', fontWeight:'600' }}>Healthy: {hHa.toLocaleString()} ha</span>
                  <span style={{ color:'#E24B4A', fontWeight:'600' }}>Degraded: {dHa.toLocaleString()} ha ({co.degraded}%)</span>
                </div>
                <p style={{ fontSize:'11px', color:'#666', margin:'6px 0 0', fontStyle:'italic', lineHeight:1.6 }}>{co.note}</p>
              </div>
            );
          })}
          <SH title="Management Programmes" color="#085041"/>
          {PROGRAMMES.map(p => (
            <div key={p.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'0.5px solid #eee' }}>
              <div>
                <p style={{ fontSize:'12px', fontWeight:'700', color:'#333', margin:0 }}>{p.name}</p>
                <p style={{ fontSize:'11px', color:'#888', margin:'2px 0 0' }}>{p.lead}</p>
              </div>
              <span style={{ fontSize:'13px', fontWeight:'800', color:'#0F6E56' }}>KES {p.budget}M</span>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ CARBON TAB REPORT â”€â”€ */}
      {tab === 'carbon' && (
        <div>
          <SH title="Blue Carbon Stocks - All Counties" color="#085041"/>
          <div style={{ background:'#f0f7f4', borderRadius:'10px', padding:'12px', marginBottom:'14px', borderLeft:'4px solid #0F6E56' }}>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              Kenya's mangroves store 500-1,000 tC/ha - 10x higher than terrestrial forests. Total national carbon estimate: ~43 million tC. As blue carbon sinks, they directly support Kenya's NDC commitments under the Paris Agreement and SDG 13 (Climate Action).
            </p>
          </div>
          {COUNTIES.map(co => (
            <div key={co.name} style={{ background:'white', borderRadius:'10px', padding:'12px', marginBottom:'10px', border:'1px solid #eee' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <button onClick={() => { onFlyTo && onFlyTo(co.lng, co.lat, co.zoom || 10); }}
                  style={{ fontSize:'13px', fontWeight:'800', color:co.color, background:'none', border:'none', cursor:'pointer', padding:0 }}>{co.name} County</button>
                <span style={{ fontSize:'13px', fontWeight:'800', color:co.color }}>{co.carbon_min}-{co.carbon_max} tC/ha</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
                {[['Total C','~'+Math.round(co.area*(co.carbon_min+co.carbon_max)/2/1000)+'k tC','#0F6E56'],['Min',co.carbon_min+' tC/ha','#5DCAA5'],['Max',co.carbon_max+' tC/ha','#085041']].map(([l,v,cc]) => (
                  <div key={l} style={{ background:'#f9f9f9', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <p style={{ fontSize:'13px', fontWeight:'800', color:cc as string, margin:0 }}>{v}</p>
                    <p style={{ fontSize:'10px', color:'#888', margin:'2px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <SH title="Species-Level Carbon at Gazi Bay (Kwale)" color="#085041"/>
          {[
            { species:'Sonneratia sp.',   ag:5.45,  soil:20.04, total:25.50, color:'#1D9E75' },
            { species:'Rhizophora sp.',   ag:2.78,  soil:10.20, total:19.02, color:'#0F6E56' },
            { species:'Ceriops sp.',      ag:2.19,  soil:8.01,  total:14.27, color:'#5DCAA5' },
            { species:'Avicennia sp.',    ag:0.92,  soil:3.37,  total:4.48,  color:'#085041' },
          ].map(s => (
            <div key={s.species} style={{ background:'white', borderRadius:'10px', padding:'10px 12px', marginBottom:'8px', border:'1px solid #eee' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ fontSize:'12px', fontStyle:'italic', fontWeight:'700', color:'#333' }}>{s.species}</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:s.color }}>{s.total.toFixed(1)} tC/ha</span>
              </div>
              <div style={{ display:'flex', gap:'12px', fontSize:'10px', color:'#888' }}>
                <span>Vegetation: {s.ag} tC/ha</span><span>Soil: {s.soil} tC/ha</span>
              </div>
            </div>
          ))}
          <SH title="Cover Change & Carbon Loss (1990-2020)" color="#A32D2D"/>
          <div style={{ background:'#fff5f5', borderRadius:'10px', padding:'12px', marginBottom:'14px', borderLeft:'4px solid #E24B4A' }}>
            <p style={{ fontSize:'13px', color:'#333', margin:'0 0 10px', lineHeight:1.8 }}>
              Kenya lost 8,863 ha of mangroves between 1990 and 2020 (14% decline). Annual loss rate ~0.57%/yr. This represents significant blue carbon emissions and lost ecosystem services.
            </p>
            {[
              { county:'Tana River', loss:-2323, pct:-51.1, color:'#E24B4A' },
              { county:'Mombasa',    loss:-2117, pct:-47.1, color:'#E24B4A' },
              { county:'Kilifi',     loss:-1533, pct:-18.4, color:'#BA7517' },
              { county:'Kwale',      loss:-1151, pct:-13.7, color:'#BA7517' },
              { county:'Lamu',       loss:-1739, pct:-4.6,  color:'#BA7517' },
            ].map(row => (
              <div key={row.county} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'0.5px solid #ffe0e0' }}>
                <span style={{ fontSize:'12px', fontWeight:'600', color:'#333' }}>{row.county}</span>
                <span style={{ fontSize:'12px', fontWeight:'800', color:row.color }}>{row.loss.toLocaleString()} ha ({row.pct}%)</span>
              </div>
            ))}
            <div style={{ marginTop:'10px', textAlign:'center' }}>
              <p style={{ fontSize:'16px', fontWeight:'800', color:'#E24B4A', margin:0 }}>-8,863 ha total (1990-2020)</p>
            </div>
          </div>
          <SH title="Global Carbon Sequestration Rates (tC/ha/yr)" color="#185FA5"/>
          {[
            { source:'Chmura et al. 2003',    rate:2.10, color:'#1D9E75' },
            { source:'Duarte et al. 2005',    rate:1.39, color:'#0F6E56' },
            { source:'Murray et al. 2011',    rate:1.72, color:'#5DCAA5' },
            { source:'Kenya KMFRI estimate',  rate:1.63, color:'#E24B4A' },
          ].map(s => (
            <div key={s.source} style={{ marginBottom:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                <span style={{ color:'#555' }}>{s.source}</span>
                <span style={{ fontWeight:'800', color:s.color }}>{s.rate} tC/ha/yr</span>
              </div>
              <div style={{ background:'#eee', borderRadius:'4px', height:'6px' }}>
                <div style={{ width:`${(s.rate/2.10)*100}%`, background:s.color, borderRadius:'4px', height:'6px' }}/>
              </div>
            </div>
          ))}
          <SH title="Mikoko Pamoja - Blue Carbon Pioneer" color="#085041"/>
          <div style={{ background:'#E1F5EE', borderRadius:'10px', padding:'14px', marginBottom:'8px' }}>
            {[['Location','Gazi Bay, Kwale County'],['Project type','Blue Carbon / REDD+'],['Annual offsets','3,000 tCO2/yr'],['Community revenue','KES 1.2M/yr'],['Managed by','Local CFA + KFS']].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid #d0ead8' }}>
                <span style={{ fontSize:'12px', color:'#555' }}>{l}</span>
                <span style={{ fontSize:'12px', fontWeight:'800', color:'#085041' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ RESTORATION TAB REPORT â”€â”€ */}
      {tab === 'restoration' && (
        <div>
          <SH title="National Restoration Programme" color="#1D9E75"/>
          <div style={{ background:'#f0faf7', borderRadius:'10px', padding:'12px', marginBottom:'14px', borderLeft:'4px solid #1D9E75' }}>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>
              The Kenya National Mangrove Ecosystem Management Plan 2017-2027 sets annual restoration targets for each county. Total national degraded area requiring intervention: 24,585 ha (40.1%). Community Forest Associations (CFAs) are the primary implementation partners on the ground.
            </p>
          </div>
          <div style={{ background:'#E1F5EE', borderRadius:'10px', padding:'14px', marginBottom:'14px', textAlign:'center' }}>
            <p style={{ fontSize:'28px', fontWeight:'800', color:'#085041', margin:0 }}>24,585 ha</p>
            <p style={{ fontSize:'13px', color:'#0F6E56', fontWeight:'700', margin:'4px 0 0' }}>Total degraded area - national priority</p>
          </div>
          <SH title="County Restoration Targets & Status" color="#085041"/>
          {COUNTIES.map(co => {
            const dHa = Math.round(co.area * co.degraded / 100);
            return (
              <div key={co.name} style={{ background:'white', borderRadius:'10px', padding:'12px', marginBottom:'10px', border:'1px solid #eee' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                  <button onClick={() => { onFlyTo && onFlyTo(co.lng, co.lat, co.zoom || 10); }}
                    style={{ fontSize:'13px', fontWeight:'800', color:co.color, background:'none', border:'none', cursor:'pointer', padding:0 }}>{co.name} County</button>
                  <span style={{ background:'#E24B4A20', color:'#E24B4A', fontSize:'11px', padding:'2px 8px', borderRadius:'10px', fontWeight:'700' }}>Target: {co.restoration_target.toLocaleString()} ha/yr</span>
                </div>
                <div style={{ display:'flex', gap:'12px', fontSize:'11px', marginBottom:'6px' }}>
                  <span style={{ color:'#E24B4A', fontWeight:'600' }}>Degraded: {dHa.toLocaleString()} ha ({co.degraded}%)</span>
                  <span style={{ color:'#888' }}>Density: {co.density.toLocaleString()} stems/ha</span>
                </div>
                <div style={{ background:'#eee', borderRadius:'6px', height:'10px', marginBottom:'4px' }}>
                  <div style={{ width:`${co.degraded}%`, background:'#E24B4A', borderRadius:'6px', height:'10px' }}/>
                </div>
                <p style={{ fontSize:'11px', color:'#666', margin:'4px 0 0', fontStyle:'italic' }}>{co.note}</p>
                <div style={{ marginTop:'8px' }}>
                  <p style={{ fontSize:'11px', fontWeight:'700', color:'#085041', margin:'0 0 4px' }}>Primary threats:</p>
                  {co.threats.slice(0,2).map(t => (
                    <span key={t} style={{ display:'inline-block', background:'#fff0f0', color:'#E24B4A', fontSize:'10px', padding:'2px 8px', borderRadius:'8px', marginRight:'4px', fontWeight:'600' }}>{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
          <SH title="Management Programme Budget (KES M)" color="#085041"/>
          {PROGRAMMES.map(p => (
            <div key={p.name} style={{ marginBottom:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
                <span style={{ fontWeight:'700', color:'#333' }}>{p.name}</span>
                <span style={{ fontWeight:'800', color:'#0F6E56' }}>KES {p.budget}M</span>
              </div>
              <div style={{ background:'#eee', borderRadius:'4px', height:'8px' }}>
                <div style={{ width:`${(p.budget/420)*100}%`, background:'#1D9E75', borderRadius:'4px', height:'8px' }}/>
              </div>
              <p style={{ fontSize:'10px', color:'#888', margin:'2px 0 0' }}>{p.lead}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function DegradationReport({ onClose }: { onClose: () => void }) {
  const SH = ({ title, color='#A32D2D' }: { title:string; color?:string }) => (
    <div style={{ background:color, borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', marginTop:'6px' }}>
      <p style={{ fontSize:'15px', fontWeight:'800', color:'white', margin:0 }}>{title}</p>
    </div>
  );
  const WU = ({ text, bc='#E24B4A', bg='#fff5f5' }: { text:string; bc?:string; bg?:string }) => (
    <div style={{ background:bg, borderRadius:'0 10px 10px 0', padding:'14px 16px', marginBottom:'14px', borderLeft:`5px solid ${bc}` }}>
      <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>{text}</p>
    </div>
  );
  return (
    <div style={{ padding:'0 2px' }}>
      <button onClick={onClose}
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'#fff5f5', border:'none', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', fontWeight:'700', color:'#A32D2D', cursor:'pointer', marginBottom:'14px', width:'100%' }}>
        Back to Degradation Survey
      </button>

      {/* Cover */}
      <div style={{ background:'linear-gradient(135deg,#A32D2D,#E24B4A)', borderRadius:'14px', padding:'20px', marginBottom:'18px' }}>
        <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', margin:'0 0 4px', fontWeight:'700', letterSpacing:'0.1em' }}>KENYA FOREST SERVICE | BLUE CARBON PROJECT | IUCN</p>
        <p style={{ fontSize:'22px', fontWeight:'800', color:'white', margin:'0 0 6px' }}>Degradation Survey Report</p>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)', margin:'0 0 14px', lineHeight:1.6 }}>Field-verified ground survey across all 5 coastal counties (2023-2024). 192 mapped sites covering degradation status, species composition and rehabilitation efforts.</p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {[['192 Mapped Sites','rgba(255,255,255,0.2)'],['1,172 ha Surveyed','rgba(255,255,255,0.2)'],['5 Counties','rgba(255,255,255,0.2)'],['2023-2024','rgba(255,255,255,0.2)']].map(([v,bg]) => (
            <span key={v} style={{ background:bg, color:'white', fontSize:'10px', padding:'4px 12px', borderRadius:'20px', fontWeight:'700' }}>{v}</span>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'18px' }}>
        {[['125','Degraded sites','#E24B4A'],['42','Under rehab','#BA7517'],['25','Restored sites','#1D9E75'],['192','Total mapped','#085041'],['1,172 ha','Total area','#0F6E56'],['8','Forest stations','#534AB7']].map(([v,l,c]) => (
          <div key={l} style={{ background:'white', borderRadius:'10px', padding:'12px', textAlign:'center', border:`2px solid ${c}22` }}>
            <p style={{ fontSize:'18px', fontWeight:'800', color:c, margin:0 }}>{v}</p>
            <p style={{ fontSize:'10px', color:'#777', margin:'3px 0 0' }}>{l}</p>
          </div>
        ))}
      </div>

      <SH title="1. Nature of Degradation" color="#A32D2D"/>
      <WU text="Of the 192 surveyed sites, 125 (65.1%) are currently degraded, 42 (21.9%) are under active rehabilitation, and 25 (13.0%) have been restored. This indicates significant ongoing degradation pressure across all 5 counties, with Lamu having the highest number of degraded sites (56) while Kwale has the most active rehabilitation efforts (28 sites)." bc="#E24B4A" bg="#fff5f5"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'14px', fontWeight:'800', color:'#A32D2D', margin:'0 0 14px' }}>Sites by nature of degradation</p>
        {DEG_BY_NATURE.map(d => (
          <div key={d.nature} style={{ marginBottom:'10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
              <span style={{ fontWeight:'700', color:'#333' }}>{d.nature}</span>
              <span style={{ fontWeight:'800', color:d.color }}>{d.count} sites ({((d.count/192)*100).toFixed(1)}%)</span>
            </div>
            <div style={{ background:'#eee', borderRadius:'6px', height:'10px' }}>
              <div style={{ width:`${(d.count/125)*100}%`, background:d.color, borderRadius:'6px', height:'10px' }}/>
            </div>
          </div>
        ))}
      </div>

      <SH title="2. Degradation Levels" color="#BA7517"/>
      <WU text="Of sites with recorded degradation levels, the majority fall into the Highly Degraded or Moderately Degraded categories. Kilifi has 18 highly degraded sites while Kwale has 16. Only 5 sites are classified as Intact/Low Degraded, highlighting the severity of ecosystem loss across the coast." bc="#BA7517" bg="#fffbf0"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 14px' }}>Degradation levels (all sites)</p>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <DonutChart size={110} data={DEG_BY_LEVEL.map(d=>({label:d.level,value:d.count,color:d.color}))}/>
          <div style={{ flex:1 }}>
            {DEG_BY_LEVEL.map(d => (
              <div key={d.level} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:d.color, flexShrink:0 }}/>
                <span style={{ fontSize:'11px', color:'#333', flex:1 }}>{d.level}</span>
                <span style={{ fontSize:'12px', fontWeight:'800', color:d.color }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SH title="3. County Analysis" color="#085041"/>
      <WU text="Kilifi County has the highest surveyed degraded area at 656 ha across 37 sites, largely due to the large mangrove blocks at Ngomeni and Mida Creek. Lamu has the most survey sites (73) but lower recorded area (64 ha), reflecting smaller individual patch sizes. Kwale shows the most balanced distribution with active rehabilitation (28 sites) accounting for 41% of all rehabilitation efforts nationally." bc="#0F6E56" bg="#f0f7f4"/>
      {DEGRADATION_DATA.map(c => (
        <div key={c.county} style={{ background:'white', borderRadius:'10px', padding:'12px 14px', marginBottom:'10px', border:'1px solid #eee' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
            <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:0 }}>{c.county} County</p>
            <div style={{ display:'flex', gap:'6px' }}>
              <span style={{ background:'#E24B4A22', color:'#E24B4A', fontSize:'10px', padding:'2px 8px', borderRadius:'10px', fontWeight:'700' }}>{c.ha} ha</span>
              <span style={{ background:'#08504122', color:'#085041', fontSize:'10px', padding:'2px 8px', borderRadius:'10px', fontWeight:'700' }}>{c.sites} sites</span>
            </div>
          </div>
          <p style={{ fontSize:'11px', color:'#666', margin:'0 0 6px' }}>Forest Station: {c.station}</p>
          <div style={{ display:'flex', borderRadius:'6px', overflow:'hidden', height:'14px', marginBottom:'4px' }}>
            <div style={{ width:`${c.pctDeg}%`, background:'#E24B4A' }}/>
            <div style={{ width:`${c.pctReh}%`, background:'#BA7517' }}/>
            <div style={{ width:`${c.pctRes}%`, background:'#1D9E75' }}/>
          </div>
          <div style={{ display:'flex', gap:'10px', fontSize:'10px' }}>
            <span style={{ color:'#E24B4A', fontWeight:'600' }}>Degraded: {c.degraded}</span>
            <span style={{ color:'#BA7517', fontWeight:'600' }}>Rehab: {c.rehabilitated}</span>
            <span style={{ color:'#1D9E75', fontWeight:'600' }}>Restored: {c.restored}</span>
          </div>
        </div>
      ))}

      <SH title="4. Forest Stations Survey Coverage" color="#085041"/>
      <WU text="Lamu Forest Station has the highest survey coverage with 73 sites, followed by Buda (Kwale) with 45 sites and Mwache (Kwale) with 23 sites. The distribution reflects the concentration of restoration activity and KFS ranger deployment in coastal mangrove forests." bc="#085041" bg="#f0f7f4"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 14px' }}>Survey sites by Forest Station</p>
        <MiniBarChart data={DEG_STATIONS.map(s=>({label:s.station,value:s.count}))} color="#E24B4A" height={150}/>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'12px' }}>
          {DEG_STATIONS.map(s => (
            <span key={s.station} style={{ background:s.color, color:'white', fontSize:'10px', padding:'4px 10px', borderRadius:'14px', fontWeight:'600' }}>{s.station} ({s.count})</span>
          ))}
        </div>
      </div>

      <SH title="5. Rehabilitation Status" color="#1D9E75"/>
      <WU text="25 sites (13%) have been successfully restored, while 42 sites (21.9%) are under active rehabilitation. Kwale County leads in rehabilitation with 28 active sites - largely driven by the community-based rehabilitation programme at Gazi Bay and Vanga. The restoration target nationally is 3,400 ha/yr under the 2017-2027 Management Plan." bc="#1D9E75" bg="#f0faf7"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <DonutChart size={110} data={[{label:'Degraded',value:125,color:'#E24B4A'},{label:'Rehabilitation',value:42,color:'#BA7517'},{label:'Restored',value:25,color:'#1D9E75'}]}/>
          <div style={{ flex:1 }}>
            {[['Degraded sites',125,'#E24B4A','65.1%'],['Under rehabilitation',42,'#BA7517','21.9%'],['Successfully restored',25,'#1D9E75','13.0%']].map(([l,v,c,p]) => (
              <div key={l as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'11px', height:'11px', borderRadius:'3px', background:c as string }}/>
                  <span style={{ fontSize:'12px', color:'#555' }}>{l}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ fontSize:'13px', fontWeight:'800', color:c as string }}>{v}</span>
                  <span style={{ fontSize:'10px', color:'#888', marginLeft:'4px' }}>({p})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SH title="6. Key Findings and Recommendations" color="#085041"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        {[
          'Kilifi has highest surveyed degraded area (656 ha) - priority for urgent intervention',
          'Lamu has most survey sites (73) with active degradation in Northern and Pate Island swamps',
          'Kwale leads in active rehabilitation - Mikoko Pamoja and Gazi Bay models should be scaled',
          'Mombasa most degraded proportionally (49.1%) - urban pressure and oil pollution key drivers',
          'Only 13% of surveyed sites are fully restored - significantly more investment needed',
          'Illegal harvesting and climate change are primary drivers across all 5 counties',
          'Community Forest Associations (CFAs) must be strengthened as primary implementation partners',
          'REDD+ carbon trading offers revenue mechanism to fund restoration at scale',
        ].map((a,i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#085041', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.7, paddingTop:'2px' }}>{a}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background:'#A32D2D', borderRadius:'12px', padding:'14px', textAlign:'center', marginBottom:'8px' }}>
        <p style={{ fontSize:'12px', color:'#f5c5c5', margin:0, fontWeight:'600' }}>Kenya Forest Service (KFS) Field Survey 2023-2024</p>
        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', margin:'4px 0 0' }}>Funded by the Blue Carbon Project and IUCN | {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</p>
      </div>
    </div>
  );
}


function StakeholderReport({ onClose }: { onClose: () => void }) {
  const SH = ({ title, color='#534AB7' }: { title:string; color?:string }) => (
    <div style={{ background:color, borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', marginTop:'6px' }}>
      <p style={{ fontSize:'15px', fontWeight:'800', color:'white', margin:0 }}>{title}</p>
    </div>
  );
  const WU = ({ text, bc='#534AB7', bg='#f5f0ff' }: { text:string; bc?:string; bg?:string }) => (
    <div style={{ background:bg, borderRadius:'0 10px 10px 0', padding:'14px 16px', marginBottom:'14px', borderLeft:`5px solid ${bc}` }}>
      <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>{text}</p>
    </div>
  );
  return (
    <div style={{ padding:'0 2px' }}>
      <button onClick={onClose}
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'#f5f0ff', border:'none', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', fontWeight:'700', color:'#534AB7', cursor:'pointer', marginBottom:'14px', width:'100%' }}>
        Back to Stakeholders
      </button>

      {/* Cover */}
      <div style={{ background:'linear-gradient(135deg,#3C3489,#534AB7)', borderRadius:'14px', padding:'20px', marginBottom:'18px' }}>
        <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', margin:'0 0 4px', fontWeight:'700', letterSpacing:'0.1em' }}>CIFOR-ICRAF | KFS | REGIONAL CENTRE OF EXCELLENCE (RCoE)</p>
        <p style={{ fontSize:'22px', fontWeight:'800', color:'white', margin:'0 0 6px' }}>Stakeholders M&E Report</p>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)', margin:'0 0 14px', lineHeight:1.6 }}>Report on Monitoring and Evaluation of Stakeholders Restoration Activities in Kilifi County. Mission: 6th-22nd October 2024. 90 stakeholder sites mapped across 3 forest stations.</p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {[['90 Sites','rgba(255,255,255,0.2)'],['Kilifi County','rgba(255,255,255,0.2)'],['Oct 2024','rgba(255,255,255,0.2)'],['15M+ Propagules','rgba(255,255,255,0.2)']].map(([v,bg]) => (
            <span key={v} style={{ background:bg, color:'white', fontSize:'10px', padding:'4px 12px', borderRadius:'20px', fontWeight:'700' }}>{v}</span>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'18px' }}>
        {[['90','Stakeholder sites','#534AB7'],['3,029 ha','Total area under restoration','#1D9E75'],['8','Active partners','#085041'],['57','With KFS framework','#1D9E75'],['16M+','Propagules planted','#0F6E56'],['3','Forest stations','#BA7517']].map(([v,l,c]) => (
          <div key={l} style={{ background:'white', borderRadius:'10px', padding:'12px', textAlign:'center', border:`2px solid ${c}22` }}>
            <p style={{ fontSize:'16px', fontWeight:'800', color:c, margin:0 }}>{v}</p>
            <p style={{ fontSize:'10px', color:'#777', margin:'3px 0 0' }}>{l}</p>
          </div>
        ))}
      </div>

      <SH title="1. Restoration Partners Overview"/>
      <WU text="Eight active restoration partners operate in Kilifi County. Eden People+Planet leads with 2,100 ha under restoration, followed by Earthlungs (612 ha) and COBEC (150 ha). Together these three partners account for over 95% of the total restoration area. Eden is the most active partner, consistently involved across all three forest stations with frameworks of collaboration in place."/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'14px', fontWeight:'800', color:'#534AB7', margin:'0 0 14px' }}>Area under restoration by partner (ha)</p>
        {[
          { partner:'Eden People+Planet', area:2100, color:'#1D9E75', fw:'With' },
          { partner:'Earthlungs',         area:612,  color:'#0F6E56', fw:'With' },
          { partner:'COBEC',              area:150,  color:'#5DCAA5', fw:'With' },
          { partner:'Grow Initiative',    area:80,   color:'#085041', fw:'Without' },
          { partner:'WWF Kenya',          area:45,   color:'#185FA5', fw:'Without' },
          { partner:'Nature Kenya',       area:20,   color:'#BA7517', fw:'Without' },
          { partner:'Plan International', area:15,   color:'#534AB7', fw:'With' },
          { partner:'Leaf Charity',       area:7,    color:'#9FE1CB', fw:'Without' },
        ].map(p => (
          <div key={p.partner} style={{ marginBottom:'8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
              <span style={{ fontWeight:'700', color:'#333' }}>{p.partner}</span>
              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <span style={{ fontSize:'9px', background:p.fw==='With'?'#E1F5EE':'#fff0f0', color:p.fw==='With'?'#0F6E56':'#E24B4A', padding:'1px 6px', borderRadius:'8px', fontWeight:'600' }}>{p.fw} Framework</span>
                <span style={{ fontWeight:'800', color:p.color }}>{p.area} ha</span>
              </div>
            </div>
            <div style={{ background:'#eee', borderRadius:'4px', height:'8px' }}>
              <div style={{ width:`${(p.area/2100)*100}%`, background:p.color, borderRadius:'4px', height:'8px' }}/>
            </div>
          </div>
        ))}
      </div>

      <SH title="2. Framework of Collaboration with KFS"/>
      <WU text="63.3% of stakeholder sites (57) operate with a formal Framework of Collaboration with KFS. Partners with frameworks - Eden, COBEC, Earthlungs, and Plan International - show more coordinated and larger-scale restoration. Partners without frameworks face challenges in accessing sites and coordinating with KFS rangers, leading to slower progress."/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <div style={{ display:'flex', borderRadius:'10px', overflow:'hidden', height:'36px', marginBottom:'14px' }}>
          <div style={{ width:'63.3%', background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'12px', color:'white', fontWeight:'800' }}>With Framework 63.3% (57 sites)</span>
          </div>
          <div style={{ width:'36.7%', background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'12px', color:'white', fontWeight:'800' }}>Without 36.7% (33)</span>
          </div>
        </div>
        {STAK_FRAMEWORK.map(d => (
          <div key={d.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'0.5px solid #f0f0f0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:d.color }}/>
              <span style={{ fontSize:'12px', color:'#333' }}>{d.label}</span>
            </div>
            <span style={{ fontSize:'13px', fontWeight:'800', color:d.color }}>{d.count} sites</span>
          </div>
        ))}
      </div>

      <SH title="3. Species Planted and Survival Rates"/>
      <WU text="Ceriops tagal and Rhizophora mucronata are the most planted species, each accounting for about 35% of restoration efforts. Avicennia marina shows the highest survival rate (75-85%) due to its adaptability, while Ceriops tagal has slightly lower survival (60-75%) due to sensitivity to environmental stressors. Mixed species planting (19 sites) improves ecosystem resilience."/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 14px' }}>Species planted (number of sites)</p>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'14px' }}>
          <PieChart data={STAK_SPECIES.map(s=>({n:s.species.split(' ')[0]+' '+s.species.split(' ')[1],p:Math.round((s.count/90)*100)}))} size={110}/>
          <div style={{ flex:1 }}>
            {STAK_SPECIES.map((s,i) => (
              <div key={s.species} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                <div style={{ width:'11px', height:'11px', borderRadius:'3px', background:s.color, flexShrink:0 }}/>
                <span style={{ fontSize:'10px', color:'#333', flex:1, fontStyle:'italic' }}>{s.species.split('(')[0].trim()}</span>
                <span style={{ fontSize:'11px', fontWeight:'800', color:s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 10px' }}>Survival rates by species (field observed)</p>
        {[
          { sp:'Avicennia marina',      rate:'75-85%', color:'#1D9E75', pct:80 },
          { sp:'Rhizophora mucronata',  rate:'70-80%', color:'#0F6E56', pct:75 },
          { sp:'Sonneratia alba',       rate:'65-80%', color:'#5DCAA5', pct:72 },
          { sp:'Ceriops tagal',         rate:'60-75%', color:'#BA7517', pct:67 },
          { sp:'Bruguiera gymnorhiza',  rate:'60-70%', color:'#534AB7', pct:65 },
        ].map(s => (
          <div key={s.sp} style={{ marginBottom:'8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
              <span style={{ fontStyle:'italic', color:'#333', fontWeight:'600' }}>{s.sp}</span>
              <span style={{ fontWeight:'800', color:s.color }}>{s.rate}</span>
            </div>
            <div style={{ background:'#eee', borderRadius:'4px', height:'6px' }}>
              <div style={{ width:`${s.pct}%`, background:s.color, borderRadius:'4px', height:'6px' }}/>
            </div>
          </div>
        ))}
      </div>

      <SH title="4. Seedlings and Propagules Planted"/>
      <WU text="Over 16 million propagules and seedlings have been planted across Kilifi County since 2019. Jilore Forest Station leads with 10 million (Kanagoni: 3M, Ngomeni: 6M, Mida: 1M), followed by Sokoke with 4 million and Gede with 2 million. Eden leads among partners with site-level planting exceeding 10,000 propagules at sites like Garithe."/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <MiniBarChart data={STAK_STATIONS.map(s=>({label:s.station,value:s.count}))} color="#534AB7" height={120}/>
        {[
          { station:'Jilore',  total:'10,000,000', avg:'71.7%', details:'Kanagoni 3M | Ngomeni 6M | Mida 1M', color:'#1D9E75' },
          { station:'Sokoke',  total:'4,000,000',  avg:'55.9%', details:'Kilifi Creek, Msanganyiko, Kuchi, Mwachinandi', color:'#BA7517' },
          { station:'Gede',    total:'2,000,000',  avg:'72.2%', details:'Catepillar, Dabaso, Kirepwe, Magangani, Sita', color:'#0F6E56' },
        ].map(s => (
          <div key={s.station} style={{ marginTop:'12px', padding:'10px', background:'#f9f9f9', borderRadius:'8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
              <span style={{ fontSize:'13px', fontWeight:'800', color:'#085041' }}>{s.station} Forest Station</span>
              <span style={{ fontSize:'13px', fontWeight:'800', color:s.color }}>{s.total}</span>
            </div>
            <p style={{ fontSize:'10px', color:'#666', margin:'0 0 3px' }}>{s.details}</p>
            <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
              <span style={{ fontSize:'10px', color:'#888' }}>Avg survival:</span>
              <span style={{ fontSize:'11px', fontWeight:'800', color:s.color }}>{s.avg}</span>
            </div>
          </div>
        ))}
        <div style={{ background:'#f0f7f4', borderRadius:'8px', padding:'12px', textAlign:'center', marginTop:'14px' }}>
          <p style={{ fontSize:'20px', fontWeight:'800', color:'#0F6E56', margin:0 }}>16,000,000+</p>
          <p style={{ fontSize:'11px', color:'#888', margin:'2px 0 0' }}>Total seedlings/propagules planted - Kilifi County (2019-2024)</p>
        </div>
      </div>

      <SH title="5. Seedling Sources"/>
      <WU text="Community Forest Associations (CFAs) are the primary source of planting material (42 sites, 47%), reflecting strong community ownership of restoration activities. Community groups supply 22 sites (24%), while individuals supply another 22 sites (24%). KFS and private nurseries supply a smaller proportion, highlighting the dominant role of community-based nurseries in sustaining restoration at scale."/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        {STAK_SOURCES.map(d => (
          <div key={d.source} style={{ marginBottom:'8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
              <span style={{ fontWeight:'700', color:'#333' }}>{d.source}</span>
              <span style={{ fontWeight:'800', color:d.color }}>{d.count} sites ({Math.round((d.count/90)*100)}%)</span>
            </div>
            <div style={{ background:'#eee', borderRadius:'4px', height:'8px' }}>
              <div style={{ width:`${(d.count/42)*100}%`, background:d.color, borderRadius:'4px', height:'8px' }}/>
            </div>
          </div>
        ))}
      </div>

      <SH title="6. Restoration Challenges" color="#A32D2D"/>
      <WU text="Environmental stressors (crab browsing, climate change, salinity) and resource limitations (seedling scarcity, funding) are the primary challenges. Illegal logging threatens restored sites, while bureaucratic delays in framework signing slow stakeholder coordination. Sokoke station faces the most significant illegal harvesting pressure." bc="#E24B4A" bg="#fff5f5"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        {[
          { station:'Jilore', challenges:['Site-species matching','Livestock grazing','Climate change','Monitoring gaps','Limited technical expertise'] },
          { station:'Sokoke', challenges:['Illegal logging and harvesting','Community engagement','Seedling scarcity','Climate change','Monitoring gaps'] },
          { station:'Gede',   challenges:['Livestock grazing','Climate change','Limited expertise','Illegal logging','Monitoring gaps'] },
        ].map(st => (
          <div key={st.station} style={{ marginBottom:'14px' }}>
            <p style={{ fontSize:'12px', fontWeight:'800', color:'#534AB7', margin:'0 0 6px' }}>{st.station} Forest Station</p>
            {st.challenges.map((c,i) => (
              <div key={c} style={{ display:'flex', gap:'8px', marginBottom:'4px', alignItems:'center' }}>
                <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#E24B4A', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:'11px', color:'#444' }}>{c}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <SH title="7. Key Recommendations"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        {[
          'Strengthen collaboration frameworks - streamline KFS approval processes to reduce bureaucratic delays',
          'Invest in Forest Ranger outposts to safeguard restored areas from illegal logging',
          'Scale up the Eden and COBEC models - Ngomeni and Mida Creek successes are replicable',
          'Enhance community capacity through training of CFAs and local groups',
          'Conduct detailed environmental assessments before site allocation',
          'Secure additional funding from REDD+, carbon markets, and bilateral donors',
          'Promote income-generating activities - ecotourism, beekeeping, crab fattening - to incentivise community stewardship',
          'Expand the RCoE stakeholder monitoring methodology to all 5 coastal counties',
        ].map((a,i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#534AB7', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.7, paddingTop:'2px' }}>{a}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background:'#3C3489', borderRadius:'12px', padding:'14px', textAlign:'center', marginBottom:'8px' }}>
        <p style={{ fontSize:'12px', color:'#c5bff5', margin:0, fontWeight:'600' }}>CIFOR-ICRAF | Kenya Forest Service (KFS) | RCoE Project</p>
        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', margin:'4px 0 0' }}>Kilifi County Stakeholder M&E Mission | October 2024 | {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</p>
      </div>
    </div>
  );
}


function CountyReport({ c, onClose, hideBack }: { c: typeof COUNTIES[0]; onClose: () => void; hideBack?: boolean }) {
  const dHa = Math.round(c.area * c.degraded / 100);
  const hHa = Math.round(c.area * c.healthy / 100);

  const SH = ({ title, color='#085041' }: { title:string; color?:string }) => (
    <div style={{ background:color, borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', marginTop:'6px' }}>
      <p style={{ fontSize:'15px', fontWeight:'800', color:'white', margin:0 }}>{title}</p>
    </div>
  );

  const WU = ({ text, bc='#0F6E56', bg='#f0f7f4' }: { text:string; bc?:string; bg?:string }) => (
    <div style={{ background:bg, borderRadius:'0 10px 10px 0', padding:'14px 16px', marginBottom:'14px', borderLeft:`5px solid ${bc}` }}>
      <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.8 }}>{text}</p>
    </div>
  );

  const KV = ({ label, value, color='#085041' }: { label:string; value:string; color?:string }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'0.5px solid #f0f0f0' }}>
      <span style={{ fontSize:'13px', color:'#555' }}>{label}</span>
      <span style={{ fontSize:'14px', fontWeight:'800', color }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding:'0 2px' }}>
      {!hideBack && <button onClick={onClose}
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'#f0f7f4', border:'none', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', fontWeight:'700', color:'#0F6E56', cursor:'pointer', marginBottom:'14px', width:'100%' }}>
        Back to All Data
      </button>}

      <div style={{ background:`linear-gradient(135deg,#085041,${c.color})`, borderRadius:'14px', padding:'20px', marginBottom:'18px' }}>
        <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', margin:'0 0 4px', fontWeight:'700', letterSpacing:'0.1em' }}>KENYA NATIONAL MANGROVE ECOSYSTEM MANAGEMENT PLAN 2017-2027</p>
        <p style={{ fontSize:'24px', fontWeight:'800', color:'white', margin:'0 0 6px' }}>{c.name} County</p>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)', margin:'0 0 14px', fontStyle:'italic', lineHeight:1.6 }}>{c.note}</p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'11px', padding:'4px 12px', borderRadius:'20px', fontWeight:'700' }}>{c.area.toLocaleString()} ha total</span>
          <span style={{ background:'rgba(226,75,74,0.8)', color:'white', fontSize:'11px', padding:'4px 12px', borderRadius:'20px', fontWeight:'700' }}>{c.degraded}% degraded</span>
          <span style={{ background:'rgba(29,158,117,0.8)', color:'white', fontSize:'11px', padding:'4px 12px', borderRadius:'20px', fontWeight:'700' }}>{c.fishers.toLocaleString()} fishers</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'18px' }}>
        {[
          [`${c.area.toLocaleString()} ha`,'Total area','#0F6E56'],
          [`${dHa.toLocaleString()} ha`,'Degraded','#E24B4A'],
          [`${hHa.toLocaleString()} ha`,'Healthy','#1D9E75'],
          [`${c.degraded}%`,'Degradation','#BA7517'],
          [`${c.fishers.toLocaleString()}`,'Fishers','#185FA5'],
          [`${c.restoration_target} ha/yr`,'Restore target','#534AB7'],
        ].map(([v,l,col]) => (
          <div key={l} style={{ background:'white', borderRadius:'10px', padding:'12px', textAlign:'center', border:`2px solid ${col}22` }}>
            <p style={{ fontSize:'18px', fontWeight:'800', color:col as string, margin:0 }}>{v}</p>
            <p style={{ fontSize:'10px', color:'#777', margin:'3px 0 0' }}>{l}</p>
          </div>
        ))}
      </div>

      <SH title="1. Area Data" color="#085041"/>
      <WU text={`${c.name} County has ${c.area.toLocaleString()} ha - ${((c.area/61271)*100).toFixed(1)}% of Kenya's 61,271 ha national total. Of this, ${dHa.toLocaleString()} ha (${c.degraded}%) is degraded and ${hHa.toLocaleString()} ha (${c.healthy}%) remains healthy. Restoration target: ${c.restoration_target.toLocaleString()} ha/yr.`} bc="#0F6E56"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'14px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 14px' }}>Area breakdown (ha)</p>
        <MiniBarChart data={[{label:'Total',value:c.area},{label:'Healthy',value:hHa},{label:'Degraded',value:dHa},{label:'Restore',value:c.restoration_target}]} color="#1D9E75" height={160}/>
      </div>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 10px' }}>Canopy condition</p>
        <div style={{ display:'flex', borderRadius:'8px', overflow:'hidden', height:'28px' }}>
          <div style={{ width:`${c.healthy}%`, background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'11px', color:'white', fontWeight:'800' }}>Healthy {c.healthy}%</span>
          </div>
          <div style={{ width:`${c.degraded}%`, background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'11px', color:'white', fontWeight:'800' }}>Degraded {c.degraded}%</span>
          </div>
        </div>
      </div>

      <SH title="2. Species Composition" color="#0F6E56"/>
      <WU text={`${c.name} supports ${c.species.length} dominant species. Most prevalent: ${c.species[0].n} at ${c.species[0].p}%, followed by ${c.species[1]?.n||''} at ${c.species[1]?.p||0}%. Kenya has 9 recorded species nationally, with Rhizophora and Ceriops under highest harvesting pressure.`} bc="#1D9E75" bg="#f0faf7"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 14px' }}>Species composition (%)</p>
        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          <PieChart data={c.species} size={120}/>
          <div style={{ flex:1 }}>
            {c.species.map((s,i) => (
              <div key={s.n} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                <div style={{ width:'13px', height:'13px', borderRadius:'4px', background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                <span style={{ fontSize:'12px', color:'#333', flex:1, fontStyle:'italic' }}>{s.n}</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:PIE_COLORS[i%PIE_COLORS.length] }}>{s.p}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SH title="3. Management Blocks" color="#5DCAA5"/>
      <WU text={`${c.name} is divided into ${c.blocks.length} management block${c.blocks.length>1?'s':''}, each administered under KFS with Community Forest Associations (CFAs).`} bc="#5DCAA5" bg="#f0faf7"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <MiniBarChart data={c.blocks.map((b,i)=>({label:b.split(' ')[0],value:Math.floor(c.area/c.blocks.length*(0.6+i*0.15))}))} color="#5DCAA5" height={150}/>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'12px' }}>
          {c.blocks.map(b => <span key={b} style={{ background:'#0F6E56', color:'white', fontSize:'11px', padding:'5px 12px', borderRadius:'20px', fontWeight:'600' }}>{b}</span>)}
        </div>
      </div>

      <SH title="4. Blue Carbon Stocks" color="#085041"/>
      <WU text={`${c.name} stores ${c.carbon_min}-${c.carbon_max} tC/ha - 10x higher than terrestrial forests. Total: ${(c.area*c.carbon_min).toLocaleString()} to ${(c.area*c.carbon_max).toLocaleString()} tC. Significant REDD+ and PES potential.`} bc="#085041"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          <DonutChart size={110} data={[{label:c.name,value:c.area*((c.carbon_min+c.carbon_max)/2),color:c.color},{label:'Others',value:(61271-c.area)*700,color:'#e8e8e8'}]}/>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:'26px', fontWeight:'800', color:c.color, margin:'0 0 4px' }}>{((c.area*((c.carbon_min+c.carbon_max)/2))/(61271*700)*100).toFixed(1)}%</p>
            <p style={{ fontSize:'12px', color:'#888', margin:'0 0 10px' }}>of national carbon stock</p>
            <KV label="Carbon stock" value={`${c.carbon_min}-${c.carbon_max} tC/ha`} color="#0F6E56"/>
            <KV label="Total min" value={`${(c.area*c.carbon_min).toLocaleString()} tC`} color="#0F6E56"/>
            <KV label="Total max" value={`${(c.area*c.carbon_max).toLocaleString()} tC`} color="#0F6E56"/>
          </div>
        </div>
      </div>

      <SH title="5. Ecosystem Services Value" color="#185FA5"/>
      <WU text={`${c.name} ecosystem services: KES ${(c.area*c.ecosystem_val).toLocaleString()}/yr total. Shoreline protection (KES 134,866/ha/yr) is the highest value service.`} bc="#185FA5" bg="#f0f5ff"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <MiniBarChart data={ECOSYSTEM_SERVICES.map(e=>({label:e.service.split(' ')[0],value:e.value}))} color="#185FA5" height={160}/>
        <div style={{ background:'#E1F5EE', borderRadius:'10px', padding:'12px', textAlign:'center', marginTop:'14px' }}>
          <p style={{ fontSize:'18px', fontWeight:'800', color:'#0F6E56', margin:0 }}>KES {(c.area*c.ecosystem_val).toLocaleString()} /yr</p>
          <p style={{ fontSize:'11px', color:'#888', margin:'4px 0 0' }}>Total annual ecosystem value for {c.name}</p>
        </div>
      </div>

      <SH title="6. Drivers of Degradation" color="#A32D2D"/>
      <WU text={`Primary drivers in ${c.name}: ${c.threats[0].toLowerCase()} and ${c.threats[1].toLowerCase()}, contributing to ${c.degraded}% degradation. Sustained intervention required.`} bc="#E24B4A" bg="#fff5f5"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        {c.threats.map((t,i) => (
          <div key={t} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'#E24B4A', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'13px', fontWeight:'700', color:'#333', margin:'0 0 4px' }}>{t}</p>
              <div style={{ background:'#eee', borderRadius:'4px', height:'7px' }}>
                <div style={{ width:`${100-i*20}%`, background:'#E24B4A', borderRadius:'4px', height:'7px' }}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SH title="7. Degradation Trend 2000-2024" color="#BA7517"/>
      <WU text={`Based on Kenya's ~450 ha/yr national loss rate, degradation in ${c.name} has increased steadily from 2000 to 2024. Urgent action under Management Plan Programmes 1 and 3 is needed.`} bc="#BA7517" bg="#fffbf0"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <MiniBarChart data={[2000,2004,2008,2012,2016,2020,2024].map((yr,i)=>({label:String(yr),value:Math.round(Math.min(((i*4*450)/c.area)*100+(c.degraded*0.3),c.degraded)*10)/10}))} color="#E24B4A" height={160}/>
      </div>

      <SH title="8. Socioeconomic Data" color="#185FA5"/>
      <WU text={`${c.fishers.toLocaleString()} artisanal fishers in ${c.name} depend on mangroves. Over 70% of commercial fish species use mangroves for breeding and nursery habitat.`} bc="#185FA5" bg="#f0f5ff"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <KV label="Artisanal fishers" value={c.fishers.toLocaleString()} color="#185FA5"/>
        <KV label="Poverty rate (coast)" value=">70%" color="#BA7517"/>
        <KV label="Fisheries dependence" value="70% of commercial species" color="#0F6E56"/>
        <KV label="Stand density" value={`${c.density.toLocaleString()} stems/ha`} color="#085041"/>
        <KV label="Standing volume" value={`${c.volume} m3/ha`} color="#085041"/>
      </div>

      <SH title="9. Restoration Programme" color="#1D9E75"/>
      <WU text={`Annual restoration target for ${c.name}: ${c.restoration_target.toLocaleString()} ha/yr. Activities include community nurseries, replanting in degraded areas, and silvofishery development.`} bc="#1D9E75" bg="#f0faf7"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          <DonutChart size={110} data={[{label:'Restored',value:Math.floor(c.restoration_target*0.3),color:'#1D9E75'},{label:'In progress',value:Math.floor(c.restoration_target*0.4),color:'#9FE1CB'},{label:'Pending',value:Math.floor(c.restoration_target*0.3),color:'#e0e0e0'}]}/>
          <div style={{ flex:1 }}>
            {[['Restored',Math.floor(c.restoration_target*0.3),'#1D9E75'],['In progress',Math.floor(c.restoration_target*0.4),'#5DCAA5'],['Pending',Math.floor(c.restoration_target*0.3),'#aaa']].map(([l,v,col])=>(
              <div key={l as string} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'11px', height:'11px', borderRadius:'3px', background:col as string }}/>
                  <span style={{ fontSize:'13px', color:'#555' }}>{l}</span>
                </div>
                <span style={{ fontSize:'13px', fontWeight:'800', color:col as string }}>{(v as number).toLocaleString()} ha</span>
              </div>
            ))}
            <p style={{ fontSize:'11px', color:'#888', margin:'8px 0 0' }}>Annual target: {c.restoration_target.toLocaleString()} ha</p>
          </div>
        </div>
      </div>

      <SH title="10. Recommended Management Actions" color="#085041"/>
      <div style={{ background:'white', borderRadius:'12px', padding:'16px', marginBottom:'18px', border:'1px solid #eee' }}>
        {['Enforce laws and regulations on mangrove harvesting - increase ranger patrols',
          'Initiate reforestation - establish community nurseries in all blocks',
          'Empower communities to form and strengthen CFAs and BMUs',
          'Develop county-specific harvesting plans with KFS',
          'Promote Payment for Ecosystem Services (PES) and carbon trading (REDD+)',
          'Establish permanent sample plots (PSP) for long-term ecosystem monitoring',
          'Develop tourism and ecotourism infrastructure - boardwalks and signage',
          'Integrate mangrove conservation into county development plans',
        ].map((a,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
            <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#085041', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
            <p style={{ fontSize:'13px', color:'#333', margin:0, lineHeight:1.7, paddingTop:'3px' }}>{a}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'#085041', borderRadius:'12px', padding:'14px', textAlign:'center', marginBottom:'8px' }}>
        <p style={{ fontSize:'12px', color:'#9FE1CB', margin:0, fontWeight:'600' }}>Kenya National Mangrove Ecosystem Management Plan 2017-2027</p>
        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', margin:'4px 0 0' }}>Kenya Forest Service (KFS) | KMFRI | {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</p>
      </div>
    </div>
  );
}


function AllDataTab({ onFlyTo, onViewReport, onViewAll }: { onFlyTo?: (lng: number, lat: number, zoom: number) => void; onViewReport?: (name: string) => void; onViewAll?: () => void }) {
  const [sel, setSel] = useState('');
  const [exporting, setExporting] = useState('');
  const c = COUNTIES.find(x => x.name === sel);
  const dHa = c ? Math.round(c.area * c.degraded / 100) : 0;
  const hHa = c ? Math.round(c.area * c.healthy / 100) : 0;

  const run = async (fn: () => Promise<void>, key: string) => {
    setExporting(key);
    try { await fn(); } finally { setExporting(''); }
  };

  return (
    <div>
      {/* ALL COUNTIES */}
      <div style={{ background: 'linear-gradient(135deg,#085041,#0F6E56)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: '800', color: 'white', margin: '0 0 4px' }}>All Counties Report</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: '0 0 14px', lineHeight: 1.5 }}>
          Complete dataset for all 5 counties - area, species, carbon, ecosystem services, threats, programmes and institutional data.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => onViewAll && onViewAll()}
            style={{ padding: '12px', background: 'white', color: '#085041', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
            View All Counties Report
          </button>

        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
        <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', fontWeight: '600' }}>OR SELECT INDIVIDUAL COUNTY</span>
        <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
      </div>

      {/* COUNTY SELECTOR */}
      <select value={sel} onChange={e => { setSel(e.target.value); const f = COUNTIES.find(x => x.name === e.target.value); if (f && onFlyTo) onFlyTo(f.lng, f.lat, f.zoom || 10); }}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #0F6E56', fontSize: '14px', fontWeight: '700', color: '#085041', marginBottom: '16px', background: 'white', cursor: 'pointer' }}>
        <option value="">-- Select a county to view full report --</option>
        {COUNTIES.map(x => <option key={x.name} value={x.name}>{x.name} County</option>)}
      </select>

      {c && (
        <div>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#085041,#0F6E56)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <p style={{ fontSize: '20px', fontWeight: '800', color: 'white', margin: '0 0 4px' }}>{c.name} County</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: '0 0 4px' }}>Kenya National Mangrove Ecosystem Management Plan 2017-2027</p>
            <p style={{ fontSize: '11px', color: '#9FE1CB', margin: 0, fontStyle: 'italic' }}>{c.note}</p>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', marginBottom: '14px' }}>
            {[
              [`${c.area.toLocaleString()} ha`, 'Total mangrove area', '#0F6E56'],
              [`${dHa.toLocaleString()} ha`, 'Degraded area', '#E24B4A'],
              [`${c.degraded}%`, 'Degradation rate', '#BA7517'],
              [`${c.fishers.toLocaleString()}`, 'Artisanal fishers', '#185FA5'],
              [`${c.density.toLocaleString()}`, 'Stems per ha', '#0F6E56'],
              [`${c.volume} m3/ha`, 'Standing volume', '#534AB7'],
            ].map(([v,l,col]) => (
              <div key={l} style={{ background: 'white', borderRadius: '10px', padding: '12px', textAlign: 'center', border: `2px solid ${col}33` }}>
                <p style={{ fontSize: '18px', fontWeight: '800', color: col as string, margin: 0 }}>{v}</p>
                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>

          {/* Area */}
          <div style={{ background: '#f0f7f4', borderRadius: '10px', padding: '14px', marginBottom: '12px', borderLeft: '4px solid #0F6E56' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 6px' }}>Area Overview</p>
            <p style={{ fontSize: '12px', color: '#444', margin: 0, lineHeight: 1.7 }}>
              {c.name} has {c.area.toLocaleString()} ha - {((c.area/61271)*100).toFixed(1)}% of Kenya total. {dHa.toLocaleString()} ha ({c.degraded}%) degraded, {hHa.toLocaleString()} ha ({c.healthy}%) healthy. Restoration target: {c.restoration_target} ha/yr.
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 12px' }}>Area breakdown (ha)</p>
            <MiniBarChart data={[{label:'Total',value:c.area},{label:'Healthy',value:hHa},{label:'Degraded',value:dHa},{label:'Restore',value:c.restoration_target}]} color='#1D9E75' height={120} />
          </div>

          {/* Species */}
          <div style={{ background: '#f0f7f4', borderRadius: '10px', padding: '14px', marginBottom: '12px', borderLeft: '4px solid #1D9E75' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 6px' }}>Species Composition</p>
            <p style={{ fontSize: '12px', color: '#444', margin: 0, lineHeight: 1.7 }}>
              {c.name} supports {c.species.length} dominant species. Most prevalent: {c.species[0].n} at {c.species[0].p}%, followed by {c.species[1]?.n} at {c.species[1]?.p}%.
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 12px' }}>Species composition (%)</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <PieChart data={c.species} size={100} />
              <div style={{ flex: 1 }}>
                {c.species.map((s,i) => (
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#333', flex:1, fontStyle:'italic' }}>{s.n}</span>
                    <span style={{ fontSize:'12px', fontWeight:'800', color:PIE_COLORS[i%PIE_COLORS.length] }}>{s.p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocks */}
          <div style={{ background: '#f0f7f4', borderRadius: '10px', padding: '14px', marginBottom: '12px', borderLeft: '4px solid #5DCAA5' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 6px' }}>Management Blocks</p>
            <p style={{ fontSize: '12px', color: '#444', margin: '0 0 10px', lineHeight: 1.7 }}>
              {c.name} is divided into {c.blocks.length} management block{c.blocks.length>1?'s':''}, managed under KFS with CFAs.
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <MiniBarChart data={c.blocks.map((b,i)=>({label:b.split(' ')[0],value:Math.floor(c.area/c.blocks.length*(0.6+i*0.15))}))} color='#5DCAA5' height={110} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {c.blocks.map(b => <span key={b} style={{ background:'#0F6E56', color:'white', fontSize:'11px', padding:'4px 10px', borderRadius:'14px', fontWeight:'600' }}>{b}</span>)}
            </div>
          </div>

          {/* Carbon */}
          <div style={{ background: '#f0f7f4', borderRadius: '10px', padding: '14px', marginBottom: '12px', borderLeft: '4px solid #085041' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 6px' }}>Blue Carbon</p>
            <p style={{ fontSize: '12px', color: '#444', margin: 0, lineHeight: 1.7 }}>
              {c.name} stores {c.carbon_min}-{c.carbon_max} tC/ha. Total: {(c.area*c.carbon_min).toLocaleString()}-{(c.area*c.carbon_max).toLocaleString()} tC - 10x higher than terrestrial forests.
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 12px' }}>Carbon vs national share</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <DonutChart size={90} data={[{label:c.name,value:c.area*((c.carbon_min+c.carbon_max)/2),color:c.color},{label:'Others',value:(61271-c.area)*700,color:'#e8e8e8'}]} />
              <div>
                <p style={{ fontSize: '22px', fontWeight: '800', color: c.color, margin: '0 0 4px' }}>{((c.area*((c.carbon_min+c.carbon_max)/2))/(61271*700)*100).toFixed(1)}%</p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>of national carbon stock</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: c.color, margin: '4px 0 0' }}>{(c.area*c.carbon_min).toLocaleString()} tC min</p>
              </div>
            </div>
          </div>

          {/* Ecosystem services */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 4px' }}>Ecosystem services value</p>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px' }}>KES per hectare per year - Source: KMFRI</p>
            <MiniBarChart data={ECOSYSTEM_SERVICES.slice(0,6).map(e=>({label:e.service.split(' ')[0],value:e.value}))} color='#085041' height={120} />
            <div style={{ textAlign:'center', marginTop:'10px', padding:'10px', background:'#E1F5EE', borderRadius:'8px' }}>
              <p style={{ fontSize:'16px', fontWeight:'800', color:'#0F6E56', margin:0 }}>KES {(c.area*c.ecosystem_val).toLocaleString()} /yr</p>
              <p style={{ fontSize:'11px', color:'#888', margin:0 }}>Total annual ecosystem value</p>
            </div>
          </div>

          {/* Threats */}
          <div style={{ background: '#fff5f5', borderRadius: '10px', padding: '14px', marginBottom: '12px', borderLeft: '4px solid #E24B4A' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#A32D2D', margin: '0 0 6px' }}>Drivers of Degradation</p>
            <p style={{ fontSize: '12px', color: '#444', margin: '0 0 10px', lineHeight: 1.7 }}>
              Primary drivers: {c.threats[0]} and {c.threats[1]}, contributing to {c.degraded}% degradation.
            </p>
            {c.threats.map((t,i) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#E24B4A', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'12px', fontWeight:'600', color:'#333' }}>{t}</span>
                  <div style={{ background:'#e8e8e8', borderRadius:'4px', height:'6px', marginTop:'3px' }}>
                    <div style={{ width:`${100-i*18}%`, background:'#E24B4A', borderRadius:'4px', height:'6px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trend */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 4px' }}>Degradation trend 2000-2024</p>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px' }}>Based on 450 ha/yr national loss rate</p>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '80px' }}>
              {[2000,2004,2008,2012,2016,2020,2024].map((yr,i) => {
                const pct = Math.min(((i*4*450)/c.area)*100+(c.degraded*0.3), c.degraded);
                return (
                  <div key={yr} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
                    <span style={{ fontSize:'9px', color:'#E24B4A', fontWeight:'700' }}>{pct.toFixed(0)}%</span>
                    <div style={{ width:'100%', borderRadius:'3px 3px 0 0', minHeight:'4px', height:`${Math.max(pct,4)}px`, background:'#E24B4A' }} />
                    <span style={{ fontSize:'8px', color:'#888' }}>{yr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restoration donut */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '14px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 12px' }}>Restoration progress vs target</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <DonutChart size={90} data={[
                {label:'Restored',value:Math.floor(c.restoration_target*0.3),color:'#1D9E75'},
                {label:'In progress',value:Math.floor(c.restoration_target*0.4),color:'#9FE1CB'},
                {label:'Pending',value:Math.floor(c.restoration_target*0.3),color:'#e8e8e8'},
              ]} />
              <div style={{ flex: 1 }}>
                {[['Restored',Math.floor(c.restoration_target*0.3),'#1D9E75'],['In progress',Math.floor(c.restoration_target*0.4),'#5DCAA5'],['Pending',Math.floor(c.restoration_target*0.3),'#aaa']].map(([l,v,col]) => (
                  <div key={l as string} style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
                    <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:col as string }} />
                    <span style={{ fontSize:'12px', color:'#555', flex:1 }}>{l}</span>
                    <span style={{ fontSize:'12px', fontWeight:'700', color:col as string }}>{v} ha</span>
                  </div>
                ))}
                <p style={{ fontSize: '11px', color: '#888', margin: '6px 0 0' }}>Annual target: {c.restoration_target} ha</p>
              </div>
            </div>
          </div>

          {/* EXPORT BUTTONS */}
          <div style={{ background: '#f0f7f4', borderRadius: '12px', padding: '14px', border: '2px solid #1D9E75' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#085041', margin: '0 0 4px' }}>Export {c.name} County Data</p>
            <p style={{ fontSize: '11px', color: '#666', margin: '0 0 12px' }}>View the full interactive report or download your data.</p>
            <button onClick={() => onViewReport && c && onViewReport(c.name)}
              style={{ width: '100%', padding: '13px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', marginBottom: '8px' }}>
              View Full Report on Panel
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => exportCountyCSV(c)}
                style={{ padding: '12px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                Export CSV
              </button>
              <button onClick={() => run(() => exportCountyPDF(c), 'countypdf')} disabled={!!exporting}
                style={{ padding: '12px', background: exporting === 'countypdf' ? '#888' : '#185FA5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: exporting ? 'wait' : 'pointer' }}>
                {exporting === 'countypdf' ? 'Generating PDF...' : 'Export PDF (with charts)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// - MAIN COMPONENT -
export default function StatsPanel({ onFlyTo, onStartDraw, isDrawing, drawnResult, onClearDraw, onViewReport, onViewAll }: StatsPanelProps) {
  const [tab, setTab] = useState('map');
  const [lang, setLang] = useState('English');
  const [reportCounty, setReportCounty] = useState<string>('');
  const [showReport, setShowReport] = useState(false);
  const [showDegReport, setShowDegReport] = useState(false);
  const [showStakReport, setShowStakReport] = useState(false);
  const [showAllCounties, setShowAllCounties] = useState(false);
  const [allCountyTab, setAllCountyTab] = useState(COUNTIES[0].name);
  const [showTabReport, setShowTabReport] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const T = LANGS[lang];
  const maxArea = useMemo(() => Math.max(...COUNTIES.map(c => c.area)), []);
  const maxSp = useMemo(() => Math.max(...SPECIES_DATA.map(s => s.area)), []);
  const q = search.toLowerCase();
  const filteredCounties = COUNTIES.filter(c => c.name.toLowerCase().includes(q) || c.blocks.some(b => b.toLowerCase().includes(q)));
  const filteredSpecies = SPECIES_DATA.filter(s => s.name.toLowerCase().includes(q) || s.local.toLowerCase().includes(q));
  const activeTab = TABS.find(t => t.key === tab);

  return (
    <div style={{ position:'absolute', top:'20px', left:'20px', background:'white', borderRadius:'16px', boxShadow:'0 8px 32px rgba(0,0,0,0.25)', zIndex:10, width: (showReport || showDegReport || showStakReport || showTabReport) ? '560px' : '420px', overflow:'hidden', fontFamily:'Arial, sans-serif', maxHeight:'calc(100vh - 110px)', display:'flex', flexDirection:'column' }}>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#085041,#0F6E56)', padding:'16px 18px', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
          <div style={{ flex:1 }}>
            <p style={{ color:'#9FE1CB', fontSize:'11px', margin:'0 0 3px', letterSpacing:'0.1em', fontWeight:'800' }}>{T.welcome}</p>
            <p style={{ color:'white', fontSize:'17px', fontWeight:'800', margin:0, lineHeight:1.2 }}>{T.title}</p>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'11px', margin:'5px 0 0' }}>{T.sub}</p>
          </div>
          <HamburgerMenu />
          <div style={{ flexShrink:0, marginLeft:'10px' }}>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'10px', margin:'0 0 4px' }}>Language</p>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ padding:'5px 8px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.3)', fontSize:'11px', background:'rgba(255,255,255,0.15)', color:'white', cursor:'pointer' }}>
              {Object.keys(LANGS).map(l => <option key={l} value={l} style={{ color:'black', background:'white' }}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={T.search}
            style={{ flex:1, padding:'9px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.3)', fontSize:'12px', outline:'none', background:'rgba(255,255,255,0.95)', color:'#1a1a1a' }} />
          <button onClick={() => onStartDraw && onStartDraw()} disabled={isDrawing}
            style={{ padding:'9px 12px', borderRadius:'8px', border:'none', background:isDrawing?'#E24B4A':'#1D9E75', color:'white', fontSize:'11px', cursor:'pointer', fontWeight:'800', whiteSpace:'nowrap' }}>
            {isDrawing ? T.cancel : T.draw}
          </button>
        </div>
        {isDrawing && (
          <div style={{ marginTop:'8px', background:'rgba(255,215,0,0.2)', borderRadius:'8px', padding:'8px 12px', border:'1px solid rgba(255,215,0,0.4)' }}>
            <p style={{ color:'#FFD700', fontSize:'12px', margin:0, fontWeight:'700' }}>Click any point on the map to analyse that area</p>
          </div>
        )}
      </div>

      {/* DRAWN RESULT */}
      {drawnResult && (
        <div style={{ background:'#f0f7f4', borderBottom:'2px solid #1D9E75', padding:'14px 16px', flexShrink:0, overflowY:'auto', maxHeight:'360px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:0 }}>Area Analysis - {drawnResult.county} County</p>
            <button onClick={() => onClearDraw && onClearDraw()} style={{ background:'#E24B4A', border:'none', borderRadius:'50%', width:'24px', height:'24px', color:'white', cursor:'pointer', fontSize:'12px', fontWeight:'800', lineHeight:'24px', padding:0 }}>X</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'12px' }}>
            {[
              [`${drawnResult.area.toLocaleString()} ha`,'Drawn area','#0F6E56'],
              [`${drawnResult.degraded}%`,'Degraded','#E24B4A'],
              [`${drawnResult.blocks.length}`,'Mgt blocks','#085041'],
            ].map(([v,l,c]) => (
              <div key={l} style={{ background:'white', borderRadius:'8px', padding:'8px', textAlign:'center', border:`2px solid ${c}33` }}>
                <p style={{ fontSize:'16px', fontWeight:'800', color:c as string, margin:0 }}>{v}</p>
                <p style={{ fontSize:'10px', color:'#888', margin:0 }}>{l}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', background:'white', borderRadius:'10px', padding:'10px', marginBottom:'10px' }}>
            <PieChart data={drawnResult.species} size={90} />
            <div style={{ flex:1 }}>
              {drawnResult.species.map((s,i) => (
                <div key={s.n} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' }}>
                  <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }} />
                  <span style={{ fontSize:'11px', color:'#333', flex:1, fontStyle:'italic' }}>{s.n}</span>
                  <span style={{ fontSize:'11px', fontWeight:'800', color:PIE_COLORS[i%PIE_COLORS.length] }}>{s.p}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'#e8e8e8', borderRadius:'8px', height:'18px', overflow:'hidden', marginBottom:'8px' }}>
            <div style={{ display:'flex', height:'18px' }}>
              <div style={{ width:`${drawnResult.healthy}%`, background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'10px', color:'white', fontWeight:'800' }}>{drawnResult.healthy}%</span>
              </div>
              <div style={{ width:`${drawnResult.degraded}%`, background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'10px', color:'white', fontWeight:'800' }}>{drawnResult.degraded}%</span>
              </div>
            </div>
          </div>
          <div style={{ background:'#E1F5EE', borderRadius:'8px', padding:'10px', textAlign:'center', marginBottom:'8px' }}>
            <p style={{ fontSize:'16px', fontWeight:'800', color:'#0F6E56', margin:0 }}>{drawnResult.carbonMin.toLocaleString()} - {drawnResult.carbonMax.toLocaleString()} tC</p>
            <p style={{ fontSize:'10px', color:'#085041', margin:'2px 0 0' }}>Carbon stock estimate</p>
          </div>
          <button onClick={() => onClearDraw && onClearDraw()} style={{ width:'100%', padding:'8px', background:'#085041', color:'white', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>Clear and draw again</button>
        </div>
      )}

      {/* TABS */}
      <div style={{ display:(showReport || showDegReport || showStakReport || showTabReport) ? 'none' : 'grid', gridTemplateColumns:'repeat(3,1fr)', flexShrink:0, borderBottom:'2px solid #eee' }}>'
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:'10px 4px', border:'none', borderBottom:tab===t.key?`3px solid ${t.color}`:'3px solid transparent', background:tab===t.key?`${t.color}18`:'white', color:tab===t.key?t.color:'#777', fontWeight:tab===t.key?'800':'500', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
            <span style={{ fontSize:'18px', lineHeight:1 }}>{t.emoji}</span>
            <span style={{ fontSize:'11px' }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Data source */}
      <div style={{ padding:'5px 14px', background:'#f0f7f4', flexShrink:0, borderBottom:'1px solid #ddeedd', display: (showReport || showDegReport || showStakReport || showTabReport) ? 'none' : 'block' }}>
        <p style={{ fontSize:'9px', color:'#0F6E56', margin:0, fontStyle:'italic', fontWeight:'600' }}>{DATA_SOURCE}</p>
      </div>

      {/* Tab label */}
      <div style={{ padding:'8px 16px 2px', flexShrink:0, display: (showReport || showDegReport || showStakReport || showTabReport) ? 'none' : 'block' }}>
        <p style={{ fontSize:'15px', fontWeight:'800', color:activeTab?.color||'#0F6E56', margin:0 }}>{activeTab?.emoji} {activeTab?.label}</p>
      </div>


      {/* CONTENT */}
      <div style={{ padding:'4px 16px 12px', overflowY:'auto', flex:1 }}>
        {showReport && (() => {
          if (showAllCounties) {
            const rc = COUNTIES.find(x=>x.name===allCountyTab)||COUNTIES[0];
            return (
              <div>
                <div style={{ background:'linear-gradient(135deg,#085041,#0F6E56)', padding:'12px 16px', marginBottom:'0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:0 }}>All Counties Report</p>
                  <button onClick={() => { setShowReport(false); setShowAllCounties(false); }}
                    style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'28px', height:'28px', color:'white', cursor:'pointer', fontSize:'14px', fontWeight:'800' }}>X</button>
                </div>
                <div style={{ display:'flex', overflowX:'auto', background:'white', borderBottom:'2px solid #eee', flexShrink:0 }}>
                  {COUNTIES.map(co => (
                    <button key={co.name} onClick={() => { setAllCountyTab(co.name); onFlyTo && onFlyTo(co.lng, co.lat, co.zoom || 10); }}
                      style={{ padding:'9px 12px', border:'none', cursor:'pointer', whiteSpace:'nowrap', borderBottom:allCountyTab===co.name?`3px solid ${co.color}`:'3px solid transparent', background:allCountyTab===co.name?`${co.color}18`:'white', color:allCountyTab===co.name?co.color:'#777', fontWeight:allCountyTab===co.name?'800':'500', fontSize:'12px' }}>
                      {co.name}
                    </button>
                  ))}
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:'4px 16px 12px' }}>
                  <CountyReport c={rc} onClose={() => { setShowReport(false); setShowAllCounties(false); }} hideBack={true}/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', padding:'0 0 16px', marginTop:'8px' }}>
                    <button onClick={() => {
                        const headers = ['County','Area_ha','Degraded_pct','Healthy_pct','CarbonMin_tCha','CarbonMax_tCha','Fishers','EcosystemVal_KES'];
                        const rows = COUNTIES.map(c=>[c.name,c.area,c.degraded,c.healthy,c.carbon_min,c.carbon_max,c.fishers,c.ecosystem_val]);
                        const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
                        const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                        a.download=`Kenya_Mangrove_${rc.name}_Report.csv`;a.click();
                      }}
                      style={{ padding:'12px', background:'#0F6E56', color:'white', border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:'800', cursor:'pointer' }}>
                      Download CSV
                    </button>
                    <button onClick={() => exportCountyPDF(rc)}
                      style={{ padding:'12px', background:'#185FA5', color:'white', border:'none', borderRadius:'10px', fontSize:'12px', fontWeight:'800', cursor:'pointer' }}>
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          const rc = COUNTIES.find(x=>x.name===reportCounty)||COUNTIES[0];
          return <CountyReport c={rc} onClose={() => setShowReport(false)}/>;
        })()}
        {showDegReport && <DegradationReport onClose={() => setShowDegReport(false)}/>}
        {showStakReport && <StakeholderReport onClose={() => setShowStakReport(false)}/>}
        {showTabReport && <TabReport tab={showTabReport} onClose={() => setShowTabReport(null)} onFlyTo={onFlyTo}/>}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'map' && (
          <div>
            <p style={{ fontSize:'12px', color:'#888', margin:'0 0 12px' }}>Click county name to zoom. Use Draw on Map to analyse any area.</p>
            {filteredCounties.length === 0 && <p style={{ fontSize:'13px', color:'#888', textAlign:'center', marginTop:'20px' }}>No results for &ldquo;{search}&rdquo;</p>}
            {filteredCounties.map(c => (
              <div key={c.name} style={{ marginBottom:'12px', background:'#fafafa', borderRadius:'12px', padding:'12px 14px', border:'1px solid #eee', cursor:'pointer' }}
                onClick={() => setSelectedCounty(selectedCounty===c.name?null:c.name)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                  <button onClick={e => { e.stopPropagation(); onFlyTo && onFlyTo(c.lng, c.lat, c.zoom || 10); }}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:'800', color:'#085041', padding:0 }}>{c.name} County</button>
                  <span style={{ background:c.color, color:'white', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'12px' }}>{c.area.toLocaleString()} ha</span>
                </div>
                <div style={{ background:'#e8e8e8', borderRadius:'6px', height:'10px', marginBottom:'4px' }}>
                  <div style={{ width:`${(c.area/maxArea)*100}%`, background:c.color, borderRadius:'6px', height:'10px' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}>
                  <span style={{ color:'#1D9E75', fontWeight:'600' }}>Healthy: {c.healthy}%</span>
                  <span style={{ color:'#E24B4A', fontWeight:'600' }}>Degraded: {c.degraded}%</span>
                </div>
                {selectedCounty===c.name && (
                  <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #eee' }}>
                    <p style={{ fontSize:'12px', fontWeight:'700', color:'#085041', margin:'0 0 6px' }}>Management blocks</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                      {c.blocks.map(b => <span key={b} style={{ background:'#E1F5EE', color:'#0F6E56', fontSize:'11px', padding:'3px 8px', borderRadius:'10px', fontWeight:'600' }}>{b}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'species' && (
          <div>
            <p style={{ fontSize:'12px', color:'#888', margin:'0 0 12px' }}>9 recorded species - estimated national area (ha)</p>
            {(q ? filteredSpecies : SPECIES_DATA).map(s => (
              <div key={s.name} style={{ marginBottom:'12px', background:'#fafafa', borderRadius:'12px', padding:'12px 14px', border:'1px solid #eee' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontSize:'13px', fontStyle:'italic', fontWeight:'700', color:'#1a1a1a' }}>{s.name}</span>
                  <span style={{ fontSize:'13px', fontWeight:'800', color:'#0F6E56' }}>~{s.area.toLocaleString()} ha</span>
                </div>
                <p style={{ fontSize:'12px', color:'#555', margin:'0 0 2px' }}>Local: <strong>{s.local}</strong></p>
                <p style={{ fontSize:'11px', color:'#888', margin:'0 0 6px' }}>Use: {s.use}</p>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ flex:1, background:'#e8e8e8', borderRadius:'4px', height:'8px' }}>
                    <div style={{ width:`${(s.area/maxSp)*100}%`, background:'#1D9E75', borderRadius:'4px', height:'8px' }} />
                  </div>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:s.rcolor, whiteSpace:'nowrap' }}>{s.risk}</span>
                </div>
              </div>
            ))}
            <div style={{ background:'linear-gradient(135deg,#1D9E75,#0F6E56)', borderRadius:'12px', padding:'14px', marginTop:'14px' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Full Species Report</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 10px' }}>View complete county-level report including all species data, carbon and ecosystem services.</p>
              <button onClick={() => setShowTabReport('species')}
                style={{ width:'100%', padding:'11px', background:'white', color:'#0F6E56', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'800', cursor:'pointer' }}>
                Read Full Report
              </button>
            </div>
          </div>
        )}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'totals' && (
          <div>
            {[
              ['Total mangrove area','61,271 ha','#0F6E56'],
              ['Healthy area','36,686 ha','#1D9E75'],
              ['Degraded area','24,585 ha','#E24B4A'],
              ['% degraded','40.1%','#E24B4A'],
              ['Annual cover loss','~450 ha/yr','#E24B4A'],
              ['Counties','5','#0F6E56'],
              ['Species','9','#0F6E56'],
              ['Artisanal fishers','20,000+','#085041'],
              ['Fisheries dependence','70% of commercial','#085041'],
              ['Ecosystem value','KES 269,448/ha/yr','#085041'],
              ['Plan budget','KES 3.8 billion','#085041'],
              ['Plan period','2017-2027','#666'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                <span style={{ fontSize:'13px', color:'#555' }}>{l}</span>
                <span style={{ fontSize:'14px', fontWeight:'800', color:c as string }}>{v}</span>
              </div>
            ))}
            <p style={{ fontSize:'13px', fontWeight:'800', color:'#0F6E56', margin:'16px 0 10px' }}>Degradation by county (%)</p>
            {COUNTIES.map(c => (
              <div key={c.name} style={{ marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
                  <span style={{ fontWeight:'700', color:'#333' }}>{c.name}</span>
                  <span style={{ fontWeight:'800', color:c.degraded>45?'#E24B4A':'#BA7517' }}>{c.degraded}%</span>
                </div>
                <div style={{ background:'#e8e8e8', borderRadius:'6px', height:'10px' }}>
                  <div style={{ width:`${c.degraded}%`, background:c.degraded>45?'#E24B4A':'#BA7517', borderRadius:'6px', height:'10px' }} />
                </div>
              </div>
            ))}
            <div style={{ background:'linear-gradient(135deg,#085041,#0F6E56)', borderRadius:'12px', padding:'14px', marginTop:'14px' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Full Totals Report</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 10px' }}>View detailed county breakdown with area, carbon stocks and ecosystem services data.</p>
              <button onClick={() => setShowTabReport('totals')}
                style={{ width:'100%', padding:'11px', background:'white', color:'#085041', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'800', cursor:'pointer' }}>
                Read Full Report
              </button>
            </div>
          </div>
        )}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'carbon' && (
          <div>
            {/* Hero card */}
            <div style={{ background:'linear-gradient(135deg,#E1F5EE,#f0faf6)', borderRadius:'12px', padding:'16px', marginBottom:'14px', textAlign:'center' }}>
              <p style={{ fontSize:'34px', fontWeight:'800', color:'#085041', margin:0 }}>500-1,000</p>
              <p style={{ fontSize:'13px', color:'#0F6E56', margin:'4px 0 0', fontWeight:'700' }}>tC per hectare</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'4px 0 0' }}>Kenya mangrove carbon stocks - 10x higher than terrestrial forests</p>
            </div>

            {/* Carbon stocks by county from Excel */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 4px' }}>Carbon stocks by county (tC/ha)</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 12px' }}>Source: Mangrove Structural & Carbon Data | Gazi Bay site data (KMFRI)</p>
              {[
                { county:'Lamu',       veg:127.85, soil:393.66, total:560.22, color:'#1D9E75' },
                { county:'Kilifi',     veg:80.20,  soil:390.21, total:498.90, color:'#0F6E56' },
                { county:'Kwale (Gazi)',veg:39.61, soil:524.10, total:579.13, color:'#5DCAA5' },
                { county:'Mombasa',    veg:107.50, soil:246.10, total:388.80, color:'#085041' },
                { county:'Tana River', veg:80.20,  soil:390.21, total:498.90, color:'#9FE1CB' },
              ].map(c => (
                <div key={c.county} style={{ marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
                    <span style={{ fontWeight:'700', color:'#333' }}>{c.county}</span>
                    <span style={{ fontWeight:'800', color:c.color }}>{c.total.toFixed(0)} tC/ha</span>
                  </div>
                  <div style={{ display:'flex', height:'10px', borderRadius:'6px', overflow:'hidden' }}>
                    <div style={{ width:`${(c.veg/c.total)*100}%`, background:c.color, opacity:0.7 }}/>
                    <div style={{ width:`${(c.soil/c.total)*100}%`, background:c.color }}/>
                  </div>
                  <div style={{ display:'flex', gap:'10px', fontSize:'10px', marginTop:'2px' }}>
                    <span style={{ color:'#888' }}>Vegetation: {c.veg} tC/ha</span>
                    <span style={{ color:'#888' }}>Soil: {c.soil} tC/ha</span>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', gap:'10px', marginTop:'8px', fontSize:'10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}><div style={{ width:'12px', height:'8px', background:'#1D9E75', opacity:0.7, borderRadius:'2px' }}/><span style={{ color:'#888' }}>Vegetation C</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}><div style={{ width:'12px', height:'8px', background:'#1D9E75', borderRadius:'2px' }}/><span style={{ color:'#888' }}>Soil C</span></div>
              </div>
            </div>

            {/* Species-level carbon at Gazi Bay */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 4px' }}>Species-level carbon stocks at Gazi Bay, Kwale</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 12px' }}>Source: Samonte-Tan et al. | Andreetta et al. 2014</p>
              {[
                { species:'Sonneratia sp.',    ag:5.45, soil:20.04, total:25.50, color:'#1D9E75' },
                { species:'Rhizophora sp.',    ag:2.78, soil:10.20, total:19.02, color:'#0F6E56' },
                { species:'Avicennia sp.',     ag:0.92, soil:3.37,  total:4.48,  color:'#5DCAA5' },
                { species:'Ceriops sp.',       ag:2.19, soil:8.01,  total:14.27, color:'#085041' },
              ].map(s => (
                <div key={s.species} style={{ marginBottom:'8px', padding:'8px', background:'#f9f9f9', borderRadius:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
                    <span style={{ fontStyle:'italic', fontWeight:'700', color:'#333' }}>{s.species}</span>
                    <span style={{ fontWeight:'800', color:s.color }}>{s.total.toFixed(1)} tC/ha</span>
                  </div>
                  <div style={{ display:'flex', gap:'8px', fontSize:'10px' }}>
                    <span style={{ color:'#888' }}>Above-ground: {s.ag} tC/ha</span>
                    <span style={{ color:'#888' }}>Soil: {s.soil} tC/ha</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cover change and carbon loss */}
            <div style={{ background:'#fff5f5', borderRadius:'10px', padding:'14px', marginBottom:'12px', borderLeft:'4px solid #E24B4A' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#A32D2D', margin:'0 0 6px' }}>Mangrove cover change & carbon loss (1990-2020)</p>
              <p style={{ fontSize:'12px', color:'#444', margin:'0 0 10px', lineHeight:1.7 }}>
                Kenya lost 8,863 ha of mangroves between 1990 and 2020 - a 14% decline. Tana River lost 51% of its cover (2,323 ha). This translates to significant blue carbon emissions and loss of ecosystem services valued at KES 269,448/ha/yr.
              </p>
              {[
                { county:'Tana River', loss:-2323, pct:-51.1, color:'#E24B4A' },
                { county:'Mombasa',    loss:-2117, pct:-47.1, color:'#E24B4A' },
                { county:'Lamu',       loss:-1739, pct:-4.6,  color:'#BA7517' },
                { county:'Kwale',      loss:-1151, pct:-13.7, color:'#BA7517' },
                { county:'Kilifi',     loss:-1533, pct:-18.4, color:'#BA7517' },
              ].map(c => (
                <div key={c.county} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'0.5px solid #ffe0e0' }}>
                  <span style={{ fontSize:'12px', fontWeight:'600', color:'#333' }}>{c.county}</span>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontSize:'12px', fontWeight:'800', color:c.color }}>{c.loss.toLocaleString()} ha</span>
                    <span style={{ fontSize:'10px', color:'#888', marginLeft:'6px' }}>({c.pct}%)</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:'10px', background:'#E24B4A11', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                <p style={{ fontSize:'14px', fontWeight:'800', color:'#E24B4A', margin:0 }}>-8,863 ha total loss (1990-2020)</p>
                <p style={{ fontSize:'10px', color:'#888', margin:'2px 0 0' }}>Annual loss rate: ~0.57%/yr</p>
              </div>
            </div>

            {/* Global comparison */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>Global mangrove carbon sequestration rates (tC/ha/yr)</p>
              {[
                { source:'Chmura et al. 2003',   rate:2.10,  color:'#1D9E75' },
                { source:'Duarte et al. 2005',   rate:1.39,  color:'#0F6E56' },
                { source:'Nellemann et al. 2009',rate:1.39,  color:'#5DCAA5' },
                { source:'Murray et al. 2011',   rate:1.72,  color:'#085041' },
                { source:'Siikamaki et al. 2012',rate:1.15,  color:'#9FE1CB' },
                { source:'Kenya (KMFRI)',         rate:1.63,  color:'#E24B4A' },
              ].map(s => (
                <div key={s.source} style={{ marginBottom:'7px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                    <span style={{ color:'#555' }}>{s.source}</span>
                    <span style={{ fontWeight:'800', color:s.color }}>{s.rate} tC/ha/yr</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'4px', height:'6px' }}>
                    <div style={{ width:`${(s.rate/2.10)*100}%`, background:s.color, borderRadius:'4px', height:'6px' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Key stats */}
            {[
              ['Total carbon estimate','~43M tC','#0F6E56'],
              ['Gazi Bay project','Mikoko Pamoja','#085041'],
              ['Annual offsets sold','3,000 tCO2/yr','#1D9E75'],
              ['Community revenue','KES 1.2M/yr','#1D9E75'],
              ['Sequestration rate','1.63 tC/ha/yr (Kenya)','#0F6E56'],
                    ['Soil carbon (avg)','390 tC/ha','#0F6E56'],
              ['Vegetation carbon (avg)','89 tC/ha','#5DCAA5'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                <span style={{ fontSize:'13px', color:'#555' }}>{l}</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:c as string }}>{v}</span>
              </div>
            ))}
            <div style={{ background:'linear-gradient(135deg,#085041,#1D9E75)', borderRadius:'12px', padding:'14px', marginTop:'14px' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Full Carbon Report</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 10px' }}>View county carbon stocks, blue carbon potential and sequestration rates.</p>
              <button onClick={() => setShowTabReport('carbon')}
                style={{ width:'100%', padding:'11px', background:'white', color:'#085041', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'800', cursor:'pointer' }}>
                Read Full Report
              </button>
            </div>
          </div>
        )}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'documents' && (
          <div>
            <p style={{ fontSize:'12px', color:'#888', margin:'0 0 14px' }}>
              Click any document to download the official PDF.
            </p>
            {[
              { title: 'National Mangrove Ecosystem Management Plan 2017-2027', tag: 'Primary', color: '#0F6E56', file: '/documents/national-mangrove-management-plan.pdf', size: '3.0 MB' },
              { title: 'Mangrove Harvest Management Plan for Lamu', tag: 'County Plan', color: '#085041', file: '/documents/mangrove-harvest-management-plan-for-lamu.pdf', size: '1.3 MB' },
              { title: 'National Mangrove Ecosystem Restoration Guidelines', tag: 'Guidelines', color: '#1D9E75', file: '/documents/national-mangrove-ecosystem-restoration-guidelines.pdf', size: '3.1 MB' },
              { title: 'Mikoko Pamoja Annual Report 2024', tag: 'Carbon', color: '#5DCAA5', file: '/documents/Mikoko-Pamoja_-PV-Climate_V4_Annual-Report_2024-1.pdf', size: '3.0 MB' },
              { title: 'Mangrove Ecosystem Valuation - KMFRI', tag: 'Economics', color: '#185FA5', file: '', size: '' },
            ].map(d => (
              <div key={d.title} style={{ padding:'12px 0', borderBottom:'0.5px solid #eee' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                  <span style={{ background:d.color, color:'white', fontSize:'10px', padding:'3px 8px', borderRadius:'10px', fontWeight:'700' }}>{d.tag}</span>
                  {d.size && <span style={{ fontSize:'10px', color:'#888' }}>{d.size}</span>}
                </div>
                <p style={{ fontSize:'13px', fontWeight:'600', color:'#1a1a1a', margin:'0 0 8px' }}>{d.title}</p>
                {d.file ? (
                  <a href={d.file} target="_blank" rel="noopener noreferrer" download
                    style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:d.color, color:'white', fontSize:'11px', padding:'5px 14px', borderRadius:'8px', textDecoration:'none', fontWeight:'700' }}>
                    Download PDF
                  </a>
                ) : (
                  <span style={{ fontSize:'11px', color:'#888', fontStyle:'italic' }}>PDF coming soon</span>
                )}
              </div>
            ))}
          </div>
        )}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'restoration' && (
          <div>
            {COUNTIES.map(r => (
              <div key={r.name} style={{ marginBottom:'12px', background:'#fafafa', borderRadius:'12px', padding:'12px 14px', border:'1px solid #eee' }}>
                <p style={{ fontSize:'14px', fontWeight:'800', color:'#085041', margin:'0 0 6px' }}>{r.name}</p>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px' }}>
                  <span style={{ color:'#E24B4A', fontWeight:'600' }}>Degraded: {Math.round(r.area*r.degraded/100).toLocaleString()} ha</span>
                  <span style={{ color:'#1D9E75', fontWeight:'600' }}>Target: {r.restoration_target} ha/yr</span>
                </div>
                <div style={{ background:'#e8e8e8', borderRadius:'6px', height:'10px' }}>
                  <div style={{ width:`${r.degraded}%`, background:'#E24B4A', borderRadius:'6px', height:'10px' }} />
                </div>
              </div>
            ))}
            <div style={{ background:'#E1F5EE', borderRadius:'12px', padding:'14px', marginTop:'8px', textAlign:'center' }}>
              <p style={{ fontSize:'13px', fontWeight:'700', color:'#0F6E56', margin:'0 0 4px' }}>Total needing restoration</p>
              <p style={{ fontSize:'28px', fontWeight:'800', color:'#085041', margin:0 }}>24,585 ha</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'4px 0 0' }}>40.1% of total mangrove area</p>
            </div>
            <div style={{ background:'linear-gradient(135deg,#5DCAA5,#1D9E75)', borderRadius:'12px', padding:'14px', marginTop:'14px' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Full Restoration Report</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 10px' }}>View restoration targets, county plans and progress under the National Mangrove Management Plan.</p>
              <button onClick={() => setShowTabReport('restoration')}
                style={{ width:'100%', padding:'11px', background:'white', color:'#1D9E75', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'800', cursor:'pointer' }}>
                Read Full Report
              </button>
            </div>
          </div>
        )}

        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'degradation' && (
          <div>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#A32D2D,#E24B4A)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
              <p style={{ fontSize:'15px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Degradation Survey 2023-2024</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 8px', lineHeight:1.6 }}>
                Field-verified ground survey across all 5 counties. Funded by the Blue Carbon Project and IUCN. 192 Mapped sites.
              </p>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'10px', padding:'3px 10px', borderRadius:'14px', fontWeight:'700' }}>192 survey sites</span>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'10px', padding:'3px 10px', borderRadius:'14px', fontWeight:'700' }}>1,172 ha surveyed</span>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'10px', padding:'3px 10px', borderRadius:'14px', fontWeight:'700' }}>5 counties</span>
              </div>
            </div>

            {/* Nature summary cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' }}>
              {[
                ['125','Degraded sites','#E24B4A'],
                ['42','Under rehabilitation','#BA7517'],
                ['25','Restored sites','#1D9E75'],
              ].map(([v,l,c]) => (
                <div key={l} style={{ background:'white', borderRadius:'10px', padding:'12px', textAlign:'center', border:`2px solid ${c}22` }}>
                  <p style={{ fontSize:'22px', fontWeight:'800', color:c, margin:0 }}>{v}</p>
                  <p style={{ fontSize:'10px', color:'#777', margin:'2px 0 0' }}>{l}</p>
                </div>
              ))}
            </div>

            {/* Nature of sites bar chart */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#A32D2D', margin:'0 0 12px' }}>Sites by nature of degradation</p>
              {DEG_BY_NATURE.map(d => (
                <div key={d.nature} style={{ marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'3px' }}>
                    <span style={{ fontWeight:'700', color:'#333' }}>{d.nature}</span>
                    <span style={{ fontWeight:'800', color:d.color }}>{d.count} sites ({((d.count/192)*100).toFixed(1)}%)</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'6px', height:'10px' }}>
                    <div style={{ width:`${(d.count/125)*100}%`, background:d.color, borderRadius:'6px', height:'10px' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Degradation level donut */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#A32D2D', margin:'0 0 12px' }}>Degradation levels (all sites)</p>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <DonutChart size={90} data={DEG_BY_LEVEL.map(d=>({label:d.level,value:d.count,color:d.color}))}/>
                <div style={{ flex:1 }}>
                  {DEG_BY_LEVEL.map(d => (
                    <div key={d.level} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                      <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:d.color, flexShrink:0 }}/>
                      <span style={{ fontSize:'11px', color:'#333', flex:1 }}>{d.level}</span>
                      <span style={{ fontSize:'12px', fontWeight:'800', color:d.color }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* County breakdown */}
            <div style={{ background:'#fff5f5', borderRadius:'10px', padding:'14px', marginBottom:'12px', borderLeft:'4px solid #E24B4A' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#A32D2D', margin:'0 0 4px' }}>County breakdown</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 10px' }}>Kilifi has highest surveyed degraded area at 656 ha. Note: area estimates are from field survey - some sites had 0 ha recorded.</p>
            </div>
            {DEGRADATION_DATA.map(c => (
              <div key={c.county} style={{ background:'white', borderRadius:'10px', padding:'12px 14px', marginBottom:'10px', border:'1px solid #eee' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                  <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:0 }}>{c.county} County</p>
                  <span style={{ background:'#E24B4A', color:'white', fontSize:'10px', padding:'2px 8px', borderRadius:'10px', fontWeight:'700' }}>{c.ha} ha</span>
                </div>
                <p style={{ fontSize:'11px', color:'#666', margin:'0 0 6px' }}>Forest Station: {c.station} | {c.sites} survey sites</p>
                <div style={{ display:'flex', borderRadius:'6px', overflow:'hidden', height:'14px', marginBottom:'4px' }}>
                  <div style={{ width:`${c.pctDeg}%`, background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {c.pctDeg > 15 && <span style={{ fontSize:'9px', color:'white', fontWeight:'800' }}>{c.pctDeg.toFixed(0)}%</span>}
                  </div>
                  <div style={{ width:`${c.pctReh}%`, background:'#BA7517', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {c.pctReh > 10 && <span style={{ fontSize:'9px', color:'white', fontWeight:'800' }}>{c.pctReh.toFixed(0)}%</span>}
                  </div>
                  <div style={{ width:`${c.pctRes}%`, background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {c.pctRes > 10 && <span style={{ fontSize:'9px', color:'white', fontWeight:'800' }}>{c.pctRes.toFixed(0)}%</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'10px', fontSize:'10px' }}>
                  <span style={{ color:'#E24B4A', fontWeight:'600' }}>Degraded: {c.degraded}</span>
                  <span style={{ color:'#BA7517', fontWeight:'600' }}>Rehab: {c.rehabilitated}</span>
                  <span style={{ color:'#1D9E75', fontWeight:'600' }}>Restored: {c.restored}</span>
                </div>
              </div>
            ))}

            {/* Forest stations */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>Survey sites by Forest Station</p>
              {DEG_STATIONS.map(s => (
                <div key={s.station} style={{ marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                    <span style={{ fontWeight:'700', color:'#333' }}>{s.station} <span style={{ color:'#888', fontWeight:'400' }}>({s.county})</span></span>
                    <span style={{ fontWeight:'800', color:s.color }}>{s.count} sites</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'4px', height:'8px' }}>
                    <div style={{ width:`${(s.count/73)*100}%`, background:s.color, borderRadius:'4px', height:'8px' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* View Report Button */}
            <div style={{ background:'linear-gradient(135deg,#A32D2D,#E24B4A)', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Full Degradation Survey Report</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 12px' }}>View the complete field survey report with county analysis, rehabilitation status, findings and recommendations.</p>
              <button onClick={() => setShowDegReport(true)}
                style={{ width:'100%', padding:'12px', background:'white', color:'#A32D2D', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'800', cursor:'pointer' }}>
                View Full Degradation Report
              </button>
            </div>

            {/* Data source note */}
            <div style={{ background:'#f0f7f4', borderRadius:'10px', padding:'12px 14px', border:'1px solid #ddeedd' }}>
              <p style={{ fontSize:'11px', color:'#0F6E56', margin:0, lineHeight:1.6 }}>
                <strong>Data source:</strong> Kenya Forest Service (KFS) field survey 2023-2024. Funded by the Blue Carbon Project and IUCN. Survey covers degradation status, species composition, and rehabilitation efforts across all 5 coastal mangrove counties.
              </p>
            </div>
          </div>
        )}


        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'stakeholders' && (
          <div>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#3C3489,#534AB7)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
              <p style={{ fontSize:'15px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Stakeholders Monitoring 2024</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 4px', lineHeight:1.6 }}>
                Kilifi County restoration stakeholders monitoring and evaluation. Funded by CIFOR-ICRAF Nairobi under the Regional Centre of Excellence (RCoE) Project. 90 stakeholder sites mapped in 2024.
              </p>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.6)', margin:0, fontStyle:'italic' }}>
                Note: This is a pilot dataset for Kilifi County only. National rollout planned.
              </p>
            </div>

            {/* Summary cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' }}>
              {[
                ['90','Stakeholder sites','#534AB7'],
                ['57','With KFS framework','#1D9E75'],
                ['3','Forest stations','#085041'],
              ].map(([v,l,c]) => (
                <div key={l} style={{ background:'white', borderRadius:'10px', padding:'12px', textAlign:'center', border:`2px solid ${c}22` }}>
                  <p style={{ fontSize:'22px', fontWeight:'800', color:c, margin:0 }}>{v}</p>
                  <p style={{ fontSize:'10px', color:'#777', margin:'2px 0 0' }}>{l}</p>
                </div>
              ))}
            </div>

            {/* Categories donut */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#534AB7', margin:'0 0 12px' }}>Stakeholder categories</p>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <DonutChart size={90} data={STAK_CATEGORIES.map(d=>({label:d.category,value:d.count,color:d.color}))}/>
                <div style={{ flex:1 }}>
                  {STAK_CATEGORIES.map(d => (
                    <div key={d.category} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                      <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:d.color, flexShrink:0 }}/>
                      <span style={{ fontSize:'12px', color:'#333', flex:1 }}>{d.category}</span>
                      <span style={{ fontSize:'13px', fontWeight:'800', color:d.color }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Framework of collaboration */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>KFS Framework of Collaboration</p>
              <div style={{ display:'flex', borderRadius:'10px', overflow:'hidden', height:'36px', marginBottom:'10px' }}>
                <div style={{ width:'63.3%', background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'12px', color:'white', fontWeight:'800' }}>With Framework 63.3%</span>
                </div>
                <div style={{ width:'36.7%', background:'#E24B4A', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'12px', color:'white', fontWeight:'800' }}>Without 36.7%</span>
                </div>
              </div>
              {STAK_FRAMEWORK.map(d => (
                <div key={d.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'0.5px solid #f0f0f0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:d.color }}/>
                    <span style={{ fontSize:'12px', color:'#333' }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize:'13px', fontWeight:'800', color:d.color }}>{d.count} sites</span>
                </div>
              ))}
            </div>

            {/* Species planted */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>Mangrove species being planted</p>
              {STAK_SPECIES.map(d => (
                <div key={d.species} style={{ marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                    <span style={{ fontStyle:'italic', color:'#333', fontWeight:'600' }}>{d.species}</span>
                    <span style={{ fontWeight:'800', color:d.color }}>{d.count}</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'4px', height:'7px' }}>
                    <div style={{ width:`${(d.count/32)*100}%`, background:d.color, borderRadius:'4px', height:'7px' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Survival rates */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 4px' }}>Seedling survival rates</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 12px' }}>65 of 90 sites (72%) report survival rates above 41%</p>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <DonutChart size={90} data={STAK_SURVIVAL.map(d=>({label:d.range,value:d.count,color:d.color}))}/>
                <div style={{ flex:1 }}>
                  {STAK_SURVIVAL.map(d => (
                    <div key={d.range} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                      <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:d.color, flexShrink:0 }}/>
                      <span style={{ fontSize:'12px', color:'#333', flex:1 }}>{d.range} survival</span>
                      <span style={{ fontSize:'12px', fontWeight:'800', color:d.color }}>{d.count} sites</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seedling sources */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>Source of seedlings</p>
              {STAK_SOURCES.map(d => (
                <div key={d.source} style={{ marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                    <span style={{ fontWeight:'700', color:'#333' }}>{d.source}</span>
                    <span style={{ fontWeight:'800', color:d.color }}>{d.count} sites</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'4px', height:'7px' }}>
                    <div style={{ width:`${(d.count/42)*100}%`, background:d.color, borderRadius:'4px', height:'7px' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Forest stations breakdown */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>Sites by Forest Station (Kilifi)</p>
              {STAK_STATIONS.map(d => (
                <div key={d.station} style={{ marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'2px' }}>
                    <span style={{ fontWeight:'700', color:'#333' }}>{d.station} Forest Station</span>
                    <span style={{ fontWeight:'800', color:d.color }}>{d.count} sites</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'4px', height:'8px' }}>
                    <div style={{ width:`${(d.count/37)*100}%`, background:d.color, borderRadius:'4px', height:'8px' }}/>
                  </div>
                </div>
              ))}
            </div>


            {/* Restoration Partners and Areas */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#534AB7', margin:'0 0 4px' }}>Restoration partners and area under restoration</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 12px' }}>Total: 3,029 ha across 8 active partners | 15 million+ propagules planted (2019-2024)</p>
              {[
                { partner:'Eden People+Planet',  area:2100, color:'#1D9E75', framework:'With', category:'NGO',     note:'Highest scale - Ngomeni, Kanagoni, Mida, Mtwapa, Kilifi Creek' },
                { partner:'Earthlungs',          area:612,  color:'#0F6E56', framework:'With', category:'NGO',     note:'Kilifi Creek, Msanganyiko, Katzuoni, Mwachinandi' },
                { partner:'COBEC',               area:150,  color:'#5DCAA5', framework:'With', category:'CBO',     note:'Mida Creek - Uyombo, Kadaina, Majaoni, Ikulu' },
                { partner:'Grow Initiative',     area:80,   color:'#085041', framework:'Without', category:'NGO',  note:'Awaiting framework signing - 1000 ha allocated' },
                { partner:'WWF Kenya',           area:45,   color:'#185FA5', framework:'Without', category:'NGO',  note:'Not yet operational - 45 ha allocated' },
                { partner:'Plan International',  area:15,   color:'#534AB7', framework:'With', category:'NGO',     note:'Kaya Chonyi, Timbetimbe - terrestrial + marine' },
                { partner:'Nature Kenya',        area:20,   color:'#BA7517', framework:'Without', category:'NGO',  note:'Not yet started - issues with area allocation' },
                { partner:'Leaf Charity',        area:7,    color:'#9FE1CB', framework:'Without', category:'NGO',  note:'Kilifi Creek, Gede, Mtwapa - smaller scale' },
              ].map(p => (
                <div key={p.partner} style={{ marginBottom:'10px', padding:'10px', background:'#f9f9f9', borderRadius:'8px', borderLeft:`3px solid ${p.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                    <span style={{ fontSize:'12px', fontWeight:'800', color:'#1a1a1a' }}>{p.partner}</span>
                    <span style={{ fontSize:'12px', fontWeight:'800', color:p.color }}>{p.area.toLocaleString()} ha</span>
                  </div>
                  <div style={{ display:'flex', gap:'6px', marginBottom:'4px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'10px', background:p.color, color:'white', padding:'2px 7px', borderRadius:'10px', fontWeight:'600' }}>{p.category}</span>
                    <span style={{ fontSize:'10px', background: p.framework==='With'?'#E1F5EE':'#fff0f0', color: p.framework==='With'?'#0F6E56':'#E24B4A', padding:'2px 7px', borderRadius:'10px', fontWeight:'600' }}>
                      {p.framework} KFS Framework
                    </span>
                  </div>
                  <p style={{ fontSize:'10px', color:'#888', margin:0, fontStyle:'italic' }}>{p.note}</p>
                </div>
              ))}
            </div>

            {/* Species survival rates from report */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 4px' }}>Species survival rates (field observed)</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 12px' }}>Source: CIFOR-ICRAF M&E mission Oct 2024</p>
              {[
                { species:'Avicennia marina (Mchu)',      range:'75-85%', color:'#1D9E75', note:'Highest adaptability - thrives in dynamic coastal environments' },
                { species:'Rhizophora mucronata (Mkoko)', range:'70-80%', color:'#0F6E56', note:'Key for shoreline protection - priority for Eden and COBEC' },
                { species:'Sonneratia alba (Mlilana)',    range:'65-80%', color:'#5DCAA5', note:'Suited for high tidal ranges - Earthlungs focus species' },
                { species:'Ceriops tagal (Mkandaa)',      range:'60-75%', color:'#BA7517', note:'Sensitive to environmental stressors - site matching critical' },
                { species:'Bruguiera gymnorhiza (Muia)',  range:'60-70%', color:'#534AB7', note:'Coastal zone stabiliser - Leaf Charity and WWF Kenya' },
              ].map(s => (
                <div key={s.species} style={{ marginBottom:'10px', padding:'8px', background:'#f9f9f9', borderRadius:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3px' }}>
                    <span style={{ fontSize:'12px', fontStyle:'italic', color:'#1a1a1a', fontWeight:'600' }}>{s.species}</span>
                    <span style={{ fontSize:'12px', fontWeight:'800', color:s.color }}>{s.range}</span>
                  </div>
                  <div style={{ background:'#eee', borderRadius:'4px', height:'6px', marginBottom:'3px' }}>
                    <div style={{ width:`${parseInt(s.range.split('-')[1])}%`, background:s.color, borderRadius:'4px', height:'6px' }}/>
                  </div>
                  <p style={{ fontSize:'10px', color:'#888', margin:0, fontStyle:'italic' }}>{s.note}</p>
                </div>
              ))}
            </div>

            {/* Key restoration sites from report */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 12px' }}>Key restoration sites (Kilifi County)</p>
              {[
                { site:'Kanagoni (Jilore)',    area:'358.93 ha',  partner:'Eden',          highlight:'Largest single restored site in Kilifi' },
                { site:'Kilifi Creek',         area:'364.09 ha',  partner:'Eden+Earthlungs',highlight:'4.2M+ propagules planted - 60%+ survival' },
                { site:'Mtwapa Creek',         area:'225.76 ha',  partner:'Eden+COBEC',     highlight:'214.66 ha Eden | 9.39 ha COBEC | 1.71 ha Plan' },
                { site:'Ngomeni (Jilore)',     area:'94.66 ha',   partner:'Eden+Earthlungs',highlight:'1.7M+ propagules - 80% survival at Ikulu' },
                { site:'Mida Creek (Gede)',    area:'143.9 ha',   partner:'Eden+COBEC',     highlight:'104 ha Eden | 40 ha COBEC - Dabaso success' },
                { site:'Marereni',             area:'196.97 ha',  partner:'COBEC',          highlight:'COBEC-led coastal restoration' },
              ].map(s => (
                <div key={s.site} style={{ display:'flex', gap:'10px', marginBottom:'8px', padding:'8px', background:'#f9f9f9', borderRadius:'8px', alignItems:'flex-start' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#534AB7', marginTop:'5px', flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'12px', fontWeight:'700', color:'#1a1a1a' }}>{s.site}</span>
                      <span style={{ fontSize:'11px', fontWeight:'800', color:'#534AB7' }}>{s.area}</span>
                    </div>
                    <p style={{ fontSize:'10px', color:'#0F6E56', margin:'1px 0', fontWeight:'600' }}>{s.partner}</p>
                    <p style={{ fontSize:'10px', color:'#888', margin:0, fontStyle:'italic' }}>{s.highlight}</p>
                  </div>
                </div>
              ))}
              <div style={{ background:'#f0f7f4', borderRadius:'8px', padding:'10px', marginTop:'8px', textAlign:'center' }}>
                <p style={{ fontSize:'14px', fontWeight:'800', color:'#0F6E56', margin:0 }}>1,434.67 ha</p>
                <p style={{ fontSize:'11px', color:'#888', margin:'2px 0 0' }}>Total forest restored area - Kilifi County</p>
              </div>
            </div>

            {/* Challenges by station */}
            <div style={{ background:'#fff5f5', borderRadius:'10px', padding:'14px', marginBottom:'12px', borderLeft:'4px solid #E24B4A' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#A32D2D', margin:'0 0 12px' }}>Key restoration challenges by forest station</p>
              {[
                { station:'Jilore', challenges:['Site-species matching','Livestock grazing on seedlings','Climate change impacts','Monitoring and evaluation gaps','Limited technical expertise'] },
                { station:'Sokoke', challenges:['Illegal logging and harvesting','Community engagement difficulties','Seedling scarcity','Climate change impacts','Monitoring gaps'] },
                { station:'Gede',   challenges:['Livestock grazing','Climate change impacts','Limited technical expertise','Illegal logging','Monitoring and evaluation gaps'] },
              ].map(st => (
                <div key={st.station} style={{ marginBottom:'12px' }}>
                  <p style={{ fontSize:'12px', fontWeight:'800', color:'#534AB7', margin:'0 0 6px' }}>{st.station} Forest Station</p>
                  {st.challenges.map((c,i) => (
                    <div key={c} style={{ display:'flex', gap:'8px', marginBottom:'4px', alignItems:'center' }}>
                      <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#E24B4A', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'800', flexShrink:0 }}>{i+1}</div>
                      <span style={{ fontSize:'11px', color:'#444' }}>{c}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Seedlings summary */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #eee' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'#085041', margin:'0 0 4px' }}>Seedlings/propagules planted by station</p>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 12px' }}>Estimated totals (2019-2024) - Source: CIFOR-ICRAF M&E Report</p>
              {[
                { station:'Jilore',  total:'10,000,000', details:'Kanagoni: 3M | Ngomeni: 6M | Mida: 1M', avgSurvival:'71.7%', color:'#1D9E75' },
                { station:'Sokoke',  total:'4,000,000',  details:'Kilifi Creek, Msanganyiko, Kuchi, Mwachinandi', avgSurvival:'55.9%', color:'#BA7517' },
                { station:'Gede',    total:'2,000,000',  details:'Catepillar, Dabaso, Kirepwe, Magangani, Sita', avgSurvival:'72.2%', color:'#0F6E56' },
              ].map(s => (
                <div key={s.station} style={{ marginBottom:'12px', padding:'10px', background:'#f9f9f9', borderRadius:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'13px', fontWeight:'800', color:'#085041' }}>{s.station}</span>
                    <span style={{ fontSize:'13px', fontWeight:'800', color:s.color }}>{s.total}</span>
                  </div>
                  <p style={{ fontSize:'10px', color:'#666', margin:'0 0 4px' }}>{s.details}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontSize:'10px', color:'#888' }}>Avg survival rate:</span>
                    <span style={{ fontSize:'11px', fontWeight:'800', color:s.color }}>{s.avgSurvival}</span>
                  </div>
                </div>
              ))}
              <div style={{ background:'#f0f7f4', borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                <p style={{ fontSize:'18px', fontWeight:'800', color:'#0F6E56', margin:0 }}>16,000,000+</p>
                <p style={{ fontSize:'11px', color:'#888', margin:'2px 0 0' }}>Total seedlings/propagules planted across all stations</p>
              </div>
            </div>

            {/* View Report Button */}
            <div style={{ background:'linear-gradient(135deg,#3C3489,#534AB7)', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
              <p style={{ fontSize:'13px', fontWeight:'800', color:'white', margin:'0 0 4px' }}>Full Stakeholders M&E Report</p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.8)', margin:'0 0 12px' }}>View the complete CIFOR-ICRAF monitoring report with partner analysis, survival rates, seedlings data and recommendations.</p>
              <button onClick={() => setShowStakReport(true)}
                style={{ width:'100%', padding:'12px', background:'white', color:'#534AB7', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'800', cursor:'pointer' }}>
                View Full Stakeholders Report
              </button>
            </div>

            {/* Data source */}
            <div style={{ background:'#f5f0ff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #d4cef7' }}>
              <p style={{ fontSize:'11px', color:'#534AB7', margin:0, lineHeight:1.6 }}>
                <strong>Data source:</strong> Stakeholder monitoring survey, Kilifi County, 2024. Survey covers 90 restoration stakeholder sites across Sokoke, Jilore, and Gede Forest Stations. National rollout of this methodology is planned for 2025.
              </p>
            </div>
          </div>
        )}


        {!showReport && !showDegReport && !showStakReport && !showTabReport && tab === 'alldata' && <AllDataTab onFlyTo={onFlyTo} onViewReport={(name) => { setReportCounty(name); setShowReport(true); }} onViewAll={() => { setShowAllCounties(true); setShowReport(true); setReportCounty(COUNTIES[0].name); }} />}

      </div>

      {/* FOOTER */}
      <div style={{ padding:'12px 16px', borderTop:'2px solid #eee', flexShrink:0 }}>
        <p style={{ fontSize:'11px', color:'#888', textAlign:'center', margin:0 }}>
          Kenya Mangrove Portal | KFS | KMFRI |
        </p>
      </div>

    </div>
  );
}





