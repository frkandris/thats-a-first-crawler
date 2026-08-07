import { getDb } from "./db";
import { DEFAULT_LOCALE, type Locale } from "./i18n/config";
import type {
  Activity,
  Discovery,
  DiscoveryStatus,
  NewsletterIssue,
} from "./types";

// ——— Activities ———
// Az Activity a hívó nyelvén "lokalizált nézet": a title/description/tags a
// kért locale oszlopaiból jön, a category semleges kulcs marad.

function rowToActivity(row: Record<string, unknown>, locale: Locale): Activity {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row[`title_${locale}`] as string,
    description: row[`description_${locale}`] as string,
    category: row.category as string,
    tags: JSON.parse(row[`tags_${locale}`] as string),
    featured: Boolean(row.featured),
  };
}

export function listActivities(
  locale: Locale = DEFAULT_LOCALE,
  filter?: { category?: string; tag?: string }
): Activity[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM activities ORDER BY category, title_${locale}`)
    .all() as Record<string, unknown>[];
  let activities = rows.map((r) => rowToActivity(r, locale));
  if (filter?.category) {
    activities = activities.filter((a) => a.category === filter.category);
  }
  if (filter?.tag) {
    activities = activities.filter((a) => a.tags.includes(filter.tag!));
  }
  return activities;
}

export function getActivity(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Activity | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM activities WHERE slug = ?").get(slug) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToActivity(row, locale) : null;
}

export function getActivitiesByIds(
  ids: number[],
  locale: Locale = DEFAULT_LOCALE
): Activity[] {
  if (ids.length === 0) return [];
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT * FROM activities WHERE id IN (${placeholders})`)
    .all(...ids) as Record<string, unknown>[];
  return rows.map((r) => rowToActivity(r, locale));
}

export function listCategories(): string[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT category FROM activities ORDER BY category")
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

// ——— Discoveries ———

function rowToDiscovery(row: Record<string, unknown>): Discovery {
  return {
    id: row.id as number,
    platform: row.platform as Discovery["platform"],
    url: row.url as string,
    creator: row.creator as string,
    text: row.text as string,
    likes: row.likes as number,
    comments: row.comments as number,
    posted_at: row.posted_at as string,
    image_url: row.image_url as string,
    activity_label: row.activity_label as string,
    activity_label_en: (row.activity_label_en as string) ?? "",
    status: row.status as DiscoveryStatus,
    outreach_message: row.outreach_message as string,
  };
}

export function listDiscoveries(status?: DiscoveryStatus): Discovery[] {
  const db = getDb();
  const rows = (
    status
      ? db
          .prepare(
            "SELECT * FROM discoveries WHERE status = ? ORDER BY posted_at DESC"
          )
          .all(status)
      : db.prepare("SELECT * FROM discoveries ORDER BY posted_at DESC").all()
  ) as Record<string, unknown>[];
  return rows.map(rowToDiscovery);
}

export function getDiscovery(id: number): Discovery | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM discoveries WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToDiscovery(row) : null;
}

export function getDiscoveriesByIds(ids: number[]): Discovery[] {
  if (ids.length === 0) return [];
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT * FROM discoveries WHERE id IN (${placeholders})`)
    .all(...ids) as Record<string, unknown>[];
  return rows.map(rowToDiscovery);
}

export function setDiscoveryStatus(id: number, status: DiscoveryStatus): void {
  getDb()
    .prepare("UPDATE discoveries SET status = ? WHERE id = ?")
    .run(status, id);
}

export function saveOutreachMessage(id: number, message: string): void {
  getDb()
    .prepare("UPDATE discoveries SET outreach_message = ? WHERE id = ?")
    .run(message, id);
}

// ——— Subscribers ———

export function addSubscriber(
  email: string,
  locale: Locale = DEFAULT_LOCALE
): { ok: boolean; error?: string } {
  const db = getDb();
  try {
    // Upsert: ha valaki a másik nyelvű űrlapon iratkozik fel újra, a nyelvét
    // átállítjuk — mindig az utoljára választott nyelven kapja a levelet.
    db.prepare(
      `INSERT INTO subscribers (email, locale) VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE SET locale = excluded.locale`
    ).run(email.trim().toLowerCase(), locale);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function countSubscribers(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS c FROM subscribers")
    .get() as { c: number };
  return row.c;
}

// ——— Newsletter issues ———
// Egy szám = hónap + nyelv; a magyar és az angol levél külön készül.

function rowToIssue(row: Record<string, unknown>): NewsletterIssue {
  return {
    id: row.id as number,
    month: row.month as string,
    locale: row.locale as NewsletterIssue["locale"],
    subject: row.subject as string,
    intro: row.intro as string,
    activity_ids: JSON.parse(row.activity_ids as string),
    discovery_ids: JSON.parse(row.discovery_ids as string),
    status: row.status as NewsletterIssue["status"],
  };
}

export function listIssues(): NewsletterIssue[] {
  const rows = getDb()
    .prepare("SELECT * FROM newsletter_issues ORDER BY month DESC, locale")
    .all() as Record<string, unknown>[];
  return rows.map(rowToIssue);
}

export function getIssue(id: number): NewsletterIssue | null {
  const row = getDb()
    .prepare("SELECT * FROM newsletter_issues WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToIssue(row) : null;
}

export function getOrCreateIssueForMonth(
  month: string,
  locale: Locale = DEFAULT_LOCALE
): NewsletterIssue {
  const db = getDb();
  // Atomikus létrehozás: a (month, locale) unique index garantálja, hogy
  // párhuzamos kérések se hozzanak létre duplikált számot.
  db.prepare(
    `INSERT INTO newsletter_issues (month, locale) VALUES (?, ?)
     ON CONFLICT(month, locale) DO NOTHING`
  ).run(month, locale);
  const row = db
    .prepare("SELECT * FROM newsletter_issues WHERE month = ? AND locale = ?")
    .get(month, locale) as Record<string, unknown>;
  return rowToIssue(row);
}

export function updateIssue(
  id: number,
  fields: Partial<Pick<NewsletterIssue, "subject" | "intro" | "status">> & {
    activity_ids?: number[];
    discovery_ids?: number[];
  }
): void {
  const db = getDb();
  const current = getIssue(id);
  if (!current) return;
  db.prepare(
    `UPDATE newsletter_issues
     SET subject = ?, intro = ?, activity_ids = ?, discovery_ids = ?, status = ?
     WHERE id = ?`
  ).run(
    fields.subject ?? current.subject,
    fields.intro ?? current.intro,
    JSON.stringify(fields.activity_ids ?? current.activity_ids),
    JSON.stringify(fields.discovery_ids ?? current.discovery_ids),
    fields.status ?? current.status,
    id
  );
}
