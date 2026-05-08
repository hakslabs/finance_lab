/**
 * Reports data helper — server-only, reads Supabase report cache tables.
 *
 * The renderer/sanitizer layer is intentionally separate from these read-only
 * helpers.
 */

import "server-only";

import type { Database, Json } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
type ReportTableRow = Database["public"]["Tables"]["reports_tables"]["Row"];
type ReportSearchRow = Pick<ReportRow, "id" | "src" | "category" | "title" | "summary" | "tickers" | "tags" | "published_at">;

export interface ReportSummary {
  readonly id: string;
  readonly src: string;
  readonly category: string;
  readonly title: string;
  readonly pdfUrl: string | null;
  readonly summary: string | null;
  readonly tickers: readonly string[];
  readonly tags: readonly string[];
  readonly publishedAt: string;
  readonly hasAiSummary: boolean;
}

export interface ReportDetail extends ReportSummary {
  readonly markdown: string | null;
  readonly tables: readonly ReportTable[];
  readonly relatedReports: readonly ReportSummary[];
}

export interface ReportTable {
  readonly reportId: string;
  readonly index: number;
  readonly tableJson: Json;
}

export interface ReportFilters {
  readonly query?: string;
  readonly category?: string;
  readonly ticker?: string;
  readonly tag?: string;
}

export interface ReportsData {
  readonly reports: readonly ReportSummary[];
  readonly filteredReports: readonly ReportSummary[];
  readonly recommendedHero: ReportSummary | null;
  readonly latestReports: readonly ReportSummary[];
  readonly detail: ReportDetail | null;
  readonly categories: readonly string[];
  readonly tickers: readonly string[];
  readonly tags: readonly string[];
  readonly bookmarkState: { readonly enabled: false; readonly isBookmarked: false; readonly reason: "auth-required" };
}

export interface ReportSearchResult {
  readonly id: string;
  readonly title: string;
  readonly src: string;
  readonly category: string;
  readonly tickers: readonly string[];
  readonly tags: readonly string[];
  readonly publishedAt: string;
  readonly href: string;
  readonly matchType: "title" | "ticker" | "tag" | "summary" | "source";
}

export const MAX_REPORT_SEARCH_LIMIT = 8;

const BOOKMARK_DISABLED = { enabled: false, isBookmarked: false, reason: "auth-required" } as const;

function normalizeReportSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function clampReportSearchLimit(limit?: number): number {
  if (!Number.isFinite(limit)) {
    return MAX_REPORT_SEARCH_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit ?? MAX_REPORT_SEARCH_LIMIT), 1), MAX_REPORT_SEARCH_LIMIT);
}

function mapReport(row: ReportRow): ReportSummary {
  return {
    id: row.id,
    src: row.src,
    category: row.category,
    title: row.title,
    pdfUrl: row.pdf_url,
    summary: row.summary,
    tickers: row.tickers,
    tags: row.tags,
    publishedAt: row.published_at,
    hasAiSummary: row.summary !== null && row.summary.trim() !== "",
  };
}

function mapTable(row: ReportTableRow): ReportTable {
  return {
    reportId: row.report_id,
    index: row.idx,
    tableJson: row.table_json,
  };
}

export function applyReportFilters(
  reports: readonly ReportSummary[],
  filters: ReportFilters,
): readonly ReportSummary[] {
  const query = filters.query?.trim().toLowerCase();
  const category = filters.category?.trim().toLowerCase();
  const ticker = filters.ticker?.trim().toUpperCase();
  const tag = filters.tag?.trim().toLowerCase();

  return reports.filter((report) => {
    const matchesQuery = !query || `${report.title} ${report.summary ?? ""} ${report.src}`.toLowerCase().includes(query);
    const matchesCategory = !category || report.category.toLowerCase() === category;
    const matchesTicker = !ticker || report.tickers.some((reportTicker) => reportTicker.toUpperCase() === ticker);
    const matchesTag = !tag || report.tags.some((reportTag) => reportTag.toLowerCase() === tag);
    return matchesQuery && matchesCategory && matchesTicker && matchesTag;
  });
}

export function rankReportSearchResults(
  reports: readonly ReportSearchRow[],
  query: string,
  limit = MAX_REPORT_SEARCH_LIMIT,
): readonly ReportSearchResult[] {
  const normalizedQuery = normalizeReportSearchQuery(query).toLowerCase();
  if (!normalizedQuery) return [];

  return reports
    .map((report) => ({ report, matchType: getReportMatchType(report, normalizedQuery) }))
    .filter((candidate): candidate is { report: ReportSearchRow; matchType: ReportSearchResult["matchType"] } => Boolean(candidate.matchType))
    .sort((left, right) => compareReportSearchCandidates(left, right))
    .slice(0, clampReportSearchLimit(limit))
    .map(({ report, matchType }) => ({
      id: report.id,
      title: report.title,
      src: report.src,
      category: report.category,
      tickers: report.tickers,
      tags: report.tags,
      publishedAt: report.published_at,
      href: `/reports/${report.id}`,
      matchType,
    }));
}

export async function searchReports(query: string, limit?: number): Promise<readonly ReportSearchResult[]> {
  const normalizedQuery = normalizeReportSearchQuery(query);
  if (!normalizedQuery) return [];

  const safeLimit = clampReportSearchLimit(limit);
  const supabase = createRlsSupabaseClient();
  const queryPattern = `%${escapePostgrestPattern(normalizedQuery)}%`;
  const tickerQuery = normalizedQuery.toUpperCase();
  const tagQuery = normalizedQuery.toLowerCase();

  const [titleResult, summaryResult, sourceResult, tickerResult, tagResult] = await Promise.all([
    supabase.from("reports").select("id,src,category,title,summary,tickers,tags,published_at").ilike("title", queryPattern).limit(safeLimit * 2),
    supabase.from("reports").select("id,src,category,title,summary,tickers,tags,published_at").ilike("summary", queryPattern).limit(safeLimit * 2),
    supabase.from("reports").select("id,src,category,title,summary,tickers,tags,published_at").ilike("src", queryPattern).limit(safeLimit * 2),
    supabase.from("reports").select("id,src,category,title,summary,tickers,tags,published_at").contains("tickers", [tickerQuery]).limit(safeLimit * 2),
    supabase.from("reports").select("id,src,category,title,summary,tickers,tags,published_at").contains("tags", [tagQuery]).limit(safeLimit * 2),
  ]);

  if (titleResult.error) {
    throw new Error(`failed to search reports titles: ${titleResult.error.message}`);
  }

  if (summaryResult.error) {
    throw new Error(`failed to search reports summaries: ${summaryResult.error.message}`);
  }

  if (sourceResult.error) {
    throw new Error(`failed to search reports sources: ${sourceResult.error.message}`);
  }

  if (tickerResult.error) {
    throw new Error(`failed to search reports tickers: ${tickerResult.error.message}`);
  }

  if (tagResult.error) {
    throw new Error(`failed to search reports tags: ${tagResult.error.message}`);
  }

  return rankReportSearchResults(
    dedupeReports([
      ...(titleResult.data ?? []),
      ...(summaryResult.data ?? []),
      ...(sourceResult.data ?? []),
      ...(tickerResult.data ?? []),
      ...(tagResult.data ?? []),
    ]),
    normalizedQuery,
    safeLimit,
  );
}

export function selectRecommendedHero(reports: readonly ReportSummary[]): ReportSummary | null {
  return [...reports].sort((a, b) => {
    const summaryRank = Number(b.hasAiSummary) - Number(a.hasAiSummary);
    if (summaryRank !== 0) return summaryRank;
    const tickerRank = b.tickers.length - a.tickers.length;
    if (tickerRank !== 0) return tickerRank;
    return b.publishedAt.localeCompare(a.publishedAt);
  })[0] ?? null;
}

export function getLatestReports(reports: readonly ReportSummary[], limit = 12): readonly ReportSummary[] {
  return [...reports]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function getReportFacets(reports: readonly ReportSummary[]): {
  readonly categories: readonly string[];
  readonly tickers: readonly string[];
  readonly tags: readonly string[];
} {
  return {
    categories: [...new Set(reports.map((report) => report.category))].sort(),
    tickers: [...new Set(reports.flatMap((report) => report.tickers))].sort(),
    tags: [...new Set(reports.flatMap((report) => report.tags))].sort(),
  };
}

export function getRelatedReports(
  reports: readonly ReportSummary[],
  reportId: string,
  limit = 4,
): readonly ReportSummary[] {
  const current = reports.find((report) => report.id === reportId);
  if (!current) return [];

  return reports
    .filter((report) => report.id !== reportId)
    .map((report) => ({ report, score: relatedScore(current, report) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.report.publishedAt.localeCompare(a.report.publishedAt))
    .slice(0, limit)
    .map((entry) => entry.report);
}

function relatedScore(current: ReportSummary, candidate: ReportSummary): number {
  const sharedTickers = candidate.tickers.filter((ticker) => current.tickers.includes(ticker)).length;
  const sharedTags = candidate.tags.filter((tag) => current.tags.includes(tag)).length;
  const sameCategory = candidate.category === current.category ? 1 : 0;
  return sharedTickers * 3 + sharedTags * 2 + sameCategory;
}

function getReportMatchType(report: ReportSearchRow, normalizedQuery: string): ReportSearchResult["matchType"] | null {
  const tickerQuery = normalizedQuery.toUpperCase();

  if (report.title.toLowerCase().includes(normalizedQuery)) return "title";
  if (report.tickers.some((ticker) => ticker.toUpperCase() === tickerQuery)) return "ticker";
  if (report.tags.some((tag) => tag.toLowerCase() === normalizedQuery)) return "tag";
  if (report.summary?.toLowerCase().includes(normalizedQuery)) return "summary";
  if (report.src.toLowerCase().includes(normalizedQuery)) return "source";
  return null;
}

function compareReportSearchCandidates(
  left: { report: ReportSearchRow; matchType: ReportSearchResult["matchType"] },
  right: { report: ReportSearchRow; matchType: ReportSearchResult["matchType"] },
): number {
  const rankDelta = reportMatchRank(left.matchType) - reportMatchRank(right.matchType);
  if (rankDelta !== 0) return rankDelta;

  return right.report.published_at.localeCompare(left.report.published_at) || left.report.title.localeCompare(right.report.title);
}

function reportMatchRank(matchType: ReportSearchResult["matchType"]): number {
  return { title: 0, ticker: 1, tag: 2, summary: 3, source: 4 }[matchType];
}

function dedupeReports(reports: ReportSearchRow[]): ReportSearchRow[] {
  return [...new Map(reports.map((report) => [report.id, report])).values()];
}

function escapePostgrestPattern(value: string): string {
  return value.replace(/[%,]/g, (char) => `\\${char}`);
}

export function getReportDetail(
  reports: readonly ReportSummary[],
  tables: readonly ReportTable[],
  reportId?: string,
): ReportDetail | null {
  if (!reportId) return null;
  const report = reports.find((item) => item.id === reportId);
  if (!report) return null;
  const reportTables = tables
    .filter((table) => table.reportId === reportId)
    .sort((a, b) => a.index - b.index);

  return {
    ...report,
    markdown: null,
    tables: reportTables,
    relatedReports: getRelatedReports(reports, reportId),
  };
}

export function buildReportsData(
  reportRows: readonly ReportRow[],
  tableRows: readonly ReportTableRow[],
  filters: ReportFilters = {},
  detailId?: string,
): ReportsData {
  const reports = reportRows.map(mapReport);
  const markdownMap = new Map(reportRows.map((row) => [row.id, row.markdown]));
  const tables = tableRows.map(mapTable);
  const facets = getReportFacets(reports);
  const detail = getReportDetail(reports, tables, detailId);
  const detailWithMarkdown = detail ? { ...detail, markdown: markdownMap.get(detail.id) ?? null } : null;

  return {
    reports,
    filteredReports: applyReportFilters(reports, filters),
    recommendedHero: selectRecommendedHero(reports),
    latestReports: getLatestReports(reports),
    detail: detailWithMarkdown,
    categories: facets.categories,
    tickers: facets.tickers,
    tags: facets.tags,
    bookmarkState: BOOKMARK_DISABLED,
  };
}

export async function fetchReportsData(filters: ReportFilters = {}, detailId?: string): Promise<ReportsData> {
  const supabase = createRlsSupabaseClient();
  const reportSelect = "id,src,category,title,pdf_url,markdown,summary,tickers,tags,published_at";

  const [reportsResult, tablesResult] = await Promise.all([
    supabase.from("reports").select(reportSelect).order("published_at", { ascending: false }).limit(200),
    detailId
      ? supabase.from("reports_tables").select("report_id,idx,table_json").eq("report_id", detailId).order("idx").limit(1000)
      : supabase.from("reports_tables").select("report_id,idx,table_json").order("idx").limit(1000),
  ]);

  const reports = [...(reportsResult.data ?? [])];

  if (detailId && !reports.some((report) => report.id === detailId)) {
    const detailResult = await supabase.from("reports").select(reportSelect).eq("id", detailId).limit(1);
    reports.push(...(detailResult.data ?? []));
  }

  return buildReportsData(reports, tablesResult.data ?? [], filters, detailId);
}
