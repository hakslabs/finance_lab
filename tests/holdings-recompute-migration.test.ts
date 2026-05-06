import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationName = "m0_holdings_recompute_placeholder";
const migrationsDir = join(process.cwd(), "supabase", "migrations");

function readMigrationSql() {
  const migrationFile = readdirSync(migrationsDir).find((fileName) => fileName.endsWith(`${migrationName}.sql`));

  if (!migrationFile) {
    throw new Error(`Missing migration ending in ${migrationName}.sql`);
  }

  return readFileSync(join(migrationsDir, migrationFile), "utf8");
}

describe("M0 holdings recompute migration", () => {
  const sql = readMigrationSql();

  it("installs a bounded row trigger on transactions changes", () => {
    expect(sql).toContain("create or replace function private.recompute_holding");
    expect(sql).toContain("create or replace function private.transactions_recompute_holdings_trigger");
    expect(sql).toContain("drop trigger if exists transactions_recompute_holdings on public.transactions");
    expect(sql).toContain("after insert or update or delete on public.transactions");
    expect(sql).toContain("for each row execute function private.transactions_recompute_holdings_trigger()");
  });

  it("recomputes only affected user, symbol, and currency keys for every mutation type", () => {
    expect(sql).toContain("target_user_id uuid");
    expect(sql).toContain("target_symbol text");
    expect(sql).toContain("target_currency text");
    expect(sql).toContain("where txn.user_id = target_user_id");
    expect(sql).toContain("and txn.symbol = target_symbol");
    expect(sql).toContain("and txn.currency = target_currency");
    expect(sql).toContain("if tg_op in ('UPDATE', 'DELETE') then");
    expect(sql).toContain("perform private.recompute_holding(old.user_id, old.symbol, old.currency)");
    expect(sql).toContain("if tg_op in ('INSERT', 'UPDATE') then");
    expect(sql).toContain("perform private.recompute_holding(new.user_id, new.symbol, new.currency)");
  });

  it("keeps the placeholder position semantics intentionally narrow", () => {
    expect(sql).toContain("when txn.type = 'buy' then txn.qty");
    expect(sql).toContain("when txn.type = 'sell' then -txn.qty");
    expect(sql).toContain("and txn.type in ('buy', 'sell')");
    expect(sql).toContain("when txn.type = 'buy' then (txn.qty * txn.px) + txn.fee");
    expect(sql).not.toContain("when txn.type = 'sell' then (txn.qty * txn.px)");
    expect(sql).not.toContain("realized");
  });

  it("enforces signed transaction inputs before trigger math trusts them", () => {
    expect(sql).toContain("add constraint transactions_qty_non_negative check (qty >= 0)");
    expect(sql).toContain("add constraint transactions_px_non_negative check (px >= 0)");
    expect(sql).toContain("add constraint transactions_fee_non_negative check (fee >= 0)");
    expect(sql).toContain("add constraint transactions_position_qty_positive check (type not in ('buy', 'sell') or qty > 0)");
    expect(sql).toContain("add constraint transactions_position_px_positive check (type not in ('buy', 'sell') or px > 0)");
  });

  it("deletes non-positive positions and upserts positive holdings without direct user write access", () => {
    expect(sql).toContain("if computed_qty <= 0 then");
    expect(sql).toContain("delete from public.holdings");
    expect(sql).toContain("insert into public.holdings (user_id, symbol, qty, avg_px, currency, updated_at)");
    expect(sql).toContain("on conflict (user_id, symbol, currency)");
    expect(sql).toContain("do update set");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("revoke all on function private.recompute_holding(uuid, text, text) from public");
    expect(sql).not.toMatch(/grant\s+(select,\s*)?insert/i);
    expect(sql).not.toMatch(/create policy .*holdings.*(insert|update|delete|all)/i);
  });
});
