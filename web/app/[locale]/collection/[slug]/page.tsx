import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CopyButton from "@/components/CopyButton";
import { getActivity, listActivities } from "@/lib/queries";
import { inviteMessage } from "@/lib/messages";
import { formatDate, weeksUntilLastWednesday } from "@/lib/dates";
import { collectionPath, isLocale } from "@/lib/i18n/config";
import { CATEGORY_LABELS, getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const activity = getActivity(slug, locale);
  if (!activity) return { title: dict.detail.notFound };
  return {
    title: `${activity.title} — That's a First`,
    description: activity.description,
  };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const labels = CATEGORY_LABELS[locale];

  const activity = getActivity(slug, locale);
  if (!activity) notFound();

  const invite = inviteMessage(activity, locale);
  const { target } = weeksUntilLastWednesday();
  const related = listActivities(locale, { category: activity.category })
    .filter((a) => a.slug !== activity.slug)
    .slice(0, 3);

  return (
    <div className="wrap py-16 max-w-3xl">
      <Link href={collectionPath(locale)} className="text-sm font-semibold">
        {dict.detail.back}
      </Link>

      <div className="flex items-start gap-4 mt-6 mb-4">
        <span className="checkbox mt-3">✓</span>
        <h1 className="text-5xl">{activity.title}</h1>
      </div>

      <p className="flex flex-wrap gap-1.5 mb-8">
        <span className="tag" style={{ borderColor: "var(--ink)" }}>
          {labels[activity.category] ?? activity.category}
        </span>
        {activity.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </p>

      <p className="text-xl mb-10">{activity.description}</p>

      <div className="card !p-8 mb-10">
        <p className="eyebrow !mb-2">{dict.detail.inviteEyebrow}</p>
        <h2 className="text-2xl mb-3">{dict.detail.inviteTitle}</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          {dict.detail.nextWednesdayPre}
          <strong>{formatDate(target, locale)}</strong>
          {dict.detail.nextWednesdayPost}
        </p>
        <div className="message-box mb-5">{invite}</div>
        <CopyButton
          text={invite}
          label={dict.detail.copyLabel}
          copiedLabel={dict.detail.copied}
        />
      </div>

      {related.length > 0 && (
        <>
          <p className="eyebrow">{dict.detail.related}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={collectionPath(locale, a.slug)}
                className="card !p-4"
              >
                <h3 className="text-base mb-1">{a.title}</h3>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {a.description.split(". ")[0]}.
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
