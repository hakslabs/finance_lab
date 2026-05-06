import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";

type ApiQuotaRow = Database["public"]["Tables"]["api_quota"]["Row"];
type ApiQuotaInsert = Database["public"]["Tables"]["api_quota"]["Insert"];

type SupabaseErrorLike = { message: string };
type SupabaseMaybeSingleResponse<Row> = { data: Row | null; error: SupabaseErrorLike | null };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };

type ApiQuotaSelectBuilder = {
  eq(column: "provider" | "day", value: string): ApiQuotaSelectBuilder;
  maybeSingle(): Promise<SupabaseMaybeSingleResponse<ApiQuotaRow>>;
};

type ApiQuotaUpsertBuilder = {
  select(columns: "provider,day,used,limit"): {
    single(): Promise<SupabaseMaybeSingleResponse<ApiQuotaRow>>;
  };
};

type ApiQuotaTable = {
  select(columns: "provider,day,used,limit"): ApiQuotaSelectBuilder;
  insert(values: ApiQuotaInsert): Promise<SupabaseMutationResponse>;
  upsert(values: ApiQuotaInsert, options: { onConflict: "provider,day" }): ApiQuotaUpsertBuilder;
};

export type ApiQuotaSupabaseClient = {
  from(table: "api_quota"): ApiQuotaTable;
};

export type ApiQuotaUsage = ApiQuotaRow;
export type ApiQuotaStatus = "ok" | "warning" | "exhausted";

export type ApiQuotaCheck = {
  provider: string;
  day: string;
  used: number;
  limit: number;
  remaining: number;
  ratio: number;
  status: ApiQuotaStatus;
};

export const API_QUOTA_WARNING_RATIO = 0.8;
export const API_QUOTA_EXHAUSTED_RATIO = 1;

export async function readApiQuotaUsage(
  supabase: ApiQuotaSupabaseClient,
  provider: string,
  day: string
): Promise<ApiQuotaUsage | null> {
  const response = await supabase
    .from("api_quota")
    .select("provider,day,used,limit")
    .eq("provider", provider)
    .eq("day", day)
    .maybeSingle();

  if (response.error) {
    throw new Error(`failed to read api_quota for ${provider} on ${day}: ${response.error.message}`);
  }

  return response.data;
}

export function checkApiQuotaUsage(usage: ApiQuotaUsage): ApiQuotaCheck {
  const ratio = usage.limit === 0 ? API_QUOTA_EXHAUSTED_RATIO : usage.used / usage.limit;
  const status = ratio >= API_QUOTA_EXHAUSTED_RATIO ? "exhausted" : ratio >= API_QUOTA_WARNING_RATIO ? "warning" : "ok";

  return {
    provider: usage.provider,
    day: usage.day,
    used: usage.used,
    limit: usage.limit,
    remaining: Math.max(usage.limit - usage.used, 0),
    ratio,
    status
  };
}

/**
 * @deprecated This helper is non-atomic and must not be used for live provider
 *  quota enforcement. Use `claimApiQuotaUsage` instead.
 */
export async function incrementApiQuotaUsage(
  supabase: ApiQuotaSupabaseClient,
  provider: string,
  day: string,
  amount: number,
  dailyLimit: number
): Promise<ApiQuotaCheck> {
  const safeAmount = toNonNegativeInteger(amount, "amount");
  const safeDailyLimit = toNonNegativeInteger(dailyLimit, "dailyLimit");
  const current = await readApiQuotaUsage(supabase, provider, day);
  const nextUsed = (current?.used ?? 0) + safeAmount;
  const nextLimit = current?.limit ?? safeDailyLimit;

  const response = await supabase
    .from("api_quota")
    .upsert({ provider, day, used: nextUsed, limit: nextLimit }, { onConflict: "provider,day" })
    .select("provider,day,used,limit")
    .single();

  if (response.error) {
    throw new Error(`failed to increment api_quota for ${provider} on ${day}: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error(`failed to increment api_quota for ${provider} on ${day}: missing upserted row`);
  }

  return checkApiQuotaUsage(response.data);
}

export async function ensureApiQuotaUsage(
  supabase: ApiQuotaSupabaseClient,
  provider: string,
  day: string,
  dailyLimit: number
): Promise<ApiQuotaUsage> {
  const existing = await readApiQuotaUsage(supabase, provider, day);

  if (existing) {
    return existing;
  }

  const safeDailyLimit = toNonNegativeInteger(dailyLimit, "dailyLimit");
  const response = await supabase.from("api_quota").insert({ provider, day, used: 0, limit: safeDailyLimit });

  if (response.error) {
    throw new Error(`failed to create api_quota for ${provider} on ${day}: ${response.error.message}`);
  }

  return { provider, day, used: 0, limit: safeDailyLimit };
}

function toNonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }

  return value;
}
