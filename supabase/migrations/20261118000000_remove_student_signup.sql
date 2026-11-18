do $$
begin
  if to_regclass('public.vis_student_signups') is not null then
    delete from auth.users
    where id in (
      select user_id
      from public.vis_student_signups
      where status in ('awaiting_verification', 'pending_approval')
        and user_id is not null
    );
  end if;
end;
$$;

drop function if exists public.vis_consume_signup_attempt(text);
drop function if exists public.vis_reserve_signup_send(text);
drop table if exists public.vis_student_signup_rate_limits;
drop table if exists public.vis_student_signups;
