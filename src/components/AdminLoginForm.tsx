"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function AdminLoginForm({ showDemoHint = false }: { showDemoHint?: boolean }) {
  const [state, action, pending] = useActionState(adminLoginAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <div className="field">
        <label htmlFor="pin">Code PIN personnel</label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          placeholder="••••"
          required
          autoComplete="current-password"
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Vérification…" : "Accéder à l’espace admin"}
      </button>
      {showDemoHint ? (
        <p className="text-center text-xs text-cream/45">
          Mode démo local : le PIN initial est configuré dans les réglages.
        </p>
      ) : null}
    </form>
  );
}
