'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell } from 'recharts';

const COUNTY_DATA = [
  { county: 'Lamu',       area: 37350, degraded: 14407, color: '#1D9E75' },
  { county: 'Kilifi',     area: 8536,  degraded: 3422,  color: '#0F6E56' },
  { county: 'Kwale',      area: 8354,  degraded: 3725,  color: '#5DCAA5' },
  { county: 'Mombasa',    area: 3771,  degraded: 1850,  color: '#085041' },
  { county: 'Tana River', area: 3260,  degraded: 1180,  color: '#9FE1CB' },
];

const ECOSYSTEM_VALUES = [
  { service: 'Shoreline protection', value: 134866 },
  { service: 'Education & Research', value: 65470  },
  { service: 'Building poles',       value: 30660  },
  { service: 'Carbon sequestration', value: 21896  },
  { service: 'Onsite fisheries',     value: 9613   },
  { service: 'Fuel wood',            value: 4505   },
  { service: 'Beekeeping',           value: 1250   },
  { service: 'Tourism',              value: 782    },
  { service: 'Aquaculture',          value: 408    },
];

export default function MangroveplanPage() {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F6E56', margin: '0 0 4px' }}>
        Kenya National Mangrove Ecosystem Management Plan
      </h1>
      <p style={{ color: '#888', fontSize: '13px', margin: '0 0 20px' }}>
        2017 - 2027 | Kenya Forest Service | Ministry of Environment
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          ['61,271 ha', 'Total mangrove area'],
          ['24,585 ha', 'Degraded area'],
          ['40.1%',     '% degraded nationally'],
          ['9',         'Mangrove species'],
          ['KES 3.8B',  '10-yr plan budget'],
        ].map(([v, l]) => (
          <div key={l} style={{ background: 'white', borderRadius: '10px', padding: '14px',
            textAlign: 'center', border: '0.5px solid #ddd' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#0F6E56', margin: 0 }}>{v}</p>
            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '16px', border: '0.5px solid #ddd' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px' }}>
            Mangrove area by county (ha)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={COUNTY_DATA}>
              <XAxis dataKey="county" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`${Number(v).toLocaleString()} ha`, '']} />
              <Bar dataKey="area" name="Total area">
                {COUNTY_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', padding: '16px', border: '0.5px solid #ddd' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px' }}>
            Degraded vs healthy area (ha)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={COUNTY_DATA}>
              <XAxis dataKey="county" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`${Number(v).toLocaleString()} ha`, '']} />
              <Bar dataKey="degraded" fill="#E24B4A" name="Degraded" stackId="a" />
              <Bar dataKey="area" fill="#1D9E75" name="Healthy" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', padding: '16px',
        border: '0.5px solid #ddd', marginTop: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>
          Ecosystem services valuation (KES per hectare per year) - Source: KMFRI
        </p>
        <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px' }}>
          Total value: KES 269,448 per hectare per year
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ECOSYSTEM_VALUES} layout="vertical" margin={{ left: 130, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 10 }}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <YAxis type="category" dataKey="service" tick={{ fontSize: 11 }} width={140} />
            <Tooltip formatter={v => [`KES ${Number(v).toLocaleString()}`, '']} />
            <Bar dataKey="value" fill="#1D9E75" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}