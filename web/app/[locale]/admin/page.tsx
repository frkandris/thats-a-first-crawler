import Link from "next/link";
import { notFound } from "next/navigation";
import { countSubscribers, listDiscoveries, listIssues } from "@/lib/queries";
import { adminPath, isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const discoveries = listDiscoveries();
  const newCount = discoveries.filter((d) => d.status === "new").length;
  const subscribers = countSubscribers();
  const issues = listIssues();

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Link href={adminPath(locale, "/felfedezesek")} className="card">
        <p className="display text-4xl mb-1">{newCount}</p>
        <p className="font-semibold">új felfedezés vár átnézésre</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          összesen {discoveries.length} a listában
        </p>
      </Link>
      <Link href={adminPath(locale, "/hirlevel")} className="card">
        <p className="display text-4xl mb-1">{issues.length}</p>
        <p className="font-semibold">hírlevél-szám eddig (HU + EN együtt)</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          a következőt a hónap első szerdáján küldjük
        </p>
      </Link>
      <div className="card">
        <p className="display text-4xl mb-1">{subscribers}</p>
        <p className="font-semibold">feliratkozó</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          a weboldali űrlapról (nyelvenként jelölve)
        </p>
      </div>
    </div>
  );
}
