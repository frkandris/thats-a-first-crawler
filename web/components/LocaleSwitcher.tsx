"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, switchLocalePath, type Locale } from "@/lib/i18n/config";

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;
  const search = useSearchParams()?.toString() ?? "";

  return (
    <span className="flex items-center gap-1 text-sm font-semibold" aria-label="Language">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: "var(--line)" }}>/</span>}
          {l === current ? (
            <span aria-current="true">{l.toUpperCase()}</span>
          ) : (
            <Link
              href={switchLocalePath(pathname, l, search)}
              style={{ color: "var(--muted)" }}
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
