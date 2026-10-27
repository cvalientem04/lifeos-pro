create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  weight_kg numeric(6, 2),
  height_cm numeric(6, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  steps integer not null default 0 check (steps >= 0),
  study_minutes integer not null default 0 check (study_minutes >= 0),
  car_minutes integer not null default 0 check (car_minutes >= 0),
  mood text,
  journal text not null default '',
  ghost_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.ghost_mode_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_id uuid not null unique references public.daily_logs(id) on delete cascade,
  used_on date not null,
  week_key date not null,
  created_at timestamptz not null default now(),
  unique (user_id, used_on)
);

create index if not exists daily_logs_user_date_idx
  on public.daily_logs (user_id, log_date desc);

create index if not exists ghost_mode_uses_user_week_idx
  on public.ghost_mode_uses (user_id, week_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists daily_logs_set_updated_at on public.daily_logs;
create trigger daily_logs_set_updated_at
before update on public.daily_logs
for each row execute function public.set_updated_at();

create or replace function public.create_ghost_mode_use()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  monday date;
  weekly_uses integer;
begin
  if tg_op = 'INSERT' and new.ghost_mode then
    if new.steps < 5000 then
      raise exception 'Ghost mode requires at least 5000 steps';
    end if;

    monday := new.log_date - ((extract(isodow from new.log_date)::integer) - 1);
    perform pg_advisory_xact_lock(
      hashtextextended(new.user_id::text || ':' || monday::text, 0)
    );

    select count(*) into weekly_uses
    from public.ghost_mode_uses
    where user_id = new.user_id
      and week_key = monday;

    if weekly_uses >= 2 then
      raise exception 'Ghost mode is limited to two uses per week';
    end if;

    insert into public.ghost_mode_uses (user_id, log_id, used_on, week_key)
    values (new.user_id, new.id, new.log_date, monday);
  elsif tg_op = 'UPDATE' then
    if new.ghost_mode and not old.ghost_mode then
      if new.steps < 5000 then
        raise exception 'Ghost mode requires at least 5000 steps';
      end if;

      monday := new.log_date - ((extract(isodow from new.log_date)::integer) - 1);
      perform pg_advisory_xact_lock(
        hashtextextended(new.user_id::text || ':' || monday::text, 0)
      );

      select count(*) into weekly_uses
      from public.ghost_mode_uses
      where user_id = new.user_id
        and week_key = monday;

      if weekly_uses >= 2 then
        raise exception 'Ghost mode is limited to two uses per week';
      end if;

      insert into public.ghost_mode_uses (user_id, log_id, used_on, week_key)
      values (new.user_id, new.id, new.log_date, monday);
    elsif not new.ghost_mode and old.ghost_mode then
      raise exception 'Ghost mode cannot be deactivated after activation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists daily_logs_create_ghost_use on public.daily_logs;
create trigger daily_logs_create_ghost_use
after insert or update of ghost_mode on public.daily_logs
for each row execute function public.create_ghost_mode_use();

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.ghost_mode_uses enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "daily_logs_select_own" on public.daily_logs;
create policy "daily_logs_select_own"
on public.daily_logs for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "daily_logs_insert_own" on public.daily_logs;
create policy "daily_logs_insert_own"
on public.daily_logs for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "daily_logs_update_own" on public.daily_logs;
create policy "daily_logs_update_own"
on public.daily_logs for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "ghost_mode_uses_select_own" on public.ghost_mode_uses;
create policy "ghost_mode_uses_select_own"
on public.ghost_mode_uses for select
to authenticated
using (user_id = (select auth.uid()));
