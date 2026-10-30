create table if not exists public.care_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  emoji text not null default '🐾',
  care_type text not null default 'other'
    check (care_type in ('pet', 'plant', 'health', 'home', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.care_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_date date not null,
  label text not null check (char_length(trim(label)) between 1 and 120),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, task_date, label)
);

create index if not exists care_profiles_user_idx
  on public.care_profiles (user_id, created_at);

create index if not exists care_tasks_user_date_idx
  on public.care_tasks (user_id, task_date desc);

create or replace function public.validate_care_task_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.care_profiles
    where id = new.profile_id
      and user_id = new.user_id
  ) then
    raise exception 'Care profile does not belong to this user';
  end if;
  return new;
end;
$$;

drop trigger if exists care_tasks_validate_owner on public.care_tasks;
create trigger care_tasks_validate_owner
before insert or update of profile_id, user_id on public.care_tasks
for each row execute function public.validate_care_task_owner();

drop trigger if exists care_profiles_set_updated_at on public.care_profiles;
create trigger care_profiles_set_updated_at
before update on public.care_profiles
for each row execute function public.set_updated_at();

drop trigger if exists care_tasks_set_updated_at on public.care_tasks;
create trigger care_tasks_set_updated_at
before update on public.care_tasks
for each row execute function public.set_updated_at();

alter table public.care_profiles enable row level security;
alter table public.care_tasks enable row level security;

drop policy if exists "care_profiles_select_own" on public.care_profiles;
create policy "care_profiles_select_own" on public.care_profiles
for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "care_profiles_insert_own" on public.care_profiles;
create policy "care_profiles_insert_own" on public.care_profiles
for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "care_profiles_update_own" on public.care_profiles;
create policy "care_profiles_update_own" on public.care_profiles
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
drop policy if exists "care_profiles_delete_own" on public.care_profiles;
create policy "care_profiles_delete_own" on public.care_profiles
for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "care_tasks_select_own" on public.care_tasks;
create policy "care_tasks_select_own" on public.care_tasks
for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "care_tasks_insert_own" on public.care_tasks;
create policy "care_tasks_insert_own" on public.care_tasks
for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "care_tasks_update_own" on public.care_tasks;
create policy "care_tasks_update_own" on public.care_tasks
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
drop policy if exists "care_tasks_delete_own" on public.care_tasks;
create policy "care_tasks_delete_own" on public.care_tasks
for delete to authenticated using (user_id = (select auth.uid()));
