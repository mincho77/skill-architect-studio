'use client';

import { useState } from 'react';
import { Plus, Trash2, Wand2, Save } from 'lucide-react';

const PORT_TYPES = ['String', 'JSON', 'Number', 'Boolean', 'File', 'Array<string>'];

interface Port {
  id: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
}

interface SkillDraft {
  id: string;
  nombre: string;
  descripcion: string;
  inputs: Port[];
  outputs: Port[];
}

export default function SkillBuilder() {
  const [skill, setSkill] = useState<SkillDraft>({
    id: `skill-${Date.now()}`,
    nombre: '',
    descripcion: '',
    inputs: [],
    outputs: [],
  });

  const [aiSuggestions, setAiSuggestions] = useState<SkillDraft | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleAddInput = () => {
    setSkill(prev => ({
      ...prev,
      inputs: [...prev.inputs, {
        id: `input-${Date.now()}`,
        nombre: `input_${prev.inputs.length + 1}`,
        tipo: 'String',
        descripcion: '',
      }],
    }));
  };

  const handleAddOutput = () => {
    setSkill(prev => ({
      ...prev,
      outputs: [...prev.outputs, {
        id: `output-${Date.now()}`,
        nombre: `output_${prev.outputs.length + 1}`,
        tipo: 'String',
        descripcion: '',
      }],
    }));
  };

  const handleRemoveInput = (id: string) => {
    setSkill(prev => ({
      ...prev,
      inputs: prev.inputs.filter(i => i.id !== id),
    }));
  };

  const handleRemoveOutput = (id: string) => {
    setSkill(prev => ({
      ...prev,
      outputs: prev.outputs.filter(o => o.id !== id),
    }));
  };

  const handleUpdateInput = (id: string, field: string, value: string) => {
    setSkill(prev => ({
      ...prev,
      inputs: prev.inputs.map(i => i.id === id ? { ...i, [field]: value } : i),
    }));
  };

  const handleUpdateOutput = (id: string, field: string, value: string) => {
    setSkill(prev => ({
      ...prev,
      outputs: prev.outputs.map(o => o.id === id ? { ...o, [field]: value } : o),
    }));
  };

  const suggestWithAI = async () => {
    if (!skill.nombre || !skill.descripcion) {
      alert('Especifica nombre y descripción primero');
      return;
    }

    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/suggest-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: skill.nombre,
          descripcion: skill.descripcion,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data);
    } catch (e) {
      console.error('AI suggestion failed:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  const applyAISuggestions = () => {
    if (aiSuggestions) {
      setSkill(aiSuggestions);
      setAiSuggestions(null);
    }
  };

  const mergeAISuggestions = () => {
    if (aiSuggestions) {
      setSkill(prev => ({
        ...prev,
        inputs: [...prev.inputs, ...aiSuggestions.inputs.filter(
          ai => !prev.inputs.some(p => p.nombre === ai.nombre)
        )],
        outputs: [...prev.outputs, ...aiSuggestions.outputs.filter(
          ai => !prev.outputs.some(p => p.nombre === ai.nombre)
        )],
      }));
      setAiSuggestions(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '20px', background: '#0f172a', minHeight: '100vh', color: '#e5e7eb' }}>
      {/* Left Panel - Inputs */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>ENTRADAS (Inputs)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {skill.inputs.map((inp) => (
            <div
              key={inp.id}
              style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inp.nombre}
                  onChange={(e) => handleUpdateInput(inp.id, 'nombre', e.target.value)}
                  placeholder="Nombre"
                  style={{
                    flex: 1,
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <select
                  value={inp.tipo}
                  onChange={(e) => handleUpdateInput(inp.id, 'tipo', e.target.value)}
                  style={{
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#e5e7eb',
                    fontSize: '12px',
                  }}
                >
                  {PORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => handleRemoveInput(inp.id)}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <textarea
                value={inp.descripcion || ''}
                onChange={(e) => handleUpdateInput(inp.id, 'descripcion', e.target.value)}
                placeholder="Descripción (opcional)"
                style={{
                  background: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  padding: '6px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  minHeight: '40px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleAddInput}
          style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            padding: '8px',
            cursor: 'pointer',
            color: '#e5e7eb',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Plus size={12} /> Agregar Entrada
        </button>
      </div>

      {/* Center Panel - Skill Definition */}
      <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>Nombre Skill</label>
          <input
            type="text"
            value={skill.nombre}
            onChange={(e) => setSkill({ ...skill, nombre: e.target.value })}
            placeholder="ej: Text to Workflow"
            style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '6px',
              padding: '8px',
              color: '#e5e7eb',
              fontSize: '12px',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>Descripción</label>
          <textarea
            value={skill.descripcion}
            onChange={(e) => setSkill({ ...skill, descripcion: e.target.value })}
            placeholder="Describe qué hace este skill..."
            style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '6px',
              padding: '8px',
              color: '#e5e7eb',
              fontSize: '12px',
              minHeight: '80px',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          onClick={suggestWithAI}
          disabled={loadingAI}
          style={{
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '6px',
            padding: '8px',
            cursor: loadingAI ? 'not-allowed' : 'pointer',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            opacity: loadingAI ? 0.5 : 1,
          }}
        >
          <Wand2 size={12} /> {loadingAI ? 'Analizando...' : 'Sugerir Inputs/Outputs con IA'}
        </button>

        {aiSuggestions && (
          <div style={{ background: '#1f2937', border: '1px solid #6366f1', borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#6366f1' }}>
              Sugerencias IA:
            </div>
            <div style={{ fontSize: '11px', marginBottom: '8px', color: '#d1d5db' }}>
              <strong>Inputs:</strong> {aiSuggestions.inputs.map(i => `${i.nombre}(${i.tipo})`).join(', ')}
            </div>
            <div style={{ fontSize: '11px', marginBottom: '12px', color: '#d1d5db' }}>
              <strong>Outputs:</strong> {aiSuggestions.outputs.map(o => `${o.nombre}(${o.tipo})`).join(', ')}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={applyAISuggestions}
                style={{
                  flex: 1,
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                Aplicar
              </button>
              <button
                onClick={mergeAISuggestions}
                style={{
                  flex: 1,
                  background: '#4b5563',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#e5e7eb',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                Combinar
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>Refinar con Prompt</label>
          <textarea
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="ej: Agregar validación de datos... Cambiar el output a array... etc"
            style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '6px',
              padding: '8px',
              color: '#e5e7eb',
              fontSize: '12px',
              minHeight: '60px',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
          <button
            style={{
              background: '#f97316',
              border: 'none',
              borderRadius: '6px',
              padding: '8px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Refinar
          </button>
        </div>
      </div>

      {/* Right Panel - Outputs */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>SALIDAS (Outputs)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {skill.outputs.map((out) => (
            <div
              key={out.id}
              style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={out.nombre}
                  onChange={(e) => handleUpdateOutput(out.id, 'nombre', e.target.value)}
                  placeholder="Nombre"
                  style={{
                    flex: 1,
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <select
                  value={out.tipo}
                  onChange={(e) => handleUpdateOutput(out.id, 'tipo', e.target.value)}
                  style={{
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#e5e7eb',
                    fontSize: '12px',
                  }}
                >
                  {PORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => handleRemoveOutput(out.id)}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <textarea
                value={out.descripcion || ''}
                onChange={(e) => handleUpdateOutput(out.id, 'descripcion', e.target.value)}
                placeholder="Descripción (opcional)"
                style={{
                  background: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  padding: '6px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  minHeight: '40px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleAddOutput}
          style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            padding: '8px',
            cursor: 'pointer',
            color: '#e5e7eb',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Plus size={12} /> Agregar Salida
        </button>

        <button
          style={{
            background: '#10b981',
            border: 'none',
            borderRadius: '6px',
            padding: '10px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Save size={14} /> Guardar Skill
        </button>
      </div>
    </div>
  );
}
