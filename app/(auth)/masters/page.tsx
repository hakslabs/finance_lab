import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import { SafeMarkdown } from "@/app/_lib/markdown/safe-markdown";
import {
  fetchMastersData,
  findLatestQuarter,
  getQuarterlyDeltas,
  getTopHoldings,
  type MasterHolding,
  type MasterProfile,
  type MasterQuarterDelta,
  searchMasterProfiles,
} from "@/app/_lib/masters/masters-data";

export const metadata = {
  title: "STOCKLAB — Investment Masters",
  description:
    "Track investment masters, their portfolios, holdings, and quarterly changes.",
};

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Masters hub page — server-rendered with left roster list and right profile panel.
 *
 * Protected by the temporary M0 auth session.
 * URL params: ?q= (search), ?style= (filter), ?id= (select master).
 */
export default async function MastersPage({
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
  const style = typeof params.style === "string" ? params.style : undefined;
  const selectedId = typeof params.id === "string" ? params.id : undefined;

  const data = await fetchMastersData(selectedId);
  const filtered = searchMasterProfiles(data.profiles, query, style);
  const effectiveSelected = selectedId
    ? filtered.find((profile) => profile.id === selectedId) ?? null
    : filtered[0] ?? null;
  const effectiveQuarter = findLatestQuarter(data.holdings, effectiveSelected?.id);
  const effectiveTopHoldings = getTopHoldings(data.holdings, effectiveSelected?.id ?? null, effectiveQuarter);
  const effectiveDeltas = getQuarterlyDeltas(data.holdings, effectiveSelected?.id ?? null, effectiveQuarter);

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
          <h1 className="sl-h1">Investment Masters</h1>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            Track notable investors, their portfolio holdings, and quarter-over-quarter changes.
          </p>
        </header>

        {/* Main layout: left roster + right profile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "var(--sl-space-5)",
            alignItems: "start",
          }}
        >
          {/* Left: Master roster */}
          <aside
            className="sl-card"
            aria-label="Master roster"
            style={{ padding: "var(--sl-space-5)", position: "sticky", top: 80 }}
          >
            {/* Search input (URL-driven) */}
            <div style={{ marginBottom: "var(--sl-space-4)" }}>
              <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
                Search
              </span>
              <form action="/masters" method="get">
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Name, firm, style..."
                  className="sl-body-sm"
                  style={{
                    width: "100%",
                    padding: "var(--sl-space-2) var(--sl-space-3)",
                    borderRadius: "var(--sl-radius-md)",
                    border: "1px solid var(--sl-line)",
                    background: "var(--sl-surface)",
                    color: "var(--sl-ink)",
                    fontSize: 13,
                    outline: "none",
                    transition: "border-color var(--sl-motion-fast)",
                  }}
                />
                {selectedId && (
                  <input type="hidden" name="id" value={selectedId} />
                )}
              </form>
            </div>

            {/* Style filter chips */}
            {data.styleFacets.length > 0 && (
              <div style={{ marginBottom: "var(--sl-space-4)" }}>
                <span className="sl-label" style={{ display: "block", marginBottom: "var(--sl-space-2)" }}>
                  Style
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)" }}>
                  <a
                    href={`/masters${buildQueryString({ q: query, id: selectedId })}`}
                    className="sl-btn sl-btn-ghost"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      fontSize: 12,
                      padding: "6px 10px",
                      fontWeight: !style ? 600 : 400,
                      color: !style ? "var(--sl-ink)" : "var(--sl-muted)",
                    }}
                  >
                    All Styles
                  </a>
                  {data.styleFacets.map((facet) => (
                    <a
                      key={facet}
                      href={`/masters${buildQueryString({ q: query, style: facet, id: selectedId })}`}
                      className="sl-btn sl-btn-ghost"
                      style={{
                        width: "100%",
                        justifyContent: "flex-start",
                        fontSize: 12,
                        padding: "6px 10px",
                        fontWeight: style === facet ? 700 : 400,
                        color: style === facet ? "var(--sl-brand)" : "var(--sl-ink-sub)",
                        background: style === facet ? "var(--sl-brand-soft)" : "transparent",
                      }}
                    >
                      {facet}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Roster list */}
            <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>
              Masters ({filtered.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-1)", maxHeight: 520, overflowY: "auto" }}>
              {filtered.length > 0 ? (
                filtered.map((profile) => (
                  <a
                    key={profile.id}
                    href={`/masters${buildQueryString({ q: query, style, id: profile.id })}`}
                    data-selected={effectiveSelected?.id === profile.id ? "true" : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sl-space-3)",
                      padding: "var(--sl-space-2) var(--sl-space-3)",
                      borderRadius: "var(--sl-radius-sm)",
                      textDecoration: "none",
                      color: "inherit",
                      background: effectiveSelected?.id === profile.id ? "var(--sl-brand-soft)" : "transparent",
                      borderLeft: effectiveSelected?.id === profile.id ? "3px solid var(--sl-brand)" : "3px solid transparent",
                      transition: "background var(--sl-motion-fast)",
                    }}
                  >
                    <MasterAvatar name={profile.name} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sl-ink)" }}>
                        {profile.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--sl-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {profile.firm ?? profile.style ?? "\u2014"}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="sl-center" style={{ padding: "var(--sl-space-4) 0", flexDirection: "column", gap: "var(--sl-space-2)" }}>
                  <span className="sl-text-muted sl-body-sm">No masters match your search.</span>
                </div>
              )}
            </div>

            {/* Disabled follow action */}
            <div
              style={{
                marginTop: "var(--sl-space-4)",
                paddingTop: "var(--sl-space-3)",
                borderTop: "1px solid var(--sl-line)",
              }}
            >
              <DisabledAction
                label="Follow Master"
                reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to user tables."
              />
            </div>
          </aside>

          {/* Right: Profile panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)", minWidth: 0 }}>
            {effectiveSelected ? (
              <>
                <ProfileHero profile={effectiveSelected} />

                {/* Top 10 Holdings */}
                <HoldingsPanel
                  holdings={effectiveTopHoldings}
                  quarter={effectiveQuarter}
                />

                {/* Quarterly Deltas */}
                <DeltasPanel deltas={effectiveDeltas} quarter={effectiveQuarter} />

                {/* Philosophy Markdown (sanitized) */}
                {effectiveSelected.philosophyMd && (
                  <PhilosophySection markdown={effectiveSelected.philosophyMd} />
                )}
              </>
            ) : (
              <section className="sl-card" style={{ padding: "var(--sl-space-6)" }}>
                <EmptyState message="Select a master from the roster to view their profile and holdings." />
              </section>
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
            STOCKLAB M4 &middot; Investment Masters
          </span>
        </footer>
      </main>
    </div>
  );
}

function formatWeight(weight: number | null): string {
  if (weight === null) return "\u2014";
  const pct = Math.abs(weight) <= 1 ? weight * 100 : weight;
  return `${pct.toFixed(1)}%`;
}

// ── Sub-components ───────────────────────────────────────────────────────

function MasterAvatar({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--sl-cat2), var(--sl-brand))",
        color: "var(--sl-surface)",
        fontSize: 13,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ProfileHero({ profile }: { profile: MasterProfile }) {
  return (
    <section className="sl-card" aria-label="Master profile" style={{ padding: "var(--sl-space-6)" }}>
      <div style={{ display: "flex", alignItems: "start", gap: "var(--sl-space-5)" }}>
        {/* Large avatar */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--sl-cat2), var(--sl-brand))",
            color: "var(--sl-surface)",
            fontSize: 26,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sl-h2">{profile.name}</h2>
          <div style={{ display: "flex", gap: "var(--sl-space-3)", marginTop: "var(--sl-space-2)", flexWrap: "wrap" }}>
            {profile.firm && <span className="sl-tag">{profile.firm}</span>}
            {profile.style && <span className="sl-tag sl-tag-brand">{profile.style}</span>}
            <span className="sl-caption">
              Updated {formatDate(profile.updatedAt)}
            </span>
          </div>

          {/* Link to dedicated detail page */}
          <div style={{ marginTop: "var(--sl-space-3)" }}>
            <a
              href={`/masters/${profile.id}`}
              className="sl-btn sl-btn-secondary"
              style={{ fontSize: 12 }}
            >
              View Full Profile
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HoldingsPanel({
  holdings,
  quarter,
}: {
  holdings: readonly MasterHolding[];
  quarter: string | null;
}) {
  return (
    <section className="sl-card" aria-label="Top holdings" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sl-space-4)" }}>
        <div className="sl-label">Top 10 Holdings{quarter ? ` \u2014 ${quarter}` : ""}</div>
        {holdings.length > 0 && (
          <span className="sl-caption">{holdings.length} positions</span>
        )}
      </div>

      {holdings.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Symbol</th>
                <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Name</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Weight</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Shares</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>QoQ \u0394</th>
              </tr>
            </thead>
            <tbody>
              {holdings.slice(0, 10).map((holding) => (
                <tr key={holding.symbol} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                    <a
                      href={`/stock/${holding.symbol}`}
                      className="sl-mono"
                      style={{ fontWeight: 700, fontSize: 13, color: "var(--sl-brand)", textDecoration: "none" }}
                    >
                      {holding.symbol}
                    </a>
                  </td>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-ink-sub)", fontSize: 12, maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {holding.name}
                  </td>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                    {formatWeight(holding.weight)}
                  </td>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                    {holding.shares !== null ? formatNumber(holding.shares) : "\u2014"}
                  </td>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                    {holding.price !== null ? formatPx(holding.price) : "\u2014"}
                  </td>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                    <DeltaBadge delta={holding.qoqDelta} symbol={holding.symbol} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No holdings data available for this master yet." />
      )}
    </section>
  );
}

function DeltasPanel({
  deltas,
  quarter,
}: {
  deltas: readonly MasterQuarterDelta[];
  quarter: string | null;
}) {
  return (
    <section className="sl-card" aria-label="Quarterly changes" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Quarterly Changes{quarter ? ` \u2014 ${quarter}` : ""}
      </div>

      {deltas.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
          {deltas.map((delta) => (
            <DeltaRow key={`${delta.symbol}-${delta.quarter}`} delta={delta} />
          ))}
        </div>
      ) : (
        <EmptyState message="No significant quarter-over-quarter changes detected." compact />
      )}
    </section>
  );
}

function DeltaRow({ delta }: { delta: MasterQuarterDelta }) {
  const directionConfig: Record<MasterQuarterDelta["direction"], { label: string; bg: string; color: string }> = {
    added: { label: "New", bg: "var(--sl-info-soft)", color: "var(--sl-info)" },
    increased: { label: "Increased", bg: "var(--sl-up-soft)", color: "var(--sl-up)" },
    decreased: { label: "Decreased", bg: "var(--sl-down-soft)", color: "var(--sl-down)" },
    removed: { label: "Removed", bg: "var(--sl-warn-soft)", color: "var(--sl-warn)" },
  };
  const config = directionConfig[delta.direction];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-2) var(--sl-space-3)",
        borderRadius: "var(--sl-radius-sm)",
        background: "var(--sl-surface-alt)",
      }}
    >
      <a
        href={`/stock/${delta.symbol}${delta.direction === "increased" || delta.direction === "decreased" ? "?tab=flow" : ""}`}
        className="sl-mono"
        style={{ fontWeight: 700, fontSize: 13, color: "var(--sl-brand)", textDecoration: "none", minWidth: 72 }}
      >
        {delta.symbol}
      </a>
      <span style={{ fontSize: 12, color: "var(--sl-ink-sub)", flex: 1 }}>{delta.name}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "var(--sl-radius-sm)",
          background: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
      {delta.direction !== "added" && delta.direction !== "removed" && (
        <span className="sl-mono" style={{ fontSize: 12, fontWeight: 600, color: delta.qoqDelta >= 0 ? "var(--sl-up)" : "var(--sl-down)", minWidth: 56, textAlign: "right" }}>
          {delta.qoqDelta >= 0 ? "+" : ""}{delta.qoqDelta.toFixed(0)}
        </span>
      )}
    </div>
  );
}

function PhilosophySection({ markdown }: { markdown: string }) {
  return (
    <section className="sl-card" aria-label="Investment philosophy" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Investment Philosophy
      </div>
      <SafeMarkdown
        markdown={markdown}
        className="sl-body-sm"
        style={{
          lineHeight: 1.7,
          color: "var(--sl-ink-sub)",
        }}
      />
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

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className="sl-center"
      style={{
        flexDirection: "column",
        gap: compact ? "var(--sl-space-2)" : "var(--sl-space-3)",
        padding: compact ? "var(--sl-space-4) 0" : "var(--sl-space-6) 0",
      }}
    >
      <span className="sl-text-muted sl-body-sm">{message}</span>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number | null; symbol: string }) {
  if (delta === null || delta === 0) {
    return <span style={{ color: "var(--sl-muted)" }}>\u2014</span>;
  }
  const isUp = delta > 0;
  return (
    <span style={{ color: isUp ? "var(--sl-up)" : "var(--sl-down)" }}>
      {isUp ? "+" : ""}{delta.toFixed(0)}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildQueryString(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of entries) {
    if (v !== undefined) sp.set(k, v);
  }
  return `?${sp.toString()}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString();
}

function formatPx(px: number | null): string {
  if (px === null) return "\u2014";
  if (px >= 100_000) return px.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (px >= 1_000) return px.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return px.toFixed(2);
}
