/**
 * Mobile bottom tab bar — five primary surfaces.
 *
 * Visible only on viewports ≤ 640px (CSS handled inline with `@media`).
 * Server-rendered; selection is reflected via `activeHref` so the parent
 * route owns the state.
 */

import React from "react";

import Link from "next/link";

void React;

const TABS: readonly { readonly href: string; readonly label: string; readonly icon: React.ReactNode }[] = [
  { href: "/", label: "Home", icon: <HomeIcon /> },
  { href: "/analysis", label: "Analysis", icon: <AnalysisIcon /> },
  { href: "/screener", label: "Search", icon: <SearchIcon /> },
  { href: "/portfolio", label: "Portfolio", icon: <PortfolioIcon /> },
  { href: "/me", label: "More", icon: <MoreIcon /> },
];

export function MobileBottomTabBar({
  activeHref,
}: {
  readonly activeHref: string;
}) {
  return (
    <nav
      aria-label="Mobile primary navigation"
      data-testid="mobile-bottom-tab-bar"
      className="sl-mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        background: "var(--sl-surface)",
        borderTop: "1px solid var(--sl-line)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        zIndex: 50,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeHref === tab.href || (tab.href !== "/" && activeHref.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={isActive ? "true" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "8px 4px 10px",
              fontSize: 10,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "var(--sl-brand)" : "var(--sl-muted)",
            }}
          >
            <span style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-5h-2v5a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  );
}

function AnalysisIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="20" x2="21" y2="20" />
      <polyline points="5 16 9 12 13 14 19 8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h18l-2 13H5z" />
      <path d="M9 7V5a3 3 0 016 0v2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}
