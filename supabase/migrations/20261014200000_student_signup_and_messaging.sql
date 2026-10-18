create table if not exists public.vis_student_signups (
  phone text primary key,
  username text not null,
  candidate jsonb not null,
  otp_hash text,
  otp_expires_at timestamptz,
  otp_attempts integer not null default 0 check (otp_attempts between 0 and 5),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'awaiting_verification'
    check (status in ('awaiting_verification', 'pending_approval', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.vis_student_signups enable row level security;
revoke all on public.vis_student_signups from anon, authenticated;
grant all on public.vis_student_signups to service_role;
create index if not exists vis_student_signups_pending_idx
  on public.vis_student_signups (created_at) where status = 'pending_approval';

create table if not exists public.vis_student_signup_rate_limits (
  phone text primary key,
  window_started_at timestamptz not null default now(),
  send_count integer not null check (send_count between 1 and 5),
  last_sent_at timestamptz not null
);

alter table public.vis_student_signup_rate_limits enable row level security;
revoke all on public.vis_student_signup_rate_limits from anon, authenticated;
grant all on public.vis_student_signup_rate_limits to service_role;

create or replace function public.vis_reserve_signup_send(target_phone text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare reserved boolean;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;
  insert into public.vis_student_signup_rate_limits(phone, window_started_at, send_count, last_sent_at)
  values (target_phone, now(), 1, now())
  on conflict (phone) do update set
    window_started_at = case
      when public.vis_student_signup_rate_limits.window_started_at <= now() - interval '1 hour' then now()
      else public.vis_student_signup_rate_limits.window_started_at
    end,
    send_count = case
      when public.vis_student_signup_rate_limits.window_started_at <= now() - interval '1 hour' then 1
      else public.vis_student_signup_rate_limits.send_count + 1
    end,
    last_sent_at = now()
  where public.vis_student_signup_rate_limits.last_sent_at <= now() - interval '1 minute'
    and (
      public.vis_student_signup_rate_limits.window_started_at <= now() - interval '1 hour'
      or public.vis_student_signup_rate_limits.send_count < 5
    )
  returning true into reserved;
  return coalesce(reserved, false);
end;
$$;

create or replace function public.vis_consume_signup_attempt(target_phone text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare next_attempt integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;
  update public.vis_student_signups
  set otp_attempts = otp_attempts + 1
  where phone = target_phone and status = 'awaiting_verification' and otp_attempts < 5
  returning otp_attempts into next_attempt;
  return coalesce(next_attempt, 0);
end;
$$;

revoke all on function public.vis_reserve_signup_send(text) from public, anon, authenticated;
revoke all on function public.vis_consume_signup_attempt(text) from public, anon, authenticated;
grant execute on function public.vis_reserve_signup_send(text) to service_role;
grant execute on function public.vis_consume_signup_attempt(text) to service_role;
