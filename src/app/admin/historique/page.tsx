import { redirect } from "next/navigation";
import { ActivityBadge } from "@/components/ActivityBadge";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatDate, formatEuro } from "@/lib/format";
import { getRecentTransactions } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/connexion");
  const transactions = await getRecentTransactions(80);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl">Historique & rapports</h1>
        <p className="mt-1 text-cream/55">
          Journal global des transactions fidélité.
        </p>
      </div>

      <div className="panel overflow-hidden">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Type</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.created_at)}</td>
                  <td>{tx.client_name}</td>
                  <td>{tx.client_phone}</td>
                  <td>
                    <ActivityBadge type={tx.type} />
                  </td>
                  <td>{tx.description}</td>
                  <td>{formatEuro(tx.amount)}</td>
                  <td className={tx.points >= 0 ? "text-emerald-300" : "text-rose-300"}>
                    {tx.points >= 0 ? "+" : ""}
                    {tx.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 ? (
            <p className="p-5 text-sm text-cream/50">Aucune transaction.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
