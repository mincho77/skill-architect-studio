import { readdir, readFile } from 'fs/promises';
import path from 'path';
import Sidebar from '../../components/Sidebar';
import SkillCatalog from '../../components/SkillCatalog';

async function getSkills() {
  try {
    const dir = path.join(process.cwd(), 'skill_db', 'skills');
    const entries = await readdir(dir, { withFileTypes: true });
    const skills: any[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
        // Flat JSON file
        const content = await readFile(path.join(dir, entry.name), 'utf-8');
        skills.push(JSON.parse(content));
      } else if (entry.isDirectory()) {
        // Folder-based skill: look for {folder}/skill.json or {folder}/{version}/skill.json
        const folderPath = path.join(dir, entry.name);
        const candidates = [
          path.join(folderPath, 'skill.json'),
        ];
        // Also check versioned subfolders
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
            break; // use first found
          } catch {}
        }
      }
    }

    return skills;
  } catch (e) { return []; }
}

export default async function SkillsPage() {
  const skills = await getSkills();
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <SkillCatalog initialSkills={skills} />
      </div>
    </div>
  );
}
