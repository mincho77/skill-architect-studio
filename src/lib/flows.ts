import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { FlowDefinition } from './schemas';

const FLOWS_DIR = path.join(process.cwd(), 'skill_db', 'flows');

export async function getFlowV2(id: string): Promise<FlowDefinition | null> {
  try {
    const flowPath = path.join(FLOWS_DIR, `${id}.json`);
    const content = await readFile(flowPath, 'utf-8');
    const flow = JSON.parse(content);
    if (flow.schema_version === '2.0') return flow as FlowDefinition;
    return {
      id: flow.id,
      name: flow.name,
      schema_version: '2.0',
      rev: 1,
      nodes: [],
      connections: [],
      flow_inputs: [],
      flow_outputs: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (e) {
    return null;
  }
}

export async function listFlows(): Promise<FlowDefinition[]> {
  try {
    const files = await readdir(FLOWS_DIR);
    const flows = await Promise.all(
      files.filter(f => f.endsWith('.json')).map(f => getFlowV2(f.replace('.json', '')))
    );
    return flows.filter(Boolean) as FlowDefinition[];
  } catch (e) {
    console.error('Error listando flows:', e);
    return [];
  }
}
