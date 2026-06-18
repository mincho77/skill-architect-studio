import { NextRequest, NextResponse } from 'next/server';

function extractValue(input: any, keys: string[]): any {
  if (typeof input === 'string' || typeof input === 'number') return input;
  if (input && typeof input === 'object') {
    for (const k of keys) {
      if (input[k] !== undefined) return input[k];
    }
    const vals = Object.values(input);
    if (vals.length === 1) return vals[0];
  }
  return input;
}

const MOCK_OUTPUTS: Record<string, (input: any) => any> = {
  'text-to-workflow': (input: any) => {
    const raw = extractValue(input, ['texto', 'text', 'value', 'input']);
    const text = String(raw || '').trim();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const pasos = sentences.slice(0, 3).map((sent, idx) => {
      const trimmed = sent.trim();
      let titulo = trimmed;
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx > 0 && commaIdx < 60) {
        titulo = trimmed.substring(0, commaIdx).trim();
      } else {
        const words = trimmed.split(/\s+/);
        titulo = words.slice(0, 5).join(' ');
      }
      if (titulo.length > 50) titulo = titulo.substring(0, 47).trim() + '...';
      return {
        id: idx + 1,
        titulo: titulo || `Paso ${idx + 1}`,
        descripcion: trimmed.substring(0, 100),
      };
    });
    if (pasos.length === 0) {
      pasos.push({ id: 1, titulo: 'Entrada', descripcion: text.substring(0, 100) });
    }
    return {
      workflow: {
        tipo: 'workflow',
        pasos,
      },
    };
  },
  'workflow-to-mermaid': (input: any) => {
    const workflowData = extractValue(input, ['workflow', 'value', 'input']);
    const steps = workflowData?.pasos || workflowData?.steps || [];
    const mermaidLines = ['graph TD'];
    steps.forEach((paso: any, idx: number) => {
      mermaidLines.push(`    A${idx}["${paso.titulo}"]`);
      if (idx > 0) mermaidLines.push(`    A${idx - 1} --> A${idx}`);
    });
    return {
      mermaid: mermaidLines.join('\n'),
    };
  },
  'image-to-svg': async (input: any) => {
    const imageData = input.image || input.value;
    // If base64 available, call real LLM route
    if (imageData?.base64) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'}/api/execute/image-to-svg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();
      if (data.svg) return { svg: data.svg };
    }
    // Fallback placeholder
    const name = imageData?.name || String(imageData || 'imagen');
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#0f172a" rx="12"/>
      <text x="200" y="130" text-anchor="middle" font-family="monospace" font-size="12" fill="#38bdf8">${name}</text>
      <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="11" fill="#ef4444">Sin base64 — selecciona archivo en InputNode</text>
    </svg>`
    };
  },
  'svg-viewer': (input: any) => {
    return { svg: input.svg || input.value || '' };
  },
  'mermaid-to-svg': (input: any) => {
    const raw = extractValue(input, ['mermaid', 'value', 'input']);
    const mermaidCode = (typeof raw === 'string' ? raw : 'graph TD\n    A["Sin datos"]').trim();

    // Parsear nodos y edges del mermaid
    const lines = mermaidCode.split('\n').slice(1); // skip "graph TD"
    const nodes: Record<string, string> = {};
    const edges: { from: string; to: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Match: A0["Label"]
      const nodeMatch = trimmed.match(/^(\w+)\["([^"]+)"\]$/);
      if (nodeMatch) nodes[nodeMatch[1]] = nodeMatch[2];
      // Match: A0 --> A1
      const edgeMatch = trimmed.match(/^(\w+)\s*-->\s*(\w+)$/);
      if (edgeMatch) edges.push({ from: edgeMatch[1], to: edgeMatch[2] });
    }

    const nodeIds = Object.keys(nodes);
    const nodeW = 160, nodeH = 50, gapX = 60, padX = 40, padY = 60;
    const totalW = nodeIds.length * nodeW + (nodeIds.length - 1) * gapX + padX * 2;
    const totalH = nodeH + padY * 2 + 40;

    const nodePos: Record<string, { x: number; y: number }> = {};
    nodeIds.forEach((id, i) => {
      nodePos[id] = { x: padX + i * (nodeW + gapX), y: padY };
    });

    const rects = nodeIds.map((id) => {
      const { x, y } = nodePos[id];
      const label = nodes[id];
      return `
        <rect x="${x}" y="${y}" width="${nodeW}" height="${nodeH}" rx="8" fill="#4f46e5" stroke="#818cf8" stroke-width="2"/>
        <text x="${x + nodeW / 2}" y="${y + nodeH / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="13" fill="#fff" font-weight="bold">${label}</text>`;
    }).join('');

    const arrows = edges.map(({ from, to }) => {
      if (!nodePos[from] || !nodePos[to]) return '';
      const fx = nodePos[from].x + nodeW;
      const fy = nodePos[from].y + nodeH / 2;
      const tx = nodePos[to].x;
      const ty = nodePos[to].y + nodeH / 2;
      return `<line x1="${fx}" y1="${fy}" x2="${tx - 10}" y2="${ty}" stroke="#818cf8" stroke-width="2" marker-end="url(#arr)"/>`;
    }).join('');

    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#818cf8"/>
        </marker>
      </defs>
      <rect width="${totalW}" height="${totalH}" fill="#0f172a"/>
      ${arrows}
      ${rects}
    </svg>`;

    return {
      svg: svgCode,
    };
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flowId, nodes, edges, initialInput } = body;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'No nodes provided' }, { status: 400 });
    }

    const steps: any[] = [];
    let currentData = initialInput;

    for (const node of nodes) {
      const skillId = node.data?.skillId || 'unknown';
      const mockFn = MOCK_OUTPUTS[skillId];

      let output = currentData;
      let status = 'completed';

      if (mockFn) {
        try {
          output = await Promise.resolve(mockFn(currentData));
        } catch (e) {
          status = 'error';
          output = { error: (e as Error).message };
        }
      } else {
        // Pasar el input como output si no hay mock
        output = currentData;
      }

      steps.push({
        nodeId: node.id,
        skillId,
        status,
        input: currentData,
        output,
        duration: Math.random() * 1000 + 500,
      });

      currentData = output;
    }

    return NextResponse.json({
      flowId,
      status: steps.every((s) => s.status === 'completed') ? 'success' : 'failed',
      execution: {
        steps,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}
