create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete set null,
  workout_date date not null,
  title text not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  volume_kg numeric(10, 2) not null default 0 check (volume_kg >= 0),
  sets_count integer not null default 0 check (sets_count >= 0),
  notes text not null default '',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_name text not null,
  muscle text,
  set_number integer not null check (set_number > 0),
  weight_kg numeric(8, 2) not null default 0 check (weight_kg >= 0),
  reps integer not null default 0 check (reps >= 0),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workout_id, exercise_name, set_number)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete set null,
  expense_date date not null,
  description text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.animal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  task_date date not null,
  animal_type text not null check (animal_type in ('pavos', 'gatos')),
  task_key text not null check (task_key in ('fedMorning', 'waterGiven', 'fedEvening')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, task_date, animal_type, task_key)
);

create table if not exists public.bike_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete set null,
  route_date date not null,
  name text not null default '',
  distance_km numeric(10, 2) not null default 0 check (distance_km >= 0),
  duration_minutes numeric(10, 2) not null default 0 check (duration_minutes >= 0),
  average_speed_kmh numeric(8, 2) not null default 0 check (average_speed_kmh >= 0),
  max_speed_kmh numeric(8, 2) not null default 0 check (max_speed_kmh >= 0),
  segments jsonb not null default '[]'::jsonb check (jsonb_typeof(segments) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  meal_date date not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, workout_date desc);

create index if not exists workout_sets_workout_idx
  on public.workout_sets (workout_id, set_number);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, expense_date desc);

create index if not exists shopping_items_user_created_idx
  on public.shopping_items (user_id, created_at desc);

create index if not exists animal_tasks_user_date_idx
  on public.animal_tasks (user_id, task_date desc);

create index if not exists bike_routes_user_date_idx
  on public.bike_routes (user_id, route_date desc);

create index if not exists meals_user_date_idx
  on public.meals (user_id, meal_date desc);

create or replace function public.validate_daily_log_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.daily_log_id is not null and not exists (
    select 1
    from public.daily_logs
    where id = new.daily_log_id
      and user_id = new.user_id
  ) then
    raise exception 'Daily log does not belong to this user';
  end if;
  return new;
end;
$$;

drop trigger if exists workouts_validate_daily_log_owner on public.workouts;
create trigger workouts_validate_daily_log_owner
before insert or update of user_id, daily_log_id on public.workouts
for each row execute function public.validate_daily_log_owner();

drop trigger if exists expenses_validate_daily_log_owner on public.expenses;
create trigger expenses_validate_daily_log_owner
before insert or update of user_id, daily_log_id on public.expenses
for each row execute function public.validate_daily_log_owner();

drop trigger if exists animal_tasks_validate_daily_log_owner on public.animal_tasks;
create trigger animal_tasks_validate_daily_log_owner
before insert or update of user_id, daily_log_id on public.animal_tasks
for each row execute function public.validate_daily_log_owner();

drop trigger if exists bike_routes_validate_daily_log_owner on public.bike_routes;
create trigger bike_routes_validate_daily_log_owner
before insert or update of user_id, daily_log_id on public.bike_routes
for each row execute function public.validate_daily_log_owner();

drop trigger if exists meals_validate_daily_log_owner on public.meals;
create trigger meals_validate_daily_log_owner
before insert or update of user_id, daily_log_id on public.meals
for each row execute function public.validate_daily_log_owner();

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists shopping_items_set_updated_at on public.shopping_items;
create trigger shopping_items_set_updated_at
before update on public.shopping_items
for each row execute function public.set_updated_at();

drop trigger if exists animal_tasks_set_updated_at on public.animal_tasks;
create trigger animal_tasks_set_updated_at
before update on public.animal_tasks
for each row execute function public.set_updated_at();

drop trigger if exists bike_routes_set_updated_at on public.bike_routes;
create trigger bike_routes_set_updated_at
before update on public.bike_routes
for each row execute function public.set_updated_at();

drop trigger if exists meals_set_updated_at on public.meals;
create trigger meals_set_updated_at
before update on public.meals
for each row execute function public.set_updated_at();

alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.expenses enable row level security;
alter table public.shopping_items enable row level security;
alter table public.animal_tasks enable row level security;
alter table public.bike_routes enable row level security;
alter table public.meals enable row level security;

drop policy if exists "workouts_select_own" on public.workouts;
create policy "workouts_select_own" on public.workouts for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists "workouts_insert_own" on public.workouts;
create policy "workouts_insert_own" on public.workouts for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "workouts_update_own" on public.workouts;
create policy "workouts_update_own" on public.workouts for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "workouts_delete_own" on public.workouts;
create policy "workouts_delete_own" on public.workouts for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "workout_sets_select_own" on public.workout_sets;
create policy "workout_sets_select_own" on public.workout_sets for select to authenticated
using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())));
drop policy if exists "workout_sets_insert_own" on public.workout_sets;
create policy "workout_sets_insert_own" on public.workout_sets for insert to authenticated
with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())));
drop policy if exists "workout_sets_update_own" on public.workout_sets;
create policy "workout_sets_update_own" on public.workout_sets for update to authenticated
using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())))
with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())));
drop policy if exists "workout_sets_delete_own" on public.workout_sets;
create policy "workout_sets_delete_own" on public.workout_sets for delete to authenticated
using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid())));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['expenses', 'shopping_items', 'animal_tasks', 'bike_routes', 'meals']
  loop
    execute format('drop policy if exists "%s_select_own" on public.%I', table_name, table_name);
    execute format('create policy "%s_select_own" on public.%I for select to authenticated using (user_id = (select auth.uid()))', table_name, table_name);
    execute format('drop policy if exists "%s_insert_own" on public.%I', table_name, table_name);
    execute format('create policy "%s_insert_own" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', table_name, table_name);
    execute format('drop policy if exists "%s_update_own" on public.%I', table_name, table_name);
    execute format('create policy "%s_update_own" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', table_name, table_name);
    execute format('drop policy if exists "%s_delete_own" on public.%I', table_name, table_name);
    execute format('create policy "%s_delete_own" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', table_name, table_name);
  end loop;
end;
$$;
