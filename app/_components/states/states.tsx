/**
 * State component variants used across all STOCKLAB routes.
 *
 * Components are simple, declarative cards — no client interactivity. The
 * retry button is a plain anchor that re-navigates to the current route
 * (passed in via `retryHref`) so server components can use it without
 * needing a client boundary.
 */

import React, { type ReactNode } from "react";

import { classifyRefreshStatus, type RefreshStatusKind } from "./refresh-status";

void React;

export type RefreshStatus = RefreshStatusKind;

// ── Shared layout ──────────────────────────────────────────────────────

interface StateCardProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
  readonly action?: ReactNode;
  readonly tone?: "neutral" | "warn" | "error";
  readonly testId: string;
}

function StateCard({ icon, title, body, action, tone = "neutral", testId }: StateCardProps) {
  const accent =
    tone === "error"
      ? "var(--sl-down)"
      : tone === "warn"
        ? "var(--sl-warn, #d97706)"
        : "var(--sl-muted)";
  const bg =
    tone === "error"
      ? "var(--sl-down-soft, #fef2f2)"
      : tone === "warn"
        ? "var(--sl-warn-soft, #fef3c7)"
        : "var(--sl-surface)";
  return (
    <section
      className="sl-card sl-center"
      data-testid={testId}
      role="status"
      style={{
        flexDirection: "column",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-7) var(--sl-space-6)",
        textAlign: "center",
        background: bg,
        borderColor:
          tone === "neutral" ? "var(--sl-line)" : `color-mix(in srgb, ${accent} 30%, var(--sl-line))`,
      }}
    >
      <div style={{ color: accent }}>{icon}</div>
      <div>
        <h3 className="sl-h3" style={{ marginBottom: "var(--sl-space-2)" }}>
          {title}
        </h3>
        <p
          className="sl-body-sm"
          style={{ color: "var(--sl-muted)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}
        >
          {body}
        </p>
      </div>
      {action}
    </section>
  );
}

// ── Empty: watchlist ───────────────────────────────────────────────────

export interface EmptyWatchlistProps {
  readonly recommendations?: readonly { readonly symbol: string; readonly name: string }[];
}

export function EmptyWatchlist({ recommendations = [] }: EmptyWatchlistProps) {
  return (
    <StateCard
      testId="state-empty-watchlist"
      icon={<StarIcon />}
      title="Your watchlist is empty"
      body="Pick a few tickers to follow. Start with these popular names or search for any symbol."
      action={
        recommendations.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sl-space-2)", justifyContent: "center" }}>
            {recommendations.slice(0, 7).map((tk) => (
              <a
                key={tk.symbol}
                href={`/stock/${tk.symbol}`}
                className="sl-tag sl-tag-brand"
                style={{ textDecoration: "none", fontSize: 12 }}
              >
                {tk.symbol}
              </a>
            ))}
          </div>
        ) : null
      }
    />
  );
}

// ── Empty: portfolio first visit ───────────────────────────────────────

export interface EmptyPortfolioProps {
  readonly recentTickers?: readonly string[];
}

export function EmptyPortfolio({ recentTickers = [] }: EmptyPortfolioProps) {
  return (
    <StateCard
      testId="state-empty-portfolio"
      icon={<ChartIcon />}
      title="No transactions yet"
      body="Add your first transaction to track holdings, or import from CSV."
      action={
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "var(--sl-space-2)" }}>
            <a href="/portfolio?add=transaction" className="sl-btn sl-btn-primary">
              Add Transaction
            </a>
            <a href="/portfolio?import=csv" className="sl-btn sl-btn-secondary">
              Import CSV
            </a>
          </div>
          {recentTickers.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--sl-space-2)",
                justifyContent: "center",
              }}
            >
              <span className="sl-caption" style={{ width: "100%" }}>
                Recently viewed
              </span>
              {recentTickers.slice(0, 6).map((symbol) => (
                <a key={symbol} href={`/stock/${symbol}`} className="sl-tag" style={{ textDecoration: "none" }}>
                  {symbol}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      }
    />
  );
}

// ── Error: refresh failed ──────────────────────────────────────────────

export interface ErrorRefreshFailedProps {
  readonly lastRefreshIso: string | null;
  readonly retryHref: string;
}

export function ErrorRefreshFailed({ lastRefreshIso, retryHref }: ErrorRefreshFailedProps) {
  return (
    <StateCard
      testId="state-error-refresh-failed"
      tone="error"
      icon={<WarningIcon />}
      title="Refresh failed"
      body="Showing the last known data. Pull-to-refresh or retry to fetch the latest values."
      action={
        <div style={{ display: "flex", gap: "var(--sl-space-3)", alignItems: "center" }}>
          <RefreshTimestamp lastRefreshIso={lastRefreshIso} status="failed-retry" />
          <a href={retryHref} className="sl-btn sl-btn-secondary">
            Retry
          </a>
        </div>
      }
    />
  );
}

// ── Error: API quota exceeded ──────────────────────────────────────────

export interface ErrorApiQuotaProps {
  readonly nextRefreshIso: string;
  readonly fallbackLabel: string;
}

export function ErrorApiQuota({ nextRefreshIso, fallbackLabel }: ErrorApiQuotaProps) {
  const next = new Date(nextRefreshIso);
  const formatted = next.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <StateCard
      testId="state-error-api-quota"
      tone="warn"
      icon={<WarningIcon />}
      title="Daily API quota reached"
      body={`Live data resumes ${formatted}. Showing ${fallbackLabel} as a fallback.`}
    />
  );
}

// ── Error: network failure ─────────────────────────────────────────────

export interface ErrorNetworkProps {
  readonly retryHref: string;
}

export function ErrorNetwork({ retryHref }: ErrorNetworkProps) {
  return (
    <StateCard
      testId="state-error-network"
      tone="error"
      icon={<XIcon />}
      title="Network unavailable"
      body="Check your connection and try again. Cached data may still be available offline."
      action={
        <a href={retryHref} className="sl-btn sl-btn-secondary">
          Retry
        </a>
      }
    />
  );
}

// ── Error: ticker not found ────────────────────────────────────────────

export interface ErrorTickerNotFoundProps {
  readonly query: string;
  readonly examples?: readonly string[];
}

export function ErrorTickerNotFound({
  query,
  examples = ["AAPL", "MSFT", "005930", "035720"],
}: ErrorTickerNotFoundProps) {
  return (
    <StateCard
      testId="state-error-ticker-not-found"
      tone="warn"
      icon={<SearchIcon />}
      title={`No results for "${query}"`}
      body="Use the standard ticker symbol (US: AAPL, KR: 005930). Examples below."
      action={
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sl-space-2)", justifyContent: "center" }}>
          {examples.map((ex) => (
            <a key={ex} href={`/stock/${ex}`} className="sl-tag" style={{ textDecoration: "none" }}>
              {ex}
            </a>
          ))}
        </div>
      }
    />
  );
}

// ── Refresh timestamp ──────────────────────────────────────────────────

export interface RefreshTimestampProps {
  readonly lastRefreshIso: string | null;
  readonly status?: RefreshStatus;
  readonly nowIso?: string;
  readonly freshnessSeconds?: number;
}

export function RefreshTimestamp({
  lastRefreshIso,
  status,
  nowIso,
  freshnessSeconds = 60 * 5,
}: RefreshTimestampProps) {
  const resolvedStatus =
    status ??
    classifyRefreshStatus({
      lastRefreshIso,
      nowIso: nowIso ?? new Date().toISOString(),
      freshnessSeconds,
      lastAttemptFailed: false,
    });

  const tone =
    resolvedStatus === "normal"
      ? "var(--sl-up)"
      : resolvedStatus === "delayed"
        ? "var(--sl-warn, #d97706)"
        : "var(--sl-down)";

  const label =
    resolvedStatus === "normal"
      ? "Live"
      : resolvedStatus === "delayed"
        ? "Delayed"
        : "Refresh failed";

  const formatted = lastRefreshIso
    ? new Date(lastRefreshIso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <span
      data-testid="state-refresh-timestamp"
      data-status={resolvedStatus}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: tone,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: 3, background: tone }}
      />
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span className="sl-mono" style={{ color: "var(--sl-muted)" }}>
        {formatted}
      </span>
    </span>
  );
}

// ── Inline icons ───────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="20" x2="21" y2="20" />
      <polyline points="6 14 11 9 14 12 19 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
