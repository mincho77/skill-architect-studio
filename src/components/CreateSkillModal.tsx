'use client';

import { useState } from 'react';

const DOMINIOS = ['documentos', 'reportes', 'notificaciones', 'integraciones', 'datos', 'diseño', 'procesos', 'distribucion', 'exportacion'];
const TIPOS = ['String', 'Number', 'Boolean', 'JSON', 'File', 'Folder', 'Array<string>'];

interface Port {
  nombre: string;
  tipo: string;
  requerido?: boolean;
  descripcion?: string;
}

export default function CreateSkillModal({ onClose, onSave }: { onClose: () => void; onSave: (skill: any) => void }) {
  const [name, setName] = useState('');
  const [dominio, setDominio] = useState('documentos');
  const [descripcion, setDescripcion] = useState('');
  const [inputs, setInputs] = useState<Port[]>([]);
  const [outputs, setOutputs] = useState<Port[]>([]);
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: '¡Hola! Soy el Arquitecto IA. Describe qué hace tu skill y te ayudo a definir sus entradas y salidas.\n\n• ¿Qué tipo de entradas debería tener?\n• ¿Cómo valido los datos?\n• ¿Qué me recomiendas cambiar?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const addInput = () => setInputs(prev => [...prev, { nombre: '', tipo: 'String', requerido: true }]);
  const addOutput = () => setOutputs(prev => [...prev, { nombre: '', tipo: 'String' }]);

  const updatePort = (list: Port[], setList: any, i: number, field: string, value: string) => {
    const updated = [...list];
    updated[i] = { ...updated[i], [field]: value };
    setList(updated);
  };

  const removePort = (list: Port[], setList: any, i: number) => {
    setList(list.filter((_, idx) => idx !== i));
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const response = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: { name, dominio, descripcion, inputs, outputs },
        }),
      });
      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Sin respuesta' }]);
    } catch (e) {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Error conectando con el Arquitecto IA' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Nombre requerido');

    const skill = {
      id: `SKL-${Date.now()}`,
      name: name.trim(),
      version: '1.0.0',
      dominio,
      descripcion,
      status: 'existente',
      inputs,
      outputs,
      tags: [dominio],
      created_at: new Date().toISOString(),
      schema_version: '2.0',
      ejecucion_aprobada: false,
    };

    try {
      await fetch('/api/skills/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill }),
      });
      onSave(skill);
    } catch (e) {
      onSave(skill);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Arquitecto de Skills IA</h2>
            <p className="text-xs text-gray-400">Diseña un skill definiendo entradas, salidas y procesamiento</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">✕</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Metadatos */}
            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Metadatos del Skill</h3>
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nombre del skill..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <select
                  value={dominio}
                  onChange={e => setDominio(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {DOMINIOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Descripción breve..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            {/* Entradas */}
            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-green-400 uppercase">→ Entradas</h3>
                <button onClick={addInput} className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg">
                  + Agregar entrada
                </button>
              </div>
              {inputs.length === 0 && (
                <p className="text-xs text-gray-600 italic">Arrastra desde skills o agrega new input</p>
              )}
              {inputs.map((inp, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={inp.nombre}
                    onChange={e => updatePort(inputs, setInputs, i, 'nombre', e.target.value)}
                    placeholder="nombre"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={inp.tipo}
                    onChange={e => updatePort(inputs, setInputs, i, 'tipo', e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => removePort(inputs, setInputs, i)} className="text-red-500 hover:text-red-400 px-1">✕</button>
                </div>
              ))}
            </div>

            {/* Salidas */}
            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-purple-400 uppercase">← Salidas</h3>
                <button onClick={addOutput} className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded-lg">
                  + Agregar salida
                </button>
              </div>
              {outputs.length === 0 && (
                <p className="text-xs text-gray-600 italic">Define qué produce este skill</p>
              )}
              {outputs.map((out, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={out.nombre}
                    onChange={e => updatePort(outputs, setOutputs, i, 'nombre', e.target.value)}
                    placeholder="nombre"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={out.tipo}
                    onChange={e => updatePort(outputs, setOutputs, i, 'tipo', e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => removePort(outputs, setOutputs, i)} className="text-red-500 hover:text-red-400 px-1">✕</button>
                </div>
              ))}
            </div>

            {/* Counter */}
            <div className="text-xs text-gray-600">
              ✓ Inputs: {inputs.length} | Outputs: {outputs.length}
            </div>
          </div>

          {/* Arquitecto IA Panel */}
          <div className="w-80 border-l border-gray-800 flex flex-col bg-gray-950 shrink-0">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="font-bold text-white text-sm">Arquitecto IA</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`text-xs rounded-lg p-3 ${
                  msg.role === 'ai'
                    ? 'bg-gray-800 text-gray-300 border border-gray-700'
                    : 'bg-purple-900 text-purple-100 border border-purple-700 ml-4'
                }`}>
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div className="text-xs text-gray-500 animate-pulse">Arquitecto pensando...</div>
              )}
            </div>

            <div className="p-3 border-t border-gray-800 flex gap-2">
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                placeholder="Pregunta al arquitecto..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAiSend}
                disabled={aiLoading}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm"
              >
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold"
          >
            💾 Guardar Skill
          </button>
        </div>
      </div>
    </div>
  );
}
