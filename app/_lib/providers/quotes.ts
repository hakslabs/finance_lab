import type { QuoteTarget } from "@/app/_lib/data/securities";
import type { Database } from "@/app/_lib/supabase/database.types";

type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];
type DailyQuoteInsert = Database["public"]["Tables"]["quotes_daily"]["Insert"];

export type NormalizedQuoteRowInput = Pick<QuoteInsert, "symbol" | "ts"> & {
  px: number | null;
  pct: number | null;
};

export type NormalizedDailyQuoteRowInput = Pick<DailyQuoteInsert, "symbol" | "date"> & {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  vol: number | null;
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

export type DailyQuoteProviderAdapter = {
  provider: string;
  estimateQuoteRequests(targets: readonly QuoteTarget[]): number;
  fetchDailyQuotes(targets: readonly QuoteTarget[], context: QuoteFetchContext): Promise<NormalizedDailyQuoteRowInput[]>;
};
