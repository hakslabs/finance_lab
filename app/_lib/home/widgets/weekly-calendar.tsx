/**
 * Weekly calendar widget — upcoming earnings, dividends, macro events.
 *
 * Server-rendered. Shows events grouped by day for the current week.
 * Falls back to a structured empty state when no calendar data exists.
 */

import type { CalendarEvent } from "../dashboard-data";

export interface WeeklyCalendarProps {
  readonly events: readonly CalendarEvent[];
}

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  earnings: {
    label: "Earnings",
    color: "var(--sl-brand)",
    bg: "var(--sl-brand-soft)",
  },
  dividend: {
    label: "Dividend",
    color: "var(--sl-up)",
    bg: "var(--sl-up-soft)",
  },
  macro: {
    label: "Macro",
    color: "var(--sl-warn)",
    bg: "var(--sl-warn-soft)",
  },
};

/** Generate placeholder events for the current week when DB is empty. */
function generatePlaceholderEvents(): CalendarEvent[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const placeholders: CalendarEvent[] = [];
  const eventTemplates = [
    { title: "Earnings season opens", type: "earnings" as const },
    { title: "FOMC meeting minutes", type: "macro" as const },
    { title: "CPI data release", type: "macro" as const },
    { title: "Ex-dividend date", type: "dividend" as const },
    { title: "Non-farm payrolls", type: "macro" as const },
  ];

  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + mondayOffset + i);

    if (eventTemplates[i]) {
      placeholders.push({
        date: d.toISOString().split("T")[0],
        title: eventTemplates[i].title,
        type: eventTemplates[i].type,
      });
    }
  }

  return placeholders;
}

export function WeeklyCalendar({ events }: WeeklyCalendarProps) {
  const hasRealData = events.length > 0;
  const displayEvents = hasRealData ? events : generatePlaceholderEvents();

  // Group by date
  const grouped = new Map<string, CalendarEvent[]>();
  for (const evt of displayEvents) {
    const list = grouped.get(evt.date) ?? [];
    list.push(evt);
    grouped.set(evt.date, list);
  }

  const sortedDates = Array.from(grouped.keys()).sort();

  return (
    <section
      className="sl-card"
      aria-label="Weekly calendar"
      style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--sl-space-4)",
        }}
      >
        <div className="sl-label">This Week</div>
        {!hasRealData && (
          <span className="sl-tag sl-tag-info" style={{ fontSize: 10 }}>
            Preview
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
        {sortedDates.map((dateStr) => {
          const dayEvents = grouped.get(dateStr);
          if (!dayEvents) return null;

          const dateObj = new Date(`${dateStr}T00:00:00`);
          const dayLabel = dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={dateStr}
              style={{
                display: "flex",
                gap: "var(--sl-space-4)",
                padding: "var(--sl-space-3) 0",
                borderBottom:
                  dateStr !== sortedDates[sortedDates.length - 1]
                    ? "1px solid var(--sl-hairline)"
                    : "none",
                opacity: hasRealData ? 1 : 0.7,
              }}
            >
              {/* Day column */}
              <div
                style={{
                  width: 72,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--sl-ink-sub)",
                  paddingTop: "var(--sl-space-1)",
                }}
              >
                {dayLabel}
              </div>

              {/* Events column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sl-space-1)",
                  flex: 1,
                }}
              >
                  {dayEvents.map((evt) => {
                    const config = EVENT_TYPE_CONFIG[evt.type] ?? EVENT_TYPE_CONFIG.macro;
                    const eventKey = `${dateStr}-${evt.title}-${evt.type}`;

                    return (
                      <div
                        key={eventKey}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--sl-space-2)",
                        padding: "var(--sl-space-1) var(--sl-space-3)",
                        borderRadius: "var(--sl-radius-sm)",
                        background: config.bg,
                      }}
                    >
                      <span
                        className="sl-tag"
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 5px",
                          color: config.color,
                          background: "transparent",
                          border: `1px solid ${config.color}33`,
                        }}
                      >
                        {config.label}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--sl-ink)",
                        }}
                      >
                        {evt.title}
                      </span>
                      {evt.ticker && (
                        <span className="sl-tag sl-tag-brand">
                          {evt.ticker}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
