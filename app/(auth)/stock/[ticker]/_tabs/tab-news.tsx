/**
 * News tab — AI summary hero + keyword trends + 30-day sentiment
 * + article list with KR / EN filter and category chips.
 *
 * Server-rendered. Shows cached news items or empty state.
 */

import type { NewsItem } from "@/app/_lib/stock/stock-detail-data";

export interface NewsTabProps {
  readonly news: readonly NewsItem[];
}

export function NewsTab({ news }: NewsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
      {/* Filter stubs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-2)",
          flexWrap: "wrap",
        }}
      >
        {["All", "KR", "EN"].map((filter) => (
          <span key={filter} className="sl-tag">
            {filter}
          </span>
        ))}
        <span style={{ color: "var(--sl-line)", margin: "0 var(--sl-space-1)" }}>|</span>
        {["Market", "Earnings", "Analysis", "Macro"].map((cat) => (
          <span key={cat} className="sl-tag">
            {cat}
          </span>
        ))}
      </div>

      {news.length === 0 ? (
        <NewsEmptyState />
      ) : (
        <NewsList items={news} />
      )}
    </div>
  );
}

function NewsEmptyState() {
  return (
    <div
      className="sl-card"
      style={{
        padding: "var(--sl-space-8) var(--sl-space-6)",
        textAlign: "center",
      }}
    >
      <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: "var(--sl-space-3)" }}>
        <title>No news</title>
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.11.89-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h4v4h-4z" />
      </svg>
      <p className="sl-h3 sl-text-muted">No News Available</p>
      <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
        No news articles have been indexed for this stock yet.
        Articles will appear after the next news ingestion cycle.
      </p>
    </div>
  );
}

function NewsList({ items }: { items: readonly NewsItem[] }) {
  return (
    <section className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
      <h2 className="sl-h3" style={{ marginBottom: "var(--sl-space-4)" }}>
        Recent News ({items.length})
      </h2>

      <ul
        style={{
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-1)",
        }}
      >
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "var(--sl-space-3) var(--sl-space-4)",
                borderRadius: "var(--sl-radius-md)",
                textDecoration: "none",
                color: "inherit",
                border: "1px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--sl-space-3)" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: "var(--sl-space-1)" }}>
                    {item.title}
                  </p>
                  {item.summary && (
                    <p
                      className="sl-body-sm"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 600,
                      }}
                    >
                      {item.summary}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--sl-space-1)", flexShrink: 0 }}>
                  <span className="sl-tag" style={{ fontSize: 9 }}>{item.src}</span>
                  <span className="sl-caption">
                    {new Date(item.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
