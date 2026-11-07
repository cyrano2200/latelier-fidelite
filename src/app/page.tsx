import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { ClientAuthForm } from "@/components/ClientAuthForm";
import { getCurrentClient } from "@/lib/auth";
import { getSettings } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const client = await getCurrentClient();
  if (client) redirect("/client");

  const settings = await getSettings();
  const { erreur } = await searchParams;

  return (
    <main className="atmosphere relative min-h-screen">
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="fade-up relative min-h-[52vh] overflow-hidden rounded-[32px] felt-rail p-8 sm:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(243,210,122,0.25), transparent 35%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.35), transparent 40%)",
            }}
          />
          <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between">
            <BrandMark
              name={settings.establishment_name}
              tagline={settings.tagline}
              size="lg"
            />
            <div className="max-w-md space-y-3">
              <p className="text-lg text-cream/85">
                Cumulez des points à chaque café, partie de billard ou repas —
                et transformez vos passages en récompenses.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="badge">1 € = {settings.points_per_euro} pt</span>
                <span className="badge">
                  +{settings.visit_bonus_points} pts / visite
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up-delay panel p-6 sm:p-8">
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-amber-soft/75">
            Espace client
          </p>
          <h2 className="font-display text-3xl text-cream">Connexion rapide</h2>
          <p className="mb-6 mt-2 text-sm text-cream/55">
            Identifiez-vous avec votre nom et votre numéro de téléphone.
          </p>
          <ClientAuthForm error={erreur} />
          <div className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-cream/50">
            Personnel ?{" "}
            <Link
              href="/admin/connexion"
              className="text-amber-soft underline-offset-4 hover:underline"
            >
              Accéder à l’administration
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
