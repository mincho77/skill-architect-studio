import { FlowDefinition, ExecutionRecord } from '../schemas';
import { topologicalLevels } from './topology';
import { validateFlow } from './validateFlow';

export interface RunFlowOptions {
  timeout_ms?: number;
}

export async function runFlow(
  flow: FlowDefinition,
  flowInputValues: Record<string, unknown>,
  options: RunFlowOptions = {}
): Promise<ExecutionRecord> {
  const startTime = Date.now();
  const { timeout_ms = 1800000 } = options;

  const validation = validateFlow(flow);
  if (!validation.valid) {
    return {
      execution_id: `EXE-${Date.now()}`,
      flow_id: flow.id,
      status: 'error',
      flow_inputs_values: flowInputValues,
      steps: [],
      context: {},
      flow_outputs_values: {},
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    };
  }

  let levels: string[][];
  try {
    levels = topologicalLevels(flow);
  } catch (e) {
    return {
      execution_id: `EXE-${Date.now()}`,
      flow_id: flow.id,
      status: 'error',
      flow_inputs_values: flowInputValues,
      steps: [],
      context: {},
      flow_outputs_values: {},
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    };
  }

  const execId = `EXE-${Date.now()}`;
  const record: ExecutionRecord = {
    execution_id: execId,
    flow_id: flow.id,
    status: 'running',
    flow_inputs_values: flowInputValues,
    steps: [],
    context: {},
    flow_outputs_values: {},
    started_at: new Date().toISOString(),
  };

  record.status = 'success';
  record.finished_at = new Date().toISOString();

  return record;
}

export function cancelExecution(execId: string): void {
  // TODO
}
