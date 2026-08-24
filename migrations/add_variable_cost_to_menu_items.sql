-- Migration: Add variable_cost column to menu_items table
-- Created: 2026-08-24
-- Description: Thêm cột chi phí biến đổi vào bảng menu_items

-- Thêm cột variable_cost (mặc định = 0)
ALTER TABLE menu_items
ADD COLUMN variable_cost INTEGER DEFAULT 0;

-- Comment cho cột mới
COMMENT ON COLUMN menu_items.variable_cost IS 'Chi phí biến đổi của món ăn (VND)';

-- Cập nhật giá trị mặc định cho các món hiện có (nếu cần)
-- UPDATE menu_items SET variable_cost = 0 WHERE variable_cost IS NULL;

-- Kiểm tra kết quả
SELECT id, name, cost, variable_cost FROM menu_items LIMIT 5;
