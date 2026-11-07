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
      'workout'::text as activity_type,
      w.user_id,
      coalesce(nullif(p.display_name, ''), p.username, 'Miembro de la familia') as display_name,
      p.username,
      w.workout_date as activity_date,
      w.title,
      w.duration_minutes::numeric,
      w.volume_kg as metric,
      jsonb_build_object('sets_count', w.sets_count, 'notes', w.notes) as details
    from public.workouts w
    join visible_members vm on vm.user_id = w.user_id and vm.workouts
    left join public.profiles p on p.id = w.user_id
  ),
  route_activity as (
    select
      'bike_route'::text as activity_type,
      r.user_id,
      coalesce(nullif(p.display_name, ''), p.username, 'Miembro de la familia') as display_name,
      p.username,
      r.route_date as activity_date,
      coalesce(nullif(r.name, ''), 'Ruta en bici') as title,
      r.duration_minutes,
      r.distance_km as metric,
      jsonb_build_object('average_speed_kmh', r.average_speed_kmh, 'max_speed_kmh', r.max_speed_kmh) as details
    from public.bike_routes r
    join visible_members vm on vm.user_id = r.user_id and vm.bike_routes
    left join public.profiles p on p.id = r.user_id
  )
  select * from workout_activity
  union all
  select * from route_activity
  order by activity_date desc
  limit greatest(1, least(coalesce(limit_count, 30), 100));
$$;

revoke all on function public.get_household_activity_feed(integer) from public;
grant execute on function public.get_household_activity_feed(integer) to authenticated;
