-- A display-only directory for staff. Never expose access_pin in a directory query.
create or replace view public.student_directory as
select
  s.id,
  s.reg_number,
  s.full_name,
  s.gender,
  s.passport_url,
  c.id as class_id,
  c.name as class_name,
  c.section
from public.students s
join public.classes c on c.id = s.class_id;

grant select on public.student_directory to authenticated;