'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowDefinition } from '../lib/schemas';
import NodePanel from './NodePanel';

const PORT_COLORS: Record<string, string> = {
  String: '#6366f1',
  Number: '#f59e0b',
  Boolean: '#10b981',
  JSON: '#3b82f6',
  File: '#ef4444',
  Folder: '#8b5cf6',
  'Array<string>': '#ec4899',
};

function SkillNodeComponent({ data, selected }: NodeProps) {
  const inputs = (data.inputs as any[]) || [];
  const outputs = (data.outputs as any[]) || [];

  return (
    <div className={`bg-gray-800 border-2 rounded-lg shadow-xl min-w-[200px] ${selected ? 'border-blue-400' : 'border-gray-600'}`}>
      <div className="bg-blue-700 text-white px-3 py-2 rounded-t-lg">
        <div className="font-bold text-sm">{data.label as string}</div>
        <div className="text-xs opacity-60">{data.skillId as string}</div>
      </div>
      <div className="px-2 py-2 flex gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          {inputs.map((inp: any) => (
            <div key={inp.nombre} className="relative flex items-center gap-1">
              <Handle
                type="target"
                position={Position.Left}
                id={inp.nombre}
                style={{ background: PORT_COLORS[inp.tipo] || '#6b7280', width: 10, height: 10, left: -14 }}
              />
              <span className="text-xs text-gray-300">{inp.nombre}</span>
              <span className="text-xs text-gray-500">({inp.tipo})</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 items-end flex-1">
          {outputs.map((out: any) => (
            <div key={out.nombre} className="relative flex items-center gap-1">
              <span className="text-xs text-gray-500">({out.tipo})</span>
              <span className="text-xs text-gray-300">{out.nombre}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={out.nombre}
                style={{ background: PORT_COLORS[out.tipo] || '#6b7280', width: 10, height: 10, right: -14 }}
              />
            </div>
          ))}
        </div>
      </div>
      {data.status && (
        <div className="px-3 pb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${data.status === 'existente' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {data.status as string}
          </span>
        </div>
      )}
    </div>
  );
}

const nodeTypes = { skillNode: SkillNodeComponent };

export default function FlowCanvas({ initialFlows }: { initialFlows: FlowDefinition[] }) {
  const [selectedFlowId, setSelectedFlowId] = useState(initialFlows[0]?.id || '');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [skills, setSkills] = useState<Record<string, any>>({});
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeValues, setNodeValues] = useState<Record<string, Record<string, any>>>({});

  const selectedFlow = initialFlows.find(f => f.id === selectedFlowId);

  useEffect(() => {
    fetch('/api/skills/list')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, any> = {};
        (data.skills || []).forEach((s: any) => { map[s.id] = s; });
        setSkills(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedFlow) return;
    setResult(null);
    setSelectedNode(null);

    const newNodes: Node[] = selectedFlow.nodes.map((n, i) => {
      const skill = skills[n.skill_id] || {};
      return {
        id: n.instance_id,
        type: 'skillNode',
        position: n.position || { x: 120 + i * 300, y: 200 },
        data: {
          label: n.label || n.skill_id,
          skillId: n.skill_id,
          inputs: skill.inputs || [],
          outputs: skill.outputs || [],
          status: skill.status || 'desconocido',
        },
      };
    });

    const newEdges: Edge[] = selectedFlow.connections.map(c => ({
      id: c.id,
      source: c.from.node,
      sourceHandle: c.from.port,
      target: c.to.node,
      targetHandle: c.to.port,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      label: `${c.from.port} → ${c.to.port}`,
      labelStyle: { fill: '#9ca3af', fontSize: 10 },
      labelBgStyle: { fill: '#1f2937' },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedFlowId, skills]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges(eds => addEdge({
      ...connection,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }, eds)),
    []
  );

  const handleExecute = async () => {
    if (!selectedFlow) return;
    setExecuting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/execute/${selectedFlow.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: nodeValues }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-3 flex items-center gap-4 border-b border-gray-700 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-blue-400">⚡ Skill Studio v2</h1>
          <p className="text-xs text-gray-400">Motor de orquestación puerto-a-puerto</p>
        </div>
        <div className="flex items-center gap-3 ml-6">
          <label className="text-sm text-gray-400">Flow:</label>
          <select
            value={selectedFlowId}
            onChange={e => setSelectedFlowId(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1.5 text-sm"
          >
            {initialFlows.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            {selectedFlow?.nodes?.length || 0} nodos · Rev {selectedFlow?.rev || 0}
          </span>
        </div>
        <button
          onClick={handleExecute}
          disabled={!selectedFlow || executing}
          className="ml-auto px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
        >
          {executing ? '⏳ Ejecutando...' : '▶ Ejecutar Flow'}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_e, node) => setSelectedNode(node)}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            className="bg-gray-900"
          >
            <Background color="#374151" gap={20} size={1} />
            <Controls />
            <MiniMap nodeColor="#6366f1" maskColor="rgba(17,24,39,0.8)" />
            {result && (
              <Panel position="bottom-center">
                <div className={`px-6 py-3 rounded-lg text-sm font-mono shadow-xl border ${
                  result.error
                    ? 'bg-red-900 border-red-500 text-red-200'
                    : 'bg-green-900 border-green-500 text-green-200'
                }`}>
                  {result.error ? `❌ ${result.error}` : `✅ ${result.execution_id} · ${result.status}`}
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Node Inspector Panel */}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            values={nodeValues[selectedNode.id] || {}}
            onValuesChange={(nodeId, vals) =>
              setNodeValues(prev => ({ ...prev, [nodeId]: vals }))
            }
          />
        )}
      </div>
    </div>
  );
}
