import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { seedActivities } from "./seed-data/activities";
import { seedDiscoveries } from "./seed-data/discoveries";

// Egyetlen megosztott kapcsolat; a globalThis-en tároljuk, hogy a Next dev
// hot reload ne nyisson minden módosításnál új kapcsolatot.
const globalForDb = globalThis as unknown as { __tafDb?: DatabaseSync };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title_hu TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_hu TEXT NOT NULL,
  description_en TEXT NOT NULL,
  tags_hu TEXT NOT NULL DEFAULT '[]',
  tags_en TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS discoveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  creator TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  posted_at TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  activity_label TEXT NOT NULL DEFAULT '',
  activity_label_en TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','selected','contacted','featured','skipped')),
  outreach_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'hu',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS newsletter_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'hu',
  subject TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  activity_ids TEXT NOT NULL DEFAULT '[]',
  discovery_ids TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','exported')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Egy szám = hónap + nyelv; indexként érvényesítjük, mert meglévő táblához
-- SQLite-ban utólag nem adható táblaszintű UNIQUE constraint.
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_issues_month_locale
  ON newsletter_issues (month, locale);
`;

function hasColumn(db: DatabaseSync, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  return rows.some((r) => r.name === column);
}

function tableExists(db: DatabaseSync, table: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(table);
  return Boolean(row);
}

// Egyszerű dev-migráció: az egynyelvű activities táblát eldobjuk és újraseedeljük
// (kurált seed-adat, nincs benne kézi módosítás); a többi táblához oszlopot adunk.
function migrate(db: DatabaseSync) {
  if (tableExists(db, "activities") && !hasColumn(db, "activities", "title_hu")) {
    db.exec("DROP TABLE activities;");
  }
  if (
    tableExists(db, "discoveries") &&
    !hasColumn(db, "discoveries", "activity_label_en")
  ) {
    db.exec(
      "ALTER TABLE discoveries ADD COLUMN activity_label_en TEXT NOT NULL DEFAULT '';"
    );
  }
  if (tableExists(db, "subscribers") && !hasColumn(db, "subscribers", "locale")) {
    db.exec("ALTER TABLE subscribers ADD COLUMN locale TEXT NOT NULL DEFAULT 'hu';");
  }
  if (
    tableExists(db, "newsletter_issues") &&
    !hasColumn(db, "newsletter_issues", "locale")
  ) {
    db.exec(
      "ALTER TABLE newsletter_issues ADD COLUMN locale TEXT NOT NULL DEFAULT 'hu';"
    );
  }
  if (tableExists(db, "newsletter_issues")) {
    // Ha egy régi adatbázisban duplikált (month, locale) sorok maradtak,
    // a unique index létrehozása elhasalna — a legrégebbit tartjuk meg.
    db.exec(
      `DELETE FROM newsletter_issues WHERE id NOT IN
         (SELECT MIN(id) FROM newsletter_issues GROUP BY month, locale);`
    );
  }
}

function seed(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM activities").get() as {
    c: number;
  };
  if (count.c === 0) {
    const insert = db.prepare(
      `INSERT INTO activities
        (slug, category, title_hu, title_en, description_hu, description_en, tags_hu, tags_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const a of seedActivities) {
      insert.run(
        a.slug,
        a.category,
        a.hu.title,
        a.en.title,
        a.hu.description,
        a.en.description,
        JSON.stringify(a.hu.tags),
        JSON.stringify(a.en.tags)
      );
    }
  }

  const dCount = db.prepare("SELECT COUNT(*) AS c FROM discoveries").get() as {
    c: number;
  };
  if (dCount.c === 0) {
    const insert = db.prepare(
      `INSERT INTO discoveries
        (platform, url, creator, text, likes, comments, posted_at, image_url, activity_label, activity_label_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const d of seedDiscoveries) {
      insert.run(
        d.platform,
        d.url,
        d.creator,
        d.text,
        d.likes,
        d.comments,
        d.posted_at,
        d.image_url,
        d.activity_label,
        d.activity_label_en
      );
    }
  }
}

export function getDb(): DatabaseSync {
  if (globalForDb.__tafDb) return globalForDb.__tafDb;

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "app.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  migrate(db);
  db.exec(SCHEMA);
  seed(db);

  globalForDb.__tafDb = db;
  return db;
}
