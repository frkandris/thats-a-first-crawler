import Link from "next/link";
import { notFound } from "next/navigation";
import { adminPath, isLocale } from "@/lib/i18n/config";

// Belső felület — MVP-ben nincs mögötte hitelesítés, csak lokálisan futtatjuk.
// Az admin szövegei szándékosan egynyelvűek (magyar), a locale csak az URL-ben él.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="wrap py-10">
      <div
        className="mb-8 flex flex-wrap items-center gap-4 border-b pb-4"
        style={{ borderColor: "var(--line)" }}
      >
        <p className="display font-bold text-lg">Admin</p>
        <nav className="flex gap-3 text-sm font-semibold">
          <Link href={adminPath(locale, "/felfedezesek")} className="chip no-underline">
            Felfedezések
          </Link>
          <Link href={adminPath(locale, "/hirlevel")} className="chip no-underline">
            Hírlevél
          </Link>
        </nav>
        <p className="ml-auto text-xs" style={{ color: "var(--muted)" }}>
          belső felület — nem publikus
        </p>
      </div>
      {children}
    </div>
  );
}
