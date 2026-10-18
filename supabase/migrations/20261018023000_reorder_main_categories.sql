create or replace function public.reorder_main_categories(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  category_count integer;
  unique_count integer;
begin
  if not private.has_workspace_access() then
    raise exception 'Không có quyền truy cập.';
  end if;
  if p_ids is null or cardinality(p_ids) = 0 then
    raise exception 'Danh sách nhóm không hợp lệ.';
  end if;

  select count(*) into category_count from public.main_categories;
  select count(*) into unique_count from (select distinct unnest(p_ids)) ids;

  if cardinality(p_ids) <> category_count
     or unique_count <> category_count
     or exists (select 1 from public.main_categories where not (id = any(p_ids))) then
    raise exception 'Danh sách nhóm đã thay đổi. Hãy tải lại rồi thử lại.';
  end if;

  perform 1 from public.main_categories order by id for update;

  update public.main_categories c
  set sort = ordered.position::integer,
      updated_at = now()
  from unnest(p_ids) with ordinality as ordered(id, position)
  where c.id = ordered.id;
end;
$$;

revoke all on function public.reorder_main_categories(uuid[]) from public, anon;
grant execute on function public.reorder_main_categories(uuid[]) to authenticated;
