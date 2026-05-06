import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { Database } from "@/app/_lib/supabase/database.types";

type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];

export type NormalizedQuoteRowInput = Pick<QuoteInsert, "symbol" | "ts"> & {
  px: number | null;
  pct: number | null;
};

export type QuoteFetchContext = {
  market: "us" | "kr";
  day: string;
};

export type QuoteProviderAdapter = {
  provider: string;
  estimateQuoteRequests(targets: readonly QuoteTarget[]): number;
  fetchQuotes(targets: readonly QuoteTarget[], context: QuoteFetchContext): Promise<NormalizedQuoteRowInput[]>;
};
