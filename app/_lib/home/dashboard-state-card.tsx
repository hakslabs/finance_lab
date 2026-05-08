/**
 * Dashboard state card components — server-rendered, no hooks, no browser globals.
 *
 * Provides reusable empty / error / stale / loading states for M1 home widgets.
 * All styling uses the STOCKLAB --sl-* CSS token system from globals.css.
 */

import React from "react";

import type {
  DashboardCardState,
  StaleBadgeProps,
  WidgetEmptyState,
  WidgetErrorState,
} from "./dashboard-states";

import { SUGGESTED_TICKERS } from "./dashboard-states";

// ── Internal helpers ────────────────────────────────────────────────────

/** Shared card shell used by every state variant. */
function CardShell({
  children,
  "aria-label": ariaLabel,
  style,
}: {
  children: React.ReactNode;
  "aria-label"?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      className="sl-card"
      aria-label={ariaLabel}
      style={{
        padding: "var(--sl-space-6)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/** Small inline SVG icon wrapper with consistent sizing. */
function Icon({
  d,
  color,
  size = 20,
  label,
}: {
  d: string;
  color: string;
  size?: number;
  label: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>{label}</title>
      <path d={d} />
    </svg>
  );
}

// ── Stale Badge ──────────────────────────────────────────────────────────

/**
 * Stale data badge — renders a warning tag + opacity wrapper for cached content.
 * Per spec: stale data shows at `opacity 0.5` plus a warning badge.
 *
 * Not a full card; meant to be composed inside or above a widget's data area.
 */
export function StaleBadge({ cachedAt, ageLabel }: StaleBadgeProps) {
  return (
    <span className="sl-tag sl-tag-warn">
      <Icon
        d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        color="var(--sl-warn)"
        size={14}
        label="Stale"
      />
      Cached {ageLabel}
      <time dateTime={cachedAt} className="sl-caption" style={{ marginLeft: "var(--sl-space-1)" }}>
        ({cachedAt})
      </time>
    </span>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────

/**
 * Minimal loading skeleton placeholder.
 * Renders animated (CSS-only) placeholder bars inside the card shell.
 */
export function LoadingSkeleton({ widgetId }: { readonly widgetId: string }) {
  return (
    <CardShell aria-label={`${widgetId} loading`}>
      <div className="sl-stack" style={{ gap: "var(--sl-space-4)" }}>
        {/* Title shimmer */}
        <div
          style={{
            height: 20,
            width: "40%",
            borderRadius: "var(--sl-radius-sm)",
            background:
              "linear-gradient(90deg, var(--sl-surface-alt) 25%, var(--sl-surface-hover) 50%, var(--sl-surface-alt) 75%)",
            backgroundSize: "200% 100%",
            animation: "sl-shimmer 1.5s ease-in-out infinite",
          }}
        />
        {/* Content shimmers */}
        {[
          { id: "shimmer-a", width: 0.7 },
          { id: "shimmer-b", width: 0.5 },
          { id: "shimmer-c", width: 0.85 },
        ].map(({ id, width: w }, i) => (
          <div
            key={id}
            style={{
              height: 14,
              width: `${w * 100}%`,
              borderRadius: "var(--sl-radius-sm)",
              background:
                "linear-gradient(90deg, var(--sl-surface-alt) 25%, var(--sl-surface-hover) 50%, var(--sl-surface-alt) 75%)",
              backgroundSize: "200% 100%",
              animation: `sl-shimmer 1.5s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      {/* Inline keyframe for shimmer — avoids a global CSS dependency */}
      <style>{`
        @keyframes sl-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </CardShell>
  );
}

// ── Empty Watchlist ──────────────────────────────────────────────────────

/**
 * Empty watchlist state — friendly message + seven suggested ticker chips.
 * Per spec: seven suggested tickers, mobile-friendly wrapping layout.
 */
export function EmptyWatchlistCard() {
  return (
    <CardShell aria-label="Empty watchlist">
      <div className="sl-stack" style={{ gap: "var(--sl-space-5)" }}>
        {/* Header row */}
        <div className="sl-row" style={{ gap: "var(--sl-space-3)" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--sl-brand-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon
              d="M12 4.5a7.5 7.5 0 017.5 7.5c0 2.7-. 1.43 5.08-3.62 6.72A.75.75 0 0115 19.25v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0113 19.25c-2.19-1.64-3.62-4.02-3.62-6.72A7.5 7.5 0 0112 4.5z"
              color="var(--sl-brand)"
              size={20}
              label="Watchlist"
            />
          </div>
          <div className="sl-grow">
            <h3 className="sl-h3">Your watchlist is empty</h3>
            <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-1)" }}>
              Add stocks to track them here, or explore these popular tickers.
            </p>
          </div>
        </div>

        {/* Suggested tickers */}
        <div style={{ marginTop: "var(--sl-space-1)" }}>
          <div className="sl-label" style={{ marginBottom: "var(--sl-space-2)" }}>
            Suggested tickers
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--sl-space-2)",
            }}
          >
            {SUGGESTED_TICKERS.map((ticker) => (
              <button
                key={ticker.symbol}
                type="button"
                className="sl-tag"
                style={{
                  cursor: "pointer",
                  padding: "var(--sl-space-2) var(--sl-space-3)",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "background var(--sl-motion-fast), color var(--sl-motion-fast)",
                }}
              >
                <span className="sl-mono" style={{ color: "var(--sl-ink)" }}>
                  {ticker.symbol}
                </span>
                <span style={{ color: "var(--sl-muted)", fontSize: 11, marginLeft: "var(--sl-space-1)" }}>
                  {ticker.name.length > 18 ? `${ticker.name.slice(0, 17)}…` : ticker.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ── Generic Widget Empty State ───────────────────────────────────────────

/**
 * Reusable empty-state card for any dashboard widget.
 * Shows an icon, title, and description. No action button (caller adds one if needed).
 */
export function WidgetEmptyCard({ widgetId, title, description }: WidgetEmptyState) {
  return (
    <CardShell aria-label={`${widgetId} empty`}>
      <div
        className="sl-center"
        style={{
          flexDirection: "column",
          gap: "var(--sl-space-4)",
          padding: "var(--sl-space-7) var(--sl-space-4)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--sl-surface-alt)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            color="var(--sl-faint)"
            size={22}
            label="Empty inbox"
          />
        </div>
        <div className="sl-stack" style={{ gap: "var(--sl-space-2)", alignItems: "center" }}>
          <h3 className="sl-h3" style={{ textAlign: "center" }}>{title}</h3>
          <p className="sl-body-sm" style={{ textAlign: "center", maxWidth: 320 }}>
            {description}
          </p>
        </div>
      </div>
    </CardShell>
  );
}

// ── Generic Widget Error State ───────────────────────────────────────────

/**
 * Reusable error-state card for any dashboard widget.
 * Shows error icon, message, and conditional retry/help text.
 */
export function WidgetErrorCard({ widgetId, message, retryable }: WidgetErrorState) {
  return (
    <CardShell aria-label={`${widgetId} error`} style={{ borderColor: "var(--sl-down)", borderWidth: 1 }}>
      <div
        className="sl-center"
        style={{
          flexDirection: "column",
          gap: "var(--sl-space-4)",
          padding: "var(--sl-space-6) var(--sl-space-4)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--sl-down-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            color="var(--sl-down)"
            size={22}
            label="Error"
          />
        </div>
        <div className="sl-stack" style={{ gap: "var(--sl-space-2)", alignItems: "center" }}>
          <h3 className="sl-h3" style={{ textAlign: "center", color: "var(--sl-down)" }}>
            Something went wrong
          </h3>
          <p className="sl-body-sm" style={{ textAlign: "center", maxWidth: 340 }}>
            {message}
          </p>
        </div>

        {retryable && (
          <div className="sl-stack" style={{ gap: "var(--sl-space-2)", alignItems: "center", width: "100%" }}>
            <span className="sl-caption">Tap retry or check back shortly.</span>
            <button type="button" className="sl-btn sl-btn-secondary sl-btn-block">
              Retry
            </button>
          </div>
        )}

        {!retryable && (
          <span className="sl-caption">
            If this persists, contact support.
          </span>
        )}
      </div>
    </CardShell>
  );
}

// ── Unified Dispatcher ───────────────────────────────────────────────────

/**
 * Renders the correct state component for a given DashboardCardState.
 * Single entry-point for widget shells that need to switch on state.
 */
export function DashboardStateCard(state: DashboardCardState): React.ReactElement {
  switch (state.kind) {
    case "loading":
      return <LoadingSkeleton widgetId="widget" />;
    case "stale":
      return (
        <CardShell aria-label="Stale data">
          <div className="sl-stack" style={{ gap: "var(--sl-space-3)" }}>
            <StaleBadge {...state.stale} />
            <div style={{ opacity: 0.5 }}>
              <span className="sl-text-muted sl-body-sm">
                Stale content placeholder — live data will replace this area.
              </span>
            </div>
          </div>
        </CardShell>
      );
    case "empty_watchlist":
      return <EmptyWatchlistCard />;
    case "widget_empty":
      return <WidgetEmptyCard {...state.empty} />;
    case "widget_error":
      return <WidgetErrorCard {...state.error} />;
    default: {
      // Exhaustiveness guard — should never reach here with valid input
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
