'use client';

import { FlowDefinition, FlowNode } from '../../src/lib/schemas';
import React, { useState } from 'react';

interface NodeInspectorProps {
  node: FlowNode | null;
  flow: FlowDefinition;
  skill: any; // SkillDefinition
  onConnect?: (fromNode: string, fromPort: string, toNode: string, toPort: string) => void;
}

export default function NodeInspector({ node, flow, skill, onConnect }: NodeInspectorProps) {
  const [selectedTab, setSelectedTab] = useState<'inputs' | 'outputs' | 'execution'>('inputs');

  if (!node || !skill) {
    return (
      <div className="p-4 border-l border-gray-200 bg-gray-50 h-full">
        <p className="text-gray-500">Selecciona un nodo para inspeccionar</p>
      </div>
    );
  }

  // Encontrar nodos upstream (sin arista directa hacia este nodo)
  const upstreamNodes = flow.nodes.filter((n) => {
    const hasPathTo = flow.connections.some(
      (c) => c.from.node === n.instance_id && c.to.node === node.instance_id
    );
    return !hasPathTo && n.instance_id !== node.instance_id;
  });

  return (
    <div className="p-4 border-l border-gray-200 bg-white h-full overflow-y-auto">
      <h2 className="font-bold mb-4">{node.label}</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {['inputs', 'outputs', 'execution'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-3 py-2 text-sm ${
              selectedTab === tab ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* INPUTS TAB */}
      {selectedTab === 'inputs' && (
        <div className="space-y-3">
          {skill.inputs?.map((input: any) => (
            <div key={input.nombre} className="border-l-2 border-blue-300 pl-3 pb-3">
              <div className="font-semibold text-sm">{input.nombre}</div>
              <div className="text-xs text-gray-500">{input.tipo}</div>

              {/* Dropdown: conectar desde upstream */}
              <select
                className="mt-2 text-xs border rounded px-2 py-1 w-full"
                onChange={(e) => {
                  if (e.target.value) {
                    const [fromNode, fromPort] = e.target.value.split('::');
                    onConnect?.(fromNode, fromPort, node.instance_id, input.nombre);
                  }
                }}
              >
                <option value="">Conectar desde...</option>
                {upstreamNodes.map((upNode) => {
                  const upSkill = flow.nodes.find((n) => n.instance_id === upNode.instance_id)?.skill_id;
                  return (
                    <optgroup key={upNode.instance_id} label={upNode.label}>
                      {/* TODO: listar outputs del upNode */}
                      <option value={`${upNode.instance_id}::output1`}>output1 (tipo)</option>
                    </optgroup>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* OUTPUTS TAB */}
      {selectedTab === 'outputs' && (
        <div className="space-y-3">
          {skill.outputs?.map((output: any) => (
            <div key={output.nombre} className="border-l-2 border-green-300 pl-3 pb-3">
              <div className="font-semibold text-sm">{output.nombre}</div>
              <div className="text-xs text-gray-500">{output.tipo}</div>
              <label className="mt-2 flex items-center gap-2 text-xs">
                <input type="checkbox" defaultChecked={false} />
                Exponer como output del flow
              </label>
            </div>
          ))}
        </div>
      )}

      {/* EXECUTION TAB */}
      {selectedTab === 'execution' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold">On Error</label>
            <select className="mt-1 text-xs border rounded px-2 py-1 w-full">
              <option>fail</option>
              <option>continue</option>
              <option>retry</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold">Max Retries</label>
            <input type="number" defaultValue="0" className="mt-1 text-xs border rounded px-2 py-1 w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
