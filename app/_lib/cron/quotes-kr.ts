import "server-only";

import type { ApiQuotaClaim, ApiQuotaClaimSupabaseClient } from "@/app/_lib/cron/quota-claim";
import { claimApiQuotaUsage } from "@/app/_lib/cron/quota-claim";
import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { DailyQuoteProviderAdapter, NormalizedDailyQuoteRowInput } from "@/app/_lib/providers/quotes";

type SupabaseErrorLike = { message: string };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };

type QuotesDailyTable = {
  upsert(values: NormalizedDailyQuoteRowInput[], options: { onConflict: "symbol,date" }): Promise<SupabaseMutationResponse>;
};

export type QuotesKrSupabaseClient = ApiQuotaClaimSupabaseClient & {
  from(table: "quotes_daily"): QuotesDailyTable;
};

export type IngestKrDailyQuotesOptions = {
  supabase: QuotesKrSupabaseClient;
  quoteProvider: DailyQuoteProviderAdapter;
  day: string;
  dailyLimit: number;
  targets: QuoteTarget[];
};

export type KrDailyQuoteIngestionSummary = {
  ok: true;
  market: "kr";
  provider: string;
  targetCount: number;
  requestedCount: number;
  upsertedCount: number;
  skipped: boolean;
  reason: "quota_exhausted" | "no_requests" | null;
  quota: ApiQuotaClaim;
};

export async function ingestKrDailyQuotes(options: IngestKrDailyQuotesOptions): Promise<KrDailyQuoteIngestionSummary> {
  const requestedCount = toNonNegativeInteger(options.quoteProvider.estimateQuoteRequests(options.targets), "requestedCount");
  const dailyLimit = toNonNegativeInteger(options.dailyLimit, "dailyLimit");

  if (requestedCount === 0) {
    return toSummary(options.quoteProvider.provider, options.targets.length, requestedCount, 0, true, "no_requests", {
      provider: options.quoteProvider.provider,
      day: options.day,
      used: 0,
      limit: dailyLimit,
      remaining: dailyLimit,
      status: "ok",
      claimed: false
    });
  }

  const quota = await claimApiQuotaUsage(options.supabase, {
    provider: options.quoteProvider.provider,
    day: options.day,
    amount: requestedCount,
    dailyLimit
  });

  if (!quota.claimed) {
    return toSummary(options.quoteProvider.provider, options.targets.length, requestedCount, 0, true, "quota_exhausted", quota);
  }

  const quotes = await options.quoteProvider.fetchDailyQuotes(options.targets, { market: "kr", day: options.day });

  if (quotes.length > 0) {
    const response = await options.supabase.from("quotes_daily").upsert(quotes, { onConflict: "symbol,date" });

    if (response.error) {
      throw new Error(`failed to upsert KR daily quotes: ${response.error.message}`);
    }
  }

  return toSummary(options.quoteProvider.provider, options.targets.length, requestedCount, quotes.length, false, null, quota);
}

function toSummary(
  provider: string,
  targetCount: number,
  requestedCount: number,
  upsertedCount: number,
  skipped: boolean,
  reason: "quota_exhausted" | "no_requests" | null,
  quota: ApiQuotaClaim
): KrDailyQuoteIngestionSummary {
  return {
    ok: true,
    market: "kr",
    provider,
    targetCount,
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
