"use server";

import { revalidatePath } from "next/cache";
import {
  getDiscovery,
  saveOutreachMessage,
  setDiscoveryStatus,
  getIssue,
  updateIssue,
} from "@/lib/queries";
import { outreachMessage } from "@/lib/messages";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import type { DiscoveryStatus } from "@/lib/types";

// Az admin oldalak locale-prefixes útvonalakon élnek (/hu/admin, /en/admin),
// ezért az érvénytelenítés durva szemcséjű: a teljes fát frissítjük.
function revalidateAdmin() {
  revalidatePath("/", "layout");
}

function localeFrom(formData: FormData): Locale {
  const raw = String(formData.get("lang") ?? "");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

// ——— Felfedezések ———

export async function setStatusAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as DiscoveryStatus;
  setDiscoveryStatus(id, status);
  revalidateAdmin();
}

export async function generateOutreachAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const discovery = getDiscovery(id);
  if (!discovery) return;
  saveOutreachMessage(id, outreachMessage(discovery, localeFrom(formData)));
  revalidateAdmin();
}

// ——— Hírlevél ———

export async function toggleIssueItemAction(formData: FormData) {
  const issueId = Number(formData.get("issueId"));
  const kind = String(formData.get("kind")); // "activity" | "discovery"
  const itemId = Number(formData.get("itemId"));
  const issue = getIssue(issueId);
  if (!issue) return;

  const key = kind === "activity" ? "activity_ids" : "discovery_ids";
  const current = issue[key];
  const next = current.includes(itemId)
    ? current.filter((i) => i !== itemId)
    : [...current, itemId];
  updateIssue(issueId, { [key]: next });
  revalidateAdmin();
}

export async function saveIssueTextAction(formData: FormData) {
  const issueId = Number(formData.get("issueId"));
  updateIssue(issueId, {
    subject: String(formData.get("subject") ?? ""),
    intro: String(formData.get("intro") ?? ""),
  });
  revalidateAdmin();
}

export async function markExportedAction(formData: FormData) {
  const issueId = Number(formData.get("issueId"));
  updateIssue(issueId, { status: "exported" });
  revalidateAdmin();
}
