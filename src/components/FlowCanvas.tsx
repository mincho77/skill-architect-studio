'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
import SvgViewerNode from './SvgViewerNode';
import SkillPalette from './SkillPalette';
import { EnhancedInputPanel } from './EnhancedInputPanel';
import { Play, Loader, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Edit2, X, Trash2, Plus, Download, Upload } from 'lucide-react';

const nodeTypes = { skillNode: SkillNode, inputNode: InputNode, svgViewerNode: SvgViewerNode };

const SKILL_DEFS: Record<string, any> = {
  'input-node': {
    inputs: [],
    outputs: [{ nombre: 'value', tipo: 'String' }],
  },
  'text-to-workflow': {
    inputs: [{ nombre: 'texto', tipo: 'String' }],
    outputs: [{ nombre: 'workflow', tipo: 'JSON' }],
  },
  'workflow-to-mermaid': {
    inputs: [{ nombre: 'workflow', tipo: 'JSON' }],
    outputs: [{ nombre: 'mermaid', tipo: 'String' }],
  },
  'mermaid-to-svg-gen': {
    inputs: [{ nombre: 'mermaid', tipo: 'String' }],
    outputs: [{ nombre: 'svg', tipo: 'String' }],
  },
  'mermaid-to-svg': {
    inputs: [{ nombre: 'mermaid', tipo: 'String' }],
    outputs: [{ nombre: 'svg', tipo: 'String' }],
  },
  'image-to-svg': {
    inputs: [{ nombre: 'image', tipo: 'File' }],
    outputs: [{ nombre: 'svg', tipo: 'String' }],
  },
  'svg-viewer': {
    inputs: [{ nombre: 'svg', tipo: 'String' }],
    outputs: [{ nombre: 'svg', tipo: 'String' }],
  },
};

const INITIAL_NODES: Node[] = [
  {
    id: '0', type: 'inputNode', position: { x: -150, y: 150 },
    data: {
      id: '0',
      inputs: [
        { nombre: 'texto', tipo: 'String', valor: 'El cliente solicita un informe detallado del proyecto Q3' },
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
    id: '3', type: 'svgViewerNode', position: { x: 700, y: 100 },
    data: { label: 'SVG Viewer', skillId: 'svg-viewer', status: 'idle', svg: '' },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e0-1', source: '0', sourceHandle: 'input-texto', target: '1', targetHandle: 'in-texto', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: 'e1-2', source: '1', sourceHandle: 'out-workflow', target: '2', targetHandle: 'in-workflow', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9333ea', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', sourceHandle: 'out-mermaid', target: '3', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#10b981', strokeWidth: 2 } },
];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  const [executing, setExecuting] = useState(false);
  const [execution, setExecution] = useState<any>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({ texto: 'El cliente solicita un informe detallado del proyecto Q3' });
  const [showInputPanel, setShowInputPanel] = useState(true);
  const [draggedSkill, setDraggedSkill] = useState<string | null>(null);
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [newConnectionSource, setNewConnectionSource] = useState('');
  const [newConnectionTarget, setNewConnectionTarget] = useState('');
  const [showProjectsPanel, setShowProjectsPanel] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState('Sin título');
  const [showSaveProject, setShowSaveProject] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');

  const inputsArray = Object.keys(inputs).map(key => ({
    nombre: key,
    tipo: 'String',
    requerido: true,
    valor: inputs[key] || '',
  }));

  const saveCanvas = () => {
    const canvasData = {
      nodes,
      edges,
      inputs,
    };
    const json = JSON.stringify(canvasData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-flow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadCanvas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setInputs(data.inputs || {});
      } catch (error) {
        console.error('Error loading canvas:', error);
      }
    };
    reader.readAsText(file);
  };

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('skillProjects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  }, []);

  const saveProject = (name: string) => {
    const projectData = {
      id: Date.now().toString(),
      name: name || currentProjectName,
      nodes,
      edges,
      inputs,
      createdAt: new Date().toISOString(),
    };

    const updated = projects.filter(p => p.name !== (name || currentProjectName)).concat(projectData);
    setProjects(updated);
    localStorage.setItem('skillProjects', JSON.stringify(updated));
    setCurrentProjectName(name || currentProjectName);
    setShowSaveProject(false);
    setProjectNameInput('');
  };

  const loadProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const loadedNodes = (project.nodes || []).map((n: any) => {
        if (n.type === 'inputNode') {
          return { ...n, data: { ...n.data, onExecute: (id: string) => handleExecuteFromInputRef.current(id) } };
        }
        return n;
      });
      setNodes(loadedNodes);
      setEdges(project.edges || []);
      setInputs(project.inputs || {});
      setCurrentProjectName(project.name);
      setShowProjectsPanel(false);
    }
  };

  const deleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    localStorage.setItem('skillProjects', JSON.stringify(updated));
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Get port types
      const sourceOutputs = sourceNode.data?.outputs || [];
      const targetInputs = targetNode.data?.inputs || [];

      const sourcePort = sourceOutputs.find((p: any) => `out-${p.nombre}` === connection.sourceHandle);
      const targetPort = targetInputs.find((p: any) => `in-${p.nombre}` === connection.targetHandle);

      // Validate type compatibility
      if (sourcePort && targetPort) {
        if (sourcePort.tipo !== targetPort.tipo) {
          console.warn(`Type mismatch: ${sourcePort.tipo} → ${targetPort.tipo}`);
          return; // Block connection
        }
      }

      setEdges(eds => addEdge({
        ...connection,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#9333ea', strokeWidth: 2 },
      }, eds));
    },
    [nodes, setEdges]
  );

  const handleDragStart = (skillId: string, event: React.DragEvent, nodeType?: string) => {
    setDraggedSkill(skillId);
    event.dataTransfer.effectAllowed = 'move';
    if (nodeType) {
      event.dataTransfer.setData('nodeType', nodeType);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedSkill) return;

    const nodeType = event.dataTransfer.getData('nodeType') || 'skillNode';
    const reactFlowBounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - reactFlowBounds.left - 80;
    const y = event.clientY - reactFlowBounds.top - 30;

    const newNodeId = `${draggedSkill}-${Date.now()}`;
    const skillLabel = draggedSkill === 'mermaid-to-svg' ? 'SVG Viewer' :
                       draggedSkill.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x, y },
      data: nodeType === 'svgViewerNode'
        ? { label: skillLabel, skillId: 'svg-viewer', status: 'idle', svg: '' }
        : nodeType === 'inputNode'
        ? { id: newNodeId, inputs: [{ nombre: 'value', tipo: 'String' }], onExecute: (nodeId: string) => handleExecuteFromInputRef.current(nodeId) }
        : {
            label: skillLabel,
            skillId: draggedSkill,
            status: 'idle',
            inputs: SKILL_DEFS[draggedSkill]?.inputs || [],
            outputs: SKILL_DEFS[draggedSkill]?.outputs || [],
          },
    };

    setNodes(nds => [...nds, newNode]);
    setDraggedSkill(null);
  };

  const handleExecuteFromInput = (inputNodeId: string) => {
    const inputNode = nodesRef.current.find(n => n.id === inputNodeId);
    if (!inputNode) return;

    const inputData: Record<string, any> = {};
    inputNode.data.inputs?.forEach((inp: any) => {
      inputData[inp.nombre] = inp.valor ?? '';
    });

    setInputs(Object.fromEntries(
      Object.entries(inputData).map(([k, v]) => [k, (v as any)?.name || String(v)])
    ));

    setExecuting(true);
    setExecution(null);
    setExpandedStep(null);
    setShowInputPanel(false);

    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', duration: undefined } })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: '#9333ea', strokeWidth: 2 } })));

    executeFlowWithInput(inputData, inputNodeId);
  };

  // Ref must be declared AFTER handleExecuteFromInput to avoid TDZ error
  const handleExecuteFromInputRef = useRef(handleExecuteFromInput);
  useEffect(() => { handleExecuteFromInputRef.current = handleExecuteFromInput; });

  useEffect(() => {
    setNodes(nds => nds.map(n => {
      if (n.type === 'inputNode') {
        return { ...n, data: { ...n.data, onExecute: (id: string) => handleExecuteFromInputRef.current(id) } };
      }
      return n;
    }));
  }, []);

  const executeFlowWithInput = async (inputData: Record<string, any>, startNodeId: string) => {
    try {
      const steps: any[] = [];
      const executedNodeIds = new Set<string>();
      const nodeOutputs: Record<string, any> = {};
      nodeOutputs[startNodeId] = inputData;

      // Use refs to always read current nodes/edges (avoid stale closure)
      const queue: string[] = [startNodeId];

      while (queue.length > 0) {
        const currentNodeId = queue.shift()!;
        if (executedNodeIds.has(currentNodeId)) continue;
        executedNodeIds.add(currentNodeId);

        const currentNode = nodesRef.current.find(n => n.id === currentNodeId);
        if (!currentNode) continue;

        if (currentNode.type === 'inputNode') {
          edgesRef.current.filter(e => e.source === currentNodeId).forEach(e => {
            if (!executedNodeIds.has(e.target)) queue.push(e.target);
          });
          continue;
        }

        setNodes(nds => nds.map(n =>
          n.id === currentNodeId ? { ...n, data: { ...n.data, status: 'running' } } : n
        ));
        setEdges(eds => eds.map(e => e.target === currentNodeId ? { ...e, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } } : e));

        await new Promise(r => setTimeout(r, 400));

        const stepStart = Date.now();

        // Map port values from source node outputs to target node inputs
        const nodeInput: any = {};
        edgesRef.current.filter(e => e.target === currentNodeId).forEach(edge => {
          const sourceOutput = nodeOutputs[edge.source];
          const resolvedOutput = (sourceOutput && typeof sourceOutput === 'object' && !(sourceOutput instanceof File))
            ? sourceOutput
            : sourceOutput ?? '';

          if (edge.sourceHandle && edge.targetHandle) {
            const srcPortName = edge.sourceHandle.replace(/^out-/, '').replace(/^input-/, '');
            const tgtPortName = edge.targetHandle.replace(/^in-/, '');
            const portValue = (resolvedOutput && typeof resolvedOutput === 'object')
              ? (resolvedOutput[srcPortName] ?? resolvedOutput)
              : resolvedOutput;
            nodeInput[tgtPortName] = portValue;
          } else if (edge.sourceHandle && !edge.targetHandle) {
            // Edge with no targetHandle — spread entire source output into nodeInput
            const srcPortName = edge.sourceHandle.replace(/^out-/, '').replace(/^input-/, '');
            if (resolvedOutput && typeof resolvedOutput === 'object') {
              Object.assign(nodeInput, resolvedOutput);
              if (resolvedOutput[srcPortName] !== undefined) {
                nodeInput[srcPortName] = resolvedOutput[srcPortName];
              }
            } else {
              nodeInput[srcPortName] = resolvedOutput;
            }
          } else {
            // No handles at all — pass output directly
            if (resolvedOutput && typeof resolvedOutput === 'object') {
              Object.assign(nodeInput, resolvedOutput);
            } else {
              nodeInput['value'] = resolvedOutput;
            }
          }
        });

        // Serialize for API (File object → {name, type, base64})
        const apiInput: any = {};
        Object.keys(nodeInput).forEach(key => {
          const v = nodeInput[key];
          if (v instanceof File) {
            apiInput[key] = v.name; // fallback, base64 not available
          } else if (v && typeof v === 'object' && v.base64) {
            apiInput[key] = { name: v.name, type: v.type, base64: v.base64 };
          } else {
            apiInput[key] = v;
          }
        });

        console.log(`[Test] Executing ${currentNode.data.label}`, { nodeInput: apiInput });

        let output: any = Object.values(nodeInput)[0] || '';
        let status = 'completed';

        // SVG Viewer: bypass API — pass svg through, or convert mermaid if needed
        if (currentNode.type === 'svgViewerNode') {
          const rawValue = nodeInput.svg ?? nodeInput.mermaid ?? Object.values(nodeInput)[0] ?? '';
          const strValue = typeof rawValue === 'string' ? rawValue : rawValue?.svg ?? rawValue?.mermaid ?? '';

          if (strValue.trim().startsWith('<svg')) {
            output = { svg: strValue };
          } else if (strValue.trim().startsWith('graph') || strValue.trim().startsWith('sequenceDiagram') || strValue.trim().startsWith('flowchart')) {
            // Mermaid detected — convert via API
            const mermaidRes = await fetch('/api/execute/flow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ flowId: 'mermaid-convert', nodes: [{ id: 'tmp', data: { skillId: 'mermaid-to-svg', label: 'Mermaid → SVG' } }], edges: [], initialInput: { mermaid: strValue } }),
            });
            const mermaidResult = await mermaidRes.json();
            output = { svg: mermaidResult.execution?.steps?.[0]?.output?.svg ?? strValue };
          } else {
            output = { svg: strValue };
          }
        } else {
          try {
            const res = await fetch('/api/execute/flow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ flowId: 'FLOW-001', nodes: [currentNode], edges: [], initialInput: apiInput }),
            });
            const result = await res.json();
            console.log(`[Test] Result ${currentNode.data.label}`, result);
            if (result.execution?.steps?.[0]) {
              output = result.execution.steps[0].output;
              status = result.execution.steps[0].status;
            }
          } catch (e) {
            console.error('[Test] Execution error:', e);
            status = 'error';
          }
        }

        const duration = Date.now() - stepStart;
        nodeOutputs[currentNodeId] = output;

        steps.push({
          nodeId: currentNodeId,
          skillId: currentNode.data.skillId,
          skillName: currentNode.data.label,
          status,
          input: apiInput,
          output,
          duration,
        });

        const nodeUpdate: any = { status, duration };
        if (output?.svg) nodeUpdate.svg = output.svg;

        setNodes(nds => nds.map(n => n.id === currentNodeId ? { ...n, data: { ...n.data, ...nodeUpdate } } : n));
        setEdges(eds => eds.map(e => e.target === currentNodeId ? { ...e, animated: false, style: { stroke: status === 'completed' ? '#22c55e' : '#ef4444', strokeWidth: 2 } } : e));

        edgesRef.current.filter(e => e.source === currentNodeId).forEach(e => {
          if (!executedNodeIds.has(e.target)) queue.push(e.target);
        });
      }

      setExecution({
        id: `EXEC-${Date.now().toString(36).toUpperCase()}`,
        status: steps.every(s => s.status === 'completed') ? 'success' : 'failed',
        steps,
      });
    } catch (error) {
      console.error('Execution error:', error);
      setExecution({
        id: `EXEC-${Date.now()}`,
        status: 'error',
        steps: [],
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecution(null);
    setExpandedStep(null);
    setShowInputPanel(false);

    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', duration: undefined } })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: '#9333ea', strokeWidth: 2 } })));

    const orderedNodes = [...nodes];
    const steps: any[] = [];
    let currentData: any = inputs.texto || '';

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

      const nodeUpdate: any = { status, duration };
      if (output?.svg) nodeUpdate.svg = output.svg;

      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, ...nodeUpdate } } : n));
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
          <span className="text-white font-bold text-sm">Skill Studio</span>
          <span className="text-gray-500 text-xs">{nodes.length} nodos · {edges.length} conexiones</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowInputPanel(!showInputPanel)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <Edit2 size={13} /> Inputs
            </button>
            <button
              onClick={() => setShowConnectionPanel(!showConnectionPanel)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              🔗 Conexiones
            </button>
            <button
              onClick={() => setShowSaveProject(true)}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              title="Guardar como proyecto"
            >
              💾 Proyectos
            </button>
            <button
              onClick={() => setShowProjectsPanel(true)}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              title="Abrir proyecto"
            >
              📂 Mis Proyectos
            </button>
            <button
              onClick={saveCanvas}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              title="Exportar como JSON"
            >
              <Download size={13} /> Exportar
            </button>
            <label className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer">
              <Upload size={13} /> Importar
              <input
                type="file"
                accept=".json"
                onChange={loadCanvas}
                style={{ display: 'none' }}
              />
            </label>
            <a
              href="/skills/builder"
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              + Crear Skill
            </a>
            {execution && (
              <span
                onClick={() => setExecution(null)}
                className={`cursor-pointer text-xs px-3 py-1 rounded-full font-bold border ${execution.status === 'success' ? 'bg-green-900/30 border-green-700 text-green-400 hover:border-red-700 hover:text-red-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}
                title="Click para cerrar resultados"
              >
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
        <div className="flex-1 relative w-full h-full" onDragOver={handleDragOver} onDrop={handleDrop}>
          <SkillPalette onDragStart={handleDragStart} />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            style={{ background: '#030712', width: '100%', height: '100%' }}
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

          {/* Connection Panel (flotante) */}
          {showConnectionPanel && (
            <div className="absolute bottom-4 left-4 z-10 bg-gray-900 border border-gray-700 rounded-xl p-4 w-96 shadow-2xl max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">Conexiones ({edges.length})</span>
                <button onClick={() => setShowConnectionPanel(false)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* List Connections */}
              <div className="space-y-2 mb-4">
                {edges.map((edge) => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  return (
                    <div key={edge.id} className="bg-gray-800 border border-gray-700 rounded-lg p-2 flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-300 truncate">
                          {sourceNode?.data?.label || edge.source} → {targetNode?.data?.label || edge.target}
                        </div>
                        <div className="text-gray-500 text-[10px]">
                          {edge.sourceHandle} → {edge.targetHandle}
                        </div>
                      </div>
                      <button
                        onClick={() => setEdges(edges.filter(e => e.id !== edge.id))}
                        className="ml-2 p-1 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                        title="Eliminar conexión"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {edges.length === 0 && (
                <div className="text-gray-500 text-xs mb-4">No hay conexiones</div>
              )}

              {/* Add Connection Form */}
              <div className="border-t border-gray-700 pt-4">
                <div className="text-xs font-bold text-gray-400 mb-2">Nueva Conexión</div>
                <div className="space-y-2 text-xs">
                  <select
                    value={newConnectionSource}
                    onChange={(e) => setNewConnectionSource(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-white"
                  >
                    <option value="">Seleccionar salida...</option>
                    {nodes.map((n) => {
                      const outputs = n.data?.outputs || [];
                      return outputs.map((out: any) => (
                        <option key={`${n.id}-${out.nombre}`} value={`${n.id}|out-${out.nombre}`}>
                          {n.data?.label || n.id} → {out.nombre} ({out.tipo})
                        </option>
                      ));
                    })}
                  </select>
                  <select
                    value={newConnectionTarget}
                    onChange={(e) => setNewConnectionTarget(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-white"
                  >
                    <option value="">Seleccionar entrada...</option>
                    {nodes.map((n) => {
                      const inputs = n.data?.inputs || [];
                      return inputs.map((inp: any) => (
                        <option key={`${n.id}-${inp.nombre}`} value={`${n.id}|in-${inp.nombre}`}>
                          {n.data?.label || n.id} → {inp.nombre} ({inp.tipo})
                        </option>
                      ));
                    })}
                  </select>
                  <button
                    onClick={() => {
                      if (newConnectionSource && newConnectionTarget) {
                        const [srcId, srcHandle] = newConnectionSource.split('|');
                        const [tgtId, tgtHandle] = newConnectionTarget.split('|');
                        const newEdge: Edge = {
                          id: `edge-${Date.now()}`,
                          source: srcId,
                          sourceHandle: srcHandle,
                          target: tgtId,
                          targetHandle: tgtHandle,
                          markerEnd: { type: MarkerType.ArrowClosed },
                          style: { stroke: '#9333ea', strokeWidth: 2 },
                        };
                        setEdges(eds => [...eds, newEdge]);
                        setNewConnectionSource('');
                        setNewConnectionTarget('');
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded p-1 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Plus size={12} /> Conectar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edge Delete Modal */}
          {selectedEdge && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Eliminar Conexión</h3>
                <p className="text-gray-400 text-sm mb-6">
                  ¿Estás seguro que quieres eliminar esta conexión?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEdges(edges.filter(e => e.id !== selectedEdge));
                      setSelectedEdge(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 font-bold transition-colors"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setSelectedEdge(null)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Panel */}
          {showProjectsPanel && (
            <div className="absolute bottom-4 right-4 z-10 bg-gray-900 border border-gray-700 rounded-xl p-4 w-80 shadow-2xl max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">Mis Proyectos</span>
                <button onClick={() => setShowProjectsPanel(false)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {projects.length === 0 ? (
                  <div className="text-gray-500 text-xs">No hay proyectos guardados</div>
                ) : (
                  projects.map((proj) => (
                    <div key={proj.id} className="bg-gray-800 border border-gray-700 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-bold truncate">{proj.name}</div>
                        <div className="text-gray-500 text-[10px]">{new Date(proj.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadProject(proj.id)}
                          className="p-1 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                          title="Abrir proyecto"
                        >
                          ↻
                        </button>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-1 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                          title="Eliminar proyecto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Save Project Modal */}
          {showSaveProject && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Guardar Proyecto</h3>
                <input
                  type="text"
                  value={projectNameInput}
                  onChange={(e) => setProjectNameInput(e.target.value)}
                  placeholder={currentProjectName}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white mb-4 text-sm focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && saveProject(projectNameInput)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => saveProject(projectNameInput)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-bold transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveProject(false);
                      setProjectNameInput('');
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Node Detail Panel (flotante) */}
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-xl p-5 w-80 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">{selectedNode.data.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                      setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
                      setSelectedNode(null);
                    }}
                    className="text-red-500 hover:text-red-400 hover:bg-red-900/30 p-1 rounded transition-colors"
                    title="Eliminar nodo"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
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
                      <div className="text-xs text-green-500 font-bold mb-1">Input:</div>
                      <pre className="text-xs font-mono text-green-300 bg-gray-950 rounded p-2 max-h-28 overflow-auto">
                        {JSON.stringify(step.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-blue-500 font-bold mb-1">Output:</div>
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
        {/* Panel Derecho - Flujo de Datos */}
        {execution && (
        <div className="absolute top-0 right-0 h-full w-96 bg-gray-900/95 border-l border-gray-800 flex flex-col overflow-hidden z-20 shadow-2xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-3 shrink-0">
            <span className="font-bold text-white text-sm">Flujo de Datos</span>
            {execution.status === 'success'
              ? <CheckCircle size={14} className="text-green-400" />
              : <AlertCircle size={14} className="text-red-400" />}
            <button
              onClick={() => { setExecution(null); setExpandedStep(null); }}
              className="ml-auto text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
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
                      <div className="text-xs text-green-500 font-bold mb-1">Input:</div>
                      <pre className="text-xs font-mono text-green-300 max-h-48 overflow-auto">{JSON.stringify(step.input, null, 2)}</pre>
                    </div>
                    {step.output && (
                      <div>
                        <div className="text-xs text-blue-500 font-bold mb-1">Output:</div>
                        {step.output?.png ? (
                          <div className="mb-3 rounded-lg border border-gray-700 bg-gray-800 overflow-hidden" style={{ width: '100%' }}>
                            <img
                              src={step.output.png}
                              alt="Output"
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                              onError={(e) => console.error('Image load error:', e)}
                            />
                          </div>
                        ) : null}
                        {step.output?.url ? (
                          <div className="mb-3 rounded-lg border border-gray-700 bg-gray-800 overflow-hidden" style={{ width: '100%' }}>
                            <img
                              src={step.output.url}
                              alt="Output"
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                              onError={(e) => console.error('Image load error:', e)}
                            />
                          </div>
                        ) : null}
                        <pre className="text-xs font-mono text-blue-300 max-h-48 overflow-auto">{JSON.stringify(step.output, null, 2)}</pre>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {step.output?.png && (
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = step.output.png;
                                link.download = `output-${step.skillName}-${idx}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              PNG
                            </button>
                          )}
                          {step.output?.url && (
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = step.output.url;
                                link.download = `output-${step.skillName}-${idx}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              IMG
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const json = JSON.stringify(step.output, null, 2);
                              const blob = new Blob([json], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `output-${step.skillName}-${idx}.json`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            JSON
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(step.output, null, 2));
                              alert('Copiado al clipboard');
                            }}
                            className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
                          >
                            Copy
                          </button>
                        </div>
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
      </div>
    </div>
  );
}
