create index follows_master_id_idx on public.follows (master_id);
create index user_report_bookmarks_report_id_idx on public.user_report_bookmarks (report_id);

drop policy if exists "admins can manage quotes" on public.quotes;
drop policy if exists "admins can manage quotes_daily" on public.quotes_daily;
drop policy if exists "admins can manage indices" on public.indices;
drop policy if exists "admins can manage sentiment" on public.sentiment;
drop policy if exists "admins can manage financials" on public.financials;
drop policy if exists "admins can manage news" on public.news;
drop policy if exists "admins can manage content" on public.master_profiles;
drop policy if exists "admins can manage master_holdings" on public.master_holdings;
drop policy if exists "admins can manage reports" on public.reports;
drop policy if exists "admins can manage reports_tables" on public.reports_tables;
drop policy if exists "admins can manage articles" on public.articles;
drop policy if exists "admins can manage terms" on public.terms;
drop policy if exists "admins can manage securities_master" on public.securities_master;
drop policy if exists "admins can manage security_aliases" on public.security_aliases;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'quotes',
    'quotes_daily',
    'indices',
    'sentiment',
    'financials',
    'news',
    'master_profiles',
    'master_holdings',
    'reports',
    'reports_tables',
    'articles',
    'terms',
    'securities_master',
    'security_aliases'
  ]
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.is_admin())',
      'admins can insert ' || table_name,
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.is_admin()) with check (private.is_admin())',
      'admins can update ' || table_name,
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.is_admin())',
      'admins can delete ' || table_name,
      table_name
    );
  end loop;
end;
$$;
