import Link from "next/link";
import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import { SafeMarkdown } from "@/app/_lib/markdown/safe-markdown";
import {
  fetchMastersData,
  type MasterHolding,
  type MasterProfile,
  type MasterQuarterDelta,
} from "@/app/_lib/masters/masters-data";

// ── Page ────────────────────────────────────────────────────────────────

/**
 * Master detail page — server-rendered profile, holdings, and philosophy.
 *
 * Protected by the temporary M0 auth session.
 */
export default async function MastersDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const { id: masterId } = await params;
  const data = await fetchMastersData(masterId);
  const profile = data.selectedProfile;

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
        <GlobalHeader userName={session?.role ?? undefined} />
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--sl-space-5) var(--sl-space-6)" }}>
          <section className="sl-card" style={{ padding: "var(--sl-space-8)", textAlign: "center" }}>
            <h1 className="sl-h2" style={{ marginBottom: "var(--sl-space-3)" }}>Master Not Found</h1>
            <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)", marginBottom: "var(--sl-space-5)" }}>
              The requested master profile does not exist or has been removed.
            </p>
            <Link href="/masters" className="sl-btn sl-btn-primary">Back to Masters</Link>
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
          <Link href="/masters" className="sl-text-muted" style={{ textDecoration: "none" }}>
            &larr; All Masters
          </Link>
        </nav>

        {/* Hero / Profile */}
        <DetailHero profile={profile} />

        {/* Top Holdings */}
        <HoldingsTable
          holdings={data.topHoldings}
          quarter={data.latestQuarter}
        />

        {/* Quarterly Deltas */}
        <DeltasTable deltas={data.quarterlyDeltas} quarter={data.latestQuarter} />

        {/* Philosophy (sanitized Markdown) */}
        {profile.philosophyMd && (
          <PhilosophyBody markdown={profile.philosophyMd} />
        )}

        {/* Disabled follow action */}
        <section className="sl-card" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
          <DisabledAction
            label={`Follow ${profile.name}`}
            reason="Requires real Supabase auth (OAuth). Temporary sessions cannot write to user tables."
          />
        </section>

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

function DetailHero({ profile }: { profile: MasterProfile }) {
  return (
    <section className="sl-card" aria-label="Master detail hero" style={{ padding: "var(--sl-space-7) var(--sl-space-6)" }}>
      <div style={{ display: "flex", alignItems: "start", gap: "var(--sl-space-5)" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--sl-cat2), var(--sl-brand))",
            color: "var(--sl-surface)",
            fontSize: 32,
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
          <h1 className="sl-h1">{profile.name}</h1>
          <div style={{ display: "flex", gap: "var(--sl-space-3)", marginTop: "var(--sl-space-3)", flexWrap: "wrap" }}>
            {profile.firm && <span className="sl-tag">{profile.firm}</span>}
            {profile.style && <span className="sl-tag sl-tag-brand">{profile.style}</span>}
            <span className="sl-caption">
              Updated {formatDate(profile.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HoldingsTable({
  holdings,
  quarter,
}: {
  holdings: readonly MasterHolding[];
  quarter: string | null;
}) {
  return (
    <section className="sl-card" aria-label="Holdings table" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sl-space-4)" }}>
        <div className="sl-label">
          Portfolio Holdings{quarter ? ` \u2014 ${quarter}` : ""}
        </div>
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
                <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Sector</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Weight</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Shares</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>QoQ \u0394</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
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
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-ink-sub)", fontSize: 12 }}>{holding.name}</td>
                  <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-ink-sub)", fontSize: 12 }}>{holding.sector ?? "\u2014"}</td>
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
                    <DeltaValue delta={holding.qoqDelta} />
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

function DeltasTable({
  deltas,
  quarter,
}: {
  deltas: readonly MasterQuarterDelta[];
  quarter: string | null;
}) {
  const directionConfig: Record<MasterQuarterDelta["direction"], { label: string; bg: string; color: string }> = {
    added: { label: "New", bg: "var(--sl-info-soft)", color: "var(--sl-info)" },
    increased: { label: "Increased", bg: "var(--sl-up-soft)", color: "var(--sl-up)" },
    decreased: { label: "Decreased", bg: "var(--sl-down-soft)", color: "var(--sl-down)" },
    removed: { label: "Removed", bg: "var(--sl-warn-soft)", color: "var(--sl-warn)" },
  };

  return (
    <section className="sl-card" aria-label="Quarterly changes table" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Quarterly Changes{quarter ? ` \u2014 ${quarter}` : ""}
      </div>

      {deltas.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Symbol</th>
                <th style={{ textAlign: "left", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Name</th>
                <th style={{ textAlign: "center", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Direction</th>
                <th style={{ textAlign: "right", padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {deltas.map((delta) => {
                const config = directionConfig[delta.direction];
                return (
                  <tr key={`${delta.symbol}-${delta.direction}`} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)" }}>
                      <a
                        href={`/stock/${delta.symbol}${delta.direction === "increased" || delta.direction === "decreased" ? "?tab=flow" : ""}`}
                        className="sl-mono"
                        style={{ fontWeight: 700, fontSize: 13, color: "var(--sl-brand)", textDecoration: "none" }}
                      >
                        {delta.symbol}
                      </a>
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", color: "var(--sl-ink-sub)", fontSize: 12 }}>{delta.name}</td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "center" }}>
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
                    </td>
                    <td style={{ padding: "var(--sl-space-2) var(--sl-space-3)", textAlign: "right" }} className="sl-mono">
                      {delta.direction !== "added" && delta.direction !== "removed"
                        ? <DeltaValue delta={delta.qoqDelta} />
                        : <span style={{ color: "var(--sl-muted)" }}>\u2014</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No significant quarter-over-quarter changes detected." compact />
      )}
    </section>
  );
}

function PhilosophyBody({ markdown }: { markdown: string }) {
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

function DeltaValue({ delta }: { delta: number | null }) {
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
