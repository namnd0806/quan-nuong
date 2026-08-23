-- ============================================================
--  QUÁN NƯỚNG — dữ liệu mẫu (chạy SAU schema.sql)
--  An toàn chạy lại: xóa dữ liệu cũ rồi nạp lại.
-- ============================================================

truncate table
  budget_transactions, budget_items, menu_ingredients, menu_items,
  supplier_products, suppliers, checklist_tasks, decision_options, decisions,
  notes, notifications, activity_logs, members, main_categories, lookups
  restart identity cascade;

-- SETTINGS ---------------------------------------------------
insert into settings (id, project_name, address, currency, budget_total, food_cost_target, start_date, opening_date, description)
values (1, 'Quán Nướng 01', '123 Đường ABC, P.12, Q.10, TP.HCM', 'VND', 500000000, 30, '2025-06-01', '2026-09-15',
        'Quán nướng phong cách hiện đại, phục vụ thịt nướng và hải sản.')
on conflict (id) do update set
  project_name = excluded.project_name, address = excluded.address,
  budget_total = excluded.budget_total, food_cost_target = excluded.food_cost_target,
  start_date = excluded.start_date, opening_date = excluded.opening_date,
  description = excluded.description;

-- MEMBERS ----------------------------------------------------
insert into members (name, role, badge, sort) values
  ('Nam (Bạn)', 'Chủ đầu tư', 'Chủ quản', 1),
  ('Khoa', 'Đối tác / Co-founder', 'Quản lý', 2),
  ('Tuấn', 'Quản lý dự án', 'Quản lý', 3),
  ('Hương', 'Quản lý mua hàng', 'Thành viên', 4),
  ('Minh', 'Phụ trách marketing', 'Thành viên', 5);

-- MAIN CATEGORIES --------------------------------------------
insert into main_categories (name, icon, color, sort) values
  ('Mặt bằng & pháp lý', '🏗️', 'hsl(221 83% 53%)', 1),
  ('Thiết kế & thi công', '🎨', 'hsl(160 84% 39%)', 2),
  ('Thiết bị & nội thất', '🪑', 'hsl(38 92% 50%)', 3),
  ('Menu & sản phẩm', '🍽️', 'hsl(0 72% 58%)', 4),
  ('Marketing & khai trương', '📣', 'hsl(330 81% 60%)', 5),
  ('Vận hành thử nghiệm', '⚙️', 'hsl(262 83% 66%)', 6);

-- LOOKUPS ----------------------------------------------------
insert into lookups (type, label, value, sort) values
  ('supplier_category', 'Thịt', 'Thịt', 1),
  ('supplier_category', 'Hải sản', 'Hải sản', 2),
  ('supplier_category', 'Rau củ', 'Rau củ', 3),
  ('supplier_category', 'Gia vị', 'Gia vị', 4),
  ('supplier_category', 'Gas', 'Gas', 5),
  ('supplier_category', 'Đồ uống', 'Đồ uống', 6),
  ('unit', 'kg', 'kg', 1), ('unit', 'cái', 'cái', 2), ('unit', 'bộ', 'bộ', 3),
  ('unit', 'm2', 'm2', 4), ('unit', 'lít', 'lít', 5), ('unit', 'thùng', 'thùng', 6), ('unit', 'gói', 'gói', 7),
  ('task_status', 'Chưa làm', 'todo', 1), ('task_status', 'Đang làm', 'doing', 2),
  ('task_status', 'Hoàn thành', 'done', 3), ('task_status', 'Quá hạn', 'overdue', 4),
  ('priority', 'Thấp', 'low', 1), ('priority', 'Trung bình', 'medium', 2),
  ('priority', 'Cao', 'high', 3), ('priority', 'Khẩn cấp', 'urgent', 4);

-- CHECKLIST --------------------------------------------------
insert into checklist_tasks (title, dept, assignee, deadline, priority, status) values
  ('Hoàn thiện nền', 'Xây dựng', 'Nam', '2026-08-20', 'high', 'done'),
  ('Lắp hệ thống hút khói', 'Xây dựng', 'Bảo', '2026-08-22', 'high', 'done'),
  ('Sơn tường', 'Xây dựng', 'Bảo', '2026-08-24', 'medium', 'doing'),
  ('Lắp đặt điện nước', 'Xây dựng', 'Bảo', '2026-08-25', 'high', 'doing'),
  ('Lắp đặt hệ thống gas', 'Xây dựng', 'Nam', '2026-08-25', 'high', 'todo'),
  ('Lắp máy lạnh', 'Thiết bị', 'Bảo', '2026-08-22', 'medium', 'done'),
  ('Bếp nướng', 'Thiết bị', 'Nam', '2026-08-23', 'high', 'doing'),
  ('Tủ đông', 'Thiết bị', 'Bảo', '2026-08-24', 'medium', 'todo'),
  ('Bàn ghế', 'Nội thất', 'Nam', '2026-08-25', 'high', 'todo'),
  ('Biển hiệu', 'Marketing', 'Bảo', '2026-08-25', 'medium', 'todo');

-- MENU -------------------------------------------------------
insert into menu_items (code, name, img, cat, sell, cost, target, status) values
  ('MN-001', 'Ba chỉ nướng', '🥓', 'Thịt nướng', 149000, 51000, 30, 'over'),
  ('MN-002', 'Nạc vai nướng', '🥩', 'Thịt nướng', 129000, 39000, 30, 'ok'),
  ('MN-003', 'Tôm nướng muối ớt', '🦐', 'Hải sản', 199000, 55000, 30, 'ok'),
  ('MN-004', 'Lẩu nấm thập cẩm', '🍲', 'Lẩu', 249000, 86000, 30, 'over'),
  ('MN-005', 'Salad dầu giấm', '🥗', 'Món phụ', 59000, 16000, 30, 'ok'),
  ('MN-006', 'Nước chanh tươi', '🍋', 'Đồ uống', 39000, 9000, 30, 'ok'),
  ('MN-007', 'Cánh gà nướng', '🍗', 'Thịt nướng', 109000, 38000, 30, 'over'),
  ('MN-008', 'Bia Sài Gòn', '🍺', 'Đồ uống', 25000, 8000, 30, 'over');

-- SUPPLIERS --------------------------------------------------
insert into suppliers (name, code, email, address, tag, tag_color, status, note, last_order) values
  ('Thịt Tươi ABC', '098xxxxxxx', 'abc@gmail.com', '123 Đường ABC, P.12, Q.10, TP.HCM', 'Thịt', 'hsl(0 72% 58%)', 'active', 'Giao hàng đúng hạn, chất lượng tốt', '2026-08-20'),
  ('Hải Sản Lộc Biển', '087xxxxxxx', '', '', 'Hải sản', 'hsl(221 83% 53%)', 'active', 'Hải sản tươi, giao nhanh', '2026-08-19'),
  ('Rau Sạch Xanh', '086xxxxxxx', '', '', 'Rau củ', 'hsl(160 84% 39%)', 'active', 'Rau sạch, giá hợp lý', '2026-08-18'),
  ('Gas An Toàn', '093xxxxxxx', '', '', 'Gas', 'hsl(262 83% 66%)', 'considering', 'Chưa ổn định về thời gian giao', '2026-08-15'),
  ('Gia Vị Hương Việt', '091xxxxxxx', '', '', 'Gia vị', 'hsl(38 92% 50%)', 'active', 'Đầy đủ gia vị, thương hiệu uy tín', '2026-08-17'),
  ('Đồ Uống Sài Gòn', '090xxxxxxx', '', '', 'Đồ uống', 'hsl(330 81% 60%)', 'considering', 'Giá tốt, cần theo dõi thêm', '2026-08-10');

insert into supplier_products (supplier_id, name, unit, price)
select s.id, p.name, 'kg', p.price
from suppliers s
join (values
  ('Thịt Tươi ABC', 'Thịt bò Mỹ', 320000),
  ('Thịt Tươi ABC', 'Ba chỉ bò', 280000),
  ('Thịt Tươi ABC', 'Sườn non bò', 350000),
  ('Hải Sản Lộc Biển', 'Cá hồi', 420000),
  ('Hải Sản Lộc Biển', 'Tôm sú', 380000),
  ('Rau Sạch Xanh', 'Rau xà lách', 35000)
) as p(sname, name, price) on p.sname = s.name;

-- DECISIONS --------------------------------------------------
with d as (
  insert into decisions (title, description, status)
  values ('Chọn mẫu bàn ghế', 'Chốt mẫu bàn ghế cho khu vực chính', 'pending')
  returning id
)
insert into decision_options (decision_id, label)
select d.id, x.label from d, (values ('Mẫu A'), ('Mẫu B'), ('Mẫu C')) as x(label);

-- NOTES ------------------------------------------------------
insert into notes (title, body, tag, author, pinned) values
  ('Chốt mẫu bàn ghế', 'So sánh 3 mẫu bàn gỗ sồi, ưu tiên loại chống ẩm. Hẹn NCC gửi báo giá trước 25/08.', 'important', 'Nam', true),
  ('Ý tưởng combo khai trương', 'Combo 2 người: 3 món nướng + 2 nước + tráng miệng. Giảm 15% tuần đầu.', 'idea', 'Khoa', false),
  ('Kiểm tra hệ thống hút khói', 'Đặt lịch bảo trì với đơn vị lắp đặt, test công suất khi full bàn.', 'todo', 'Tuấn', false),
  ('Danh sách gia vị cần nhập', 'Muối, tiêu, sa tế, sốt BBQ, mật ong. Liên hệ Gia Vị Hương Việt.', 'general', 'Hương', false);

-- BUDGET (dự toán + thực chi) --------------------------------
insert into budget_items (name, category, planned, status, owner) values
  ('Thi công mặt bằng', 'Xây dựng', 120000000, 'partial', 'Nam'),
  ('Thiết bị bếp', 'Thiết bị', 90000000, 'paid', 'Bảo'),
  ('Bàn ghế & nội thất', 'Nội thất', 70000000, 'pending', 'Nam'),
  ('Marketing khai trương', 'Marketing', 40000000, 'pending', 'Bảo'),
  ('Nguyên vật liệu ban đầu', 'Nguyên liệu', 60000000, 'partial', 'Hương');

insert into budget_transactions (item_id, amount, spent_at, note)
select b.id, t.amount, t.d::date, t.note
from budget_items b
join (values
  ('Thi công mặt bằng', 80000000, '2026-07-10', 'Đợt 1'),
  ('Thiết bị bếp', 90000000, '2026-07-20', 'Thanh toán đủ'),
  ('Nguyên vật liệu ban đầu', 25000000, '2026-08-01', 'Nhập lần đầu')
) as t(name, amount, d, note) on t.name = b.name;

-- NOTIFICATIONS ---------------------------------------------
insert into notifications (actor, action, target, type) values
  ('Nam', 'đã hoàn thành công việc', 'Lắp hệ thống hút khói', 'done'),
  ('Khoa', 'đã cập nhật giá vốn món', 'Ba chỉ nướng', 'update'),
  ('Hương', 'đã thêm nhà cung cấp', 'Thịt Tươi ABC', 'supplier'),
  ('Bảo', 'cảnh báo vượt ngân sách', 'Thiết bị bếp', 'budget');
