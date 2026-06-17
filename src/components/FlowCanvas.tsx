'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SkillNode from './SkillNode';
import InputNode from './InputNode';
import { EnhancedInputPanel } from './EnhancedInputPanel';
import { Play, Loader, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Edit2, X } from 'lucide-react';

const nodeTypes = { skillNode: SkillNode, inputNode: InputNode };

const SKILL_DEFS: Record<string, any> = {
  'text-to-workflow': {
    inputs: [{ nombre: 'texto', tipo: 'String' }],
    outputs: [{ nombre: 'workflow', tipo: 'JSON' }],
  },
  'workflow-to-mermaid': {
    inputs: [{ nombre: 'workflow', tipo: 'JSON' }],
    outputs: [{ nombre: 'mermaid', tipo: 'String' }],
  },
  'mermaid-to-png': {
    inputs: [{ nombre: 'mermaid', tipo: 'String' }],
    outputs: [{ nombre: 'png', tipo: 'File' }, { nombre: 'url', tipo: 'String' }],
  },
};

const INITIAL_NODES: Node[] = [
  {
    id: '0', type: 'inputNode', position: { x: -150, y: 150 },
    data: {
      inputs: [
        { nombre: 'texto', tipo: 'String' },
      ],
    },
  },
  {
    id: '1', type: 'skillNode', position: { x: 60, y: 180 },
    data: { label: 'Text → Workflow', skillId: 'text-to-workflow', status: 'idle', ...SKILL_DEFS['text-to-workflow'] },
  },
  {
    id: '2', type: 'skillNode', position: { x: 380, y: 180 },
    data: { label: 'Workflow → Mermaid', skillId: 'workflow-to-mermaid', status: 'idle', ...SKILL_DEFS['workflow-to-mermaid'] },
  },
  {
    id: '3', type: 'skillNode', position: { x: 700, y: 180 },
    data: { label: 'Mermaid → PNG', skillId: 'mermaid-to-png', status: 'idle', ...SKILL_DEFS['mermaid-to-png'] },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e0-1', source: '0', sourceHandle: 'input-texto', target: '1', targetHandle: 'in-texto', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: 'e1-2', source: '1', sourceHandle: 'out-workflow', target: '2', targetHandle: 'in-workflow', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9333ea', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', sourceHandle: 'out-mermaid', target: '3', targetHandle: 'in-mermaid', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9333ea', strokeWidth: 2 } },
];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [executing, setExecuting] = useState(false);
  const [execution, setExecution] = useState<any>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({ texto: 'El cliente solicita un informe detallado del proyecto Q3' });
  const [showInputPanel, setShowInputPanel] = useState(true);

  const inputsArray = Object.keys(inputs).map(key => ({
    nombre: key,
    tipo: 'String',
    requerido: true,
    valor: inputs[key],
  }));

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges(eds => addEdge({
        ...connection,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#9333ea', strokeWidth: 2 },
      }, eds)),
    [setEdges]
  );

  const handleExecute = async () => {
    setExecuting(true);
    setExecution(null);
    setExpandedStep(null);
    setShowInputPanel(false);

    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', duration: undefined } })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: '#9333ea', strokeWidth: 2 } })));

    const orderedNodes = [...nodes];
    const steps: any[] = [];
    let currentData: any = inputs;

    for (let i = 0; i < orderedNodes.length; i++) {
      const node = orderedNodes[i];

      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n));
      setEdges(eds => eds.map(e => e.target === node.id ? { ...e, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } } : e));

      await new Promise(r => setTimeout(r, 900));

      const stepStart = Date.now();
      let output: any = currentData;
      let status = 'completed';

      try {
        const res = await fetch('/api/execute/flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flowId: 'FLOW-001', nodes: [node], edges: [], initialInput: currentData }),
        });
        const result = await res.json();
        if (result.execution?.steps?.[0]) {
          output = result.execution.steps[0].output;
          status = result.execution.steps[0].status;
        }
      } catch (e) { status = 'error'; }

      const duration = Date.now() - stepStart;
      steps.push({ nodeId: node.id, skillId: node.data.skillId, skillName: node.data.label, status, input: currentData, output, duration });

      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status, duration } } : n));
      setEdges(eds => eds.map(e => e.target === node.id ? { ...e, animated: false, style: { stroke: status === 'completed' ? '#22c55e' : '#ef4444', strokeWidth: 2 } } : e));

      if (status === 'error') break;
      currentData = output;
    }

    setExecution({
      id: `EXE-${Date.now().toString(36).toUpperCase()}`,
      status: steps.every(s => s.status === 'completed') ? 'success' : 'failed',
      steps,
    });
    setExecuting(false);
    setExpandedStep(0);
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <span className="text-white font-bold text-sm">Flow Canvas</span>
          <span className="text-gray-500 text-xs">{nodes.length} nodos · {edges.length} conexiones</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowInputPanel(!showInputPanel)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <Edit2 size={13} /> Inputs
            </button>
            {execution && (
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${execution.status === 'success' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                {execution.id} · {execution.status}
              </span>
            )}
            <button
              onClick={handleExecute}
              disabled={executing}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2"
            >
              {executing ? <Loader size={15} className="animate-spin" /> : <Play size={15} />}
              {executing ? 'Ejecutando...' : 'Ejecutar Flow'}
            </button>
          </div>
        </div>

        {/* ReactFlow */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            style={{ background: '#030712' }}
          >
            <Background variant={BackgroundVariant.Dots} color="#1f2937" gap={24} />
            <Controls style={{ background: '#1f2937', border: '1px solid #374151' }} />
          </ReactFlow>

          {/* Input Panel (flotante) */}
          {showInputPanel && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-start gap-2">
                <EnhancedInputPanel
                  inputs={inputsArray}
                  onInputChange={(nombre, valor) => setInputs(prev => ({ ...prev, [nombre]: valor }))}
                  onExecute={handleExecute}
                  isExecuting={executing}
                />
                <button
                  onClick={() => setShowInputPanel(false)}
                  className="mt-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Cerrar panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Node Detail Panel (flotante) */}
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-xl p-5 w-80 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">{selectedNode.data.label}</span>
                <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-4">{selectedNode.data.skillId}</div>

              {/* Ports */}
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 mb-2">ENTRADAS</div>
                {selectedNode.data.inputs?.map((inp: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 mb-1 p-2 bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full" style={{ background: { String: '#6366f1', JSON: '#3b82f6', File: '#ef4444', Number: '#eab308' }[inp.tipo as string] || '#6b7280' }} />
                    <span className="text-white text-xs font-semibold">{inp.nombre}</span>
                    <span className="text-gray-500 text-xs ml-auto font-mono">{inp.tipo}</span>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 mb-2">SALIDAS</div>
                {selectedNode.data.outputs?.map((out: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 mb-1 p-2 bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full" style={{ background: { String: '#6366f1', JSON: '#3b82f6', File: '#ef4444', Number: '#eab308' }[out.tipo as string] || '#6b7280' }} />
                    <span className="text-white text-xs font-semibold">{out.nombre}</span>
                    <span className="text-gray-500 text-xs ml-auto font-mono">{out.tipo}</span>
                  </div>
                ))}
              </div>

              {/* Execution result for this node */}
              {execution?.steps?.find((s: any) => s.nodeId === selectedNode.id) && (() => {
                const step = execution.steps.find((s: any) => s.nodeId === selectedNode.id);
                return (
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2">ÚLTIMA EJECUCIÓN</div>
                    <div className="mb-3">
                      <div className="text-xs text-green-500 font-bold mb-1">📥 Input:</div>
                      <pre className="text-xs font-mono text-green-300 bg-gray-950 rounded p-2 max-h-28 overflow-auto">
                        {JSON.stringify(step.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-blue-500 font-bold mb-1">📤 Output:</div>
                      <pre className="text-xs font-mono text-blue-300 bg-gray-950 rounded p-2 max-h-28 overflow-auto">
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{step.duration}ms</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho - Flujo de Datos */}
      {execution && (
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden shrink-0">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-3 shrink-0">
            <span className="font-bold text-white text-sm">Flujo de Datos</span>
            {execution.status === 'success'
              ? <CheckCircle size={14} className="text-green-400 ml-auto" />
              : <AlertCircle size={14} className="text-red-400 ml-auto" />}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {execution.steps.map((step: any, idx: number) => (
              <div key={idx}>
                <button
                  onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${step.status === 'completed' ? 'bg-green-900/20 border-green-800 hover:border-green-600' : 'bg-red-900/20 border-red-800'}`}
                >
                  <div className="flex items-center gap-2">
                    {step.status === 'completed'
                      ? <CheckCircle size={13} className="text-green-400 shrink-0" />
                      : <AlertCircle size={13} className="text-red-400 shrink-0" />}
                    <span className="font-bold text-white text-xs">{step.skillName}</span>
                    <span className="text-gray-600 text-xs ml-auto">{step.duration}ms</span>
                    {expandedStep === idx ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
                  </div>
                </button>

                {expandedStep === idx && (
                  <div className="mt-1 bg-gray-950 rounded-lg p-3 border border-gray-800 space-y-3">
                    <div>
                      <div className="text-xs text-green-500 font-bold mb-1">📥 Input:</div>
                      <pre className="text-xs font-mono text-green-300 max-h-28 overflow-auto">{JSON.stringify(step.input, null, 2)}</pre>
                    </div>
                    {step.output && (
                      <div>
                        <div className="text-xs text-blue-500 font-bold mb-1">📤 Output:</div>
                        <pre className="text-xs font-mono text-blue-300 max-h-28 overflow-auto">{JSON.stringify(step.output, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {idx < execution.steps.length - 1 && (
                  <div className="flex justify-center py-1 text-purple-600 text-lg">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
