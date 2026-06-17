'use client';

import { Handle, Position } from '@xyflow/react';

const PORT_COLORS: Record<string, string> = {
  String: '#6366f1',
  Number: '#eab308',
  Boolean: '#22c55e',
  JSON: '#3b82f6',
};

export default function InputNode({ data }: { data: any }) {
  const inputs = data.inputs || [];

  return (
    <div
      style={{
        background: '#111827',
        border: '2px solid #8b5cf6',
        borderRadius: 14,
        minWidth: 200,
        boxShadow: '0 0 20px #8b5cf655',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#3f1f7f',
          borderRadius: '12px 12px 0 0',
          padding: '10px 14px',
          borderBottom: '1px solid #374151',
        }}
      >
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>📥 Inputs</div>
      </div>

      {/* Outputs */}
      <div style={{ padding: '10px 0', paddingRight: 14 }}>
        {inputs.map((inp: any, i: number) => (
          <div
            key={i}
            style={{
              position: 'relative',
              marginBottom: 6,
              paddingRight: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 6,
            }}
          >
            <span style={{ color: '#d1d5db', fontSize: 10 }}>{inp.nombre}</span>
            <span
              style={{
                color: PORT_COLORS[inp.tipo] || '#6b7280',
                fontSize: 9,
                fontFamily: 'monospace',
              }}
            >
              {inp.tipo}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={`input-${inp.nombre}`}
              style={{
                background: PORT_COLORS[inp.tipo] || '#6b7280',
                width: 10,
                height: 10,
                right: -6,
                border: '2px solid #111827',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
