do $$
declare
  standard_class record;
begin
  for standard_class in
    select * from (values
      ('NURSERY 1', 'nursery'::public.school_section),
      ('NURSERY 2', 'nursery'::public.school_section),
      ('NURSERY 3', 'nursery'::public.school_section),
      ('PRIMARY 1', 'primary'::public.school_section),
      ('PRIMARY 2', 'primary'::public.school_section),
      ('PRIMARY 3', 'primary'::public.school_section),
      ('PRIMARY 4', 'primary'::public.school_section),
      ('PRIMARY 5', 'primary'::public.school_section),
      ('PRIMARY 6', 'primary'::public.school_section),
      ('JSS1', 'secondary'::public.school_section),
      ('JSS2', 'secondary'::public.school_section),
      ('JSS3', 'secondary'::public.school_section),
      ('SSS1', 'secondary'::public.school_section),
      ('SSS2', 'secondary'::public.school_section),
      ('SSS3', 'secondary'::public.school_section)
    ) as classes(name, section)
  loop
    if not exists (select 1 from public.classes where lower(public.classes.name) = lower(standard_class.name)) then
      insert into public.classes (name, section) values (standard_class.name, standard_class.section);
    end if;
  end loop;
end $$;