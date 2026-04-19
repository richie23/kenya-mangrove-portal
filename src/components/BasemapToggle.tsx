'use client';

interface BasemapToggleProps {
  current: string;
  onChange: (style: string) => void;
}

const BASEMAPS = [
  { label: 'Light',      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
  { label: 'Dark',       style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { label: 'Satellite',  style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
];

export default function BasemapToggle({ current, onChange }: BasemapToggleProps) {
  return (
    <div style={{
      position: 'relative', 
     
      background: 'white',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 10,
    }}>
      <p style={{
        fontSize: '11px',
        fontWeight: '600',
        color: '#555',
        margin: '0 0 8px',
      }}>
        Basemap
      </p>
      <div style={{ display: 'flex', gap: '6px' }}>
        {BASEMAPS.map(b => (
          <button
            key={b.label}
            onClick={() => onChange(b.style)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: current === b.style ? '#0F6E56' : '#f5f5f5',
              color: current === b.style ? 'white' : '#555',
              cursor: 'pointer',
              fontWeight: current === b.style ? '600' : '400',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}