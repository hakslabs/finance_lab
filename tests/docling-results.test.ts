import { describe, expect, it, vi } from "vitest";

import type {
  DoclingExternalSourceRunsTable,
  DoclingReportsTable,
  DoclingReportTablesTable,
  DoclingResultInput,
  DoclingResultsSupabaseClient,
} from "@/app/_lib/reports/docling-results";
import type { Database } from "@/app/_lib/supabase/database.types";

vi.mock("server-only", () => ({}));

type ExternalSourceRunInsert = Database["public"]["Tables"]["external_source_runs"]["Insert"];
type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];
type ReportTableInsert = Database["public"]["Tables"]["reports_tables"]["Insert"];
type MutationResponse = { error: { message: string } | null; count: number | null; data: { id: string }[] };

type MockOptions = {
  runError?: string;
  reportError?: string;
  reportCount?: number;
  tableDeleteError?: string;
  tableError?: string;
};

function baseResult(overrides: Partial<DoclingResultInput> = {}): DoclingResultInput {
  return {
    reportId: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
    status: "success",
    markdown: "# Samsung Earnings\n\nRevenue improved.",
    tables: [
      {
        index: 0,
        caption: "Income statement",
        page_no: 4,
        num_rows: 2,
        num_cols: 2,
        data: [{ Account: "Revenue", "2025": "100" }],
      },
    ],
    warnings: [],
    origin: {
      uri: "https://example.com/reports/samsung.pdf",
      filename: "samsung.pdf",
      mimetype: "application/pdf",
      binary_hash: "sha256:abc123",
      page_count: 12,
    },
    doclingVersion: "2.0.0",
    sourceRevision: "etag-123",
    licenseNote: "IR PDF redistributed as a link with derived Markdown",
    ...overrides,
  };
}

function mutationResponse(error?: string, count?: number): MutationResponse {
  return {
    error: error ? { message: error } : null,
    count: count ?? null,
    data: typeof count === "number" && count > 0 ? [{ id: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35" }] : [],
  };
}

function createDoclingClient(options: MockOptions = {}) {
  const runs: ExternalSourceRunInsert[] = [];
  const reportUpdates: ReportUpdate[] = [];
  const reportMatches: Array<{ column: "id"; value: string }> = [];
  const tableDeletes: Array<{ column: "report_id"; value: string }> = [];
  const tableMutationCalls: Array<"delete" | "upsert"> = [];
  const tableUpserts: Array<{ values: ReportTableInsert[]; onConflict: "report_id,idx" }> = [];

  const externalSourceRuns: DoclingExternalSourceRunsTable = {
    insert: vi.fn(async (values: ExternalSourceRunInsert) => {
      runs.push(values);
      return mutationResponse(options.runError);
    }),
  };

  const reports: DoclingReportsTable = {
    update: vi.fn((values: ReportUpdate) => {
      reportUpdates.push(values);
      return {
        eq: vi.fn((column: "id", value: string) => ({
          select: vi.fn(async () => {
            reportMatches.push({ column, value });
            return mutationResponse(options.reportError, options.reportCount ?? 1);
          }),
        })),
      };
    }),
  };

  const reportTablesOptions = options;
  const reportTables: DoclingReportTablesTable = {
    delete: vi.fn(() => ({
      eq: vi.fn(async (column: "report_id", value: string) => {
        tableDeletes.push({ column, value });
        tableMutationCalls.push("delete");
        return mutationResponse(reportTablesOptions.tableDeleteError);
      }),
    })),
    upsert: vi.fn(async (values: ReportTableInsert[], upsertOptions: { onConflict: "report_id,idx" }) => {
      tableUpserts.push({ values, onConflict: upsertOptions.onConflict });
      tableMutationCalls.push("upsert");
      return mutationResponse(reportTablesOptions.tableError);
    }),
  };

  function from(table: "external_source_runs"): DoclingExternalSourceRunsTable;
  function from(table: "reports"): DoclingReportsTable;
  function from(table: "reports_tables"): DoclingReportTablesTable;
  function from(table: "external_source_runs" | "reports" | "reports_tables") {
    if (table === "external_source_runs") {
      return externalSourceRuns;
    }

    if (table === "reports") {
      return reports;
    }

    return reportTables;
  }

  const client: DoclingResultsSupabaseClient = { from };

  return {
    client,
    runs,
    reportUpdates,
    reportMatches,
    tableDeletes,
    tableMutationCalls,
    tableUpserts,
    externalSourceRuns,
    reports,
    reportTables,
  };
}

describe("persistDoclingResult", () => {
  it("updates markdown, upserts tables, logs ok, and returns a JSON-safe success summary", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const supabase = createDoclingClient();

    const summary = await persistDoclingResult(supabase.client, baseResult());

    expect(supabase.runs).toHaveLength(1);
    expect(supabase.runs[0]).toMatchObject({
      provider: "Docling",
      source_url: "https://example.com/reports/samsung.pdf",
      source_revision: "etag-123",
      status: "ok",
      license_note: "IR PDF redistributed as a link with derived Markdown",
      err: expect.stringContaining("docling=2.0.0"),
      finished_at: expect.any(String),
    });
    expect(supabase.reportUpdates).toEqual([{ markdown: "# Samsung Earnings\n\nRevenue improved." }]);
    expect(supabase.reportMatches).toEqual([{ column: "id", value: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35" }]);
    expect(supabase.tableDeletes).toEqual([{ column: "report_id", value: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35" }]);
    expect(supabase.tableMutationCalls).toEqual(["delete", "upsert"]);
    expect(supabase.tableUpserts).toEqual([
      {
        onConflict: "report_id,idx",
        values: [
          {
            report_id: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
            idx: 0,
            table_json: {
              index: 0,
              caption: "Income statement",
              page_no: 4,
              num_rows: 2,
              num_cols: 2,
              data: [{ Account: "Revenue", "2025": "100" }],
            },
          },
        ],
      },
    ]);
    expect(summary).toEqual({
      reportId: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
      status: "success",
      storedMarkdown: true,
      storedTableCount: 1,
      loggedRun: true,
      needsReview: false,
    });
  });

  it("stores partial_success outputs, logs ok with warnings, and returns needsReview", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const supabase = createDoclingClient();

    const summary = await persistDoclingResult(
      supabase.client,
      baseResult({
        status: "partial_success",
        warnings: [{ code: "LOW_CONFIDENCE_PAGE", message: "OCR confidence was FAIR", page_no: 7 }],
      }),
    );

    expect(supabase.runs[0]).toMatchObject({ status: "ok", err: expect.stringContaining("LOW_CONFIDENCE_PAGE@p7") });
    expect(supabase.tableDeletes).toHaveLength(1);
    expect(supabase.tableMutationCalls).toEqual(["delete", "upsert"]);
    expect(supabase.reportUpdates).toHaveLength(1);
    expect(supabase.tableUpserts).toHaveLength(1);
    expect(summary).toMatchObject({ status: "partial_success", storedMarkdown: true, storedTableCount: 1, needsReview: true });
  });

  it("reprocesses with zero tables by deleting previous table rows", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const supabase = createDoclingClient();

    const summary = await persistDoclingResult(supabase.client, baseResult({ tables: [] }));

    expect(supabase.tableDeletes).toEqual([{ column: "report_id", value: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35" }]);
    expect(supabase.tableMutationCalls).toEqual(["delete"]);
    expect(supabase.tableUpserts).toHaveLength(0);
    expect(summary).toEqual({
      reportId: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
      status: "success",
      storedMarkdown: true,
      storedTableCount: 0,
      loggedRun: true,
      needsReview: false,
    });
  });

  it("reprocesses with fewer tables by deleting stale rows before replacing tables", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const supabase = createDoclingClient();

    const summary = await persistDoclingResult(
      supabase.client,
      baseResult({
        tables: [
          {
            index: 3,
            caption: "Updated balance sheet",
            page_no: 8,
            num_rows: 1,
            num_cols: 1,
            data: [{ Account: "Assets", Value: "1500" }],
          },
        ],
      }),
    );

    expect(supabase.tableMutationCalls).toEqual(["delete", "upsert"]);
    expect(supabase.tableDeletes).toEqual([{ column: "report_id", value: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35" }]);
    expect(supabase.tableUpserts).toEqual([
      {
        onConflict: "report_id,idx",
        values: [
          {
            report_id: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
            idx: 3,
            table_json: {
              index: 3,
              caption: "Updated balance sheet",
              page_no: 8,
              num_rows: 1,
              num_cols: 1,
              data: [{ Account: "Assets", Value: "1500" }],
            },
          },
        ],
      },
    ]);
    expect(summary).toMatchObject({
      reportId: "2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
      status: "success",
      storedMarkdown: true,
      storedTableCount: 1,
      loggedRun: true,
      needsReview: false,
    });
  });

  it("logs failure and skipped results without mutating reports or reports_tables", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const failureSupabase = createDoclingClient();
    const skippedSupabase = createDoclingClient();

    const failure = await persistDoclingResult(
      failureSupabase.client,
      baseResult({ status: "failure", markdown: undefined, tables: [], warnings: [{ code: "TIMEOUT", message: "worker timed out" }] }),
    );
    const skipped = await persistDoclingResult(
      skippedSupabase.client,
      baseResult({ status: "skipped", markdown: undefined, tables: [], warnings: [] }),
    );

    expect(failureSupabase.runs[0]).toMatchObject({ status: "failed", err: expect.stringContaining("status=failure") });
    expect(skippedSupabase.runs[0]).toMatchObject({ status: "failed", err: expect.stringContaining("status=skipped") });
    expect(failureSupabase.reportUpdates).toHaveLength(0);
    expect(failureSupabase.tableUpserts).toHaveLength(0);
    expect(failureSupabase.tableDeletes).toHaveLength(0);
    expect(skippedSupabase.reportUpdates).toHaveLength(0);
    expect(skippedSupabase.tableUpserts).toHaveLength(0);
    expect(skippedSupabase.tableDeletes).toHaveLength(0);
    expect(failure).toMatchObject({ storedMarkdown: false, storedTableCount: 0, loggedRun: true, needsReview: true });
    expect(skipped).toMatchObject({ storedMarkdown: false, storedTableCount: 0, loggedRun: true, needsReview: false });
  });

  it("rejects duplicate and negative table indexes before Supabase writes", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const duplicateSupabase = createDoclingClient();
    const negativeSupabase = createDoclingClient();
    const duplicateTable = { ...baseResult().tables[0], caption: "Duplicate" };

    await expect(
      persistDoclingResult(duplicateSupabase.client, baseResult({ tables: [baseResult().tables[0], duplicateTable] })),
    ).rejects.toThrow("Docling table index must be unique: 0");
    await expect(
      persistDoclingResult(negativeSupabase.client, baseResult({ tables: [{ ...baseResult().tables[0], index: -1 }] })),
    ).rejects.toThrow("Docling table index must be a non-negative integer: -1");
    expect(duplicateSupabase.runs).toHaveLength(0);
    expect(negativeSupabase.runs).toHaveLength(0);
  });

  it("rejects empty markdown for success and partial_success before Supabase writes", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const successSupabase = createDoclingClient();
    const partialSupabase = createDoclingClient();

    await expect(persistDoclingResult(successSupabase.client, baseResult({ markdown: "   " }))).rejects.toThrow(
      "Docling result markdown must be non-empty for success or partial_success",
    );
    await expect(
      persistDoclingResult(partialSupabase.client, baseResult({ status: "partial_success", markdown: undefined })),
    ).rejects.toThrow("Docling result markdown must be non-empty for success or partial_success");
    expect(successSupabase.runs).toHaveLength(0);
    expect(partialSupabase.runs).toHaveLength(0);
  });

  it("throws clear errors for Supabase write failures", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");

    await expect(persistDoclingResult(createDoclingClient({ runError: "permission denied" }).client, baseResult())).rejects.toThrow(
      "failed to log Docling source run: permission denied",
    );
    await expect(persistDoclingResult(createDoclingClient({ reportError: "missing report" }).client, baseResult())).rejects.toThrow(
      "failed to update reports.markdown for 2a518d30-2ca0-45f6-9c2a-b41948bc7f35: missing report",
    );
    await expect(persistDoclingResult(createDoclingClient({ reportCount: 0 }).client, baseResult())).rejects.toThrow(
      "failed to update report markdown: no report found for id 2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
    );
    await expect(persistDoclingResult(createDoclingClient({ tableDeleteError: "delete denied" }).client, baseResult())).rejects.toThrow(
      "failed to clear previous reports_tables for 2a518d30-2ca0-45f6-9c2a-b41948bc7f35: delete denied",
    );
    await expect(persistDoclingResult(createDoclingClient({ tableError: "constraint failed" }).client, baseResult())).rejects.toThrow(
      "failed to upsert reports_tables for 2a518d30-2ca0-45f6-9c2a-b41948bc7f35: constraint failed",
    );
  });

  it("fails when report markdown update matches no rows", async () => {
    const { persistDoclingResult } = await import("@/app/_lib/reports/docling-results");
    const supabase = createDoclingClient({ reportCount: 0 });

    await expect(persistDoclingResult(supabase.client, baseResult())).rejects.toThrow(
      "failed to update report markdown: no report found for id 2a518d30-2ca0-45f6-9c2a-b41948bc7f35",
    );

    expect(supabase.tableDeletes).toHaveLength(0);
    expect(supabase.tableUpserts).toHaveLength(0);
  });
});
