import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function generateSkillMD(skill: any): string {
  const inputs = (skill.inputs || [])
    .map((i: any) => `- ${i.nombre}: ${i.tipo}${i.descripcion ? ` | ${i.descripcion}` : ''}`)
    .join('\n');

  const outputs = (skill.outputs || [])
    .map((o: any) => `- ${o.nombre}: ${o.tipo}${o.descripcion ? ` | ${o.descripcion}` : ''}`)
    .join('\n');

  const slug = skill.nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `---
name: "${skill.nombre}"
description: "${skill.descripcion}"
version: "1.0.0"
category: "code"
tags: []
---

## Descripción

${skill.descripcion}

## Inputs

${inputs || '- (sin entradas)'}

## Outputs

${outputs || '- (sin salidas)'}

## Comportamiento

Define aquí el comportamiento esperado del skill.

## Referencia

Ver carpeta \`reference/\` para documentación de apoyo.

## Scripts

Ver carpeta \`scripts/\` para el código ejecutable.
`;
}

export async function POST(request: Request) {
  try {
    const { skill } = await request.json();

    if (!skill?.nombre) {
      return Response.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    const slug = skill.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const skillId = skill.id || `skill-${slug}-${Date.now().toString(36)}`;
    const folderName = slug;
    const skillDir = path.join(process.cwd(), 'skill_db', 'skills', folderName);

    // Create folder structure
    await mkdir(skillDir, { recursive: true });
    await mkdir(path.join(skillDir, 'reference'), { recursive: true });
    await mkdir(path.join(skillDir, 'scripts'), { recursive: true });
    await mkdir(path.join(skillDir, 'assets'), { recursive: true });

    // Write SKILL.md
    const skillMd = generateSkillMD(skill);
    await writeFile(path.join(skillDir, 'SKILL.md'), skillMd, 'utf-8');

    // Write skill.json for compatibility with existing registry
    const skillJson = { ...skill, id: skillId, slug, folderName };
    await writeFile(path.join(skillDir, 'skill.json'), JSON.stringify(skillJson, null, 2), 'utf-8');

    // Also write placeholder README files in subdirs
    await writeFile(
      path.join(skillDir, 'reference', 'README.md'),
      `# Referencia\n\nDocumentación de apoyo para el skill **${skill.nombre}**.\n`,
      'utf-8'
    );
    await writeFile(
      path.join(skillDir, 'scripts', 'README.md'),
      `# Scripts\n\nCódigo ejecutable del skill **${skill.nombre}**.\n`,
      'utf-8'
    );
    await writeFile(
      path.join(skillDir, 'assets', 'README.md'),
      `# Assets\n\nFuentes, íconos y plantillas del skill **${skill.nombre}**.\n`,
      'utf-8'
    );

    return Response.json({ success: true, skillId, slug, folderName, path: skillDir });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
