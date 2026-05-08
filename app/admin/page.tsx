import Link from "next/link";

import { AdminShell } from "@/app/_lib/admin/admin-shell";
import { fetchAdminDashboard } from "@/app/_lib/admin/admin-data";
import { requireAdminSession } from "@/app/_lib/admin/role-guard";

export const metadata = {
  title: "STOCKLAB Admin — Dashboard",
  description: "Admin dashboard with KPI cards and recent cron activity.",
};

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const data = await fetchAdminDashboard();

  return (
    <AdminShell
      adminEmail={session.sub}
      sections={data.sections}
      activeSectionId="dashboard"
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="sl-h1">Dashboard</h1>
          <p
            className="sl-body-sm"
            style={{ color: "var(--sl-muted)", marginTop: "var(--sl-space-1)" }}
          >
            Operational health for cron, API quotas, and content surfaces.
          </p>
        </div>
      </header>

      <section
        aria-label="Admin KPIs"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--sl-space-4)",
        }}
      >
        {data.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="sl-card"
            style={{
              padding: "var(--sl-space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sl-space-2)",
            }}
          >
            <span className="sl-label">{kpi.label}</span>
            <span
              className="sl-mono"
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--sl-ink)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {kpi.value.toLocaleString("en-US")}
            </span>
            <span className="sl-caption" style={{ color: "var(--sl-muted)" }}>
              {kpi.hint}
            </span>
          </div>
        ))}
      </section>

      <section
        aria-label="Recent activity"
        className="sl-card"
        style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--sl-space-4)",
          }}
        >
          <span className="sl-label">Recent cron activity</span>
          <Link
            href="/admin/cron"
            className="sl-text-muted"
            style={{ fontSize: 12, textDecoration: "none" }}
          >
            View all →
          </Link>
        </header>

        {data.recentEvents.length === 0 ? (
          <p
            className="sl-body-sm"
            style={{ color: "var(--sl-muted)", padding: "var(--sl-space-4) 0" }}
          >
            No cron activity recorded yet.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sl-line)" }}>
                <Th>Job</Th>
                <Th>Status</Th>
                <Th>Started</Th>
                <Th>Finished</Th>
                <Th>Error</Th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.map((event) => (
                <tr
                  key={event.id}
                  style={{ borderBottom: "1px solid var(--sl-hairline)" }}
                >
                  <Td mono>{event.job}</Td>
                  <Td>
                    <StatusPill status={event.status} />
                  </Td>
                  <Td>
                    <Timestamp iso={event.startedAt} />
                  </Td>
                  <Td>
                    {event.finishedAt ? (
                      <Timestamp iso={event.finishedAt} />
                    ) : (
                      <span style={{ color: "var(--sl-muted)" }}>—</span>
                    )}
                  </Td>
                  <Td>
                    {event.err ? (
                      <span
                        style={{
                          color: "var(--sl-down)",
                          fontFamily: "var(--sl-font-mono)",
                          fontSize: 11,
                        }}
                      >
                        {event.err.slice(0, 80)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--sl-muted)" }}>—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="sl-caption" style={{ color: "var(--sl-faint)" }}>
        Admin actions (master CRUD, 13F upload, news curation, user role
        changes) are gated until production OAuth-backed Supabase sessions
        replace temporary auth.
      </p>
    </AdminShell>
  );
}

function Th({ children }: { readonly children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "var(--sl-space-2) var(--sl-space-2)",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--sl-muted)",
      }}
    >
      {children}
    </th>
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
        padding: "var(--sl-space-2) var(--sl-space-2)",
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

function StatusPill({ status }: { readonly status: string }) {
  const tone =
    status === "ok"
      ? { bg: "var(--sl-up-soft, #d4edda)", fg: "var(--sl-up)" }
      : status === "failed"
        ? { bg: "var(--sl-down-soft, #f8d7da)", fg: "var(--sl-down)" }
        : { bg: "var(--sl-surface-alt)", fg: "var(--sl-muted)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 8px",
        borderRadius: "var(--sl-radius-pill)",
        fontSize: 11,
        fontWeight: 600,
        background: tone.bg,
        color: tone.fg,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function Timestamp({ iso }: { readonly iso: string }) {
  const date = new Date(iso);
  const formatted = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <span
      className="sl-mono"
      style={{ fontSize: 12, color: "var(--sl-ink-sub)" }}
    >
      {formatted}
    </span>
  );
}
