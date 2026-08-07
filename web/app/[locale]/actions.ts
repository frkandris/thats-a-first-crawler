"use server";

import { addSubscriber } from "@/lib/queries";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: dict.subscribe.invalid };
  }
  const result = addSubscriber(email, locale);
  if (!result.ok) {
    return { status: "error", message: dict.subscribe.saveError };
  }
  return { status: "success", message: dict.subscribe.success };
}
