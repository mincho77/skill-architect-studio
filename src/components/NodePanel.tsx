'use client';

interface NodePanelProps {
  node: {
    id: string;
    data: any;
  } | null;
  onClose: () => void;
  onValuesChange: (nodeId: string, values: Record<string, any>) => void;
  values: Record<string, any>;
}

export default function NodePanel({ node, onClose, onValuesChange, values }: NodePanelProps) {
  if (!node) return null;

  const inputs = node.data.inputs || [];
  const outputs = node.data.outputs || [];

  const handleChange = (nombre: string, value: string) => {
    onValuesChange(node.id, { ...values, [nombre]: value });
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-blue-700 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-bold text-white text-sm">{node.data.label}</div>
          <div className="text-xs text-blue-200">{node.data.skillId}</div>
        </div>
        <button
          onClick={onClose}
          className="text-white opacity-60 hover:opacity-100 text-xl leading-none"
        >✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            node.data.status === 'existente'
              ? 'bg-green-900 text-green-300'
              : 'bg-yellow-900 text-yellow-300'
          }`}>
            {node.data.status}
          </span>
        </div>

        {/* Inputs */}
        {inputs.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Inputs</h3>
            <div className="space-y-3">
              {inputs.map((inp: any) => (
                <div key={inp.nombre}>
                  <label className="flex items-center gap-1 text-xs text-gray-300 mb-1">
                    <span>{inp.nombre}</span>
                    <span className="text-gray-500">({inp.tipo})</span>
                    {inp.requerido && <span className="text-red-400">*</span>}
                  </label>
                  {inp.tipo === 'Boolean' ? (
                    <select
                      value={values[inp.nombre] || inp.default || ''}
                      onChange={e => handleChange(inp.nombre, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5"
                    >
                      <option value="">--</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : inp.tipo === 'File' ? (
                    <div className="bg-gray-700 border border-dashed border-gray-500 rounded px-3 py-2 text-xs text-gray-400 text-center cursor-pointer hover:border-blue-400">
                      📁 {values[inp.nombre] || 'Click para seleccionar archivo'}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={values[inp.nombre] ?? (inp.default !== undefined ? String(inp.default) : '')}
                      onChange={e => handleChange(inp.nombre, e.target.value)}
                      placeholder={inp.descripcion || inp.nombre}
                      className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5 placeholder-gray-500"
                    />
                  )}
                  {inp.descripcion && (
                    <p className="text-xs text-gray-500 mt-1">{inp.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs */}
        {outputs.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Outputs</h3>
            <div className="space-y-2">
              {outputs.map((out: any) => (
                <div key={out.nombre} className="flex items-center gap-2 bg-gray-700 rounded px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  <span className="text-xs text-gray-300">{out.nombre}</span>
                  <span className="text-xs text-gray-500 ml-auto">({out.tipo})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded font-bold transition-colors"
          onClick={onClose}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
