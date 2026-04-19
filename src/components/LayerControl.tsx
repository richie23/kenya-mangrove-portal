'use client';
import { useState } from 'react';

interface Layer {
  id: string;
  label: string;
  color: string;
}

const LAYERS: Layer[] = [
  { id: 'mangrove-fill', label: 'Mangrove Cover', color: '#1D9E75' },
  { id: 'mangrove-outline', label: 'Mangrove Outline', color: '#085041' },
];

interface LayerControlProps {
  onToggle: (layerId: string, visible: boolean) => void;
}

export default function LayerControl({ onToggle }: LayerControlProps) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map(l => [l.id, true]))
  );

  function toggle(layerId: string) {
    const newValue = !visibility[layerId];
    setVisibility(prev => ({ ...prev, [layerId]: newValue }));
    onToggle(layerId, newValue);
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'white',
      borderRadius: '10px',
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 10,
      minWidth: '200px'
    }}>
      <p style={{
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '10px',
        color: '#1a1a1a'
      }}>
        Kenya Mangrove Layers
      </p>

      {LAYERS.map(layer => (
        <div key={layer.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '3px',
            background: visibility[layer.id] ? layer.color : '#ccc',
            flexShrink: 0
          }} />
          <span style={{
            fontSize: '13px',
            color: '#333',
            flex: 1
          }}>
            {layer.label}
          </span>
          <button
            onClick={() => toggle(layer.id)}
            style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: visibility[layer.id] ? '#1D9E75' : '#f0f0f0',
              color: visibility[layer.id] ? 'white' : '#666',
              cursor: 'pointer'
            }}
          >
            {visibility[layer.id] ? 'ON' : 'OFF'}
          </button>
        </div>
      ))}
    </div>
  );
}