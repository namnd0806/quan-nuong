begin;
-- Prevent erasing real payment history by deleting a budget item.
create function private.protect_budget_history() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.budget_transactions where item_id=old.id) then
   raise exception 'Khoản ngân sách đã có giao dịch. Hãy giữ lại để bảo toàn lịch sử.';
 end if;
 return old;
end $$;
revoke all on function private.protect_budget_history() from public,anon,authenticated;
create trigger protect_budget_history before delete on public.budget_items
for each row execute function private.protect_budget_history();

create unique index main_categories_normalized_name_idx on public.main_categories(lower(btrim(name)));

create or replace function public.set_budget_actual(p_item_id uuid,p_actual bigint,p_expected bigint)
returns bigint language plpgsql security invoker set search_path='' as $$
declare current_actual bigint;
begin
 if not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
 if p_actual is null or p_actual<0 or p_actual>9007199254740991 then raise exception 'Số tiền không hợp lệ.'; end if;
 perform 1 from public.budget_items where id=p_item_id for update;
 if not found then raise exception 'Khoản ngân sách không tồn tại.'; end if;
 select coalesce(sum(amount),0) into current_actual from public.budget_transactions where item_id=p_item_id and voided_at is null;
 if p_expected is distinct from current_actual then raise exception 'Thực chi vừa thay đổi. Hãy tải lại.'; end if;
 if p_actual<>current_actual then
   insert into public.budget_transactions(item_id,amount,spent_at,note)
   values(p_item_id,p_actual-current_actual,(now() at time zone 'Asia/Ho_Chi_Minh')::date,format('Điều chỉnh thực chi từ %s thành %s',current_actual,p_actual));
 end if;
 return p_actual;
end $$;
commit;
