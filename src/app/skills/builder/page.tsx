'use client';

import dynamic from 'next/dynamic';

const SkillBuilder = dynamic(() => import('@/components/SkillBuilder'), { ssr: false });

export default function SkillBuilderPage() {
  return (
    <div>
      <SkillBuilder />
    </div>
  );
}
