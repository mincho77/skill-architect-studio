import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ExecutionEnvelope } from '../schemas';
import { parseEnvelope, redactSecrets } from './envelope';

export interface ExecuteSkillOptions {
  workdir: string;
  timeout_ms: number;
  skill_id: string;
  skill_name: string;
  skill_approved: boolean;
  package_path?: string;
  entrypoint?: string;
  runtime?: 'python3' | 'node' | 'bash';
  resolved_inputs: Record<string, unknown>;
  secrets_map: Record<string, string>;
}

export async function executeSkill(options: ExecuteSkillOptions): Promise<ExecutionEnvelope> {
  const {
    workdir,
    timeout_ms,
    skill_approved,
    package_path,
    entrypoint,
    runtime,
    resolved_inputs,
    secrets_map,
  } = options;

  if (!skill_approved) {
    return {
      status: 'error',
      outputs: {},
      error: 'SKILL_NO_APROBADO',
    };
  }

  if (entrypoint && package_path) {
    const resolved = path.resolve(package_path, entrypoint);
    const normalized = path.normalize(resolved);
    const packageNorm = path.normalize(path.resolve(package_path));
    if (!normalized.startsWith(packageNorm + path.sep)) {
      return {
        status: 'error',
        outputs: {},
        error: 'ENTRYPOINT_FUERA_DE_PAQUETE',
      };
    }
  }

  const args: string[] = [];
  for (const [key, value] of Object.entries(resolved_inputs)) {
    args.push(`--${key.replace(/_/g, '-')}`);
    args.push(String(value));
  }

  try {
    if (!fs.existsSync(workdir)) {
      fs.mkdirSync(workdir, { recursive: true });
    }
  } catch (e) {
    return {
      status: 'error',
      outputs: {},
      error: `No se pudo crear workdir`,
    };
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const child = spawn(runtime || 'python3', [entrypoint || '', ...args], {
      cwd: workdir,
      shell: false,
      timeout: timeout_ms,
      maxBuffer: 10 * 1024 * 1024,
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, timeout_ms);

    child.stdout?.on('data', (data) => {
      stdout += data.toString('utf-8');
    });
    child.stderr?.on('data', (data) => {
      stderr += data.toString('utf-8');
    });

    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const envelope = parseEnvelope(stdout, stderr, exitCode || 0);
      envelope.duracion_ms = Date.now() - startTime;
      resolve(envelope);
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        status: 'error',
        outputs: {},
        error: `Spawn error: ${String(err)}`,
      });
    });
  });
}
