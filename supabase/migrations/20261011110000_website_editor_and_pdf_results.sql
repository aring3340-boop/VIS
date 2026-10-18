begin;

delete from public.app_records
where collection in ('payments', 'branches');

delete from public.app_records
where collection = 'examResults'
  and coalesce(data->>'filePath', '') = '';

delete from public.app_records
where collection = 'posts'
  and data->>'type' = 'alumni';

update public.app_records
set data = data - 'feeTotal' - 'branchId'
where collection = 'students';

update public.app_records
set data = data - 'branchId'
where collection in ('schedule', 'publicTimetable');

update public.app_records
set data = data - 'employerPartners'
where collection = 'settings';

update public.app_records
set data = (data - 'storyRole_en' - 'storyRole_ku') || jsonb_build_object('type', 'announcement')
where collection = 'posts';

alter table public.app_records
  add constraint app_records_no_removed_collections
  check (collection not in ('payments', 'branches'));

create or replace function public.vis_validate_exam_result()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  file_size numeric;
  student_id text;
begin
  if new.collection <> 'examResults' then
    return new;
  end if;

  student_id := new.data->>'studentId';
  if student_id is null or student_id = ''
    or new.data->>'filePath' is distinct from format('exam-results/%s/%s.pdf', student_id, new.id)
    or coalesce(new.data->>'fileData', '') <> ''
    or coalesce(new.data->>'fileName', '') = ''
    or length(new.data->>'fileName') > 180
    or jsonb_typeof(new.data->'fileSize') is distinct from 'number' then
    raise exception 'Exam results must reference a valid private PDF upload.';
  end if;

  file_size := (new.data->>'fileSize')::numeric;
  if file_size < 1 or file_size > 10485760 then
    raise exception 'Exam result PDFs must be no larger than 10 MB.';
  end if;

  if not exists (
    select 1 from public.app_records
    where collection = 'students' and id = student_id
  ) then
    raise exception 'Exam result student does not exist.';
  end if;
  return new;
end;
$$;

create trigger vis_validate_exam_result
before insert or update on public.app_records
for each row execute function public.vis_validate_exam_result();

create policy "Content editors read schedules"
on public.app_records for select to authenticated
using (collection = 'schedule' and public.vis_role() = 'content_editor');

create policy "Content editors create website content"
on public.app_records for insert to authenticated
with check (
  public.vis_role() = 'content_editor'
  and collection in ('programs','posts','events','gallery','notifications','instructors','publicTimetable','settings','schedule')
);

create policy "Content editors update website content"
on public.app_records for update to authenticated
using (
  public.vis_role() = 'content_editor'
  and collection in ('programs','posts','events','gallery','notifications','instructors','publicTimetable','settings','schedule')
)
with check (
  public.vis_role() = 'content_editor'
  and collection in ('programs','posts','events','gallery','notifications','instructors','publicTimetable','settings','schedule')
);

create policy "Content editors delete website content"
on public.app_records for delete to authenticated
using (
  public.vis_role() = 'content_editor'
  and collection in ('programs','posts','events','gallery','notifications','instructors','publicTimetable','schedule')
);

create policy "Staff upload exam result PDFs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'vis-private'
  and name like 'exam-results/%'
  and public.vis_is_manager()
  and storage.extension(name) = 'pdf'
  and coalesce(metadata->>'mimetype', '') = 'application/pdf'
  and coalesce((metadata->>'size')::bigint, 0) between 1 and 10485760
  and exists (
    select 1 from public.app_records
    where collection = 'students' and id = split_part(name, '/', 2)
  )
  and split_part(name, '/', 3) ~ '^[A-Za-z0-9_-]+[.]pdf$'
);

create policy "Students and managers read published exam result PDFs"
on storage.objects for select to authenticated
using (
  bucket_id = 'vis-private'
  and name like 'exam-results/%'
  and (
    public.vis_is_manager()
    or (public.vis_is_student() and split_part(name, '/', 2) = auth.uid()::text)
  )
);

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
    select collection_name, item->>'id',
      case
        when collection_name = 'students' then item - 'feeTotal' - 'branchId'
        when collection_name in ('schedule', 'publicTimetable') then item - 'branchId'
        when collection_name = 'posts' then item - 'storyRole_en' - 'storyRole_ku'
        else item
      end
    from jsonb_array_elements(backup_data->'data'->collection_name) as records(item)
    where collection_name <> 'posts' or coalesce(item->>'type', '') <> 'alumni';
  end loop;
  insert into public.app_records(collection, id, data)
  values ('settings', 'main', backup_data->'data'->'settings' - 'employerPartners' - 'publicResources')
  on conflict (collection, id) do update
    set data = excluded.data, updated_at = now();
end;
$$;

commit;
