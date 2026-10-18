begin;

create function public.delete_payment(p_id uuid, p_expected timestamptz)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item uuid;
  current_stamp timestamptz;
begin
  if not private.has_workspace_access() then
    raise exception 'Không có quyền truy cập.';
  end if;

  select item_id, updated_at
  into item, current_stamp
  from public.budget_transactions
  where id = p_id
  for update;

  if not found then
    raise exception 'Lần thanh toán đã được xóa.';
  end if;

  if p_expected is null or current_stamp <> p_expected then
    raise exception 'Lần thanh toán vừa thay đổi. Hãy mở lại.';
  end if;

  perform 1 from public.budget_items where id = item for update;
  if not found then
    raise exception 'Khoản ngân sách không tồn tại.';
  end if;

  delete from public.budget_transactions
  where id = p_id and updated_at = p_expected;

  if not found then
    raise exception 'Lần thanh toán vừa thay đổi. Hãy mở lại.';
  end if;
end;
$$;

revoke all on function public.delete_payment(uuid, timestamptz) from public, anon;
grant execute on function public.delete_payment(uuid, timestamptz) to authenticated;

commit;
