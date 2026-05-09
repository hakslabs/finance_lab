create or replace function public.claim_api_quota(
  p_provider text,
  p_day date,
  p_amount integer,
  p_limit integer
)
returns table (
  provider text,
  day date,
  used integer,
  "limit" integer,
  remaining integer,
  status text,
  claimed boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  quota_row public.api_quota%rowtype;
  quota_claimed boolean;
begin
  if p_amount is null or p_amount < 0 then
    raise exception 'p_amount must be a non-negative integer';
  end if;

  if p_limit is null or p_limit < 0 then
    raise exception 'p_limit must be a non-negative integer';
  end if;

  insert into public.api_quota (provider, day, used, "limit")
  values (p_provider, p_day, 0, p_limit)
  on conflict on constraint api_quota_pkey do update
    set "limit" = excluded."limit"
  returning api_quota.provider, api_quota.day, api_quota.used, api_quota."limit"
  into quota_row;

  quota_claimed := quota_row.used + p_amount <= p_limit;

  if quota_claimed then
    update public.api_quota
    set used = api_quota.used + p_amount,
        "limit" = p_limit
    where api_quota.provider = p_provider
      and api_quota.day = p_day
    returning api_quota.provider, api_quota.day, api_quota.used, api_quota."limit"
    into quota_row;
  end if;

  return query
  values (
    quota_row.provider,
    quota_row.day,
    quota_row.used,
    quota_row."limit",
    greatest(quota_row."limit" - quota_row.used, 0),
    case
      when quota_row."limit" = 0 or quota_row.used >= quota_row."limit" then 'exhausted'
      when quota_row.used::numeric / quota_row."limit" >= 0.8 then 'warning'
      else 'ok'
    end,
    quota_claimed
  );
end;
$$;

revoke execute on function public.claim_api_quota(text, date, integer, integer) from public, anon, authenticated;
grant execute on function public.claim_api_quota(text, date, integer, integer) to service_role;
