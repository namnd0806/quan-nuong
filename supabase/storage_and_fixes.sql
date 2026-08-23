-- ============================================================
--  QUÁN NƯỚNG — Storage + vá dữ liệu cũ
--  Chạy 1 lần trong Supabase SQL Editor (sau schema.sql).
-- ============================================================

-- 1) BUCKET ẢNH (công khai) cho ảnh món ăn & logo nhà cung cấp -------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Chính sách Storage: ai cũng xem được (public), người đã đăng nhập thì tải/sửa/xóa.
drop policy if exists "images public read" on storage.objects;
create policy "images public read"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "images auth insert" on storage.objects;
create policy "images auth insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'images');

drop policy if exists "images auth update" on storage.objects;
create policy "images auth update"
  on storage.objects for update to authenticated
  using (bucket_id = 'images');

drop policy if exists "images auth delete" on storage.objects;
create policy "images auth delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'images');

-- 2) VÁ DỮ LIỆU HẠNG MỤC CŨ (tên icon lucide + từ khóa màu) ----------------
--    Chuyển sang emoji + màu HSL hợp lệ để không bị lỗi hiển thị.
update main_categories set icon = '🏗️' where icon = 'Building2';
update main_categories set icon = '🎨' where icon = 'PencilRuler';
update main_categories set icon = '🪑' where icon = 'Armchair';
update main_categories set icon = '🍽️' where icon = 'UtensilsCrossed';
update main_categories set icon = '📣' where icon = 'Megaphone';
update main_categories set icon = '⚙️' where icon = 'Settings2';
update main_categories set icon = '📦' where icon ~ '^[A-Za-z]';

update main_categories set color = 'hsl(221 83% 53%)' where color = 'primary';
update main_categories set color = 'hsl(199 89% 48%)' where color = 'info';
update main_categories set color = 'hsl(160 84% 39%)' where color = 'success';
update main_categories set color = 'hsl(38 92% 50%)'  where color = 'warning';
update main_categories set color = 'hsl(0 72% 58%)'   where color = 'destructive';
update main_categories set color = 'hsl(262 83% 66%)' where color = 'purple';
update main_categories set color = 'hsl(215 20% 40%)' where color is null or color !~ '^(hsl|#|rgb)';
