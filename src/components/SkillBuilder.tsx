'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Wand2, Save, ArrowLeft, X, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

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

const PortInput = ({ port, onUpdate, onRemove, isInput, isNew }: any) => (
  <div style={{
    background: isNew ? '#1f4d3b' : '#1f2937',
    border: isNew ? '2px solid #10b981' : '1px solid #374151',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.3s',
    boxShadow: isNew ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
  }}>
    <div style={{ display: 'flex', gap: '6px' }}>
      <input
        type="text"
        value={port.nombre}
        onChange={(e) => onUpdate(port.id, 'nombre', e.target.value)}
        placeholder="Nombre"
        style={{
          flex: 1,
          background: '#111827',
          border: '1px solid #374151',
          borderRadius: '4px',
          padding: '8px',
          color: '#e5e7eb',
          fontSize: '12px',
        }}
      />
      <select
        value={port.tipo}
        onChange={(e) => onUpdate(port.id, 'tipo', e.target.value)}
        style={{
          background: '#111827',
          border: '1px solid #374151',
          borderRadius: '4px',
          padding: '8px',
          color: '#e5e7eb',
          fontSize: '12px',
        }}
      >
        {PORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button
        onClick={() => onRemove(port.id)}
        style={{
          background: '#ef4444',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
    <textarea
      value={port.descripcion || ''}
      onChange={(e) => onUpdate(port.id, 'descripcion', e.target.value)}
      placeholder="Descripción (opcional)"
      style={{
        background: '#111827',
        border: '1px solid #374151',
        borderRadius: '4px',
        padding: '8px',
        color: '#e5e7eb',
        fontSize: '11px',
        minHeight: '50px',
        fontFamily: 'monospace',
        resize: 'vertical',
      }}
    />
  </div>
);

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
  const [saving, setSaving] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [newPortIds, setNewPortIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const inputsRef = React.useRef<HTMLDivElement>(null);
  const outputsRef = React.useRef<HTMLDivElement>(null);

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
      setNewPortIds(new Set([
        ...aiSuggestions.inputs.map(i => i.id),
        ...aiSuggestions.outputs.map(o => o.id),
      ]));
      setAiSuggestions(null);
      setMessage({ type: 'success', text: 'Sugerencias aplicadas' });
      setTimeout(() => setMessage(null), 3000);

      setTimeout(() => {
        inputsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSave = async () => {
    if (!skill.nombre.trim()) {
      setMessage({ type: 'error', text: 'Nombre del skill requerido' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/skills/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Skill guardado en skill_db/skills/${data.folderName}/` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const mergeAISuggestions = () => {
    if (aiSuggestions) {
      const newInputs = aiSuggestions.inputs.filter(
        ai => !skill.inputs.some(p => p.nombre === ai.nombre)
      );
      const newOutputs = aiSuggestions.outputs.filter(
        ai => !skill.outputs.some(p => p.nombre === ai.nombre)
      );

      setSkill(prev => ({
        ...prev,
        inputs: [...prev.inputs, ...newInputs],
        outputs: [...prev.outputs, ...newOutputs],
      }));

      setNewPortIds(new Set([
        ...newInputs.map(i => i.id),
        ...newOutputs.map(o => o.id),
      ]));

      setAiSuggestions(null);
      setMessage({ type: 'success', text: `Agregados ${newInputs.length} inputs y ${newOutputs.length} outputs` });
      setTimeout(() => setMessage(null), 3000);

      setTimeout(() => {
        inputsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#e5e7eb' }}>
      {/* Toast Message */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: message.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <CheckCircle size={16} />
          {message.text}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid #374151', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#374151', borderRadius: '8px', color: '#e5e7eb', cursor: 'pointer', textDecoration: 'none', border: 'none', hover: { background: '#4b5563' } }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Crear Skill</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Diseña inputs, outputs y comportamiento</p>
          </div>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#374151', borderRadius: '8px', color: '#e5e7eb', cursor: 'pointer', textDecoration: 'none', border: 'none' }}>
          <X size={18} />
        </Link>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '24px', padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>

        {/* Left: Inputs */}
        <div ref={inputsRef}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>Entradas</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{skill.inputs.length} puerto{skill.inputs.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {skill.inputs.map((inp) => (
              <PortInput key={inp.id} port={inp} onUpdate={handleUpdateInput} onRemove={handleRemoveInput} isInput={true} isNew={newPortIds.has(inp.id)} />
            ))}
          </div>
          <button
            onClick={handleAddInput}
            style={{
              width: '100%',
              background: '#374151',
              border: '1px dashed #4b5563',
              borderRadius: '6px',
              padding: '10px',
              cursor: 'pointer',
              color: '#e5e7eb',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#4b5563';
              (e.currentTarget as HTMLElement).style.borderColor = '#6b7280';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#374151';
              (e.currentTarget as HTMLElement).style.borderColor = '#4b5563';
            }}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {/* Center: Definition */}
        <div>
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Nombre */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Nombre del Skill</label>
              <input
                type="text"
                value={skill.nombre}
                onChange={(e) => setSkill({ ...skill, nombre: e.target.value })}
                placeholder="ej: Text to Workflow"
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#e5e7eb',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Descripción</label>
              <textarea
                value={skill.descripcion}
                onChange={(e) => setSkill({ ...skill, descripcion: e.target.value })}
                placeholder="Describe qué hace este skill..."
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#e5e7eb',
                  fontSize: '13px',
                  minHeight: '100px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Sugerir con IA */}
            <button
              onClick={suggestWithAI}
              disabled={loadingAI}
              style={{
                background: '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: loadingAI ? 'not-allowed' : 'pointer',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: loadingAI ? 0.6 : 1,
              }}
            >
              <Wand2 size={14} /> {loadingAI ? 'Analizando...' : 'Sugerir con IA'}
            </button>

            {/* AI Suggestions */}
            {aiSuggestions && (
              <div style={{ background: '#1f2937', border: '1px solid #6366f1', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> Sugerencias</div>
                <div style={{ fontSize: '11px', marginBottom: '8px', color: '#d1d5db' }}>
                  <strong>Inputs:</strong> {aiSuggestions.inputs.map(i => `${i.nombre}`).join(', ')}
                </div>
                <div style={{ fontSize: '11px', marginBottom: '12px', color: '#d1d5db' }}>
                  <strong>Outputs:</strong> {aiSuggestions.outputs.map(o => `${o.nombre}`).join(', ')}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={applyAISuggestions}
                    style={{
                      flex: 1,
                      background: '#6366f1',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px',
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
                      padding: '8px',
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

            {/* Refinamiento */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Refinar (Opcional)</label>
              <textarea
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="ej: Agregar validación... Cambiar output..."
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  minHeight: '70px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <button
                style={{
                  width: '100%',
                  background: '#f97316',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginTop: '8px',
                }}
              >
                Refinar
              </button>
            </div>

            {/* Guardar */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                background: saving ? '#065f46' : '#10b981',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Skill'}
            </button>

            {/* Estructura generada */}
            <div style={{ background: '#0f172a', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
              <div style={{ color: '#94a3b8', marginBottom: '6px', fontSize: '10px', fontWeight: 'bold' }}>ESTRUCTURA GENERADA</div>
              <div style={{ color: '#fbbf24' }}>{skill.nombre ? skill.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'mi-skill'}/</div>
              <div style={{ paddingLeft: '12px' }}>
                <div>├── <span style={{ color: '#10b981' }}>SKILL.md</span> <span style={{ color: '#374151' }}># el cerebro del skill</span></div>
                <div>├── <span style={{ color: '#6366f1' }}>reference/</span> <span style={{ color: '#374151' }}># conocimiento de apoyo</span></div>
                <div>├── <span style={{ color: '#f97316' }}>scripts/</span> <span style={{ color: '#374151' }}># código ejecutable</span></div>
                <div>└── <span style={{ color: '#8b5cf6' }}>assets/</span> <span style={{ color: '#374151' }}># fuentes, íconos, plantillas</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Outputs */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>Salidas</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{skill.outputs.length} puerto{skill.outputs.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {skill.outputs.map((out) => (
              <PortInput key={out.id} port={out} onUpdate={handleUpdateOutput} onRemove={handleRemoveOutput} isInput={false} isNew={newPortIds.has(out.id)} />
            ))}
          </div>
          <button
            onClick={handleAddOutput}
            style={{
              width: '100%',
              background: '#374151',
              border: '1px dashed #4b5563',
              borderRadius: '6px',
              padding: '10px',
              cursor: 'pointer',
              color: '#e5e7eb',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#4b5563';
              (e.currentTarget as HTMLElement).style.borderColor = '#6b7280';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#374151';
              (e.currentTarget as HTMLElement).style.borderColor = '#4b5563';
            }}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

      </div>
    </div>
  );
}
