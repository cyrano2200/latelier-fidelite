import { redirect } from "next/navigation";
import { CreateCodeForm } from "@/components/CreateCodeForm";
import { ActivityBadge } from "@/components/ActivityBadge";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatDate, formatEuro } from "@/lib/format";
import { getActiveVisitCodes } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminCodesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/connexion");
  const codes = await getActiveVisitCodes();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-4xl">Codes & QR</h1>
        <p className="mt-1 text-cream/55">
          Générez des codes pour valider une visite ou une consommation côté client.
        </p>
      </div>

      <CreateCodeForm />

      <section className="panel overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-2xl">Codes actifs</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>Activité</th>
                <th>Montant</th>
                <th>Expire</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id}>
                  <td className="font-mono tracking-wider text-amber-soft">
                    {code.code}
                  </td>
                  <td>{code.label}</td>
                  <td>
                    <ActivityBadge type={code.activity_type} />
                  </td>
                  <td>{formatEuro(code.amount)}</td>
                  <td>
                    {code.expires_at ? formatDate(code.expires_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {codes.length === 0 ? (
            <p className="p-5 text-sm text-cream/50">Aucun code actif.</p>
          ) : null}
        </div>
      </section>

      <p className="text-sm text-cream/45">
        Astuce démo : codes préchargés <strong>CAFE10</strong>, <strong>BILL20</strong>,{" "}
        <strong>VISITE</strong>.
      </p>
    </main>
  );
}
