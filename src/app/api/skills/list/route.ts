import { readdir, readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'skill_db', 'skills');
    const files = await readdir(dir);
    const skills = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          const content = await readFile(path.join(dir, f), 'utf-8');
          return JSON.parse(content);
        })
    );
    return Response.json({ skills });
  } catch (e) {
    return Response.json({ skills: [] });
  }
}
