import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { appUrl } from "@/lib/http";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(appUrl(req, "/admin/connexion"), 303);
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
