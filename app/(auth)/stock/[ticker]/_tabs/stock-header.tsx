/**
 * Stock detail header — logo/name/ticker/exchange/sector + price/day change/market cap
 * + action stubs (watchlist, note, transaction).
 *
 * Server-rendered. Action buttons are visual stubs until real auth lands.
 */

import type { DailyQuote, QuoteData, SecurityProfile } from "@/app/_lib/stock/stock-detail-data";

export interface StockHeaderProps {
  readonly profile: SecurityProfile | null;
  readonly quote: QuoteData | null;
  readonly dailyQuote: DailyQuote | null;
}

function formatPrice(px: number | null, currency?: string): string {
  if (px === null) return "—";
  if (px >= 100_000) return px.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (px >= 1_000)
    return px.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const prefix = currency === "KRW" ? "\u20A9" : "$";
  return `${prefix}${px.toFixed(2)}`;
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatMarketCap(profile: SecurityProfile | null, closePx: number | null): string {
  if (!profile || closePx === null) return "—";
  // Rough market cap estimation; real shares outstanding comes from financials pipeline
  return "—";
}

function displayPrice(quote: QuoteData | null, dailyQuote: DailyQuote | null): number | null {
  return quote?.px ?? dailyQuote?.close ?? null;
}

/** Derive display change % from quote or compute from daily OHLC. */
function displayPct(quote: QuoteData | null, dailyQuote: DailyQuote | null): number | null {
  if (quote !== null && quote.pct !== null) return quote.pct;
  if (dailyQuote?.open && dailyQuote?.close) {
    return ((dailyQuote.close - dailyQuote.open) / dailyQuote.open) * 100;
  }
  return null;
}

export function StockHeader({ profile, quote, dailyQuote }: StockHeaderProps) {
  const price = displayPrice(quote, dailyQuote);
  const pct = displayPct(quote, dailyQuote);
  const isUp = pct !== null && pct >= 0;
  const pctColor = pct === null ? "var(--sl-muted)" : isUp ? "var(--sl-up)" : "var(--sl-down)";
  const pctBg = pct === null ? "transparent" : isUp ? "var(--sl-up-soft)" : "var(--sl-down-soft)";

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-4)",
        paddingBottom: "var(--sl-space-5)",
        borderBottom: "1px solid var(--sl-line)",
      }}
    >
      {/* Top row: identity + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--sl-space-4)",
          flexWrap: "wrap",
        }}
      >
        {/* Identity column */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-4)", minWidth: 0 }}>
          {/* Logo / symbol mark */}
          <div
            className="sl-mono"
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--sl-radius-lg)",
              background:
                "linear-gradient(135deg, var(--sl-brand), var(--sl-cat2))",
              color: "var(--sl-surface)",
              fontSize: 18,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              letterSpacing: "-0.02em",
            }}
            aria-hidden="true"
          >
            {profile?.name?.charAt(0) ?? profile?.symbol?.charAt(0) ?? "?"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)", minWidth: 0 }}>
            <h1
              className="sl-h1"
              style={{
                lineHeight: 1.15,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile?.name ?? profile?.symbol ?? "Unknown Stock"}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sl-space-2)",
                flexWrap: "wrap",
              }}
            >
              <span
                className="sl-mono"
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--sl-brand)",
                  letterSpacing: "-0.01em",
                }}
              >
                {profile?.symbol ?? FALLBACK_TICKER}
              </span>

              {profile?.exchange && (
                <span className="sl-tag">{profile.exchange}</span>
              )}

              {profile?.sector && (
                <span className="sl-caption" style={{ color: "var(--sl-muted)" }}>
                  {profile.sector}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action stubs */}
        <ActionStubs />
      </div>

      {/* Price row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "var(--sl-space-4)",
          flexWrap: "wrap",
        }}
      >
        <span
          className="sl-mono"
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--sl-ink)",
          }}
        >
          {formatPrice(price, profile?.currency)}
        </span>

        <span
          className="sl-mono"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: pctColor,
            background: pctBg,
            padding: "3px 8px",
            borderRadius: "var(--sl-radius-sm)",
          }}
        >
          {formatPct(pct)}
        </span>

        <span className="sl-caption" style={{ color: "var(--sl-muted)" }}>
          Market cap: {formatMarketCap(profile, price)}
        </span>
      </div>

      {/* Disclaimer */}
      <p className="sl-caption" style={{ color: "var(--sl-faint)" }}>
        Referential use only. Not investment advice.
      </p>
    </header>
  );
}

// Use a local fallback for the symbol when profile is missing
const FALLBACK_TICKER = "";

/** Visual stubs for watchlist, note, and transaction actions. */
function ActionStubs() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-2)",
      }}
    >
      <button
        type="button"
        className="sl-btn sl-btn-secondary"
        disabled
        aria-disabled="true"
        title="Add to watchlist"
        style={{ fontSize: 12, padding: "6px 12px", gap: "var(--sl-space-1)", opacity: 0.6 }}
      >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <title>Watchlist</title>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Watchlist
      </button>

      <button
        type="button"
        className="sl-btn sl-btn-secondary"
        disabled
        aria-disabled="true"
        title="Add note"
        style={{ fontSize: 12, padding: "6px 12px", gap: "var(--sl-space-1)", opacity: 0.6 }}
      >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <title>Note</title>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Note
      </button>

      <button
        type="button"
        className="sl-btn sl-btn-primary"
        disabled
        aria-disabled="true"
        title="Record transaction"
        style={{ fontSize: 12, padding: "6px 12px", gap: "var(--sl-space-1)", opacity: 0.6 }}
      >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <title>Transaction</title>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Transaction
      </button>
    </div>
  );
}
