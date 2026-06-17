'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileJson, FileArchive, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ImportSkillModal({ onClose, onImport }: { onClose: () => void; onImport: (skill: any) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileType, setFileType] = useState<'json' | 'zip' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError(null);
    setPreview(null);
    
    if (f.name.endsWith('.json')) {
      setFileType('json');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (!parsed.id || !parsed.name) { setError('El JSON debe tener id y name'); return; }
          setPreview(parsed);
        } catch { setError('JSON inválido'); }
      };
      reader.readAsText(f);
    } else if (f.name.endsWith('.zip')) {
      setFileType('zip');
      setPreview({ fileName: f.name, size: f.size });
    } else {
      setError('Solo se aceptan archivos .json o .zip');
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      if (fileType === 'json') {
        // Importar JSON directo
        await fetch('/api/skills/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill: { ...preview, schema_version: '2.0', ejecucion_aprobada: false } }),
        });
        onImport(preview);
      } else if (fileType === 'zip') {
        // Importar ZIP
        const formData = new FormData();
        const input = fileRef.current;
        if (!input?.files?.[0]) return;
        formData.append('file', input.files[0]);

        const res = await fetch('/api/skills/import-zip', {
          method: 'POST',
          body: formData,
        });
        const { skill, error } = await res.json();
        if (error) throw new Error(error);
        onImport(skill);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-900/50 border border-purple-700 rounded-lg flex items-center justify-center">
              <Upload size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Importar Skill</h2>
              <p className="text-xs text-gray-400">Sube .json directo o .zip con SKILL.md</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 hover:border-purple-600 hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileJson size={24} className={`${dragOver ? 'text-purple-400' : 'text-gray-600'}`} />
              <span className="text-gray-600">/</span>
              <FileArchive size={24} className={`${dragOver ? 'text-purple-400' : 'text-gray-600'}`} />
            </div>
            <p className="text-sm text-gray-400 mb-1">Arrastra tu archivo aquí</p>
            <p className="text-xs text-gray-600">.json o .zip (con SKILL.md)</p>
            <input ref={fileRef} type="file" accept=".json,.zip" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          {preview && (
            <div className="bg-gray-950 border border-green-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm font-bold text-green-300">
                  {fileType === 'zip' ? 'ZIP válido — listo para procesar' : 'Skill válido — listo para importar'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {fileType === 'json' ? (
                  [
                    ['ID', preview.id],
                    ['Nombre', preview.name],
                    ['Dominio', preview.dominio || 'N/A'],
                    ['Versión', preview.version || '1.0.0'],
                    ['Entradas', preview.inputs?.length || 0],
                    ['Salidas', preview.outputs?.length || 0],
                  ]
                ) : (
                  [
                    ['Archivo', preview.fileName],
                    ['Tamaño', `${(preview.size / 1024).toFixed(1)}KB`],
                  ]
                ).map(([label, value]) => (
                  <div key={label as string} className="bg-gray-800 rounded-lg p-2">
                    <div className="text-gray-500 mb-0.5">{label}</div>
                    <div className="text-white font-medium text-xs truncate">{value}</div>
                  </div>
                ))}
              </div>
              {fileType === 'json' && preview.descripcion && (
                <p className="text-xs text-gray-400 leading-relaxed">{preview.descripcion}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm">
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || importing}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2"
          >
            {importing ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
            {importing ? 'Procesando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  );
}
