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
        <div className="app-frame overflow-visible">
          <h1 className="app-brand">Small Paws</h1>
          <div className="page-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
