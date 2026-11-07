import { AdminNav } from "@/components/AdminNav";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const authed = await isAdminAuthenticated();

  return (
    <div className="atmosphere min-h-screen">
      {authed ? <AdminNav establishmentName={settings.establishment_name} /> : null}
      {children}
    </div>
  );
}
