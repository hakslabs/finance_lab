import "server-only";

import { cookies } from "next/headers";

import { getServerEnv } from "@/app/_lib/env/server";
import {
  createTemporaryAuthSession,
  signTemporaryAuthSession,
  TEMP_AUTH_COOKIE_NAME,
  TEMP_AUTH_TTL_SECONDS,
  type TemporaryAuthSession,
  verifyTemporaryAuthSession
} from "./session";

export async function setTemporaryAuthCookie(role: "user" | "admin" = "user"): Promise<void> {
  const env = getServerEnv();
  const session = createTemporaryAuthSession(role);
  const token = await signTemporaryAuthSession(session, env.CRON_SECRET);
  const cookieStore = await cookies();

  cookieStore.set(TEMP_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TEMP_AUTH_TTL_SECONDS
  });
}

export async function readTemporaryAuthCookie(): Promise<TemporaryAuthSession | null> {
  const env = getServerEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(TEMP_AUTH_COOKIE_NAME)?.value;

  return verifyTemporaryAuthSession(token, env.CRON_SECRET);
}

export async function clearTemporaryAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TEMP_AUTH_COOKIE_NAME);
}
