import { searchSecurities } from "@/app/_lib/data/securities";
import { searchMasters } from "@/app/_lib/masters/masters-data";
import { searchReports } from "@/app/_lib/reports/reports-data";
import { searchRouteQuerySchema } from "./schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const parsed = searchRouteQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!parsed.success) {
    return Response.json({ error: "invalid search parameters" }, { status: 400 });
  }

  const [results, masters, reports] = await Promise.all([
    searchSecurities(parsed.data.q, parsed.data.limit),
    searchMasters(parsed.data.q, parsed.data.limit),
    searchReports(parsed.data.q, parsed.data.limit),
  ]);

  return Response.json({ results, masters, reports });
}
