import { isAuthorizedCronRequest, unauthorizedCronResponse } from "@/app/_lib/auth/cron";
import type { CronQuoteTargets } from "@/app/_lib/cron/quote-targets";
import { prepareCronQuoteTargets } from "@/app/_lib/cron/quote-targets";
import type { QuotesUsSupabaseClient } from "@/app/_lib/cron/quotes-us";
import { ingestUsQuotes } from "@/app/_lib/cron/quotes-us";
import type { CronRunSupabaseClient } from "@/app/_lib/cron/run";
import { runLoggedCronTask } from "@/app/_lib/cron/run";
import { getServerEnv } from "@/app/_lib/env/server";
import { createFinnhubQuoteProvider } from "@/app/_lib/providers/finnhub";
import type { QuoteProviderAdapter } from "@/app/_lib/providers/quotes";
import { createAdminSupabaseClient } from "@/app/_lib/supabase/admin";

const jobName = "quotes-us";
const finnhubFreeDailyLimit = 86_400;

type QuotesUsCronSupabaseClient = CronRunSupabaseClient & QuotesUsSupabaseClient;

type QuotesUsCronRouteDependencies = {
  isAuthorizedRequest?: (request: Request) => boolean;
  unauthorizedResponse?: () => Response;
  createAdminClient?: () => QuotesUsCronSupabaseClient;
  prepareTargets?: () => Promise<Pick<CronQuoteTargets, "us">>;
  quoteProvider?: QuoteProviderAdapter;
  day?: () => string;
  dailyLimit?: number;
};

export function createQuotesUsCronRoute(dependencies: QuotesUsCronRouteDependencies = {}) {
  return async function GET(request: Request): Promise<Response> {
    const isAuthorized = dependencies.isAuthorizedRequest ?? isAuthorizedCronRequest;

    if (!isAuthorized(request)) {
      return (dependencies.unauthorizedResponse ?? unauthorizedCronResponse)();
    }

    const supabase = (dependencies.createAdminClient ?? createAdminSupabaseClient)() as QuotesUsCronSupabaseClient;
    const result = await runLoggedCronTask(jobName, supabase, async () => {
      const quoteProvider = dependencies.quoteProvider ?? createFinnhubQuoteProvider({ apiKey: getServerEnv().FINNHUB_API_KEY });

      const prepared = await (dependencies.prepareTargets ?? prepareCronQuoteTargets)();

      return ingestUsQuotes({
        supabase,
        quoteProvider,
        day: (dependencies.day ?? utcDay)(),
        dailyLimit: dependencies.dailyLimit ?? finnhubFreeDailyLimit,
        targets: prepared.us.targets
      });
    });

    return Response.json(result, { status: result.ok ? 200 : 500 });
  };
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}
