import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegister } from "@/app/_components/pwa/sw-register";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" }
  ]
};

export const metadata: Metadata = {
  title: "STOCKLAB — Dashboard",
  description:
    "STOCKLAB home dashboard. Track market indices, stocks, sentiment, news, and your portfolio.",
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "STOCKLAB"
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ],
    apple: [{ url: "/apple-touch-icon.svg", sizes: "180x180" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
