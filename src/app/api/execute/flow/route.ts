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
  'mermaid-to-png': (input: any) => ({
    png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    url: '/output.png',
  }),
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
