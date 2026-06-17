// FILE: src/components/EnhancedInputPanel.tsx
// Panel de entradas mejorado con:
// - Punto de conexión draggable
// - Textos largos visibles y expandibles
// - Mejor UX para inputs

'use client';

import React, { useState } from 'react';

interface InputDefinition {
  nombre: string;
  tipo: string;
  requerido?: boolean;
  descripcion?: string;
  valor?: string;
}

interface EnhancedInputPanelProps {
  inputs: InputDefinition[];
  onInputChange?: (nombre: string, valor: string) => void;
  onExecute?: () => void;
  isExecuting?: boolean;
}

export const EnhancedInputPanel: React.FC<EnhancedInputPanelProps> = ({
  inputs,
  onInputChange,
  onExecute,
  isExecuting = false,
}) => {
  const [expandedTexts, setExpandedTexts] = useState<Set<string>>(new Set());

  const toggleExpand = (nombre: string) => {
    const newSet = new Set(expandedTexts);
    if (newSet.has(nombre)) {
      newSet.delete(nombre);
    } else {
      newSet.add(nombre);
    }
    setExpandedTexts(newSet);
  };

  return (
    <div className="bg-panel border border-border-dark rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
          <h2 className="text-sm font-bold text-white">Inputs de Entrada</h2>
        </div>
        <button
          onClick={() => setExpandedTexts(new Set())}
          className="text-[10px] text-slate-400 hover:text-slate-300 transition-colors"
          title="Colapsar todo"
        >
          ⊖
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {inputs.map((input) => (
          <div
            key={input.nombre}
            className="relative bg-blue-900/20 border border-blue-600/40 rounded-lg p-3 hover:border-blue-500/60 transition-all group"
          >
            {/* Punto de conexión visual */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 border-2 border-white shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform"></div>

            {/* Encabezado del input */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-white">
                    {input.nombre}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200">
                    {input.tipo}
                  </span>
                  {input.requerido && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-200">
                      Req
                    </span>
                  )}
                </div>
                {input.descripcion && (
                  <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                    {input.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Textarea con expand */}
            <div className="bg-darker border border-blue-500/20 rounded-lg overflow-hidden">
              <textarea
                value={input.valor || ''}
                onChange={(e) => onInputChange?.(input.nombre, e.target.value)}
                className={`w-full bg-darker text-white text-xs p-2 font-mono focus:outline-none focus:border-blue-500 resize-none border-0 ${
                  expandedTexts.has(input.nombre) ? 'h-32' : 'h-16'
                } transition-all`}
                placeholder={`Ingresa ${input.nombre}...`}
                spellCheck="false"
              />
            </div>

            {/* Botón expand/collapse */}
            {input.valor && (
              <button
                onClick={() => toggleExpand(input.nombre)}
                className="mt-1 text-[10px] text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1"
              >
                {expandedTexts.has(input.nombre) ? (
                  <>
                    <span>⬆ Colapsar</span>
                  </>
                ) : (
                  <>
                    <span>⬇ Expandir</span>
                    <span className="text-slate-500">
                      ({(input.valor || '').split('\n').length} líneas)
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botón ejecutar */}
      {onExecute && (
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-bold text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all"
        >
          {isExecuting ? '⏳ Ejecutando...' : '▶ Ejecutar con estos inputs'}
        </button>
      )}
    </div>
  );
};

export default EnhancedInputPanel;
