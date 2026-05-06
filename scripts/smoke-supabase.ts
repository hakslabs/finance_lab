import "dotenv/config";

import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

import { parseServerEnv } from "../app/_lib/env/schema";
import type { Database } from "../app/_lib/supabase/database.types";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

function report(results: CheckResult[]): void {
  for (const result of results) {
    const status = result.ok ? "ok" : "failed";
    console.log(`${status}: ${result.name} - ${result.detail}`);
  }
}

async function main(): Promise<void> {
  const env = parseServerEnv(process.env);
  const anon = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const service = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const results: CheckResult[] = [];
  const smokeId = randomUUID();
  const password = `Smoke-${smokeId}-password`;
  let firstUserId: string | undefined;
  let secondUserId: string | undefined;

  const publicRead = await anon.from("quotes").select("symbol,ts").limit(1);
  results.push({
    name: "anonymous system select",
    ok: !publicRead.error,
    detail: publicRead.error ? publicRead.error.message : "quotes select reachable"
  });

  const securityMasterRead = await anon.from("securities_master").select("symbol,name").limit(1);
  results.push({
    name: "anonymous security master select",
    ok: !securityMasterRead.error,
    detail: securityMasterRead.error
      ? securityMasterRead.error.message
      : "securities_master select reachable"
  });

  const testSymbol = `SMOKE_${Date.now()}`;
  const anonWrite = await anon.from("quotes").insert({ symbol: testSymbol, px: 1, pct: 0 });
  results.push({
    name: "blocked anonymous write",
    ok: Boolean(anonWrite.error),
    detail: anonWrite.error ? "anonymous insert rejected" : "anonymous insert unexpectedly succeeded"
  });

  if (!anonWrite.error) {
    await service.from("quotes").delete().eq("symbol", testSymbol);
  }

  const securityMasterTestSymbol = `SMOKE_SECURITY_${Date.now()}`;
  const securityMasterAnonWrite = await anon.from("securities_master").insert({
    symbol: securityMasterTestSymbol,
    name: "Smoke Security",
    asset_class: "equity",
    country: "United States",
    currency: "USD",
    source: "smoke"
  });
  results.push({
    name: "blocked anonymous security master write",
    ok: Boolean(securityMasterAnonWrite.error),
    detail: securityMasterAnonWrite.error
      ? "anonymous securities_master insert rejected"
      : "anonymous securities_master insert unexpectedly succeeded"
  });

  if (!securityMasterAnonWrite.error) {
    await service.from("securities_master").delete().eq("symbol", securityMasterTestSymbol);
  }

  const serviceRead = await service.from("cron_logs").select("id,job,status").limit(1);
  results.push({
    name: "service/admin context",
    ok: !serviceRead.error,
    detail: serviceRead.error ? serviceRead.error.message : "cron_logs service select reachable"
  });

  try {
    const firstUser = await service.auth.admin.createUser({
      email: `m0-smoke-${smokeId}-a@example.com`,
      password,
      email_confirm: true
    });
    const secondUser = await service.auth.admin.createUser({
      email: `m0-smoke-${smokeId}-b@example.com`,
      password,
      email_confirm: true
    });

    firstUserId = firstUser.data.user?.id;
    secondUserId = secondUser.data.user?.id;

    if (firstUser.error || secondUser.error || !firstUserId || !secondUserId) {
      results.push({
        name: "authenticated user setup",
        ok: false,
        detail: firstUser.error?.message ?? secondUser.error?.message ?? "missing created user id"
      });
    } else {
      await service.from("user_preferences").insert({
        user_id: secondUserId,
        currency: "USD",
        language: "en",
        theme: "light"
      });

      const signedIn = await anon.auth.signInWithPassword({
        email: `m0-smoke-${smokeId}-a@example.com`,
        password
      });
      const accessToken = signedIn.data.session?.access_token;

      if (signedIn.error || !accessToken) {
        results.push({
          name: "authenticated sign-in",
          ok: false,
          detail: signedIn.error?.message ?? "missing access token"
        });
      } else {
        const authed = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          global: { headers: { Authorization: `Bearer ${accessToken}` } }
        });
        const ownInsert = await authed.from("user_preferences").insert({
          user_id: firstUserId,
          currency: "USD",
          language: "en",
          theme: "light"
        });
        const otherRead = await authed
          .from("user_preferences")
          .select("user_id")
          .eq("user_id", secondUserId);

        results.push({
          name: "authenticated own-row insert",
          ok: !ownInsert.error,
          detail: ownInsert.error ? ownInsert.error.message : "own user_preferences insert allowed"
        });
        results.push({
          name: "authenticated other-row isolation",
          ok: !otherRead.error && otherRead.data.length === 0,
          detail: otherRead.error
            ? otherRead.error.message
            : `other user rows visible: ${otherRead.data.length}`
        });
      }
    }
  } finally {
    const userIds = [firstUserId, secondUserId].filter((id): id is string => Boolean(id));

    if (userIds.length > 0) {
      await service.from("user_preferences").delete().in("user_id", userIds);
      await Promise.all(userIds.map((userId) => service.auth.admin.deleteUser(userId)));
    }
  }

  report(results);

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "unknown smoke failure";
  console.error(`failed: smoke runner - ${message}`);
  process.exitCode = 1;
});
