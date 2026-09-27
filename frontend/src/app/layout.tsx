import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";

import { RootProvider } from "@providers/root-provider";

import { SkipLink } from "@components/composite/skip-link";

import { siteConfig } from "@config/site";

import { buildMetadata } from "@lib/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Display serif — the editorial voice of the brand (headings, quotes). */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = buildMetadata({ canonicalPath: "/" });

/**
 * Sets the `dark` class before paint to avoid a theme flash (FOUC).
 * Mirrors the logic in `@providers/theme-provider`.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('vision-amnaya:theme');if(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
