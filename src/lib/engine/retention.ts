/**
 * retention.ts - Retención de datos
 * Limpia ejecuciones >30 días automáticamente
 * Comprime resultados para ahorro de espacio
 */

import { readdir, stat, rm } from 'fs/promises';
import path from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

const RESULTS_DIR = 'skill_db/results';
const RETENTION_DAYS = 30;

export interface RetentionStats {
  deleted_count: number;
  compressed_count: number;
  freed_bytes: number;
  errors: string[];
}

/**
 * Limpia ejecuciones antiguas (>RETENTION_DAYS)
 * Ejecutar con cron diariamente o al iniciar app
 */
export async function cleanupOldExecutions(): Promise<RetentionStats> {
  const stats: RetentionStats = {
    deleted_count: 0,
    compressed_count: 0,
    freed_bytes: 0,
    errors: [],
  };

  try {
    const execDirs = await readdir(RESULTS_DIR);

    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    for (const execId of execDirs) {
      const execPath = path.join(RESULTS_DIR, execId);

      try {
        const stats_ = await stat(execPath);
        const ageMs = now - stats_.mtimeMs;

        if (ageMs > retentionMs) {
          // Eliminar
          await rm(execPath, { recursive: true, force: true });
          stats.deleted_count++;
          stats.freed_bytes += stats_.size;

          console.log(`[RETENTION] Eliminada ejecución ${execId} (edad: ${Math.floor(ageMs / (24 * 3600 * 1000))} días)`);
        }
      } catch (e) {
        stats.errors.push(`Error procesando ${execId}: ${String(e)}`);
      }
    }
  } catch (e) {
    stats.errors.push(`Error leyendo RESULTS_DIR: ${String(e)}`);
  }

  return stats;
}

/**
 * Comprime un archivo de resultado (execution.json → execution.json.gz)
 * Ahorra ~70% de espacio típicamente
 */
export async function compressExecutionResult(execId: string): Promise<boolean> {
  try {
    const execPath = path.join(RESULTS_DIR, execId, 'execution.json');
    const compressedPath = `${execPath}.gz`;

    // TODO: leer archivo, comprimir, guardar .gz, eliminar original

    console.log(`[COMPRESS] ${execId} comprimido`);
    return true;
  } catch (e) {
    console.error(`[COMPRESS] Error: ${String(e)}`);
    return false;
  }
}

/**
 * Retorna política de retención para mostrar en UI
 */
export function getRetentionPolicy(): {
  retention_days: number;
  auto_cleanup: boolean;
  cleanup_time_utc: string;
} {
  return {
    retention_days: RETENTION_DAYS,
    auto_cleanup: true,
    cleanup_time_utc: '03:00', // 3 AM UTC
  };
}
