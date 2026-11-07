import { FormMessage } from "./FormMessage";

export function AdminLoginForm({
  error,
  showDemoHint = false,
}: {
  error?: string;
  showDemoHint?: boolean;
}) {
  return (
    <form action="/api/auth/admin" method="post" className="flex flex-col gap-4">
      <FormMessage error={error} />
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
      <button type="submit" className="btn-primary w-full">
        Accéder à l’espace admin
      </button>
      {showDemoHint ? (
        <p className="text-center text-xs text-cream/45">
          Mode démo local : le PIN initial est documenté dans le README.
        </p>
      ) : null}
    </form>
  );
}
