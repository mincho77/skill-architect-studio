'use client';

import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';

const FlowCanvas = dynamic(() => import('../components/FlowCanvas'), { ssr: false });

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <FlowCanvas />
      </div>
    </div>
  );
}
