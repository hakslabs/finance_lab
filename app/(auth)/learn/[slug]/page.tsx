import Link from "next/link";
import { redirect } from "next/navigation";

import { readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";
import { GlobalHeader } from "@/app/_lib/home/global-header";
import { fetchLearnData } from "@/app/_lib/learn/learn-data";
import { SafeMarkdown } from "@/app/_lib/markdown/safe-markdown";

/**
 * Learn guide detail page — renders a single article via DOMPurify-backed SafeMarkdown.
 *
 * Route: /learn/[slug] where slug is the article UUID.
 */
export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await readTemporaryAuthCookie();
  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const data = await fetchLearnData(null, slug);

  if (!data.detail) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--sl-bg)" }}>
        <GlobalHeader userName={session?.role ?? undefined} />
        <main
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "var(--sl-space-7) var(--sl-space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sl-space-5)",
          }}
        >
          <nav aria-label="Breadcrumb" style={{ fontSize: 12 }}>
            <Link href="/learn" className="sl-text-muted" style={{ textDecoration: "none" }}>
              &larr; Back to Learn
            </Link>
          </nav>

          <section
            className="sl-card sl-center"
            style={{ flexDirection: "column", gap: "var(--sl-space-3)", padding: "var(--sl-space-8) var(--sl-space-6)" }}
          >
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <title>Not found</title>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <h1 className="sl-h2" style={{ marginBottom: "var(--sl-space-2)" }}>Guide Not Found</h1>
              <p className="sl-body-sm" style={{ color: "var(--sl-muted)" }}>
                This guide does not exist or has not been published yet.
              </p>
            </div>
            <Link href="/learn" className="sl-btn sl-btn-secondary">
              Browse All Guides
            </Link>
          </section>

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
              Referential use only. Not investment advice.
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

  const { detail } = data;

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
          <Link href="/learn" className="sl-text-muted" style={{ textDecoration: "none" }}>
            &larr; Back to Learn
          </Link>
        </nav>

        {/* Article header */}
        <header>
          <span className="sl-tag sl-tag-brand">{detail.category}</span>
          <h1 className="sl-h1" style={{ marginTop: "var(--sl-space-3)", lineHeight: 1.2 }}>
            {detail.title}
          </h1>
          {detail.publishedAt && (
            <span className="sl-caption" style={{ marginTop: "var(--sl-space-2)", display: "block" }}>
              Published {new Date(detail.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
        </header>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--sl-line)" }} />

        {/* Guide content — rendered through DOMPurify-backed SafeMarkdown */}
        <article
          className="sl-card"
          style={{
            padding: "var(--sl-space-6) var(--sl-space-7)",
            lineHeight: 1.75,
            fontSize: 14.5,
            color: "var(--sl-ink-sub)",
          }}
        >
          <SafeMarkdown markdown={detail.md} as="article" />
        </article>

        {/* Disabled bookmark action */}
        <section
          className="sl-card"
          style={{
            padding: "var(--sl-space-4) var(--sl-space-5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: "var(--sl-line-strong)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sl-space-3)" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--sl-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Save this guide</span>
          </div>
          <button
            type="button"
            disabled
            title="Bookmark requires real OAuth authentication"
            className="sl-btn sl-btn-secondary"
            style={{ fontSize: 12, opacity: 0.55, cursor: "not-allowed" }}
          >
            OAuth required
          </button>
        </section>

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
            STOCKLAB M6 &middot; Learn Detail
          </span>
        </footer>
      </main>
    </div>
  );
}
