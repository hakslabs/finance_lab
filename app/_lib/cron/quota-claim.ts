import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";

export type ApiQuotaClaim = Database["public"]["Functions"]["claim_api_quota"]["Returns"][number];
export type ApiQuotaClaimArgs = Database["public"]["Functions"]["claim_api_quota"]["Args"];

type SupabaseErrorLike = { message: string };
type SupabaseSingleResponse<Row> = { data: Row | null; error: SupabaseErrorLike | null };

type ApiQuotaClaimRpcBuilder = {
  single(): Promise<SupabaseSingleResponse<ApiQuotaClaim>>;
};

export type ApiQuotaClaimSupabaseClient = {
  rpc(functionName: "claim_api_quota", args: ApiQuotaClaimArgs): ApiQuotaClaimRpcBuilder;
};

export type ClaimApiQuotaUsageOptions = {
  provider: string;
  day: string;
  amount: number;
  dailyLimit: number;
};

export async function claimApiQuotaUsage(
  supabase: ApiQuotaClaimSupabaseClient,
  options: ClaimApiQuotaUsageOptions
): Promise<ApiQuotaClaim> {
  const amount = toNonNegativeInteger(options.amount, "amount");
  const dailyLimit = toNonNegativeInteger(options.dailyLimit, "dailyLimit");
  const response = await supabase
    .rpc("claim_api_quota", {
      p_provider: options.provider,
      p_day: options.day,
      p_amount: amount,
      p_limit: dailyLimit
    })
    .single();

  if (response.error) {
    throw new Error(`failed to claim api_quota for ${options.provider} on ${options.day}: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error(`failed to claim api_quota for ${options.provider} on ${options.day}: missing RPC row`);
  }

  return response.data;
}

function toNonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }

  return value;
}
