import type { RenderedIssue } from "../render";

/**
 * Publisher-adapter: a kész hírlevelet juttatja el egy platformra.
 *
 * Miért adapter? A Substacknek nincs hivatalos publikus API-ja (2026-07),
 * csak visszafejtett, bármikor eltörhető wrapperek. Ezért a rendszer
 * platformfüggetlen: a levél itt áll össze, a kézbesítés cserélhető réteg.
 *
 * Elérhető adapterek:
 * - manual   — HTML export, kézi beillesztés bármely platform szerkesztőjébe
 *              (Substacknál is ez a hivatalosan támogatott út)
 * - buttondown — valódi API-val rendelkező hírlevél-platform, teljes automatizálás
 */
export type PublishResult = {
  ok: boolean;
  message: string;
  url?: string;
};

export interface Publisher {
  name: string;
  publish(issue: RenderedIssue): Promise<PublishResult>;
}
