import Link from "next/link";
import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import { fetchLearnData, LEARN_CATEGORIES, type LearnCategory } from "@/app/_lib/learn/learn-data";

export const metadata = {
  title: "STOCKLAB — Learn",
  description:
    "Investment guides, tutorials, and glossary for every level of investor.",
};

/**
 * Learn hub page — server-rendered guide cards, category filtering, and terms preview.
 *
 * Category filter uses URL searchParams (?category=Fundamentals).
 * Bookmark toggles are disabled under temporary auth.
 */
export default async function LearnPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const rawCategory = typeof params.category === "string" ? params.category : null;
  const activeCategory: LearnCategory | null = LEARN_CATEGORIES.includes(rawCategory as LearnCategory)
    ? (rawCategory as LearnCategory)
    : null;

  const data = await fetchLearnData(activeCategory);

  return (
    <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
      <GlobalHeader userName={session?.role ?? undefined} />

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "var(--sl-space-5) var(--sl-space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sl-space-6)",
        }}
      >
        {/* Hero */}
        <LearnHero />

        {/* Category chip bar */}
        <CategoryChipBar
          categories={data.categories}
          activeCategory={activeCategory}
        />

        {/* Guide Cards Grid */}
        <GuideCardsGrid guides={data.filteredGuides} status={data.status} />

        {/* Terms Preview */}
        <TermsPreview terms={data.terms.slice(0, 8)} />

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
            STOCKLAB M6 &middot; Learn
          </span>
        </footer>
      </main>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────

function LearnHero() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "var(--sl-space-7) var(--sl-space-4)",
        borderRadius: "var(--sl-radius-xl)",
        background:
          "linear-gradient(135deg, var(--sl-brand-soft) 0%, var(--sl-surface) 60%, var(--sl-cat2) / 8% 100%)",
        border: "1px solid var(--sl-line)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--sl-brand), var(--sl-cat3))",
          color: "#fff",
          fontSize: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--sl-space-4)",
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <title>Book icon</title>
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      </div>

      <h1 className="sl-h1" style={{ marginBottom: "var(--sl-space-2)" }}>
        Learn
      </h1>
      <p
        className="sl-body-sm"
        style={{ color: "var(--sl-ink-sub)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}
      >
        From fundamentals to technical analysis — master the concepts that move markets.
        Guides written for every level of investor.
      </p>
    </section>
  );
}

// ── Category Chip Bar ─────────────────────────────────────────────────

function CategoryChipBar({
  categories,
  activeCategory,
}: {
  categories: readonly string[];
  activeCategory: string | null;
}) {
  return (
    <nav aria-label="Learn category filter" style={{ display: "flex", flexWrap: "wrap", gap: "var(--sl-space-2)" }}>
      <Link
        href="/learn"
        role="button"
        data-active={!activeCategory ? "true" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "var(--sl-space-2) var(--sl-space-3)",
          borderRadius: "var(--sl-radius-pill)",
          fontSize: 12,
          fontWeight: !activeCategory ? 600 : 500,
          color: !activeCategory ? "var(--sl-surface)" : "var(--sl-ink-sub)",
          background: !activeCategory ? "var(--sl-ink)" : "var(--sl-surface-alt)",
          border: "1px solid",
          borderColor: !activeCategory ? "var(--sl-ink)" : "var(--sl-line)",
          textDecoration: "none",
          transition: "all var(--sl-motion-fast)",
        }}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/learn?category=${encodeURIComponent(cat)}`}
          role="button"
          data-active={activeCategory === cat ? "true" : undefined}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "var(--sl-space-2) var(--sl-space-3)",
            borderRadius: "var(--sl-radius-pill)",
            fontSize: 12,
            fontWeight: activeCategory === cat ? 600 : 500,
            color: activeCategory === cat ? "var(--sl-surface)" : "var(--sl-ink-sub)",
            background: activeCategory === cat ? "var(--sl-ink)" : "var(--sl-surface-alt)",
            border: "1px solid",
            borderColor: activeCategory === cat ? "var(--sl-ink)" : "var(--sl-line)",
            textDecoration: "none",
            transition: "all var(--sl-motion-fast)",
          }}
        >
          {cat}
        </Link>
      ))}
    </nav>
  );
}

// ── Guide Cards Grid ───────────────────────────────────────────────────

function GuideCardsGrid({
  guides,
  status,
}: {
  guides: readonly { readonly id: string; readonly title: string; readonly category: string; readonly estimatedReadMin: number; readonly publishedAt: string | null }[];
  status: string;
}) {
  if (status === "empty") {
    return (
      <section
        className="sl-card sl-center"
        style={{ flexDirection: "column", gap: "var(--sl-space-3)", padding: "var(--sl-space-8) var(--sl-space-6)" }}
      >
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <title>Coming soon</title>
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--sl-ink)", marginBottom: "var(--sl-space-1)" }}>
            Coming Soon
          </div>
          <p className="sl-body-sm" style={{ color: "var(--sl-muted)" }}>
            No guides have been published yet. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  if (guides.length === 0 && status !== "empty") {
    return (
      <section
        className="sl-card sl-center"
        style={{ flexDirection: "column", gap: "var(--sl-space-3)", padding: "var(--sl-space-6) var(--sl-space-5)" }}
      >
        <p className="sl-body-sm" style={{ color: "var(--sl-muted)" }}>
          No guides in this category yet.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="sl-label" style={{ marginBottom: "var(--sl-space-4)" }}>
        Guides ({guides.length})
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--sl-space-4)",
        }}
      >
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/learn/${guide.id}`}
            className="sl-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sl-space-3)",
              padding: "var(--sl-space-5)",
              textDecoration: "none",
              color: "inherit",
              transition: "transform var(--sl-motion-fast), box-shadow var(--sl-motion-fast)",
            }}
          >
            {/* Category + Read time row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="sl-tag sl-tag-brand">{guide.category}</span>
              <span className="sl-caption">{guide.estimatedReadMin} min read</span>
            </div>

            {/* Title */}
            <h3 className="sl-h3" style={{ lineHeight: 1.35 }}>
              {guide.title}
            </h3>

            {/* Footer: bookmark stub (disabled) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "auto",
                paddingTop: "var(--sl-space-2)",
                borderTop: "1px solid var(--sl-hairline)",
              }}
            >
              {guide.publishedAt && (
                <span className="sl-caption">
                  {new Date(guide.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              )}
              {!guide.publishedAt && <span />}

              <button
                type="button"
                disabled
                title="Bookmark requires real OAuth authentication"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--sl-faint)",
                  background: "transparent",
                  border: "none",
                  cursor: "not-allowed",
                  opacity: 0.6,
                  padding: "4px 8px",
                  borderRadius: "var(--sl-radius-sm)",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Terms Preview ─────────────────────────────────────────────────────

function TermsPreview({ terms }: { terms: readonly { readonly id: string; readonly term: string; readonly definition: string; readonly category: string }[] }) {
  if (terms.length === 0) {
    return null;
  }

  return (
    <section className="sl-card" style={{ padding: "var(--sl-space-5) var(--sl-space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sl-space-4)" }}>
        <div className="sl-label">Terms Preview</div>
        <Link href="/learn?category=Terms" className="sl-text-muted" style={{ fontSize: 12, textDecoration: "none" }}>
          View all &rarr;
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sl-space-2)" }}>
        {terms.map((term) => (
          <details key={term.id} style={{ borderRadius: "var(--sl-radius-sm)", border: "1px solid var(--sl-hairline)" }}>
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--sl-space-3)",
                padding: "var(--sl-space-3) var(--sl-space-4)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                listStyle: "none",
                userSelect: "none",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-2)" }}>
                <span className="sl-mono" style={{ color: "var(--sl-brand)", fontSize: 12 }}>{term.term}</span>
                <span className="sl-tag">{term.category}</span>
              </span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p
              className="sl-body-sm"
              style={{ padding: "0 var(--sl-space-4) var(--sl-space-3)", color: "var(--sl-ink-sub)", lineHeight: 1.65 }}
            >
              {term.definition}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
