-- ============================================================
--  QUÁN NƯỚNG — Supabase schema (chạy 1 lần trong SQL Editor)
--  Single-workspace, 2 chủ quán. RLS: chỉ user đã đăng nhập.
-- ============================================================

create extension if not exists "pgcrypto";

-- updated_at helper -----------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============================================================
--  PROFILES (gắn với auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Người dùng',
  role text not null default 'owner',           -- owner = chủ quán
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tự tạo profile khi có user mới trong auth.users
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'owner'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
--  MEMBERS (người phụ trách — không cần tài khoản đăng nhập)
-- ============================================================
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,                                     -- vai trò mô tả
  badge text default 'Thành viên',               -- Chủ quản | Quản lý | Thành viên
  avatar_url text,
  sort int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
--  MAIN CATEGORIES (hạng mục chính — dùng ở Checklist & Settings)
-- ============================================================
create table if not exists main_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  sort int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
--  LOOKUPS (danh mục dùng chung: đơn vị tính, trạng thái, ưu tiên, danh mục NCC/thiết bị)
-- ============================================================
create table if not exists lookups (
  id uuid primary key default gen_random_uuid(),
  type text not null,          -- supplier_category | equipment_category | unit | task_status | priority
  label text not null,
  value text,
  color text,
  sort int default 0,
  created_at timestamptz not null default now()
);
create index if not exists lookups_type_idx on lookups(type);

-- ============================================================
--  CHECKLIST
-- ============================================================
create table if not exists checklist_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  dept text,                   -- hạng mục
  assignee text,               -- tên người phụ trách
  deadline date,
  priority text not null default 'medium',   -- high | medium | low
  status text not null default 'todo',       -- todo | doing | done | overdue
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
--  BUDGET (dự toán) + TRANSACTIONS (thực chi)
-- ============================================================
create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  planned bigint not null default 0,          -- dự toán
  status text not null default 'pending',     -- pending | partial | paid
  note text,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists budget_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references budget_items(id) on delete cascade,
  amount bigint not null default 0,
  spent_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists budget_tx_item_idx on budget_transactions(item_id);

-- ============================================================
--  MENU & FOOD COST
-- ============================================================
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  img text,                    -- emoji hoặc url ảnh
  image_url text,
  cat text,                    -- danh mục món
  sell bigint not null default 0,
  cost bigint not null default 0,
  target int not null default 30,             -- mục tiêu food cost %
  status text not null default 'ok',          -- ok | over
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists menu_ingredients (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references menu_items(id) on delete cascade,
  name text not null,
  qty text,
  cost bigint not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists menu_ing_menu_idx on menu_ingredients(menu_id);

-- ============================================================
--  SUPPLIERS + PRODUCTS
-- ============================================================
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,                   -- SĐT
  email text,
  address text,
  tag text,                    -- danh mục
  tag_color text,
  status text not null default 'active',      -- active | considering | inactive
  note text,
  logo_url text,
  last_order date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete cascade,
  name text not null,
  unit text,
  price bigint default 0,
  note text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists supplier_products_sup_idx on supplier_products(supplier_id);

-- ============================================================
--  DECISIONS (chờ quyết định giữa 2 chủ quán)
-- ============================================================
create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending',     -- pending | decided
  final_option text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists decision_options (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references decisions(id) on delete cascade,
  label text not null,
  votes jsonb default '[]'::jsonb,             -- danh sách user đồng ý
  created_at timestamptz not null default now()
);
create index if not exists decision_opt_idx on decision_options(decision_id);

-- ============================================================
--  NOTES / NOTIFICATIONS / ACTIVITY / SETTINGS
-- ============================================================
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  tag text default 'general',
  author text,
  pinned boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text,
  target text,
  type text default 'update',
  is_read boolean default false,
  created_at timestamptz not null default now()
);
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text,
  entity text,
  created_at timestamptz not null default now()
);
create table if not exists settings (
  id int primary key default 1,
  project_name text default 'Quán Nướng 01',
  address text,
  currency text default 'VND',
  budget_total bigint default 500000000,
  food_cost_target int default 30,
  start_date date,
  opening_date date,
  description text,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- ============================================================
--  updated_at triggers
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','members','main_categories','checklist_tasks','budget_items',
    'menu_items','suppliers','supplier_products','decisions','notes','settings'
  ] loop
    execute format('drop trigger if exists set_updated_at on %I;', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ============================================================
--  ROW LEVEL SECURITY — chỉ user đã đăng nhập được truy cập
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','members','main_categories','lookups','checklist_tasks',
    'budget_items','budget_transactions','menu_items','menu_ingredients',
    'suppliers','supplier_products','decisions','decision_options',
    'notes','notifications','activity_logs','settings'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists auth_all on %I;', t);
    execute format(
      'create policy auth_all on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ============================================================
--  REALTIME — bật realtime cho các bảng cần đồng bộ 2 chủ quán
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'checklist_tasks','budget_items','budget_transactions','menu_items',
    'suppliers','supplier_products','decisions','decision_options',
    'notes','notifications','settings'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table %I;', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
