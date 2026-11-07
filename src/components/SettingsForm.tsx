"use client";

import { useActionState } from "react";
import { adminSaveSettingsAction } from "@/lib/actions";
import type { LoyaltySettings } from "@/lib/types";
import { FormMessage } from "./FormMessage";

export function SettingsForm({ settings }: { settings: LoyaltySettings }) {
  const [state, action, pending] = useActionState(adminSaveSettingsAction, null);

  return (
    <form action={action} className="panel grid gap-4 p-5 md:grid-cols-2">
      <div className="field md:col-span-2">
        <label htmlFor="establishment_name">Nom de l’établissement</label>
        <input
          id="establishment_name"
          name="establishment_name"
          defaultValue={settings.establishment_name}
          required
        />
      </div>
      <div className="field md:col-span-2">
        <label htmlFor="tagline">Accroche</label>
        <input id="tagline" name="tagline" defaultValue={settings.tagline} required />
      </div>
      <div className="field">
        <label htmlFor="points_per_euro">Points par euro dépensé</label>
        <input
          id="points_per_euro"
          name="points_per_euro"
          type="number"
          step="0.1"
          min="0"
          defaultValue={settings.points_per_euro}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="visit_bonus_points">Bonus de visite (points)</label>
        <input
          id="visit_bonus_points"
          name="visit_bonus_points"
          type="number"
          min="0"
          defaultValue={settings.visit_bonus_points}
          required
        />
      </div>
      <div className="field md:col-span-2">
        <label htmlFor="admin_pin">Nouveau PIN admin (laisser vide pour ne pas changer)</label>
        <input id="admin_pin" name="admin_pin" type="password" placeholder="••••" />
      </div>
      <div className="md:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les règles"}
        </button>
      </div>
      <div className="md:col-span-2">
        <FormMessage error={state?.error} success={state?.success} />
      </div>
    </form>
  );
}
