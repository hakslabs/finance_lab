/**
 * Masters data helper — server-only, reads Supabase cache tables with RLS.
 *
 * No writes, no service-key usage, and no external provider calls during render.
 */

import "server-only";

import type { Database, Json } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type MasterProfileRow = Database["public"]["Tables"]["master_profiles"]["Row"];
type MasterHoldingRow = Database["public"]["Tables"]["master_holdings"]["Row"];
type SecurityRow = Pick<Database["public"]["Tables"]["securities_master"]["Row"], "symbol" | "name" | "sector" | "market" | "country" | "currency">;
type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type MasterSearchRow = Pick<MasterProfileRow, "id" | "name" | "firm" | "style" | "updated_at">;

export interface MasterProfile {
  readonly id: string;
  readonly name: string;
  readonly firm: string | null;
  readonly style: string | null;
  readonly philosophyMd: string | null;
  readonly books: Json;
  readonly videos: Json;
  readonly updatedAt: string;
}

export interface MasterHolding {
  readonly masterId: string;
  readonly symbol: string;
  readonly name: string;
  readonly sector: string | null;
  readonly market: string | null;
  readonly country: string | null;
  readonly currency: string | null;
  readonly price: number | null;
  readonly priceChangePct: number | null;
  readonly weight: number | null;
  readonly shares: number | null;
  readonly qoqDelta: number | null;
  readonly quarter: string;
}

export interface MasterQuarterDelta {
  readonly symbol: string;
  readonly name: string;
  readonly quarter: string;
  readonly qoqDelta: number;
  readonly direction: "added" | "increased" | "decreased" | "removed";
}

export interface MasterFollowState {
  readonly enabled: false;
  readonly isFollowing: false;
  readonly reason: "auth-required";
}

export interface MastersData {
  readonly profiles: readonly MasterProfile[];
  readonly holdings: readonly MasterHolding[];
  readonly styleFacets: readonly string[];
  readonly selectedProfile: MasterProfile | null;
  readonly latestQuarter: string | null;
  readonly topHoldings: readonly MasterHolding[];
  readonly quarterlyDeltas: readonly MasterQuarterDelta[];
  readonly followState: MasterFollowState;
  readonly lastUpdated: string | null;
}

export interface MasterSearchResult {
  readonly id: string;
  readonly name: string;
  readonly firm: string | null;
  readonly style: string | null;
  readonly href: string;
  readonly matchType: "name" | "firm" | "style";
}

export const MAX_MASTER_SEARCH_LIMIT = 8;

const EMPTY_FOLLOW_STATE: MasterFollowState = {
  enabled: false,
  isFollowing: false,
  reason: "auth-required",
};

function normalizeMasterSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function clampMasterSearchLimit(limit?: number): number {
  if (!Number.isFinite(limit)) {
    return MAX_MASTER_SEARCH_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit ?? MAX_MASTER_SEARCH_LIMIT), 1), MAX_MASTER_SEARCH_LIMIT);
}

function mapProfile(row: MasterProfileRow): MasterProfile {
  return {
    id: row.id,
    name: row.name,
    firm: row.firm,
    style: row.style,
    philosophyMd: row.philosophy_md,
    books: row.books,
    videos: row.videos,
    updatedAt: row.updated_at,
  };
}

export function buildStyleFacets(profiles: readonly MasterProfile[]): readonly string[] {
  return [...new Set(profiles.map((profile) => profile.style).filter((style): style is string => style !== null && style.trim() !== ""))].sort((a, b) => a.localeCompare(b));
}

export function searchMasterProfiles(
  profiles: readonly MasterProfile[],
  query: string,
  style?: string,
): readonly MasterProfile[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedStyle = style?.trim().toLowerCase();

  return profiles.filter((profile) => {
    const matchesStyle = !normalizedStyle || profile.style?.toLowerCase() === normalizedStyle;
    const haystack = `${profile.name} ${profile.firm ?? ""} ${profile.style ?? ""}`.toLowerCase();
    const matchesQuery = normalizedQuery === "" || haystack.includes(normalizedQuery);
    return matchesStyle && matchesQuery;
  });
}

export function rankMasterSearchResults(
  profiles: readonly MasterSearchRow[],
  query: string,
  limit = MAX_MASTER_SEARCH_LIMIT,
): readonly MasterSearchResult[] {
  const normalizedQuery = normalizeMasterSearchQuery(query).toLowerCase();
  if (!normalizedQuery) return [];

  return profiles
    .map((profile) => ({ profile, matchType: getMasterMatchType(profile, normalizedQuery) }))
    .filter((candidate): candidate is { profile: MasterSearchRow; matchType: MasterSearchResult["matchType"] } => Boolean(candidate.matchType))
    .sort((left, right) => compareMasterSearchCandidates(left, right, normalizedQuery))
    .slice(0, clampMasterSearchLimit(limit))
    .map(({ profile, matchType }) => ({
      id: profile.id,
      name: profile.name,
      firm: profile.firm,
      style: profile.style,
      href: `/masters/${profile.id}`,
      matchType,
    }));
}

export async function searchMasters(query: string, limit?: number): Promise<readonly MasterSearchResult[]> {
  const normalizedQuery = normalizeMasterSearchQuery(query);
  if (!normalizedQuery) return [];

  const safeLimit = clampMasterSearchLimit(limit);
  const supabase = createRlsSupabaseClient();
  const queryPattern = `%${escapePostgrestPattern(normalizedQuery)}%`;

  const [nameResult, firmResult, styleResult] = await Promise.all([
    supabase.from("master_profiles").select("id,name,firm,style,updated_at").ilike("name", queryPattern).limit(safeLimit * 2),
    supabase.from("master_profiles").select("id,name,firm,style,updated_at").ilike("firm", queryPattern).limit(safeLimit * 2),
    supabase.from("master_profiles").select("id,name,firm,style,updated_at").ilike("style", queryPattern).limit(safeLimit * 2),
  ]);

  if (nameResult.error) {
    throw new Error(`failed to search master_profiles names: ${nameResult.error.message}`);
  }

  if (firmResult.error) {
    throw new Error(`failed to search master_profiles firms: ${firmResult.error.message}`);
  }

  if (styleResult.error) {
    throw new Error(`failed to search master_profiles styles: ${styleResult.error.message}`);
  }

  return rankMasterSearchResults(
    dedupeMasterProfiles([...(nameResult.data ?? []), ...(firmResult.data ?? []), ...(styleResult.data ?? [])]),
    normalizedQuery,
    safeLimit,
  );
}

export function selectMasterProfile(
  profiles: readonly MasterProfile[],
  selectedId?: string,
): MasterProfile | null {
  if (profiles.length === 0) return null;
  if (!selectedId) return profiles[0];
  return profiles.find((profile) => profile.id === selectedId) ?? null;
}

export function findLatestQuarter(holdings: readonly MasterHolding[], masterId?: string): string | null {
  const quarters = holdings
    .filter((holding) => !masterId || holding.masterId === masterId)
    .map((holding) => holding.quarter)
    .sort((a, b) => b.localeCompare(a));
  return quarters[0] ?? null;
}

export function getTopHoldings(
  holdings: readonly MasterHolding[],
  masterId: string | null,
  quarter?: string | null,
  limit = 10,
): readonly MasterHolding[] {
  if (!masterId) return [];
  const targetQuarter = quarter ?? findLatestQuarter(holdings, masterId);
  if (!targetQuarter) return [];

  return holdings
    .filter((holding) => holding.masterId === masterId && holding.quarter === targetQuarter)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0) || a.symbol.localeCompare(b.symbol))
    .slice(0, limit);
}

export function getQuarterlyDeltas(
  holdings: readonly MasterHolding[],
  masterId: string | null,
  quarter?: string | null,
  limit = 10,
): readonly MasterQuarterDelta[] {
  if (!masterId) return [];
  const targetQuarter = quarter ?? findLatestQuarter(holdings, masterId);
  if (!targetQuarter) return [];

  return holdings
    .filter((holding) => holding.masterId === masterId && holding.quarter === targetQuarter && holding.qoqDelta !== null && holding.qoqDelta !== 0)
    .map((holding) => ({
      symbol: holding.symbol,
      name: holding.name,
      quarter: holding.quarter,
      qoqDelta: holding.qoqDelta ?? 0,
      direction: classifyDelta(holding.qoqDelta ?? 0, holding.weight),
    }))
    .sort((a, b) => Math.abs(b.qoqDelta) - Math.abs(a.qoqDelta) || a.symbol.localeCompare(b.symbol))
    .slice(0, limit);
}

function classifyDelta(delta: number, weight: number | null): MasterQuarterDelta["direction"] {
  if (weight === 0 && delta < 0) return "removed";
  if (delta > 0) return "increased";
  if (delta < 0) return "decreased";
  return "added";
}

function getMasterMatchType(profile: MasterSearchRow, normalizedQuery: string): MasterSearchResult["matchType"] | null {
  if (profile.name.toLowerCase().includes(normalizedQuery)) return "name";
  if (profile.firm?.toLowerCase().includes(normalizedQuery)) return "firm";
  if (profile.style?.toLowerCase().includes(normalizedQuery)) return "style";
  return null;
}

function compareMasterSearchCandidates(
  left: { profile: MasterSearchRow; matchType: MasterSearchResult["matchType"] },
  right: { profile: MasterSearchRow; matchType: MasterSearchResult["matchType"] },
  normalizedQuery: string,
): number {
  const rankDelta = masterMatchRank(left.matchType) - masterMatchRank(right.matchType);
  if (rankDelta !== 0) return rankDelta;

  const leftNameDistance = left.profile.name.length - normalizedQuery.length;
  const rightNameDistance = right.profile.name.length - normalizedQuery.length;
  if (leftNameDistance !== rightNameDistance) return leftNameDistance - rightNameDistance;

  return left.profile.name.localeCompare(right.profile.name);
}

function masterMatchRank(matchType: MasterSearchResult["matchType"]): number {
  return { name: 0, firm: 1, style: 2 }[matchType];
}

function dedupeMasterProfiles(profiles: MasterSearchRow[]): MasterSearchRow[] {
  return [...new Map(profiles.map((profile) => [profile.id, profile])).values()];
}

function escapePostgrestPattern(value: string): string {
  return value.replace(/[%,]/g, (char) => `\\${char}`);
}

export function buildMastersData(
  profiles: readonly MasterProfile[],
  holdings: readonly MasterHolding[],
  selectedId?: string,
): MastersData {
  const selectedProfile = selectMasterProfile(profiles, selectedId);
  const latestQuarter = findLatestQuarter(holdings, selectedProfile?.id);

  return {
    profiles,
    holdings,
    styleFacets: buildStyleFacets(profiles),
    selectedProfile,
    latestQuarter,
    topHoldings: getTopHoldings(holdings, selectedProfile?.id ?? null, latestQuarter),
    quarterlyDeltas: getQuarterlyDeltas(holdings, selectedProfile?.id ?? null, latestQuarter),
    followState: EMPTY_FOLLOW_STATE,
    lastUpdated: profiles.reduce<string | null>((latest, profile) => {
      if (latest === null || profile.updatedAt > latest) return profile.updatedAt;
      return latest;
    }, null),
  };
}

export async function fetchMastersData(selectedId?: string): Promise<MastersData> {
  const supabase = createRlsSupabaseClient();

  const [profilesResult, securitiesResult, quotesResult] = await Promise.all([
    supabase.from("master_profiles").select("id,name,firm,style,philosophy_md,books,videos,created_at,updated_at").order("name"),
    supabase.from("securities_master").select("symbol,name,sector,market,country,currency").limit(1000),
    supabase.from("quotes").select("symbol,px,pct,ts").limit(1000),
  ]);

  const profiles = (profilesResult.data ?? []).map(mapProfile);
  const selectedProfile = selectMasterProfile(profiles, selectedId);
  const holdingsResult = selectedProfile
    ? await supabase
        .from("master_holdings")
        .select("master_id,symbol,weight,shares,qoq_delta,quarter")
        .eq("master_id", selectedProfile.id)
        .order("quarter", { ascending: false })
        .limit(5000)
    : { data: [], error: null };
  const securityMap = new Map((securitiesResult.data ?? []).map((security: SecurityRow) => [security.symbol, security]));
  const quoteMap = new Map((quotesResult.data ?? []).map((quote: QuoteRow) => [quote.symbol, quote]));

  const holdings = (holdingsResult.data ?? []).map((holding: MasterHoldingRow): MasterHolding => {
    const security = securityMap.get(holding.symbol);
    const quote = quoteMap.get(holding.symbol);
    return {
      masterId: holding.master_id,
      symbol: holding.symbol,
      name: security?.name ?? holding.symbol,
      sector: security?.sector ?? null,
      market: security?.market ?? null,
      country: security?.country ?? null,
      currency: security?.currency ?? null,
      price: quote?.px ?? null,
      priceChangePct: quote?.pct ?? null,
      weight: holding.weight,
      shares: holding.shares,
      qoqDelta: holding.qoq_delta,
      quarter: holding.quarter,
    };
  });

  return buildMastersData(profiles, holdings, selectedId);
}
