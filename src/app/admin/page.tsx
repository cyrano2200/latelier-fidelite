import Link from "next/link";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatMoney, formatPoints } from "@/lib/format";
import { getDashboardStats, getSettings, getTopClients } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/connexion");

  const [stats, topPoints, topSpent, settings] = await Promise.all([
    getDashboardStats(),
    getTopClients("points", 5),
    getTopClients("spent", 5),
    getSettings(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-soft/70">
          Vue d’ensemble
        </p>
        <h1 className="font-display text-4xl text-cream">Tableau de bord</h1>
        <p className="mt-2 text-cream/55">
          {settings.establishment_name} — activité fidélité en un coup d’œil.
        </p>
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients inscrits" value={String(stats.clientCount)} />
        <StatCard
          label="Visites du jour"
          value={String(stats.visitsToday)}
          hint={`${stats.visitsWeek} cette semaine · ${stats.visitsMonth} ce mois`}
        />
        <StatCard
          label="CA total"
          value={formatMoney(stats.revenueTotal)}
          hint={`Aujourd’hui ${formatMoney(stats.revenueToday)}`}
        />
        <StatCard
          label="Points distribués"
          value={formatPoints(stats.pointsDistributed)}
          hint={`Semaine ${formatMoney(stats.revenueWeek)} · Mois ${formatMoney(stats.revenueMonth)}`}
        />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-1">
          <h2 className="font-display text-2xl">Périodes</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between border-b border-white/8 pb-2">
              <span className="text-cream/55">CA du jour</span>
              <span>{formatMoney(stats.revenueToday)}</span>
            </li>
            <li className="flex justify-between border-b border-white/8 pb-2">
              <span className="text-cream/55">CA de la semaine</span>
              <span>{formatMoney(stats.revenueWeek)}</span>
            </li>
            <li className="flex justify-between border-b border-white/8 pb-2">
              <span className="text-cream/55">CA du mois</span>
              <span>{formatMoney(stats.revenueMonth)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-cream/55">Visites (j / s / m)</span>
              <span>
                {stats.visitsToday} / {stats.visitsWeek} / {stats.visitsMonth}
              </span>
            </li>
          </ul>
        </div>

        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl">Top points</h2>
            <Link href="/admin/clients" className="text-sm text-amber-soft hover:underline">
              Voir tous
            </Link>
          </div>
          <div className="space-y-3">
            {topPoints.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]"
              >
                <span>
                  <span className="mr-2 text-cream/40">{i + 1}.</span>
                  {c.name}
                </span>
                <span className="text-amber-soft">{formatPoints(c.points)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="mb-3 font-display text-2xl">Top chiffre d’affaires</h2>
          <div className="space-y-3">
            {topSpent.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]"
              >
                <span>
                  <span className="mr-2 text-cream/40">{i + 1}.</span>
                  {c.name}
                </span>
                <span>{formatMoney(c.total_spent)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/clients" className="panel p-5 transition hover:border-amber/40">
          <h3 className="font-display text-xl">Gérer les clients</h3>
          <p className="mt-1 text-sm text-cream/50">Recherche, points, consommations</p>
        </Link>
        <Link href="/admin/regles" className="panel p-5 transition hover:border-amber/40">
          <h3 className="font-display text-xl">Règles de fidélité</h3>
          <p className="mt-1 text-sm text-cream/50">Points, bonus, récompenses</p>
        </Link>
        <Link href="/admin/codes" className="panel p-5 transition hover:border-amber/40">
          <h3 className="font-display text-xl">Codes & QR</h3>
          <p className="mt-1 text-sm text-cream/50">Tickets scannables pour les clients</p>
        </Link>
      </section>
    </main>
  );
}
