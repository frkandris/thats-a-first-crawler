"use client";

import { useActionState } from "react";
import { subscribeAction, type SubscribeState } from "@/app/[locale]/actions";
import type { Locale } from "@/lib/i18n/config";

const initialState: SubscribeState = { status: "idle", message: "" };

export default function SubscribeForm({
  locale,
  placeholder,
  submit,
  saving,
  emailLabel,
}: {
  locale: Locale;
  placeholder: string;
  submit: string;
  saving: string;
  emailLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    initialState
  );

  if (state.status === "success") {
    return (
      <p className="flex items-center gap-3 text-lg font-semibold">
        <span className="checkbox checked">✓</span>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-wrap gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder={placeholder}
          className="input flex-1"
          aria-label={emailLabel}
        />
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? saving : submit}
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm font-semibold" style={{ color: "#b3261e" }}>
          {state.message}
        </p>
      )}
    </form>
  );
}
