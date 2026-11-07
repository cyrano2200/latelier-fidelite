import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatDateShort, formatMoney, formatPoints } from "@/lib/format";
import { searchClients } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/connexion");
  const { q = "" } = await searchParams;
  const clients = await searchClients(q);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl">Clients</h1>
          <p className="mt-1 text-cream/55">Recherche par nom ou téléphone</p>
        </div>
        <form className="flex w-full max-w-md gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom ou téléphone…"
            className="w-full rounded-full border border-white/15 bg-black/30 px-4 py-2.5 outline-none focus:border-amber"
          />
          <button className="btn-primary px-4" type="submit">
            Chercher
          </button>
        </form>
      </div>

      <div className="panel overflow-hidden">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Points</th>
                <th>CA</th>
                <th>Inscrit le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="font-medium">{client.name}</td>
                  <td>{client.phone}</td>
                  <td className="text-amber-soft">{formatPoints(client.points)}</td>
                  <td>{formatMoney(client.total_spent)}</td>
                  <td>{formatDateShort(client.created_at)}</td>
                  <td>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="text-sm text-amber-soft hover:underline"
                    >
                      Détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 ? (
            <p className="p-5 text-sm text-cream/50">Aucun client trouvé.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
