begin;

with legacy_names as (
  select btrim(dept) as name from public.checklist_tasks where category_id is null and nullif(btrim(dept),'') is not null
  union
  select btrim(category) from public.budget_items where category_id is null and nullif(btrim(category),'') is not null
), numbered as (
  select name,row_number() over(order by name) as position from legacy_names
), current_sort as (
  select coalesce(max(sort),0) as maximum from public.main_categories
)
insert into public.main_categories(name,icon,sort)
select n.name,
  case
    when lower(n.name) like '%thiết bị%' then 'equipment'
    when lower(n.name) like '%xây dựng%' then 'building'
    else 'folder'
  end,
  c.maximum+n.position
from numbered n cross join current_sort c
where not exists (
  select 1 from public.main_categories g where lower(btrim(g.name))=lower(n.name)
);

update public.checklist_tasks t
set category_id=g.id,dept=g.name
from public.main_categories g
where t.category_id is null and lower(btrim(t.dept))=lower(btrim(g.name));

update public.budget_items b
set category_id=g.id,category=g.name
from public.main_categories g
where b.category_id is null and lower(btrim(b.category))=lower(btrim(g.name));

commit;
