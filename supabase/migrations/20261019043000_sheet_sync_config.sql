create table if not exists public.sheet_sync_config (
  id boolean primary key default true check (id),
  webhook_url text not null,
  sheet_name text not null default 'PHÂN BỔ NGÂN SÁCH',
  updated_at timestamptz not null default now()
);

alter table public.sheet_sync_config enable row level security;
revoke all on table public.sheet_sync_config from public, anon, authenticated;
grant select, insert, update on table public.sheet_sync_config to service_role;

comment on table public.sheet_sync_config is 'Private Google Sheet sync endpoint. Only Edge Functions using service role may read it.';
