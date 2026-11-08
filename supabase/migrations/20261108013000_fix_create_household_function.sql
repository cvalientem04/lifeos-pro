drop function if exists public.create_household(text);

create or replace function public.create_household(household_name text default 'Mi hogar')
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household public.households;
  new_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if exists (
    select 1
    from public.household_members
    where user_id = auth.uid()
  ) then
    raise exception 'User already belongs to a household';
  end if;

  new_code := 'FAM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  insert into public.households (owner_id, name, invite_code)
  values (
    auth.uid(),
    coalesce(nullif(trim(household_name), ''), 'Mi hogar'),
    new_code
  )
  returning * into new_household;

  insert into public.household_members (household_id, user_id, role)
  values (new_household.id, auth.uid(), 'owner');

  insert into public.sharing_preferences (user_id, household_id)
  values (auth.uid(), new_household.id)
  on conflict (user_id) do update set household_id = excluded.household_id;

  return new_household;
end;
$$;

revoke all on function public.create_household(text) from public;
grant execute on function public.create_household(text) to authenticated;
