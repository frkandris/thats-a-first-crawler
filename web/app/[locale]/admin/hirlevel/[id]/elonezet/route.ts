import { NextRequest } from "next/server";
import { getActivitiesByIds, getDiscoveriesByIds, getIssue } from "@/lib/queries";
import { renderIssue } from "@/lib/newsletter/render";

// A kész hírlevél HTML-je: böngészős előnézethez, ?letoltes=1 esetén fájlként.
// A tartalom nyelvét a szám (issue) saját locale mezője adja.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const issue = getIssue(Number(id));
  if (!issue) {
    return new Response("Nincs ilyen hírlevél-szám.", { status: 404 });
  }

  const rendered = renderIssue(
    issue,
    getActivitiesByIds(issue.activity_ids, issue.locale),
    getDiscoveriesByIds(issue.discovery_ids)
  );

  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
  };
  if (request.nextUrl.searchParams.get("letoltes") === "1") {
    headers["Content-Disposition"] =
      `attachment; filename="thats-a-first-${issue.month}-${issue.locale}.html"`;
  }

  return new Response(rendered.html, { headers });
}
