import Link from "next/link";
import { redirect } from "next/navigation";
import { ActivityBadge } from "@/components/ActivityBadge";
import { RedeemCodeForm } from "@/components/RedeemCodeForm";
import { RedeemRewardButton } from "@/components/RedeemRewardButton";
import { StatCard } from "@/components/StatCard";
import { getCurrentClient } from "@/lib/auth";
import { formatDate, formatMoney, formatPoints } from "@/lib/format";
import {
  getActiveRewards,
  getClientTransactions,
  getClientVisits,
  getSettings,
} from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; succes?: string }>;
}) {
  const client = await getCurrentClient();
  if (!client) redirect("/");

  const { erreur, succes } = await searchParams;
  const [settings, visits, transactions, rewards] = await Promise.all([
    getSettings(),
    getClientVisits(client.id),
    getClientTransactions(client.id),
    getActiveRewards(),
  ]);

  return (
    <main className="atmosphere min-h-screen">
      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <header className="fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-soft/70">
              {settings.establishment_name}
            </p>
            <h1 className="font-display text-4xl text-cream sm:text-5xl">
              Bonjour, {client.name.split(" ")[0]}
            </h1>
            <p className="mt-2 text-cream/55">{client.phone}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost text-sm">
              Accueil
            </Link>
            <form action="/api/auth/client/logout" method="post">
              <button type="submit" className="btn-ghost text-sm">
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <section className="fade-up-delay mb-6 grid gap-4 sm:grid-cols-3">
          <div className="panel felt-rail p-5 sm:col-span-1">
            <p className="text-xs uppercase tracking-[0.16em] text-cream/60">
              Solde de points
            </p>
            <p className="mt-3 font-display text-5xl text-amber-soft">
              {client.points}
            </p>
            <p className="mt-1 text-sm text-cream/65">points disponibles</p>
          </div>
          <StatCard
            label="Total dépensé"
            value={formatMoney(client.total_spent)}
            hint="Votre chiffre d’affaires personnel"
          />
          <StatCard
            label="Visites"
            value={String(visits.length)}
            hint="Historique récent affiché ci-dessous"
          />
        </section>

        <section className="fade-up-delay-2 panel mb-6 p-5">
          <h2 className="font-display text-2xl">Valider une visite</h2>
          <p className="mb-4 mt-1 text-sm text-cream/55">
            Scannez le QR du ticket ou saisissez le code remis par le personnel.
          </p>
          <RedeemCodeForm error={erreur} success={succes} />
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <h2 className="mb-4 font-display text-2xl">Récompenses</h2>
            <div className="space-y-3">
              {rewards.map((reward) => {
                const affordable = client.points >= reward.points_cost;
                return (
                  <div
                    key={reward.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                  >
                    <div>
                      <p className="font-medium text-cream">{reward.name}</p>
                      <p className="text-sm text-cream/50">{reward.description}</p>
                      <p className="mt-1 text-sm text-amber-soft">
                        {formatPoints(reward.points_cost)}
                      </p>
                    </div>
                    <RedeemRewardButton
                      rewardId={reward.id}
                      affordable={affordable}
                    />
                  </div>
                );
              })}
              {rewards.length === 0 ? (
                <p className="text-sm text-cream/50">Aucune récompense pour le moment.</p>
              ) : null}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="mb-4 font-display text-2xl">Historique des visites</h2>
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between gap-3 border-b border-white/8 pb-3 last:border-0"
                >
                  <div>
                    <ActivityBadge type={visit.activity_type} />
                    <p className="mt-1 text-sm text-cream/55">
                      {visit.notes || "Visite enregistrée"}
                    </p>
                  </div>
                  <p className="text-sm text-cream/45">{formatDate(visit.created_at)}</p>
                </div>
              ))}
              {visits.length === 0 ? (
                <p className="text-sm text-cream/50">Pas encore de visite.</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-display text-2xl">Transactions</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
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
                    <td>
                      <ActivityBadge type={tx.type} />
                    </td>
                    <td>{tx.description}</td>
                    <td>{formatMoney(tx.amount)}</td>
                    <td className={tx.points >= 0 ? "text-emerald-300" : "text-rose-300"}>
                      {tx.points >= 0 ? "+" : ""}
                      {tx.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 ? (
              <p className="py-4 text-sm text-cream/50">Aucune transaction.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
