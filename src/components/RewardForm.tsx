"use client";

import { useActionState } from "react";
import { adminSaveRewardAction } from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function RewardForm() {
  const [state, action, pending] = useActionState(adminSaveRewardAction, null);

  return (
    <form action={action} className="panel grid gap-3 p-5 md:grid-cols-2">
      <h3 className="font-display text-2xl md:col-span-2">Nouvelle récompense</h3>
      <div className="field">
        <label htmlFor="name">Nom</label>
        <input id="name" name="name" required placeholder="Café offert" />
      </div>
      <div className="field">
        <label htmlFor="points_cost">Coût en points</label>
        <input id="points_cost" name="points_cost" type="number" min="1" required defaultValue="100" />
      </div>
      <div className="field md:col-span-2">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} placeholder="Détails de la récompense" />
      </div>
      <div className="md:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? "Création…" : "Ajouter la récompense"}
        </button>
      </div>
      <div className="md:col-span-2">
        <FormMessage error={state?.error} success={state?.success} />
      </div>
    </form>
  );
}
