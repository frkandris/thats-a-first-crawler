import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listActivities, listCategories } from "@/lib/queries";
import { collectionPath, isLocale } from "@/lib/i18n/config";
import { CATEGORY_LABELS, getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: `${dict.nav.collection} — That's a First`,
    description: dict.collection.sub,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kategoria?: string; category?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const labels = CATEGORY_LABELS[locale];

  const sp = await searchParams;
  const selected = sp.kategoria ?? sp.category;
  const paramName = locale === "hu" ? "kategoria" : "category";

  const categories = listCategories();
  const all = listActivities(locale);
  const activities = selected
    ? all.filter((a) => a.category === selected)
    : all;

  return (
    <div className="wrap py-16">
      <p className="eyebrow">{dict.collection.eyebrow}</p>
      <h1 className="text-5xl mb-4">
        {dict.collection.titlePre}
        <span className="hl">{dict.collection.titleHl}</span>
        {dict.collection.titlePost}
      </h1>
      <p className="text-lg mb-10 max-w-2xl" style={{ color: "var(--muted)" }}>
        {dict.collection.sub}
      </p>

      <nav
        className="flex flex-wrap gap-2 mb-10"
        aria-label={dict.collection.categoriesLabel}
      >
        <Link
          href={collectionPath(locale)}
          className={`chip no-underline ${!selected ? "active" : ""}`}
        >
          {dict.collection.allLabel} ({all.length})
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`${collectionPath(locale)}?${paramName}=${encodeURIComponent(c)}`}
            className={`chip no-underline ${selected === c ? "active" : ""}`}
          >
            {labels[c] ?? c}
          </Link>
        ))}
      </nav>

      {activities.length === 0 ? (
        <p className="text-lg" style={{ color: "var(--muted)" }}>
          {dict.collection.empty}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={collectionPath(locale, a.slug)}
              className="card"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="checkbox mt-1">✓</span>
                <h2 className="text-lg display font-bold">{a.title}</h2>
              </div>
              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                {a.description}
              </p>
              <p className="flex flex-wrap gap-1.5">
                <span className="tag" style={{ borderColor: "var(--ink)" }}>
                  {labels[a.category] ?? a.category}
                </span>
                {a.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
