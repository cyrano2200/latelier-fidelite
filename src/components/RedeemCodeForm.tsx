"use client";

import { useActionState } from "react";
import { redeemCodeAction } from "@/lib/actions";
import { FormMessage } from "./FormMessage";

export function RedeemCodeForm() {
  const [state, action, pending] = useActionState(redeemCodeAction, null);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="field flex-1">
        <label htmlFor="code">Code de visite / consommation</label>
        <input
          id="code"
          name="code"
          placeholder="Ex. CAFE10"
          required
          className="uppercase"
          autoCapitalize="characters"
        />
      </div>
      <button type="submit" className="btn-primary shrink-0" disabled={pending}>
        {pending ? "Validation…" : "Valider le code"}
      </button>
      <div className="basis-full">
        <FormMessage error={state?.error} success={state?.success} />
      </div>
    </form>
  );
}
