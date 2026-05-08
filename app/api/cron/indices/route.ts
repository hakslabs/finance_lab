import { createIndicesCronRoute } from "@/app/_lib/cron/indices-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createIndicesCronRoute();
