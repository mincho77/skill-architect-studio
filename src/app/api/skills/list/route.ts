import { readdir, readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'skill_db', 'skills');
    const entries = await readdir(dir, { withFileTypes: true });
    const skills: any[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
        const content = await readFile(path.join(dir, entry.name), 'utf-8');
        skills.push(JSON.parse(content));
      } else if (entry.isDirectory()) {
        const folderPath = path.join(dir, entry.name);
        const candidates = [path.join(folderPath, 'skill.json')];
        try {
          const subEntries = await readdir(folderPath, { withFileTypes: true });
          for (const sub of subEntries) {
            if (sub.isDirectory()) {
              candidates.push(path.join(folderPath, sub.name, 'skill.json'));
            }
          }
        } catch {}

        for (const candidate of candidates) {
          try {
            const content = await readFile(candidate, 'utf-8');
            skills.push(JSON.parse(content));
            break;
          } catch {}
        }
      }
    }

    return Response.json({ skills });
  } catch (e) {
    return Response.json({ skills: [] });
  }
}
