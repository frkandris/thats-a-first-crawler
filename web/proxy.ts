import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n/config";

// Locale-prefix nélküli kérések átirányítása a böngésző nyelve szerint
// (/gyujtemeny → /hu/gyujtemeny, / → /en, stb.).
function detectLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase().slice(0, 2);
    if ((LOCALES as readonly string[]).includes(code)) return code as Locale;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  request.nextUrl.pathname = `/${detectLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Kihagyjuk a belső útvonalakat és a statikus fájlokat (bármi, amiben pont van).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
