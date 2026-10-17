-- Repair the existing application contract without replacing business records.
begin;

alter table public.menu_items add column if not exists variable_costs jsonb not null default '[]'::jsonb;
update public.menu_items
set variable_costs = jsonb_build_array(jsonb_build_object('name', 'Chi phí biến đổi cũ', 'cost', variable_cost))
where variable_cost > 0 and variable_costs = '[]'::jsonb;
alter table public.menu_items add constraint menu_variable_costs_array check (jsonb_typeof(variable_costs) = 'array');

alter function public.set_updated_at() set search_path = pg_catalog, public;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- This app is a private, single workspace shared by its existing accounts.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create table private.workspace_access (
  user_id uuid primary key references auth.users(id) on delete cascade
);
insert into private.workspace_access(user_id) select id from public.profiles;
alter table private.workspace_access enable row level security;
revoke all on private.workspace_access from public, anon, authenticated;
create function private.has_workspace_access()
returns boolean language sql stable security definer set search_path = ''
as $$ select auth.uid() is not null and exists(select 1 from private.workspace_access where user_id = auth.uid()) $$;
revoke all on function private.has_workspace_access() from public, anon;
grant execute on function private.has_workspace_access() to authenticated;

do $$ declare t text; begin
  foreach t in array array['profiles','members','main_categories','lookups','checklist_tasks',
    'budget_items','budget_transactions','menu_items','menu_ingredients','suppliers',
    'supplier_products','notes','notifications','settings','activity_logs','decisions','decision_options']
  loop
    execute format('drop policy if exists auth_all on public.%I', t);
    execute format('create policy workspace_access on public.%I for all to authenticated using ((select private.has_workspace_access())) with check ((select private.has_workspace_access()))', t);
  end loop;
end $$;

drop policy if exists "images auth insert" on storage.objects;
drop policy if exists "images auth update" on storage.objects;
drop policy if exists "images auth delete" on storage.objects;
create policy "images auth insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and (select private.has_workspace_access()));
create policy "images auth update" on storage.objects for update to authenticated
  using (bucket_id = 'images' and (select private.has_workspace_access()))
  with check (bucket_id = 'images' and (select private.has_workspace_access()));
create policy "images auth delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and (select private.has_workspace_access()));

do $$ declare t text; begin
  foreach t in array array['profiles','members','main_categories','lookups','menu_ingredients'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Serialize direct transaction inserts with edits to an item's total.
create function public.lock_budget_item() returns trigger language plpgsql security invoker
set search_path = '' as $$ begin
  perform 1 from public.budget_items where id = new.item_id for update;
  return new;
end $$;
revoke execute on function public.lock_budget_item() from public, anon, authenticated;
create trigger lock_budget_item before insert on public.budget_transactions
for each row execute function public.lock_budget_item();

create function public.set_budget_actual(p_item_id uuid, p_actual bigint, p_expected bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare current_actual bigint;
begin
  if auth.uid() is null or not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
  if p_actual is null or p_actual < 0 or p_actual > 9007199254740991 then raise exception 'Số tiền không hợp lệ.'; end if;
  perform 1 from public.budget_items where id=p_item_id for update;
  if not found then raise exception 'Khoản ngân sách không tồn tại.'; end if;
  select coalesce(sum(amount),0) into current_actual from public.budget_transactions where item_id=p_item_id;
  if p_expected is distinct from current_actual then
    raise exception 'Thực chi vừa được thay đổi. Hãy tải lại trước khi sửa.';
  end if;
  if p_actual <> current_actual then
    insert into public.budget_transactions(item_id,amount,spent_at,note)
    values(p_item_id,p_actual-current_actual,(now() at time zone 'Asia/Ho_Chi_Minh')::date,
      format('Điều chỉnh thực chi từ %s thành %s', current_actual,p_actual));
  end if;
  return p_actual;
end $$;
revoke all on function public.set_budget_actual(uuid,bigint,bigint) from public, anon;
grant execute on function public.set_budget_actual(uuid,bigint,bigint) to authenticated;

-- Save the supplier and product list together; keep metadata of unchanged products.
create function public.save_supplier_with_products(p_id uuid, p_values jsonb, p_products text[])
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_supplier_id uuid; product_name text;
begin
  if auth.uid() is null or not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
  if nullif(btrim(p_values->>'name'),'') is null then raise exception 'Nhập tên nhà cung cấp.'; end if;
  if p_values->>'status' not in ('active','considering','inactive') then raise exception 'Trạng thái không hợp lệ.'; end if;
  if p_id is null then
    insert into public.suppliers(name,code,email,address,tag,tag_color,status,note,logo_url)
    values(btrim(p_values->>'name'),p_values->>'code',p_values->>'email',p_values->>'address',
      p_values->>'tag',p_values->>'tag_color',coalesce(p_values->>'status','active'),p_values->>'note',p_values->>'logo_url')
    returning id into v_supplier_id;
  else
    update public.suppliers set name=btrim(p_values->>'name'),code=p_values->>'code',email=p_values->>'email',
      address=p_values->>'address',tag=p_values->>'tag',tag_color=p_values->>'tag_color',
      status=coalesce(p_values->>'status','active'),note=p_values->>'note',logo_url=p_values->>'logo_url'
    where id=p_id returning id into v_supplier_id;
    if not found then raise exception 'Nhà cung cấp không tồn tại.'; end if;
  end if;
  delete from public.supplier_products p where p.supplier_id=v_supplier_id
    and not exists(select 1 from unnest(coalesce(p_products,array[]::text[])) n where btrim(n)=p.name);
  for product_name in select distinct btrim(n) from unnest(coalesce(p_products,array[]::text[])) n where nullif(btrim(n),'') is not null loop
    if not exists(select 1 from public.supplier_products p where p.supplier_id=v_supplier_id and p.name=product_name) then
      insert into public.supplier_products(supplier_id,name) values(v_supplier_id,product_name);
    end if;
  end loop;
  return v_supplier_id;
end $$;
revoke all on function public.save_supplier_with_products(uuid,jsonb,text[]) from public, anon;
grant execute on function public.save_supplier_with_products(uuid,jsonb,text[]) to authenticated;
commit;
