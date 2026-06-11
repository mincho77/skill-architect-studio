#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const SKILLS_DIR = 'skill_db/skills';
const FLOWS_DIR = 'skill_db/flows';

async function migrate() {
  console.log('🔄 MIGRACIÓN v1 → v2 (FUERZA remigración de vacíos)');

  if (fs.existsSync(FLOWS_DIR)) {
    const files = fs.readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const p = path.join(FLOWS_DIR, file);
        let flow = JSON.parse(fs.readFileSync(p, 'utf-8'));

        // Skip solo si ya tiene nodes
        if (flow.nodes?.length > 0) {
          console.log(`  ⊘ ${flow.id} (ya tiene ${flow.nodes.length} nodos)`);
          continue;
        }

        // Extraer skills en orden: pipeline O skills_en_orden
        const skills_en_orden =
          flow.skills_en_orden || (flow.pipeline?.map((p: any) => p.skill_id) || []);

        if (skills_en_orden.length === 0) {
          console.log(`  ⚠️  ${flow.id} (sin skills, saltando)`);
          continue;
        }

        const nodes = skills_en_orden.map((id: string, i: number) => ({
          instance_id: `n${i + 1}-${nanoid(6)}`,
          skill_id: id,
          skill_version: '1.0.0',
          label: id,
          position: { x: 100 + i * 320, y: 200 },
        }));

        flow.schema_version = '2.0';
        flow.rev = 1;
        flow.nodes = nodes;
        flow.connections = [];
        flow.flow_inputs = [];
        flow.flow_outputs = [];
        flow.created_at = new Date().toISOString();
        flow.updated_at = new Date().toISOString();
        flow.migrated_from_v1 = true;

        fs.writeFileSync(p, JSON.stringify(flow, null, 2));
        console.log(`  ✓ ${flow.id} (${nodes.length} nodos creados)`);
      } catch (e) {
        console.error(`  ❌ ${file}: ${String(e)}`);
      }
    }
  }

  console.log('\n✅ Migración completada');
}

migrate().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
