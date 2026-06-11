import { runFlow } from '@/lib/engine';
import { getFlowV2 } from '@/lib/flows';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { inputs = {} } = body;

    // 1. Obtener flow (dual-read v1/v2)
    const flow = await getFlowV2(id);
    if (!flow) {
      return Response.json(
        { error: { code: 'FLOW_NOT_FOUND', mensaje: `Flow ${id} no encontrado` } },
        { status: 404 }
      );
    }

    // 2. Ejecutar con motor v2
    const execRecord = await runFlow(flow, inputs, { timeout_ms: 1800000 });

    // 3. Guardar resultado
    const resultsDir = path.join('skill_db', 'results', execRecord.execution_id);
    await mkdir(resultsDir, { recursive: true });
    await writeFile(
      path.join(resultsDir, 'execution.json'),
      JSON.stringify(execRecord, null, 2)
    );

    // 4. Responder con 202 (aceptada)
    return Response.json(
      {
        execution_id: execRecord.execution_id,
        status: execRecord.status,
        message: 'Ejecución completada',
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
