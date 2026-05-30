-- When a teacher saves a course from the review flow, the course becomes published.
-- The original publish_course_structure function pre-dates the status column
-- (added in 20260530000000) so it never set status. Fix: set status = 'published'
-- as part of the atomic save so the teacher dashboard immediately reflects the
-- correct state without a separate explicit publish step.

create or replace function publish_course_structure(
  p_course_id uuid,
  p_teacher_id uuid,
  p_student_id uuid,
  p_preview jsonb
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_course_id uuid;
  v_generation_preview jsonb;
  v_module jsonb;
  v_assignment jsonb;
  v_module_id uuid;
  v_assignment_id uuid;
  v_module_order integer := 0;
  v_week_number integer;
  v_due_date date;
  v_points_possible integer;
  v_criteria jsonb;
begin
  if p_preview is null or jsonb_typeof(p_preview) <> 'object' then
    raise exception 'Course preview must be a JSON object'
      using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_preview -> 'modules', '[]'::jsonb)) <> 'array' then
    raise exception 'Course preview modules must be an array'
      using errcode = '22023';
  end if;

  select id, generation_preview
    into v_course_id, v_generation_preview
  from courses
  where id = p_course_id
    and teacher_id = p_teacher_id
  for update;

  if v_course_id is null then
    raise exception 'Course not found for teacher'
      using errcode = 'P0002';
  end if;

  if exists (select 1 from modules where course_id = p_course_id) then
    if v_generation_preview is null
       and exists (
         select 1
         from enrollments
         where course_id = p_course_id
           and student_id = p_student_id
       ) then
      return p_course_id;
    end if;

    raise exception 'Course structure already exists'
      using errcode = '23505';
  end if;

  for v_module in
    select value
    from jsonb_array_elements(coalesce(p_preview -> 'modules', '[]'::jsonb))
  loop
    v_week_number :=
      case
        when nullif(v_module ->> 'week_number', '') is null then v_module_order + 1
        else (v_module ->> 'week_number')::integer
      end;

    insert into modules (
      course_id,
      title,
      description,
      "order",
      week_number
    )
    values (
      p_course_id,
      coalesce(nullif(v_module ->> 'title', ''), ''),
      coalesce(v_module ->> 'description', ''),
      v_module_order,
      v_week_number
    )
    returning id into v_module_id;

    if jsonb_typeof(coalesce(v_module -> 'assignments', '[]'::jsonb)) <> 'array' then
      raise exception 'Course preview assignments must be an array'
        using errcode = '22023';
    end if;

    for v_assignment in
      select value
      from jsonb_array_elements(coalesce(v_module -> 'assignments', '[]'::jsonb))
    loop
      v_due_date :=
        case
          when nullif(v_assignment ->> 'due_date', '') is null then null
          else (v_assignment ->> 'due_date')::date
        end;

      v_points_possible :=
        case
          when nullif(v_assignment ->> 'points_possible', '') is null then 100
          else (v_assignment ->> 'points_possible')::integer
        end;

      insert into assignments (
        module_id,
        course_id,
        title,
        instructions,
        due_date,
        points_possible
      )
      values (
        v_module_id,
        p_course_id,
        coalesce(nullif(v_assignment ->> 'title', ''), ''),
        coalesce(v_assignment ->> 'instructions', ''),
        v_due_date,
        v_points_possible
      )
      returning id into v_assignment_id;

      v_criteria := coalesce(v_assignment -> 'rubric' -> 'criteria', '[]'::jsonb);
      if jsonb_typeof(v_criteria) <> 'array' then
        v_criteria := '[]'::jsonb;
      end if;

      insert into rubrics (assignment_id, criteria)
      values (v_assignment_id, v_criteria);
    end loop;

    v_module_order := v_module_order + 1;
  end loop;

  insert into enrollments (course_id, student_id)
  values (p_course_id, p_student_id)
  on conflict (course_id, student_id) do nothing;

  update courses
  set
    title = coalesce(nullif(p_preview ->> 'title', ''), 'Untitled Course'),
    generation_preview = null,
    status = 'published'
  where id = p_course_id;

  return p_course_id;
end;
$$;

comment on function publish_course_structure(uuid, uuid, uuid, jsonb) is
  'Publishes a reviewed Course structure transactionally: Modules, Assignments, Rubrics, Enrollment, sets status=published, then clears generation_preview.';

revoke execute on function publish_course_structure(uuid, uuid, uuid, jsonb) from public;
revoke execute on function publish_course_structure(uuid, uuid, uuid, jsonb) from anon;
revoke execute on function publish_course_structure(uuid, uuid, uuid, jsonb) from authenticated;
grant execute on function publish_course_structure(uuid, uuid, uuid, jsonb) to service_role;
