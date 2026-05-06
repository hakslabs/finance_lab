import { describe, expect, it } from "vitest";

import {
  createTemporaryAuthSession,
  signTemporaryAuthSession,
  verifyTemporaryAuthSession
} from "@/app/_lib/auth/session";

describe("temporary auth session", () => {
  it("verifies a signed unexpired session", async () => {
    const session = createTemporaryAuthSession("user");
    const token = await signTemporaryAuthSession(session, "test-cron-secret-with-length");

    await expect(verifyTemporaryAuthSession(token, "test-cron-secret-with-length")).resolves.toEqual(session);
  });

  it("rejects a token signed with a different secret", async () => {
    const session = createTemporaryAuthSession("user");
    const token = await signTemporaryAuthSession(session, "test-cron-secret-with-length");

    await expect(verifyTemporaryAuthSession(token, "different-secret-with-length")).resolves.toBeNull();
  });

  it("rejects an expired session", async () => {
    const session = { ...createTemporaryAuthSession("user"), exp: 10 };
    const token = await signTemporaryAuthSession(session, "test-cron-secret-with-length");

    await expect(verifyTemporaryAuthSession(token, "test-cron-secret-with-length", 11)).resolves.toBeNull();
  });

  it("rejects malformed payloads without throwing", async () => {
    const malformedToken = "bm90LWpzb24.signature";

    await expect(verifyTemporaryAuthSession(malformedToken, "test-cron-secret-with-length")).resolves.toBeNull();
  });
});
