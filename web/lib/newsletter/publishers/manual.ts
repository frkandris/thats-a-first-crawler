import type { Publisher, PublishResult } from "./types";
import type { RenderedIssue } from "../render";

/**
 * Kézi kézbesítés: nem küld semmit, csak visszaigazolja, hogy az exportált
 * HTML készen áll. Substack esetén a menet: admin → export → a HTML-t
 * beilleszteni a Substack szerkesztőjébe, és ott időzíteni a küldést.
 */
export const manualPublisher: Publisher = {
  name: "manual",
  async publish(issue: RenderedIssue): Promise<PublishResult> {
    return {
      ok: true,
      message: `A(z) "${issue.subject}" szám exportálva — illeszd be a választott platform szerkesztőjébe, és időzítsd ${issue.sendDate.toISOString().slice(0, 10)}-re.`,
    };
  },
};
