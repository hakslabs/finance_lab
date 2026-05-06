create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

create type public.article_status as enum ('draft', 'published', 'archived');
create type public.alert_channel as enum ('push', 'email');
create type public.bookmark_type as enum ('term', 'article', 'report');
create type public.cron_status as enum ('running', 'ok', 'failed');
create type public.transaction_type as enum ('buy', 'sell', 'div', 'cash');

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'app_role', '') = 'admin';
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.quotes (
  symbol text primary key,
  px numeric(18, 4),
  pct numeric(10, 4),
  ts timestamptz not null default now()
);

create table public.quotes_daily (
  symbol text not null,
  date date not null,
  open numeric(18, 4),
  high numeric(18, 4),
  low numeric(18, 4),
  close numeric(18, 4),
  vol bigint,
  primary key (symbol, date)
);

create table public.indices (
  code text primary key,
  value numeric(18, 4),
  change numeric(10, 4),
  spark numeric[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.sentiment (
  code text primary key,
  value numeric(10, 4),
  band text,
  ts timestamptz not null default now()
);

create table public.financials (
  symbol text not null,
  period text not null,
  is_json jsonb not null default '{}'::jsonb,
  bs_json jsonb not null default '{}'::jsonb,
  cf_json jsonb not null default '{}'::jsonb,
  ratios_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (symbol, period)
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  title text not null,
  url text not null unique,
  summary text,
  tickers text[] not null default '{}',
  sentiment numeric(10, 4),
  published_at timestamptz not null
);

create table public.master_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  firm text,
  style text,
  philosophy_md text,
  books jsonb not null default '[]'::jsonb,
  videos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.master_holdings (
  master_id uuid not null references public.master_profiles(id) on delete cascade,
  symbol text not null,
  weight numeric(10, 6),
  shares numeric(24, 6),
  qoq_delta numeric(10, 6),
  quarter text not null,
  primary key (master_id, symbol, quarter)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  category text not null,
  title text not null,
  pdf_url text,
  markdown text,
  summary text,
  tickers text[] not null default '{}',
  tags text[] not null default '{}',
  published_at timestamptz not null
);

create table public.reports_tables (
  report_id uuid not null references public.reports(id) on delete cascade,
  idx integer not null,
  table_json jsonb not null,
  primary key (report_id, idx)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  md text not null,
  published_at timestamptz,
  status public.article_status not null default 'draft'
);

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  definition text not null,
  related_tickers text[] not null default '{}',
  category text not null
);

create table public.securities_master (
  symbol text primary key,
  name text not null,
  asset_class text not null,
  country text not null,
  currency text not null,
  exchange text,
  market text,
  sector text,
  industry_group text,
  industry text,
  website text,
  market_cap_bucket text,
  isin text,
  cusip text,
  figi text,
  composite_figi text,
  shareclass_figi text,
  source text not null,
  source_revision text,
  source_updated_at timestamptz
);

create table public.security_aliases (
  symbol text not null references public.securities_master(symbol) on delete cascade,
  alias text not null,
  alias_type text not null,
  source text not null,
  primary key (symbol, alias, alias_type)
);

create table public.cron_logs (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status public.cron_status not null,
  err text
);

create table public.api_quota (
  provider text not null,
  day date not null,
  used integer not null default 0 check (used >= 0),
  "limit" integer not null check ("limit" >= 0),
  primary key (provider, day)
);

create table public.external_source_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  source_url text,
  source_revision text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status public.cron_status not null,
  robots_policy text,
  license_note text,
  err text
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'USD',
  language text not null default 'en',
  theme text not null default 'light',
  notif_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  symbols text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  master_id uuid not null references public.master_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, master_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.bookmark_type not null,
  ref_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, type, ref_id)
);

create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  qty numeric(24, 8) not null default 0,
  avg_px numeric(18, 4),
  currency text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, symbol, currency)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ts timestamptz not null default now(),
  type public.transaction_type not null,
  symbol text not null,
  qty numeric(24, 8) not null default 0,
  px numeric(18, 4) not null default 0,
  fee numeric(18, 4) not null default 0,
  currency text not null
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol_or_ref text not null,
  md text not null,
  created_at timestamptz not null default now()
);

create table public.saved_screens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.user_report_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  note_md text,
  created_at timestamptz not null default now(),
  primary key (user_id, report_id)
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_json jsonb not null,
  channel public.alert_channel not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.alerts_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule jsonb not null,
  status public.cron_status not null default 'running',
  evaluated_at timestamptz
);

create index quotes_daily_symbol_date_idx on public.quotes_daily (symbol, date desc);
create index news_published_at_idx on public.news (published_at desc);
create index reports_published_at_idx on public.reports (published_at desc);
create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_user_symbol_currency_idx on public.transactions (user_id, symbol, currency);
create index holdings_user_id_idx on public.holdings (user_id);
create index watchlists_user_id_idx on public.watchlists (user_id);
create index bookmarks_user_id_idx on public.bookmarks (user_id);
create index notes_user_id_idx on public.notes (user_id);
create index saved_screens_user_id_idx on public.saved_screens (user_id);
create index alerts_user_id_idx on public.alerts (user_id);
create index alerts_queue_user_id_idx on public.alerts_queue (user_id);

create or replace function private.recompute_holding(target_user_id uuid, target_symbol text, target_currency text)
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
    coalesce(sum(case when type = 'buy' then qty when type = 'sell' then -qty else 0 end), 0),
    nullif(sum(case when type = 'buy' then qty * px else 0 end), 0) /
      nullif(sum(case when type = 'buy' then qty else 0 end), 0)
  into computed_qty, computed_avg_px
  from public.transactions
  where user_id = target_user_id
    and symbol = target_symbol
    and currency = target_currency;

  if computed_qty = 0 then
    delete from public.holdings
    where user_id = target_user_id
      and symbol = target_symbol
      and currency = target_currency;
  else
    insert into public.holdings (user_id, symbol, qty, avg_px, currency, updated_at)
    values (target_user_id, target_symbol, computed_qty, computed_avg_px, target_currency, now())
    on conflict (user_id, symbol, currency)
    do update set qty = excluded.qty, avg_px = excluded.avg_px, updated_at = excluded.updated_at;
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

create trigger transactions_recompute_holdings
after insert or update or delete on public.transactions
for each row execute function private.transactions_recompute_holdings_trigger();

alter table public.quotes enable row level security;
alter table public.quotes_daily enable row level security;
alter table public.indices enable row level security;
alter table public.sentiment enable row level security;
alter table public.financials enable row level security;
alter table public.news enable row level security;
alter table public.master_profiles enable row level security;
alter table public.master_holdings enable row level security;
alter table public.reports enable row level security;
alter table public.reports_tables enable row level security;
alter table public.articles enable row level security;
alter table public.terms enable row level security;
alter table public.securities_master enable row level security;
alter table public.security_aliases enable row level security;
alter table public.cron_logs enable row level security;
alter table public.api_quota enable row level security;
alter table public.external_source_runs enable row level security;
alter table public.user_preferences enable row level security;
alter table public.watchlists enable row level security;
alter table public.follows enable row level security;
alter table public.bookmarks enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.notes enable row level security;
alter table public.saved_screens enable row level security;
alter table public.user_report_bookmarks enable row level security;
alter table public.alerts enable row level security;
alter table public.alerts_queue enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.quotes, public.quotes_daily, public.indices, public.sentiment, public.financials, public.news, public.master_profiles, public.master_holdings, public.reports, public.reports_tables, public.articles, public.terms, public.securities_master, public.security_aliases to anon, authenticated;
grant select, insert, update, delete on public.user_preferences, public.watchlists, public.follows, public.bookmarks, public.transactions, public.notes, public.saved_screens, public.user_report_bookmarks, public.alerts to authenticated;
grant select on public.holdings to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;

create policy "public can read quotes" on public.quotes for select to anon, authenticated using (true);
create policy "public can read quotes_daily" on public.quotes_daily for select to anon, authenticated using (true);
create policy "public can read indices" on public.indices for select to anon, authenticated using (true);
create policy "public can read sentiment" on public.sentiment for select to anon, authenticated using (true);
create policy "public can read financials" on public.financials for select to anon, authenticated using (true);
create policy "public can read news" on public.news for select to anon, authenticated using (true);
create policy "public can read master_profiles" on public.master_profiles for select to anon, authenticated using (true);
create policy "public can read master_holdings" on public.master_holdings for select to anon, authenticated using (true);
create policy "public can read reports" on public.reports for select to anon, authenticated using (true);
create policy "public can read reports_tables" on public.reports_tables for select to anon, authenticated using (true);
create policy "public can read articles" on public.articles for select to anon, authenticated using (true);
create policy "public can read terms" on public.terms for select to anon, authenticated using (true);
create policy "public can read securities_master" on public.securities_master for select to anon, authenticated using (true);
create policy "public can read security_aliases" on public.security_aliases for select to anon, authenticated using (true);

create policy "admins can manage quotes" on public.quotes for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage quotes_daily" on public.quotes_daily for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage indices" on public.indices for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage sentiment" on public.sentiment for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage financials" on public.financials for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage news" on public.news for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage content" on public.master_profiles for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage master_holdings" on public.master_holdings for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage reports" on public.reports for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage reports_tables" on public.reports_tables for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage articles" on public.articles for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage terms" on public.terms for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage securities_master" on public.securities_master for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can manage security_aliases" on public.security_aliases for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins can read cron_logs" on public.cron_logs for select to authenticated using (private.is_admin());
create policy "admins can read api_quota" on public.api_quota for select to authenticated using (private.is_admin());
create policy "admins can read external_source_runs" on public.external_source_runs for select to authenticated using (private.is_admin());
create policy "admins can read alerts_queue" on public.alerts_queue for select to authenticated using (private.is_admin());

create policy "users can read own preferences" on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can insert own preferences" on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users can update own preferences" on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can delete own preferences" on public.user_preferences for delete to authenticated using ((select auth.uid()) = user_id);

create policy "users can manage own watchlists" on public.watchlists for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage own follows" on public.follows for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage own bookmarks" on public.bookmarks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can read own holdings" on public.holdings for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can manage own transactions" on public.transactions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage own notes" on public.notes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage own saved_screens" on public.saved_screens for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage own report bookmarks" on public.user_report_bookmarks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage own alerts" on public.alerts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "service role can manage quotes" on public.quotes for all to service_role using (true) with check (true);
create policy "service role can manage quotes_daily" on public.quotes_daily for all to service_role using (true) with check (true);
create policy "service role can manage indices" on public.indices for all to service_role using (true) with check (true);
create policy "service role can manage sentiment" on public.sentiment for all to service_role using (true) with check (true);
create policy "service role can manage financials" on public.financials for all to service_role using (true) with check (true);
create policy "service role can manage news" on public.news for all to service_role using (true) with check (true);
create policy "service role can manage master_profiles" on public.master_profiles for all to service_role using (true) with check (true);
create policy "service role can manage master_holdings" on public.master_holdings for all to service_role using (true) with check (true);
create policy "service role can manage reports" on public.reports for all to service_role using (true) with check (true);
create policy "service role can manage reports_tables" on public.reports_tables for all to service_role using (true) with check (true);
create policy "service role can manage articles" on public.articles for all to service_role using (true) with check (true);
create policy "service role can manage terms" on public.terms for all to service_role using (true) with check (true);
create policy "service role can manage securities_master" on public.securities_master for all to service_role using (true) with check (true);
create policy "service role can manage security_aliases" on public.security_aliases for all to service_role using (true) with check (true);
create policy "service role can manage cron_logs" on public.cron_logs for all to service_role using (true) with check (true);
create policy "service role can manage api_quota" on public.api_quota for all to service_role using (true) with check (true);
create policy "service role can manage external_source_runs" on public.external_source_runs for all to service_role using (true) with check (true);
create policy "service role can manage user_preferences" on public.user_preferences for all to service_role using (true) with check (true);
create policy "service role can manage watchlists" on public.watchlists for all to service_role using (true) with check (true);
create policy "service role can manage follows" on public.follows for all to service_role using (true) with check (true);
create policy "service role can manage bookmarks" on public.bookmarks for all to service_role using (true) with check (true);
create policy "service role can manage holdings" on public.holdings for all to service_role using (true) with check (true);
create policy "service role can manage transactions" on public.transactions for all to service_role using (true) with check (true);
create policy "service role can manage notes" on public.notes for all to service_role using (true) with check (true);
create policy "service role can manage saved_screens" on public.saved_screens for all to service_role using (true) with check (true);
create policy "service role can manage user_report_bookmarks" on public.user_report_bookmarks for all to service_role using (true) with check (true);
create policy "service role can manage alerts" on public.alerts for all to service_role using (true) with check (true);
create policy "service role can manage alerts_queue" on public.alerts_queue for all to service_role using (true) with check (true);
