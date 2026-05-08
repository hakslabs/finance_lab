/**
 * Admin data helper — server-only, reads ops + content tables for the M7
 * console. All reads go through `createRlsSupabaseClient()`; service-key
 * access stays reserved for admin mutation routes that do not exist yet.
 */

import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type CronLogRow = Database["public"]["Tables"]["cron_logs"]["Row"];
type ApiQuotaRow = Database["public"]["Tables"]["api_quota"]["Row"];
type MasterProfileRow = Database["public"]["Tables"]["master_profiles"]["Row"];
type MasterHoldingRow = Database["public"]["Tables"]["master_holdings"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type TermRow = Database["public"]["Tables"]["terms"]["Row"];
type NewsRow = Database["public"]["Tables"]["news"]["Row"];
type SecuritiesMasterRow = Database["public"]["Tables"]["securities_master"]["Row"];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface AdminKpi {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly hint: string;
}

export interface AdminSection {
  readonly id: AdminSectionId;
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly count: number | null;
}

export type AdminSectionId =
  | "dashboard"
  | "masters"
  | "13f"
  | "learn"
  | "terms"
  | "news"
  | "users"
  | "api-usage"
  | "cron"
  | "securities-master"
  | "announcements";

export interface AdminRecentEvent {
  readonly id: string;
  readonly job: string;
  readonly status: CronLogRow["status"];
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly err: string | null;
}

export interface AdminDashboardData {
  readonly kpis: readonly AdminKpi[];
  readonly sections: readonly AdminSection[];
  readonly recentEvents: readonly AdminRecentEvent[];
}

export interface AdminMastersListItem {
  readonly id: string;
  readonly name: string;
  readonly firm: string | null;
  readonly style: string | null;
  readonly holdingsCount: number;
  readonly latestQuarter: string | null;
}

export interface AdminLearnItem {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly status: ArticleRow["status"];
  readonly publishedAt: string | null;
}

export interface AdminTermItem {
  readonly id: string;
  readonly term: string;
  readonly category: string;
  readonly definitionPreview: string;
}

export interface AdminNewsItem {
  readonly id: string;
  readonly title: string;
  readonly src: string;
  readonly publishedAt: string;
  readonly tickers: readonly string[];
  readonly sentiment: number | null;
}

export interface AdminApiUsageItem {
  readonly provider: string;
  readonly day: string;
  readonly used: number;
  readonly limit: number;
  readonly utilizationPct: number;
}

export interface AdminCronLogItem {
  readonly id: string;
  readonly job: string;
  readonly status: CronLogRow["status"];
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly durationSeconds: number | null;
  readonly err: string | null;
}

export interface AdminSecuritiesMasterItem {
  readonly symbol: string;
  readonly name: string;
  readonly country: string;
  readonly exchange: string | null;
  readonly assetClass: string;
  readonly source: string;
  readonly sourceRevision: string | null;
}

export interface AdminSecuritiesMasterSummary {
  readonly totalCount: number;
  readonly byCountry: ReadonlyArray<{ readonly country: string; readonly count: number }>;
  readonly bySource: ReadonlyArray<{ readonly source: string; readonly count: number }>;
  readonly sample: readonly AdminSecuritiesMasterItem[];
}

// ── Pure helpers ───────────────────────────────────────────────────────

export function buildKpis(
  cronLogs: readonly CronLogRow[],
  apiQuotas: readonly ApiQuotaRow[],
  newsRows: readonly NewsRow[],
  nowIso: string = new Date().toISOString(),
): readonly AdminKpi[] {
  const now = new Date(nowIso);
  const weekAgo = new Date(now.getTime() - SEVEN_DAYS_MS);
  const todayKey = now.toISOString().slice(0, 10);

  const cronFailures7d = cronLogs.filter((log) => {
    if (log.status !== "failed") return false;
    return new Date(log.started_at) >= weekAgo;
  }).length;

  const apiCallsToday = apiQuotas
    .filter((row) => row.day === todayKey)
    .reduce((sum, row) => sum + row.used, 0);

  const news7d = newsRows.filter(
    (row) => new Date(row.published_at) >= weekAgo,
  ).length;

  const cronRuns7d = cronLogs.filter(
    (log) => new Date(log.started_at) >= weekAgo,
  ).length;

  return [
    {
      id: "cron-runs-7d",
      label: "Cron runs (7d)",
      value: cronRuns7d,
      hint: "Total scheduled job executions in the last 7 days.",
    },
    {
      id: "cron-failures-7d",
      label: "Cron failures (7d)",
      value: cronFailures7d,
      hint: "Failed job executions in the last 7 days.",
    },
    {
      id: "api-calls-today",
      label: "API calls today",
      value: apiCallsToday,
      hint: "Sum of provider quota usage for today.",
    },
    {
      id: "news-7d",
      label: "News items (7d)",
      value: news7d,
      hint: "Headlines ingested in the last 7 days.",
    },
  ];
}

export function buildSections(counts: {
  readonly masters: number;
  readonly articles: number;
  readonly terms: number;
  readonly news: number;
  readonly cronLogs: number;
  readonly apiQuotas: number;
  readonly holdings: number;
  readonly securitiesMaster?: number;
}): readonly AdminSection[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      description: "KPIs and recent activity overview.",
      count: null,
    },
    {
      id: "masters",
      label: "Masters",
      href: "/admin/masters",
      description: "Master profile CRUD (read-only locally).",
      count: counts.masters,
    },
    {
      id: "13f",
      label: "13F Parsing",
      href: "/admin/13f",
      description: "Holdings parse status and re-parse triggers.",
      count: counts.holdings,
    },
    {
      id: "learn",
      label: "Learn Content",
      href: "/admin/learn",
      description: "Guide articles list and publish state.",
      count: counts.articles,
    },
    {
      id: "terms",
      label: "Terms",
      href: "/admin/terms",
      description: "Glossary dictionary entries.",
      count: counts.terms,
    },
    {
      id: "news",
      label: "News Curation",
      href: "/admin/news",
      description: "Recent headlines pending curation.",
      count: counts.news,
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users",
      description: "User listing — production only.",
      count: null,
    },
    {
      id: "api-usage",
      label: "API Usage",
      href: "/admin/api-usage",
      description: "Provider quota utilization.",
      count: counts.apiQuotas,
    },
    {
      id: "cron",
      label: "Cron Logs",
      href: "/admin/cron",
      description: "Filterable cron execution history.",
      count: counts.cronLogs,
    },
    {
      id: "securities-master",
      label: "Securities Master",
      href: "/admin/securities-master",
      description: "FinanceDatabase-seeded symbol catalog summary.",
      count: counts.securitiesMaster ?? null,
    },
    {
      id: "announcements",
      label: "Announcements",
      href: "/admin/announcements",
      description: "System banners — production only.",
      count: null,
    },
  ];
}

export function buildRecentEvents(
  cronLogs: readonly CronLogRow[],
  limit = 10,
): readonly AdminRecentEvent[] {
  return [...cronLogs]
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .slice(0, limit)
    .map((log) => ({
      id: log.id,
      job: log.job,
      status: log.status,
      startedAt: log.started_at,
      finishedAt: log.finished_at,
      err: log.err,
    }));
}

export function buildMastersList(
  profiles: readonly MasterProfileRow[],
  holdings: readonly MasterHoldingRow[],
): readonly AdminMastersListItem[] {
  const byMaster = new Map<string, MasterHoldingRow[]>();
  for (const row of holdings) {
    const list = byMaster.get(row.master_id) ?? [];
    list.push(row);
    byMaster.set(row.master_id, list);
  }

  return profiles.map((profile) => {
    const masterHoldings = byMaster.get(profile.id) ?? [];
    const latestQuarter = masterHoldings
      .map((h) => h.quarter)
      .sort()
      .at(-1) ?? null;
    return {
      id: profile.id,
      name: profile.name,
      firm: profile.firm,
      style: profile.style,
      holdingsCount: masterHoldings.length,
      latestQuarter,
    };
  });
}

export function buildLearnList(
  rows: readonly ArticleRow[],
): readonly AdminLearnItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    publishedAt: row.published_at,
  }));
}

export function buildTermsList(
  rows: readonly TermRow[],
): readonly AdminTermItem[] {
  return rows.map((row) => ({
    id: row.id,
    term: row.term,
    category: row.category,
    definitionPreview:
      row.definition.length > 140
        ? `${row.definition.slice(0, 137)}...`
        : row.definition,
  }));
}

export function buildNewsList(
  rows: readonly NewsRow[],
): readonly AdminNewsItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    src: row.src,
    publishedAt: row.published_at,
    tickers: row.tickers,
    sentiment: row.sentiment,
  }));
}

export function buildApiUsageList(
  rows: readonly ApiQuotaRow[],
): readonly AdminApiUsageItem[] {
  return rows.map((row) => {
    const utilizationPct =
      row.limit > 0 ? Math.round((row.used / row.limit) * 100) : 0;
    return {
      provider: row.provider,
      day: row.day,
      used: row.used,
      limit: row.limit,
      utilizationPct,
    };
  });
}

export function buildSecuritiesMasterSummary(
  rows: readonly SecuritiesMasterRow[],
  sampleSize = 50,
): AdminSecuritiesMasterSummary {
  const byCountryMap = new Map<string, number>();
  const bySourceMap = new Map<string, number>();
  for (const row of rows) {
    byCountryMap.set(row.country, (byCountryMap.get(row.country) ?? 0) + 1);
    bySourceMap.set(row.source, (bySourceMap.get(row.source) ?? 0) + 1);
  }
  const sortDesc = (a: { count: number }, b: { count: number }) => b.count - a.count;
  const byCountry = Array.from(byCountryMap, ([country, count]) => ({ country, count })).sort(sortDesc);
  const bySource = Array.from(bySourceMap, ([source, count]) => ({ source, count })).sort(sortDesc);
  const sample = rows.slice(0, sampleSize).map((row) => ({
    symbol: row.symbol,
    name: row.name,
    country: row.country,
    exchange: row.exchange,
    assetClass: row.asset_class,
    source: row.source,
    sourceRevision: row.source_revision,
  }));

  return { totalCount: rows.length, byCountry, bySource, sample };
}

export function buildCronLogList(
  rows: readonly CronLogRow[],
): readonly AdminCronLogItem[] {
  return rows.map((row) => {
    const durationSeconds =
      row.finished_at
        ? Math.max(
            0,
            Math.round(
              (new Date(row.finished_at).getTime() -
                new Date(row.started_at).getTime()) /
                1000,
            ),
          )
        : null;
    return {
      id: row.id,
      job: row.job,
      status: row.status,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationSeconds,
      err: row.err,
    };
  });
}

// ── Fetchers ───────────────────────────────────────────────────────────

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = createRlsSupabaseClient();

  const [
    cronResult,
    quotaResult,
    newsResult,
    mastersResult,
    articlesResult,
    termsResult,
    holdingsResult,
    securitiesResult,
  ] = await Promise.all([
    supabase
      .from("cron_logs")
      .select("id,job,started_at,finished_at,status,err")
      .order("started_at", { ascending: false })
      .limit(200),
    supabase
      .from("api_quota")
      .select("provider,day,used,limit")
      .order("day", { ascending: false })
      .limit(200),
    supabase
      .from("news")
      .select("id,src,title,url,summary,tickers,sentiment,published_at")
      .order("published_at", { ascending: false })
      .limit(200),
    supabase
      .from("master_profiles")
      .select("id,name,firm,style,philosophy_md,books,videos,created_at,updated_at")
      .limit(50),
    supabase
      .from("articles")
      .select("id,category,title,md,published_at,status")
      .limit(200),
    supabase.from("terms").select("id,term,definition,related_tickers,category").limit(200),
    supabase.from("master_holdings").select("master_id,symbol,weight,shares,qoq_delta,quarter").limit(2000),
    supabase.from("securities_master").select("symbol", { count: "exact", head: true }),
  ]);

  const cronLogs = cronResult.data ?? [];
  const apiQuotas = quotaResult.data ?? [];
  const newsRows = newsResult.data ?? [];

  return {
    kpis: buildKpis(cronLogs, apiQuotas, newsRows),
    sections: buildSections({
      masters: mastersResult.data?.length ?? 0,
      articles: articlesResult.data?.length ?? 0,
      terms: termsResult.data?.length ?? 0,
      news: newsRows.length,
      cronLogs: cronLogs.length,
      apiQuotas: apiQuotas.length,
      holdings: holdingsResult.data?.length ?? 0,
      securitiesMaster: securitiesResult.count ?? 0,
    }),
    recentEvents: buildRecentEvents(cronLogs),
  };
}

export async function fetchAdminMasters(): Promise<readonly AdminMastersListItem[]> {
  const supabase = createRlsSupabaseClient();

  const [profilesResult, holdingsResult] = await Promise.all([
    supabase
      .from("master_profiles")
      .select("id,name,firm,style,philosophy_md,books,videos,created_at,updated_at")
      .order("name", { ascending: true })
      .limit(200),
    supabase
      .from("master_holdings")
      .select("master_id,symbol,weight,shares,qoq_delta,quarter")
      .limit(5000),
  ]);

  return buildMastersList(profilesResult.data ?? [], holdingsResult.data ?? []);
}

export async function fetchAdminLearnList(): Promise<readonly AdminLearnItem[]> {
  const supabase = createRlsSupabaseClient();
  const result = await supabase
    .from("articles")
    .select("id,category,title,md,published_at,status")
    .order("published_at", { ascending: false })
    .limit(500);
  return buildLearnList(result.data ?? []);
}

export async function fetchAdminTermsList(): Promise<readonly AdminTermItem[]> {
  const supabase = createRlsSupabaseClient();
  const result = await supabase
    .from("terms")
    .select("id,term,definition,related_tickers,category")
    .order("term", { ascending: true })
    .limit(500);
  return buildTermsList(result.data ?? []);
}

export async function fetchAdminNewsList(): Promise<readonly AdminNewsItem[]> {
  const supabase = createRlsSupabaseClient();
  const result = await supabase
    .from("news")
    .select("id,src,title,url,summary,tickers,sentiment,published_at")
    .order("published_at", { ascending: false })
    .limit(200);
  return buildNewsList(result.data ?? []);
}

export async function fetchAdminApiUsage(): Promise<readonly AdminApiUsageItem[]> {
  const supabase = createRlsSupabaseClient();
  const result = await supabase
    .from("api_quota")
    .select("provider,day,used,limit")
    .order("day", { ascending: false })
    .limit(200);
  return buildApiUsageList(result.data ?? []);
}

export async function fetchAdminCronLogs(): Promise<readonly AdminCronLogItem[]> {
  const supabase = createRlsSupabaseClient();
  const result = await supabase
    .from("cron_logs")
    .select("id,job,started_at,finished_at,status,err")
    .order("started_at", { ascending: false })
    .limit(200);
  return buildCronLogList(result.data ?? []);
}

export async function fetchAdminThirteenFStatus(): Promise<{
  readonly byMaster: readonly AdminMastersListItem[];
  readonly totalHoldings: number;
}> {
  const masters = await fetchAdminMasters();
  const totalHoldings = masters.reduce((sum, m) => sum + m.holdingsCount, 0);
  return { byMaster: masters, totalHoldings };
}

export async function fetchAdminSecuritiesMaster(): Promise<AdminSecuritiesMasterSummary> {
  const supabase = createRlsSupabaseClient();
  const result = await supabase
    .from("securities_master")
    .select(
      "symbol,name,asset_class,country,currency,exchange,market,sector,industry_group,industry,website,market_cap_bucket,isin,cusip,figi,composite_figi,shareclass_figi,source,source_revision,source_updated_at",
    )
    .order("symbol", { ascending: true })
    .limit(5000);
  return buildSecuritiesMasterSummary(result.data ?? []);
}
