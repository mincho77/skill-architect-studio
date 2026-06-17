import AdmZip from 'adm-zip';
import { writeFile, mkdir, readFile, readdir, unlink } from 'fs/promises';
import path from 'path';
import { parseSKILLMD, generateSkillId, mapDominio } from '@/lib/skillParser';

function incrementVersion(version: string): string {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1] || '0'}.${patch}`;
}

async function findExistingSkill(name: string): Promise<any | null> {
  try {
    const dir = path.join(process.cwd(), 'skill_db', 'skills');
    const files = await readdir(dir);
    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('.')) {
        const content = await readFile(path.join(dir, file), 'utf-8');
        const skill = JSON.parse(content);
        if (skill.name === name) return skill;
      }
    }
  } catch (e) {}
  return null;
}

async function findAllVersions(name: string): Promise<any[]> {
  try {
    const dir = path.join(process.cwd(), 'skill_db', 'skills');
    const files = await readdir(dir);
    const versions = [];
    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('.')) {
        const content = await readFile(path.join(dir, file), 'utf-8');
        const skill = JSON.parse(content);
        if (skill.name === name) versions.push(skill);
      }
    }
    return versions.sort((a, b) => b.version.localeCompare(a.version));
  } catch (e) {}
  return [];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string; // 'replace' o 'new-version'

    if (!file || !file.name.endsWith('.zip')) {
      return Response.json({ error: 'Se requiere un archivo .zip' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();

    let skillmdContent: string | null = null;
    let skillJsonContent: any = null;

    for (const entry of entries) {
      if (entry.entryName.endsWith('SKILL.md')) {
        skillmdContent = entry.getData().toString('utf-8');
      } else if (entry.entryName.endsWith('skill.json')) {
        skillJsonContent = JSON.parse(entry.getData().toString('utf-8'));
      }
    }

    if (!skillmdContent) {
      return Response.json({ error: 'SKILL.md no encontrado en el ZIP' }, { status: 400 });
    }

    const metadata = parseSKILLMD(skillmdContent);
    const dominio = mapDominio(metadata.category);
    const existing = await findExistingSkill(metadata.name);

    // Si existe pero no hay acción, PREGUNTAR
    if (existing && !action) {
      const versions = await findAllVersions(metadata.name);
      return Response.json({
        exists: true,
        existingSkill: existing,
        allVersions: versions,
        message: `El skill "${metadata.name}" ya existe (v${existing.version}). ¿Qué deseas hacer?`,
        options: [
          { action: 'replace', label: `Reemplazar v${existing.version}`, description: 'Sobrescribe la versión actual' },
          { action: 'new-version', label: `Crear v${incrementVersion(existing.version)}`, description: 'Crea una nueva versión y borra las antiguas' }
        ]
      }, { status: 202 }); // 202 Accepted (pendiente de confirmación)
    }

    let skillId = generateSkillId(metadata.name);
    let finalVersion = metadata.version;

    if (action === 'replace' && existing) {
      // Reutiliza el ID existente, solo actualiza versión si el ZIP es más nuevo
      skillId = existing.id;
      finalVersion = existing.version; // Mantiene la versión, no la incrementa
    } else if (action === 'new-version' && existing) {
      // Incrementa versión y genera ID nuevo
      finalVersion = incrementVersion(existing.version);
      skillId = generateSkillId(metadata.name);
      
      // Borra TODAS las versiones anteriores
      const allVersions = await findAllVersions(metadata.name);
      for (const old of allVersions) {
        try {
          const oldDefPath = path.join(process.cwd(), 'skill_db', 'skills', `${old.id}.json`);
          await unlink(oldDefPath);
          const oldDir = path.join(process.cwd(), 'skill_db', 'skills', old.id);
          // No borramos el directorio por seguridad, solo el JSON
        } catch (e) {
          console.error(`Error borrando versión anterior ${old.id}:`, e);
        }
      }
    }

    // Crear directorio y guardar archivos
    const skillDir = path.join(process.cwd(), 'skill_db', 'skills', skillId);
    await mkdir(skillDir, { recursive: true });

    for (const entry of entries) {
      if (!entry.isDirectory && !entry.entryName.includes('SKILL.md') && !entry.entryName.includes('skill.json')) {
        const filePath = path.join(skillDir, entry.entryName);
        const fileDir = path.dirname(filePath);
        await mkdir(fileDir, { recursive: true });
        await writeFile(filePath, entry.getData());
      }
    }

    // Crear definición
    const skillDef = {
      id: skillId,
      name: metadata.name,
      version: finalVersion,
      description: metadata.description,
      dominio,
      status: 'existente',
      tags: [...metadata.tags, dominio],
      inputs: metadata.inputs,
      outputs: metadata.outputs,
      modos: metadata.modos,
      package_dir: `skill_db/skills/${skillId}`,
      created_at: new Date().toISOString(),
      schema_version: '2.0',
      ejecucion_aprobada: false,
      ...skillJsonContent,
    };

    const defPath = path.join(process.cwd(), 'skill_db', 'skills', `${skillId}.json`);
    await writeFile(defPath, JSON.stringify(skillDef, null, 2));

    return Response.json({
      success: true,
      skill: skillDef,
      action,
      message: action === 'replace' 
        ? `✅ Reemplazado: v${finalVersion}`
        : `✅ Nueva versión: v${finalVersion} (versiones anteriores eliminadas)`
    });
  } catch (e) {
    console.error('Error importando ZIP:', e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
