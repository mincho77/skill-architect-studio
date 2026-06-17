'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Brain, Package, Zap, Play } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Brain, label: 'Arquitecto IA', href: '/architect', short: 'AI' },
  { icon: Package, label: 'Skill Catalog', href: '/skills', short: 'SKL' },
  { icon: Zap, label: 'Flow Canvas', href: '/', short: 'FLW' },
  { icon: Play, label: 'Ejecución', href: '/executions', short: 'EXE' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-2 shrink-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 cursor-pointer transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', boxShadow: '0 0 16px #7c3aed88' }}
        onClick={() => router.push('/')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="12" r="2.5" fill="#e0e7ff"/>
          <circle cx="12" cy="5" r="2.5" fill="#e0e7ff"/>
          <circle cx="19" cy="12" r="2.5" fill="#e0e7ff"/>
          <circle cx="12" cy="19" r="2.5" fill="#e0e7ff"/>
          <line x1="7.5" y1="12" x2="16.5" y2="12" stroke="#818cf8" strokeWidth="1.5"/>
          <line x1="12" y1="7.5" x2="12" y2="16.5" stroke="#818cf8" strokeWidth="1.5"/>
          <line x1="7" y1="7" x2="17" y2="17" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2"/>
          <circle cx="12" cy="12" r="2" fill="#a78bfa"/>
        </svg>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            title={item.label}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
              active ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] leading-none">{item.short}</span>
          </button>
        );
      })}
    </aside>
  );
}
