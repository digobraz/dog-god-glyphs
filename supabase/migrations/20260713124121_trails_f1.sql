-- DOGYPT Trails — Fáza 1: trasy + DOGYPT FRIENDLY body + členské hodnotenia
-- Modul /pack/trails. Aditívne, nedotýka sa existujúcich tabuliek.

-- === TRAILS ===
create table if not exists public.trails (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id),
  name        text not null,
  description text,
  difficulty  text check (difficulty in ('easy','moderate','hard','extreme')),
  distance_m  int,
  ascent_m    int,
  activities  text[] default '{}',
  region      text,
  path        jsonb not null,
  cover_url   text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected'))
);
create index if not exists trails_status_idx on public.trails(status);

-- === TRAIL PLACES (DOGYPT FRIENDLY body) ===
create table if not exists public.trail_places (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id),
  name        text not null,
  place_type  text,
  lat         double precision not null,
  lng         double precision not null,
  description text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected'))
);
create index if not exists trail_places_status_idx on public.trail_places(status);

-- === RATINGS ===
create table if not exists public.trail_ratings (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  trail_id   uuid not null references public.trails(id) on delete cascade,
  user_id    uuid not null references auth.users(id),
  stars      int not null check (stars between 1 and 5),
  comment    text,
  unique (trail_id, user_id)
);
create index if not exists trail_ratings_trail_idx on public.trail_ratings(trail_id);

-- === admin allowlist (moderácia) ===
create or replace function public.is_trails_admin() returns boolean
  language sql stable as $$
  select coalesce(auth.jwt()->>'email','') in ('biznismantt@gmail.com','dogypt@gmail.com')
$$;

-- === RLS ===
alter table public.trails        enable row level security;
alter table public.trail_places  enable row level security;
alter table public.trail_ratings enable row level security;

drop policy if exists trails_read_public   on public.trails;
drop policy if exists trails_insert_member on public.trails;
drop policy if exists trails_update_admin  on public.trails;
create policy trails_read_public   on public.trails for select using (status = 'approved' or user_id = auth.uid() or public.is_trails_admin());
create policy trails_insert_member on public.trails for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy trails_update_admin  on public.trails for update to authenticated using (public.is_trails_admin()) with check (true);

drop policy if exists places_read_public   on public.trail_places;
drop policy if exists places_insert_member on public.trail_places;
drop policy if exists places_update_admin  on public.trail_places;
create policy places_read_public   on public.trail_places for select using (status = 'approved' or user_id = auth.uid() or public.is_trails_admin());
create policy places_insert_member on public.trail_places for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy places_update_admin  on public.trail_places for update to authenticated using (public.is_trails_admin()) with check (true);

drop policy if exists ratings_read_public  on public.trail_ratings;
drop policy if exists ratings_write_member on public.trail_ratings;
drop policy if exists ratings_update_own   on public.trail_ratings;
drop policy if exists ratings_delete_own   on public.trail_ratings;
create policy ratings_read_public  on public.trail_ratings for select using (true);
create policy ratings_write_member on public.trail_ratings for insert to authenticated with check (user_id = auth.uid());
create policy ratings_update_own   on public.trail_ratings for update to authenticated using (user_id = auth.uid());
create policy ratings_delete_own   on public.trail_ratings for delete to authenticated using (user_id = auth.uid());
