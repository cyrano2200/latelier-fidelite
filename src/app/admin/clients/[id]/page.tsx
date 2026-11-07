import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ActivityBadge } from "@/components/ActivityBadge";
import { AdminClientForms } from "@/components/AdminClientForms";
import { StatCard } from "@/components/StatCard";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatDate, formatMoney, formatPoints } from "@/lib/format";
import {
  getClientById,
  getClientTransactions,
  getClientVisits,
} from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/connexion");
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const [visits, transactions] = await Promise.all([
    getClientVisits(client.id),
    getClientTransactions(client.id),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <Link href="/admin/clients" className="text-sm text-amber-soft hover:underline">
          ← Retour aux clients
        </Link>
        <h1 className="mt-2 font-display text-4xl">{client.name}</h1>
        <p className="text-cream/55">{client.phone}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Points" value={formatPoints(client.points)} />
        <StatCard label="Total dépensé" value={formatMoney(client.total_spent)} />
        <StatCard label="Visites" value={String(visits.length)} />
      </section>

      <AdminClientForms clientId={client.id} />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-3 font-display text-2xl">Visites</h2>
          <div className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="flex justify-between gap-3 border-b border-white/8 pb-2">
                <div>
                  <ActivityBadge type={v.activity_type} />
                  <p className="mt-1 text-sm text-cream/50">{v.notes || "—"}</p>
                </div>
                <span className="text-sm text-cream/45">{formatDate(v.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="mb-3 font-display text-2xl">Transactions</h2>
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between gap-3 border-b border-white/8 pb-2">
                <div>
                  <ActivityBadge type={t.type} />
                  <p className="mt-1 text-sm text-cream/50">{t.description}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatMoney(t.amount)}</p>
                  <p className={t.points >= 0 ? "text-emerald-300" : "text-rose-300"}>
                    {t.points >= 0 ? "+" : ""}
                    {t.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
