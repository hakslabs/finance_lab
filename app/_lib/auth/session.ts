const encoder = new TextEncoder();

export const TEMP_AUTH_COOKIE_NAME = "stocklab_m0_session";
export const TEMP_AUTH_TTL_SECONDS = 60 * 60;

export type TemporaryAuthSession = {
  sub: string;
  role: "user" | "admin";
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  try {
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  } catch (error) {
    if (error instanceof DOMException) {
      return null;
    }

    throw error;
  }
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const key = await importSigningKey(secret);
  const decodedSignature = base64UrlDecode(signature);

  if (!decodedSignature) {
    return false;
  }

  const signatureBytes = new Uint8Array(Array.from(decodedSignature));

  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(message));
}

export function createTemporaryAuthSession(role: "user" | "admin" = "user"): TemporaryAuthSession {
  return {
    sub: "m0-local-user",
    role,
    exp: Math.floor(Date.now() / 1000) + TEMP_AUTH_TTL_SECONDS
  };
}

export async function signTemporaryAuthSession(
  session: TemporaryAuthSession,
  secret: string
): Promise<string> {
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(session)));
  const signature = await hmacSign(payload, secret);

  return `${payload}.${signature}`;
}

export async function verifyTemporaryAuthSession(
  token: string | undefined,
  secret: string | undefined,
  nowSeconds = Math.floor(Date.now() / 1000)
): Promise<TemporaryAuthSession | null> {
  if (!token || !secret) {
    return null;
  }

  const [payload, signature, extra] = token.split(".");

  if (!payload || !signature || extra !== undefined) {
    return null;
  }

  if (!(await hmacVerify(payload, signature, secret))) {
    return null;
  }

  const decodedPayload = base64UrlDecode(payload);

  if (!decodedPayload) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(new TextDecoder().decode(decodedPayload)) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }

  if (!isTemporaryAuthSession(parsed) || parsed.exp <= nowSeconds) {
    return null;
  }

  return parsed;
}

function isTemporaryAuthSession(value: unknown): value is TemporaryAuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    record.sub === "m0-local-user" &&
    (record.role === "user" || record.role === "admin") &&
    typeof record.exp === "number"
  );
}
