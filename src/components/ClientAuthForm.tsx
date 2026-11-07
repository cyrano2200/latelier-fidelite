"use client";

import { useActionState } from "react";
import { clientAuthAction } from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function ClientAuthForm() {
  const [state, action, pending] = useActionState(clientAuthAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <div className="field">
        <label htmlFor="name">Nom</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Votre prénom et nom"
          required
          minLength={2}
        />
      </div>
      <div className="field">
        <label htmlFor="phone">Numéro de téléphone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="06 12 34 56 78"
          required
          minLength={8}
        />
      </div>
      <button type="submit" className="btn-primary mt-2 w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter / S’inscrire"}
      </button>
      <p className="text-center text-xs leading-relaxed text-cream/45">
        Pas de mot de passe pour commencer. Votre téléphone sert d’identifiant
        fidélité. Un code PIN pourra être ajouté plus tard.
      </p>
    </form>
  );
}
