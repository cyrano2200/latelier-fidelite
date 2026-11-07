import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { appUrl } from "@/lib/http";
import { redeemVisitCode } from "@/lib/loyalty";

export async function POST(req: NextRequest) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.redirect(appUrl(req, "/"), 303);
  }

  const form = await req.formData();
  const code = String(form.get("code") ?? "");
  const result = await redeemVisitCode(client.id, code);
  const url = appUrl(req, "/client");

  if ("error" in result && result.error) {
    url.searchParams.set("erreur", result.error);
  } else {
    url.searchParams.set(
      "succes",
      `Code validé ! +${result.points} points ajoutés à votre solde.`,
    );
  }

  return NextResponse.redirect(url, 303);
}
