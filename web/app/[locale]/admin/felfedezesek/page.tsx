import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { listDiscoveries } from "@/lib/queries";
import { adminPath, isLocale } from "@/lib/i18n/config";
import { STATUS_LABELS, type DiscoveryStatus } from "@/lib/types";
import { generateOutreachAction, setStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const FILTERS: (DiscoveryStatus | "all")[] = [
  "all",
  "new",
  "selected",
  "contacted",
  "featured",
  "skipped",
];

export default async function FelfedezesekPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ statusz?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { statusz } = await searchParams;
  const filter = (statusz ?? "all") as DiscoveryStatus | "all";
  const discoveries = listDiscoveries(filter === "all" ? undefined : filter);
  const base = adminPath(locale, "/felfedezesek");

  return (
    <div>
      <h1 className="text-3xl mb-2">Felfedezések</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
        A crawler által talált posztok. Jelöld ki, akit ma megkeresünk,
        generálj hozzá üzenetet (magyarul vagy angolul), és másold ki — a
        küldés egyelőre kézzel megy az adott platformon.
      </p>

      <nav className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? base : `${base}?statusz=${f}`}
            className={`chip no-underline ${filter === f ? "active" : ""}`}
          >
            {f === "all" ? "mind" : STATUS_LABELS[f]}
          </Link>
        ))}
      </nav>

      {discoveries.length === 0 && (
        <p style={{ color: "var(--muted)" }}>Nincs találat ezzel a szűrővel.</p>
      )}

      <div className="flex flex-col gap-5">
        {discoveries.map((d) => (
          <div key={d.id} className="card">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="tag" style={{ borderColor: "var(--ink)" }}>
                {d.platform}
              </span>
              <span className="font-bold">@{d.creator}</span>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {d.posted_at} · ❤ {d.likes.toLocaleString("hu-HU")} · 💬 {d.comments}
              </span>
              <span className="tag ml-auto">{STATUS_LABELS[d.status]}</span>
            </div>

            <p className="font-semibold mb-1">{d.activity_label}</p>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              {d.text}
            </p>
            <p className="text-sm mb-4">
              <a href={d.url} target="_blank" rel="noopener noreferrer">
                Poszt megnyitása ↗
              </a>
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(STATUS_LABELS) as DiscoveryStatus[])
                .filter((s) => s !== d.status)
                .map((s) => (
                  <form key={s} action={setStatusAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="status" value={s} />
                    <button type="submit" className="chip cursor-pointer">
                      → {STATUS_LABELS[s]}
                    </button>
                  </form>
                ))}
            </div>

            {d.outreach_message ? (
              <div>
                <p className="eyebrow !mb-2">Outreach üzenet</p>
                <div className="message-box mb-3">{d.outreach_message}</div>
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={d.outreach_message} label="Üzenet másolása" />
                  <form action={generateOutreachAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="lang" value="hu" />
                    <button type="submit" className="btn btn-ghost">
                      Újragenerálás (HU)
                    </button>
                  </form>
                  <form action={generateOutreachAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="lang" value="en" />
                    <button type="submit" className="btn btn-ghost">
                      Újragenerálás (EN)
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <form action={generateOutreachAction}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="lang" value="hu" />
                  <button type="submit" className="btn btn-primary">
                    Üzenet generálása (HU)
                  </button>
                </form>
                <form action={generateOutreachAction}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="lang" value="en" />
                  <button type="submit" className="btn btn-ghost">
                    Üzenet generálása (EN)
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
