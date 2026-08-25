alter table public.books add column if not exists cover_url text;

insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

create policy "Staff can upload book covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'book-covers');

create policy "Staff can update book covers"
on storage.objects for update to authenticated
using (bucket_id = 'book-covers')
with check (bucket_id = 'book-covers');

create policy "Anyone can view book covers"
on storage.objects for select to public
using (bucket_id = 'book-covers');