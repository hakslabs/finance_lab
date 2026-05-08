import { describe, expect, it } from "vitest";

describe("markdown sanitizer", () => {
  it("converts markdown and preserves safe formatting", async () => {
    const { markdownToSafeHtml } = await import("@/app/_lib/markdown/sanitize");

    const html = markdownToSafeHtml("# Report\n\n**Strong** view and [source](https://example.com/report.pdf)");

    expect(html).toContain("<h1>Report</h1>");
    expect(html).toContain("<strong>Strong</strong>");
    expect(html).toContain("href=\"https://example.com/report.pdf\"");
    expect(html).toContain("rel=\"noopener noreferrer\"");
  });

  it("strips scripts, event handlers, and javascript URLs", async () => {
    const { markdownToSafeHtml, sanitizeHtml } = await import("@/app/_lib/markdown/sanitize");

    const html = markdownToSafeHtml("[bad](javascript:alert(1)) <img src=x onerror=alert(1)><script>alert(1)</script>");
    const sanitized = sanitizeHtml('<a href="javascript:alert(1)" onclick="alert(1)">bad</a>');

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("javascript:");
  });

  it("removes embedded active content", async () => {
    const { sanitizeHtml } = await import("@/app/_lib/markdown/sanitize");

    expect(sanitizeHtml('<iframe src="https://example.com"></iframe>')).toBe("");
    expect(sanitizeHtml('<object data="https://example.com"></object>')).toBe("");
  });
});
