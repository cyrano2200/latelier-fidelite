"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/lib/actions";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/regles", label: "Règles" },
  { href: "/admin/historique", label: "Historique" },
  { href: "/admin/codes", label: "Codes / QR" },
];

export function AdminNav({ establishmentName }: { establishmentName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-amber-soft/70">
            Espace personnel
          </p>
          <p className="font-display text-2xl text-cream">{establishmentName}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-amber text-espresso font-semibold"
                    : "bg-white/5 text-cream/75 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <form action={adminLogoutAction}>
            <button type="submit" className="btn-ghost px-3 py-1.5 text-sm">
              Déconnexion
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
