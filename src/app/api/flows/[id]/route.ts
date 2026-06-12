import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { flow, rev: clientRev } = body;

    const flowPath = path.join('skill_db', 'flows', `${id}.json`);
    const currentContent = await readFile(flowPath, 'utf-8');
    const currentFlow = JSON.parse(currentContent);

    if (currentFlow.rev !== clientRev) {
      return Response.json(
        {
          error: {
            code: 'CONFLICTO_EDICION',
            mensaje: `Rev no coincide`,
          },
          flow: currentFlow,
        },
        { status: 409 }
      );
    }

    flow.rev = (currentFlow.rev || 0) + 1;
    flow.updated_at = new Date().toISOString();

    const tmpPath = `${flowPath}.tmp`;
    await writeFile(tmpPath, JSON.stringify(flow, null, 2));

    return Response.json({ success: true, flow });
  } catch (e) {
    return Response.json(
      { error: { code: 'FLOW_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}
