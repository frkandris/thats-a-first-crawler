// A mozgalom ritmusa: minden hónap utolsó szerdája.
// A hírlevél a hónap első szerdáján megy ki, és visszaszámol az utolsó szerdáig.

const WEDNESDAY = 3;

export function lastWednesdayOfMonth(year: number, month0: number): Date {
  const d = new Date(year, month0 + 1, 0); // a hónap utolsó napja
  while (d.getDay() !== WEDNESDAY) d.setDate(d.getDate() - 1);
  return d;
}

export function firstWednesdayOfMonth(year: number, month0: number): Date {
  const d = new Date(year, month0, 1);
  while (d.getDay() !== WEDNESDAY) d.setDate(d.getDate() + 1);
  return d;
}

/** A következő "utolsó szerda" a megadott naptól nézve (ha e havi már elmúlt, a jövő havi). */
export function nextLastWednesday(from: Date = new Date()): Date {
  const thisMonth = lastWednesdayOfMonth(from.getFullYear(), from.getMonth());
  if (stripTime(thisMonth) >= stripTime(from)) return thisMonth;
  return lastWednesdayOfMonth(from.getFullYear(), from.getMonth() + 1);
}

export function daysUntil(target: Date, from: Date = new Date()): number {
  const ms = stripTime(target).getTime() - stripTime(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** Hátralévő teljes hetek az utolsó szerdáig — a hírlevél "még ennyi heted van" sora. */
export function weeksUntilLastWednesday(from: Date = new Date()): {
  target: Date;
  days: number;
  weeks: number;
} {
  const target = nextLastWednesday(from);
  const days = daysUntil(target, from);
  return { target, days, weeks: Math.floor(days / 7) };
}

const MONTHS = {
  hu: [
    "január",
    "február",
    "március",
    "április",
    "május",
    "június",
    "július",
    "augusztus",
    "szeptember",
    "október",
    "november",
    "december",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
} as const;

type DateLocale = keyof typeof MONTHS;

export function formatDate(d: Date, locale: DateLocale): string {
  return locale === "hu"
    ? `${d.getFullYear()}. ${MONTHS.hu[d.getMonth()]} ${d.getDate()}.`
    : `${MONTHS.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatHu(d: Date): string {
  return formatDate(d, "hu");
}

export function monthName(month0: number, locale: DateLocale): string {
  return MONTHS[locale][month0];
}

/** "2026-07" formátumú hónap-azonosító. */
export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
