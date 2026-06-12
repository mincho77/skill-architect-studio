'use client';

import { Handle, Position } from '@xyflow/react';
import { FlowNode, SkillPort } from '../../src/lib/schemas';
import { PORT_COLORS } from '@/lib/portColors';
import React from 'react';

interface SkillNodeProps {
  data: {
    node: FlowNode;
    skill: any; // TODO: SkillDefinition
    onInputChange?: (inputName: string, value: unknown) => void;
  };
  isConnecting?: boolean;
  selected?: boolean;
}

export default function SkillNode({ data, selected }: SkillNodeProps) {
  const { node, skill } = data;

  if (!skill) {
    return (
      <div className="px-4 py-2 bg-red-100 border-2 border-red-500 rounded">
        <div className="font-bold text-red-700">⚠️ Skill no encontrado</div>
        <div className="text-sm text-red-600">{node.skill_id}</div>
      </div>
    );
  }

  return (
    <div
      className={`px-3 py-2 rounded border-2 ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
      } bg-white min-w-[200px]`}
    >
      {/* Header */}
      <div className="font-bold text-sm mb-2">{node.label || skill.name}</div>
      <div className="text-xs text-gray-500 mb-2">{skill.version}</div>

      {/* Inputs */}
      {skill.inputs?.map((input: SkillPort) => (
        <div key={input.nombre} className="flex items-center gap-2 mb-1">
          <Handle
            type="target"
            position={Position.Left}
            id={input.nombre}
            style={{
              background: PORT_COLORS[input.tipo],
              width: 8,
              height: 8,
            }}
          />
          <span className="text-xs">{input.nombre}</span>
          <span className="text-xs text-gray-400">({input.tipo})</span>
        </div>
      ))}

      {/* Outputs */}
      {skill.outputs?.map((output: SkillPort) => (
        <div key={output.nombre} className="flex items-center gap-2 mb-1 ml-auto justify-end">
          <span className="text-xs">{output.nombre}</span>
          <span className="text-xs text-gray-400">({output.tipo})</span>
          <Handle
            type="source"
            position={Position.Right}
            id={output.nombre}
            style={{
              background: PORT_COLORS[output.tipo],
              width: 8,
              height: 8,
            }}
          />
        </div>
      ))}
    </div>
  );
}
