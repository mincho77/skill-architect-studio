'use client';

import { X, ArrowRight, ArrowLeft, Edit, Play, Zap, FileText, BarChart2, Bell, Link, Database, Palette, Settings, Radio, Upload, Box, Brain, Sparkles, BookOpen, Code, AlertCircle } from 'lucide-react';

const PORT_COLORS: Record<string, string> = {
  String: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
  Number: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  Boolean: 'bg-green-900/60 text-green-300 border-green-700',
  JSON: 'bg-blue-900/60 text-blue-300 border-blue-700',
  File: 'bg-red-900/60 text-red-300 border-red-700',
  Folder: 'bg-purple-900/60 text-purple-300 border-purple-700',
  'Array<string>': 'bg-pink-900/60 text-pink-300 border-pink-700',
  Float: 'bg-orange-900/60 text-orange-300 border-orange-700',
};

const DOMAIN_ICONS: Record<string, any> = {
  documentos: FileText, reportes: BarChart2, notificaciones: Bell,
  integraciones: Link, datos: Database, diseño: Palette,
  procesos: Settings, distribucion: Radio, exportacion: Upload, default: Box,
};

const ICON_MAP: Record<string, any> = {
  Brain, Sparkles, BookOpen, Code, default: Brain,
};

export default function SkillModal({ skill, onClose }: { skill: any; onClose: () => void }) {
  const DomainIcon = DOMAIN_ICONS[skill.dominio] || DOMAIN_ICONS.default;
  const ExpertIcon = ICON_MAP[skill.cowork?.icon] || ICON_MAP.default;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-900/50 border border-purple-700 rounded-xl flex items-center justify-center">
              <DomainIcon size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{skill.name}</h2>
              <p className="text-sm text-gray-400">{skill.id} · v{skill.version || '1.0.0'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Descripción */}
          {skill.description && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">¿Qué hace?</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{skill.description}</p>
            </div>
          )}

          {/* Experto / Rol */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Rol del Experto
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-900/50 border-2 border-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <ExpertIcon size={28} className="text-purple-300" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">{skill.name}</div>
                <div className="text-sm text-gray-400 mt-1">Categoría: <span className="text-purple-300 capitalize">{skill.dominio}</span></div>
                {skill.modos?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skill.modos.map((m: string) => (
                      <span key={m} className="text-xs bg-purple-600/50 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-600/80 font-semibold">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagrama de Flujo */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Diagrama de Flujo</h3>
            <div className="bg-gray-950 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center gap-3 overflow-x-auto">
                <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                  {skill.inputs?.map((inp: any) => (
                    <div key={inp.nombre} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                      <div className="font-semibold text-white text-xs">{inp.nombre}</div>
                      <div className="text-gray-500 text-xs">{inp.tipo}</div>
                    </div>
                  ))}
                </div>
                <ArrowRight size={18} className="text-gray-600 shrink-0" />
                <div className="bg-gray-800 border-2 border-purple-600 rounded-xl px-5 py-4 text-center shrink-0 min-w-[200px]">
                  <DomainIcon size={26} className="text-purple-400 mx-auto mb-2" />
                  <div className="font-bold text-white text-sm">{skill.name}</div>
                  {skill.modos?.length > 0 && (
                    <div className="text-xs text-gray-400 mt-2">
                      {skill.modos.join(' • ')}
                    </div>
                  )}
                </div>
                <ArrowRight size={18} className="text-gray-600 shrink-0" />
                <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                  {skill.outputs?.map((out: any) => (
                    <div key={out.nombre} className="bg-gray-800 border border-purple-800 rounded-lg px-3 py-2">
                      <div className="font-semibold text-white text-xs">{out.nombre}</div>
                      <div className="text-purple-400 text-xs">{out.tipo}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Entradas */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ArrowRight size={14} /> Entradas ({skill.inputs?.length || 0})
            </h3>
            <div className="space-y-2">
              {skill.inputs?.map((inp: any) => (
                <div key={inp.nombre} className="flex items-center gap-3 bg-gray-950 rounded-lg px-4 py-3 border border-gray-800">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${PORT_COLORS[inp.tipo] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>{inp.tipo}</span>
                  <span className="font-semibold text-white text-sm">{inp.nombre}</span>
                  {inp.requerido && <span className="text-red-400 text-xs bg-red-900/30 px-1.5 py-0.5 rounded border border-red-800">requerido</span>}
                  {inp.descripcion && <span className="text-gray-500 text-xs ml-auto text-right">{inp.descripcion}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Salidas */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ArrowLeft size={14} /> Salidas ({skill.outputs?.length || 0})
            </h3>
            <div className="space-y-2">
              {skill.outputs?.map((out: any) => (
                <div key={out.nombre} className="flex items-center gap-3 bg-gray-950 rounded-lg px-4 py-3 border border-purple-900/30">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${PORT_COLORS[out.tipo] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>{out.tipo}</span>
                  <span className="font-semibold text-white text-sm">{out.nombre}</span>
                  {out.descripcion && <span className="text-gray-500 text-xs ml-auto text-right">{out.descripcion}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Assets */}
          {skill.package_dir && (
            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Box size={14} /> Assets & Recursos
              </h3>
              <div className="text-sm text-gray-400 font-mono bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="mb-2 text-gray-500">📦 Ubicación:</div>
                <div className="text-green-400 mb-4">{skill.package_dir}</div>
                <div className="mb-2 text-gray-500">📂 Estructura esperada:</div>
                <div className="text-gray-300 space-y-1">
                  <div>├── scripts/</div>
                  <div>├── reference/</div>
                  <div>├── assets/</div>
                  <div>│   ├── icons/</div>
                  <div>│   ├── fonts/</div>
                  <div>│   ├── logo/</div>
                  <div>│   └── illustrations/</div>
                  <div>├── SKILL.md</div>
                  <div>└── skill.json</div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {skill.tags?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 sticky bottom-0 bg-gray-900">
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2">
            <X size={14} /> Cerrar
          </button>
          <button className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
            <Edit size={14} /> Editar
          </button>
          <button className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
            <Play size={14} /> Probarlo
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold flex items-center gap-2">
            <Zap size={14} /> Usar en Flow
          </button>
        </div>
      </div>
    </div>
  );
}
