import "server-only";

import { getServerEnv } from "@/app/_lib/env/server";

const bearerPrefix = "Bearer ";
const encoder = new TextEncoder();

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  let diff = leftBytes.length ^ rightBytes.length;
  const maxLength = Math.max(leftBytes.length, rightBytes.length);

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
}

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith(bearerPrefix)) {
    return null;
  }

  return authorization.slice(bearerPrefix.length);
}

export function isAuthorizedCronRequest(request: Request): boolean {
  const token = getBearerToken(request);

  if (!token) {
    return false;
  }

  return constantTimeEqual(token, getServerEnv().CRON_SECRET);
}

export function unauthorizedCronResponse(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
