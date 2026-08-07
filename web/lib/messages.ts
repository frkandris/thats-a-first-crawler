import { collectionPath, type Locale } from "./i18n/config";
import { formatDate, weeksUntilLastWednesday } from "./dates";
import type { Activity, Discovery } from "./types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Outreach üzenet egy felfedezett alkotónak (Instagram/TikTok DM-be, kézi
 * küldésre). A nemzetközi alkotókat jellemzően angolul érdemes megkeresni,
 * a magyarokat magyarul — az adminban mindkettő generálható.
 */
export function outreachMessage(d: Discovery, locale: Locale): string {
  if (locale === "en") {
    // Ha a crawler nem adott angol címkét, semleges fordulatot használunk,
    // nehogy magyar szöveg keveredjen az angol üzenetbe.
    const enLabel = humanizeLabel(d.activity_label_en);
    const activity = d.activity_label_en
      ? enLabel
      : "that first-time experience of yours";
    const platformThere = d.platform === "Instagram" ? "on Instagram" : "on TikTok";
    return `Hi${d.creator ? ` @${d.creator}` : ""}! 👋

We found your post ${platformThere} — ${activity} — and we loved that you went for it!

We run That's a First: a collection and a movement built on things people try for the first time in their lives. We live it ourselves: on the last Wednesday of every month, we do something we've never done before.

We'd love to feature your story on our website, in our monthly newsletter and on our channels (with your name and a link back to you, of course). Would you be up for it?

If yes, just reply with an OK. 🙌`;
  }

  const activity = humanizeLabel(d.activity_label);
  const platformItt = d.platform === "Instagram" ? "Instán" : "TikTokon";
  return `Szia${d.creator ? ` @${d.creator}` : ""}! 👋

Rátaláltunk ${platformItt} a posztodra — ${activity} — és nagyon tetszett, hogy belevágtál!

Mi a That's a First-öt csináljuk: egy gyűjtemény és mozgalom azokról a dolgokról, amiket az emberek életükben először próbálnak ki. Mi magunk is így csináljuk évek óta: minden hónap utolsó szerdáján kipróbálunk valamit, amit még soha.

Szívesen kiraknánk a sztoridat a weboldalunkra, a havi hírlevelünkbe és a csatornáinkra (természetesen névvel és linkkel rád). Benne lennél?

Ha igen, csak írj vissza egy oké-t. 🙌`;
}

/**
 * Baráti meghívó üzenet egy gyűjteménybeli tevékenységhez — a "másold ki és
 * küldd el valakinek, akivel együtt csinálnád" gomb mögötti szöveg.
 */
export function inviteMessage(a: Activity, locale: Locale): string {
  const url = `${SITE_URL}${collectionPath(locale, a.slug)}`;
  const nextDate = formatDate(weeksUntilLastWednesday().target, locale);

  if (locale === "en") {
    return `Hey, I found something: ${a.title.toLowerCase()} — have you ever done that? I never have. 😄

${a.description}

What do you say we try it together? Say, on the last Wednesday of the month — that's ${nextDate}?

${url}`;
  }

  return `Figyelj, találtam valamit: ${a.title.toLowerCase()} — te csináltad már? Én még soha. 😄

${a.description}

Mit szólsz, kipróbáljuk együtt? Mondjuk a hónap utolsó szerdáján — az most ${nextDate}?

${url}`;
}

/**
 * A Claude-tól érkező címkék "Fazekaskorongozás életében először" formájúak;
 * az üzenetben természetesebb a rövid alak.
 */
function humanizeLabel(label: string): string {
  const short = label
    .replace(/,? életében először,?/i, "")
    .replace(/,? for the first time,?/i, "")
    .trim();
  return short ? short.charAt(0).toLowerCase() + short.slice(1) : "az új élményed";
}
