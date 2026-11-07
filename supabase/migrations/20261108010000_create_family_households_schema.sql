create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi hogar',
  invite_code text not null unique check (invite_code ~ '^FAM-[A-Z0-9]{6}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.sharing_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  workouts boolean not null default false,
  streaks boolean not null default false,
  steps boolean not null default false,
  challenges boolean not null default false,
  bike_routes boolean not null default false,
  strength_progress boolean not null default false,
  care boolean not null default false,
  journal boolean not null default false,
  expenses boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists household_members_user_idx
  on public.household_members (user_id, joined_at desc);

create index if not exists sharing_preferences_household_idx
  on public.sharing_preferences (household_id);

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household_id
      and user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_household_member(uuid) from public;
grant execute on function public.is_household_member(uuid) to authenticated;

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
    select 1 from public.household_members
    where user_id = auth.uid()
  ) then
    raise exception 'User already belongs to a household';
  end if;

  new_code := 'FAM-' || upper(encode(gen_random_bytes(3), 'hex'));
  insert into public.households (owner_id, name, invite_code)
  values (auth.uid(), coalesce(nullif(trim(household_name), ''), 'Mi hogar'), new_code)
  returning * into new_household;

  insert into public.household_members (household_id, user_id, role)
  values (new_household.id, auth.uid(), 'owner');

  insert into public.sharing_preferences (user_id, household_id)
  values (auth.uid(), new_household.id)
  on conflict (user_id) do update set household_id = excluded.household_id;

  return new_household;
end;
$$;

create or replace function public.join_household_by_code(input_code text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.households;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if exists (
    select 1 from public.household_members
    where user_id = auth.uid()
  ) then
    raise exception 'User already belongs to a household';
  end if;

  select * into target
  from public.households
  where invite_code = upper(trim(input_code));

  if target.id is null then
    raise exception 'Invalid household code';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (target.id, auth.uid(), 'member');

  insert into public.sharing_preferences (user_id, household_id)
  values (auth.uid(), target.id)
  on conflict (user_id) do update set household_id = excluded.household_id;

  return target;
end;
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.sharing_preferences enable row level security;

drop policy if exists "households_select_members" on public.households;
create policy "households_select_members" on public.households
for select to authenticated
using (public.is_household_member(id));

drop policy if exists "household_members_select_members" on public.household_members;
create policy "household_members_select_members" on public.household_members
for select to authenticated
using (public.is_household_member(household_id));

drop policy if exists "household_members_delete_own" on public.household_members;
create policy "household_members_delete_own" on public.household_members
for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "sharing_preferences_select_own" on public.sharing_preferences;
create policy "sharing_preferences_select_own" on public.sharing_preferences
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "sharing_preferences_insert_own" on public.sharing_preferences;
create policy "sharing_preferences_insert_own" on public.sharing_preferences
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "sharing_preferences_update_own" on public.sharing_preferences;
create policy "sharing_preferences_update_own" on public.sharing_preferences
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on function public.create_household(text) from public;
grant execute on function public.create_household(text) to authenticated;
revoke all on function public.join_household_by_code(text) from public;
grant execute on function public.join_household_by_code(text) to authenticated;
