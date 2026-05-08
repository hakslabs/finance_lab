/**
 * Admin role guard — redirects to /login when no session, returns 404 when
 * the session is not an admin role.
 *
 * Under temporary M0 auth, the role is stored on the cookie session payload
 * (`role: "admin"`). Production OAuth will replace this with a Supabase
 * `auth.users` claim or a dedicated `admin_roles` table lookup.
 */

import "server-only";

import { notFound, redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import type { TemporaryAuthSession } from "@/app/_lib/auth/session";

export async function requireAdminSession(): Promise<TemporaryAuthSession> {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login?next=/admin");
  }
  if (session.role !== "admin") {
    notFound();
  }
  return session;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}
