import type { Activity, Discovery, NewsletterIssue } from "../types";
import {
  firstWednesdayOfMonth,
  lastWednesdayOfMonth,
  daysUntil,
  formatDate,
  monthName,
} from "../dates";
import { SITE_URL } from "../messages";
import { collectionPath, type Locale } from "../i18n/config";

// Egyszerű, e-mail-kliens-barát HTML: inline stílusok, keskeny hasáb,
// a digest minimalista elveivel (nincs harsány fejléc, kis képek, számozás).
// A szám nyelve az issue.locale — a magyar és az angol levél külön készül.

const STRINGS: Record<
  Locale,
  {
    subject: (year: number, month0: number) => string;
    countdown: (targetDate: string, weeks: number) => string;
    storiesHeader: string;
    ideasHeader: string;
    seeIt: (platform: Discovery["platform"]) => string;
    footer: string;
  }
> = {
  hu: {
    subject: (year, month0) =>
      `[that's a first] ${year}. ${monthName(month0, "hu")} — mit csinálsz először?`,
    countdown: (targetDate, weeks) =>
      `Ha a hónap utolsó szerdáján — <strong>${targetDate}</strong> — akarsz valamit életedben először csinálni, még pontosan <strong>${weeks} heted</strong> van megszervezni. Bőven elég.`,
    storiesHeader: "Ezt csinálták az emberek",
    ideasHeader: "Inspiráció az utolsó szerdádra",
    seeIt: (platform) =>
      platform === "Instagram" ? "Megnézem Instán →" : "Megnézem TikTokon →",
    footer:
      "Ezt a levelet azért kapod, mert feliratkoztál a that&rsquo;s a first hírlevelére.",
  },
  en: {
    subject: (year, month0) =>
      `[that's a first] ${monthName(month0, "en")} ${year} — what will you do first?`,
    countdown: (targetDate, weeks) =>
      `If you want to do something for the first time on the last Wednesday of the month — <strong>${targetDate}</strong> — you have exactly <strong>${weeks} weeks</strong> to get it organized. Plenty.`,
    storiesHeader: "What people did",
    ideasHeader: "Inspiration for your last Wednesday",
    seeIt: (platform) =>
      platform === "Instagram" ? "See it on Instagram →" : "See it on TikTok →",
    footer:
      "You're getting this because you subscribed to the that&rsquo;s a first newsletter.",
  },
};

export type RenderedIssue = {
  subject: string;
  html: string;
  sendDate: Date; // a hónap első szerdája
  targetDate: Date; // a hónap utolsó szerdája
  weeks: number;
};

export function renderIssue(
  issue: NewsletterIssue,
  activities: Activity[],
  discoveries: Discovery[]
): RenderedIssue {
  const locale = issue.locale;
  const t = STRINGS[locale];

  const [year, month] = issue.month.split("-").map(Number);
  const month0 = month - 1;
  const sendDate = firstWednesdayOfMonth(year, month0);
  const targetDate = lastWednesdayOfMonth(year, month0);
  const weeks = Math.floor(daysUntil(targetDate, sendDate) / 7);

  const subject = issue.subject || t.subject(year, month0);

  // Attribútum-biztos escape (idézőjelekkel együtt) — a discovery-mezők a
  // crawlertől jövő külső adatok.
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // href-be csak http(s) URL kerülhet; minden mást (pl. javascript:) eldobunk.
  const safeUrl = (u: string) => (/^https?:\/\//i.test(u.trim()) ? u.trim() : "#");

  const p = (s: string) =>
    `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#1b2430;">${s}</p>`;

  // Angol számban az angol címkét használjuk; ha a crawler (még) nem adott
  // ilyet, a magyar címke jobb, mint a semmi — az admin úgyis kurálja a listát.
  const labelFor = (d: Discovery) =>
    locale === "en" && d.activity_label_en
      ? d.activity_label_en
      : d.activity_label;

  const storiesHtml = discoveries
    .map(
      (d, i) => `
    <tr><td style="padding:0 0 18px 0;">
      ${p(`<strong>${i + 1}. ${esc(labelFor(d))}</strong>`)}
      ${p(esc(shorten(d.text, 180)))}
      ${p(`<a href="${esc(safeUrl(d.url))}" style="color:#2743d6;">${t.seeIt(d.platform)}</a>`)}
    </td></tr>`
    )
    .join("");

  const ideasHtml = activities
    .map(
      (a) => `
    <tr><td style="padding:0 0 14px 0;">
      ${p(
        `☐ <a href="${SITE_URL}${collectionPath(locale, a.slug)}" style="color:#2743d6;font-weight:bold;">${esc(
          a.title
        )}</a><br>${esc(a.description)}`
      )}
    </td></tr>`
    )
    .join("");

  const sectionHeader = (label: string) =>
    `<p style="margin:0 0 14px 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#626c78;">${label}</p>`;

  const html = `<!doctype html>
<html lang="${locale}">
<body style="margin:0;padding:24px;background:#f7f7f3;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 0 24px 0;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#1b2430;">
            that&rsquo;s a <span style="background:#ffd84d;padding:0 4px;">first</span>
          </p>
        </td></tr>

        <tr><td style="padding:0 0 20px 0;">
          ${issue.intro ? issue.intro.split(/\n{2,}/).map((s) => p(esc(s))).join("") : ""}
          ${p(t.countdown(formatDate(targetDate, locale), weeks))}
        </td></tr>

        ${
          discoveries.length > 0
            ? `<tr><td style="padding:0 0 8px 0;">${sectionHeader(t.storiesHeader)}</td></tr>${storiesHtml}`
            : ""
        }

        ${
          activities.length > 0
            ? `<tr><td style="padding:10px 0 8px 0;">${sectionHeader(t.ideasHeader)}</td></tr>${ideasHtml}`
            : ""
        }

        <tr><td style="padding:18px 0 0 0;border-top:1px solid #e0dfd6;">
          <p style="margin:0;font-size:12px;color:#626c78;line-height:1.6;">
            ${t.footer}<br>
            <a href="${SITE_URL}" style="color:#2743d6;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, sendDate, targetDate, weeks };
}

function shorten(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
