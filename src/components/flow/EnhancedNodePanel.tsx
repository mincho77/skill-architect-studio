// FILE: src/components/flow/EnhancedNodePanel.tsx
// Componente mejorado para inputs/outputs con:
// - Puntos de conexión draggables
// - Colores diferenciados (azul entrada, verde salida, naranja archivo)
// - Mejor visualización de textos largos
// - Selector de ruta para outputs

'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface Port {
  nombre: string;
  tipo: string;
  descripcion?: string;
  requerido?: boolean;
  valor?: any;
  isFile?: boolean;
}

interface EnhancedNodePanelProps {
  nodeId: string;
  title: string;
  inputs: Port[];
  outputs: Port[];
  onInputChange?: (portName: string, value: any) => void;
  onOutputPathChange?: (portName: string, path: string) => void;
}

const getPortColor = (tipo: string, isInput: boolean, isFile: boolean): string => {
  if (isFile) return '#FF9F43'; // Naranja para archivos
  if (isInput) return '#3B82F6'; // Azul para entradas
  return '#10B981'; // Verde para salidas
};

const PortHandle: React.FC<{
  portName: string;
  tipo: string;
  isInput: boolean;
  isFile?: boolean;
  position: Position;
}> = ({ portName, tipo, isInput, isFile = false, position }) => {
  const color = getPortColor(tipo, isInput, isFile);

  return (
    <Handle
      type={isInput ? 'target' : 'source'}
      position={position}
      id={`${isInput ? 'in' : 'out'}-${portName}`}
      style={{
        background: color,
        width: 12,
        height: 12,
        border: '2px solid white',
        boxShadow: `0 0 8px ${color}40`,
      }}
    />
  );
};

export const EnhancedNodePanel: React.FC<EnhancedNodePanelProps> = ({
  nodeId,
  title,
  inputs,
  outputs,
  onInputChange,
  onOutputPathChange,
}) => {
  const [expandedInputs, setExpandedInputs] = useState<Set<string>>(new Set());
  const [outputPaths, setOutputPaths] = useState<Record<string, string>>({});

  const toggleInputExpand = (portName: string) => {
    const newExpanded = new Set(expandedInputs);
    if (newExpanded.has(portName)) {
      newExpanded.delete(portName);
    } else {
      newExpanded.add(portName);
    }
    setExpandedInputs(newExpanded);
  };

  const handlePathChange = (portName: string, newPath: string) => {
    setOutputPaths({ ...outputPaths, [portName]: newPath });
    onOutputPathChange?.(portName, newPath);
  };

  return (
    <div className="bg-darker border border-border-dark rounded-lg p-4 text-white">
      <h3 className="text-sm font-bold mb-3 text-slate-100">{title}</h3>

      {/* INPUTS */}
      {inputs.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            ENTRADAS ({inputs.length})
          </p>

          <div className="space-y-2">
            {inputs.map((input) => (
              <div
                key={input.nombre}
                className="relative bg-blue-900/20 border border-blue-600/30 rounded-lg p-2 pl-8 hover:bg-blue-900/30 transition-colors group"
              >
                {/* Handle draggable */}
                <PortHandle
                  portName={input.nombre}
                  tipo={input.tipo}
                  isInput={true}
                  position={Position.Left}
                />

                {/* Contenido del input */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {input.nombre}
                    </p>
                    <p className="text-[10px] text-slate-400">{input.tipo}</p>
                    {input.descripcion && (
                      <p
                        className="text-[9px] text-slate-500 mt-1 cursor-help line-clamp-2 hover:line-clamp-none"
                        title={input.descripcion}
                      >
                        {input.descripcion}
                      </p>
                    )}
                  </div>
                  {input.requerido && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 flex-shrink-0">
                      Requerido
                    </span>
                  )}
                </div>

                {/* File input o text input */}
                {input.tipo === 'File' ? (
                  <input
                    type="file"
                    onChange={(e) => onInputChange?.(input.nombre, e.target.files?.[0])}
                    className="mt-2 w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-500/20 file:text-blue-200 hover:file:bg-blue-500/30 cursor-pointer"
                  />
                ) : (
                  <>
                    {input.valor !== undefined && (
                      <button
                        onClick={() => toggleInputExpand(input.nombre)}
                        className="mt-1 text-[10px] text-blue-300 hover:text-blue-200 transition-colors"
                      >
                        {expandedInputs.has(input.nombre) ? '▼ Colapsar' : '▶ Expandir'}
                      </button>
                    )}

                    {expandedInputs.has(input.nombre) && input.valor !== undefined && (
                      <textarea
                        value={input.valor}
                        onChange={(e) => onInputChange?.(input.nombre, e.target.value)}
                        className="mt-2 w-full h-20 bg-darker border border-blue-500/30 rounded text-xs p-2 text-white font-mono resize-none focus:outline-none focus:border-blue-500"
                        placeholder={`Ingresa ${input.nombre}...`}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OUTPUTS */}
      {outputs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            SALIDAS ({outputs.length})
          </p>

          <div className="space-y-2">
            {outputs.map((output) => {
              const isFile = output.tipo === 'File' || output.isFile;
              const fileColor = isFile ? 'bg-orange-900/20 border-orange-600/30 hover:bg-orange-900/30' : 'bg-green-900/20 border-green-600/30 hover:bg-green-900/30';

              return (
                <div
                  key={output.nombre}
                  className={`relative ${fileColor} border rounded-lg p-2 pl-8 transition-colors group`}
                >
                  {/* Handle draggable */}
                  <PortHandle
                    portName={output.nombre}
                    tipo={output.tipo}
                    isInput={false}
                    isFile={isFile}
                    position={Position.Right}
                  />

                  {/* Contenido del output */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium text-white truncate">
                          {output.nombre}
                        </p>
                        {isFile && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-orange-500/20 text-orange-300 flex-shrink-0">
                            📁 Archivo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{output.tipo}</p>
                      {output.descripcion && (
                        <p
                          className="text-[9px] text-slate-500 mt-1 cursor-help line-clamp-2 hover:line-clamp-none"
                          title={output.descripcion}
                        >
                          {output.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Selector de ruta para archivos */}
                  {isFile && (
                    <div className="mt-2 flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="/ruta/de/salida"
                        value={outputPaths[output.nombre] || ''}
                        onChange={(e) => handlePathChange(output.nombre, e.target.value)}
                        className="flex-1 bg-darker border border-orange-500/30 rounded text-[10px] px-2 py-1 text-white focus:outline-none focus:border-orange-500"
                      />
                      <button
                        onClick={() => {
                          // TODO: Abrir file picker
                          console.log('Abrir selector de ruta para', output.nombre);
                        }}
                        className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-[10px] text-orange-300 transition-colors"
                        title="Seleccionar ruta"
                      >
                        📂
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNodePanel;
