import { describe, expect, it, vi } from "vitest";

import type { CronRunSupabaseClient } from "@/app/_lib/cron/run";

vi.mock("server-only", () => ({}));

function createCronRunClient(options: {
  insertError?: string;
  updateError?: string;
  insertedId?: string | null;
} = {}) {
  const updates: unknown[] = [];
  const eq = vi.fn().mockImplementation(async () => ({
    error: options.updateError ? { message: options.updateError } : null
  }));
  const update = vi.fn().mockImplementation((values: unknown) => {
    updates.push(values);
    return { eq };
  });
  const single = vi.fn().mockResolvedValue({
    data: options.insertedId === null ? null : { id: options.insertedId ?? "log-1" },
    error: options.insertError ? { message: options.insertError } : null
  });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert, update });

  return { client: { from } as CronRunSupabaseClient, from, insert, select, single, update, eq, updates };
}

describe("runLoggedCronTask", () => {
  it("inserts a running log, records success, and returns a JSON-safe success envelope", async () => {
    const { runLoggedCronTask } = await import("@/app/_lib/cron/run");
    const supabase = createCronRunClient();
    const task = vi.fn().mockResolvedValue({ touched: 2 });

    const result = await runLoggedCronTask("quotes-us", supabase.client, task);

    expect(supabase.insert).toHaveBeenCalledWith({ job: "quotes-us", status: "running" });
    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", err: null, finished_at: expect.any(String) })
    );
    expect(supabase.eq).toHaveBeenCalledWith("id", "log-1");
    expect(result).toEqual({ ok: true, job: "quotes-us", logId: "log-1", result: { touched: 2 } });
  });

  it("records task failures against the same log row", async () => {
    const { runLoggedCronTask } = await import("@/app/_lib/cron/run");
    const supabase = createCronRunClient({ insertedId: "log-fail" });

    const result = await runLoggedCronTask("quotes-kr", supabase.client, async () => {
      throw new Error("provider unavailable");
    });

    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", err: "provider unavailable", finished_at: expect.any(String) })
    );
    expect(supabase.eq).toHaveBeenCalledWith("id", "log-fail");
    expect(result).toEqual({ ok: false, job: "quotes-kr", logId: "log-fail", error: "provider unavailable" });
  });

  it("does not run the task if the running log cannot be inserted", async () => {
    const { runLoggedCronTask } = await import("@/app/_lib/cron/run");
    const supabase = createCronRunClient({ insertError: "permission denied" });
    const task = vi.fn().mockResolvedValue({ shouldNotRun: true });

    const result = await runLoggedCronTask("quotes-us", supabase.client, task);

    expect(task).not.toHaveBeenCalled();
    expect(supabase.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      job: "quotes-us",
      logId: null,
      error: "failed to start cron log: permission denied"
    });
  });
});
