import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { skill } = await request.json();

    if (!skill?.id) {
      return Response.json({ error: 'ID requerido' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'skill_db', 'skills', `${skill.id}.json`);
    await writeFile(filePath, JSON.stringify(skill, null, 2), 'utf-8');

    return Response.json({ success: true, skill });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
