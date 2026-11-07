import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { BrandMark } from "@/components/BrandMark";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const settings = await getSettings();
  const { erreur } = await searchParams;

  return (
    <main className="atmosphere flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative grid w-full max-w-4xl gap-6 lg:grid-cols-2">
        <section className="felt-rail rounded-[28px] p-8">
          <BrandMark
            name={settings.establishment_name}
            tagline="Espace personnel & administration"
            size="md"
          />
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-cream/70">
            Gérez les clients, validez les consommations, configurez les règles
            de fidélité et suivez le chiffre d’affaires.
          </p>
        </section>
        <section className="panel p-6 sm:p-8">
          <h2 className="font-display text-3xl">Connexion admin</h2>
          <p className="mb-6 mt-2 text-sm text-cream/55">
            Entrez le code PIN de l’établissement.
          </p>
          <AdminLoginForm
            error={erreur}
            showDemoHint={!process.env.DATABASE_URL}
          />
          <div className="mt-6 text-center text-sm text-cream/50">
            <Link href="/" className="text-amber-soft hover:underline">
              ← Retour à l’accueil client
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
