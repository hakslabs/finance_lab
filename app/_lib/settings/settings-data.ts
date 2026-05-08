/**
 * Settings data helper — server-only, reads user_preferences and alerts via RLS.
 *
 * Under temporary auth, all settings are read-only preview mode.
 * Notification toggles render but do not persist until real OAuth sessions.
 */

import "server-only";

import type { Database, Json } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type PreferencesRow = Database["public"]["Tables"]["user_preferences"]["Row"];
type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];

export interface AlertRule {
  readonly id: string;
  readonly ruleJson: Json;
  readonly channel: string;
  readonly enabled: boolean;
  readonly createdAt: string;
}

export interface NotificationToggle {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly channelPickerDisabled: boolean;
  readonly channelPickerReason: string;
}

export interface SettingsSection {
  readonly id: string;
  readonly label: string;
  readonly disabled: boolean;
  readonly disabledReason: string;
}

export interface SettingsData {
  readonly status: "ready" | "auth-required";
  readonly preferences: PreferencesSnapshot | null;
  readonly alerts: readonly AlertRule[];
  readonly notificationToggles: readonly NotificationToggle[];
  readonly sections: readonly SettingsSection[];
  readonly authRequired: boolean;
}

export interface PreferencesSnapshot {
  readonly currency: string;
  readonly language: string;
  readonly theme: string;
  readonly notifJson: Json;
  readonly updatedAt: string;
}

export const NOTIFICATION_TOGGLE_DEFS: readonly {
  readonly key: string;
  readonly label: string;
  readonly description: string;
}[] = [
  { key: "price_target", label: "Price Target Alerts", description: "When a stock hits your target price" },
  { key: "technical_signal", label: "Technical Signal Alerts", description: "When a technical indicator triggers" },
  { key: "f13f_change", label: "13F Filing Changes", description: "When a followed master updates holdings" },
  { key: "dividend_record", label: "Dividend Record Date", description: "When a held stock reaches ex-dividend date" },
  { key: "filing_alert", label: "SEC Filing Alerts", description: "New filings for watched stocks" },
  { key: "system_notice", label: "System Notices", description: "Platform announcements and maintenance" },
];

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  { id: "profile", label: "Profile", disabled: true, disabledReason: "Requires real Supabase OAuth authentication" },
  { id: "security", label: "Security", disabled: true, disabledReason: "Requires real Supabase OAuth authentication" },
  { id: "market_currency", label: "Market / Currency", disabled: true, disabledReason: "Requires real Supabase OAuth authentication" },
  { id: "language_timezone", label: "Language / Timezone", disabled: true, disabledReason: "Requires real Supabase OAuth authentication" },
  { id: "theme", label: "Theme", disabled: true, disabledReason: "Requires real Supabase OAuth authentication" },
  { id: "notifications", label: "Notifications", disabled: true, disabledReason: "Requires real Supabase OAuth authentication" },
  { id: "data_export", label: "Data Export", disabled: true, disabledReason: "Requires production deployment and real OAuth" },
  { id: "delete_account", label: "Delete Account", disabled: true, disabledReason: "Requires production deployment and real OAuth" },
];

const CHANNEL_PICKER_REASON = "Push vs. email channel selection deferred to TD-006 resolution.";

function emptySettingsData(): SettingsData {
  return {
    status: "auth-required",
    preferences: null,
    alerts: [],
    notificationToggles: buildNotificationToggles(null),
    sections: SETTINGS_SECTIONS,
    authRequired: true,
  };
}

function mapAlert(row: AlertRow): AlertRule {
  return {
    id: row.id,
    ruleJson: row.rule_json,
    channel: row.channel,
    enabled: row.enabled,
    createdAt: row.created_at,
  };
}

function mapPreferences(row: PreferencesRow): PreferencesSnapshot {
  return {
    currency: row.currency,
    language: row.language,
    theme: row.theme,
    notifJson: row.notif_json,
    updatedAt: row.updated_at,
  };
}

function buildNotificationToggles(notifJson: Json | null): readonly NotificationToggle[] {
  const prefs = typeof notifJson === "object" && notifJson !== null ? (notifJson as Record<string, unknown>) : {};

  return NOTIFICATION_TOGGLE_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    description: def.description,
    enabled: Boolean(prefs[def.key]),
    channelPickerDisabled: true,
    channelPickerReason: CHANNEL_PICKER_REASON,
  }));
}

export function buildSettingsData(
  preferences: PreferencesRow | null,
  alertRows: readonly AlertRow[],
): SettingsData {
  if (!preferences && alertRows.length === 0) {
    return emptySettingsData();
  }

  return {
    status: "ready",
    preferences: preferences ? mapPreferences(preferences) : null,
    alerts: alertRows.map(mapAlert),
    notificationToggles: buildNotificationToggles(preferences?.notif_json ?? null),
    sections: SETTINGS_SECTIONS,
    authRequired: !preferences,
  };
}

export async function fetchSettingsData(): Promise<SettingsData> {
  const supabase = createRlsSupabaseClient();

  const [prefsResult, alertsResult] = await Promise.all([
    supabase.from("user_preferences").select("user_id,currency,language,theme,notif_json,updated_at").limit(1),
    supabase.from("alerts").select("id,user_id,rule_json,channel,enabled,created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return buildSettingsData(prefsResult.data?.[0] ?? null, alertsResult.data ?? []);
}
