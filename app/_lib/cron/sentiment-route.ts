import { isAuthorizedCronRequest, unauthorizedCronResponse } from "@/app/_lib/auth/cron";
import { runLoggedCronTask, type CronRunSupabaseClient } from "@/app/_lib/cron/run";
import { ingestSentiment, type SentimentSupabaseClient } from "@/app/_lib/cron/sentiment";
import { getServerEnv } from "@/app/_lib/env/server";
import { createFinnhubSentimentProvider, type SentimentProviderAdapter } from "@/app/_lib/providers/sentiment";
import { createAdminSupabaseClient } from "@/app/_lib/supabase/admin";

const jobName = "sentiment";
const finnhubFreeDailyLimit = 86_400;

type SentimentCronSupabaseClient = CronRunSupabaseClient & SentimentSupabaseClient;

type SentimentCronRouteDependencies = {
  isAuthorizedRequest?: (request: Request) => boolean;
  unauthorizedResponse?: () => Response;
  createAdminClient?: () => SentimentCronSupabaseClient;
  sentimentProvider?: SentimentProviderAdapter;
  day?: () => string;
  dailyLimit?: number;
};

export function createSentimentCronRoute(dependencies: SentimentCronRouteDependencies = {}) {
  return async function GET(request: Request): Promise<Response> {
    const isAuthorized = dependencies.isAuthorizedRequest ?? isAuthorizedCronRequest;

    if (!isAuthorized(request)) {
      return (dependencies.unauthorizedResponse ?? unauthorizedCronResponse)();
    }

    const supabase = (dependencies.createAdminClient ?? createAdminSupabaseClient)() as SentimentCronSupabaseClient;
    const result = await runLoggedCronTask(jobName, supabase, async () => {
      const sentimentProvider = dependencies.sentimentProvider ?? createFinnhubSentimentProvider({ apiKey: getServerEnv().FINNHUB_API_KEY });

      return ingestSentiment({
        supabase,
        sentimentProvider,
        day: (dependencies.day ?? utcDay)(),
        dailyLimit: dependencies.dailyLimit ?? finnhubFreeDailyLimit
      });
    });

    return Response.json(result, { status: result.ok ? 200 : 500 });
  };
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}
