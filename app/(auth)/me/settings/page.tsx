import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import {
  fetchSettingsData,
  SETTINGS_SECTIONS,
} from "@/app/_lib/settings/settings-data";

export const metadata = {
  title: "STOCKLAB — Settings",
  description:
    "Manage your account preferences, notifications, and personal settings.",
};

/**
 * Settings page — read-only preview under temporary auth.
 *
 * All form fields render but are disabled. Save actions require real OAuth.
 * Notification toggles render; channel picker is disabled (TD-006).
 */
export default async function SettingsPage() {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const data = await fetchSettingsData();

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-5)",
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 12 }}>
          <a href="/me" className="sl-text-muted" style={{ textDecoration: "none" }}>
            &larr; Back to My Page
          </a>
        </nav>

        {/* Page header */}
        <header>
          <h1 className="sl-h1">Settings</h1>
          <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-2)", color: "var(--sl-ink-sub)" }}>
            {data.status === "auth-required"
              ? "Settings require real Supabase OAuth authentication. The values below are placeholders."
              : "Manage your account preferences and notification settings."}
          </p>
        </header>

        {/* Auth-required banner when no real session */}
        {data.status === "auth-required" && (
          <section
            className="sl-card"
            style={{
              padding: "var(--sl-space-4) var(--sl-space-5)",
              background: "var(--sl-warn-soft)",
              borderColor: "var(--sl-warn)",
              display: "flex",
              alignItems: "center",
              gap: "var(--sl-space-3)",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--sl-warn)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <title>Warning</title>
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sl-ink)" }}>Read-Only Preview Mode</div>
              <p className="sl-body-sm" style={{ color: "var(--sl-ink-sub)", marginTop: 2 }}>
                Sign in with a real Supabase OAuth account to edit and save these settings.
                All forms below are disabled until then.
              </p>
            </div>
          </section>
        )}

        {/* Profile Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[0]}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)" }}>
            <SettingField label="Display Name" value={data.preferences ? "User" : "\u2014"} />
            <SettingField label="Email" value={data.preferences ? "\u2014" : "\u2014"} />
            <SettingField label="Nickname" value="\u2014" />
          </div>
        </SettingsSectionCard>

        {/* Security Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[1]}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)" }}>
            <DisabledSettingRow label="Password Change" reason="Requires email provider authentication" />
            <DisabledSettingRow label="Connected Accounts (Google / Apple / Kakao)" reason="Requires real OAuth session" />
          </div>
        </SettingsSectionCard>

        {/* Market / Currency Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[2]}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)" }}>
            <SettingField label="Default Market" value={data.preferences?.currency === "KRW" ? "KR" : data.preferences?.currency === "USD" ? "US" : "Both"} />
            <SettingField label="Base Currency" value={data.preferences?.currency ?? "USD"} />
          </div>
        </SettingsSectionCard>

        {/* Language / Timezone Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[3]}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-4)" }}>
            <SettingField label="Language" value={data.preferences?.language ?? "en"} />
            <SettingField label="Timezone" value="\u2014" />
          </div>
        </SettingsSectionCard>

        {/* Theme Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[4]}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
            <ThemeOption label="Light" active={data.preferences?.theme === "light"} />
            <ThemeOption label="Dark" active={data.preferences?.theme === "dark"} />
            <ThemeOption label="System" active={data.preferences?.theme === "system" || !data.preferences} />
          </div>
        </SettingsSectionCard>

        {/* Notifications Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[5]}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-3)" }}>
            {data.notificationToggles.map((toggle) => (
              <NotificationToggleRow key={toggle.key} toggle={toggle} />
            ))}
          </div>
        </SettingsSectionCard>

        {/* Data Export Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[6]}>
          <DisabledSettingRow
            label="Request Data Export (ZIP)"
            reason="Requires production deployment and real OAuth"
          />
        </SettingsSectionCard>

        {/* Delete Account Section */}
        <SettingsSectionCard section={SETTINGS_SECTIONS[7]}>
          <button
            type="button"
            disabled
            className="sl-btn"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: "transparent",
              border: "1px solid var(--sl-down)",
              color: "var(--sl-down)",
              opacity: 0.55,
              cursor: "not-allowed",
              fontSize: 12,
            }}
            title="Delete account requires production OAuth and confirmation dialog"
          >
            Delete Account &mdash; Requires Production OAuth
          </button>
        </SettingsSectionCard>

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
            STOCKLAB M6 &middot; Settings
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Shared UI Components ────────────────────────────────────────────────

function SettingsSectionCard({
  section,
  children,
}: {
  section: { readonly id: string; readonly label: string; readonly disabled: boolean; readonly disabledReason: string };
  children: React.ReactNode;
}) {
  return (
    <section
      className="sl-card"
      id={section.id}
      style={{
        padding: "var(--sl-space-5) var(--sl-space-6)",
        opacity: section.disabled ? 0.85 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sl-space-4)" }}>
        <h2 className="sl-h3">{section.label}</h2>
        {section.disabled && (
          <span className="sl-caption sl-tag sl-tag-warn">Preview Only</span>
        )}
      </div>
      {children}
    </section>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--sl-space-4)" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--sl-ink-sub)" }}>{label}</span>
      <span
        className="sl-mono"
        style={{
          fontSize: 13,
          padding: "var(--sl-space-2) var(--sl-space-3)",
          borderRadius: "var(--sl-radius-sm)",
          background: "var(--sl-surface-alt)",
          color: "var(--sl-muted)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DisabledSettingRow({ label, reason }: { label: string; reason: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-sm)",
        background: "var(--sl-surface-alt)",
        border: "1px dashed var(--sl-line)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span className="sl-caption" style={{ fontStyle: "italic", color: "var(--sl-faint)" }}>
        {reason}
      </span>
    </div>
  );
}

function ThemeOption({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--sl-space-3)",
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-sm)",
        background: active ? "var(--sl-brand-soft)" : "var(--sl-surface-alt)",
        border: `1px solid ${active ? "var(--sl-brand)" : "var(--sl-hairline)"}`,
        opacity: 0.75,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${active ? "var(--sl-brand)" : "var(--sl-line-strong)"}`,
          background: active ? "var(--sl-brand)" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {active && (
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <title>Selected</title>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  );
}

function NotificationToggleRow({
  toggle,
}: {
  toggle: { readonly key: string; readonly label: string; readonly description: string; readonly enabled: boolean; readonly channelPickerDisabled: boolean; readonly channelPickerReason: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sl-space-2)",
        padding: "var(--sl-space-3) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-md)",
        background: "var(--sl-surface-alt)",
        border: "1px solid var(--sl-hairline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{toggle.label}</div>
          <p className="sl-caption" style={{ marginTop: 2 }}>{toggle.description}</p>
        </div>
        <div
          role="switch"
          aria-checked={toggle.enabled}
          aria-disabled="true"
          tabIndex={-1}
          style={{
            width: 40,
            height: 22,
            borderRadius: "var(--sl-radius-pill)",
            background: toggle.enabled ? "var(--sl-cat2)" : "var(--sl-line-strong)",
            position: "relative",
            opacity: 0.65,
            cursor: "not-allowed",
            flexShrink: 0,
            transition: "background var(--sl-motion-fast)",
          }}
        >
          <div
            style={{
              width: 17,
              height: 17,
              borderRadius: "50%",
              background: "#fff",
              position: "absolute",
              top: 2.5,
              left: toggle.enabled ? 20.5 : 2.5,
              transition: "left var(--sl-motion-fast)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>
      {toggle.channelPickerDisabled && (
        <span className="sl-caption" style={{ color: "var(--sl-faint)", fontStyle: "italic", paddingLeft: "var(--sl-space-1)" }}>
          Channel picker: {toggle.channelPickerReason}
        </span>
      )}
    </div>
  );
}
