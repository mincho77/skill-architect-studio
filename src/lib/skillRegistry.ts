import fs from 'fs';
import path from 'path';
import { SkillDefinition } from './schemas';

const SKILLS_DIR = 'skill_db/skills';
const HISTORY_DIR = 'skill_db/skills/history';

export async function getSkill(id: string, version?: string): Promise<SkillDefinition | null> {
  if (version) {
    const historyFile = path.join(HISTORY_DIR, id, `${version}.json`);
    if (fs.existsSync(historyFile)) {
      try {
        const content = fs.readFileSync(historyFile, 'utf-8');
        return JSON.parse(content) as SkillDefinition;
      } catch (e) {
        console.warn(`Error leyendo history:`, e);
      }
    }
  }

  const skillFile = path.join(SKILLS_DIR, `${id}.json`);
  if (fs.existsSync(skillFile)) {
    try {
      const content = fs.readFileSync(skillFile, 'utf-8');
      return JSON.parse(content) as SkillDefinition;
    } catch (e) {
      console.warn(`Error leyendo skill ${id}:`, e);
    }
  }

  return null;
}

export async function listSkills(): Promise<SkillDefinition[]> {
  const skills: SkillDefinition[] = [];

  if (fs.existsSync(SKILLS_DIR)) {
    const files = fs.readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(SKILLS_DIR, file), 'utf-8');
        const skill = JSON.parse(content) as SkillDefinition;
        skills.push(skill);
      } catch (e) {
        console.warn(`Error leyendo ${file}`, e);
      }
    }
  }

  return skills;
}

export async function upsertSkill(skill: SkillDefinition): Promise<void> {
  const skillFile = path.join(SKILLS_DIR, `${skill.id}.json`);

  if (fs.existsSync(skillFile)) {
    try {
      const oldContent = fs.readFileSync(skillFile, 'utf-8');
      const oldSkill = JSON.parse(oldContent) as SkillDefinition;

      const historyDir = path.join(HISTORY_DIR, skill.id);
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      const historyFile = path.join(historyDir, `${oldSkill.version}.json`);
      if (!fs.existsSync(historyFile)) {
        fs.writeFileSync(historyFile, oldContent, 'utf-8');
      }
    } catch (e) {
      console.warn(`Error guardando en history:`, e);
    }
  }

  const tmpFile = `${skillFile}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(skill, null, 2), 'utf-8');
    fs.renameSync(tmpFile, skillFile);
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    throw e;
  }
}

export async function getSkillHistory(id: string): Promise<string[]> {
  const historyDir = path.join(HISTORY_DIR, id);
  if (!fs.existsSync(historyDir)) {
    return [];
  }

  try {
    return fs
      .readdirSync(historyDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort();
  } catch (e) {
    console.warn(`Error leyendo historial:`, e);
    return [];
  }
}
