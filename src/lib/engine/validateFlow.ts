import { FlowDefinition } from '../schemas';
import { hasCycle } from './topology';

export interface ValidationError {
  code: string;
  node?: string;
  port?: string;
  mensaje: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateFlow(flow: FlowDefinition): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    if (hasCycle(flow)) {
      errors.push({
        code: 'CICLO_DETECTADO',
        mensaje: 'El flow contiene un ciclo',
      });
    }
  } catch (e) {
    errors.push({
      code: 'CICLO_DETECTADO',
      mensaje: String(e),
    });
  }

  for (const conn of flow.connections) {
    const fromNode = flow.nodes.find((n) => n.instance_id === conn.from.node);
    if (!fromNode) {
      errors.push({
        code: 'NODO_NO_EXISTE',
        node: conn.from.node,
        mensaje: `Nodo ${conn.from.node} no existe`,
      });
    }
    const toNode = flow.nodes.find((n) => n.instance_id === conn.to.node);
    if (!toNode) {
      errors.push({
        code: 'NODO_NO_EXISTE',
        node: conn.to.node,
        mensaje: `Nodo ${conn.to.node} no existe`,
      });
    }
  }

  const inputConnections = new Map<string, number>();
  for (const conn of flow.connections) {
    const key = `${conn.to.node}:${conn.to.port}`;
    inputConnections.set(key, (inputConnections.get(key) || 0) + 1);
  }
  for (const [key, count] of inputConnections.entries()) {
    if (count > 1) {
      const [nodeId, portName] = key.split(':');
      errors.push({
        code: 'FAN_IN_PROHIBIDO',
        node: nodeId,
        port: portName,
        mensaje: `Input tiene ${count} conexiones`,
      });
    }
  }

  for (const node of flow.nodes) {
    if (node.missing_skill) {
      errors.push({
        code: 'SKILL_FALTANTE',
        node: node.instance_id,
        mensaje: `Skill ${node.skill_id} no existe`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFlowQuick(flow: FlowDefinition): boolean {
  return !hasCycle(flow);
}
