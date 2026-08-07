import type { Publisher, PublishResult } from "./types";
import type { RenderedIssue } from "../render";

/**
 * Buttondown adapter — teljes automatizáláshoz. A Buttondownnak valódi,
 * dokumentált API-ja van (a Substacknek nincs), így távolról összerakható
 * ÉS kiküldhető a levél.
 *
 * Használat: BUTTONDOWN_API_KEY env változó, majd publish(). A levél
 * piszkozatként jön létre ("draft"), a kiküldés a felületről vagy egy
 * második API-hívással (status: "about_to_send") indítható.
 */
export const buttondownPublisher: Publisher = {
  name: "buttondown",
  async publish(issue: RenderedIssue): Promise<PublishResult> {
    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        message:
          "Hiányzik a BUTTONDOWN_API_KEY környezeti változó — állítsd be, vagy használd a kézi exportot.",
      };
    }

    const res = await fetch("https://api.buttondown.com/v1/emails", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: issue.subject,
        body: issue.html,
        status: "draft",
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return {
        ok: false,
        message: `Buttondown hiba (${res.status}): ${detail.slice(0, 300)}`,
      };
    }

    const data = (await res.json()) as { id?: string };
    return {
      ok: true,
      message: `Piszkozat létrehozva a Buttondownon (id: ${data.id ?? "?"}). Időzítsd ${issue.sendDate.toISOString().slice(0, 10)}-re a felületen.`,
    };
  },
};
