import { readdir, readFile } from 'fs/promises';
import path from 'path';
import Sidebar from '../../components/Sidebar';
import SkillCatalog from '../../components/SkillCatalog';

async function getSkills() {
  try {
    const dir = path.join(process.cwd(), 'skill_db', 'skills');
    const files = await readdir(dir);
    const skills = await Promise.all(
      files.filter(f => f.endsWith('.json') && !f.startsWith('.')).map(async f => {
        const content = await readFile(path.join(dir, f), 'utf-8');
        return JSON.parse(content);
      })
    );
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
