begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles order by created_at limit 1),true);
set local role authenticated;
do $$
declare g uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); t uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); p2 uuid:=gen_random_uuid();
 m uuid; m2 uuid; r jsonb; stamp timestamptz;
begin
 select id into m from public.members order by sort limit 1;
 select id into m2 from public.members order by sort offset 1 limit 1;
 insert into public.main_categories(id,name,icon) values(g,'__planning_rollback__','tools');
 r:=public.save_planning_record('budget',b,jsonb_build_object('title','Audit budget','category_id',g,'planned',100,'agreed_amount',90,'status','pending','attachments','[]'::jsonb));
 if r->>'name'<>'Audit budget' then raise exception 'budget create failed'; end if;
 r:=public.save_planning_record('tasks',t,jsonb_build_object('title','Audit task','category_id',g,'status','waiting','priority','high','assignee','Cả hai','linked_budget_id',b,'attachments','[]'::jsonb));
 stamp:=(r->>'updated_at')::timestamptz;
 perform public.save_planning_record('tasks',t,jsonb_build_object('title','Audit task saved','category_id',g,'status','done','priority','high','linked_budget_id',b),stamp);
 begin
  perform public.save_planning_record('tasks',t,jsonb_build_object('title','Stale','category_id',g,'status','todo','priority','high'),stamp-interval '1 second');
  raise exception 'stale task accepted';
 exception when raise_exception then if sqlerrm='stale task accepted' then raise; end if; end;
 r:=public.save_payment(p,jsonb_build_object('item_id',b,'payer_id',m,'amount',20,'spent_at','2026-10-17','attachments','[]'::jsonb));
 stamp:=(r->>'updated_at')::timestamptz;
 perform public.save_payment(p,jsonb_build_object('item_id',b,'payer_id',m,'amount',20,'spent_at','2026-10-17'));
 if (select count(*) from public.budget_transactions where item_id=b)<>1 then raise exception 'duplicate payment'; end if;
 perform public.save_payment(p2,jsonb_build_object('item_id',b,'payer_id',m2,'amount',10,'spent_at','2026-10-17'));
 if (select sum(amount) from public.budget_transactions where item_id=b and voided_at is null)<>30 then raise exception 'sum mismatch'; end if;
 perform public.save_payment(p,jsonb_build_object('item_id',b,'payer_id',m,'amount',25,'spent_at','2026-10-17'),stamp);
 select updated_at into stamp from public.budget_transactions where id=p;
 perform public.void_payment(p,'Audit cancel',stamp);
 if (select sum(amount) from public.budget_transactions where item_id=b and voided_at is null)<>10 then raise exception 'void still counted'; end if;
 if not exists(select 1 from public.budget_transactions where id=p and void_reason='Audit cancel' and voided_at is not null) then raise exception 'void history lost'; end if;
 begin
  perform public.save_payment(gen_random_uuid(),jsonb_build_object('item_id',b,'payer_id',m,'amount',-10,'spent_at','2026-10-17'));
  raise exception 'negative amount accepted';
 exception when raise_exception then if sqlerrm='negative amount accepted' then raise; end if; end;
 update public.main_categories set name='__planning_renamed__' where id=g;
 if not exists(select 1 from public.checklist_tasks where id=t and dept='__planning_renamed__') or not exists(select 1 from public.budget_items where id=b and category='__planning_renamed__') then raise exception 'group rename mismatch'; end if;
 if (select count(*) from public.workspace_events where entity_id=b)<4 then raise exception 'history missing'; end if;
 begin
  delete from public.budget_items where id=b;
  raise exception 'budget payment history deleted';
 exception when raise_exception then if sqlerrm='budget payment history deleted' then raise; end if; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.workspace_events) then raise exception 'outsider can read history'; end if;
 if exists(select 1 from storage.objects where bucket_id='workspace-files') then raise exception 'outsider can read attachments'; end if;
 begin
  perform public.save_payment(gen_random_uuid(),'{}'::jsonb);
  raise exception 'outsider can write';
 exception when raise_exception then if sqlerrm='outsider can write' then raise; end if; end;
end $$;
rollback;
select 'PASS: groups, task/budget CRUD, linked records, stale edits, payment retries, both payers, totals, void history, immutable payment history and access control; fixtures rolled back' result;
