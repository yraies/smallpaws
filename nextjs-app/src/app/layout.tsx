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
      <body className="bg-slate-100">
        <div className="m-auto flex w-full max-w-lg flex-col items-center gap-2 overflow-visible p-4">
          <h1 className="m-4 text-center text-4xl font-extrabold">
            Small Paws
          </h1>
          {children}
        </div>
      </body>
    </html>
  );
}
