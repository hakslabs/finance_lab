/**
 * Tab navigation bar — renders exactly 8 tabs with active state.
 *
 * Server-rendered. Tab switching uses query params so the active panel is
 * selected during the server render.
 */

import Link from "next/link";

import type { StockDetailTabId } from "@/app/_lib/stock/stock-detail-data";
import { TAB_LABELS } from "@/app/_lib/stock/stock-detail-data";

export interface TabNavProps {
  readonly activeTab: StockDetailTabId;
  readonly ticker: string;
}

export function TabNav({ activeTab, ticker }: TabNavProps) {
  return (
    <nav
      aria-label="Stock detail tabs"
      style={{
        display: "flex",
        gap: "var(--sl-space-1)",
        borderBottom: "1px solid var(--sl-line)",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        paddingBottom: "1px",
      }}
    >
      {(Object.keys(TAB_LABELS) as StockDetailTabId[]).map((tabId) => {
        const isActive = tabId === activeTab;

        return (
          <Link
            key={tabId}
            href={`/stock/${ticker}${tabId === "overview" ? "" : `?tab=${tabId}`}`}
            role="tab"
            aria-selected={isActive}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "var(--sl-space-3) var(--sl-space-4)",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--sl-ink)" : "var(--sl-muted)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              borderBottom: isActive ? "2px solid var(--sl-brand)" : "2px solid transparent",
              marginBottom: "-1px",
              transition:
                "color var(--sl-motion-fast), border-color var(--sl-motion-fast)",
            }}
          >
            {TAB_LABELS[tabId]}
          </Link>
        );
      })}
    </nav>
  );
}
