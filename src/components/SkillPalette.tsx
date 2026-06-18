'use client';

import { useState } from 'react';
import { Package, ChevronRight, ChevronLeft } from 'lucide-react';

const AVAILABLE_SKILLS = [
  {
    id: 'text-to-workflow',
    label: 'Text → Workflow',
    icon: '📝',
    inputs: [{ nombre: 'texto', tipo: 'String' }],
    outputs: [{ nombre: 'workflow', tipo: 'JSON' }],
  },
  {
    id: 'workflow-to-mermaid',
    label: 'Workflow → Mermaid',
    icon: '📊',
    inputs: [{ nombre: 'workflow', tipo: 'JSON' }],
    outputs: [{ nombre: 'mermaid', tipo: 'String' }],
  },
  {
    id: 'mermaid-to-svg',
    label: 'Mermaid → SVG',
    icon: '🎨',
    inputs: [{ nombre: 'mermaid', tipo: 'String' }],
    outputs: [{ nombre: 'svg', tipo: 'String' }],
  },
];

interface SkillPaletteProps {
  onDragStart: (skillId: string, event: React.DragEvent) => void;
}

export default function SkillPalette({ onDragStart }: SkillPaletteProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          left: '16px',
          top: '70px',
          width: '32px',
          height: '32px',
          background: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e5e7eb',
          zIndex: 101,
        }}
        title={isOpen ? 'Cerrar paleta' : 'Abrir paleta'}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            left: '60px',
            top: '70px',
            width: '220px',
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '12px',
            padding: '12px',
            zIndex: 100,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          color: '#e5e7eb',
        }}
      >
        <Package size={14} />
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Skills</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {AVAILABLE_SKILLS.map((skill) => (
          <div
            key={skill.id}
            draggable
            onDragStart={(e) => onDragStart(skill.id, e)}
            style={{
              padding: '10px',
              background: '#1f2937',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              cursor: 'grab',
              fontSize: '12px',
              color: '#d1d5db',
              transition: 'all 0.2s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#374151';
              (e.currentTarget as HTMLElement).style.borderColor = '#6b7280';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#1f2937';
              (e.currentTarget as HTMLElement).style.borderColor = '#4b5563';
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {skill.label}
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
              Input: {skill.inputs[0]?.tipo} | Output: {skill.outputs[0]?.tipo}
            </div>
          </div>
        ))}
      </div>
    </div>
      )}
    </>
  );
}
