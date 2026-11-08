drop policy if exists "profiles_select_household_members" on public.profiles;
create policy "profiles_select_household_members" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.household_members own_members
    join public.household_members shared_members
      on shared_members.household_id = own_members.household_id
    where own_members.user_id = (select auth.uid())
      and shared_members.user_id = profiles.id
  )
);

create or replace function public.get_household_activity_feed(limit_count integer default 30)
returns table (
  activity_type text,
  user_id uuid,
  display_name text,
  username text,
  activity_date date,
  title text,
  duration_minutes numeric,
  metric numeric,
  details jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  with my_household as (
    select household_id
    from public.household_members
    where user_id = (select auth.uid())
    limit 1
  ),
  visible_members as (
    select hm.user_id, sp.workouts, sp.bike_routes
    from public.household_members hm
    join my_household mh on mh.household_id = hm.household_id
    join public.sharing_preferences sp
      on sp.user_id = hm.user_id
     and sp.household_id = hm.household_id
    where hm.user_id <> (select auth.uid())
  ),
  workout_activity as (
    select
      'workout'::text,
      w.user_id,
      coalesce(nullif(p.display_name, ''), p.username, 'Miembro de la familia'),
      p.username,
      w.workout_date,
      w.title,
      w.duration_minutes::numeric,
      w.volume_kg,
      jsonb_build_object(
        'sets_count', w.sets_count,
        'notes', w.notes,
        'exercises', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', ws.exercise_name,
            'muscle', ws.muscle,
            'weight_kg', ws.weight_kg,
            'reps', ws.reps,
            'set_number', ws.set_number
          ) order by ws.exercise_name, ws.set_number)
          from public.workout_sets ws
          where ws.workout_id = w.id and ws.completed
        ), '[]'::jsonb)
      )
    from public.workouts w
    join visible_members vm on vm.user_id = w.user_id and vm.workouts
    left join public.profiles p on p.id = w.user_id
  ),
  route_activity as (
    select
      'bike_route'::text,
      r.user_id,
      coalesce(nullif(p.display_name, ''), p.username, 'Miembro de la familia'),
      p.username,
      r.route_date,
      coalesce(nullif(r.name, ''), 'Ruta en bici'),
      r.duration_minutes,
      r.distance_km,
      jsonb_build_object('average_speed_kmh', r.average_speed_kmh, 'max_speed_kmh', r.max_speed_kmh)
    from public.bike_routes r
    join visible_members vm on vm.user_id = r.user_id and vm.bike_routes
    left join public.profiles p on p.id = r.user_id
  )
  select * from workout_activity
  union all
  select * from route_activity
  order by 5 desc
  limit greatest(1, least(coalesce(limit_count, 30), 100));
$$;

revoke all on function public.get_household_activity_feed(integer) from public;
grant execute on function public.get_household_activity_feed(integer) to authenticated;
