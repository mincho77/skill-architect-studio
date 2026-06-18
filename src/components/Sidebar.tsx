'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Brain, Package, Play } from 'lucide-react';

const MonkeyBarsIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="4" x2="22" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4" y1="4" x2="4" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="4" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="4" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="22" y1="4" x2="22" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="13" cy="17" rx="3" ry="3.5" fill="currentColor"/>
    <circle cx="13" cy="11.5" r="2.5" fill="currentColor"/>
    <circle cx="10.5" cy="11" r="1" fill="currentColor"/>
    <circle cx="15.5" cy="11" r="1" fill="currentColor"/>
    <line x1="10" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const NAV_ITEMS = [
  { icon: Brain, label: 'Arquitecto IA', href: '/architect', short: 'AI' },
  { icon: Package, label: 'Skill Catalog', href: '/skills', short: 'SKL' },
  { icon: MonkeyBarsIcon, label: 'Flow Canvas', href: '/', short: 'FLW', isCustom: true },
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
