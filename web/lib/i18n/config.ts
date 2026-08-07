export const LOCALES = ["hu", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "hu";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// ——— Lokalizált útvonalak ———
// A magyar oldalak magyar URL-t kapnak (/hu/gyujtemeny), az angolok angolt
// (/en/collection). A magyar aliasokat a next.config rewrites képezi le a
// belső (angol nevű) route-mappákra.

export function homePath(locale: Locale): string {
  return `/${locale}`;
}

export function collectionPath(locale: Locale, slug?: string): string {
  const base = locale === "hu" ? "/hu/gyujtemeny" : "/en/collection";
  return slug ? `${base}/${slug}` : base;
}

export function adminPath(locale: Locale, sub = ""): string {
  return `/${locale}/admin${sub}`;
}

/** Ugyanaz az oldal a másik nyelven — a nyelvváltóhoz. A query-paramétereket
 *  megőrzi, és a lokalizált kulcsokat (kategoria ↔ category) átnevezi. */
export function switchLocalePath(
  pathname: string,
  target: Locale,
  search = ""
): string {
  const segments = pathname.split("/").filter(Boolean);
  const rest = isLocale(segments[0] ?? "") ? segments.slice(1) : segments;

  // gyujtemeny ↔ collection szegmens-csere
  const mapped = rest.map((s) =>
    s === "gyujtemeny" && target === "en"
      ? "collection"
      : s === "collection" && target === "hu"
        ? "gyujtemeny"
        : s
  );
  const path = `/${[target, ...mapped].join("/")}`;

  const params = new URLSearchParams(search);
  const from = target === "en" ? "kategoria" : "category";
  const to = target === "en" ? "category" : "kategoria";
  const value = params.get(from);
  if (value !== null) {
    params.delete(from);
    params.set(to, value);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
