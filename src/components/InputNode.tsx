'use client';

import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus, Trash2, Play } from 'lucide-react';

const PORT_COLORS: Record<string, string> = {
  String: '#6366f1',
  Number: '#eab308',
  Boolean: '#22c55e',
  JSON: '#3b82f6',
  File: '#ef4444',
};

const PORT_TYPES = ['String', 'Number', 'Boolean', 'JSON', 'File', 'Object'];

export default function InputNode({ data, isConnectable = true }: { data: any; isConnectable?: boolean }) {
  const [inputs, setInputs] = useState((data.inputs || [{ nombre: 'input_1', tipo: 'String', valor: '' }]).map((inp: any) => ({
    ...inp,
    valor: inp.valor ?? ''
  })));
  const [expanded, setExpanded] = useState(true);
  const onExecute = data?.onExecute;
  const nodeId = data?.id;

  const handleAddInput = () => {
    setInputs([...inputs, { nombre: `input_${inputs.length + 1}`, tipo: 'String', valor: '' }]);
  };

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_: any, i: number) => i !== index));
  };

  const handleUpdateInput = (index: number, field: string, value: any) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
    data.inputs = newInputs;
  };

  return (
    <div
      style={{
        background: '#111827',
        border: '2px solid #8b5cf6',
        borderRadius: 14,
        minWidth: 320,
        boxShadow: '0 0 20px #8b5cf655',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#3f1f7f',
          borderRadius: '12px 12px 0 0',
          padding: '10px 14px',
          borderBottom: '1px solid #374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>Inputs</div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {onExecute && (
            <button
              onClick={() => onExecute(nodeId)}
              style={{
                background: '#10b981',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 6px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 11,
                fontWeight: 'bold',
              }}
              title="Ejecutar desde este input"
            >
              <Play size={12} /> Test
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {expanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Inputs Editor */}
      {expanded && (
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inputs.map((inp: any, i: number) => (
              <div
                key={i}
                style={{
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '8px',
                  paddingRight: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                {/* Output Handle */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`input-${inp.nombre}`}
                  isConnectable={isConnectable}
                  style={{
                    background: PORT_COLORS[inp.tipo] || '#6b7280',
                    width: 10,
                    height: 10,
                    right: 8,
                    border: '2px solid #111827',
                  }}
                />

                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    value={inp.nombre}
                    onChange={(e) => handleUpdateInput(i, 'nombre', e.target.value)}
                    placeholder="Nombre"
                    style={{
                      flex: 1,
                      background: '#111827',
                      border: '1px solid #4b5563',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      color: '#e5e7eb',
                      fontSize: '11px',
                    }}
                  />
                  <select
                    value={inp.tipo}
                    onChange={(e) => handleUpdateInput(i, 'tipo', e.target.value)}
                    style={{
                      background: '#111827',
                      border: '1px solid #4b5563',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      color: '#e5e7eb',
                      fontSize: '11px',
                    }}
                  >
                    {PORT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveInput(i)}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Value input based on type */}
                {inp.tipo === 'File' ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const base64 = ev.target?.result as string;
                          handleUpdateInput(i, 'valor', { file, name: file.name, type: file.type, base64 });
                        };
                        reader.readAsDataURL(file);
                      }}
                      style={{ fontSize: '10px', color: '#6b7280' }}
                    />
                    {inp.valor?.name && (
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                        {inp.valor.base64 ? '✓' : '...'} {inp.valor.name}
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    type={inp.tipo === 'Number' ? 'number' : 'text'}
                    value={inp.valor || ''}
                    onChange={(e) => handleUpdateInput(i, 'valor', e.target.value)}
                    placeholder={`Valor ${inp.tipo.toLowerCase()}`}
                    style={{
                      background: '#111827',
                      border: '1px solid #4b5563',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      color: '#e5e7eb',
                      fontSize: '11px',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={handleAddInput}
            style={{
              width: '100%',
              marginTop: '8px',
              background: '#374151',
              border: '1px dashed #4b5563',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              color: '#e5e7eb',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Plus size={12} /> Agregar
          </button>
        </div>
      )}

      {/* Ports (collapsed view) */}
      {!expanded && (
        <div style={{ padding: '8px 0', paddingRight: 14 }}>
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
                isConnectable={isConnectable}
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
      )}
    </div>
  );
}
