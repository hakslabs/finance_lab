import type { Metadata, Viewport } from "next";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" }
  ]
};

export const metadata: Metadata = {
  title: "STOCKLAB — M0 Infrastructure",
  description:
    "STOCKLAB infrastructure foundation. Temporary auth verification surface.",
  robots: { index: false, follow: false }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
