// src/lib/engine/envelope.ts — Parser de respuestas de skills
import { ExecutionEnvelope } from '../schemas';

export function parseEnvelope(
  stdout: string,
  stderr: string,
  exitCode: number,
  outputJsonPath?: string,
  outputJsonContent?: string
): ExecutionEnvelope {
  if (outputJsonContent) {
    try {
      const parsed = JSON.parse(outputJsonContent);
      if (parsed.status && parsed.outputs !== undefined && parsed.error !== undefined) {
        return {
          status: parsed.status,
          outputs: parsed.outputs || {},
          error: parsed.error,
          duracion_ms: parsed.duracion_ms,
          logs: parsed.logs,
        };
      }
    } catch (e) {
      return {
        status: 'error',
        outputs: {},
        error: `output.json no es JSON válido: ${String(e)}`,
      };
    }
  }

  if (exitCode === 0) {
    const lines = stdout.trim().split('\n').filter((l) => l.trim());
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      try {
        const parsed = JSON.parse(lastLine);
        if (typeof parsed === 'object' && parsed !== null && 'outputs' in parsed) {
          return {
            status: parsed.status || 'success',
            outputs: parsed.outputs || {},
            error: parsed.error || null,
            duracion_ms: parsed.duracion_ms,
            logs: parsed.logs,
          };
        }
        return {
          status: 'success',
          outputs: { result: parsed },
          error: null,
        };
      } catch (e) {
        // JSON parse failed, continuar a legacy
      }
    }
  }

  if (exitCode !== 0) {
    return {
      status: 'error',
      outputs: {},
      error: `Exit code ${exitCode}: ${stderr || stdout}`.slice(0, 1000),
    };
  }

  return {
    status: 'success',
    outputs: { stdout_text: stdout },
    error: null,
  };
}

export function redactSecrets(
  text: string,
  secretsMap: Record<string, string>
): string {
  let result = text;
  for (const [name, value] of Object.entries(secretsMap)) {
    if (value) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), '***');
    }
  }
  return result;
}

export function validateEnvelopeContract(
  envelope: ExecutionEnvelope,
  declaredOutputNames: string[]
): string[] {
  const errors: string[] = [];
  for (const name of declaredOutputNames) {
    if (!(name in envelope.outputs)) {
      errors.push(`OUTPUT_DECLARADO_AUSENTE: ${name}`);
    }
  }
  return errors;
}
