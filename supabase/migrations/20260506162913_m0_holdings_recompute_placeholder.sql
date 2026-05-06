alter table public.transactions
  add constraint transactions_qty_non_negative check (qty >= 0),
  add constraint transactions_px_non_negative check (px >= 0),
  add constraint transactions_fee_non_negative check (fee >= 0),
  add constraint transactions_position_qty_positive check (type not in ('buy', 'sell') or qty > 0),
  add constraint transactions_position_px_positive check (type not in ('buy', 'sell') or px > 0);

create or replace function private.recompute_holding(
  target_user_id uuid,
  target_symbol text,
  target_currency text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  computed_qty numeric(24, 8);
  computed_avg_px numeric(18, 4);
begin
  select
    coalesce(
      sum(
        case
          when txn.type = 'buy' then txn.qty
          when txn.type = 'sell' then -txn.qty
          else 0
        end
      ),
      0
    ),
    (
      sum(
        case
          when txn.type = 'buy' then (txn.qty * txn.px) + txn.fee
          else 0
        end
      ) / nullif(sum(case when txn.type = 'buy' then txn.qty else 0 end), 0)
    )::numeric(18, 4)
  into computed_qty, computed_avg_px
  from public.transactions as txn
  where txn.user_id = target_user_id
    and txn.symbol = target_symbol
    and txn.currency = target_currency
    and txn.type in ('buy', 'sell');

  if computed_qty <= 0 then
    delete from public.holdings
    where user_id = target_user_id
      and symbol = target_symbol
      and currency = target_currency;
  else
    insert into public.holdings (user_id, symbol, qty, avg_px, currency, updated_at)
    values (target_user_id, target_symbol, computed_qty, computed_avg_px, target_currency, now())
    on conflict (user_id, symbol, currency)
    do update set
      qty = excluded.qty,
      avg_px = excluded.avg_px,
      currency = excluded.currency,
      updated_at = excluded.updated_at;
  end if;
end;
$$;

revoke all on function private.recompute_holding(uuid, text, text) from public;

create or replace function private.transactions_recompute_holdings_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform private.recompute_holding(old.user_id, old.symbol, old.currency);
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    perform private.recompute_holding(new.user_id, new.symbol, new.currency);
  end if;

  return null;
end;
$$;

revoke all on function private.transactions_recompute_holdings_trigger() from public;

drop trigger if exists transactions_recompute_holdings on public.transactions;

create trigger transactions_recompute_holdings
after insert or update or delete on public.transactions
for each row execute function private.transactions_recompute_holdings_trigger();
