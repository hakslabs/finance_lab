import { createQuotesKrCronRoute } from "@/app/_lib/cron/quotes-kr-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createQuotesKrCronRoute();
