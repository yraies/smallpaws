import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Small Paws",
  description:
    "A privacy-first conversation starter tool for complex personal topics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-lavender-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <div className="app-frame overflow-visible">
          <h1 className="app-brand">Small Paws</h1>
          <div className="page-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
