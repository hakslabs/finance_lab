import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const initialSchemaPath = join(process.cwd(), "supabase", "migrations", "20260506000000_m0_initial_schema.sql");

describe("M4/M5 user table RLS schema", () => {
  const sql = readFileSync(initialSchemaPath, "utf8");

  it("keeps follows and report bookmarks scoped to the authenticated user", () => {
    expect(sql).toContain("create table public.follows");
    expect(sql).toContain("create table public.user_report_bookmarks");
    expect(sql).toContain("alter table public.follows enable row level security");
    expect(sql).toContain("alter table public.user_report_bookmarks enable row level security");
    expect(sql).toContain('create policy "users can manage own follows" on public.follows for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)');
    expect(sql).toContain('create policy "users can manage own report bookmarks" on public.user_report_bookmarks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)');
  });

  it("allows transaction writes through RLS while holdings remain read-only to users", () => {
    expect(sql).toContain("create table public.holdings");
    expect(sql).toContain("create table public.transactions");
    expect(sql).toContain("alter table public.holdings enable row level security");
    expect(sql).toContain("alter table public.transactions enable row level security");
    expect(sql).toContain('create policy "users can read own holdings" on public.holdings for select to authenticated using ((select auth.uid()) = user_id)');
    expect(sql).toContain('create policy "users can manage own transactions" on public.transactions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)');
    expect(sql).not.toMatch(/create policy "users can .* own holdings" on public\.holdings for (all|insert|update|delete)/i);
  });
});
