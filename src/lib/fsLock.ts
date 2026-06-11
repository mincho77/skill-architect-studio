const locks = new Map<string, Promise<void>>();

export async function withLock<T>(path: string, fn: () => Promise<T> | T): Promise<T> {
  const pending = locks.get(path) ?? Promise.resolve();
  let resolve: () => void;
  const nextLock = new Promise<void>((res) => {
    resolve = res;
  });
  locks.set(path, nextLock);
  try {
    await pending;
    return await fn();
  } finally {
    resolve!();
  }
}

export function withLockSync<T>(path: string, fn: () => T): T {
  return fn();
}
