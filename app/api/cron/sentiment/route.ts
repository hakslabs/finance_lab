import { createSentimentCronRoute } from "@/app/_lib/cron/sentiment-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createSentimentCronRoute();
