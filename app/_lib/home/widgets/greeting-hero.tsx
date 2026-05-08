/**
 * Greeting hero widget — user greeting, date, last-updated badge.
 *
 * Server-rendered. Shows time-appropriate greeting and session info.
 */

export interface GreetingHeroProps {
  readonly userName?: string;
  readonly lastUpdated: string | null;
}

/** Returns a time-appropriate greeting string. */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Formats the current date as a locale-aware string. */
function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function GreetingHero({ userName, lastUpdated }: GreetingHeroProps) {
  const greeting = getGreeting();
  const dateStr = formatDate();

  return (
    <section
      aria-label="Greeting"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-4)",
        padding: "var(--sl-space-7) var(--sl-space-6)",
        background:
          "linear-gradient(135deg, var(--sl-surface) 0%, var(--sl-surface-alt) 100%)",
        borderRadius: "var(--sl-radius-xl)",
        border: "1px solid var(--sl-line)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative accent */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--sl-brand-soft) 0%, transparent 70%)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sl-space-4)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--sl-brand), var(--sl-cat2))",
            color: "var(--sl-surface)",
            fontSize: 20,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {userName ? userName.charAt(0).toUpperCase() : "S"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="sl-h1" style={{ margin: 0 }}>
            {greeting}
            {userName ? `, ${userName}` : ""}
          </h1>
          <p
            className="sl-body-sm"
            style={{ marginTop: "var(--sl-space-1)", color: "var(--sl-muted)" }}
          >
            {dateStr}
          </p>
        </div>

        {/* Last-updated badge */}
        {lastUpdated && (
          <span
            className="sl-tag"
            style={{
              flexShrink: 0,
              fontSize: 11,
              opacity: 0.85,
            }}
          >
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ marginRight: 3 }}
            >
              <title>Updated</title>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Updated{" "}
            <time dateTime={lastUpdated}>
              {formatRelativeTime(lastUpdated)}
            </time>
          </span>
        )}
      </div>
    </section>
  );
}

/** Simple relative-time formatter for the updated badge. */
function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
