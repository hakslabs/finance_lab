import "server-only";

import type { ApiQuotaClaim, ApiQuotaClaimSupabaseClient } from "@/app/_lib/cron/quota-claim";
import { claimApiQuotaUsage } from "@/app/_lib/cron/quota-claim";
import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { NormalizedQuoteRowInput, QuoteProviderAdapter } from "@/app/_lib/providers/quotes";

type SupabaseErrorLike = { message: string };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };

type QuotesTable = {
  upsert(values: NormalizedQuoteRowInput[], options: { onConflict: "symbol" }): Promise<SupabaseMutationResponse>;
};

export type QuotesUsSupabaseClient = ApiQuotaClaimSupabaseClient & {
  from(table: "quotes"): QuotesTable;
};

export type LoadUsQuoteTargets = () => Promise<QuoteTarget[]>;

export type IngestUsQuotesOptions = {
  supabase: QuotesUsSupabaseClient;
  quoteProvider: QuoteProviderAdapter;
  day: string;
  dailyLimit: number;
  targets?: QuoteTarget[];
  loadTargets?: LoadUsQuoteTargets;
};

export type UsQuoteIngestionSummary = {
  ok: true;
  market: "us";
  provider: string;
  targetCount: number;
  requestedCount: number;
  upsertedCount: number;
  skipped: boolean;
  reason: "quota_exhausted" | "no_requests" | null;
  quota: ApiQuotaClaim;
};

export async function ingestUsQuotes(options: IngestUsQuotesOptions): Promise<UsQuoteIngestionSummary> {
  const targets = options.targets ?? (await loadInjectedTargets(options.loadTargets));
  const requestedCount = toNonNegativeInteger(options.quoteProvider.estimateQuoteRequests(targets), "requestedCount");
  const dailyLimit = toNonNegativeInteger(options.dailyLimit, "dailyLimit");

  if (requestedCount === 0) {
    return toSummary(options.quoteProvider.provider, targets.length, requestedCount, 0, true, "no_requests", {
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
    return toSummary(options.quoteProvider.provider, targets.length, requestedCount, 0, true, "quota_exhausted", quota);
  }

  const quotes = await options.quoteProvider.fetchQuotes(targets, { market: "us", day: options.day });

  if (quotes.length > 0) {
    const response = await options.supabase.from("quotes").upsert(quotes, { onConflict: "symbol" });

    if (response.error) {
      throw new Error(`failed to upsert US quotes: ${response.error.message}`);
    }
  }

  return toSummary(options.quoteProvider.provider, targets.length, requestedCount, quotes.length, false, null, quota);
}

async function loadInjectedTargets(loadTargets: LoadUsQuoteTargets | undefined): Promise<QuoteTarget[]> {
  if (!loadTargets) {
    throw new Error("US quote targets must be provided by targets or loadTargets");
  }

  return loadTargets();
}

function toSummary(
  provider: string,
  targetCount: number,
  requestedCount: number,
  upsertedCount: number,
  skipped: boolean,
  reason: "quota_exhausted" | "no_requests" | null,
  quota: ApiQuotaClaim
): UsQuoteIngestionSummary {
  return {
    ok: true,
    market: "us",
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
