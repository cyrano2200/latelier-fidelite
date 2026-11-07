import { redirect } from "next/navigation";
import { RewardForm } from "@/components/RewardForm";
import { SettingsForm } from "@/components/SettingsForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatPoints } from "@/lib/format";
import { getAllRewards, getSettings } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminRulesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/connexion");
  const [settings, rewards] = await Promise.all([getSettings(), getAllRewards()]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-4xl">Règles de fidélité</h1>
        <p className="mt-1 text-cream/55">
          Paramétrez les points, les bonus de visite et les seuils de récompenses.
        </p>
      </div>

      <SettingsForm settings={settings} />

      <section className="panel p-5">
        <h2 className="mb-4 font-display text-2xl">Récompenses configurées</h2>
        <div className="space-y-3">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {reward.name}{" "}
                  {!reward.active ? (
                    <span className="text-xs text-rose-300">(inactive)</span>
                  ) : null}
                </p>
                <p className="text-sm text-cream/50">{reward.description}</p>
              </div>
              <p className="text-amber-soft">{formatPoints(reward.points_cost)}</p>
            </div>
          ))}
        </div>
      </section>

      <RewardForm />
    </main>
  );
}
