/**
 * Admin shell — dark-red top bar plus sidebar navigation.
 *
 * Server-rendered. Distinct accent color (`--sl-down`) keeps the admin
 * surface visually separated from the user-facing surfaces.
 */

import Link from "next/link";

import type { AdminSection, AdminSectionId } from "./admin-data";

export interface AdminShellProps {
  readonly adminEmail: string;
  readonly sections: readonly AdminSection[];
  readonly activeSectionId: AdminSectionId;
  readonly children: React.ReactNode;
}

export function AdminShell({
  adminEmail,
  sections,
  activeSectionId,
  children,
}: AdminShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <AdminTopBar adminEmail={adminEmail} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 0,
          alignItems: "stretch",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        <AdminSidebar sections={sections} activeSectionId={activeSectionId} />
        <main
          style={{
            padding: "var(--sl-space-6) var(--sl-space-7)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sl-space-6)",
            maxWidth: 1200,
          }}
        >
          {children}

          <footer
            style={{
              marginTop: "var(--sl-space-6)",
              paddingTop: "var(--sl-space-5)",
              borderTop: "1px solid var(--sl-line)",
              textAlign: "center",
            }}
          >
            <span className="sl-caption" style={{ color: "var(--sl-faint)" }}>
              STOCKLAB M7 &middot; Admin Console (read-only under temporary auth)
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function AdminTopBar({ adminEmail }: { readonly adminEmail: string }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-4)",
        padding: "var(--sl-space-3) var(--sl-space-5)",
        background: "var(--sl-down)",
        color: "#fff",
        borderBottom: "1px solid color-mix(in srgb, var(--sl-down) 80%, black)",
        height: 56,
      }}
    >
      <Link
        href="/admin"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-2)",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--sl-radius-sm)",
            background: "rgba(255,255,255,0.18)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-0.02em",
          }}
        >
          A
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          STOCKLAB ADMIN
        </span>
      </Link>

      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "var(--sl-radius-pill)",
          background: "rgba(255,255,255,0.18)",
          letterSpacing: "0.04em",
        }}
      >
        TEMPORARY AUTH
      </span>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 12, opacity: 0.85 }}>{adminEmail}</span>

      <Link
        href="/"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "var(--sl-radius-sm)",
          background: "rgba(255,255,255,0.15)",
          textDecoration: "none",
        }}
      >
        ← Back to app
      </Link>
    </header>
  );
}

function AdminSidebar({
  sections,
  activeSectionId,
}: {
  readonly sections: readonly AdminSection[];
  readonly activeSectionId: AdminSectionId;
}) {
  return (
    <nav
      aria-label="Admin sidebar"
      style={{
        background: "var(--sl-surface)",
        borderRight: "1px solid var(--sl-line)",
        padding: "var(--sl-space-4) var(--sl-space-3)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {sections.map((section) => {
        const isActive = section.id === activeSectionId;
        return (
          <Link
            key={section.id}
            href={section.href}
            data-active={isActive ? "true" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--sl-space-2) var(--sl-space-3)",
              borderRadius: "var(--sl-radius-sm)",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--sl-ink)" : "var(--sl-muted)",
              background: isActive ? "var(--sl-surface-alt)" : "transparent",
              textDecoration: "none",
            }}
          >
            <span>{section.label}</span>
            {section.count !== null && (
              <span
                className="sl-caption"
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--sl-faint)",
                }}
              >
                {section.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
