'use client';

import { useState, useEffect } from 'react';
import FlowBuilder from '@/components/FlowBuilder';
import { FlowDefinition } from '@/lib/schemas';
import { getFlowV2, listFlows } from '@/lib/flows';

export default function Home() {
  const [flows, setFlows] = useState<FlowDefinition[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    // Cargar flows disponibles
    (async () => {
      try {
        const allFlows = await listFlows();
        setFlows(allFlows);
        if (allFlows.length > 0) {
          setSelectedFlow(allFlows[0]);
        }
      } catch (e) {
        console.error('Error cargando flows:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExecute = async () => {
    if (!selectedFlow) return;

    setExecuting(true);
    try {
      const response = await fetch(`/api/execute/${selectedFlow.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} }),
      });

      const result = await response.json();
      console.log('Ejecución iniciada:', result);
      alert(`Ejecución ${result.execution_id} iniciada`);
    } catch (e) {
      console.error('Error ejecutando:', e);
      alert('Error al ejecutar flow');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow">
        <h1 className="text-2xl font-bold">Skill Studio v2</h1>
        <p className="text-sm opacity-90">Motor de orquestación puerto-a-puerto</p>
      </div>

      {/* Selector de flow */}
      <div className="bg-gray-100 border-b p-4 flex items-center gap-4">
        <label className="font-semibold">Flow:</label>
        <select
          value={selectedFlow?.id || ''}
          onChange={(e) => {
            const flow = flows.find((f) => f.id === e.target.value);
            setSelectedFlow(flow || null);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">Selecciona un flow...</option>
          {flows.map((flow) => (
            <option key={flow.id} value={flow.id}>
              {flow.name} ({flow.nodes.length} nodos)
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

      {/* Canvas */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">Cargando...</div>
      ) : selectedFlow ? (
        <FlowBuilder
          flow={selectedFlow}
          onFlowChange={(flow) => setSelectedFlow(flow)}
        />
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          No hay flows disponibles
        </div>
      )}
    </div>
  );
}
