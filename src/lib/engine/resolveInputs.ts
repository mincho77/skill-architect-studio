import { FlowDefinition, TYPE_COMPATIBILITY, ExecutionEnvelope } from '../schemas';

export interface ResolvedInputs {
  values: Record<string, unknown>;
  errors: string[];
}

export async function resolveInputs(
  flow: FlowDefinition,
  nodeId: string,
  context: Record<string, ExecutionEnvelope>,
  flowInputValues: Record<string, unknown>
): Promise<ResolvedInputs> {
  const node = flow.nodes.find((n) => n.instance_id === nodeId);
  if (!node) {
    return { values: {}, errors: ['NODO_NO_ENCONTRADO'] };
  }

  const values: Record<string, unknown> = {};
  const errors: string[] = [];

  return { values, errors };
}

function coerceValue(value: unknown, targetType: string): unknown | Error {
  switch (targetType) {
    case 'String':
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (value && typeof value === 'object') return JSON.stringify(value);
      return String(value);
    case 'Number':
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const n = parseFloat(value);
        return isNaN(n) ? new Error(`No es número: ${value}`) : n;
      }
      return new Error(`No puede coercionar a Number`);
    case 'Boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        if (value === 'true' || value === '1') return true;
        if (value === 'false' || value === '0') return false;
        return new Error(`No es booleano: ${value}`);
      }
      return new Error(`No puede coercionar a Boolean`);
    case 'JSON':
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return new Error(`JSON inválido`);
        }
      }
      return new Error(`No puede coercionar a JSON`);
    default:
      return value;
  }
}
