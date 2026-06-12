import { runFlow } from '@/lib/engine';
import { getFlowV2 } from '@/lib/flows';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { inputs = {} } = body;

    const flow = await getFlowV2(id);
    if (!flow) {
      return Response.json(
        { error: { code: 'FLOW_NOT_FOUND', mensaje: `Flow ${id} no encontrado` } },
        { status: 404 }
      );
    }

    const execRecord = await runFlow(flow, inputs, { timeout_ms: 1800000 });

    const resultsDir = path.join('skill_db', 'results', execRecord.execution_id);
    await mkdir(resultsDir, { recursive: true });
    await writeFile(
      path.join(resultsDir, 'execution.json'),
      JSON.stringify(execRecord, null, 2)
    );

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
