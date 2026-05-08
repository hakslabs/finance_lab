import "server-only";

import type { ApiQuotaClaim, ApiQuotaClaimSupabaseClient } from "@/app/_lib/cron/quota-claim";
import { claimApiQuotaUsage } from "@/app/_lib/cron/quota-claim";
import type { SentimentProviderAdapter } from "@/app/_lib/providers/sentiment";
import type { Database } from "@/app/_lib/supabase/database.types";

type SentimentInsert = Database["public"]["Tables"]["sentiment"]["Insert"];
type SupabaseErrorLike = { message: string };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };

type SentimentTable = {
  upsert(values: SentimentInsert[], options: { onConflict: "code" }): Promise<SupabaseMutationResponse>;
};

export type SentimentSupabaseClient = ApiQuotaClaimSupabaseClient & {
  from(table: "sentiment"): SentimentTable;
};

export type IngestSentimentOptions = {
  supabase: SentimentSupabaseClient;
  sentimentProvider: SentimentProviderAdapter;
  day: string;
  dailyLimit: number;
};

export type SentimentIngestionSummary = {
  ok: true;
  provider: string;
  targetCount: number;
  requestedCount: number;
  upsertedCount: number;
  skipped: boolean;
  reason: "quota_exhausted" | "no_requests" | null;
  quota: ApiQuotaClaim;
};

export async function ingestSentiment(options: IngestSentimentOptions): Promise<SentimentIngestionSummary> {
  const requestedCount = toNonNegativeInteger(options.sentimentProvider.estimateSentimentRequests(), "requestedCount");
  const dailyLimit = toNonNegativeInteger(options.dailyLimit, "dailyLimit");

  if (requestedCount === 0) {
    return toSummary(options.sentimentProvider.provider, requestedCount, 0, true, "no_requests", {
      provider: options.sentimentProvider.provider,
      day: options.day,
      used: 0,
      limit: dailyLimit,
      remaining: dailyLimit,
      status: "ok",
      claimed: false
    });
  }

  const quota = await claimApiQuotaUsage(options.supabase, {
    provider: options.sentimentProvider.provider,
    day: options.day,
    amount: requestedCount,
    dailyLimit
  });

  if (!quota.claimed) {
    return toSummary(options.sentimentProvider.provider, requestedCount, 0, true, "quota_exhausted", quota);
  }

  const rows = await options.sentimentProvider.fetchSentiment({ day: options.day });

  if (rows.length > 0) {
    const response = await options.supabase.from("sentiment").upsert(rows, { onConflict: "code" });

    if (response.error) {
      throw new Error(`failed to upsert sentiment: ${response.error.message}`);
    }
  }

  return toSummary(options.sentimentProvider.provider, requestedCount, rows.length, false, null, quota);
}

function toSummary(
  provider: string,
  requestedCount: number,
  upsertedCount: number,
  skipped: boolean,
  reason: "quota_exhausted" | "no_requests" | null,
  quota: ApiQuotaClaim
): SentimentIngestionSummary {
  return {
    ok: true,
    provider,
    targetCount: requestedCount,
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
