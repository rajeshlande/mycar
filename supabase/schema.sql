-- myCar schema v1. Run the entire file in the Supabase SQL Editor.
-- Idempotent for the v1 schema. Never deletes vehicle or expense data.
-- Money is stored as integer paise (INR); odometers are whole kilometres.
begin;

-- gen_random_uuid() is built into the PostgreSQL versions supported by Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 80),
  phone text not null default '' check (char_length(phone) <= 24),
  city text not null default '' check (char_length(city) <= 80),
  bio text not null default '' check (char_length(bio) <= 250),
  currency text not null default 'INR' check (currency = 'INR'),
  distance_unit text not null default 'km' check (distance_unit in ('km','mi')),
  monthly_budget_paise bigint not null default 0 check (monthly_budget_paise between 0 and 999999999),
  reminders_enabled boolean not null default true,
  reminder_days integer not null default 30 check (reminder_days in (7,14,30,60)),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  make text not null default '' check (char_length(make) <= 50),
  model text not null default '' check (char_length(model) <= 60),
  year integer check (year between 1900 and 2100),
  registration text not null default '' check (char_length(registration) <= 24),
  fuel_type text not null default 'Petrol' check (fuel_type in ('Petrol','Diesel','CNG','Electric','Hybrid')),
  transmission text not null default 'Manual' check (transmission in ('Manual','Automatic')),
  body_type text not null default 'SUV' check (body_type in ('SUV','Hatchback','Sedan','MPV','Other')),
  color text not null default 'silver' check (color in ('silver','white','black','blue','red','green')),
  odometer_km integer not null default 0 check (odometer_km between 0 and 2000000),
  purchase_date date,
  insurance_expiry date,
  service_due_date date,
  service_due_km integer check (service_due_km between 0 and 4000000),
  notes text not null default '' check (char_length(notes) <= 1000),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create unique index if not exists vehicles_one_primary_per_user on public.vehicles(user_id) where is_primary;
create unique index if not exists vehicles_registration_per_user on public.vehicles(user_id, upper(regexp_replace(registration, '\s+', '', 'g'))) where registration <> '';
create index if not exists vehicles_user_idx on public.vehicles(user_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehicle_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  category text not null check (category in ('fuel','service','insurance','parking','tolls','other')),
  amount_paise bigint not null check (amount_paise between 1 and 999999999),
  spent_on date not null default current_date,
  odometer_km integer check (odometer_km between 0 and 2000000),
  fuel_litres numeric(9,3) check (fuel_litres is null or (category = 'fuel' and fuel_litres > 0 and fuel_litres <= 1000)),
  vendor text not null default '' check (char_length(vendor) <= 100),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A composite foreign key prevents attaching an expense to someone else's vehicle,
  -- including during an update. RLS alone does not validate foreign-key targets.
  foreign key (vehicle_id, user_id) references public.vehicles(id, user_id) on delete cascade
);
create index if not exists expenses_user_date_idx on public.expenses(user_id, spent_on desc);
create index if not exists expenses_vehicle_date_idx on public.expenses(vehicle_id, spent_on desc);
create index if not exists expenses_user_category_idx on public.expenses(user_id, category);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public, anon, authenticated;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();
drop trigger if exists expenses_updated_at on public.expenses;
create trigger expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();

-- Only display metadata is copied. There are no user-controlled database roles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles (id, full_name)
select id, left(coalesce(raw_user_meta_data ->> 'full_name', ''), 80) from auth.users
on conflict (id) do nothing;

-- Enable RLS and remove inherited/default grants, including anon access.
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.expenses enable row level security;
revoke all on public.profiles, public.vehicles, public.expenses from public, anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.vehicles, public.expenses to authenticated;
-- profiles.id, created_at and updated_at cannot be changed by browser clients.
revoke update (id, created_at, updated_at) on public.profiles from authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists vehicles_select_own on public.vehicles;
create policy vehicles_select_own on public.vehicles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists vehicles_insert_own on public.vehicles;
create policy vehicles_insert_own on public.vehicles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists vehicles_update_own on public.vehicles;
create policy vehicles_update_own on public.vehicles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists vehicles_delete_own on public.vehicles;
create policy vehicles_delete_own on public.vehicles for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists expenses_select_own on public.expenses;
create policy expenses_select_own on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists expenses_insert_own on public.expenses;
create policy expenses_insert_own on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists expenses_update_own on public.expenses;
create policy expenses_update_own on public.expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists expenses_delete_own on public.expenses;
create policy expenses_delete_own on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);

-- Atomic primary-vehicle switching; the definer never trusts the caller's user_id.
create or replace function public.set_primary_vehicle(p_vehicle_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.vehicles where id = p_vehicle_id and user_id = (select auth.uid())) then
    raise exception 'Vehicle not found';
  end if;
  update public.vehicles set is_primary = false where user_id = (select auth.uid()) and is_primary;
  update public.vehicles set is_primary = true where id = p_vehicle_id and user_id = (select auth.uid());
end;
$$;
revoke all on function public.set_primary_vehicle(uuid) from public, anon, authenticated;
grant execute on function public.set_primary_vehicle(uuid) to authenticated;

commit;
