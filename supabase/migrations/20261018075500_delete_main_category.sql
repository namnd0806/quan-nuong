begin;
create function public.delete_main_category(p_id uuid, p_move_to uuid default null)
returns void language plpgsql security invoker set search_path='' as $$
declare source_name text; target_name text; has_records boolean;
begin
 if not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
 if p_id is null or p_id=p_move_to then raise exception 'Chọn nhóm nhận dữ liệu khác.'; end if;
 perform 1 from public.main_categories where id in (p_id,p_move_to) order by id for update;
 select name into source_name from public.main_categories where id=p_id;
 if not found then raise exception 'Nhóm đã được xóa. Hãy tải lại.'; end if;
 select exists(select 1 from public.checklist_tasks where category_id=p_id or (category_id is null and dept=source_name))
     or exists(select 1 from public.budget_items where category_id=p_id or (category_id is null and category=source_name)) into has_records;
 if p_move_to is not null then
   select name into target_name from public.main_categories where id=p_move_to;
   if not found then raise exception 'Nhóm nhận dữ liệu không tồn tại.'; end if;
 elsif has_records then
   raise exception 'Nhóm có dữ liệu. Hãy chọn nhóm để chuyển sang.';
 end if;
 if p_move_to is not null then
   update public.checklist_tasks set category_id=p_move_to,dept=target_name where category_id=p_id or (category_id is null and dept=source_name);
   update public.budget_items set category_id=p_move_to,category=target_name where category_id=p_id or (category_id is null and category=source_name);
 end if;
 delete from public.main_categories where id=p_id;
end $$;
revoke all on function public.delete_main_category(uuid,uuid) from public,anon;
grant execute on function public.delete_main_category(uuid,uuid) to authenticated;
commit;
