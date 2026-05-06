import { type PublicEnv, parsePublicEnv } from "./schema";

let cachedEnv: PublicEnv | undefined;

export function getPublicEnv(): PublicEnv {
  cachedEnv ??= parsePublicEnv(process.env);
  return cachedEnv;
}
