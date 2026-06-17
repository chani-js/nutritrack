-- ================================================================
-- NutriTrack — Schema Supabase
-- À coller dans l'éditeur SQL de ton projet Supabase
-- ================================================================

-- 1. Tables
create table public.food_logs (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  food_name     text        not null,
  calories      integer     not null,
  protein       numeric(6,1),
  carbs         numeric(6,1),
  fat           numeric(6,1),
  meal          text        check (meal in ('Petit-déjeuner','Déjeuner','Collation','Dîner')),
  date          date        not null default current_date,
  source        text        default 'manual' check (source in ('manual','photo')),
  created_at    timestamptz default now()
);

create table public.activity_logs (
  id               uuid        default gen_random_uuid() primary key,
  user_id          uuid        references auth.users(id) on delete cascade not null,
  activity_name    text        not null,
  duration_min     integer     not null,
  calories_burned  integer     not null,
  date             date        not null default current_date,
  created_at       timestamptz default now()
);

create table public.weight_logs (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  weight     numeric(5,1) not null,
  date       date         not null default current_date,
  created_at timestamptz  default now(),
  unique (user_id, date)
);

-- 2. RLS (Row Level Security)
alter table public.food_logs     enable row level security;
alter table public.activity_logs enable row level security;
alter table public.weight_logs   enable row level security;

-- 3. Policies : chaque utilisateur ne voit que ses propres données
create policy "food_logs: user crud"
  on public.food_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "activity_logs: user crud"
  on public.activity_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weight_logs: user crud"
  on public.weight_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Index pour les requêtes fréquentes (date du jour)
create index on public.food_logs     (user_id, date);
create index on public.activity_logs (user_id, date);
create index on public.weight_logs   (user_id, date);
