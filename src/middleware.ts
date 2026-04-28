import { type NextRequest, NextResponse } from "next/server";

/** Maximum request body size for API routes (5 MB) */
const MAX_BODY_SIZE = 5 * 1024 * 1024;

export function middleware(request: NextRequest) {
  // --- Body size limit for API routes ---
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 },
      );
    }
  }

  const response = NextResponse.next();

  // --- Security headers ---
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // CSP: allow 'unsafe-inline' for scripts because the theme flash-prevention
  // script in layout.tsx uses dangerouslySetInnerHTML. frame-ancestors 'none'
  // is the modern replacement for X-Frame-Options: DENY.
  // In development, React requires 'unsafe-eval' for debugging features like
  // callstack reconstruction; this is never used in production builds.
  const scriptSrc =
    process.env.NODE_ENV === "production"
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  // HSTS only in production (where HTTPS is expected)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  return response;
}

export const config = {
  // Apply to all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
