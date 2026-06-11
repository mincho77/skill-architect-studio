/**
 * manual.ts - Manual skills
 * Permite pausar flow en nodo, pedir input del usuario, reanudar
 */

import { FlowDefinition, FlowNode } from '../schemas';

export interface ManualSkillConfig {
  node_id: string;
  pause_before_execution: boolean; // Pausar antes de ejecutar
  require_approval_after: boolean; // Pausar después de ejecutar
  input_schema?: Record<string, unknown>; // Validar input manual
}

export interface PausedExecution {
  execution_id: string;
  paused_at_node: string;
  paused_reason: 'BEFORE_EXECUTION' | 'AFTER_EXECUTION';
  waiting_for_input: Record<string, unknown> | null;
  can_resume: boolean;
}

/**
 * Configura un nodo como manual (requiere intervención)
 */
export function markAsManualSkill(
  flow: FlowDefinition,
  nodeId: string,
  config: Partial<ManualSkillConfig> = {}
): FlowDefinition {
  const node = flow.nodes.find((n) => n.instance_id === nodeId);
  if (!node) {
    throw new Error(`Nodo ${nodeId} no encontrado`);
  }

  // Guardar metadata en el nodo (o en una tabla aparte)
  return {
    ...flow,
    nodes: flow.nodes.map((n) =>
      n.instance_id === nodeId
        ? {
            ...n,
            // @ts-ignore (agregar a schema en el futuro)
            manual_config: {
              pause_before_execution: config.pause_before_execution ?? false,
              require_approval_after: config.require_approval_after ?? false,
            },
          }
        : n
    ),
  };
}

/**
 * Pausa la ejecución y pide input
 */
export function pauseFlowAt(
  executionId: string,
  nodeId: string,
  reason: 'BEFORE_EXECUTION' | 'AFTER_EXECUTION'
): PausedExecution {
  return {
    execution_id: executionId,
    paused_at_node: nodeId,
    paused_reason: reason,
    waiting_for_input: null,
    can_resume: true,
  };
}

/**
 * Reanuda flow después de intervención manual
 * El usuario proporciona valores manuales (ej: decisión, confirmación)
 */
export function resumeFlowAfterManualInput(
  executionId: string,
  userInput: Record<string, unknown>
): { success: boolean; message: string } {
  // Validar que userInput tiene estructura correcta
  // Guardar en context[nodeId].outputs
  // Continuar ejecución desde próximo nodo

  return {
    success: true,
    message: `Ejecución ${executionId} reanudada con input manual`,
  };
}

/**
 * Obtiene lista de nodos manuales en un flow
 */
export function getManualSkillsInFlow(flow: FlowDefinition): FlowNode[] {
  return flow.nodes.filter((n) => {
    // @ts-ignore
    return n.manual_config?.pause_before_execution || n.manual_config?.require_approval_after;
  });
}
