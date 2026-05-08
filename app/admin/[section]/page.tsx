import { notFound } from "next/navigation";

import {
  fetchAdminApiUsage,
  fetchAdminCronLogs,
  fetchAdminDashboard,
  fetchAdminLearnList,
  fetchAdminMasters,
  fetchAdminNewsList,
  fetchAdminSecuritiesMaster,
  fetchAdminTermsList,
  fetchAdminThirteenFStatus,
  type AdminSectionId,
} from "@/app/_lib/admin/admin-data";
import { AdminShell } from "@/app/_lib/admin/admin-shell";
import { requireAdminSession } from "@/app/_lib/admin/role-guard";

const SECTION_IDS = [
  "masters",
  "13f",
  "learn",
  "terms",
  "news",
  "users",
  "api-usage",
  "cron",
  "securities-master",
  "announcements",
] as const satisfies readonly AdminSectionId[];

type Section = (typeof SECTION_IDS)[number];

function isSection(value: string): value is Section {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export const metadata = {
  title: "STOCKLAB Admin",
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const session = await requireAdminSession();
  const { section } = await params;
  if (!isSection(section)) {
    notFound();
  }

  const dashboard = await fetchAdminDashboard();

  return (
    <AdminShell
      adminEmail={session.sub}
      sections={dashboard.sections}
      activeSectionId={section}
    >
      <SectionHeader section={section} />
      <ReadOnlyBanner />
      <SectionBody section={section} />
    </AdminShell>
  );
}

function ReadOnlyBanner() {
  return (
    <div
      role="status"
      style={{
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px dashed var(--sl-line-strong)",
        fontSize: 12,
        color: "var(--sl-muted)",
      }}
    >
      Read-only mode under temporary auth. Mutations (create / edit /
      publish / role changes) are gated until production OAuth sessions are
      available.
    </div>
  );
}

function SectionHeader({ section }: { readonly section: Section }) {
  const titles: Record<Section, { title: string; description: string }> = {
    masters: {
      title: "Masters",
      description: "Master profile records — read-only locally.",
    },
    "13f": {
      title: "13F Parsing",
      description: "Holdings parse status by master and quarter.",
    },
    learn: {
      title: "Learn Content",
      description: "Guide articles. Publish/unpublish gated to production.",
    },
    terms: {
      title: "Terms Dictionary",
      description: "Glossary entries. CRUD gated to production.",
    },
    news: {
      title: "News Curation",
      description: "Recent news ingest. Pin/hide actions gated to production.",
    },
    users: {
      title: "Users",
      description: "User listing requires production OAuth and admin Supabase access.",
    },
    "api-usage": {
      title: "API Usage",
      description: "Provider quota utilization summary.",
    },
    cron: {
      title: "Cron Logs",
      description: "Recent cron job executions.",
    },
    "securities-master": {
      title: "Securities Master",
      description: "FinanceDatabase-seeded symbol catalog (US + South Korea).",
    },
    announcements: {
      title: "Announcements",
      description: "System banner scheduling — gated to production.",
    },
  };
  const meta = titles[section];
  return (
    <header>
      <h1 className="sl-h1">{meta.title}</h1>
      <p
        className="sl-body-sm"
        style={{ color: "var(--sl-muted)", marginTop: "var(--sl-space-1)" }}
      >
        {meta.description}
      </p>
    </header>
  );
}

async function SectionBody({ section }: { readonly section: Section }) {
  if (section === "masters") {
    const items = await fetchAdminMasters();
    return <MastersTable items={items} />;
  }
  if (section === "13f") {
    const status = await fetchAdminThirteenFStatus();
    return <ThirteenFTable status={status} />;
  }
  if (section === "learn") {
    const items = await fetchAdminLearnList();
    return <LearnTable items={items} />;
  }
  if (section === "terms") {
    const items = await fetchAdminTermsList();
    return <TermsTable items={items} />;
  }
  if (section === "news") {
    const items = await fetchAdminNewsList();
    return <NewsTable items={items} />;
  }
  if (section === "api-usage") {
    const items = await fetchAdminApiUsage();
    return <ApiUsageTable items={items} />;
  }
  if (section === "cron") {
    const items = await fetchAdminCronLogs();
    return <CronLogsTable items={items} />;
  }
  if (section === "securities-master") {
    const summary = await fetchAdminSecuritiesMaster();
    return <SecuritiesMasterPanel summary={summary} />;
  }
  return <ProductionGatedPanel section={section} />;
}

function ProductionGatedPanel({ section }: { readonly section: Section }) {
  const messages: Partial<Record<Section, string>> = {
    users:
      "User listing requires service-role Supabase access and real OAuth sessions. This section is intentionally not implemented in the local read-only slice.",
    announcements:
      "Announcement scheduling requires real OAuth admin sessions and a banner persistence table. Gated to production.",
  };
  return (
    <section
      className="sl-card sl-center"
      style={{
        flexDirection: "column",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-7)",
        textAlign: "center",
      }}
    >
      <span className="sl-tag sl-tag-warn">Production gated</span>
      <p className="sl-body-sm" style={{ color: "var(--sl-muted)", maxWidth: 480 }}>
        {messages[section] ?? "Section gated to production deployment."}
      </p>
    </section>
  );
}

// ── Tables ─────────────────────────────────────────────────────────────

function EmptyRow({ label }: { readonly label: string }) {
  return (
    <tr>
      <td
        colSpan={99}
        style={{
          padding: "var(--sl-space-5)",
          textAlign: "center",
          color: "var(--sl-muted)",
          fontSize: 13,
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function MastersTable({
  items,
}: {
  readonly items: readonly Awaited<ReturnType<typeof fetchAdminMasters>>[number][];
}) {
  return (
    <DataTable headers={["Name", "Firm", "Style", "Holdings", "Latest qtr"]}>
      {items.length === 0 ? (
        <EmptyRow label="No master profiles seeded yet." />
      ) : (
        items.map((m) => (
          <tr key={m.id} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
            <Td>{m.name}</Td>
            <Td>{m.firm ?? "—"}</Td>
            <Td>{m.style ?? "—"}</Td>
            <Td mono>{m.holdingsCount}</Td>
            <Td mono>{m.latestQuarter ?? "—"}</Td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function ThirteenFTable({
  status,
}: {
  readonly status: Awaited<ReturnType<typeof fetchAdminThirteenFStatus>>;
}) {
  return (
    <>
      <div className="sl-card" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
        <span className="sl-label">Total holdings rows</span>
        <span
          className="sl-mono"
          style={{
            fontSize: 22,
            fontWeight: 700,
            display: "block",
            marginTop: "var(--sl-space-2)",
          }}
        >
          {status.totalHoldings.toLocaleString("en-US")}
        </span>
      </div>
      <DataTable headers={["Master", "Holdings", "Latest qtr"]}>
        {status.byMaster.length === 0 ? (
          <EmptyRow label="No 13F data ingested yet." />
        ) : (
          status.byMaster.map((m) => (
            <tr
              key={m.id}
              style={{ borderBottom: "1px solid var(--sl-hairline)" }}
            >
              <Td>{m.name}</Td>
              <Td mono>{m.holdingsCount}</Td>
              <Td mono>{m.latestQuarter ?? "—"}</Td>
            </tr>
          ))
        )}
      </DataTable>
    </>
  );
}

function LearnTable({
  items,
}: {
  readonly items: readonly Awaited<ReturnType<typeof fetchAdminLearnList>>[number][];
}) {
  return (
    <DataTable headers={["Title", "Category", "Status", "Published"]}>
      {items.length === 0 ? (
        <EmptyRow label="No articles authored yet." />
      ) : (
        items.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
            <Td>{row.title}</Td>
            <Td>
              <span className="sl-tag">{row.category}</span>
            </Td>
            <Td>
              <span
                className="sl-tag"
                style={{
                  background:
                    row.status === "published"
                      ? "var(--sl-up-soft, #d4edda)"
                      : "var(--sl-surface-alt)",
                  color:
                    row.status === "published" ? "var(--sl-up)" : "var(--sl-muted)",
                }}
              >
                {row.status}
              </span>
            </Td>
            <Td mono>
              {row.publishedAt
                ? new Date(row.publishedAt).toLocaleDateString("en-US")
                : "—"}
            </Td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function TermsTable({
  items,
}: {
  readonly items: readonly Awaited<ReturnType<typeof fetchAdminTermsList>>[number][];
}) {
  return (
    <DataTable headers={["Term", "Category", "Definition preview"]}>
      {items.length === 0 ? (
        <EmptyRow label="No glossary terms yet." />
      ) : (
        items.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
            <Td mono>{row.term}</Td>
            <Td>
              <span className="sl-tag">{row.category}</span>
            </Td>
            <Td>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--sl-ink-sub)",
                  lineHeight: 1.5,
                }}
              >
                {row.definitionPreview}
              </span>
            </Td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function NewsTable({
  items,
}: {
  readonly items: readonly Awaited<ReturnType<typeof fetchAdminNewsList>>[number][];
}) {
  return (
    <DataTable headers={["Title", "Source", "Tickers", "Sentiment", "Published"]}>
      {items.length === 0 ? (
        <EmptyRow label="No news ingested yet." />
      ) : (
        items.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
            <Td>
              <span style={{ fontSize: 13 }}>{row.title}</span>
            </Td>
            <Td>
              <span className="sl-tag">{row.src}</span>
            </Td>
            <Td mono>{row.tickers.join(", ") || "—"}</Td>
            <Td mono>
              {row.sentiment !== null ? row.sentiment.toFixed(2) : "—"}
            </Td>
            <Td mono>{new Date(row.publishedAt).toLocaleDateString("en-US")}</Td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function ApiUsageTable({
  items,
}: {
  readonly items: readonly Awaited<ReturnType<typeof fetchAdminApiUsage>>[number][];
}) {
  return (
    <DataTable headers={["Provider", "Day", "Used", "Limit", "Utilization"]}>
      {items.length === 0 ? (
        <EmptyRow label="No quota usage recorded yet." />
      ) : (
        items.map((row) => (
          <tr
            key={`${row.provider}-${row.day}`}
            style={{ borderBottom: "1px solid var(--sl-hairline)" }}
          >
            <Td>{row.provider}</Td>
            <Td mono>{row.day}</Td>
            <Td mono>{row.used.toLocaleString("en-US")}</Td>
            <Td mono>{row.limit.toLocaleString("en-US")}</Td>
            <Td>
              <UtilizationBar pct={row.utilizationPct} />
            </Td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function UtilizationBar({ pct }: { readonly pct: number }) {
  const tone = pct >= 90 ? "var(--sl-down)" : pct >= 60 ? "var(--sl-warn, #d97706)" : "var(--sl-up)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-2)" }}>
      <div
        style={{
          width: 80,
          height: 6,
          borderRadius: 4,
          background: "var(--sl-surface-alt)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: "100%",
            background: tone,
          }}
        />
      </div>
      <span
        className="sl-mono"
        style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}
      >
        {pct}%
      </span>
    </div>
  );
}

function SecuritiesMasterPanel({
  summary,
}: {
  readonly summary: Awaited<ReturnType<typeof fetchAdminSecuritiesMaster>>;
}) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--sl-space-4)",
        }}
      >
        <div className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
          <span className="sl-label">Total symbols</span>
          <span
            className="sl-mono"
            style={{
              fontSize: 28,
              fontWeight: 700,
              display: "block",
              marginTop: "var(--sl-space-2)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {summary.totalCount.toLocaleString("en-US")}
          </span>
          <span className="sl-caption" style={{ color: "var(--sl-muted)" }}>
            Loaded from `securities_master`. Live capacity capped at 5,000 for
            this view; full catalog lives in the database.
          </span>
        </div>
        <div className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
          <span className="sl-label">By country</span>
          <ul
            className="sl-mono"
            style={{
              listStyle: "none",
              padding: 0,
              margin: "var(--sl-space-3) 0 0",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sl-space-1)",
            }}
          >
            {summary.byCountry.length === 0 ? (
              <li style={{ color: "var(--sl-muted)" }}>—</li>
            ) : (
              summary.byCountry.map((row) => (
                <li
                  key={row.country}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{row.country}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {row.count.toLocaleString("en-US")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="sl-card" style={{ padding: "var(--sl-space-5)" }}>
          <span className="sl-label">By source</span>
          <ul
            className="sl-mono"
            style={{
              listStyle: "none",
              padding: 0,
              margin: "var(--sl-space-3) 0 0",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sl-space-1)",
            }}
          >
            {summary.bySource.length === 0 ? (
              <li style={{ color: "var(--sl-muted)" }}>—</li>
            ) : (
              summary.bySource.map((row) => (
                <li
                  key={row.source}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{row.source}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {row.count.toLocaleString("en-US")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <DataTable headers={["Symbol", "Name", "Country", "Exchange", "Asset class", "Source", "Revision"]}>
        {summary.sample.length === 0 ? (
          <EmptyRow label="No securities seeded yet — run pnpm seed:financedatabase." />
        ) : (
          summary.sample.map((row) => (
            <tr
              key={row.symbol}
              style={{ borderBottom: "1px solid var(--sl-hairline)" }}
            >
              <Td mono>{row.symbol}</Td>
              <Td>{row.name}</Td>
              <Td mono>{row.country}</Td>
              <Td mono>{row.exchange ?? "—"}</Td>
              <Td>{row.assetClass}</Td>
              <Td>{row.source}</Td>
              <Td mono>
                {row.sourceRevision
                  ? row.sourceRevision.slice(0, 10)
                  : "—"}
              </Td>
            </tr>
          ))
        )}
      </DataTable>
    </>
  );
}

function CronLogsTable({
  items,
}: {
  readonly items: readonly Awaited<ReturnType<typeof fetchAdminCronLogs>>[number][];
}) {
  return (
    <DataTable headers={["Job", "Status", "Started", "Duration", "Error"]}>
      {items.length === 0 ? (
        <EmptyRow label="No cron executions yet." />
      ) : (
        items.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid var(--sl-hairline)" }}>
            <Td mono>{row.job}</Td>
            <Td>
              <span
                className="sl-tag"
                style={{
                  background:
                    row.status === "ok"
                      ? "var(--sl-up-soft, #d4edda)"
                      : row.status === "failed"
                        ? "var(--sl-down-soft, #f8d7da)"
                        : "var(--sl-surface-alt)",
                  color:
                    row.status === "ok"
                      ? "var(--sl-up)"
                      : row.status === "failed"
                        ? "var(--sl-down)"
                        : "var(--sl-muted)",
                  textTransform: "capitalize",
                }}
              >
                {row.status}
              </span>
            </Td>
            <Td mono>
              {new Date(row.startedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Td>
            <Td mono>
              {row.durationSeconds !== null ? `${row.durationSeconds}s` : "—"}
            </Td>
            <Td>
              {row.err ? (
                <span
                  style={{
                    color: "var(--sl-down)",
                    fontSize: 11,
                    fontFamily: "var(--sl-font-mono)",
                  }}
                >
                  {row.err.slice(0, 80)}
                </span>
              ) : (
                <span style={{ color: "var(--sl-muted)" }}>—</span>
              )}
            </Td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function DataTable({
  headers,
  children,
}: {
  readonly headers: readonly string[];
  readonly children: React.ReactNode;
}) {
  return (
    <section className="sl-card" style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--sl-surface-alt)" }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "var(--sl-space-3) var(--sl-space-3)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--sl-muted)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </section>
  );
}

function Td({
  children,
  mono = false,
}: {
  readonly children: React.ReactNode;
  readonly mono?: boolean;
}) {
  return (
    <td
      style={{
        padding: "var(--sl-space-3) var(--sl-space-3)",
        verticalAlign: "top",
        fontFamily: mono ? "var(--sl-font-mono)" : "inherit",
        fontSize: mono ? 12 : 13,
        color: "var(--sl-ink-sub)",
      }}
    >
      {children}
    </td>
  );
}
