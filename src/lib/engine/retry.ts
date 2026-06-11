/**
 * retry.ts - Lógica de reintentos exponencial
 * Maneja errores recuperables vs fatales
 */

export interface RetryConfig {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
  recoverable_errors: string[]; // códigos que se reintentan
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  max_retries: 3,
  initial_delay_ms: 1000,
  max_delay_ms: 30000,
  backoff_multiplier: 2,
  recoverable_errors: [
    'TIMEOUT',
    'NETWORK_ERROR',
    'TEMP_UNAVAILABLE',
    'RATE_LIMITED',
  ],
};

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.initial_delay_ms;

  for (let attempt = 0; attempt <= config.max_retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;

      const errorCode = (e as any)?.code || '';
      const isRecoverable = config.recoverable_errors.includes(errorCode);

      // No reintentar si no es recuperable O es el último intento
      if (!isRecoverable || attempt === config.max_retries) {
        throw e;
      }

      // Exponential backoff
      await sleep(delay);
      delay = Math.min(delay * config.backoff_multiplier, config.max_delay_ms);

      console.log(
        `[RETRY] Intento ${attempt + 1}/${config.max_retries} después de ${delay}ms`
      );
    }
  }

  throw lastError || new Error('RETRY_EXHAUSTED');
}

export function isRecoverableError(error: any, recoverable: string[]): boolean {
  const code = error?.code || error?.message || '';
  return recoverable.some((r) => code.includes(r));
}
