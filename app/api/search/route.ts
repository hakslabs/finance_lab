import { searchSecurities } from "@/app/_lib/data/securities";
import { searchRouteQuerySchema } from "./schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const parsed = searchRouteQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!parsed.success) {
    return Response.json({ error: "invalid search parameters" }, { status: 400 });
  }

  const results = await searchSecurities(parsed.data.q, parsed.data.limit);

  return Response.json({ results });
}
