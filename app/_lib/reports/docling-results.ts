import "server-only";

import type { Database, Json } from "@/app/_lib/supabase/database.types";

const DOCLING_PROVIDER = "Docling";
const MAX_ERR_LENGTH = 1_000;

type ExternalSourceRunInsert = Database["public"]["Tables"]["external_source_runs"]["Insert"];
type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];
type ReportTableInsert = Database["public"]["Tables"]["reports_tables"]["Insert"];
type CronStatus = Database["public"]["Enums"]["cron_status"];

type SupabaseErrorLike = { message: string };
type SupabaseMutationResponse = { error: SupabaseErrorLike | null };
type SupabaseMutationWithCountResponse = SupabaseMutationResponse & { count: number | null };
type SupabaseMutationWithCountAndDataResponse = SupabaseMutationWithCountResponse & { data: { id: string }[] };
type SupabaseMutationPromise = PromiseLike<SupabaseMutationResponse>;
type SupabaseMutationWithCountAndDataPromise = PromiseLike<SupabaseMutationWithCountAndDataResponse>;

export type DoclingExternalSourceRunsTable = {
  insert(values: ExternalSourceRunInsert): SupabaseMutationPromise;
};

export type DoclingReportsUpdateBuilder = {
  eq(column: "id", value: string): DoclingReportsSelectBuilder;
};

type DoclingReportsSelectBuilder = {
  select(column: "id", options: { count: "exact" }): SupabaseMutationWithCountAndDataPromise;
};

export type DoclingReportsTable = {
  update(values: ReportUpdate): DoclingReportsUpdateBuilder;
};

type DoclingReportTablesDeleteBuilder = {
  eq(column: "report_id", value: string): SupabaseMutationPromise;
};

export type DoclingReportTablesTable = {
  delete(): DoclingReportTablesDeleteBuilder;
  upsert(values: ReportTableInsert[], options: { onConflict: "report_id,idx" }): SupabaseMutationPromise;
};

export type DoclingResultsSupabaseClient = {
  from(table: "external_source_runs"): DoclingExternalSourceRunsTable;
  from(table: "reports"): DoclingReportsTable;
  from(table: "reports_tables"): DoclingReportTablesTable;
};

export type DoclingResultStatus = "success" | "partial_success" | "failure" | "skipped";

export type DoclingWarning = {
  code: string;
  message: string;
  page_no?: number;
};

export type DoclingOrigin = {
  uri: string;
  filename?: string;
  mimetype?: string;
  binary_hash?: string;
  page_count?: number;
};

export type JsonRecord = { [key: string]: Json };

export type DoclingResultTable = {
  index: number;
  caption?: string;
  page_no?: number;
  num_rows: number;
  num_cols: number;
  data: JsonRecord[];
};

export type DoclingResultInput = {
  reportId: string;
  status: DoclingResultStatus;
  markdown?: string;
  tables: DoclingResultTable[];
  warnings: DoclingWarning[];
  origin: DoclingOrigin;
  doclingVersion: string;
  sourceRevision: string;
  licenseNote?: string;
};

export type PersistDoclingResultSummary = {
  reportId: string;
  status: DoclingResultStatus;
  storedMarkdown: boolean;
  storedTableCount: number;
  loggedRun: boolean;
  needsReview: boolean;
};

export async function persistDoclingResult(
  supabase: DoclingResultsSupabaseClient,
  result: DoclingResultInput,
): Promise<PersistDoclingResultSummary> {
  validateResult(result);

  const status = mapRunStatus(result.status);
  const err = buildRunSummary(result);
  const runResponse = await supabase.from("external_source_runs").insert({
    provider: DOCLING_PROVIDER,
    source_url: result.origin.uri,
    source_revision: result.sourceRevision,
    status,
    robots_policy: "Docling worker consumes owner-approved report sources; no scraping or robots bypass",
    license_note: result.licenseNote ?? null,
    err,
    finished_at: new Date().toISOString(),
  });

  if (runResponse.error) {
    throw new Error(`failed to log Docling source run: ${runResponse.error.message}`);
  }

  if (!shouldStoreResult(result.status)) {
    return buildSummary(result, false, 0, true);
  }

  const markdown = result.markdown?.trim();
  if (!markdown) {
    throw new Error("Docling result markdown must be non-empty for success or partial_success");
  }

  const reportResponse = await supabase
    .from("reports")
    .update({ markdown })
    .eq("id", result.reportId)
    .select("id", { count: "exact" });

  if (reportResponse.error) {
    throw new Error(`failed to update reports.markdown for ${result.reportId}: ${reportResponse.error.message}`);
  }

  if (reportResponse.count === 0) {
    throw new Error(`failed to update report markdown: no report found for id ${result.reportId}`);
  }

  const tableDeleteResponse = await supabase.from("reports_tables").delete().eq("report_id", result.reportId);

  if (tableDeleteResponse.error) {
    throw new Error(`failed to clear previous reports_tables for ${result.reportId}: ${tableDeleteResponse.error.message}`);
  }

  if (result.tables.length === 0) {
    return buildSummary(result, true, 0, true);
  }

  const rows = result.tables.map((table): ReportTableInsert => ({
    report_id: result.reportId,
    idx: table.index,
    table_json: serializeTable(table),
  }));
  const tableResponse = await supabase.from("reports_tables").upsert(rows, { onConflict: "report_id,idx" });

  if (tableResponse.error) {
    throw new Error(`failed to upsert reports_tables for ${result.reportId}: ${tableResponse.error.message}`);
  }

  return buildSummary(result, true, rows.length, true);
}

function shouldStoreResult(status: DoclingResultStatus): boolean {
  return status === "success" || status === "partial_success";
}

function mapRunStatus(status: DoclingResultStatus): CronStatus {
  return shouldStoreResult(status) ? "ok" : "failed";
}

function buildSummary(
  result: DoclingResultInput,
  storedMarkdown: boolean,
  storedTableCount: number,
  loggedRun: boolean,
): PersistDoclingResultSummary {
  return {
    reportId: result.reportId,
    status: result.status,
    storedMarkdown,
    storedTableCount,
    loggedRun,
    needsReview: result.status === "partial_success" || result.warnings.length > 0,
  };
}

function validateResult(result: DoclingResultInput): void {
  if (result.reportId.trim().length === 0) {
    throw new Error("Docling result reportId must be non-empty");
  }

  if (!["success", "partial_success", "failure", "skipped"].includes(result.status)) {
    throw new Error(`Docling result status is not supported: ${String(result.status)}`);
  }

  if (result.origin.uri.trim().length === 0) {
    throw new Error("Docling result origin.uri must be non-empty");
  }

  if (result.doclingVersion.trim().length === 0) {
    throw new Error("Docling result doclingVersion must be non-empty");
  }

  if (result.sourceRevision.trim().length === 0) {
    throw new Error("Docling result sourceRevision must be non-empty");
  }

  if (shouldStoreResult(result.status) && !result.markdown?.trim()) {
    throw new Error("Docling result markdown must be non-empty for success or partial_success");
  }

  const indexes = new Set<number>();
  for (const table of result.tables) {
    if (!Number.isInteger(table.index) || table.index < 0) {
      throw new Error(`Docling table index must be a non-negative integer: ${table.index}`);
    }

    if (indexes.has(table.index)) {
      throw new Error(`Docling table index must be unique: ${table.index}`);
    }

    indexes.add(table.index);

    if (!Number.isInteger(table.num_rows) || table.num_rows < 0) {
      throw new Error(`Docling table ${table.index} num_rows must be a non-negative integer`);
    }

    if (!Number.isInteger(table.num_cols) || table.num_cols < 0) {
      throw new Error(`Docling table ${table.index} num_cols must be a non-negative integer`);
    }
  }

  const err = buildRunSummary(result);
  if (err && err.length > MAX_ERR_LENGTH) {
    throw new Error(`Docling warning summary must be compact (${MAX_ERR_LENGTH} characters or fewer)`);
  }
}

function buildRunSummary(result: DoclingResultInput): string | null {
  const parts: string[] = [];

  if (result.status === "failure" || result.status === "skipped") {
    parts.push(`status=${result.status}`);
  }

  if (result.warnings.length > 0) {
    parts.push(
      `warnings=${result.warnings
        .map((warning) => formatWarning(warning))
        .join(" | ")}`,
    );
  }

  if (result.doclingVersion.trim().length > 0) {
    parts.push(`docling=${result.doclingVersion.trim()}`);
  }

  return parts.length === 0 ? null : parts.join("; ");
}

function formatWarning(warning: DoclingWarning): string {
  const page = warning.page_no === undefined ? "" : `@p${warning.page_no}`;
  return `${warning.code}${page}: ${warning.message}`.replace(/\s+/g, " ").trim();
}

function serializeTable(table: DoclingResultTable): Json {
  return {
    index: table.index,
    caption: table.caption,
    page_no: table.page_no,
    num_rows: table.num_rows,
    num_cols: table.num_cols,
    data: table.data,
  };
}
