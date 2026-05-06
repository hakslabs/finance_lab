import "server-only";

import { getDefaultQuoteTargets, type QuoteTarget, type QuoteTargetOptions } from "@/app/_lib/data/securities";

export type CronQuoteTargetSet = {
  market: "us" | "kr";
  targets: QuoteTarget[];
  count: number;
};

export type CronQuoteTargets = {
  us: CronQuoteTargetSet;
  kr: CronQuoteTargetSet;
  totalCount: number;
};

export async function prepareCronQuoteTargets(options: QuoteTargetOptions = {}): Promise<CronQuoteTargets> {
  const targets = await getDefaultQuoteTargets(options);

  return {
    us: { market: "us", targets: targets.us, count: targets.us.length },
    kr: { market: "kr", targets: targets.kr, count: targets.kr.length },
    totalCount: targets.us.length + targets.kr.length
  };
}
