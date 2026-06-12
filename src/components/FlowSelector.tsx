'use client';

import { useState } from 'react';
import { FlowDefinition } from '../lib/schemas';

export default function FlowSelector({ flows }: { flows: FlowDefinition[] }) {
  const [selectedId, setSelectedId] = useState<string>(flows[0]?.id || '');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const selectedFlow = flows.find(f => f.id === selectedId);

  const handleExecute = async () => {
    if (!selectedFlow) return;
    setExecuting(true);
    setResult(null);
    try {
      const response = await fetch(`/api/execute/${selectedFlow.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${String(e)}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-gray-100 border-b p-4 flex items-center gap-4">
        <label className="font-semibold">Flow:</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {flows.length === 0 && <option value="">Sin flows</option>}
          {flows.map(f => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.nodes?.length || 0} nodos)
            </option>
          ))}
        </select>
        <button
          onClick={handleExecute}
          disabled={!selectedFlow || executing}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {executing ? 'Ejecutando...' : 'Ejecutar'}
        </button>
      </div>
      {selectedFlow && (
        <div className="p-4">
          <h2 className="font-bold text-lg mb-2">{selectedFlow.name}</h2>
          <p className="text-gray-500 text-sm mb-4">{selectedFlow.nodes?.length || 0} nodos · Rev {selectedFlow.rev}</p>
          <div className="flex flex-wrap gap-2">
            {selectedFlow.nodes?.map((node, i) => (
              <div key={node.instance_id} className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm">
                <span className="text-gray-400 mr-1">{i+1}.</span>
                <span className="font-medium">{node.label}</span>
                <span className="text-gray-400 text-xs ml-1">({node.skill_id})</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && (
        <div className="m-4 p-4 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-auto max-h-64">
          <pre>{result}</pre>
        </div>
      )}
      {flows.length === 0 && (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          No hay flows disponibles
        </div>
      )}
    </div>
  );
}
