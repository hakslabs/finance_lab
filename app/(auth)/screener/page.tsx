import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import {
  fetchScreenerData,
  fetchScreenerFacets,
  parseScreenerParams,
  type ScreenerResult,
  type ScreenerView,
} from "@/app/_lib/screener/screener-data";

export const metadata = {
  title: "STOCKLAB — Stock Screener",
  description:
    "Factor-based stock screener with filter, score, and discovery tools for KR and US markets.",
};

/** View mode tabs for the results area. */
const VIEW_TABS: readonly { id: ScreenerView; label: string; icon: string }[] = [
  { id: "table", label: "Table", icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { id: "heatmap", label: "Heatmap", icon: "M9 20l5.458-3.728M15 21l.394-6.734M4 10l4.33-2.58M6 12l-.893 5.24M21 11l-4.33 2.58M19 13l.893-5.24" },
  { id: "chart", label: "Chart", icon: "M7 12l3-3 3 3 4-4" },
];

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Screener page — server-rendered with URL-param filters, result table,
 * heatmap/chart previews, and disabled saved-screen/watchlist controls.
 *
 * Protected by the temporary M0 auth session.
 * All data reads from Supabase cache tables via RLS client (no service key).
 */
export default async function ScreenerPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") {
      urlParams.set(k, v);
    }
  }

  const filters = parseScreenerParams(urlParams);

  // Fetch data and facets in parallel
  const [screenerData, facets] = await Promise.all([
    fetchScreenerData(filters),
    fetchScreenerFacets(),
  ]);

  const activeView: ScreenerView = filters.view ?? "table";

  // Build filter URL helper (preserves other params)
  function buildFilterUrl(overrides: Record<string, string | undefined>): string {
    const next = new URLSearchParams(urlParams);
    for (const [k, v] of Object.entries(overrides)) {
      if (v !== undefined) next.set(k, v);
      else next.delete(k);
    }
    // Only reset page when filter criteria change, not on view or page navigation
    const filterKeys = ["market", "sector", "cap", "valuation", "quality", "return6m", "quantFactor", "minScore"];
    if (Object.keys(overrides).some((k) => filterKeys.includes(k))) {
      next.delete("page");
    }
    return `/screener?${next.toString()}`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
        }}
      >
        {/* Page header */}
        <header style={{ marginBottom: "var(--sl-space-5)" }}>
          <h1 className="sl-h1">Stock Screener</h1>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            Discover KR and US stocks by market, sector, valuation, quality, and momentum factors.
            {" "}Showing {screenerData.total} securities ({screenerData.results.length} on this page).
          </p>
        </header>

        {/* Main layout: filters + results */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "var(--sl-space-5)",
            alignItems: "start",
          }}
        >
          {/* Left: Filter rail */}
          <aside
            className="sl-card"
            aria-label="Screener filters"
            style={{ padding: "var(--sl-space-5)", position: "sticky", top: 80 }}
          >
            <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>Filters</div>

            <FilterRail
              facets={facets}
              filters={filters}
              buildUrl={buildFilterUrl}
            />
          </aside>

          {/* Right: Results area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)", minWidth: 0 }}>
            {/* View mode toggle + actions bar */}
            <ActionBar
              activeView={activeView}
              total={screenerData.total}
              page={screenerData.page}
              totalPages={screenerData.totalPages}
              buildUrl={buildFilterUrl}
            />

            {/* Results content */}
            {activeView === "table" && (
              <ResultsTable results={screenerData.results} />
            )}

            {activeView === "heatmap" && (
              <HeatmapPreview results={screenerData.results} />
            )}

            {activeView === "chart" && (
              <ChartPreview results={screenerData.results} />
            )}

            {/* Pagination */}
            {screenerData.totalPages > 1 && (
              <PaginationBar
                page={screenerData.page}
                totalPages={screenerData.totalPages}
                buildUrl={buildFilterUrl}
              />
            )}
          </div>
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
            STOCKLAB M3 &middot; Stock Screener
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Filter Rail ──────────────────────────────────────────────────────────

function FilterRail({
  facets,
  filters,
  buildUrl,
}: {
  facets: { markets: readonly string[]; sectors: readonly string[]; capBuckets: readonly string[] };
  filters: ReturnType<typeof parseScreenerParams>;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)" }}>
      {/* Market filter */}
      <FilterSelect
        label="Market"
        value={filters.market}
        options={facets.markets}
        paramKey="market"
        buildUrl={buildUrl}
      />

      {/* Sector filter */}
      <FilterSelect
        label="Sector"
        value={filters.sector}
        options={facets.sectors}
        paramKey="sector"
        buildUrl={buildUrl}
      />

      {/* Market Cap filter */}
      <FilterSelect
        label="Market Cap"
        value={filters.cap}
        options={facets.capBuckets}
        paramKey="cap"
        buildUrl={buildUrl}
      />

      {/* Min Score */}
      <div>
        <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
          Min Score
        </span>
        <a
          href={buildUrl({ minScore: undefined })}
          className="sl-btn sl-btn-ghost"
          style={{ width: "100%", justifyContent: "flex-start", fontSize: 12, padding: "6px 10px" }}
        >
          All scores (0\u2013100)
        </a>
        {[70, 50, 30].map((threshold) => (
          <a
            key={threshold}
            href={buildUrl({ minScore: String(threshold) })}
            className="sl-btn sl-btn-ghost"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 12,
              padding: "6px 10px",
              fontWeight: filters.minScore === threshold ? 700 : 400,
              color: filters.minScore === threshold ? "var(--sl-brand)" : "var(--sl-ink-sub)",
              background: filters.minScore === threshold ? "var(--sl-brand-soft)" : "transparent",
            }}
          >
            &ge; {threshold}/100
          </a>
        ))}
      </div>

      {/* Valuation band */}
      <FilterChipGroup
        label="Valuation"
        value={filters.valuation}
        options={[
          { value: "value", label: "Value (P/E < 15)" },
          { value: "growth", label: "Growth (15-30)" },
          { value: "blend", label: "Blend (20-40)" },
          { value: "expensive", label: "Expensive (>=40)" },
        ]}
        paramKey="valuation"
        buildUrl={buildUrl}
      />

      {/* Quality band */}
      <FilterChipGroup
        label="Quality (ROE)"
        value={filters.quality}
        options={[
          { value: "high", label: "High ROE (>15%)" },
          { value: "moderate", label: "Moderate (5-15%)" },
          { value: "low", label: "Low (<=5%)" },
          { value: "negative", label: "Negative" },
        ]}
        paramKey="quality"
        buildUrl={buildUrl}
      />

      {/* 6-Month Return */}
      <FilterChipGroup
        label="6M Return"
        value={filters.return6m}
        options={[
          { value: "strong_up", label: "Strong Up (>=+25%)" },
          { value: "up", label: "Up (>=+10%)" },
          { value: "flat", label: "Flat (+/-5%)" },
          { value: "down", label: "Down (<-5%)" },
          { value: "strong_down", label: "Strong Down (<-25%)" },
        ]}
        paramKey="return6m"
        buildUrl={buildUrl}
      />

      {/* Quant Factor */}
      <FilterChipGroup
        label="Quant Factor"
        value={filters.quantFactor}
        options={[
          { value: "momentum", label: "Momentum" },
          { value: "value", label: "Value" },
          { value: "quality", label: "Quality" },
          { value: "income", label: "Income" },
          { value: "balanced", label: "Balanced" },
        ]}
        paramKey="quantFactor"
        buildUrl={buildUrl}
      />

      {/* Disabled actions section */}
      <div
        style={{
          marginTop: "var(--sl-space-3)",
          paddingTop: "var(--sl-space-3)",
          borderTop: "1px solid var(--sl-line)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-2)",
        }}
      >
        <DisabledAction
          label="Save Screen"
          reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to user tables."
        />
        <DisabledAction
          label="Add to Watchlist"
          reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to watchlists."
        />
      </div>

      {/* Clear all */}
      {filters.market || filters.sector || filters.cap || filters.valuation || filters.quality || filters.return6m || filters.quantFactor || typeof filters.minScore === "number" ? (
        <a
          href="/screener"
          className="sl-btn sl-btn-secondary"
          style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
        >
          Clear Filters
        </a>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  paramKey,
  buildUrl,
}: {
  label: string;
  value: string | undefined;
  options: readonly string[];
  paramKey: string;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  return (
    <div>
      <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
        {label}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)" }}>
        <a
          href={buildUrl({ [paramKey]: undefined })}
          className="sl-btn sl-btn-ghost"
          style={{
            width: "100%",
            justifyContent: "flex-start",
            fontSize: 12,
            padding: "6px 10px",
            fontWeight: !value ? 600 : 400,
            color: !value ? "var(--sl-ink)" : "var(--sl-muted)",
          }}
        >
          All
        </a>
        {options.map((opt) => (
          <a
            key={opt}
            href={buildUrl({ [paramKey]: opt })}
            className="sl-btn sl-btn-ghost"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 12,
              padding: "6px 10px",
              fontWeight: value === opt ? 700 : 400,
              color: value === opt ? "var(--sl-brand)" : "var(--sl-ink-sub)",
              background: value === opt ? "var(--sl-brand-soft)" : "transparent",
            }}
          >
            {opt}
          </a>
        ))}
      </div>
    </div>
  );
}

function FilterChipGroup({
  label,
  value,
  options,
  paramKey,
  buildUrl,
}: {
  label: string;
  value: string | undefined;
  options: readonly { value: string; label: string }[];
  paramKey: string;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  return (
    <div>
      <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
        {label}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)" }}>
        <a
          href={buildUrl({ [paramKey]: undefined })}
          className="sl-btn sl-btn-ghost"
          style={{
            width: "100%",
            justifyContent: "flex-start",
            fontSize: 12,
            padding: "6px 10px",
            fontWeight: !value ? 600 : 400,
            color: !value ? "var(--sl-ink)" : "var(--sl-muted)",
          }}
        >
          All
        </a>
        {options.map((opt) => (
          <a
            key={opt.value}
            href={buildUrl({ [paramKey]: opt.value })}
            className="sl-btn sl-btn-ghost"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 12,
              padding: "6px 10px",
              fontWeight: value === opt.value ? 700 : 400,
              color: value === opt.value ? "var(--sl-brand)" : "var(--sl-ink-sub)",
              background: value === opt.value ? "var(--sl-brand-soft)" : "transparent",
            }}
          >
            {opt.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Action Bar ──────────────────────────────────────────────────────────

function ActionBar({
  activeView,
  total,
  page,
  totalPages,
  buildUrl,
}: {
  activeView: ScreenerView;
  total: number;
  page: number;
  totalPages: number;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  return (
    <div
      className="sl-card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--sl-space-3) var(--sl-space-4)",
        flexWrap: "wrap",
        gap: "var(--sl-space-3)",
      }}
    >
      {/* Left: view toggles */}
      <div
        role="tablist"
        aria-label="View mode"
        style={{ display: "flex", gap: "var(--sl-space-1)" }}
      >
        {VIEW_TABS.map((vt) => (
          <a
            key={vt.id}
            href={buildUrl({ view: vt.id })}
            role="tab"
            aria-selected={activeView === vt.id}
            data-active={activeView === vt.id ? "true" : undefined}
            className="sl-btn sl-btn-ghost"
            style={{
              fontSize: 12,
              fontWeight: activeView === vt.id ? 600 : 500,
              color: activeView === vt.id ? "var(--sl-brand)" : "var(--sl-muted)",
              background: activeView === vt.id ? "var(--sl-brand-soft)" : "transparent",
              borderBottom: activeView === vt.id ? "2px solid var(--sl-brand)" : "2px solid transparent",
              borderRadius: 0,
              marginBottom: "-2px",
            }}
          >
            {vt.label}
          </a>
        ))}
      </div>

      {/* Right: count + pagination hint */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-4)" }}>
        <span className="sl-body-sm" style={{ color: "var(--sl-muted)" }}>
          {total.toLocaleString()} securities found
        </span>
        {totalPages > 1 && (
          <span className="sl-caption">
            Page {page} of {totalPages}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Results Table ───────────────────────────────────────────────────────

function ResultsTable({ results }: { results: readonly ScreenerResult[] }) {
  if (results.length === 0) {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-6)" }}>
        <div className="sl-center" style={{ flexDirection: "column", gap: "var(--sl-space-3)" }}>
          <span className="sl-text-muted sl-body-sm">No securities match the current filters.</span>
          <span className="sl-caption">Try adjusting your filter criteria or clearing all filters.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="sl-card" style={{ overflow: "hidden" }} aria-label="Screener results table">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--sl-surface-alt)", borderBottom: "1px solid var(--sl-line)" }}>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Symbol</th>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Name</th>
              <th style={{ textAlign: "center", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Market</th>
              <th style={{ textAlign: "left", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Sector</th>
              <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</th>
              <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Change</th>
              <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>P/E</th>
              <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>ROE</th>
              <th style={{ textAlign: "right", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>6M Return</th>
              <th style={{ textAlign: "center", padding: "var(--sl-space-3) var(--sl-space-4)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr
                key={row.symbol}
                style={{ borderBottom: "1px solid var(--sl-hairline)", transition: "background var(--sl-motion-fast)" }}
              >
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)" }}>
                  <a
                    href={`/stock/${row.symbol}`}
                    className="sl-mono"
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--sl-brand)",
                      textDecoration: "none",
                    }}
                  >
                    {row.symbol}
                  </a>
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-ink-sub)", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row.name}
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "center" }}>
                  <span className="sl-tag" style={{ fontSize: 10 }}>{row.market ?? row.country}</span>
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", color: "var(--sl-ink-sub)", fontSize: 12 }}>
                  {row.sector ?? "\u2014"}
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                  {formatPx(row.px)}
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                  <FormatPct pct={row.pct} />
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                  {row.pe !== null ? row.pe.toFixed(1) : "\u2014"}
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                  {row.roe !== null ? `${row.roe.toFixed(1)}%` : "\u2014"}
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "right" }} className="sl-mono">
                  {row.return6m !== null ? <FormatPct pct={row.return6m} /> : "\u2014"}
                </td>
                <td style={{ padding: "var(--sl-space-2) var(--sl-space-4)", textAlign: "center" }}>
                  <ScoreBadge score={row.score} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Heatmap Preview ─────────────────────────────────────────────────────

function HeatmapPreview({ results }: { results: readonly ScreenerResult[] }) {
  if (results.length === 0) {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-6)" }}>
        <div className="sl-center" style={{ flexDirection: "column", gap: "var(--sl-space-3)" }}>
          <span className="sl-text-muted sl-body-sm">No data to render heatmap.</span>
        </div>
      </section>
    );
  }

  // Group by sector for a simple block-based heatmap
  const sectorGroups = new Map<string, ScreenerResult[]>();
  for (const r of results) {
    const key = r.sector ?? "Other";
    const existing = sectorGroups.get(key) ?? [];
    existing.push(r);
    sectorGroups.set(key, existing);
  }

  return (
    <section className="sl-card" aria-label="Heatmap preview" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Sector Heatmap Preview (by change %)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
        {[...sectorGroups.entries()].map(([sector, items]) => (
          <div key={sector}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sl-muted)", marginBottom: "var(--sl-space-1)" }}>
              {sector}
            </div>
            <div
              style={{
                display: "flex",
                gap: "2px",
                flexWrap: "wrap",
              }}
            >
              {items.slice(0, 20).map((item) => {
                const pct = item.pct ?? 0;
                let bg = "var(--sl-surface-alt)";
                let color = "var(--sl-muted)";
                if (item.pct !== null) {
                  if (pct >= 2) { bg = "var(--sl-up-soft)"; color = "var(--sl-up)"; }
                  else if (pct > 0) { bg = "#e6f7f1"; color = "var(--sl-up)"; }
                  else if (pct <= -2) { bg = "var(--sl-down-soft)"; color = "var(--sl-down)"; }
                  else if (pct < 0) { bg = "#fde9ea"; color = "var(--sl-down)"; }
                }

                return (
                  <a
                    key={item.symbol}
                    href={`/stock/${item.symbol}`}
                    title={`${item.symbol} (${item.name}) ${item.pct !== null ? `${item.pct >= 0 ? "+" : ""}${item.pct.toFixed(2)}%` : ""}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 56,
                      height: 32,
                      borderRadius: "var(--sl-radius-sm)",
                      background: bg,
                      color,
                      fontSize: 10,
                      fontWeight: 600,
                      textDecoration: "none",
                      padding: "0 var(--sl-space-2)",
                      transition: "transform var(--sl-motion-fast)",
                    }}
                  >
                    {item.symbol.length > 6 ? `${item.symbol.slice(0, 5)}..` : item.symbol}
                  </a>
                );
              })}
              {items.length > 20 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 56,
                    height: 32,
                    borderRadius: "var(--sl-radius-sm)",
                    background: "var(--sl-surface-alt)",
                    color: "var(--sl-faint)",
                    fontSize: 10,
                    padding: "0 var(--sl-space-2)",
                  }}
                >
                  +{items.length - 20} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Chart Preview ───────────────────────────────────────────────────────

function ChartPreview({ results }: { results: readonly ScreenerResult[] }) {
  if (results.length === 0) {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-6)" }}>
        <div className="sl-center" style={{ flexDirection: "column", gap: "var(--sl-space-3)" }}>
          <span className="sl-text-muted sl-body-sm">No data to render chart.</span>
        </div>
      </section>
    );
  }

  // Simple horizontal bar chart of top scorers
  const sorted = [...results].sort((a, b) => b.score - a.score).slice(0, 15);
  const maxScore = Math.max(...sorted.map((r) => r.score), 1);

  return (
    <section className="sl-card" aria-label="Chart preview" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Top Scores Preview
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
        {sorted.map((row) => (
          <div key={row.symbol} style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-3)" }}>
            <a
              href={`/stock/${row.symbol}`}
              className="sl-mono"
              style={{
                fontSize: 12,
                fontWeight: 600,
                minWidth: 72,
                color: "var(--sl-brand)",
                textDecoration: "none",
              }}
            >
              {row.symbol}
            </a>
            <div style={{ flex: 1, height: 16, background: "var(--sl-surface-alt)", borderRadius: "var(--sl-radius-pill)", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${(row.score / maxScore) * 100}%`,
                  height: "100%",
                  borderRadius: "var(--sl-radius-pill)",
                  background:
                    row.score >= 70
                      ? "var(--sl-up)"
                      : row.score >= 40
                        ? "var(--sl-brand)"
                        : row.score >= 25
                          ? "var(--sl-warn)"
                          : "var(--sl-down)",
                  transition: "width var(--sl-motion-base)",
                  }}
              />
            </div>
            <span className="sl-mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 36, textAlign: "right" }}>
              {row.score}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Pagination Bar ──────────────────────────────────────────────────────

function PaginationBar({
  page,
  totalPages,
  buildUrl,
}: {
  page: number;
  totalPages: number;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}) {
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-2)", justifyContent: "center" }}>
      {page > 1 && (
        <a href={buildUrl({ page: String(page - 1) })} className="sl-btn sl-btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
          Prev
        </a>
      )}

      {pages.map((p) => (
        <a
          key={p}
          href={buildUrl({ page: String(p) })}
          className="sl-btn"
          style={{
            fontSize: 12,
            padding: "6px 12px",
            fontWeight: p === page ? 700 : 500,
            background: p === page ? "var(--sl-brand)" : "var(--sl-surface-alt)",
            color: p === page ? "#fff" : "var(--sl-ink)",
            borderColor: p === page ? "var(--sl-brand)" : "var(--sl-line)",
          }}
        >
          {p}
        </a>
      ))}

      {page < totalPages && (
        <a href={buildUrl({ page: String(page + 1) })} className="sl-btn sl-btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
          Next
        </a>
      )}
    </nav>
  );
}

// ── Shared UI Components ───────────────────────────────────────────────

function DisabledAction({ label, reason }: { label: string; reason: string }) {
  return (
    <button
      type="button"
      disabled
      className="sl-btn"
      style={{
        width: "100%",
        justifyContent: "flex-start",
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

function ScoreBadge({ score }: { score: number }) {
  let bg = "var(--sl-surface-alt)";
  let color = "var(--sl-muted)";

  if (score >= 70) { bg = "var(--sl-up-soft)"; color = "var(--sl-up)"; }
  else if (score >= 50) { bg = "var(--sl-brand-soft)"; color = "var(--sl-brand-ink)"; }
  else if (score >= 30) { bg = "var(--sl-warn-soft)"; color = "var(--sl-warn)"; }
  else { bg = "var(--sl-down-soft)"; color = "var(--sl-down)"; }

  return (
    <span
      className="sl-mono"
      style={{
        fontSize: 12,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "var(--sl-radius-sm)",
        background: bg,
        color,
      }}
    >
      {score}
    </span>
  );
}

function FormatPct({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color: "var(--sl-muted)" }}>\u2014</span>;
  const isUp = pct >= 0;
  return (
    <span style={{ color: isUp ? "var(--sl-up)" : "var(--sl-down)" }}>
      {isUp ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}

function formatPx(px: number | null): string {
  if (px === null) return "\u2014";
  if (px >= 100_000) return px.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (px >= 1_000) return px.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return px.toFixed(2);
}
