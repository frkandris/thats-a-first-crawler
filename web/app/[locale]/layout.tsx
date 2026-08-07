import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import {
  LOCALES,
  isLocale,
  homePath,
  collectionPath,
  adminPath,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "../globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.meta.title, description: dict.meta.description };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b" style={{ borderColor: "var(--line)" }}>
          <div className="wrap flex items-center justify-between gap-4 py-4">
            <Link
              href={homePath(locale)}
              className="display text-xl font-bold no-underline hover:no-underline"
              style={{ color: "var(--ink)" }}
            >
              that&rsquo;s a <span className="hl">first</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-semibold">
              <Link href={collectionPath(locale)} style={{ color: "var(--ink)" }}>
                {dict.nav.collection}
              </Link>
              <Link href={`${homePath(locale)}#sztori`} style={{ color: "var(--ink)" }}>
                {dict.nav.story}
              </Link>
              <Link
                href={`${homePath(locale)}#hirlevel`}
                className="btn btn-marker !py-1.5 !px-4 !text-sm no-underline"
              >
                {dict.nav.newsletter}
              </Link>
              <Suspense fallback={null}>
                <LocaleSwitcher current={locale} />
              </Suspense>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t mt-20" style={{ borderColor: "var(--line)" }}>
          <div
            className="wrap flex flex-wrap items-center justify-between gap-4 py-8 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <p>{dict.footer.tagline}</p>
            <p className="flex gap-4">
              <Link href={collectionPath(locale)}>{dict.footer.collection}</Link>
              <Link href={adminPath(locale)}>{dict.footer.admin}</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
