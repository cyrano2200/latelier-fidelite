import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_COOKIE,
  clientCookieOptions,
  createClientToken,
  loginOrRegisterClient,
} from "@/lib/auth";
import { appUrl } from "@/lib/http";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const phone = String(form.get("phone") ?? "");
  const result = await loginOrRegisterClient(name, phone);

  if ("error" in result && result.error) {
    const url = appUrl(req, "/");
    url.searchParams.set("erreur", result.error);
    return NextResponse.redirect(url, 303);
  }

  const token = await createClientToken(result.client!.id);
  const res = NextResponse.redirect(appUrl(req, "/client"), 303);
  res.cookies.set(CLIENT_COOKIE, token, clientCookieOptions());
  return res;
}
