import parse from "html-react-parser";
import type { CSSProperties } from "react";

import { markdownToSafeHtml } from "./sanitize";

export function SafeMarkdown({
  markdown,
  as = "div",
  className,
  style,
}: {
  readonly markdown: string;
  readonly as?: "article" | "div";
  readonly className?: string;
  readonly style?: CSSProperties;
}) {
  const children = parse(markdownToSafeHtml(markdown));

  if (as === "article") {
    return <article className={className} style={style}>{children}</article>;
  }

  return <div className={className} style={style}>{children}</div>;
}
