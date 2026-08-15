import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/**
 * SECURITY_HEADERS is one of the fifteen checks we grade other people on, so
 * the site has to pass it too. 'unsafe-inline' on scripts is what Next's
 * bootstrap and the JSON-LD block require; everything else is locked down.
 */
function csp(isDev: boolean): string {
  return [
    "default-src 'self'",
    // Hot reload evaluates code at runtime; production never needs to.
    isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    async headers() {
      return [
        {
          // The display font is served from a stable, unhashed path, so it
          // does not get next/font's automatic immutable caching. This puts
          // it back. Treat /fonts/* as permanent: a new cut of a face ships
          // under a new filename rather than replacing one in place.
          source: "/fonts/:file*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          source: "/:path*",
          headers: [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
            { key: "Content-Security-Policy", value: csp(isDev) },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=()",
            },
          ],
        },
      ];
    },
  };
}
