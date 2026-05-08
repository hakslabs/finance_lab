import "server-only";

import type { ApiQuotaClaim, ApiQuotaClaimSupabaseClient } from "@/app/_lib/cron/quota-claim";
import { claimApiQuotaUsage } from "@/app/_lib/cron/quota-claim";
import type { IndexProviderAdapter } from "@/app/_lib/providers/indices";
import type { Database } from "@/app/_lib/supabase/database.types";

type IndexInsert = Database["public"]["Tables"]["indices"]["Insert"];
type IndexSparkRow = Pick<Database["public"]["Tables"]["indices"]["Row"], "code" | "spark">;

type SupabaseErrorLike = { message: string };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };
type SupabaseSelectResponse<Row> = { data: Row[] | null; error: SupabaseErrorLike | null };

type IndicesSelectBuilder = {
  in(column: "code", values: string[]): Promise<SupabaseSelectResponse<IndexSparkRow>>;
};

type IndicesTable = {
  select(columns: "code,spark"): IndicesSelectBuilder;
  upsert(values: IndexInsert[], options: { onConflict: "code" }): Promise<SupabaseMutationResponse>;
};

export type IndicesSupabaseClient = ApiQuotaClaimSupabaseClient & {
  from(table: "indices"): IndicesTable;
};

export type IngestIndicesOptions = {
  supabase: IndicesSupabaseClient;
  indexProvider: IndexProviderAdapter;
  day: string;
  dailyLimit: number;
  sparkWindow?: number;
};

export type IndicesIngestionSummary = {
  ok: true;
  provider: string;
  targetCount: number;
  requestedCount: number;
  upsertedCount: number;
  skipped: boolean;
  reason: "quota_exhausted" | "no_requests" | null;
  quota: ApiQuotaClaim;
};

const indexTargetCount = 6;
const defaultSparkWindow = 96;

export async function ingestIndices(options: IngestIndicesOptions): Promise<IndicesIngestionSummary> {
  const requestedCount = toNonNegativeInteger(options.indexProvider.estimateIndexRequests(), "requestedCount");
  const dailyLimit = toNonNegativeInteger(options.dailyLimit, "dailyLimit");

  if (requestedCount === 0) {
    return toSummary(options.indexProvider.provider, requestedCount, 0, true, "no_requests", {
      provider: options.indexProvider.provider,
      day: options.day,
      used: 0,
      limit: dailyLimit,
      remaining: dailyLimit,
      status: "ok",
      claimed: false
    });
  }

  const quota = await claimApiQuotaUsage(options.supabase, {
    provider: options.indexProvider.provider,
    day: options.day,
    amount: requestedCount,
    dailyLimit
  });

  if (!quota.claimed) {
    return toSummary(options.indexProvider.provider, requestedCount, 0, true, "quota_exhausted", quota);
  }

  const observations = await options.indexProvider.fetchIndices({ day: options.day });
  const rows = await buildIndexRows(options.supabase, observations, options.sparkWindow ?? defaultSparkWindow);

  if (rows.length > 0) {
    const response = await options.supabase.from("indices").upsert(rows, { onConflict: "code" });

    if (response.error) {
      throw new Error(`failed to upsert indices: ${response.error.message}`);
    }
  }

  return toSummary(options.indexProvider.provider, requestedCount, rows.length, false, null, quota);
}

async function buildIndexRows(
  supabase: IndicesSupabaseClient,
  observations: Awaited<ReturnType<IndexProviderAdapter["fetchIndices"]>>,
  sparkWindow: number
): Promise<IndexInsert[]> {
  if (observations.length === 0) {
    return [];
  }

  const response = await supabase
    .from("indices")
    .select("code,spark")
    .in("code", observations.map((observation) => observation.code));

  if (response.error) {
    throw new Error(`failed to read existing index sparks: ${response.error.message}`);
  }

  const sparkByCode = new Map((response.data ?? []).map((row) => [row.code, row.spark]));

  return observations.map((observation) => {
    const spark = [...(sparkByCode.get(observation.code) ?? []), observation.value].slice(-sparkWindow);
    return { ...observation, spark };
  });
}

function toSummary(
  provider: string,
  requestedCount: number,
  upsertedCount: number,
  skipped: boolean,
  reason: "quota_exhausted" | "no_requests" | null,
  quota: ApiQuotaClaim
): IndicesIngestionSummary {
  return {
    ok: true,
    provider,
    targetCount: indexTargetCount,
    requestedCount,
    upsertedCount,
    skipped,
    reason,
    quota
  };
}

function toNonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }

  return value;
}
