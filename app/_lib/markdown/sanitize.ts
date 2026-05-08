import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  ALLOWED_TAGS: [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "del",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "ins",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "sub",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ],
  ALLOWED_ATTR: ["alt", "class", "data-language", "href", "src", "title"],
};

export function sanitizeHtml(dirty: string): string {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  try {
    return DOMPurify.sanitize(dirty, SANITIZE_CONFIG);
  } finally {
    DOMPurify.removeHook("afterSanitizeAttributes");
  }
}

export function markdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false });
  return sanitizeHtml(typeof rawHtml === "string" ? rawHtml : "");
}
