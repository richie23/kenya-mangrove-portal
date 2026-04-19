'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell } from 'recharts';

const PROGRAMMES = [
  { name: 'Forest Conservation and Utilization', budget: 420, lead: 'Kenya Forest Service', color: '#1D9E75',
    objectives: ['Conserve mangrove forests for ecological integrity','Promote sustainable harvesting of wood products','Rehabilitate degraded mangrove forest areas','Improve policing and protection from illegal activities'] },
  { name: 'Fisheries Development and Management', budget: 180, lead: 'State Dept of Fisheries', color: '#0F6E56',
    objectives: ['Map and restore degraded fish habitats','Promote silvo-aquaculture in mangrove areas','Active community participation in fisheries management'] },
  { name: 'Community Programme', budget: 310, lead: 'KFS + County Governments', color: '#5DCAA5',
    objectives: ['Strengthen CFAs and local institutions','Promote 100 alternative IGA initiatives','Awareness and training programmes','5 community resource centres established'] },
  { name: 'Research and Education', budget: 250, lead: 'KMFRI + KEFRI + Universities', color: '#9FE1CB',
    objectives: ['Establish permanent sample plots in all counties','Mangrove units in university curricula','Annual technical monitoring reports'] },
  { name: 'Tourism Development', budget: 290, lead: 'KFS + KWS + KTB', color: '#085041',
    objectives: ['Develop national mangrove tourism master plan','Boardwalks in 5 mangrove sites','Community tourism enterprises in 10 areas'] },
  { name: 'Human Resource and Operations', budget: 360, lead: 'KFS + KWS', color: '#04342C',
    objectives: ['Train 584 staff in deficit areas','20 new ranger outposts','10 new patrol boats and 150 motorbikes'] },
];

export default function ProgrammesPage() {
  const total = PROGRAMMES.reduce((s, p) => s + p.budget, 0);
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F6E56', margin: '0 0 4px' }}>
        6 Management Programmes
      </h1>
      <p style={{ color: '#888', fontSize: '13px', margin: '0 0 20px' }}>
        10-year implementation 2017-2027 | Total budget: KES {total}M
      </p>
      <div style={{ background: 'white', borderRadius: '10px', padding: '20px',
        border: '0.5px solid #ddd', marginBottom: '20px' }}>
        <p style={{ fontWeight: '600', marginBottom: '16px' }}>Budget allocation by programme (KES million)</p>
        {PROGRAMMES.map(p => (
          <div key={p.name} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ fontWeight: '500' }}>{p.name}</span>
              <span style={{ color: '#0F6E56', fontWeight: '600' }}>KES {p.budget}M</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '10px' }}>
              <div style={{ width: `${(p.budget / 450) * 100}%`, background: p.color,
                borderRadius: '4px', height: '10px' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {PROGRAMMES.map(p => (
          <div key={p.name} style={{ background: 'white', borderRadius: '10px',
            padding: '16px', border: '0.5px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#0F6E56' }}>{p.name}</p>
              <span style={{ fontSize: '11px', background: '#E1F5EE', color: '#0F6E56',
                padding: '2px 8px', borderRadius: '20px' }}>KES {p.budget}M</span>
            </div>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Lead: {p.lead}</p>
            {p.objectives.map(o => (
              <p key={o} style={{ fontSize: '11px', margin: '3px 0', paddingLeft: '10px',
                borderLeft: '2px solid #1D9E75', color: '#333' }}>{o}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
