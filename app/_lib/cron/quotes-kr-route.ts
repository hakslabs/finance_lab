import { isAuthorizedCronRequest, unauthorizedCronResponse } from "@/app/_lib/auth/cron";
import type { CronQuoteTargets } from "@/app/_lib/cron/quote-targets";
import { prepareCronQuoteTargets } from "@/app/_lib/cron/quote-targets";
import type { QuotesKrSupabaseClient } from "@/app/_lib/cron/quotes-kr";
import { ingestKrDailyQuotes } from "@/app/_lib/cron/quotes-kr";
import type { CronRunSupabaseClient } from "@/app/_lib/cron/run";
import { runLoggedCronTask } from "@/app/_lib/cron/run";
import { getServerEnv } from "@/app/_lib/env/server";
import { createKrxDailyQuoteProvider } from "@/app/_lib/providers/krx";
import type { DailyQuoteProviderAdapter } from "@/app/_lib/providers/quotes";
import { createAdminSupabaseClient } from "@/app/_lib/supabase/admin";

const jobName = "quotes-kr";
const krxDailyLimit = 10_000;

type QuotesKrCronSupabaseClient = CronRunSupabaseClient & QuotesKrSupabaseClient;

type QuotesKrCronRouteDependencies = {
  isAuthorizedRequest?: (request: Request) => boolean;
  unauthorizedResponse?: () => Response;
  createAdminClient?: () => QuotesKrCronSupabaseClient;
  prepareTargets?: () => Promise<Pick<CronQuoteTargets, "kr">>;
  quoteProvider?: DailyQuoteProviderAdapter;
  day?: () => string;
  dailyLimit?: number;
};

export function createQuotesKrCronRoute(dependencies: QuotesKrCronRouteDependencies = {}) {
  return async function GET(request: Request): Promise<Response> {
    const isAuthorized = dependencies.isAuthorizedRequest ?? isAuthorizedCronRequest;

    if (!isAuthorized(request)) {
      return (dependencies.unauthorizedResponse ?? unauthorizedCronResponse)();
    }

    const supabase = (dependencies.createAdminClient ?? createAdminSupabaseClient)() as QuotesKrCronSupabaseClient;
    const result = await runLoggedCronTask(jobName, supabase, async () => {
      const quoteProvider = dependencies.quoteProvider ?? createKrxDailyQuoteProvider({ apiKey: getServerEnv().KRX_API_KEY });
      const prepared = await (dependencies.prepareTargets ?? prepareCronQuoteTargets)();

      return ingestKrDailyQuotes({
        supabase,
        quoteProvider,
        day: (dependencies.day ?? kstDay)(),
        dailyLimit: dependencies.dailyLimit ?? krxDailyLimit,
        targets: prepared.kr.targets
      });
    });

    return Response.json(result, { status: result.ok ? 200 : 500 });
  };
}

function kstDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
