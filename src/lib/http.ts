import type { NextRequest } from "next/server";

/** Build an absolute URL that keeps the browser host (not 0.0.0.0). */
export function appUrl(req: NextRequest, pathname: string): URL {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");
  if (host) {
    return new URL(pathname, `${proto}://${host}`);
  }
  return new URL(pathname, req.nextUrl.origin.replace("0.0.0.0", "127.0.0.1"));
}
