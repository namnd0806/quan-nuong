begin;
alter table public.checklist_tasks
  add column category_id uuid references public.main_categories(id) on delete restrict,
  add column linked_budget_id uuid references public.budget_items(id) on delete set null;
alter table public.budget_items
  add column category_id uuid references public.main_categories(id) on delete restrict,
  add column agreed_amount bigint check (agreed_amount >= 0),
  add column attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments)='array');
alter table public.budget_transactions
  add column payer_id uuid references public.members(id) on delete restrict,
  add column attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments)='array'),
  add column updated_at timestamptz not null default now(),
  add column voided_at timestamptz,
  add column void_reason text;
create trigger set_updated_at before update on public.budget_transactions
  for each row execute function public.set_updated_at();
create index checklist_category_idx on public.checklist_tasks(category_id);
create index checklist_budget_idx on public.checklist_tasks(linked_budget_id);
create index budget_category_idx on public.budget_items(category_id);
create index budget_payer_idx on public.budget_transactions(payer_id);

update public.checklist_tasks t set category_id=c.id from public.main_categories c where t.dept=c.name;
update public.budget_items t set category_id=c.id from public.main_categories c where t.category=c.name;

create table public.workspace_events (
 id uuid primary key default gen_random_uuid(),
 entity_type text not null,
 entity_id uuid not null,
 action text not null,
 actor_id uuid references auth.users(id) on delete set null,
 actor_name text not null,
 created_at timestamptz not null default now()
);
create index workspace_events_entity_idx on public.workspace_events(entity_type,entity_id,created_at desc);
alter table public.workspace_events enable row level security;
revoke all on public.workspace_events from anon,authenticated;
grant select on public.workspace_events to authenticated;
create policy workspace_events_read on public.workspace_events for select to authenticated
 using ((select private.has_workspace_access()));
create function private.log_workspace_event() returns trigger language plpgsql security definer set search_path='' as $$
declare actor text; record_id uuid; verb text;
begin
 if auth.uid() is null then return new; end if;
 if not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
 select name into actor from public.profiles where id=auth.uid();
 record_id:=new.id;
 verb:=case when tg_op='INSERT' then 'đã tạo' else 'đã cập nhật' end;
 if tg_table_name='budget_transactions' then
   if tg_op='UPDATE' and new.voided_at is not null and old.voided_at is null then verb:='đã hủy khoản chi'; end if;
   insert into public.workspace_events(entity_type,entity_id,action,actor_id,actor_name)
   values('budget_items',new.item_id,verb || case when verb='đã hủy khoản chi' then '' else ' khoản chi' end,auth.uid(),coalesce(actor,'Thành viên'));
 else
   insert into public.workspace_events(entity_type,entity_id,action,actor_id,actor_name)
   values(tg_table_name,record_id,verb,auth.uid(),coalesce(actor,'Thành viên'));
 end if;
 return new;
end $$;
revoke all on function private.log_workspace_event() from public,anon,authenticated;
create trigger log_workspace after insert or update on public.checklist_tasks for each row execute function private.log_workspace_event();
create trigger log_workspace after insert or update on public.budget_items for each row execute function private.log_workspace_event();
create trigger log_workspace after insert or update on public.budget_transactions for each row execute function private.log_workspace_event();

create function public.save_planning_record(p_kind text,p_id uuid,p_values jsonb,p_expected timestamptz default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb; group_name text; group_id uuid; old_stamp timestamptz; v_title text;
begin
 if not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
 if p_kind not in ('tasks','budget') or p_kind is null then raise exception 'Loại bản ghi không hợp lệ.'; end if;
 group_id:=nullif(p_values->>'category_id','')::uuid;
 if group_id is not null then
   select name into group_name from public.main_categories where id=group_id;
   if not found then raise exception 'Nhóm đã bị xóa. Hãy tải lại.'; end if;
 else
   group_name:=nullif(btrim(p_values->>'category'),'');
 end if;
 if group_name is null then raise exception 'Hãy chọn nhóm.'; end if;
 v_title:=btrim(p_values->>'title');
 if v_title is null or length(v_title)=0 or length(v_title)>300 then raise exception 'Tên cần có từ 1 đến 300 ký tự.'; end if;
 if jsonb_typeof(coalesce(p_values->'attachments','[]'::jsonb))<>'array' then raise exception 'Tệp không hợp lệ.'; end if;
 if p_kind='tasks' then
   if p_values->>'status' not in ('todo','doing','waiting','paused','done','overdue') or p_values->>'priority' not in ('low','medium','high','urgent') then raise exception 'Trạng thái hoặc ưu tiên không hợp lệ.'; end if;
   select updated_at into old_stamp from public.checklist_tasks where id=p_id for update;
   if found then
     if p_expected is null then return (select to_jsonb(t) from public.checklist_tasks t where id=p_id); end if;
     if old_stamp<>p_expected then raise exception 'Công việc vừa được sửa ở thiết bị khác. Hãy đóng và mở lại.'; end if;
     update public.checklist_tasks set title=v_title,description=p_values->>'description',
       dept=group_name,category_id=group_id,assignee=nullif(p_values->>'assignee',''),
       deadline=nullif(p_values->>'deadline','')::date,priority=p_values->>'priority',status=p_values->>'status',
       linked_budget_id=nullif(p_values->>'linked_budget_id','')::uuid,attachments=coalesce(p_values->'attachments','[]'::jsonb)
     where id=p_id returning to_jsonb(checklist_tasks.*) into result;
   else
     if p_expected is not null then raise exception 'Công việc đã bị xóa.'; end if;
     insert into public.checklist_tasks(id,title,description,dept,category_id,assignee,deadline,priority,status,linked_budget_id,attachments)
     values(p_id,v_title,p_values->>'description',group_name,group_id,nullif(p_values->>'assignee',''),nullif(p_values->>'deadline','')::date,
       p_values->>'priority',p_values->>'status',nullif(p_values->>'linked_budget_id','')::uuid,coalesce(p_values->'attachments','[]'::jsonb))
     returning to_jsonb(checklist_tasks.*) into result;
   end if;
 else
   if (p_values->>'planned')::bigint < 0 or coalesce((p_values->>'agreed_amount')::bigint,0)<0 then raise exception 'Số tiền phải không âm.'; end if;
   if p_values->>'status' not in ('pending','partial','paid') then raise exception 'Trạng thái không hợp lệ.'; end if;
   select updated_at into old_stamp from public.budget_items where id=p_id for update;
   if found then
     if p_expected is null then return (select to_jsonb(t) from public.budget_items t where id=p_id); end if;
     if old_stamp<>p_expected then raise exception 'Khoản ngân sách vừa được sửa. Hãy đóng và mở lại.'; end if;
     update public.budget_items set name=v_title,category=group_name,category_id=group_id,planned=(p_values->>'planned')::bigint,
       agreed_amount=nullif(p_values->>'agreed_amount','')::bigint,status=p_values->>'status',owner=nullif(p_values->>'owner',''),
       note=p_values->>'note',attachments=coalesce(p_values->'attachments','[]'::jsonb)
     where id=p_id returning to_jsonb(budget_items.*) into result;
   else
     if p_expected is not null then raise exception 'Khoản ngân sách đã bị xóa.'; end if;
     insert into public.budget_items(id,name,category,category_id,planned,agreed_amount,status,owner,note,attachments)
     values(p_id,v_title,group_name,group_id,(p_values->>'planned')::bigint,nullif(p_values->>'agreed_amount','')::bigint,
       p_values->>'status',nullif(p_values->>'owner',''),p_values->>'note',coalesce(p_values->'attachments','[]'::jsonb))
     returning to_jsonb(budget_items.*) into result;
   end if;
 end if;
 return result;
end $$;
revoke all on function public.save_planning_record(text,uuid,jsonb,timestamptz) from public,anon;
grant execute on function public.save_planning_record(text,uuid,jsonb,timestamptz) to authenticated;

create function public.save_payment(p_id uuid,p_values jsonb,p_expected timestamptz default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old_row public.budget_transactions; result jsonb; item uuid; payer uuid; amount_value bigint;
begin
 if not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
 item:=(p_values->>'item_id')::uuid;
 payer:=nullif(p_values->>'payer_id','')::uuid;
 amount_value:=(p_values->>'amount')::bigint;
 if payer is null or amount_value is null or amount_value<=0 or amount_value>9007199254740991 then raise exception 'Chọn người trả và nhập số tiền lớn hơn 0.'; end if;
 perform 1 from public.budget_items where id=item for update;
 if not found then raise exception 'Khoản ngân sách không tồn tại.'; end if;
 select * into old_row from public.budget_transactions where id=p_id for update;
 if found then
   if p_expected is null then return to_jsonb(old_row); end if;
   if old_row.updated_at<>p_expected or old_row.voided_at is not null or old_row.item_id<>item then raise exception 'Khoản chi vừa thay đổi. Hãy mở lại.'; end if;
   update public.budget_transactions set amount=amount_value,payer_id=payer,spent_at=(p_values->>'spent_at')::date,
     note=p_values->>'note',attachments=coalesce(p_values->'attachments','[]'::jsonb)
   where id=p_id returning to_jsonb(budget_transactions.*) into result;
 else
   if p_expected is not null then raise exception 'Khoản chi đã bị xóa.'; end if;
   insert into public.budget_transactions(id,item_id,payer_id,amount,spent_at,note,attachments)
   values(p_id,item,payer,amount_value,(p_values->>'spent_at')::date,p_values->>'note',coalesce(p_values->'attachments','[]'::jsonb))
   returning to_jsonb(budget_transactions.*) into result;
 end if;
 return result;
end $$;
revoke all on function public.save_payment(uuid,jsonb,timestamptz) from public,anon;
grant execute on function public.save_payment(uuid,jsonb,timestamptz) to authenticated;

create function public.void_payment(p_id uuid,p_reason text,p_expected timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare item uuid;
begin
 if not private.has_workspace_access() then raise exception 'Không có quyền truy cập.'; end if;
 if nullif(btrim(p_reason),'') is null then raise exception 'Nhập lý do hủy khoản chi.'; end if;
 select item_id into item from public.budget_transactions where id=p_id;
 perform 1 from public.budget_items where id=item for update;
 update public.budget_transactions set voided_at=now(),void_reason=btrim(p_reason)
 where id=p_id and updated_at=p_expected and voided_at is null;
 if not found then raise exception 'Khoản chi vừa thay đổi. Hãy mở lại.'; end if;
end $$;
revoke all on function public.void_payment(uuid,text,timestamptz) from public,anon;
grant execute on function public.void_payment(uuid,text,timestamptz) to authenticated;

create function public.sync_group_name() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.name<>old.name then
   update public.checklist_tasks set dept=new.name,category_id=new.id where category_id=new.id or (category_id is null and dept=old.name);
   update public.budget_items set category=new.name,category_id=new.id where category_id=new.id or (category_id is null and category=old.name);
 end if;
 return new;
end $$;
revoke all on function public.sync_group_name() from public,anon,authenticated;
create trigger sync_group_name after update of name on public.main_categories for each row execute function public.sync_group_name();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('workspace-files','workspace-files',false,8388608,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do nothing;
create policy workspace_files_read on storage.objects for select to authenticated
 using(bucket_id='workspace-files' and (select private.has_workspace_access()));
create policy workspace_files_insert on storage.objects for insert to authenticated
 with check(bucket_id='workspace-files' and (select private.has_workspace_access()));
alter publication supabase_realtime add table public.workspace_events;
commit;
