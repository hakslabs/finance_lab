import "server-only";

import type { Database } from "@/app/_lib/supabase/database.types";

type CronLogInsert = Database["public"]["Tables"]["cron_logs"]["Insert"];
type CronLogRow = Database["public"]["Tables"]["cron_logs"]["Row"];
type CronLogUpdate = Database["public"]["Tables"]["cron_logs"]["Update"];

type SupabaseErrorLike = { message: string };
type SupabaseSingleResponse<Row> = { data: Row | null; error: SupabaseErrorLike | null };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };

type CronLogInsertBuilder = {
  select(columns: "id"): {
    single(): Promise<SupabaseSingleResponse<Pick<CronLogRow, "id">>>;
  };
};

type CronLogUpdateBuilder = {
  eq(column: "id", value: string): Promise<SupabaseMutationResponse>;
};

type CronLogsTable = {
  insert(values: CronLogInsert): CronLogInsertBuilder;
  update(values: CronLogUpdate): CronLogUpdateBuilder;
};

export type CronRunSupabaseClient = {
  from(table: "cron_logs"): CronLogsTable;
};

export type CronRunSuccess<Result> = {
  ok: true;
  job: string;
  logId: string;
  result: Result;
};

export type CronRunFailure = {
  ok: false;
  job: string;
  logId: string | null;
  error: string;
};

export type CronRunResult<Result> = CronRunSuccess<Result> | CronRunFailure;

export async function runLoggedCronTask<Result>(
  job: string,
  supabase: CronRunSupabaseClient,
  task: () => Promise<Result>
): Promise<CronRunResult<Result>> {
  let logId: string | null = null;

  const started = await supabase.from("cron_logs").insert({ job, status: "running" }).select("id").single();

  if (started.error) {
    return { ok: false, job, logId, error: `failed to start cron log: ${started.error.message}` };
  }

  if (!started.data) {
    return { ok: false, job, logId, error: "failed to start cron log: missing inserted row" };
  }

  logId = started.data.id;

  try {
    const result = await task();
    const finished = await supabase
      .from("cron_logs")
      .update({ status: "ok", finished_at: new Date().toISOString(), err: null })
      .eq("id", logId);

    if (finished.error) {
      return { ok: false, job, logId, error: `failed to finish cron log: ${finished.error.message}` };
    }

    return { ok: true, job, logId, result };
  } catch (error) {
    const message = errorMessage(error);
    const finished = await supabase
      .from("cron_logs")
      .update({ status: "failed", finished_at: new Date().toISOString(), err: message })
      .eq("id", logId);

    if (finished.error) {
      return { ok: false, job, logId, error: `${message}; failed to record cron failure: ${finished.error.message}` };
    }

    return { ok: false, job, logId, error: message };
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
