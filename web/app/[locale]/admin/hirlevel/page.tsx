import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActivitiesByIds,
  getDiscoveriesByIds,
  getOrCreateIssueForMonth,
  listActivities,
  listDiscoveries,
} from "@/lib/queries";
import { renderIssue } from "@/lib/newsletter/render";
import { formatHu, monthKey, monthName } from "@/lib/dates";
import { adminPath, isLocale, type Locale } from "@/lib/i18n/config";
import { STATUS_LABELS } from "@/lib/types";
import { markExportedAction, saveIssueTextAction, toggleIssueItemAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function HirlevelPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ honap?: string; nyelv?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.honap ?? "")
    ? sp.honap!
    : monthKey();
  const issueLocale: Locale = isLocale(sp.nyelv ?? "") ? (sp.nyelv as Locale) : "hu";

  const issue = getOrCreateIssueForMonth(month, issueLocale);
  const base = adminPath(locale, "/hirlevel");
  const previewPath = adminPath(locale, `/hirlevel/${issue.id}/elonezet`);

  const allDiscoveries = listDiscoveries();
  // Az inspirációs lista és az előnézet a levél nyelvén jelenik meg.
  const allActivities = listActivities(issueLocale);
  const pickedActivities = getActivitiesByIds(issue.activity_ids, issueLocale);
  const pickedDiscoveries = getDiscoveriesByIds(issue.discovery_ids);
  const rendered = renderIssue(issue, pickedActivities, pickedDiscoveries);

  const [y, m] = month.split("-").map(Number);
  const prev = shiftMonth(y, m, -1);
  const next = shiftMonth(y, m, +1);
  const withQuery = (honap: string, nyelv: Locale) =>
    `${base}?honap=${honap}&nyelv=${nyelv}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl">
          Hírlevél — {y}. {monthName(m - 1, "hu")}
        </h1>
        <span className="tag">{issue.status === "draft" ? "piszkozat" : "exportálva"}</span>
        <nav className="flex gap-2 text-sm font-semibold" aria-label="Nyelv">
          {(["hu", "en"] as const).map((l) => (
            <Link
              key={l}
              href={withQuery(month, l)}
              className={`chip no-underline ${issueLocale === l ? "active" : ""}`}
            >
              {l.toUpperCase()} levél
            </Link>
          ))}
        </nav>
        <nav className="ml-auto flex gap-2 text-sm font-semibold">
          <Link href={withQuery(prev, issueLocale)} className="chip no-underline">
            ← {prev}
          </Link>
          <Link href={withQuery(next, issueLocale)} className="chip no-underline">
            {next} →
          </Link>
        </nav>
      </div>

      <div className="card mb-6 !p-5 text-sm">
        <p>
          Küldés: <strong>{formatHu(rendered.sendDate)}</strong> (a hónap első
          szerdája) · Az élmények határideje:{" "}
          <strong>{formatHu(rendered.targetDate)}</strong> (utolsó szerda) · A
          levélben: <strong>„még {rendered.weeks} hét” ({issueLocale.toUpperCase()} nyelven)</strong>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl mb-3">Szöveg ({issueLocale.toUpperCase()})</h2>
          <form action={saveIssueTextAction} className="card flex flex-col gap-3 !p-5 mb-8">
            <input type="hidden" name="issueId" value={issue.id} />
            <label className="text-sm font-semibold">
              Tárgy
              <input
                type="text"
                name="subject"
                defaultValue={issue.subject}
                placeholder={rendered.subject}
                className="input !rounded-lg mt-1 w-full"
              />
            </label>
            <label className="text-sm font-semibold">
              Bevezető (a levél nyelvén írd — a hetek-visszaszámláló mindig bekerül)
              <textarea
                name="intro"
                defaultValue={issue.intro}
                rows={5}
                className="input !rounded-lg mt-1 w-full"
                placeholder={
                  issueLocale === "hu"
                    ? "Szia! Ez történt a múlt hónapban…"
                    : "Hi! Here's what happened last month…"
                }
              />
            </label>
            <button type="submit" className="btn btn-primary self-start">
              Mentés
            </button>
          </form>

          <h2 className="text-xl mb-3">
            Történetek a felfedezésekből ({issue.discovery_ids.length} kiválasztva)
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
            „Ezt csinálták az emberek” — ideálisan olyanok, akik már
            visszajeleztek (megkeresve/kirakva).
          </p>
          <div className="flex flex-col gap-2 mb-8">
            {allDiscoveries.map((d) => {
              const picked = issue.discovery_ids.includes(d.id);
              return (
                <form key={d.id} action={toggleIssueItemAction}>
                  <input type="hidden" name="issueId" value={issue.id} />
                  <input type="hidden" name="kind" value="discovery" />
                  <input type="hidden" name="itemId" value={d.id} />
                  <button
                    type="submit"
                    className="card w-full !p-3 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <span className={`checkbox ${picked ? "checked" : ""}`}>✓</span>
                    <span className="text-sm">
                      <strong>{d.activity_label}</strong> — @{d.creator} ·{" "}
                      {d.platform} · {STATUS_LABELS[d.status]}
                    </span>
                  </button>
                </form>
              );
            })}
          </div>

          <h2 className="text-xl mb-3">
            Inspiráció a gyűjteményből ({issue.activity_ids.length} kiválasztva)
          </h2>
          <div className="flex flex-col gap-2">
            {allActivities.map((a) => {
              const picked = issue.activity_ids.includes(a.id);
              return (
                <form key={a.id} action={toggleIssueItemAction}>
                  <input type="hidden" name="issueId" value={issue.id} />
                  <input type="hidden" name="kind" value="activity" />
                  <input type="hidden" name="itemId" value={a.id} />
                  <button
                    type="submit"
                    className="card w-full !p-3 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <span className={`checkbox ${picked ? "checked" : ""}`}>✓</span>
                    <span className="text-sm">
                      <strong>{a.title}</strong> · {a.category}
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl mb-3">Kiküldés</h2>
          <div className="card !p-5 mb-6 flex flex-col gap-3 text-sm">
            <p>
              <strong>Tárgy:</strong> {rendered.subject}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={previewPath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary no-underline"
              >
                Előnézet
              </a>
              <a
                href={`${previewPath}?letoltes=1`}
                className="btn btn-ghost no-underline"
              >
                HTML letöltése
              </a>
              <form action={markExportedAction}>
                <input type="hidden" name="issueId" value={issue.id} />
                <button type="submit" className="btn btn-ghost">
                  Exportáltnak jelölöm
                </button>
              </form>
            </div>
            <p style={{ color: "var(--muted)" }}>
              A magyar és az angol levél külön szám (a feliratkozók nyelv
              szerint vannak jelölve). A Substacknek nincs hivatalos API-ja,
              ezért az MVP-ben a menet: HTML letöltése → beillesztés a platform
              szerkesztőjébe → időzítés a hónap első szerdájára. Teljes
              automatizáláshoz a Buttondown adapter kész
              (<code>lib/newsletter/publishers/buttondown.ts</code>), csak
              API-kulcs kell hozzá.
            </p>
          </div>

          <h2 className="text-xl mb-3">Élő előnézet</h2>
          <iframe
            title="Hírlevél előnézet"
            src={previewPath}
            className="w-full rounded-xl border-2"
            style={{ borderColor: "var(--line)", height: "70vh", background: "#fff" }}
          />
        </div>
      </div>
    </div>
  );
}

function shiftMonth(y: number, m: number, delta: number): string {
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
