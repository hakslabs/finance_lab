import { type NextRequest, NextResponse } from "next/server";

const TEMP_AUTH_COOKIE_NAME = "stocklab_m0_session";

const encoder = new TextEncoder();

const publicPathPrefixes = [
  "/login",
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/sw.js",
  "/icon-192.svg",
  "/icon-512.svg",
  "/apple-touch-icon.svg"
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (publicPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TEMP_AUTH_COOKIE_NAME)?.value;
  const session = await verifyTemporaryAuthSession(token, process.env.CRON_SECRET);

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};

// ── Inline verify helpers (edge-safe; no external imports) ────────────

type TemporaryAuthSession = {
  readonly sub: string;
  readonly role: "user" | "admin";
  readonly exp: number;
};

function base64UrlDecode(value: string): Uint8Array | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  try {
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  } catch (error) {
    if (error instanceof DOMException) return null;
    throw error;
  }
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const decoded = base64UrlDecode(signature);
  if (!decoded) return false;
  return crypto.subtle.verify(
    "HMAC",
    key,
    new Uint8Array(Array.from(decoded)),
    encoder.encode(message)
  );
}

function isSession(value: unknown): value is TemporaryAuthSession {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    r.sub === "m0-local-user" &&
    (r.role === "user" || r.role === "admin") &&
    typeof r.exp === "number"
  );
}

async function verifyTemporaryAuthSession(
  token: string | undefined,
  secret: string | undefined
): Promise<TemporaryAuthSession | null> {
  if (!token || !secret) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  if (!(await hmacVerify(payload, signature, secret))) return null;
  const decoded = base64UrlDecode(payload);
  if (!decoded) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(decoded));
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
  const now = Math.floor(Date.now() / 1000);
  if (!isSession(parsed) || parsed.exp <= now) return null;
  return parsed;
}
