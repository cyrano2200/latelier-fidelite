"use client";

import { useActionState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { adminCreateCodeAction } from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function CreateCodeForm() {
  const [state, action, pending] = useActionState(adminCreateCodeAction, null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={action} className="panel grid gap-3 p-5 md:grid-cols-2">
        <h3 className="font-display text-2xl md:col-span-2">Créer un code</h3>
        <div className="field">
          <label htmlFor="code">Code (optionnel)</label>
          <input id="code" name="code" placeholder="Auto si vide" className="uppercase" />
        </div>
        <div className="field">
          <label htmlFor="amount">Montant (DH)</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue="0" />
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
          <label htmlFor="expiresInDays">Validité (jours)</label>
          <input id="expiresInDays" name="expiresInDays" type="number" min="1" defaultValue="30" />
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="label">Libellé</label>
          <input id="label" name="label" required placeholder="Café 10 DH" />
        </div>
        <div className="md:col-span-2">
          <button className="btn-primary" disabled={pending}>
            {pending ? "Création…" : "Générer le code"}
          </button>
        </div>
        <div className="md:col-span-2">
          <FormMessage error={state?.error} success={state?.success} />
        </div>
      </form>

      <div className="panel flex flex-col items-center justify-center gap-3 p-5 text-center">
        {state?.code ? (
          <>
            <QRCodeSVG
              value={state.code}
              size={180}
              bgColor="#f7efe3"
              fgColor="#1f120c"
              level="M"
              includeMargin
            />
            <p className="font-display text-3xl tracking-widest text-amber-soft">
              {state.code}
            </p>
            <p className="text-sm text-cream/55">
              Le client peut scanner ce QR ou saisir le code dans son espace.
            </p>
          </>
        ) : (
          <p className="text-cream/55">
            Le QR code du nouveau ticket apparaîtra ici après création.
          </p>
        )}
      </div>
    </div>
  );
}
