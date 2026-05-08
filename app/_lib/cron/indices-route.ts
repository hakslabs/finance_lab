import { isAuthorizedCronRequest, unauthorizedCronResponse } from "@/app/_lib/auth/cron";
import type { IndicesSupabaseClient } from "@/app/_lib/cron/indices";
import { ingestIndices } from "@/app/_lib/cron/indices";
import type { CronRunSupabaseClient } from "@/app/_lib/cron/run";
import { runLoggedCronTask } from "@/app/_lib/cron/run";
import { getServerEnv } from "@/app/_lib/env/server";
import { createMixedIndexProvider, type IndexProviderAdapter } from "@/app/_lib/providers/indices";
import { createAdminSupabaseClient } from "@/app/_lib/supabase/admin";

const jobName = "indices";
const mixedIndexDailyLimit = 10_000;

type IndicesCronSupabaseClient = CronRunSupabaseClient & IndicesSupabaseClient;

type IndicesCronRouteDependencies = {
  isAuthorizedRequest?: (request: Request) => boolean;
  unauthorizedResponse?: () => Response;
  createAdminClient?: () => IndicesCronSupabaseClient;
  indexProvider?: IndexProviderAdapter;
  day?: () => string;
  dailyLimit?: number;
};

export function createIndicesCronRoute(dependencies: IndicesCronRouteDependencies = {}) {
  return async function GET(request: Request): Promise<Response> {
    const isAuthorized = dependencies.isAuthorizedRequest ?? isAuthorizedCronRequest;

    if (!isAuthorized(request)) {
      return (dependencies.unauthorizedResponse ?? unauthorizedCronResponse)();
    }

    const supabase = (dependencies.createAdminClient ?? createAdminSupabaseClient)() as IndicesCronSupabaseClient;
    const result = await runLoggedCronTask(jobName, supabase, async () => {
      const indexProvider = dependencies.indexProvider ?? createDefaultIndexProvider();

      return ingestIndices({
        supabase,
        indexProvider,
        day: (dependencies.day ?? kstDay)(),
        dailyLimit: dependencies.dailyLimit ?? mixedIndexDailyLimit
      });
    });

    return Response.json(result, { status: result.ok ? 200 : 500 });
  };
}

function createDefaultIndexProvider(): IndexProviderAdapter {
  const env = getServerEnv();
  return createMixedIndexProvider({
    finnhubApiKey: env.FINNHUB_API_KEY,
    krxApiKey: env.KRX_API_KEY
  });
}

function kstDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
