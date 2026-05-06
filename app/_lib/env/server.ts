import "server-only";

import { parseServerEnv, type ServerEnv } from "./schema";

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}

export function resetServerEnvCacheForTests(): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("resetServerEnvCacheForTests is only available in tests");
  }

  cachedEnv = undefined;
}
