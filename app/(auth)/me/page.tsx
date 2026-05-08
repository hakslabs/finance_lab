import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import { fetchMyPageData } from "@/app/_lib/my-page/my-page-data";

export const metadata = {
  title: "STOCKLAB — My Page",
  description:
    "Your personal hub: profile, watchlists, follows, bookmarks, and settings.",
};

/**
 * My Page hub — server-rendered with KPI cards, sidebar nav, and recent activity feed.
 *
 * Under temporary auth, surfaces auth-required state honestly.
 */
export default async function MyPage() {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const data = await fetchMyPageData();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-6)",
        }}
      >
        {/* Profile Hero */}
        <ProfileHero status={data.status} />

        {/* Two-column layout: Sidebar + Main content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "var(--sl-space-5)",
            alignItems: "start",
          }}
        >
          {/* Sidebar Navigation */}
          <SidebarNav items={data.sidebarNav} />

          {/* Main Content Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-5)" }}>
            {/* KPI Cards Row */}
            <KpiCards kpis={data.kpis} />

            {/* Recent Activity Feed */}
            <ActivityFeed items={data.recentActivity} status={data.status} />
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
            STOCKLAB M6 &middot; My Page
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Profile Hero ───────────────────────────────────────────────────────

function ProfileHero({ status }: { status: string }) {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-5)",
        padding: "var(--sl-space-5) var(--sl-space-6)",
        borderRadius: "var(--sl-radius-xl)",
        background:
          "linear-gradient(135deg, var(--sl-surface) 0%, var(--sl-brand-soft) 100%)",
        border: "1px solid var(--sl-line)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--sl-cat2), var(--sl-brand))",
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        U
      </div>

      {/* Name + info */}
      <div style={{ flex: 1 }}>
        <h1 className="sl-h2" style={{ marginBottom: "var(--sl-space-1)" }}>
          My Page
        </h1>
        <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)" }}>
          {status === "auth-required"
            ? "Sign in with a real account to see your personal data."
            : "Your personal dashboard across all STOCKLAB surfaces."}
        </p>
      </div>

      {/* Settings link */}
      <a href="/me/settings" className="sl-btn sl-btn-secondary" style={{ fontSize: 12 }}>
        Settings &rarr;
      </a>
    </section>
  );
}

// ── Sidebar Navigation ────────────────────────────────────────────────

function SidebarNav({
  items,
}: {
  items: readonly { readonly label: string; readonly href: string; readonly count?: number }[];
}) {
  return (
    <nav
      aria-label="My Page navigation"
      className="sl-card"
      style={{
        position: "sticky",
        top: 72,
        padding: "var(--sl-space-4) var(--sl-space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-1)",
      }}
    >
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)", paddingLeft: "var(--sl-space-2)" }}>
        Navigation
      </div>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sl-space-2) var(--sl-space-3)",
            borderRadius: "var(--sl-radius-sm)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--sl-ink-sub)",
            textDecoration: "none",
            transition: "background var(--sl-motion-fast), color var(--sl-motion-fast)",
          }}
        >
          <span>{item.label}</span>
          {typeof item.count === "number" && (
            <span
              className="sl-mono sl-caption"
              style={{
                background: "var(--sl-surface-alt)",
                padding: "1px 7px",
                borderRadius: "var(--sl-radius-pill)",
                fontSize: 10,
              }}
            >
              {item.count}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
}

// ── KPI Cards ─────────────────────────────────────────────────────────

function KpiCards({ kpis }: { kpis: readonly { readonly label: string; readonly value: number; readonly href: string; readonly icon: string }[] }) {
  return (
    <section>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>Overview</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--sl-space-3)",
        }}
      >
        {kpis.map((kpi) => (
          <a
            key={kpi.label}
            href={kpi.href}
            className="sl-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sl-space-2)",
              padding: "var(--sl-space-4) var(--sl-space-5)",
              textDecoration: "none",
              color: "inherit",
              transition: "transform var(--sl-motion-fast)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={kpi.icon} />
              </svg>
              <span className="sl-mono" style={{ fontSize: 22, fontWeight: 800, color: "var(--sl-ink)", letterSpacing: "-0.02em" }}>
                {kpi.value}
              </span>
            </div>
            <span className="sl-label">{kpi.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Recent Activity Feed ─────────────────────────────────────────────

function ActivityFeed({
  items,
  status,
}: {
  items: readonly { readonly id: string; readonly type: string; readonly title: string; readonly createdAt: string; readonly href: string }[];
  status: string;
}) {
  if (status === "auth-required") {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>Recent Activity</div>
        <div
          className="sl-center"
          style={{ flexDirection: "column", gap: "var(--sl-space-3)", padding: "var(--sl-space-4) 0" }}
        >
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--sl-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <title>Auth required</title>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <p className="sl-body-sm" style={{ color: "var(--sl-muted)", textAlign: "center", maxWidth: 360 }}>
            Activity requires real Supabase OAuth authentication. Sign in to see your recent bookmarks, notes, follows, and saved screens.
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="sl-card" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
        <div className="sl-label" style={{ marginBottom: "var(--sl-space-3)" }}>Recent Activity</div>
        <div className="sl-center" style={{ flexDirection: "column", gap: "var(--sl-space-2)", padding: "var(--sl-space-4) 0" }}>
          <span className="sl-body-sm" style={{ color: "var(--sl-muted)" }}>No recent activity yet.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="sl-card" style={{ overflow: "hidden" }}>
      <div className="sl-label" style={{ padding: "var(--sl-space-4) var(--sl-space-5)" }}>
        Recent Activity ({items.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item) => (
          <a
            key={`${item.type}-${item.id}`}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--sl-space-3)",
              padding: "var(--sl-space-3) var(--sl-space-5)",
              textDecoration: "none",
              color: "inherit",
              borderTop: "1px solid var(--sl-hairline)",
              transition: "background var(--sl-motion-fast)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-3)" }}>
              <ActivityTypeIcon type={item.type} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</span>
            </div>
            <span className="sl-caption">
              {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function ActivityTypeIcon({ type }: { type: string }) {
  const iconMap: Record<string, string> = {
    bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
    note: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    saved_screen: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    follow: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  };
  const path = iconMap[type] ?? "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--sl-cat2)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
