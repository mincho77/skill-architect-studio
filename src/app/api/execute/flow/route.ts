import { NextRequest, NextResponse } from 'next/server';

const MOCK_OUTPUTS: Record<string, (input: any) => any> = {
  'text-to-workflow': (input: string) => ({
    workflow: {
      tipo: 'workflow',
      pasos: [
        { id: 1, titulo: 'Inicio', descripcion: input },
        { id: 2, titulo: 'Procesamiento', descripcion: 'Procesar datos' },
        { id: 3, titulo: 'Fin', descripcion: 'Completado' },
      ],
    },
  }),
  'workflow-to-mermaid': (input: any) => {
    const steps = input.workflow?.pasos || [];
    const mermaidLines = ['graph TD'];
    steps.forEach((paso: any, idx: number) => {
      mermaidLines.push(`    A${idx}["${paso.titulo}"]`);
      if (idx > 0) mermaidLines.push(`    A${idx - 1} --> A${idx}`);
    });
    return {
      mermaid: mermaidLines.join('\n'),
    };
  },
  'mermaid-to-png': (input: any) => {
    const mermaidCode = input.mermaid || 'graph TD\n    A["Sin datos"]';
    // Generar SVG simple con el código mermaid
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
      <rect width="800" height="400" fill="#fff"/>
      <text x="20" y="30" font-family="monospace" font-size="14" fill="#333">Mermaid Diagram:</text>
      <text x="20" y="380" font-family="monospace" font-size="11" fill="#666" dominant-baseline="hanging">${mermaidCode.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 150)}</text>
      <g transform="translate(50,80)">
        <rect width="700" height="250" rx="5" fill="#f0f0f0" stroke="#999" stroke-width="2"/>
        <text x="350" y="125" text-anchor="middle" font-family="Arial" font-size="18" fill="#333" dominant-baseline="middle">Diagrama generado desde Mermaid</text>
      </g>
    </svg>`;
    const svgBase64 = Buffer.from(svgCode).toString('base64');
    return {
      png: `data:image/svg+xml;base64,${svgBase64}`,
      svg: svgCode,
      url: '/output.svg',
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
          output = mockFn(currentData);
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
