import { createQuotesUsCronRoute } from "@/app/_lib/cron/quotes-us-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createQuotesUsCronRoute();
