import { FormMessage } from "./FormMessage";

export function RedeemCodeForm({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <form
      action="/api/client/redeem-code"
      method="post"
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
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
      <button type="submit" className="btn-primary shrink-0">
        Valider le code
      </button>
      <div className="basis-full">
        <FormMessage error={error} success={success} />
      </div>
    </form>
  );
}
