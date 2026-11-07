import { NextRequest, NextResponse } from "next/server";
import { CLIENT_COOKIE } from "@/lib/auth";
import { appUrl } from "@/lib/http";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(appUrl(req, "/"), 303);
  res.cookies.set(CLIENT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
