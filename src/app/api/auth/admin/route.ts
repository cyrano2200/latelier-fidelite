import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
  verifyAdminPin,
} from "@/lib/auth";
import { appUrl } from "@/lib/http";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pin = String(form.get("pin") ?? "");
  const result = await verifyAdminPin(pin);

  if ("error" in result && result.error) {
    const url = appUrl(req, "/admin/connexion");
    url.searchParams.set("erreur", result.error);
    return NextResponse.redirect(url, 303);
  }

  const token = await createAdminToken();
  const res = NextResponse.redirect(appUrl(req, "/admin"), 303);
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
