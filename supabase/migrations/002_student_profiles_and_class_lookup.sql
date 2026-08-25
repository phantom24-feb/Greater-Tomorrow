alter table public.students add column if not exists passport_url text;
alter table public.students add column if not exists gender text check (gender in ('female', 'male', 'other'));

drop function if exists public.lookup_result(text, text, text, text);

create or replace function public.lookup_result(
  lookup_class_name text,
  lookup_session text,
  lookup_term text,
  lookup_pin text
)
returns table (student_name text, class_name text, session text, term text, pdf_url text)
language sql security definer set search_path = public
as $$
  select s.full_name, c.name, r.session, r.term, r.pdf_url
  from public.results r
  join public.students s on s.id = r.student_id
  join public.classes c on c.id = s.class_id
  where lower(c.name) = lower(lookup_class_name)
    and s.access_pin = lookup_pin
    and r.session = lookup_session
    and r.term = lookup_term;
$$;

grant execute on function public.lookup_result(text, text, text, text) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('student-passports', 'student-passports', true)
on conflict (id) do nothing;

create policy "Staff can upload student passports"
on storage.objects for insert to authenticated
with check (bucket_id = 'student-passports');

create policy "Staff can update student passports"
on storage.objects for update to authenticated
using (bucket_id = 'student-passports')
with check (bucket_id = 'student-passports');

create policy "Anyone can view student passports"
on storage.objects for select to public
using (bucket_id = 'student-passports');