/**
 * pins.ts - Pin outputs y dry-run
 * Permite deshabilitar conexiones, especificar valores manuales, validar antes de ejecutar
 */

import { FlowDefinition, ExecutionEnvelope } from '../schemas';

export interface FlowPin {
  node_id: string;
  port_name: string;
  value: unknown; // Valor fijo si está pinned
  pinned: boolean;
}

export interface DryRunOptions {
  validate_only: boolean; // Si true, no ejecutar, solo validar
  pins?: FlowPin[]; // Valores fijos
}

/**
 * Valida un flow ANTES de ejecutar (dry-run)
 * Retorna lista de problemas encontrados
 */
export function dryRunFlow(
  flow: FlowDefinition,
  pins: FlowPin[] = []
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // 1. Verificar que nodos pinned existen
  for (const pin of pins) {
    const node = flow.nodes.find((n) => n.instance_id === pin.node_id);
    if (!node) {
      issues.push(`PIN ERROR: Nodo ${pin.node_id} no existe`);
    } else {
      const hasPort = flow.nodes.some((n) =>
        n.skill_id === node.skill_id ? true : false
      );
      if (!hasPort) {
        issues.push(`PIN ERROR: Puerto ${pin.port_name} no existe en ${pin.node_id}`);
      }
    }
  }

  // 2. Verificar inputs sin conexión ni pin
  for (const node of flow.nodes) {
    // TODO: obtener skill y verificar inputs requeridos
    // Para cada input requerido:
    //   - ¿Tiene conexión entrante? ✅
    //   - ¿Tiene pin con valor? ✅
    //   - Si no → issue: "Input requerido sin valor"
  }

  // 3. Verificar tipos compatibles en conexiones
  for (const conn of flow.connections) {
    // TODO: validar TYPE_COMPATIBILITY
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Aplica pins a un contexto de ejecución
 * (reemplaza valores de inputs por valores pinned)
 */
export function applyPins(
  context: Record<string, ExecutionEnvelope>,
  pins: FlowPin[]
): Record<string, ExecutionEnvelope> {
  const applied = { ...context };

  for (const pin of pins.filter((p) => p.pinned)) {
    if (!applied[pin.node_id]) {
      applied[pin.node_id] = {
        status: 'success',
        outputs: {},
      };
    }
    applied[pin.node_id].outputs[pin.port_name] = pin.value;
  }

  return applied;
}

/**
 * Desabilita una conexión (útil para debugging)
 */
export function disableConnection(
  flow: FlowDefinition,
  connId: string
): FlowDefinition {
  return {
    ...flow,
    connections: flow.connections.filter((c) => c.id !== connId),
  };
}
