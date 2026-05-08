/**
 * Learn data helper — server-only, reads articles and terms via RLS.
 *
 * Articles are published guides; terms are the glossary dictionary.
 * Bookmark state is always disabled under temporary auth (no real auth.uid()).
 */

import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";
import { createRlsSupabaseClient } from "@/app/_lib/supabase/public";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type TermRow = Database["public"]["Tables"]["terms"]["Row"];

export const LEARN_CATEGORIES = [
  "Fundamentals",
  "Technical",
  "Market Structure",
  "Masters",
  "Terms",
] as const;

export type LearnCategory = (typeof LEARN_CATEGORIES)[number];

export interface GuideCard {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly estimatedReadMin: number;
  readonly publishedAt: string | null;
  readonly bookmarkState: { readonly enabled: false; readonly isBookmarked: false; readonly reason: "auth-required" };
}

export interface TermPreview {
  readonly id: string;
  readonly term: string;
  readonly definition: string;
  readonly category: string;
}

export interface LearnDetail {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly md: string;
  readonly publishedAt: string | null;
  readonly bookmarkState: { readonly enabled: false; readonly isBookmarked: false; readonly reason: "auth-required" };
}

export interface LearnData {
  readonly status: "ready" | "empty";
  readonly guides: readonly GuideCard[];
  readonly filteredGuides: readonly GuideCard[];
  readonly categories: readonly string[];
  readonly terms: readonly TermPreview[];
  readonly detail: LearnDetail | null;
  readonly activeCategory: string | null;
}

const BOOKMARK_DISABLED: { readonly enabled: false; readonly isBookmarked: false; readonly reason: "auth-required" } = { enabled: false, isBookmarked: false, reason: "auth-required" };

function estimateReadMinutes(markdown: string): number {
  const wordCount = markdown.split(/\s+/u).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function mapGuideCard(row: ArticleRow): GuideCard {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    estimatedReadMin: estimateReadMinutes(row.md),
    publishedAt: row.published_at,
    bookmarkState: BOOKMARK_DISABLED,
  };
}

function mapTermPreview(row: TermRow): TermPreview {
  return {
    id: row.id,
    term: row.term,
    definition: row.definition,
    category: row.category,
  };
}

export function filterGuidesByCategory(
  guides: readonly GuideCard[],
  category: string | null,
): readonly GuideCard[] {
  if (!category || category === "All") return guides;
  return guides.filter((guide) => guide.category === category);
}

export function extractCategories(guides: readonly GuideCard[]): readonly string[] {
  return [...new Set(guides.map((guide) => guide.category))].sort();
}

export function buildLearnData(
  articleRows: readonly ArticleRow[],
  termRows: readonly TermRow[],
  activeCategory: string | null = null,
  detailId?: string,
): LearnData {
  const publishedArticles = articleRows
    .filter((row) => row.status === "published")
    .map(mapGuideCard);

  const guides = filterGuidesByCategory(publishedArticles, activeCategory);
  const categories = extractCategories(publishedArticles);
  const terms = termRows.map(mapTermPreview);

  let detail: LearnDetail | null = null;
  if (detailId) {
    const found = articleRows.find((row) => row.id === detailId && row.status === "published");
    if (found) {
      detail = {
        id: found.id,
        title: found.title,
        category: found.category,
        md: found.md,
        publishedAt: found.published_at,
        bookmarkState: BOOKMARK_DISABLED,
      };
    }
  }

  const status = publishedArticles.length === 0 ? "empty" : "ready";

  return {
    status,
    guides: publishedArticles,
    filteredGuides: guides,
    categories,
    terms,
    detail,
    activeCategory,
  };
}

export async function fetchLearnData(
  activeCategory?: string | null,
  detailId?: string,
): Promise<LearnData> {
  const supabase = createRlsSupabaseClient();

  const [articlesResult, termsResult] = await Promise.all([
    supabase
      .from("articles")
      .select("id,category,title,md,published_at,status")
      .order("published_at", { ascending: false })
      .limit(200),
    supabase
      .from("terms")
      .select("id,term,definition,related_tickers,category")
      .order("term", { ascending: true })
      .limit(100),
  ]);

  return buildLearnData(
    articlesResult.data ?? [],
    termsResult.data ?? [],
    activeCategory ?? null,
    detailId,
  );
}
