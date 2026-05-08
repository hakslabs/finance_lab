/**
 * Top news widget — AI-summarized market news headlines.
 *
 * Server-rendered. Shows news items with title, summary snippet,
 * tickers, and relative timestamp.
 */

import type { NewsItem } from "../dashboard-data";
import { WidgetEmptyCard } from "../dashboard-state-card";

export interface TopNewsProps {
  readonly items: readonly NewsItem[];
}

export function TopNews({ items }: TopNewsProps) {
  if (items.length === 0) {
    return (
      <WidgetEmptyCard
        widgetId="top-news"
        title="No news yet"
        description="AI-summarized market news will appear after the next cron refresh."
      />
    );
  }

  return (
    <section
      className="sl-card"
      aria-label="Top news"
      style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--sl-space-4)",
        }}
      >
        <div className="sl-label">Top News</div>
        <span className="sl-caption">{items.length} articles</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
        {items.slice(0, 5).map((item) => (
          <NewsRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

/** Single news item row. */
function NewsRow({ item }: { item: NewsItem }) {
  const timeAgo = formatNewsTime(item.published_at);

  return (
    <article
      style={{
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-2)",
      }}
    >
      {/* Title */}
      <h3
        className="sl-h3"
        style={{
          margin: 0,
          lineHeight: 1.35,
          color: "var(--sl-ink)",
        }}
      >
        {item.title}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p
          className="sl-body-sm"
          style={{
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.summary}
        </p>
      )}

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--sl-space-3)",
        }}
      >
        {/* Ticker tags */}
        <div style={{ display: "flex", gap: "var(--sl-space-1)", flexWrap: "wrap" }}>
          {item.tickers.slice(0, 4).map((ticker) => (
            <span key={ticker} className="sl-tag sl-tag-brand">
              {ticker}
            </span>
          ))}
        </div>

        <span className="sl-caption" style={{ flexShrink: 0 }}>
          {timeAgo}
        </span>
      </div>
    </article>
  );
}

function formatNewsTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
