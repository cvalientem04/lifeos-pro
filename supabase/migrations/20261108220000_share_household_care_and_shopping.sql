alter table public.sharing_preferences
  add column if not exists shopping boolean not null default false;

alter table public.shopping_items
  add column if not exists household_id uuid references public.households(id) on delete set null;

alter table public.care_profiles
  add column if not exists household_id uuid references public.households(id) on delete set null;

alter table public.care_tasks
  add column if not exists household_id uuid references public.households(id) on delete set null;

create index if not exists shopping_items_household_idx
  on public.shopping_items (household_id, created_at desc);

create index if not exists care_profiles_household_idx
  on public.care_profiles (household_id, created_at);

create index if not exists care_tasks_household_date_idx
  on public.care_tasks (household_id, task_date desc);

create or replace function public.current_user_household_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id
  from public.household_members
  where user_id = (select auth.uid())
  order by joined_at
  limit 1;
$$;

create or replace function public.household_owner_shares(
  target_household_id uuid,
  preference_name text,
  target_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.sharing_preferences sp
    where sp.household_id = target_household_id
      and sp.user_id = target_user_id
      and case preference_name
        when 'care' then sp.care
        when 'shopping' then sp.shopping
        else false
      end
  );
$$;

create or replace function public.set_household_data_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.household_id is null then
    new.household_id := public.current_user_household_id();
  end if;
  return new;
end;
$$;

drop trigger if exists shopping_items_set_household on public.shopping_items;
create trigger shopping_items_set_household
before insert on public.shopping_items
for each row execute function public.set_household_data_context();

drop trigger if exists care_profiles_set_household on public.care_profiles;
create trigger care_profiles_set_household
before insert on public.care_profiles
for each row execute function public.set_household_data_context();

drop trigger if exists care_tasks_set_household on public.care_tasks;
create trigger care_tasks_set_household
before insert on public.care_tasks
for each row execute function public.set_household_data_context();

update public.shopping_items si
set household_id = hm.household_id
from public.household_members hm
where hm.user_id = si.user_id
  and si.household_id is null;

update public.care_profiles cp
set household_id = hm.household_id
from public.household_members hm
where hm.user_id = cp.user_id
  and cp.household_id is null;

update public.care_tasks ct
set household_id = cp.household_id
from public.care_profiles cp
where cp.id = ct.profile_id
  and ct.household_id is null;

drop policy if exists "shopping_items_select_own" on public.shopping_items;
drop policy if exists "shopping_items_insert_own" on public.shopping_items;
drop policy if exists "shopping_items_update_own" on public.shopping_items;
drop policy if exists "shopping_items_delete_own" on public.shopping_items;
create policy "shopping_items_select_household" on public.shopping_items
for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'shopping', user_id)
  )
);
create policy "shopping_items_insert_own" on public.shopping_items
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (
    household_id is null
    or household_id = public.current_user_household_id()
  )
);
create policy "shopping_items_update_household" on public.shopping_items
for update to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'shopping', user_id)
  )
)
with check (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'shopping', user_id)
  )
);
create policy "shopping_items_delete_household" on public.shopping_items
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'shopping', user_id)
  )
);

drop policy if exists "care_profiles_select_own" on public.care_profiles;
drop policy if exists "care_profiles_insert_own" on public.care_profiles;
drop policy if exists "care_profiles_update_own" on public.care_profiles;
drop policy if exists "care_profiles_delete_own" on public.care_profiles;
create policy "care_profiles_select_household" on public.care_profiles
for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);
create policy "care_profiles_insert_own" on public.care_profiles
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (
    household_id is null
    or household_id = public.current_user_household_id()
  )
);
create policy "care_profiles_update_household" on public.care_profiles
for update to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
)
with check (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);
create policy "care_profiles_delete_household" on public.care_profiles
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);

drop policy if exists "care_tasks_select_own" on public.care_tasks;
drop policy if exists "care_tasks_insert_own" on public.care_tasks;
drop policy if exists "care_tasks_update_own" on public.care_tasks;
drop policy if exists "care_tasks_delete_own" on public.care_tasks;
create policy "care_tasks_select_household" on public.care_tasks
for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);
create policy "care_tasks_insert_household" on public.care_tasks
for insert to authenticated
with check (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);
create policy "care_tasks_update_household" on public.care_tasks
for update to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
)
with check (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);
create policy "care_tasks_delete_household" on public.care_tasks
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (
    household_id = public.current_user_household_id()
    and public.household_owner_shares(household_id, 'care', user_id)
  )
);

revoke all on function public.current_user_household_id() from public;
grant execute on function public.current_user_household_id() to authenticated;
revoke all on function public.household_owner_shares(uuid, text, uuid) from public;
grant execute on function public.household_owner_shares(uuid, text, uuid) to authenticated;
