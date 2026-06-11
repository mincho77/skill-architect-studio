import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const skillPath = path.join('skill_db', 'skills', `${id}.json`);
    const content = await readFile(skillPath, 'utf-8');
    let skill = JSON.parse(content);

    skill.ejecucion_aprobada = true;
    skill.aprobado_por = 'user@example.com'; // TODO: obtener user
    skill.fecha_aprobacion = new Date().toISOString();

    const tmpPath = `${skillPath}.tmp`;
    await writeFile(tmpPath, JSON.stringify(skill, null, 2));

    return Response.json({
      success: true,
      skill,
    });
  } catch (e) {
    return Response.json(
      { error: { code: 'APPROVE_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}
