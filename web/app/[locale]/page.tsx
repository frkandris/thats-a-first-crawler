import Link from "next/link";
import { notFound } from "next/navigation";
import SubscribeForm from "@/components/SubscribeForm";
import { listActivities } from "@/lib/queries";
import { formatDate, weeksUntilLastWednesday } from "@/lib/dates";
import { collectionPath, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

const PREVIEW_SLUGS = [
  "uvegfuvas",
  "jegfurdo",
  "tarsasvacsora-idegenekkel",
  "csillagles",
  "fazekaskorongozas",
  "standup-openmic",
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const { target, weeks } = weeksUntilLastWednesday();
  const preview = listActivities(locale).filter((a) =>
    PREVIEW_SLUGS.includes(a.slug)
  );

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="wrap grid gap-12 py-20 md:grid-cols-[3fr_2fr] md:items-center">
        <div>
          <p className="calendar-chip mb-6">
            <span className="dot" aria-hidden />
            {dict.hero.chipNext} {formatDate(target, locale)}
            {weeks > 0 && dict.hero.chipWeeks(weeks)}
          </p>
          <h1 className="text-5xl md:text-6xl mb-6">
            {dict.hero.titlePre}
            <span className="hl">{dict.hero.titleHl}</span>
            {dict.hero.titlePost}
          </h1>
          <p className="text-xl mb-8" style={{ color: "var(--muted)" }}>
            {dict.hero.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={collectionPath(locale)}
              className="btn btn-primary no-underline"
            >
              {dict.hero.ctaBrowse}
            </Link>
            <a href="#letoltes" className="btn btn-ghost no-underline">
              {dict.hero.ctaPdf}
            </a>
          </div>
        </div>

        <ul
          className="hero-list card flex flex-col gap-4 !p-8"
          aria-label={dict.hero.samplesLabel}
        >
          {dict.hero.samples.map((item, i) => (
            <li key={item} className="flex items-center gap-3 text-lg font-semibold">
              <span className={`checkbox ${i === 0 ? "checked" : ""}`}>✓</span>
              {item}
            </li>
          ))}
          <li className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            {dict.hero.andMore}
          </li>
        </ul>
      </section>

      {/* ——— Hogyan működik ——— */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">{dict.how.eyebrow}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {dict.how.steps.map((s, i) => (
              <div key={s.title} className="card">
                <p className="display text-4xl mb-3" style={{ color: "var(--cobalt)" }}>
                  {i + 1}
                </p>
                <h3 className="text-xl mb-2">{s.title}</h3>
                <p style={{ color: "var(--muted)" }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Origin story ——— */}
      <section className="section" id="sztori">
        <div className="wrap max-w-3xl">
          <p className="eyebrow">{dict.story.eyebrow}</p>
          <h2 className="text-4xl mb-6">
            {dict.story.titlePre}
            <span className="hl">{dict.story.titleHl}</span>
          </h2>
          <div className="flex flex-col gap-4 text-lg">
            {dict.story.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Gyűjtemény előnézet ——— */}
      <section className="section">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="eyebrow !mb-2">{dict.preview.eyebrow}</p>
              <h2 className="text-4xl">{dict.preview.title}</h2>
            </div>
            <Link
              href={collectionPath(locale)}
              className="btn btn-ghost no-underline"
            >
              {dict.preview.all}
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((a) => (
              <Link
                key={a.slug}
                href={collectionPath(locale, a.slug)}
                className="card"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="checkbox mt-1">✓</span>
                  <h3 className="text-lg">{a.title}</h3>
                </div>
                <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                  {a.description}
                </p>
                <p className="flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— PDF letöltés ——— */}
      <section className="section" id="letoltes">
        <div className="wrap">
          <div
            className="card !p-10 md:!p-14 text-center"
            style={{ background: "var(--ink)", borderColor: "var(--ink)" }}
          >
            <p className="eyebrow" style={{ color: "var(--marker)" }}>
              {dict.pdf.eyebrow}
            </p>
            <h2 className="text-4xl mb-4" style={{ color: "var(--paper)" }}>
              {dict.pdf.title}
            </h2>
            <p
              className="max-w-xl mx-auto mb-8 text-lg"
              style={{ color: "#b8bfc9" }}
            >
              {dict.pdf.sub}
            </p>
            <a
              href={dict.pdf.file}
              download
              className="btn btn-marker no-underline"
            >
              {dict.pdf.button}
            </a>
          </div>
        </div>
      </section>

      {/* ——— Hírlevél ——— */}
      <section className="section" id="hirlevel">
        <div className="wrap max-w-2xl">
          <p className="eyebrow">{dict.newsletterSection.eyebrow}</p>
          <h2 className="text-4xl mb-4">
            {dict.newsletterSection.titlePre}
            <span className="hl">{dict.newsletterSection.titleHl}</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--muted)" }}>
            {dict.newsletterSection.sub}
          </p>
          <SubscribeForm
            locale={locale}
            placeholder={dict.subscribe.placeholder}
            submit={dict.subscribe.submit}
            saving={dict.subscribe.saving}
            emailLabel={dict.subscribe.emailLabel}
          />
        </div>
      </section>
    </>
  );
}
