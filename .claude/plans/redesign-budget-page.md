# Plan: Redesign Budget Page theo Dark Theme Modern

## 🎯 Mục tiêu
Redesign màn Ngân sách với:
1. **Giao diện dark theme đẹp mắt** như mẫu thiết kế
2. **4 stat cards compact hơn** với mini sparkline charts
3. **2 biểu đồ nhỏ hơn** để đẩy table lên trên
4. **Cho phép edit trực tiếp "Đã chi"** thay vì chỉ thêm transaction

## 📋 Phân tích hiện trạng

### Cấu trúc hiện tại (Budget.jsx):
- **4 Summary cards**: Tổng ngân sách, Đã chi, Còn lại, Chênh lệch
- **2 Charts**: Bar chart (Dự toán vs Thực chi) + Pie chart (Phân bổ ngân sách)
- **Table**: Hiển thị chi tiết từng khoản chi
- **Logic**: 
  - `actualByItem[id]` = tổng các transactions của item đó
  - Không cho phép edit trực tiếp actual, chỉ thêm transaction

### Vấn đề cần giải quyết:
1. Stat cards và charts quá lớn → chiếm nhiều không gian
2. Không thể edit trực tiếp "Đã chi" → phải thêm transaction rồi cộng dồn
3. Theme chưa đủ đẹp so với mẫu thiết kế

## 🎨 Thiết kế mới

### 1. Stat Cards với Sparklines
```
┌─────────────────────────────────────────────────────────────────┐
│ TỔNG NGÂN SÁCH    │   ĐÃ CHI        │   CÒN LẠI      │  CHÊNH LỆCH │
│ 300.000.000đ      │ 199.000.000đ    │ 101.000.000đ   │ -136.000.000đ│
│ Ngân sách dự kiến │ 66.3% đã dụng   │ 33.7% còn lại  │ Trong dự toán│
│ ~~~mini chart~~~  │ ~~~mini chart~~~│ ~~~mini chart~~│ ~~~mini chart│
└─────────────────────────────────────────────────────────────────┘
```

- Giảm height từ ~180px xuống ~140px
- Thêm mini area chart (sparkline) bên dưới mỗi card
- Background gradient với glassmorphism
- Border radius lớn hơn (16px)

### 2. Charts Section (Compact)
```
┌───────────────────────────┬─────────────────────────┐
│  DỰ TOÁN VS THỰC CHI      │  PHÂN BỔ NGÂN SÁCH      │
│  (Bar Chart - 250px)      │  (Pie Chart - 250px)    │
└───────────────────────────┴─────────────────────────┘
```

- Giảm height từ ~400px xuống ~280px
- 2 columns responsive: lg:grid-cols-2
- Compact legend

### 3. Table với Inline Edit
```
┌─────────────────────────────────────────────────────────────┐
│ KHOẢN CHI  │ HẠNG MỤC │ DỰ TOÁN │ THỰC CHI* │ TRẠNG THÁI  │
├─────────────────────────────────────────────────────────────┤
│ Thi công   │ Xây dựng │ 120.0M  │ [80.0M] ✏️│ Một phần    │
└─────────────────────────────────────────────────────────────┘
```

- Thêm **inline editable** cho cột "THỰC CHI"
- Click vào giá trị → input field → Enter để save
- Update trực tiếp `items.actual` trong DB
- Không cần phụ thuộc vào transactions nữa

## 🔧 Implementation Strategy

### Phase 1: Redesign Stat Cards
**Files**: `src/pages/Budget.jsx`

1. Giảm kích thước cards:
   - Padding nhỏ hơn: `p-4` thay vì `p-6`
   - Font size nhỏ hơn: `text-2xl` thay vì `text-3xl`
   
2. Thêm Sparkline component:
   ```jsx
   <Sparkline data={sparklineData} color="#3b82f6" />
   ```
   - Sử dụng Recharts AreaChart hoặc LineChart
   - Height: 40px
   - No axes, no grid, just line

3. Update styling:
   - Glassmorphism: `backdrop-blur-xl bg-white/5`
   - Border: `border border-white/10`
   - Rounded: `rounded-2xl`

### Phase 2: Compact Charts
**Files**: `src/pages/Budget.jsx`

1. Giảm height charts:
   ```jsx
   <ResponsiveContainer width="100%" height={250}>
   ```
   
2. Update grid layout:
   ```jsx
   <div className="grid gap-4 lg:grid-cols-2">
   ```

3. Compact legend:
   - Font size nhỏ hơn: `text-xs`
   - Spacing chặt hơn: `space-y-1`

### Phase 3: Inline Edit for "Thực chi"
**Files**: `src/pages/Budget.jsx`

1. Thêm state cho inline editing:
   ```jsx
   const [editingActual, setEditingActual] = useState(null) // {id, value}
   ```

2. Render cell với edit mode:
   ```jsx
   {editingActual?.id === e.id ? (
     <Input 
       value={editingActual.value}
       onChange={(ev) => setEditingActual({id: e.id, value: ev.target.value})}
       onBlur={handleSaveActual}
       onKeyDown={(ev) => ev.key === 'Enter' && handleSaveActual()}
       autoFocus
     />
   ) : (
     <span onClick={() => setEditingActual({id: e.id, value: e.actual})}>
       {formatVND(e.actual)} ✏️
     </span>
   )}
   ```

3. Save handler:
   ```jsx
   const handleSaveActual = async () => {
     const {id, value} = editingActual
     await update(id, {actual: Number(value) || 0})
     setEditingActual(null)
     toast.success('Đã cập nhật thực chi.')
   }
   ```

4. **Database schema update**:
   - Thêm column `actual` vào table `budget_items` (nếu chưa có)
   - Type: `numeric` hoặc `bigint`
   - Default: 0

### Phase 4: Dark Theme Polish
**Files**: `src/pages/Budget.jsx`

1. Header:
   ```jsx
   <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
     Ngân sách
   </h1>
   ```

2. Cards background:
   ```jsx
   style={{
     background: 'linear-gradient(145deg, rgba(30,40,60,0.4), rgba(20,30,50,0.6))',
     backdropFilter: 'blur(12px)'
   }}
   ```

3. Table styling:
   - Row hover: `hover:bg-blue-500/5`
   - Badge colors: Match category colors
   - Status badges: các màu theo trạng thái

## 📊 Data Flow Changes

### Hiện tại:
```
budget_items.planned ────┐
                         ├──→ Display in table
transactions.amount ─────┘ (sum → actual)
```

### Sau khi thay đổi:
```
budget_items.planned ────┐
                         ├──→ Display in table
budget_items.actual ─────┘ (editable inline)
```

**Note**: Vẫn giữ transactions để track lịch sử, nhưng actual có thể edit trực tiếp

## ⚠️ Edge Cases

1. **Nếu DB chưa có column `actual`**:
   - Migration: `ALTER TABLE budget_items ADD COLUMN actual BIGINT DEFAULT 0`
   - Hoặc sử dụng computed field từ transactions nếu không muốn thay đổi DB

2. **Validation**:
   - actual >= 0
   - actual phải là số
   - Hiển thị error nếu invalid

3. **Sparkline data**:
   - Nếu không có historical data → fake data hoặc flat line
   - Sau này có thể thêm time-series tracking

## 🎯 Success Criteria

- ✅ Stat cards cao ~140px (giảm 30%)
- ✅ Charts cao ~280px (giảm 30%)
- ✅ Table được đẩy lên, visible without scroll
- ✅ Click vào "Thực chi" → edit được
- ✅ Dark theme đẹp như mẫu thiết kế
- ✅ Mobile responsive tốt

## 📝 Files to Modify

1. `src/pages/Budget.jsx` - Main redesign
2. `src/components/Sparkline.jsx` (new) - Mini chart component
3. Database migration (optional) - Add `actual` column

## 🚀 Implementation Order

1. **Compact stat cards** (dễ, low risk)
2. **Compact charts** (dễ, low risk)
3. **Inline edit actual** (medium, cần test kỹ)
4. **Sparklines** (optional, có thể làm sau)
5. **Theme polish** (dễ, visual)

---

**Estimate**: ~2-3 hours
**Risk**: Low-Medium (DB schema change cần cẩn thận)
