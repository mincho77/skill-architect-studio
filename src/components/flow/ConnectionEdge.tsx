'use client';

import { EdgeProps, getBezierPath } from '@xyflow/react';
import React from 'react';

export default function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { fromPort, toPort } = data || {};

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={2}
        className="stroke-slate-400"
      />
      {fromPort && toPort && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-slate-600 pointer-events-none"
        >
          {fromPort} → {toPort}
        </text>
      )}
    </>
  );
}
