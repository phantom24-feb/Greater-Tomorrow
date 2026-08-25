create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;

create policy "Staff can view their own profile"
on public.staff_profiles for select to authenticated
using (auth.uid() = id);

create policy "Staff can update their own profile"
on public.staff_profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_staff_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.staff_profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_staff_profile on auth.users;
create trigger on_auth_user_created_staff_profile
after insert on auth.users
for each row execute procedure public.handle_new_staff_profile();

insert into public.staff_profiles (id, email, full_name)
select id, coalesce(email, ''), nullif(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do update set email = excluded.email;

grant select, update on public.staff_profiles to authenticated;
