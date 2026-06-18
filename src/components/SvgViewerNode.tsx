'use client';

import { useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ZoomIn, ZoomOut, Download, Eye } from 'lucide-react';

export default function SvgViewerNode({ data }: { data: any }) {
  const svgContainerRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgCode = data.svg || '';

  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    setScale(prev => Math.max(0.1, Math.min(prev * factor, 5)));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.8 : 1.2;
    setScale(prev => Math.max(0.1, Math.min(prev * factor, 5)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        background: '#111827',
        border: '2px solid #10b981',
        borderRadius: 14,
        minWidth: 300,
        maxWidth: 600,
        boxShadow: '0 0 20px #10b98155',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#064e3b',
          borderRadius: '12px 12px 0 0',
          padding: '10px 14px',
          borderBottom: '1px solid #374151',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>
            SVG Viewer
          </span>
          <span style={{ color: '#6b7280', fontSize: 10, marginLeft: 'auto' }}>
            {(scale * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        style={{
          background: '#0f172a',
          padding: '16px',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {svgCode ? (
          <div
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: svgCode }} />
          </div>
        ) : (
          <div
            style={{
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            <Eye size={24} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '12px' }}>No SVG data</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 14px',
          borderTop: '1px solid #374151',
          background: '#1f2937',
        }}
      >
        <button
          onClick={() => handleZoom('out')}
          style={{
            flex: 1,
            padding: '6px',
            background: '#374151',
            border: 'none',
            borderRadius: '6px',
            color: '#e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = '#4b5563')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = '#374151')
          }
        >
          <ZoomOut size={12} /> Zoom Out
        </button>
        <button
          onClick={() => handleZoom('in')}
          style={{
            flex: 1,
            padding: '6px',
            background: '#374151',
            border: 'none',
            borderRadius: '6px',
            color: '#e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = '#4b5563')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = '#374151')
          }
        >
          <ZoomIn size={12} /> Zoom In
        </button>
        <button
          onClick={downloadSvg}
          style={{
            flex: 1,
            padding: '6px',
            background: '#10b981',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = '#059669')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = '#10b981')
          }
        >
          <Download size={12} /> SVG
        </button>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out-svg"
        style={{
          background: '#10b981',
          width: 10,
          height: 10,
          border: '2px solid #111827',
        }}
      />
    </div>
  );
}
