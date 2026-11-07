"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  clearClientSession,
  getCurrentClient,
  isAdminAuthenticated,
  loginAdmin,
  loginOrRegisterClient,
} from "./auth";
import {
  addConsumption,
  addManualPoints,
  addVisitOnly,
  createVisitCode,
  redeemReward,
  redeemVisitCode,
  updateSettings,
  upsertReward,
} from "./loyalty";
import type { ActivityType } from "./types";

export async function clientAuthAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const result = await loginOrRegisterClient(name, phone);
  if ("error" in result && result.error) {
    return { error: result.error };
  }
  redirect("/client");
}

export async function clientLogoutAction() {
  await clearClientSession();
  redirect("/");
}

export async function adminLoginAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const pin = String(formData.get("pin") ?? "");
  const result = await loginAdmin(pin);
  if ("error" in result && result.error) {
    return { error: result.error };
  }
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin/connexion");
}

export async function redeemCodeAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  const client = await getCurrentClient();
  if (!client) return { error: "Session expirée. Reconnectez-vous." };
  const code = String(formData.get("code") ?? "");
  const result = await redeemVisitCode(client.id, code);
  if ("error" in result && result.error) return { error: result.error };
  return {
    success: `Code validé ! +${result.points} points ajoutés à votre solde.`,
  };
}

export async function redeemRewardAction(rewardId: string) {
  const client = await getCurrentClient();
  if (!client) return { error: "Session expirée." };
  const result = await redeemReward(client.id, rewardId);
  if ("error" in result && result.error) return { error: result.error };
  return { success: `Récompense « ${result.reward?.name} » échangée.` };
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/connexion");
  }
}

export async function adminAddConsumptionAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const clientId = String(formData.get("clientId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const activityType = String(formData.get("activityType") ?? "autre") as ActivityType;
  const description = String(formData.get("description") ?? "");
  if (!clientId || Number.isNaN(amount) || amount < 0) {
    return { error: "Données invalides." };
  }
  const result = await addConsumption({
    clientId,
    amount,
    activityType,
    description,
  });
  return {
    success: `Consommation enregistrée (+${result.points} pts).`,
  };
}

export async function adminAddPointsAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const clientId = String(formData.get("clientId") ?? "");
  const points = Number(formData.get("points") ?? 0);
  const description = String(formData.get("description") ?? "Bonus manuel");
  if (!clientId || Number.isNaN(points)) {
    return { error: "Données invalides." };
  }
  await addManualPoints({ clientId, points, description });
  return { success: `${points >= 0 ? "+" : ""}${points} points appliqués.` };
}

export async function adminAddVisitAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const clientId = String(formData.get("clientId") ?? "");
  const activityType = String(formData.get("activityType") ?? "autre") as ActivityType;
  const notes = String(formData.get("notes") ?? "");
  if (!clientId) return { error: "Client manquant." };
  await addVisitOnly({ clientId, activityType, notes, withBonus: true });
  return { success: "Visite enregistrée avec bonus." };
}

export async function adminSaveSettingsAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  await requireAdmin();
  await updateSettings({
    establishment_name: String(formData.get("establishment_name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    dirhams_per_point: Number(formData.get("dirhams_per_point") ?? 10),
    visit_bonus_points: Number(formData.get("visit_bonus_points") ?? 5),
    admin_pin: String(formData.get("admin_pin") ?? ""),
  });
  return { success: "Paramètres enregistrés." };
}

export async function adminSaveRewardAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || undefined;
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const points_cost = Number(formData.get("points_cost") ?? 0);
  const active = formData.get("active") === "on";
  if (!name || points_cost <= 0) {
    return { error: "Nom et coût en points requis." };
  }
  await upsertReward({ id, name, description, points_cost, active: id ? active : true });
  return { success: id ? "Récompense mise à jour." : "Récompense créée." };
}

export async function adminCreateCodeAction(
  _prev: { error?: string; success?: string; code?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: string; code?: string }> {
  await requireAdmin();
  try {
    const code = await createVisitCode({
      code: String(formData.get("code") ?? "") || undefined,
      activityType: String(
        formData.get("activityType") ?? "autre",
      ) as ActivityType,
      amount: Number(formData.get("amount") ?? 0),
      label: String(formData.get("label") ?? "Consommation"),
      expiresInDays: Number(formData.get("expiresInDays") ?? 30),
    });
    return {
      success: `Code ${code.code} créé.`,
      code: code.code,
    };
  } catch {
    return { error: "Impossible de créer ce code (peut-être déjà utilisé)." };
  }
}
