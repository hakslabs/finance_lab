/**
 * My Page data helper — server-only, reads user-scoped tables via RLS.
 *
 * Under temporary auth, RLS user-table reads return empty because there is no
 * real auth.uid(). The helpers surface this honestly as auth-required states.
 */

import "server-only";

import type { Database, Json } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type WatchlistRow = Database["public"]["Tables"]["watchlists"]["Row"];
type FollowRow = Database["public"]["Tables"]["follows"]["Row"];
type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];
type SavedScreenRow = Database["public"]["Tables"]["saved_screens"]["Row"];
type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
type PreferencesRow = Database["public"]["Tables"]["user_preferences"]["Row"];

export interface KpiCard {
  readonly label: string;
  readonly value: number;
  readonly href: string;
  readonly icon: string;
}

export interface SidebarNavItem {
  readonly label: string;
  readonly href: string;
  readonly count?: number;
}

export interface ActivityItem {
  readonly id: string;
  readonly type: "bookmark" | "note" | "saved_screen" | "follow";
  readonly title: string;
  readonly createdAt: string;
  readonly href: string;
}

export interface MyPageData {
  readonly status: "ready" | "auth-required";
  readonly kpis: readonly KpiCard[];
  readonly sidebarNav: readonly SidebarNavItem[];
  readonly recentActivity: readonly ActivityItem[];
  readonly preferences: PreferencesSnapshot | null;
  readonly authRequired: boolean;
}

export interface PreferencesSnapshot {
  readonly currency: string;
  readonly language: string;
  readonly theme: string;
  readonly notifJson: Json;
  readonly updatedAt: string;
}

const SIDEBAR_NAV: readonly SidebarNavItem[] = [
  { label: "Watchlists", href: "/me/watchlists" },
  { label: "Follows", href: "/me/follows" },
  { label: "Bookmarks", href: "/me/bookmarks" },
  { label: "Saved Screens", href: "/me/saved-screens" },
  { label: "Notes / Journal", href: "/me/notes" },
  { label: "Activity Log", href: "/me/activity" },
  { label: "Settings", href: "/me/settings" },
];

function emptyMyPageData(): MyPageData {
  return {
    status: "auth-required",
    kpis: defaultKpis(0, 0, 0, 0),
    sidebarNav: SIDEBAR_NAV,
    recentActivity: [],
    preferences: null,
    authRequired: true,
  };
}

function defaultKpis(
  watchlistCount: number,
  followsCount: number,
  bookmarksCount: number,
  savedScreensCount: number,
): readonly KpiCard[] {
  return [
    { label: "Watchlists", value: watchlistCount, href: "/me/watchlists", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Follows", value: followsCount, href: "/me/follows", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    { label: "Bookmarks", value: bookmarksCount, href: "/me/bookmarks", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
    { label: "Saved Screens", value: savedScreensCount, href: "/me/saved-screens", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];
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

function buildRecentActivity(
  bookmarks: readonly BookmarkRow[],
  notes: readonly NoteRow[],
  savedScreens: readonly SavedScreenRow[],
  follows: readonly FollowRow[],
): readonly ActivityItem[] {
  const items: ActivityItem[] = [
    ...bookmarks.map((b) => ({
      id: b.id,
      type: "bookmark" as const,
      title: `Bookmarked ${b.type}`,
      createdAt: b.created_at,
      href: "/me/bookmarks",
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: "note" as const,
      title: `Note on ${n.symbol_or_ref}`,
      createdAt: n.created_at,
      href: "/me/notes",
    })),
    ...savedScreens.map((s) => ({
      id: s.id,
      type: "saved_screen" as const,
      title: s.name,
      createdAt: s.created_at,
      href: "/me/saved-screens",
    })),
    ...follows.map((f) => ({
      id: f.master_id,
      type: "follow" as const,
      title: `Following master`,
      createdAt: f.created_at,
      href: "/me/follows",
    })),
  ];

  return items
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
}

export function buildMyPageData(
  watchlists: readonly WatchlistRow[],
  follows: readonly FollowRow[],
  bookmarks: readonly BookmarkRow[],
  savedScreens: readonly SavedScreenRow[],
  notes: readonly NoteRow[],
  preferences: PreferencesRow | null,
): MyPageData {
  const hasAnyData =
    watchlists.length > 0 ||
    follows.length > 0 ||
    bookmarks.length > 0 ||
    savedScreens.length > 0 ||
    notes.length > 0 ||
    preferences !== null;

  if (!hasAnyData) {
    return emptyMyPageData();
  }

  return {
    status: "ready",
    kpis: defaultKpis(watchlists.length, follows.length, bookmarks.length, savedScreens.length),
    sidebarNav: SIDEBAR_NAV,
    recentActivity: buildRecentActivity(bookmarks, notes, savedScreens, follows),
    preferences: preferences ? mapPreferences(preferences) : null,
    authRequired: false,
  };
}

export async function fetchMyPageData(): Promise<MyPageData> {
  const supabase = createRlsSupabaseClient();

  const [watchlistsResult, followsResult, bookmarksResult, screensResult, notesResult, prefsResult] =
    await Promise.all([
      supabase.from("watchlists").select("id,user_id,name,symbols,created_at").limit(100),
      supabase.from("follows").select("user_id,master_id,created_at").limit(200),
      supabase.from("bookmarks").select("id,user_id,type,ref_id,created_at").limit(200),
      supabase.from("saved_screens").select("id,user_id,name,filters_json,created_at").limit(100),
      supabase.from("notes").select("id,user_id,symbol_or_ref,md,created_at").limit(200),
      supabase.from("user_preferences").select("user_id,currency,language,theme,notif_json,updated_at").limit(1),
    ]);

  return buildMyPageData(
    watchlistsResult.data ?? [],
    followsResult.data ?? [],
    bookmarksResult.data ?? [],
    screensResult.data ?? [],
    notesResult.data ?? [],
    prefsResult.data?.[0] ?? null,
  );
}
