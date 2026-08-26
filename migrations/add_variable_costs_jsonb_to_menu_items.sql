-- Migration: Add variable_costs JSONB column to menu_items
-- Created: 2026-08-24
-- Description: Thêm cột variable_costs dạng JSONB để lưu nhiều chi phí biến đổi

-- Thêm cột variable_costs (JSONB array)
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS variable_costs JSONB DEFAULT '[]'::jsonb;

-- Comment cho cột mới
COMMENT ON COLUMN menu_items.variable_costs IS 'Mảng chi phí biến đổi [{ name: "Nước chấm", cost: 3000 }, ...]';

-- Xóa bảng menu_variable_costs nếu đã tạo (dùng JSONB thay vì bảng riêng)
-- DROP TABLE IF EXISTS menu_variable_costs CASCADE;

-- Cập nhật giá trị mặc định cho các món hiện có
UPDATE menu_items SET variable_costs = '[]'::jsonb WHERE variable_costs IS NULL;

-- Tạo function để tính tổng variable cost
CREATE OR REPLACE FUNCTION get_total_variable_cost(costs JSONB)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(costs)
  LOOP
    total := total + COALESCE((item->>'cost')::INTEGER, 0);
  END LOOP;
  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Kiểm tra kết quả
SELECT id, name, cost, variable_costs, get_total_variable_cost(variable_costs) as total_variable_cost FROM menu_items LIMIT 5;
