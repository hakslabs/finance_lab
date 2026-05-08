/**
 * Global header — logo, navigation stubs, theme toggle stub, alerts, command palette.
 *
 * Server-rendered. Theme toggle is a visual stub (client interactivity deferred).
 * Navigation items are static links matching the (auth) route structure.
 */

import Link from "next/link";

export interface GlobalHeaderProps {
  readonly userName?: string;
}

export function GlobalHeader({ userName }: GlobalHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sl-space-4)",
        padding: "var(--sl-space-4) var(--sl-space-5)",
        background: "var(--sl-surface)",
        borderBottom: "1px solid var(--sl-line)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-2)",
          textDecoration: "none",
          color: "inherit",
          flexShrink: 0,
        }}
      >
        <span
          className="sl-mono"
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--sl-radius-sm)",
            background:
              "linear-gradient(135deg, var(--sl-brand), var(--sl-cat3))",
            color: "var(--sl-surface)",
            fontSize: 14,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-0.02em",
          }}
        >
          S
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--sl-ink)",
            display: "block",
          }}
        >
          STOCKLAB
        </span>
      </Link>

      {/* Nav stubs */}
      <nav
        aria-label="Main navigation"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-1)",
          marginLeft: "var(--sl-space-5)",
        }}
      >
        {[
          { href: "/", label: "Home", active: true },
          { href: "/analysis", label: "Analysis" },
          { href: "/screener", label: "Screener" },
          { href: "/masters", label: "Masters" },
          { href: "/portfolio", label: "Portfolio" },
          { href: "/reports", label: "Reports" },
          { href: "/learn", label: "Learn" },
          { href: "/me", label: "My Page" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "var(--sl-space-2) var(--sl-space-3)",
              borderRadius: "var(--sl-radius-sm)",
              fontSize: 13,
              fontWeight: item.active ? 600 : 500,
              color: item.active ? "var(--sl-ink)" : "var(--sl-muted)",
              textDecoration: "none",
              background: item.active ? "var(--sl-surface-alt)" : "transparent",
              transition: "background var(--sl-motion-fast), color var(--sl-motion-fast)",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Spacer pushes controls to the right */}
      <div style={{ flex: 1 }} />

      {/* Right-side controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-2)",
        }}
      >
        {/* Command palette stub */}
        <button
          type="button"
          className="sl-btn sl-btn-ghost"
          style={{
            fontSize: 12,
            padding: "6px 10px",
            gap: "var(--sl-space-2)",
            color: "var(--sl-muted)",
          }}
          title="Command palette (⌘K)"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <title>Search</title>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>⌘K</span>
        </button>

        {/* Alerts bell stub */}
        <button
          type="button"
          className="sl-btn sl-btn-ghost"
          style={{
            padding: 6,
            position: "relative",
            color: "var(--sl-muted)",
          }}
          title="Alerts"
          aria-label="Notifications"
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <title>Bell</title>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {/* Notification dot */}
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--sl-down)",
              border: "2px solid var(--sl-surface)",
            }}
          />
        </button>

        {/* Theme toggle stub */}
        <button
          type="button"
          className="sl-btn sl-btn-ghost"
          style={{ padding: 6, color: "var(--sl-muted)" }}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <title>Theme</title>
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>

        {/* User avatar stub */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--sl-cat2), var(--sl-brand))",
            color: "var(--sl-surface)",
            fontSize: 11,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
          }}
          title={userName ?? "User"}
        >
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
    </header>
  );
}
