# Quán Nướng - Pre-opening Management System

Hệ thống quản lý nhà hàng "Quán Nướng" cho giai đoạn pre-opening.

## Tính năng

### 1. Dashboard (Tổng quan)
- Thống kê tiến độ setup (72%)
- Quản lý ngân sách và chi phí
- Biểu đồ dự toán vs thực chi
- Tiến độ theo danh mục (Hoàn thành, Đang làm, Chưa làm)
- Việc quan trọng và chờ quyết định

### 2. Checklist Setup
- Quản lý công việc chuẩn bị mở quán
- Phân loại theo trạng thái (Tất cả, Chưa làm, Đang làm, Hoàn thành, Quá hạn)
- Filter theo hạng mục, người phụ trách, ưu tiên, deadline
- Bảng công việc chi tiết với độ ưu tiên và trạng thái

### 3. Ngân sách (Budget)
- Tổng quan ngân sách: 300.000.000đ
- Chi tiết theo danh mục (Xây dựng, Thiết bị, Bàn ghế, Biển hiệu, Marketing, Khác)
- Phân bổ ngân sách với biểu đồ donut
- Danh sách giao dịch gần đây

### 4. Menu & Cost
- Quản lý menu với 32 món
- Tính toán giá gốc, giá bán, food cost
- Phân tích lợi nhuận và margin
- Cơ cấu giá thành chi tiết
- Danh sách món cần xem xét

### 5. Nhà cung cấp (Suppliers)
- Quản lý 32 nhà cung cấp
- Phân loại theo danh mục (Thịt, Rau, Hải sản, Gia vị, Khác)
- Đánh giá và rating nhà cung cấp
- Theo dõi chi phí và đơn hàng
- Top nhà cung cấp đánh giá cao

## Tech Stack

- **React 18.3.1** - UI framework
- **React Router DOM 6.26.0** - Routing
- **Recharts 2.12.7** - Data visualization
- **Lucide React 0.428.0** - Icons
- **Vite 5.4.0** - Build tool

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Database Schema

### Suppliers
- id (PK)
- name (text)
- category (text)
- contact (text)
- rating (numeric)
- total_orders (integer)
- total_spent (numeric)
- last_order (date)
- status (text)
- note (text)

### Menu Items
- id (PK)
- name (text)
- category (text)
- serving_size (text)
- cost_price (numeric)
- selling_price (numeric)
- margin (numeric)
- status (text)

### Checklist
- id (PK)
- title (text)
- department (text)
- assignee (text)
- priority (text)
- deadline (date)
- status (text)
- created_at (timestamp)

### Budget Transactions
- id (PK)
- name (text)
- category (text)
- date (date)
- amount (numeric)
- status (text)

## Project Structure

```
Building_NamPhuong/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Layout.jsx
│   │   └── Layout.css
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Dashboard.css
│       ├── Checklist.jsx
│       ├── Checklist.css
│       ├── Budget.jsx
│       ├── Budget.css
│       ├── MenuCost.jsx
│       ├── MenuCost.css
│       ├── Suppliers.jsx
│       └── Suppliers.css
```

## Design System

- **Background**: #0A0B0E (dark)
- **Cards**: #13141A
- **Borders**: #1E1F26
- **Primary**: #3B82F6 (blue)
- **Success**: #10B981 (green)
- **Warning**: #F59E0B (orange)
- **Danger**: #EF4444 (red)
- **Purple**: #8B5CF6
- **Pink**: #EC4899

## Fonts

- **Headings**: DM Serif Display
- **Body**: Inter (400-700)
