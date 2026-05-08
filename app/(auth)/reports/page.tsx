import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import {
  fetchReportsData,
  type ReportSummary,
} from "@/app/_lib/reports/reports-data";

export const metadata = {
  title: "STOCKLAB — Research Reports",
  description:
    "AI-summarized research reports with ticker coverage, category filtering, and original PDF access.",
};

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Reports hub page — server-rendered with facets, filtered list, and AI summary badges.
 *
 * Protected by the temporary M0 auth session.
 * URL params: ?q= (search), ?category=, ?ticker=, ?tag=.
 */
export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : undefined;
  const ticker = typeof params.ticker === "string" ? params.ticker : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;

  const data = await fetchReportsData({ query, category, ticker, tag });

  // Build filter URL helper
  function buildFilterUrl(overrides: Record<string, string | undefined>): string {
    const current = { q: query || undefined, category, ticker, tag };
    const merged = { ...current, ...overrides };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") sp.set(k, v);
    }
    const qs = sp.toString();
    return `/reports${qs ? `?${qs}` : ""}`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Page header */}
        <header>
          <h1 className="sl-h1">Research Reports</h1>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            AI-summarized research reports with ticker coverage and original document links.
            {" "}Showing {data.filteredReports.length} of {data.reports.length} reports.
          </p>
        </header>

        {/* Recommended Hero */}
        {data.recommendedHero && (
          <RecommendedHero report={data.recommendedHero} />
        )}

        {/* Facet chips bar */}
        {(data.categories.length > 0 || data.tickers.length > 0 || data.tags.length > 0) && (
          <FacetBar
            categories={data.categories}
            tickers={data.tickers}
            tags={data.tags}
            activeCategory={category}
            activeTicker={ticker}
            activeTag={tag}
            buildUrl={buildFilterUrl}
          />
        )}

        {/* Report list */}
        <ReportList
          reports={data.filteredReports}
          buildUrl={buildFilterUrl}
        />

        {/* Disabled actions */}
        <div
          className="sl-card"
          style={{
            display: "flex",
            gap: "var(--sl-space-3)",
            padding: "var(--sl-space-4) var(--sl-space-5)",
            flexWrap: "wrap",
          }}
        >
          <DisabledAction
            label="Bookmark Report"
            reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to user tables."
          />
          <DisabledAction
            label="Add Note"
            reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to user tables."
          />
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: "var(--sl-space-6)",
            paddingBottom: "var(--sl-space-8)",
            marginTop: "var(--sl-space-5)",
            borderTop: "1px solid var(--sl-line)",
          }}
        >
          <span className="sl-caption">
            Referential use only. Not investment advice. User is responsible for their own decisions.
          </span>
          <br />
          <span className="sl-caption" style={{ color: "var(--sl-faint)" }}>
            STOCKLAB M4 &middot; Research Reports
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function RecommendedHero({ report }: { report: ReportSummary }) {
  return (
    <section
      className="sl-card"
      aria-label="Featured report"
      style={{
        padding: "var(--sl-space-5) var(--sl-space-6)",
        background: "linear-gradient(135deg, var(--sl-surface), var(--sl-surface-alt))",
        borderColor: "var(--sl-brand)",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "var(--sl-space-4)" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-2)", marginBottom: "var(--sl-space-2)" }}>
            <span className="sl-label" style={{ color: "var(--sl-brand)" }}>Recommended</span>
            {report.hasAiSummary && (
              <span className="sl-tag sl-tag-info">AI Summary Available</span>
            )}
          </div>
          <a
            href={`/reports/${report.id}`}
            className="sl-h2"
            style={{ textDecoration: "none", color: "var(--sl-ink)", display: "block" }}
          >
            {report.title}
          </a>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            {report.summary ?? `${report.src} \u2014 ${report.category}`}
          </p>
          <div style={{ display: "flex", gap: "var(--sl-space-2)", marginTop: "var(--sl-space-3)", flexWrap: "wrap" }}>
            <span className="sl-tag">{report.category}</span>
            <span className="sl-tag sl-tag-brand">{report.src}</span>
            {report.tickers.slice(0, 5).map((t) => (
              <span key={t} className="sl-tag">{t}</span>
            ))}
            {report.pdfUrl && (
              <span className="sl-tag sl-tag-warn">PDF Available</span>
            )}
          </div>
        </div>
        <a
          href={`/reports/${report.id}`}
          className="sl-btn sl-btn-primary"
          style={{ flexShrink: 0 }}
        >
          Read Report
        </a>
      </div>
    </section>
  );
}

function FacetBar({
  categories,
  tickers,
  tags,
  activeCategory,
  activeTicker,
  activeTag,
  buildUrl,
}: {
  categories: readonly string[];
  tickers: readonly string[];
  tags: readonly string[];
  activeCategory?: string;
  activeTicker?: string;
  activeTag?: string;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
      {/* Category chips */}
      {categories.length > 0 && (
        <div>
          <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
            Category
          </span>
          <div style={{ display: "flex", gap: "var(--sl-space-2)", flexWrap: "wrap" }}>
            <a
              href={buildUrl({ category: undefined })}
              className="sl-btn sl-btn-ghost"
              style={{
                fontSize: 11,
                padding: "4px 10px",
                fontWeight: !activeCategory ? 600 : 400,
                color: !activeCategory ? "var(--sl-ink)" : "var(--sl-muted)",
                borderRadius: "var(--sl-radius-pill)",
              }}
            >
              All
            </a>
            {categories.slice(0, 10).map((cat) => (
              <a
                key={cat}
                href={buildUrl({ category: cat })}
                className="sl-btn sl-btn-ghost"
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  fontWeight: activeCategory === cat ? 600 : 400,
                  color: activeCategory === cat ? "var(--sl-brand)" : "var(--sl-ink-sub)",
                  background: activeCategory === cat ? "var(--sl-brand-soft)" : "transparent",
                  borderRadius: "var(--sl-radius-pill)",
                }}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Ticker chips */}
      {tickers.length > 0 && (
        <div>
          <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
            Ticker
          </span>
          <div style={{ display: "flex", gap: "var(--sl-space-2)", flexWrap: "wrap" }}>
            <a
              href={buildUrl({ ticker: undefined })}
              className="sl-btn sl-btn-ghost"
              style={{
                fontSize: 11,
                padding: "4px 10px",
                fontWeight: !activeTicker ? 600 : 400,
                color: !activeTicker ? "var(--sl-ink)" : "var(--sl-muted)",
                borderRadius: "var(--sl-radius-pill)",
              }}
            >
              All
            </a>
            {tickers.slice(0, 15).map((t) => (
              <a
                key={t}
                href={buildUrl({ ticker: t })}
                className="sl-btn sl-btn-ghost"
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  fontWeight: activeTicker === t ? 600 : 400,
                  color: activeTicker === t ? "var(--sl-brand)" : "var(--sl-ink-sub)",
                  background: activeTicker === t ? "var(--sl-brand-soft)" : "transparent",
                  borderRadius: "var(--sl-radius-pill)",
                }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tag chips */}
      {tags.length > 0 && (
        <div>
          <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
            Tags
          </span>
          <div style={{ display: "flex", gap: "var(--sl-space-2)", flexWrap: "wrap" }}>
            <a
              href={buildUrl({ tag: undefined })}
              className="sl-btn sl-btn-ghost"
              style={{
                fontSize: 11,
                padding: "4px 10px",
                fontWeight: !activeTag ? 600 : 400,
                color: !activeTag ? "var(--sl-ink)" : "var(--sl-muted)",
                borderRadius: "var(--sl-radius-pill)",
              }}
            >
              All
            </a>
            {tags.slice(0, 10).map((t) => (
              <a
                key={t}
                href={buildUrl({ tag: t })}
                className="sl-btn sl-btn-ghost"
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  fontWeight: activeTag === t ? 600 : 400,
                  color: activeTag === t ? "var(--sl-brand)" : "var(--sl-ink-sub)",
                  background: activeTag === t ? "var(--sl-brand-soft)" : "transparent",
                  borderRadius: "var(--sl-radius-pill)",
                }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportList({
  reports,
  buildUrl,
}: {
  reports: readonly ReportSummary[];
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  if (reports.length === 0) {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-6)" }}>
        <EmptyState message="No reports match your current filters. Try clearing filters or adjusting criteria." />
      </section>
    );
  }

  return (
    <section className="sl-card" aria-label="Report list" style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--sl-surface-alt)", borderBottom: "1px solid var(--sl-line)" }}>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Title</th>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Source</th>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</th>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Tickers</th>
              <th style={{ textAlign: "center", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>AI Summary</th>
              <th style={{ textAlign: "center", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>PDF</th>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Published</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                style={{ borderBottom: "1px solid var(--sl-hairline)" }}
              >
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)" }}>
                  <a
                    href={`/reports/${report.id}`}
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--sl-ink)",
                      textDecoration: "none",
                      maxWidth: 300,
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {report.title}
                  </a>
                </td>
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)" }}>
                  <span className="sl-tag sl-tag-brand" style={{ fontSize: 10 }}>{report.src}</span>
                </td>
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)" }}>
                  <span className="sl-tag" style={{ fontSize: 10 }}>{report.category}</span>
                </td>
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)" }}>
                  <div style={{ display: "flex", gap: "var(--sl-space-1)", flexWrap: "wrap" }}>
                    {report.tickers.slice(0, 4).map((t) => (
                      <a
                        key={t}
                        href={buildUrl({ ticker: t })}
                        className="sl-mono"
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "var(--sl-brand)",
                          textDecoration: "none",
                        }}
                      >
                        {t}
                      </a>
                    ))}
                    {report.tickers.length > 4 && (
                      <span className="sl-caption">+{report.tickers.length - 4}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)", textAlign: "center" }}>
                  {report.hasAiSummary ? (
                    <span className="sl-tag sl-tag-info" style={{ fontSize: 10 }}>Summarized</span>
                  ) : (
                    <span style={{ color: "var(--sl-faint)" }}>\u2014</span>
                  )}
                </td>
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)", textAlign: "center" }}>
                  {report.pdfUrl ? (
                    <span className="sl-tag sl-tag-warn" style={{ fontSize: 10 }}>PDF</span>
                  ) : (
                    <span style={{ color: "var(--sl-faint)" }}>\u2014</span>
                  )}
                </td>
                <td style={{ padding: "var(--sl-space-3) var(--sl-space-4)" }}>
                  <span className="sl-caption">{formatDate(report.publishedAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────

function DisabledAction({ label, reason }: { label: string; reason: string }) {
  return (
    <button
      type="button"
      disabled
      className="sl-btn"
      style={{
        fontSize: 12,
        opacity: 0.55,
        cursor: "not-allowed",
        background: "transparent",
        border: "1px dashed var(--sl-line)",
        color: "var(--sl-muted)",
        padding: "var(--sl-space-2) var(--sl-space-3)",
      }}
      title={reason}
    >
      <span>{label}</span>
      <span className="sl-caption" style={{ marginLeft: "auto", fontStyle: "italic" }}>
        OAuth required
      </span>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="sl-center"
      style={{
        flexDirection: "column",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-6) 0",
      }}
    >
      <span className="sl-text-muted sl-body-sm">{message}</span>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
