import Link from "next/link";
import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import { SafeMarkdown } from "@/app/_lib/markdown/safe-markdown";
import {
  fetchReportsData,
  type ReportDetail,
  type ReportTable,
} from "@/app/_lib/reports/reports-data";

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Report detail page — server-rendered with metadata, AI summary, tables, and Markdown body.
 *
 * Protected by the temporary M0 auth session.
 * Markdown rendered only through markdownToSafeHtml sanitizer boundary.
 */
export default async function ReportsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const { id: reportId } = await params;
  const data = await fetchReportsData({}, reportId);
  const detail = data.detail;

  if (!detail) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
        <GlobalHeader userName={session?.role ?? undefined} />
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <section className="sl-card" style={{ padding: "var(--sl-space-8)", textAlign: "center" }}>
            <h1 className="sl-h2" style={{ marginBottom: "var(--sl-space-3)" }}>Report Not Found</h1>
            <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)", marginBottom: "var(--sl-space-5)" }}>
              The requested report does not exist or has been removed.
            </p>
            <Link href="/reports" className="sl-btn sl-btn-primary">Back to Reports</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 12 }}>
          <Link href="/reports" className="sl-text-muted" style={{ textDecoration: "none" }}>
            &larr; All Reports
          </Link>
        </nav>

        {/* Metadata header */}
        <ReportHeader detail={detail} />

        {/* AI Summary hero */}
        {detail.summary && (
          <SummaryHero summary={detail.summary} />
        )}

        {/* Ticker / Tag chips */}
        {(detail.tickers.length > 0 || detail.tags.length > 0) && (
          <section className="sl-card" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
            <div style={{ display: "flex", gap: "var(--sl-space-4)", flexWrap: "wrap" }}>
              {detail.tickers.length > 0 && (
                <div>
                  <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
                    Related Tickers
                  </span>
                  <div style={{ display: "flex", gap: "var(--sl-space-2)", flexWrap: "wrap" }}>
                    {detail.tickers.map((ticker) => (
                      <a
                        key={ticker}
                        href={`/stock/${ticker}`}
                        className="sl-mono sl-tag sl-tag-brand"
                        style={{ textDecoration: "none", fontSize: 11 }}
                      >
                        {ticker}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {detail.tags.length > 0 && (
                <div>
                  <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
                    Tags
                  </span>
                  <div style={{ display: "flex", gap: "var(--sl-space-2)", flexWrap: "wrap" }}>
                    {detail.tags.map((tag) => (
                      <span key={tag} className="sl-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Original PDF link */}
        {detail.pdfUrl && (
          <a
            href={detail.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sl-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sl-space-3)",
              padding: "var(--sl-space-4) var(--sl-space-5)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--sl-warn)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <title>PDF document icon</title>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sl-ink)" }}>Original PDF</div>
              <div className="sl-caption">Opens in a new tab</div>
            </div>
          </a>
        )}

        {/* Report Tables Preview */}
        {detail.tables.length > 0 && (
          <TablesPreview tables={detail.tables} />
        )}

        {/* Markdown Body (sanitized) or Docling pending state */}
        {detail.markdown ? (
          <MarkdownBody markdown={detail.markdown} />
        ) : (
          <DoclingPendingState />
        )}

        {/* Related Reports */}
        {detail.relatedReports.length > 0 && (
          <RelatedReports reports={detail.relatedReports} />
        )}

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
            label="Bookmark This Report"
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

function ReportHeader({ detail }: { detail: ReportDetail }) {
  return (
    <section className="sl-card" aria-label="Report metadata" style={{ padding: "var(--sl-space-6)" }}>
      <div style={{ display: "flex", gap: "var(--sl-space-3)", marginBottom: "var(--sl-space-3)", flexWrap: "wrap" }}>
        <span className="sl-tag sl-tag-brand">{detail.src}</span>
        <span className="sl-tag">{detail.category}</span>
        {detail.hasAiSummary && (
          <span className="sl-tag sl-tag-info">AI Summarized</span>
        )}
        {detail.pdfUrl && (
          <span className="sl-tag sl-tag-warn">PDF Available</span>
        )}
      </div>
      <h1 className="sl-h1">{detail.title}</h1>
      <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-muted)" }}>
        Published {formatDate(detail.publishedAt)}
      </p>
    </section>
  );
}

function SummaryHero({ summary }: { summary: string }) {
  return (
    <section
      className="sl-card"
      aria-label="AI Summary"
      style={{
        padding: "var(--sl-space-5) var(--sl-space-6)",
        background: "linear-gradient(135deg, var(--sl-surface), var(--sl-info-soft))",
        borderLeft: "4px solid var(--sl-info)",
      }}
    >
      <div className="sl-label" style={{ color: "var(--sl-info)", marginBottom: "var(--sl-space-3)" }}>
        AI Summary
      </div>
      <p className="sl-body-sm" style={{ lineHeight: 1.7, color: "var(--sl-ink-sub)" }}>
        {summary}
      </p>
    </section>
  );
}

function TablesPreview({ tables }: { tables: readonly ReportTable[] }) {
  return (
    <section className="sl-card" aria-label="Report tables" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Data Tables ({tables.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)" }}>
        {tables.slice(0, 5).map((table, idx) => (
          <div
            key={`${table.reportId}-${table.index}`}
            style={{
              padding: "var(--sl-space-3)",
              borderRadius: "var(--sl-radius-md)",
              background: "var(--sl-surface-alt)",
              border: "1px solid var(--sl-hairline)",
            }}
          >
            <div className="sl-caption" style={{ marginBottom: "var(--sl-space-2)" }}>
              Table {idx + 1}
            </div>
            <pre
              className="sl-mono"
              style={{
                fontSize: 11,
                color: "var(--sl-ink-sub)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 200,
                overflow: "auto",
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(table.tableJson, null, 2).slice(0, 500)}
              {JSON.stringify(table.tableJson).length > 500 ? "\n..." : ""}
            </pre>
          </div>
        ))}
        {tables.length > 5 && (
          <div className="sl-center" style={{ padding: "var(--sl-space-2) 0" }}>
            <span className="sl-caption">+{tables.length - 5} more tables</span>
          </div>
        )}
      </div>
    </section>
  );
}

function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <section className="sl-card" aria-label="Report content" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Full Report
      </div>
      <SafeMarkdown
        as="article"
        markdown={markdown}
        className="sl-body-sm"
        style={{
          lineHeight: 1.8,
          color: "var(--sl-ink-sub)",
        }}
      />
    </section>
  );
}

function DoclingPendingState() {
  return (
    <section
      className="sl-card"
      aria-label="Docling pending"
      style={{
        padding: "var(--sl-space-7) var(--sl-space-6)",
        textAlign: "center",
        background: "var(--sl-surface-alt)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--sl-line)",
          margin: "0 auto var(--sl-space-4)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <title>Document pending icon</title>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="sl-h3" style={{ marginBottom: "var(--sl-space-2)" }}>
        Report Content Pending
      </h3>
      <p className="sl-body-sm" style={{ color: "var(--sl-muted)", maxWidth: 420, margin: "0 auto" }}>
        The full Markdown body for this report has not been processed by Docling yet.
        The original PDF and AI summary are available above. Check back later for the complete text extraction.
      </p>
    </section>
  );
}

function RelatedReports({ reports }: { reports: ReportDetail["relatedReports"] }) {
  return (
    <section className="sl-card" aria-label="Related reports" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Related Reports ({reports.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
        {reports.map((report) => (
          <a
            key={report.id}
            href={`/reports/${report.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--sl-space-3)",
              padding: "var(--sl-space-3)",
              borderRadius: "var(--sl-radius-sm)",
              textDecoration: "none",
              color: "inherit",
              transition: "background var(--sl-motion-fast)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sl-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {report.title}
              </div>
              <div style={{ display: "flex", gap: "var(--sl-space-2)", marginTop: 2 }}>
                <span className="sl-tag" style={{ fontSize: 10 }}>{report.src}</span>
                <span className="sl-caption">{formatDate(report.publishedAt)}</span>
              </div>
            </div>
            {report.hasAiSummary && (
              <span className="sl-tag sl-tag-info" style={{ fontSize: 10, flexShrink: 0 }}>AI</span>
            )}
          </a>
        ))}
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

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
