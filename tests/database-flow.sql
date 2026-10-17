-- Run as the project SQL administrator. Every fixture is rolled back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles order by created_at limit 1),true);
set local role authenticated;
do $$ declare item uuid; s uuid; total bigint; old_product uuid; task uuid; dish uuid; begin
 insert into public.budget_items(name,planned) values('__audit_rollback__',100) returning id into item;
 perform public.set_budget_actual(item,40,0);
 perform public.set_budget_actual(item,15,40);
 select sum(amount) into total from public.budget_transactions where item_id=item;
 if total<>15 then raise exception 'budget adjustment failed'; end if;
 begin
   perform public.set_budget_actual(item,70,40);
   raise exception 'stale write was accepted';
 exception when raise_exception then
   if sqlerrm='stale write was accepted' then raise; end if;
 end;
 s:=public.save_supplier_with_products(null,'{"name":"__audit_rollback__","status":"active"}',array['A','B']);
 select id into old_product from public.supplier_products where supplier_id=s and name='A';
 update public.supplier_products set price=99,unit='kg' where id=old_product;
 perform public.save_supplier_with_products(s,'{"name":"__audit_updated__","status":"active"}',array['A','C']);
 if not exists(select 1 from public.supplier_products where id=old_product and price=99 and unit='kg') then raise exception 'product metadata lost'; end if;
 if (select count(*) from public.supplier_products where supplier_id=s)<>2 then raise exception 'products mismatch'; end if;
 insert into public.checklist_tasks(title) values('__audit_rollback__') returning id into task;
 update public.checklist_tasks set status='done' where id=task;
 if not exists(select 1 from public.checklist_tasks where id=task and status='done') then raise exception 'task update failed'; end if;
 delete from public.checklist_tasks where id=task;
 insert into public.menu_items(name,sell,cost,variable_costs) values('__audit_rollback__',100,30,'[{"name":"Sauce","cost":5}]') returning id into dish;
 if (select variable_costs->0->>'cost' from public.menu_items where id=dish)<>'5' then raise exception 'menu costs failed'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.budget_items) or exists(select 1 from public.profiles) then raise exception 'unapproved user can read'; end if;
 begin
   insert into public.notes(title) values('__forbidden__');
   raise exception 'unapproved user can write';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
select 'PASS: budget adjustment/conflict, supplier metadata, task CRUD, menu JSONB, unauthorized access denied; fixtures rolled back' result;
