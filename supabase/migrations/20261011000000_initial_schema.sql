create table if not exists public.app_records (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id),
  check (length(collection) between 1 and 80),
  check (length(id) between 1 and 150)
);

alter table public.app_records enable row level security;
grant select, insert, update, delete on public.app_records to anon, authenticated;
grant all on public.app_records to service_role;

create or replace function public.vis_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select data->>'role'
    from public.app_records
    where collection = 'admins' and id = auth.uid()::text
  ), '');
$$;

create or replace function public.vis_is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.vis_role() in ('owner', 'admin');
$$;

create or replace function public.vis_is_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_records
    where collection = 'students' and id = auth.uid()::text
  );
$$;

create or replace function public.vis_teacher_owns_student(student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_records
    where collection = 'students' and id = student_id
      and data->>'teacherId' = auth.uid()::text
  );
$$;

create or replace function public.vis_student_matches_class(department text, student_stage numeric)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_records
    where collection = 'students' and id = auth.uid()::text
      and data->>'dept' = department
      and (data->>'stage')::numeric = student_stage
  );
$$;

create or replace function public.vis_submission_access(assignment_id text, student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.vis_is_manager()
    or (public.vis_is_student() and student_id = auth.uid()::text)
    or (
      public.vis_role() = 'teacher'
      and exists (
        select 1 from public.app_records
        where collection = 'assignments' and id = assignment_id
          and data->>'teacherId' = auth.uid()::text
      )
    );
$$;

create or replace function public.vis_guard_record_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.collection = 'accessRequests' and public.vis_role() = 'teacher'
    and old.data->>'ownerId' = auth.uid()::text then
    if (new.data - 'status') <> (old.data - 'status')
      or new.data->>'status' not in ('approved', 'declined') then
      raise exception 'Teachers may only change the access-request status.';
    end if;
  end if;

  if old.collection = 'students' and public.vis_role() = 'teacher' then
    if new.data->>'teacherId' is distinct from auth.uid()::text then
      raise exception 'Teachers cannot transfer a student record.';
    end if;
  end if;

  if old.collection = 'resources'
    and new.data->>'addedBy' is distinct from old.data->>'addedBy' then
    raise exception 'Teachers cannot change resource ownership.';
  end if;

  if old.collection = 'submissions' and public.vis_is_student()
    and old.data->>'studentId' = auth.uid()::text then
    if (new.data - array['answer','fileName','filePath','fileData','submittedAt'])
      <> (old.data - array['answer','fileName','filePath','fileData','submittedAt']) then
      raise exception 'Students may only edit their submission content.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists vis_guard_record_update on public.app_records;
create trigger vis_guard_record_update
before update on public.app_records
for each row execute function public.vis_guard_record_update();

create or replace function public.vis_touch_record()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vis_touch_record on public.app_records;
create trigger vis_touch_record
before insert or update on public.app_records
for each row execute function public.vis_touch_record();

create or replace function public.vis_track_related_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.collection = 'students' then
    insert into public.app_records(collection, id, data)
    values ('settings', 'main', jsonb_build_object('studentCount', 1))
    on conflict (collection, id) do update
      set data = public.app_records.data || jsonb_build_object(
        'studentCount', coalesce((public.app_records.data->>'studentCount')::integer, 0) + 1
      ), updated_at = now();
  elsif tg_op = 'DELETE' and old.collection = 'students' then
    update public.app_records
    set data = data || jsonb_build_object(
      'studentCount', greatest(coalesce((data->>'studentCount')::integer, 0) - 1, 0)
    ), updated_at = now()
    where collection = 'settings' and id = 'main';
    delete from public.app_records
    where collection = 'accessRequests' and data->>'studentId' = old.id;
  elsif tg_op = 'DELETE' and old.collection = 'assignments' then
    delete from public.app_records
    where collection = 'submissions' and data->>'assignmentId' = old.id;
  end if;
  return null;
end;
$$;

drop trigger if exists vis_track_related_records on public.app_records;
create trigger vis_track_related_records
after insert or delete on public.app_records
for each row execute function public.vis_track_related_records();

create or replace function public.vis_valid_submission(record jsonb)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    record->>'studentId' = auth.uid()::text
    and length(coalesce(record->>'answer', '')) <= 10000
    and length(coalesce(record->>'fileName', '')) <= 200
    and length(coalesce(record->>'filePath', '')) <= 300
    and coalesce(record->>'fileData', '') = ''
    and (
      coalesce(record->>'filePath', '') = ''
      or record->>'filePath' like 'submissions/' || (record->>'assignmentId') || '/' || (record->>'studentId') || '/%'
    )
    and exists (
      select 1
      from public.app_records assignment
      join public.app_records student on student.collection = 'students'
        and student.id = auth.uid()::text
      where assignment.collection = 'assignments'
        and assignment.id = record->>'assignmentId'
        and assignment.data->>'dept' = student.data->>'dept'
        and (assignment.data->>'stage')::numeric = (student.data->>'stage')::numeric
        and assignment.data->>'teacherId' = record->>'teacherId'
        and (assignment.data->>'dueAt')::timestamptz >= now()
    );
$$;

create or replace function public.vis_valid_resource(record jsonb, resource_id text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select record ?& array[
      'id','category','title_en','title_ku','fileName','filePath',
      'fileData','fileSize','addedBy','updatedAt','createdAt'
    ]
    and record - array[
      'id','category','title_en','title_ku','fileName','filePath',
      'fileData','fileSize','addedBy','updatedAt','createdAt'
    ] = '{}'::jsonb
    and record->>'id' = resource_id
    and jsonb_typeof(record->'category') = 'string'
    and length(record->>'category') between 1 and 60
    and jsonb_typeof(record->'title_en') = 'string'
    and length(record->>'title_en') <= 160
    and jsonb_typeof(record->'title_ku') = 'string'
    and length(record->>'title_ku') <= 160
    and (length(record->>'title_en') > 0 or length(record->>'title_ku') > 0)
    and jsonb_typeof(record->'fileName') = 'string'
    and length(record->>'fileName') between 1 and 200
    and jsonb_typeof(record->'filePath') = 'string'
    and length(record->>'filePath') <= 300
    and record->>'filePath' like 'resources/' || resource_id || '/%'
    and record->>'fileData' = ''
    and jsonb_typeof(record->'fileSize') = 'number'
    and (record->>'fileSize')::numeric between 1 and 10485760
    and jsonb_typeof(record->'addedBy') = 'string'
    and length(record->>'addedBy') > 0
    and jsonb_typeof(record->'updatedAt') = 'string'
    and length(record->>'updatedAt') <= 40
    and jsonb_typeof(record->'createdAt') = 'string'
    and length(record->>'createdAt') <= 40;
$$;

create policy "Public records can be read"
on public.app_records for select
using (collection in (
  'programs', 'posts', 'events', 'gallery', 'certificates',
  'notifications', 'instructors', 'publicTimetable', 'settings'
));

create policy "Signed-in users read authorized records"
on public.app_records for select to authenticated
using (
  (public.vis_is_manager() and collection <> '_system')
  or (collection = 'admins' and id = auth.uid()::text)
  or (collection = 'students' and (
    id = auth.uid()::text
    or (public.vis_role() = 'teacher' and (
      data->>'teacherId' = auth.uid()::text
      or coalesce(data->'sharedWith', '[]'::jsonb) @> to_jsonb(auth.uid()::text)
    ))
  ))
  or (collection = 'accessRequests' and public.vis_role() = 'teacher'
    and auth.uid()::text in (data->>'ownerId', data->>'requesterId'))
  or (collection in ('schedule', 'assignments', 'materials', 'resources')
    and (public.vis_role() in ('owner', 'admin', 'teacher') or public.vis_is_student()))
  or (collection = 'submissions' and public.vis_submission_access(data->>'assignmentId', data->>'studentId'))
  or (collection = 'examResults' and data->>'studentId' = auth.uid()::text)
);

create policy "Public contact form submissions"
on public.app_records for insert
with check (
  collection = 'messages'
  and length(coalesce(data->>'name', '')) between 1 and 120
  and length(coalesce(data->>'email', '')) between 3 and 254
  and length(coalesce(data->>'message', '')) between 1 and 10000
);

create policy "Managers create records"
on public.app_records for insert to authenticated
with check (
  (collection = 'admins' and public.vis_role() = 'owner')
  or (collection = 'students' and (
    public.vis_is_manager()
    or (public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  ))
  or (collection in ('schedule','assignments','materials')
    and (public.vis_is_manager()
      or (public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)))
  or (collection = 'resources' and public.vis_valid_resource(data, id)
    and data->>'addedBy' = auth.uid()::text
    and (public.vis_is_manager() or public.vis_role() = 'teacher'))
  or (collection = 'submissions' and public.vis_valid_submission(data))
  or (collection = 'accessRequests' and false)
  or (collection = 'certificates' and (
    public.vis_is_manager()
    or (public.vis_role() = 'teacher' and public.vis_teacher_owns_student(data->>'studentId'))
  ))
  or (collection in ('programs','posts','events','gallery','notifications','instructors','publicTimetable','settings','examResults','materials','assignments','schedule')
    and public.vis_is_manager())
);

create policy "Authorized records can be updated"
on public.app_records for update to authenticated
using (
  (public.vis_is_manager() and collection <> '_system'
    and (collection <> 'resources' or public.vis_valid_resource(data, id)))
  or (collection = 'students' and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection in ('schedule','assignments','materials') and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection = 'resources' and public.vis_role() = 'teacher' and data->>'addedBy' = auth.uid()::text)
  or (collection = 'submissions' and public.vis_is_student() and data->>'studentId' = auth.uid()::text)
  or (collection = 'accessRequests' and public.vis_role() = 'teacher' and data->>'ownerId' = auth.uid()::text)
  or (collection = 'certificates' and public.vis_role() = 'teacher' and public.vis_teacher_owns_student(data->>'studentId'))
)
with check (
  (public.vis_is_manager() and collection <> '_system'
    and (collection <> 'resources' or public.vis_valid_resource(data, id)))
  or (collection = 'students' and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection in ('schedule','assignments','materials') and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection = 'resources' and public.vis_role() = 'teacher'
    and public.vis_valid_resource(data, id) and data->>'addedBy' = auth.uid()::text)
  or (collection = 'submissions' and public.vis_valid_submission(data))
  or (collection = 'accessRequests' and public.vis_role() = 'teacher' and data->>'ownerId' = auth.uid()::text)
  or (collection = 'certificates' and public.vis_role() = 'teacher' and public.vis_teacher_owns_student(data->>'studentId'))
);

create policy "Authorized records can be deleted"
on public.app_records for delete to authenticated
using (
  (public.vis_is_manager() and collection <> '_system')
  or (collection in ('schedule','assignments','materials') and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection = 'resources' and public.vis_role() = 'teacher' and data->>'addedBy' = auth.uid()::text)
);

create table if not exists public.vis_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  call_count integer not null default 0 check (call_count between 0 and 30),
  primary key (user_id, usage_day)
);
alter table public.vis_ai_usage enable row level security;
grant all on public.vis_ai_usage to service_role;

create table if not exists public.vis_notification_deliveries (
  delivery_id text primary key,
  created_at timestamptz not null default now()
);
alter table public.vis_notification_deliveries enable row level security;
grant all on public.vis_notification_deliveries to service_role;

create or replace function public.vis_reserve_ai_call(target_user uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare next_count integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;
  insert into public.vis_ai_usage(user_id, usage_day, call_count)
  values(target_user, current_date, 1)
  on conflict (user_id, usage_day)
  do update set call_count = public.vis_ai_usage.call_count + 1
  returning call_count into next_count;
  if next_count > 30 then
    raise exception 'Daily AI limit reached.';
  end if;
  return next_count;
end;
$$;

create or replace function public.vis_bootstrap_owner(owner_id uuid, owner_email text, owner_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;
  perform pg_advisory_xact_lock(hashtext('vis-owner-bootstrap'));
  if exists (select 1 from public.app_records where collection = 'admins' and data->>'role' = 'owner')
    or exists (select 1 from public.app_records where collection = '_system' and id = 'ownerBootstrap') then
    raise exception 'An owner account already exists.';
  end if;
  insert into public.app_records(collection, id, data)
  values
    ('_system', 'ownerBootstrap', jsonb_build_object('uid', owner_id, 'createdAt', now())),
    ('admins', owner_id::text, jsonb_build_object('email', owner_email, 'name', owner_name, 'role', 'owner')),
    ('settings', 'main', jsonb_build_object('ownerInitialized', true))
  on conflict (collection, id) do update
    set data = public.app_records.data || excluded.data, updated_at = now();
end;
$$;

create or replace function public.vis_restore_backup(backup_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  collection_name text;
  valid_collections text[] := array[
    'programs','posts','events','gallery','students','messages','certificates',
    'notifications','admins','accessRequests','schedule','assignments','materials',
    'submissions','instructors','resources','examResults','publicTimetable'
  ];
  item jsonb;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required.';
  end if;
  if backup_data->>'format' is distinct from 'VIS_APPLICATION_BACKUP'
    or backup_data->>'schemaVersion' is distinct from '1'
    or jsonb_typeof(backup_data->'data') is distinct from 'object'
    or jsonb_typeof(backup_data->'data'->'settings') is distinct from 'object' then
    raise exception 'Invalid backup.';
  end if;
  foreach collection_name in array valid_collections loop
    if jsonb_typeof(backup_data->'data'->collection_name) is distinct from 'array' then
      raise exception 'Invalid backup collection: %', collection_name;
    end if;
    for item in select value from jsonb_array_elements(backup_data->'data'->collection_name) loop
      if jsonb_typeof(item) <> 'object' or coalesce(item->>'id','') = ''
        or length(item->>'id') > 150 or position('/' in (item->>'id')) > 0 then
        raise exception 'Invalid record in %.', collection_name;
      end if;
    end loop;
  end loop;
  foreach collection_name in array valid_collections loop
    delete from public.app_records where collection = collection_name;
    insert into public.app_records(collection, id, data)
    select collection_name, item->>'id', item
    from jsonb_array_elements(backup_data->'data'->collection_name) as records(item);
  end loop;
  insert into public.app_records(collection, id, data)
  values ('settings', 'main', backup_data->'data'->'settings')
  on conflict (collection, id) do update
    set data = excluded.data, updated_at = now();
end;
$$;

revoke all on function public.vis_reserve_ai_call(uuid) from public, anon, authenticated;
revoke all on function public.vis_bootstrap_owner(uuid, text, text) from public, anon, authenticated;
revoke all on function public.vis_restore_backup(jsonb) from public, anon, authenticated;
grant execute on function public.vis_reserve_ai_call(uuid) to service_role;
grant execute on function public.vis_bootstrap_owner(uuid, text, text) to service_role;
grant execute on function public.vis_restore_backup(jsonb) to service_role;
revoke all on function public.vis_role() from public, anon;
revoke all on function public.vis_is_manager() from public, anon;
revoke all on function public.vis_is_student() from public, anon;
revoke all on function public.vis_teacher_owns_student(text) from public, anon;
revoke all on function public.vis_student_matches_class(text, numeric) from public, anon;
revoke all on function public.vis_submission_access(text, text) from public, anon;
revoke all on function public.vis_valid_submission(jsonb) from public, anon;
revoke all on function public.vis_valid_resource(jsonb, text) from public, anon;
grant execute on function public.vis_role() to authenticated;
grant execute on function public.vis_is_manager() to authenticated;
grant execute on function public.vis_is_student() to authenticated;
grant execute on function public.vis_teacher_owns_student(text) to authenticated;
grant execute on function public.vis_student_matches_class(text, numeric) to authenticated;
grant execute on function public.vis_submission_access(text, text) to authenticated;
grant execute on function public.vis_valid_submission(jsonb) to authenticated;
grant execute on function public.vis_valid_resource(jsonb, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('vis-gallery', 'vis-gallery', true, 1048576),
  ('vis-private', 'vis-private', false, 10485760)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

create policy "Public gallery images are readable"
on storage.objects for select
using (bucket_id = 'vis-gallery');

create policy "Managers upload gallery images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'vis-gallery'
  and public.vis_is_manager()
  and (storage.extension(name) = 'jpg' or storage.extension(name) = 'jpeg' or storage.extension(name) = 'png' or storage.extension(name) = 'webp')
  and coalesce(metadata->>'mimetype', '') like 'image/%'
  and coalesce((metadata->>'size')::bigint, 0) <= 1048576
);

create policy "Managers update or remove gallery images"
on storage.objects for update to authenticated
using (bucket_id = 'vis-gallery' and public.vis_is_manager())
with check (bucket_id = 'vis-gallery' and public.vis_is_manager());

create policy "Managers delete gallery images"
on storage.objects for delete to authenticated
using (bucket_id = 'vis-gallery' and public.vis_is_manager());

create policy "Institute accounts read private files"
on storage.objects for select to authenticated
using (
  bucket_id = 'vis-private'
  and (
    (name like 'resources/%' and (
      public.vis_is_manager() or public.vis_role() = 'teacher' or public.vis_is_student()
    ))
    or (
      name like 'submissions/%'
      and public.vis_submission_access(
        split_part(name, '/', 2),
        split_part(name, '/', 3)
      )
    )
  )
);

create policy "Institute accounts upload private files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'vis-private'
  and (
    (
      name like 'resources/%'
      and (public.vis_is_manager() or (
        public.vis_role() = 'teacher'
        and (
          not exists (
            select 1 from public.app_records
            where collection = 'resources' and id = split_part(name, '/', 2)
          )
          or exists (
            select 1 from public.app_records
            where collection = 'resources' and id = split_part(name, '/', 2)
              and data->>'addedBy' = auth.uid()::text
          )
        )
      ))
      and storage.extension(name) = 'pdf'
      and coalesce(metadata->>'mimetype', '') = 'application/pdf'
      and coalesce((metadata->>'size')::bigint, 0) <= 10485760
    )
    or (
      name like 'submissions/%'
      and public.vis_student_matches_class(
        (select data->>'dept' from public.app_records
          where collection = 'assignments' and id = split_part(name, '/', 2)),
        (select (data->>'stage')::numeric from public.app_records
          where collection = 'assignments' and id = split_part(name, '/', 2))
      )
      and split_part(name, '/', 3) = auth.uid()::text
      and exists (
        select 1 from public.app_records
        where collection = 'assignments' and id = split_part(name, '/', 2)
          and (data->>'dueAt')::timestamptz >= now()
      )
      and (metadata->>'size')::bigint <= 2097152
      and coalesce(metadata->>'mimetype', '') in (
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'image/jpeg', 'image/png'
      )
    )
  )
);

create policy "Institute accounts update their private files"
on storage.objects for update to authenticated
using (
  bucket_id = 'vis-private'
  and (
    public.vis_is_manager()
    or (name like 'resources/%' and public.vis_role() = 'teacher'
      and exists (
        select 1 from public.app_records
        where collection = 'resources' and id = split_part(name, '/', 2)
          and data->>'addedBy' = auth.uid()::text
      ))
    or (name like 'submissions/%'
      and split_part(name, '/', 3) = auth.uid()::text
      and public.vis_submission_access(split_part(name, '/', 2), split_part(name, '/', 3)))
  )
)
with check (
  bucket_id = 'vis-private'
  and (
    (
      name like 'resources/%'
      and (public.vis_is_manager() or (
        public.vis_role() = 'teacher'
        and storage.extension(name) = 'pdf'
        and coalesce(metadata->>'mimetype', '') = 'application/pdf'
        and coalesce((metadata->>'size')::bigint, 0) <= 10485760
        and exists (
          select 1 from public.app_records
          where collection = 'resources' and id = split_part(name, '/', 2)
            and data->>'addedBy' = auth.uid()::text
        )
      ))
    )
    or (
      name like 'submissions/%'
      and split_part(name, '/', 3) = auth.uid()::text
      and public.vis_student_matches_class(
        (select data->>'dept' from public.app_records
          where collection = 'assignments' and id = split_part(name, '/', 2)),
        (select (data->>'stage')::numeric from public.app_records
          where collection = 'assignments' and id = split_part(name, '/', 2))
      )
      and exists (
        select 1 from public.app_records
        where collection = 'assignments' and id = split_part(name, '/', 2)
          and (data->>'dueAt')::timestamptz >= now()
      )
      and (metadata->>'size')::bigint <= 2097152
      and coalesce(metadata->>'mimetype', '') in (
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'image/jpeg', 'image/png'
      )
    )
  )
);

create policy "Institute accounts delete authorized private files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'vis-private'
  and (
    public.vis_is_manager()
    or (name like 'resources/%' and public.vis_role() = 'teacher'
      and exists (
        select 1 from public.app_records
        where collection = 'resources' and id = split_part(name, '/', 2)
          and data->>'addedBy' = auth.uid()::text
      ))
    or (name like 'submissions/%' and public.vis_submission_access(split_part(name, '/', 2), split_part(name, '/', 3)))
  )
);
