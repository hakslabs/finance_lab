import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const initialSchemaPath = join(process.cwd(), "supabase", "migrations", "20260506000000_m0_initial_schema.sql");

describe("saved_screens RLS schema", () => {
  const sql = readFileSync(initialSchemaPath, "utf8");

  it("defines saved_screens as a user-scoped filter snapshot table", () => {
    expect(sql).toContain("create table public.saved_screens");
    expect(sql).toContain("user_id uuid not null references auth.users(id) on delete cascade");
    expect(sql).toContain("name text not null");
    expect(sql).toContain("filters_json jsonb not null default '{}'::jsonb");
    expect(sql).toContain("create index saved_screens_user_id_idx on public.saved_screens (user_id)");
  });

  it("keeps saved_screens protected by user_id on read and write", () => {
    expect(sql).toContain("alter table public.saved_screens enable row level security");
    expect(sql).toContain(
      'create policy "users can manage own saved_screens" on public.saved_screens for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)'
    );
  });
});
