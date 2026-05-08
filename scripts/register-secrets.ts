/**
 * Idempotent registration of platform secrets from `.env`.
 *
 * - GitHub repo secrets (hakslabs/finance_lab): `SUPABASE_URL`,
 *   `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `CRON_SECRET`.
 *   Requires `GITHUB_TOKEN` (Fine-grained PAT with Secrets:read+write on the
 *   target repo).
 *
 * - Vercel production env (haks-finance-lab-s-projects/finance-lab):
 *   `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `OAUTH_GOOGLE_CLIENT_ID`,
 *   `OAUTH_GOOGLE_CLIENT_SECRET`. Requires `VERCEL_TOKEN`.
 *
 * Skips any secret that is missing or empty in `.env`. Safe to re-run
 * (Vercel upsert + GitHub PUT semantics).
 *
 * Usage: `pnpm tsx scripts/register-secrets.ts`
 */

import { config as loadEnv } from "dotenv";
import sodium from "libsodium-wrappers";

loadEnv();

// ── Targets ────────────────────────────────────────────────────────────

const GITHUB_REPO = { owner: "hakslabs", repo: "finance_lab" };

const GITHUB_SECRET_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "CRON_SECRET",
] as const;

const VERCEL_PROJECT_ID = "prj_qT8NUw99IupjGs4caM9gmc8f54OA";
const VERCEL_TEAM_ID = "team_HxvX9IBEJbdjMrQde8UCL5je";

const VERCEL_ENV_KEYS = [
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "OAUTH_GOOGLE_CLIENT_ID",
  "OAUTH_GOOGLE_CLIENT_SECRET",
] as const;

// ── GitHub helpers ─────────────────────────────────────────────────────

interface GithubPublicKey {
  readonly key: string;
  readonly key_id: string;
}

async function githubFetch(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (init.body) headers["Content-Type"] = "application/json";
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
}

async function getRepoPublicKey(token: string): Promise<GithubPublicKey> {
  const path = `/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}/actions/secrets/public-key`;
  const response = await githubFetch(path, token);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub public key fetch failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }
  return (await response.json()) as GithubPublicKey;
}

function sealedBoxEncrypt(value: string, publicKeyB64: string): string {
  const recipient = sodium.from_base64(publicKeyB64, sodium.base64_variants.ORIGINAL);
  const message = sodium.from_string(value);
  const cipher = sodium.crypto_box_seal(message, recipient);
  return sodium.to_base64(cipher, sodium.base64_variants.ORIGINAL);
}

async function putRepoSecret(
  token: string,
  publicKey: GithubPublicKey,
  name: string,
  value: string,
): Promise<void> {
  const encrypted = sealedBoxEncrypt(value, publicKey.key);
  const path = `/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}/actions/secrets/${name}`;
  const response = await githubFetch(path, token, {
    method: "PUT",
    body: JSON.stringify({
      encrypted_value: encrypted,
      key_id: publicKey.key_id,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub secret upsert failed for ${name} (${response.status}): ${body.slice(0, 200)}`,
    );
  }
}

// ── Vercel helpers ─────────────────────────────────────────────────────

interface VercelEnvEntry {
  readonly id?: string;
  readonly key: string;
  readonly target?: readonly string[];
}

async function vercelListEnv(token: string): Promise<readonly VercelEnvEntry[]> {
  const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}&decrypt=false`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel env list failed (${response.status}): ${body.slice(0, 200)}`);
  }
  const json = (await response.json()) as { envs: readonly VercelEnvEntry[] };
  return json.envs;
}

async function vercelUpsert(
  token: string,
  key: string,
  value: string,
): Promise<"created" | "updated" | "skipped"> {
  const createUrl = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}&upsert=true`;
  const createResp = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: ["production"],
    }),
  });
  if (createResp.ok) return "created";

  if (createResp.status === 409) {
    const existing = await vercelListEnv(token);
    const entry = existing.find(
      (e) => e.key === key && (e.target ?? []).includes("production"),
    );
    if (!entry?.id) return "skipped";
    const patchUrl = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${entry.id}?teamId=${VERCEL_TEAM_ID}`;
    const patchResp = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value, target: ["production"] }),
    });
    if (!patchResp.ok) {
      const body = await patchResp.text();
      throw new Error(
        `Vercel env patch failed for ${key} (${patchResp.status}): ${body.slice(0, 200)}`,
      );
    }
    return "updated";
  }

  const body = await createResp.text();
  throw new Error(
    `Vercel env create failed for ${key} (${createResp.status}): ${body.slice(0, 200)}`,
  );
}

// ── Main ───────────────────────────────────────────────────────────────

function maskedLength(value: string | undefined): string {
  if (!value) return "(empty)";
  return `(length=${value.length})`;
}

async function main(): Promise<void> {
  await sodium.ready;

  const githubToken = process.env.GITHUB_TOKEN;
  const vercelToken = process.env.VERCEL_TOKEN;

  let didWork = false;

  if (!githubToken) {
    console.log("[github] GITHUB_TOKEN not set — skipping GitHub Actions secrets.");
  } else {
    didWork = true;
    console.log(`[github] Registering secrets to ${GITHUB_REPO.owner}/${GITHUB_REPO.repo}...`);
    try {
      const publicKey = await getRepoPublicKey(githubToken);
      for (const key of GITHUB_SECRET_KEYS) {
        const value = process.env[key];
        if (!value) {
          console.log(`[github]  - skip ${key} ${maskedLength(value)}`);
          continue;
        }
        await putRepoSecret(githubToken, publicKey, key, value);
        console.log(`[github]  - upsert ${key} ${maskedLength(value)}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[github] FAILED — ${msg}`);
      console.error("[github] Continuing with Vercel. Check the PAT's repo selection and Secrets read+write permission, then re-run.");
    }
  }

  if (!vercelToken) {
    console.log("[vercel] VERCEL_TOKEN not set — skipping Vercel env upserts.");
  } else {
    didWork = true;
    console.log("[vercel] Upserting production env to haks-finance-lab-s-projects/finance-lab...");
    for (const key of VERCEL_ENV_KEYS) {
      const value = process.env[key];
      if (!value) {
        console.log(`[vercel]  - skip ${key} ${maskedLength(value)}`);
        continue;
      }
      const result = await vercelUpsert(vercelToken, key, value);
      console.log(`[vercel]  - ${result} ${key} ${maskedLength(value)}`);
    }
  }

  if (!didWork) {
    console.log("Nothing to do — set GITHUB_TOKEN and/or VERCEL_TOKEN in .env first.");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
