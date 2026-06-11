import { runFlow } from '@/lib/engine';
import { getFlowV2 } from '@/lib/flows'; // TODO: crear este helper

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { inputs } = body;

    // 1. Obtener flow (dual-read v1/v2)
    // const flow = await getFlowV2(id);
    // Por ahora, stub

    // 2. Ejecutar con motor v2
    // const record = await runFlow(flow, inputs || {});

    // Responder con 202 (aceptada, ejecutando async)
    return Response.json(
      {
        execution_id: `EXE-${Date.now()}`,
        status: 'running',
        message: 'Ejecución iniciada',
      },
      { status: 202 }
    );
  } catch (e) {
    return Response.json(
      { error: { code: 'EXECUTE_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}
