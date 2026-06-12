'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FlowDefinition } from '@/lib/schemas';
import SkillNode from './flow/SkillNode';
import NodeInspector from './flow/NodeInspector';
import ConnectionEdge from './flow/ConnectionEdge';

const nodeTypes = { skillNode: SkillNode };
const edgeTypes = { connectionEdge: ConnectionEdge };

interface FlowBuilderProps {
  flow: FlowDefinition;
  onFlowChange?: (flow: FlowDefinition) => void;
}

export default function FlowBuilder({ flow: initialFlow, onFlowChange }: FlowBuilderProps) {
  const [flow, setFlow] = useState<FlowDefinition>(initialFlow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      const newConnection = {
        id: `${source}.${sourceHandle}->${target}.${targetHandle}`,
        from: { node: source!, port: sourceHandle! },
        to: { node: target!, port: targetHandle! },
      };
      setFlow((f) => ({
        ...f,
        connections: [...f.connections, newConnection],
        rev: (f.rev || 0) + 1,
      }));
    },
    []
  );

  const selectedNode = flow.nodes.find((n) => n.instance_id === selectedNodeId) || null;

  return (
    <div className="flex h-screen gap-4">
      <div className="flex-1 border-r border-gray-200">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_event, node) => setSelectedNodeId(node.id)}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="w-72 bg-white border-l border-gray-200">
        <NodeInspector
          node={selectedNode}
          flow={flow}
          skill={null}
          onConnect={() => {}}
        />
      </div>
    </div>
  );
}
