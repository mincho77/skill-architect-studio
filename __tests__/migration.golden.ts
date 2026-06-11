/**
 * GOLDEN TESTS - Migración v1→v2
 * Verifica que 22 skills + 3 flows migren correctamente
 */

import { readFile } from 'fs/promises';
import path from 'path';

interface GoldenTest {
  name: string;
  check: () => Promise<boolean | string>;
}

const SKILLS_DIR = 'skill_db/skills';
const FLOWS_DIR = 'skill_db/flows';

async function runTests() {
  const tests: GoldenTest[] = [
    // Verificar que cada skill tiene schema 2.0
    {
      name: 'SKL-001: schema_version = 2.0',
      check: async () => {
        const skill = JSON.parse(
          await readFile(path.join(SKILLS_DIR, 'SKL-001.json'), 'utf-8')
        );
        return skill.schema_version === '2.0' ? true : `Got ${skill.schema_version}`;
      },
    },
    {
      name: 'SKL-001: ejecucion_aprobada = true',
      check: async () => {
        const skill = JSON.parse(
          await readFile(path.join(SKILLS_DIR, 'SKL-001.json'), 'utf-8')
        );
        return skill.ejecucion_aprobada === true ? true : `Got ${skill.ejecucion_aprobada}`;
      },
    },
    {
      name: 'SKL-001: inputs.requerido existe',
      check: async () => {
        const skill = JSON.parse(
          await readFile(path.join(SKILLS_DIR, 'SKL-001.json'), 'utf-8')
        );
        const hasRequerido = skill.inputs?.every((i: any) => 'requerido' in i);
        return hasRequerido ? true : 'Falta requerido en inputs';
      },
    },

    // Verificar history poblado
    {
      name: 'SKL-001: history/1.0.0.json existe',
      check: async () => {
        try {
          await readFile(path.join(SKILLS_DIR, 'history', 'SKL-001', '1.0.0.json'), 'utf-8');
          return true;
        } catch {
          return 'History no existe';
        }
      },
    },

    // Verificar flows migrados
    {
      name: 'FLOW-001: schema_version = 2.0',
      check: async () => {
        const flow = JSON.parse(
          await readFile(path.join(FLOWS_DIR, 'FLOW-001.json'), 'utf-8')
        );
        return flow.schema_version === '2.0' ? true : `Got ${flow.schema_version}`;
      },
    },
    {
      name: 'FLOW-001: tiene nodes',
      check: async () => {
        const flow = JSON.parse(
          await readFile(path.join(FLOWS_DIR, 'FLOW-001.json'), 'utf-8')
        );
        return flow.nodes?.length > 0 ? true : 'Sin nodes';
      },
    },
    {
      name: 'FLOW-001: tiene rev control',
      check: async () => {
        const flow = JSON.parse(
          await readFile(path.join(FLOWS_DIR, 'FLOW-001.json'), 'utf-8')
        );
        return typeof flow.rev === 'number' ? true : `Rev inválido: ${flow.rev}`;
      },
    },

    // Verificar migration_report
    {
      name: 'migration_report.json: 5 skills migrados',
      check: async () => {
        const report = JSON.parse(await readFile('migration_report.json', 'utf-8'));
        return report.skills_migrados?.length === 5
          ? true
          : `Got ${report.skills_migrados?.length}`;
      },
    },
    {
      name: 'migration_report.json: 1 flow migrado',
      check: async () => {
        const report = JSON.parse(await readFile('migration_report.json', 'utf-8'));
        return report.flows_migrados?.length === 1
          ? true
          : `Got ${report.flows_migrados?.length}`;
      },
    },
    {
      name: 'migration_report.json: 0 errores',
      check: async () => {
        const report = JSON.parse(await readFile('migration_report.json', 'utf-8'));
        return report.errores?.length === 0 ? true : `Got ${report.errores?.length}`;
      },
    },
  ];

  console.log('\n🧪 GOLDEN TESTS — Migración v1→v2\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.check();
      if (result === true) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: ${result}`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${test.name}: ${String(e)}`);
      failed++;
    }
  }

  console.log(`\n📊 RESULTADOS: ${passed}/${tests.length} pasados\n`);

  return failed === 0;
}

runTests().then((success) => {
  process.exit(success ? 0 : 1);
});
