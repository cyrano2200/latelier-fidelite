"use client";

import { useActionState } from "react";
import {
  adminAddConsumptionAction,
  adminAddPointsAction,
  adminAddVisitAction,
} from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function AdminClientForms({ clientId }: { clientId: string }) {
  const [cState, cAction, cPending] = useActionState(adminAddConsumptionAction, null);
  const [pState, pAction, pPending] = useActionState(adminAddPointsAction, null);
  const [vState, vAction, vPending] = useActionState(adminAddVisitAction, null);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form action={cAction} className="panel space-y-3 p-4">
        <h3 className="font-display text-xl">Ajouter une consommation</h3>
        <input type="hidden" name="clientId" value={clientId} />
        <div className="field">
          <label htmlFor="amount">Montant (€)</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" required defaultValue="10" />
        </div>
        <div className="field">
          <label htmlFor="activityType">Activité</label>
          <select id="activityType" name="activityType" defaultValue="cafe">
            <option value="cafe">Café</option>
            <option value="billard">Billard</option>
            <option value="restaurant">Restaurant</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <input id="description" name="description" placeholder="Ex. espresso + cookie" />
        </div>
        <button className="btn-primary w-full" disabled={cPending}>
          {cPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <FormMessage error={cState?.error} success={cState?.success} />
      </form>

      <form action={pAction} className="panel space-y-3 p-4">
        <h3 className="font-display text-xl">Bonus / ajustement</h3>
        <input type="hidden" name="clientId" value={clientId} />
        <div className="field">
          <label htmlFor="points">Points (+/-)</label>
          <input id="points" name="points" type="number" required defaultValue="20" />
        </div>
        <div className="field">
          <label htmlFor="description-points">Motif</label>
          <input
            id="description-points"
            name="description"
            placeholder="Anniversaire, promo…"
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={pPending}>
          {pPending ? "Application…" : "Appliquer les points"}
        </button>
        <FormMessage error={pState?.error} success={pState?.success} />
      </form>

      <form action={vAction} className="panel space-y-3 p-4">
        <h3 className="font-display text-xl">Visite seule</h3>
        <input type="hidden" name="clientId" value={clientId} />
        <div className="field">
          <label htmlFor="visit-activity">Activité</label>
          <select id="visit-activity" name="activityType" defaultValue="autre">
            <option value="cafe">Café</option>
            <option value="billard">Billard</option>
            <option value="restaurant">Restaurant</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <input id="notes" name="notes" placeholder="Passage rapide…" />
        </div>
        <button className="btn-primary w-full" disabled={vPending}>
          {vPending ? "Enregistrement…" : "Valider la visite"}
        </button>
        <FormMessage error={vState?.error} success={vState?.success} />
      </form>
    </div>
  );
}
