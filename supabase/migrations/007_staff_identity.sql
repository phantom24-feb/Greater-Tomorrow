alter table public.staff_profiles add column if not exists first_name text;
alter table public.staff_profiles add column if not exists last_name text;
alter table public.staff_profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('staff-avatars', 'staff-avatars', true)
on conflict (id) do nothing;

create policy "Staff can upload their avatar"
on storage.objects for insert to authenticated
with check (bucket_id = 'staff-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Staff can update their avatar"
on storage.objects for update to authenticated
using (bucket_id = 'staff-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'staff-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Anyone can view staff avatars"
on storage.objects for select to public
using (bucket_id = 'staff-avatars');

update public.staff_profiles
set first_name = split_part(full_name, ' ', 1),
    last_name = nullif(trim(substring(full_name from position(' ' in full_name) + 1)), '')
where first_name is null;