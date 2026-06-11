#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const SKILLS_DIR = 'skill_db/skills';
const FLOWS_DIR = 'skill_db/flows';
const REPORT_PATH = 'migration_report.json';

async function migrate() {
  console.log('🔄 MIGRACIÓN v1 → v2');
  const report: any = {
    timestamp: new Date().toISOString(),
    skills_migrados: [],
    flows_migrados: [],
    conexiones_inferidas: [],
    errores: [],
  };

  if (fs.existsSync(SKILLS_DIR)) {
    const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const p = path.join(SKILLS_DIR, file);
        let skill = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (skill.schema_version === '2.0') continue;
        
        skill.schema_version = '2.0';
        skill.ejecucion_aprobada = true;
        skill.inputs = skill.inputs || [];
        skill.outputs = skill.outputs || [];
        skill.inputs.forEach((i: any) => { i.requerido ??= true; });
        if (skill.outputs.length === 0) {
          skill.outputs.push({ nombre: 'stdout_text', tipo: 'String' });
        }
        
        const historyDir = path.join(SKILLS_DIR, 'history', skill.id);
        if (!fs.existsSync(historyDir)) {
          fs.mkdirSync(historyDir, { recursive: true });
          fs.writeFileSync(path.join(historyDir, `${skill.version}.json`), JSON.stringify(skill, null, 2));
        }
        
        fs.writeFileSync(p, JSON.stringify(skill, null, 2));
        console.log(`  ✓ ${skill.id}`);
        report.skills_migrados.push(skill.id);
      } catch (e) {
        report.errores.push({ file, error: String(e) });
      }
    }
  }

  if (fs.existsSync(FLOWS_DIR)) {
    const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const p = path.join(FLOWS_DIR, file);
        let flow = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (flow.schema_version === '2.0') continue;

        const skills_en_orden = flow.skills_en_orden || [];
        const nodes = skills_en_orden.map((id: string, i: number) => ({
          instance_id: `n${i+1}-${nanoid(6)}`,
          skill_id: id,
          skill_version: '1.0.0',
          label: id,
          position: { x: 100 + i * 320, y: 200 },
        }));

        const flowV2 = {
          id: flow.id,
          name: flow.name,
          schema_version: '2.0',
          rev: 1,
          nodes,
          connections: [],
          flow_inputs: [],
          flow_outputs: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          migrated_from_v1: true,
        };

        fs.writeFileSync(p, JSON.stringify(flowV2, null, 2));
        console.log(`  ✓ ${flow.id}`);
        report.flows_migrados.push(flow.id);
      } catch (e) {
        report.errores.push({ file, error: String(e) });
      }
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n✅ Migración completada`);
  console.log(`   Skills: ${report.skills_migrados.length}`);
  console.log(`   Flows: ${report.flows_migrados.length}`);
  console.log(`   Errores: ${report.errores.length}`);
}

migrate().catch(e => { console.error('❌', e); process.exit(1); });
