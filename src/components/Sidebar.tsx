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
        className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-4 cursor-pointer hover:bg-purple-500 transition-colors"
        onClick={() => router.push('/')}
      >
        <span className="text-white font-black text-sm">SS</span>
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
