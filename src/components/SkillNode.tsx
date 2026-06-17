'use client';

import { Handle, Position } from '@xyflow/react';

const PORT_COLORS: Record<string, string> = {
  String: '#6366f1',
  Number: '#eab308',
  Boolean: '#22c55e',
  JSON: '#3b82f6',
  File: '#ef4444',
  Folder: '#a855f7',
  'Array<string>': '#ec4899',
  Float: '#f97316',
};

const STATUS_BORDER: Record<string, string> = {
  idle: '#4b5563',
  running: '#3b82f6',
  completed: '#22c55e',
  error: '#ef4444',
};

const STATUS_GLOW: Record<string, string> = {
  idle: 'none',
  running: '0 0 20px #3b82f688',
  completed: '0 0 12px #22c55e44',
  error: '0 0 12px #ef444444',
};

export default function SkillNode({ data, selected }: { data: any; selected: boolean }) {
  const status = data.status || 'idle';
  const inputs = data.inputs || [{ nombre: 'input', tipo: 'String' }];
  const outputs = data.outputs || [{ nombre: 'output', tipo: 'String' }];

  return (
    <div
      onClick={() => data.onSelect?.()}
      style={{
        background: '#111827',
        border: `2px solid ${selected ? '#9333ea' : STATUS_BORDER[status]}`,
        borderRadius: 14,
        minWidth: 220,
        boxShadow: STATUS_GLOW[status],
        transition: 'all 0.3s',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{
        background: status === 'running' ? '#1e3a5f' : status === 'completed' ? '#14532d' : status === 'error' ? '#450a0a' : '#1f2937',
        borderRadius: '12px 12px 0 0',
        padding: '10px 14px',
        borderBottom: '1px solid #374151',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: STATUS_BORDER[status],
            boxShadow: status === 'running' ? '0 0 8px #3b82f6' : 'none',
          }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{data.label}</span>
        </div>
        <div style={{ color: '#6b7280', fontSize: 10, marginTop: 2 }}>{data.skillId}</div>
        {data.duration && (
          <div style={{ color: '#22c55e', fontSize: 10 }}>✓ {data.duration}ms</div>
        )}
        {status === 'running' && (
          <div style={{ color: '#60a5fa', fontSize: 10 }}>⟳ ejecutando...</div>
        )}
      </div>

      {/* Ports */}
      <div style={{ display: 'flex', padding: '10px 0' }}>
        {/* Inputs */}
        <div style={{ flex: 1, paddingLeft: 0 }}>
          {inputs.map((inp: any, i: number) => (
            <div key={i} style={{ position: 'relative', marginBottom: 6, paddingLeft: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Handle
                type="target"
                position={Position.Left}
                id={`in-${inp.nombre}`}
                style={{
                  background: PORT_COLORS[inp.tipo] || '#6b7280',
                  width: 10, height: 10,
                  left: -6,
                  border: '2px solid #111827',
                }}
              />
              <span style={{ color: PORT_COLORS[inp.tipo] || '#6b7280', fontSize: 9, fontFamily: 'monospace' }}>
                {inp.tipo}
              </span>
              <span style={{ color: '#d1d5db', fontSize: 10 }}>{inp.nombre}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#374151', margin: '0 8px' }} />

        {/* Outputs */}
        <div style={{ flex: 1, paddingRight: 0 }}>
          {outputs.map((out: any, i: number) => (
            <div key={i} style={{ position: 'relative', marginBottom: 6, paddingRight: 14, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <span style={{ color: '#d1d5db', fontSize: 10 }}>{out.nombre}</span>
              <span style={{ color: PORT_COLORS[out.tipo] || '#6b7280', fontSize: 9, fontFamily: 'monospace' }}>
                {out.tipo}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={`out-${out.nombre}`}
                style={{
                  background: PORT_COLORS[out.tipo] || '#6b7280',
                  width: 10, height: 10,
                  right: -6,
                  border: '2px solid #111827',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
