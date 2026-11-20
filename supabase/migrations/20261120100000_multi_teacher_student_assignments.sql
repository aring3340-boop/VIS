create or replace function public.vis_teacher_has_student_access(student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.vis_role() = 'teacher' and exists (
    select 1 from public.app_records
    where collection = 'students' and id = student_id
      and (
        data->>'teacherId' = auth.uid()::text
        or coalesce(data->'teacherIds', '[]'::jsonb) @> to_jsonb(auth.uid()::text)
      )
  );
$$;

create or replace function public.vis_teacher_owns_student(student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.vis_teacher_has_student_access(student_id);
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
    if new.data->>'teacherId' is distinct from old.data->>'teacherId'
      or new.data->'teacherIds' is distinct from old.data->'teacherIds' then
      raise exception 'Teachers cannot change student assignments.';
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

drop policy if exists "Signed-in users read authorized records" on public.app_records;
create policy "Signed-in users read authorized records"
on public.app_records for select to authenticated
using (
  (public.vis_is_manager() and collection <> '_system')
  or (collection = 'admins' and id = auth.uid()::text)
  or (collection = 'students' and (
    id = auth.uid()::text
    or public.vis_teacher_has_student_access(id)
    or (public.vis_role() = 'teacher'
      and coalesce(data->'sharedWith', '[]'::jsonb) @> to_jsonb(auth.uid()::text))
  ))
  or (collection = 'accessRequests' and public.vis_role() = 'teacher'
    and auth.uid()::text in (data->>'ownerId', data->>'requesterId'))
  or (collection in ('schedule', 'assignments', 'materials', 'resources')
    and (public.vis_role() in ('owner', 'admin', 'teacher') or public.vis_is_student()))
  or (collection = 'submissions' and public.vis_submission_access(data->>'assignmentId', data->>'studentId'))
  or (collection = 'examResults' and data->>'studentId' = auth.uid()::text)
);

drop policy if exists "Managers create records" on public.app_records;
create policy "Managers create records"
on public.app_records for insert to authenticated
with check (
  (collection = 'admins' and public.vis_role() = 'owner')
  or (collection = 'students' and (
    public.vis_is_manager()
    or (public.vis_role() = 'teacher'
      and data->>'teacherId' = auth.uid()::text
      and data->'teacherIds' = jsonb_build_array(auth.uid()::text))
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

drop policy if exists "Authorized records can be updated" on public.app_records;
create policy "Authorized records can be updated"
on public.app_records for update to authenticated
using (
  (public.vis_is_manager() and collection <> '_system'
    and (collection <> 'resources' or public.vis_valid_resource(data, id)))
  or (collection = 'students' and public.vis_teacher_has_student_access(id))
  or (collection in ('schedule','assignments','materials') and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection = 'resources' and public.vis_role() = 'teacher' and data->>'addedBy' = auth.uid()::text)
  or (collection = 'submissions' and public.vis_is_student() and data->>'studentId' = auth.uid()::text)
  or (collection = 'accessRequests' and public.vis_role() = 'teacher' and data->>'ownerId' = auth.uid()::text)
  or (collection = 'certificates' and public.vis_role() = 'teacher' and public.vis_teacher_owns_student(data->>'studentId'))
)
with check (
  (public.vis_is_manager() and collection <> '_system'
    and (collection <> 'resources' or public.vis_valid_resource(data, id)))
  or (collection = 'students' and public.vis_teacher_has_student_access(id))
  or (collection in ('schedule','assignments','materials') and public.vis_role() = 'teacher' and data->>'teacherId' = auth.uid()::text)
  or (collection = 'resources' and public.vis_role() = 'teacher'
    and public.vis_valid_resource(data, id) and data->>'addedBy' = auth.uid()::text)
  or (collection = 'submissions' and public.vis_valid_submission(data))
  or (collection = 'accessRequests' and public.vis_role() = 'teacher' and data->>'ownerId' = auth.uid()::text)
  or (collection = 'certificates' and public.vis_role() = 'teacher' and public.vis_teacher_owns_student(data->>'studentId'))
);

revoke all on function public.vis_teacher_has_student_access(text) from public, anon;
grant execute on function public.vis_teacher_has_student_access(text) to authenticated;
