'use client';

import { FileText, BarChart2, Bell, Link, Database, Palette, Settings, Radio, Upload, Box } from 'lucide-react';

const DOMAIN_ICONS: Record<string, any> = {
  documentos: FileText, reportes: BarChart2, notificaciones: Bell,
  integraciones: Link, datos: Database, diseño: Palette,
  procesos: Settings, distribucion: Radio, exportacion: Upload, default: Box,
};

const DOMAIN_COLORS: Record<string, string> = {
  documentos: 'bg-blue-900/50 text-blue-400 border-blue-800',
  reportes: 'bg-green-900/50 text-green-400 border-green-800',
  notificaciones: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  integraciones: 'bg-cyan-900/50 text-cyan-400 border-cyan-800',
  datos: 'bg-orange-900/50 text-orange-400 border-orange-800',
  diseño: 'bg-pink-900/50 text-pink-400 border-pink-800',
  procesos: 'bg-gray-700/50 text-gray-300 border-gray-600',
  distribucion: 'bg-purple-900/50 text-purple-400 border-purple-800',
  exportacion: 'bg-teal-900/50 text-teal-400 border-teal-800',
  default: 'bg-gray-800 text-gray-400 border-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  existente: 'bg-green-900/60 text-green-300 border-green-700',
  pendiente_desarrollo: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  piloto: 'bg-blue-900/60 text-blue-300 border-blue-700',
};

export default function SkillCard({ skill, onClick }: { skill: any; onClick: () => void }) {
  const Icon = DOMAIN_ICONS[skill.dominio] || DOMAIN_ICONS.default;
  const iconColor = DOMAIN_COLORS[skill.dominio] || DOMAIN_COLORS.default;
  const statusColor = STATUS_COLORS[skill.status] || 'bg-gray-800 text-gray-400 border-gray-700';
  const statusLabel = skill.status === 'existente' ? 'Publicado'
    : skill.status === 'pendiente_desarrollo' ? 'Pendiente'
    : skill.status || 'N/A';

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-purple-600 hover:bg-gray-800/80 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${iconColor}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{skill.name}</div>
            <div className="text-xs text-gray-500">{skill.id} · {skill.version || '1.0.0'}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border font-semibold shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed">
        {skill.descripcion}
      </p>

      {skill.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skill.tags.slice(0, 4).map((tag: string) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>→ {skill.inputs?.length || 0} entradas</span>
          <span>← {skill.outputs?.length || 0} salidas</span>
        </div>
        <span className="text-xs text-purple-500 group-hover:text-purple-400 font-semibold">
          Ver ficha →
        </span>
      </div>
    </div>
  );
}
