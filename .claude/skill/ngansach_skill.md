Bạn đang thực hiện nhiệm vụ **nâng cấp giao diện màn Ngân sách hiện tại** của dự án Nướng Chill.

Đây là một màn đã có:

* dữ liệu thật
* API thật
* logic thật
* biểu đồ thật
* bảng khoản chi thật

Nhiệm vụ của bạn là:

> **NÂNG CẤP UI/UX + TỐI ƯU LAYOUT**
> nhưng tuyệt đối không phá business logic hiện tại.

---

# 1. MỤC TIÊU QUAN TRỌNG NHẤT

Màn Ngân sách hiện tại có vấn đề:

> KPI và biểu đồ chiếm quá nhiều chiều cao khiến bảng khoản chi bị đẩy xuống rất xa, người dùng phải scroll mới bắt đầu thao tác được với dữ liệu chính.

Thiết kế mới phải theo nguyên tắc:

> **VIEWPORT-FIRST / COMPACT DATA DASHBOARD**

Nghĩa là:

* giảm chiều cao thừa
* giữ biểu đồ đủ đẹp nhưng không quá lớn
* KPI gọn
* filter gọn
* table xuất hiện sớm
* hạn chế vertical scroll tối đa

Đặc biệt trên desktop.

---

# 2. MỤC TIÊU VIEWPORT

Tại màn hình phổ biến:

```text
1920 × 1080
```

hoặc:

```text
1440 × 900
```

khi người dùng vừa mở màn Ngân sách, cần nhìn thấy:

```text
Page title
4 KPI
2 biểu đồ
Search + filter
Category tabs
Table header
ít nhất 2–4 dòng khoản chi
```

trong cùng viewport nếu chiều cao cho phép.

Không được thiết kế kiểu:

```text
KPI rất cao
↓
Chart rất cao
↓
Filters
↓
Scroll
↓
Scroll
↓
Table
```

Table là khu vực thao tác chính và phải xuất hiện sớm.

---

# 3. ĐÂY KHÔNG PHẢI MÀN DASHBOARD

Ngân sách có dữ liệu phân tích, nhưng chức năng chính vẫn là:

> quản lý khoản chi.

Do đó hierarchy phải ưu tiên:

```text
Summary
↓
Quick analysis
↓
Expense management
```

Không biến màn Ngân sách thành dashboard analytics khổng lồ.

---

# 4. ĐỌC CODE CŨ TRƯỚC

Trước khi sửa:

1. Đọc page Ngân sách hiện tại.
2. Đọc component KPI.
3. Đọc chart.
4. Đọc bảng khoản chi.
5. Đọc search/filter.
6. Đọc category tabs.
7. Đọc add expense.
8. Đọc edit expense.
9. Đọc payment/detail action.
10. Đọc API/hooks/state.
11. Đọc responsive implementation.

Sau đó mới nâng cấp giao diện.

---

# 5. KHÔNG HARDCODE DATA TỪ ẢNH

Các số như:

```text
300.000.000
199.000.000
101.000.000
```

trong thiết kế chỉ là visual reference.

Tất cả phải lấy từ data/API hiện có.

Hai biểu đồ cũng phải tiếp tục sử dụng data thật.

Không mock chart để giống ảnh.

---

# 6. BỐ CỤC DESKTOP MỚI

Desktop hierarchy mong muốn:

```text
┌───────────────────────────────────────────────────────────┐
│ Ngân sách                           + Thêm khoản chi       │
│ Quản lý ngân sách dự kiến và chi phí mở quán             │
│                                                           │
│ KPI 1      KPI 2      KPI 3      KPI 4                   │
│                                                           │
│ Dự toán vs Thực chi         Phân bổ ngân sách            │
│                                                           │
│ Search       Category      Status                         │
│                                                           │
│ Tabs danh mục                                             │
│                                                           │
│ TABLE KHOẢN CHI                                           │
└───────────────────────────────────────────────────────────┘
```

Phải compact hơn giao diện cũ.

---

# 7. CHIỀU CAO PAGE HEADER

Page header không được quá cao.

Target:

```text
Title + subtitle:
khoảng 54–64px tổng chiều cao
```

Button:

```text
+ Thêm khoản chi
```

đặt bên phải cùng header.

Không tạo khoảng trống 40–60px dưới title.

---

# 8. KPI — GIẢM CHIỀU CAO

4 KPI giữ nguyên:

```text
TỔNG NGÂN SÁCH
ĐÃ CHI
CÒN LẠI
CHÊNH LỆCH (CHI - DỰ TOÁN)
```

Nhưng card phải compact.

Target desktop:

```text
height khoảng 105–120px
```

Không làm 150–180px.

Structure:

```text
LABEL                   ICON

VALUE

SUBTEXT
```

Không cần thêm nội dung không cần thiết.

---

# 9. KPI PANEL COLOR

KPI card phải có màu nhẹ như thiết kế reference.

Không dùng một màu nền giống hệt nhau hoàn toàn.

Nhưng màu phải rất restrained.

Ví dụ:

```text
Tổng ngân sách
→ blue tint

Đã chi
→ orange tint

Còn lại
→ green tint

Chênh lệch
→ purple tint
```

Dùng:

```text
dark navy base
+
subtle local gradient
+
thin semantic border
+
icon glow
```

Không fill card bằng màu mạnh.

---

# 10. KPI VALUE

Value phải là thành phần nổi bật nhất.

Ví dụ:

```text
300.000.000 ₫
```

Target:

```text
25–30px
700
```

Không cần 36–40px.

Mục tiêu là compact.

---

# 11. CHART ROW — GIẢM CHIỀU CAO

Hai chart hiện tại đang làm page quá dài.

Thiết kế mới phải giới hạn:

```text
Chart panel height desktop:
240–280px
```

Target tốt:

```text
260px
```

Không sử dụng chart panel 330–400px như Dashboard.

---

# 12. CHART LAYOUT

Desktop:

```text
DỰ TOÁN VS THỰC CHI      PHÂN BỔ NGÂN SÁCH
~55–58%                   ~42–45%
```

Ví dụ:

```css
grid-template-columns:
  minmax(0, 1.15fr)
  minmax(360px, .85fr);
```

Cả hai panel phải cùng chiều cao.

---

# 13. BAR CHART — DỰ TOÁN VS THỰC CHI

Giữ nguyên chức năng hiện tại:

```text
Dự toán
Thực chi
```

theo từng category.

Không thay loại chart nếu không có lý do.

Nhưng nâng cấp giao diện chart.

### Style

Dự toán:

```text
Electric Blue
```

Thực chi:

```text
Emerald Green
```

Bar:

* rounded top
* gradient nhẹ
* width vừa phải
* không quá dày

Grid:

```text
rất mờ
```

Axis:

```text
muted
```

---

# 14. BAR CHART PROFESSIONAL LOOK

Không để chart giống biểu đồ mặc định Chart.js/ApexCharts.

Phải custom:

* rounded bars
* refined tooltip
* axis spacing
* muted grid lines
* animated hover
* highlighted category
* subtle glow at hover only

Không glow mọi cột.

---

# 15. BAR CHART TOOLTIP

Tooltip ví dụ:

```text
Thiết bị

Dự toán
45.000.000 ₫

Thực chi
94.000.000 ₫

Vượt
49.000.000 ₫
```

Dark floating panel.

Radius:

```text
8–10px
```

Dữ liệu lấy từ real data.

Nếu không vượt ngân sách thì không cần hiển thị dòng vượt.

---

# 16. DONUT — PHÂN BỔ NGÂN SÁCH

Giữ chức năng:

> thể hiện tỷ trọng ngân sách theo hạng mục.

Nhưng thiết kế chuyên nghiệp hơn.

Không để donut quá nhỏ nằm giữa một card lớn.

---

# 17. DONUT LAYOUT

Panel nên chia:

```text
Donut         Legend
```

Tỷ lệ khoảng:

```text
42% / 58%
```

Donut size desktop:

```text
135–165px
```

Không cần donut 200–250px.

Mục tiêu compact.

---

# 18. DONUT STYLE

Use:

* clean ring
* khoảng trống giữa segment rất nhỏ
* subtle outer glow
* dark center
* hover segment slightly expands
* smooth transition

Không làm 3D.

Không shadow quá mạnh.

---

# 19. DONUT CENTER

Có thể hiển thị:

```text
100%
Phân bổ
```

hoặc:

```text
5
Hạng mục
```

nếu dữ liệu phù hợp.

Nhưng không bắt buộc.

Nếu thêm, phải sử dụng real data.

Không hardcode.

---

# 20. DONUT LEGEND

Legend phải rất dễ đọc.

Ví dụ:

```text
● Xây dựng        36%
● Nội thất        21%
● Marketing       12%
● Nguyên liệu     18%
● Thiết bị        13%
```

Percentage right aligned.

Không để legend quá xa donut.

---

# 21. CATEGORY COLORS

Mỗi category có thể có semantic presentation color.

Ví dụ:

```text
Xây dựng     → Orange
Nội thất     → Gray Blue
Marketing    → Pink
Nguyên liệu  → Blue
Thiết bị     → Green
```

Nhưng mapping phải nhất quán trong:

* donut
* category tab
* category badge
* table

Không random màu ở mỗi component.

---

# 22. CHART PANEL BACKGROUND

Hai chart panel phải có visual depth hơn table.

Có thể dùng:

```text
dark navy
+
subtle blue/purple radial gradient
+
very light border glow
```

Ví dụ direction:

```css
background:
  radial-gradient(
    circle at 80% 100%,
    rgba(139,92,246,.07),
    transparent 42%
  ),
  #0b1728;
```

Không làm quá nhiều gradient.

---

# 23. FILTER TOOLBAR PHẢI NGAY SAU CHART

Không tạo khoảng trống lớn giữa chart và filter.

Target:

```text
12–16px
```

Layout:

```text
Search
Category
Status
```

Optional advanced filter nếu code hiện tại có.

---

# 24. FILTER HEIGHT

Controls:

```text
42–46px
```

Không cần input 52–56px.

Giảm chiều cao toàn page.

---

# 25. SEARCH WIDTH

Desktop:

```text
Search khoảng 300–340px
```

Không kéo full row nếu không cần.

---

# 26. CATEGORY TABS

Ngay sau toolbar:

```text
Tất cả 5
Xây dựng 1
Nội thất 1
Marketing 1
Nguyên liệu 1
Thiết bị 1
```

Height:

```text
40–44px
```

Không cần panel tab quá cao.

---

# 27. ACTIVE CATEGORY

Active:

```text
Tất cả 5
```

use:

* blue pill/background
* white text
* subtle glow

Inactive:

* transparent
* muted text
* number mini badge

---

# 28. TABLE PHẢI ĐƯỢC ĐƯA LÊN CAO

Đây là requirement quan trọng.

Table không được nằm quá xa dưới fold.

Hãy tính vertical rhythm để table bắt đầu khoảng:

```text
650–730px
```

trên viewport 1080px.

Lý tưởng:

người dùng thấy được:

```text
table header
+
3–5 rows
```

ngay khi mở trang.

---

# 29. TABLE COMPACT

Table row height target:

```text
46–54px
```

Không dùng 70–85px/row.

Đây là financial management table.

Ưu tiên scan data nhanh.

---

# 30. TABLE COLUMNS

Giữ functionality/data hiện tại:

```text
KHOẢN CHI
HẠNG MỤC
DỰ TOÁN
THỰC CHI
PHỤ TRÁCH
TRẠNG THÁI
THAO TÁC
```

Không remove data chỉ để giảm width.

---

# 31. EXPENSE ICON

Current expense icons có thể giữ nếu thực sự hữu ích.

Nhưng phải:

* nhỏ
* một style
* không emoji
* không chiếm nhiều chiều ngang

Nếu icon hiện tại là emoji hoặc decorative asset lộn xộn, ưu tiên chuyển sang outline/duotone icon nhất quán.

---

# 32. MONEY VALUES

Money column phải dễ scan.

Use:

```text
120.000.000 ₫
```

Right alignment nếu phù hợp.

Có thể dùng:

```css
font-variant-numeric:
  tabular-nums;
```

để số thẳng hàng.

---

# 33. ACTUAL COST INLINE EDIT

Nếu icon pencil cạnh `THỰC CHI` đang có chức năng chỉnh sửa:

GIỮ NGUYÊN.

Chỉ restyle.

Không xóa vì ảnh thiết kế đơn giản hơn.

---

# 34. STATUS BADGES

Giữ statuses thật.

Ví dụ:

```text
Một phần
Chờ thanh toán
Vượt dự toán
```

Semantic:

```text
Một phần
→ Purple

Chờ thanh toán
→ Orange

Đã thanh toán
→ Green

Vượt dự toán
→ Red
```

---

# 35. ROW ACTIONS

Nếu hiện tại có:

```text
+
Edit
Delete
```

phải giữ nguyên chức năng.

Restyle thành outline icon actions.

Không làm 3 button lớn.

---

# 36. RESPONSIVE DESKTOP PRIORITY

Đặc biệt tối ưu:

```text
1366 × 768
1440 × 900
1920 × 1080
```

1366×768 là case rất quan trọng.

Ở 1366×768:

Không thể yêu cầu hiện toàn bộ table.

Nhưng phải cố gắng hiển thị ít nhất:

```text
header
4 KPI
chart row
filters
table header
```

mà không cần scroll quá nhiều.

---

# 37. VERTICAL HEIGHT BUDGET

Ở desktop có thể dùng budget gần như:

```text
Navbar                    60–64

Page header               62–70

KPI                       105–115

Gap                       14–16

Charts                    240–260

Gap                       12

Filters                   42–46

Tabs                      40–44

Table begins
```

Đây là guideline quan trọng.

Không vượt quá nhiều nếu không cần.

---

# 38. GIẢM MARGIN / GAP THỪA

Audit toàn bộ:

```text
margin-top
margin-bottom
padding
gap
```

Old UI thường bị:

```text
32
32
24
32
```

lặp lại quá nhiều.

New target:

```text
12
16
20
24
```

tùy hierarchy.

---

# 39. KHÔNG LÀM PANEL QUÁ CAO CHỈ ĐỂ ĐẸP

Nếu card có ít content:

không kéo card cao thêm.

Nếu chart chỉ cần 250px:

không làm 350px.

Mục tiêu:

```text
Maximum useful information
per viewport
```

nhưng không khiến giao diện chật chội.

---

# 40. APP SHELL

Sử dụng shell Nướng Chill mới:

```text
Nướng Chill logo
modern sidebar icons
Ngân sách active
dark navbar
```

Không quay lại logo `QUÁN NƯỚNG`.

---

# 41. NGÂN SÁCH ACTIVE SIDEBAR

Current page:

```text
Ngân sách
```

must be active.

Style:

* blue tinted background
* blue border
* subtle glow
* wallet icon
* white text

---

# 42. TITLE

Use:

```text
Ngân sách
```

subtitle:

```text
Quản lý ngân sách dự kiến và chi phí mở quán
```

Title có thể sử dụng blue → purple subtle gradient như mockup.

Nhưng đừng làm toàn bộ page heading neon.

---

# 43. ADD EXPENSE BUTTON

Primary CTA:

```text
+ Thêm khoản chi
```

Top-right.

Blue gradient.

Subtle glow.

Compact height:

```text
42–46px
```

---

# 44. OVERALL STYLE

Follow:

> Modern Futuristic Dark SaaS

Balance:

```text
85% professional financial SaaS
15% futuristic neon
```

Màn Ngân sách nên professional hơn Dashboard.

Không làm hiệu ứng mạnh hơn Dashboard.

---

# 45. INTERACTION PRIORITY

Visual hierarchy:

```text
Financial numbers
↓
Analysis
↓
Expense management
↓
Secondary decoration
```

Không ưu tiên decoration hơn data.

---

# 46. KEEP REAL CHART DATA

CRITICAL:

Chart layout/style may change.

Chart type/functionality should remain compatible with current data model.

Do not restructure real API data unnecessarily.

Prefer mapping existing data into upgraded chart options.

---

# 47. KEEP EXISTING CHART LIBRARY

Nếu project đã dùng:

```text
ApexCharts
Recharts
Chart.js
ECharts
```

hãy giữ library đó nếu đủ khả năng.

Chỉ custom:

* colors
* axes
* tooltip
* grid
* animation
* responsive
* legend
* sizing

Không đổi library chỉ để nhìn đẹp hơn.

---

# 48. SCROLL STRATEGY

Page scroll là bình thường khi có nhiều khoản chi.

Nhưng user chỉ nên scroll chủ yếu để:

> xem thêm rows.

Không nên scroll chỉ để:

> bắt đầu thấy bảng.

Đây là khác biệt rất quan trọng.

---

# 49. TABLE SCROLL

Nếu dataset lớn:

* dùng pagination hiện tại
* hoặc virtualization nếu project đã có

Không cần cho cả page quá dài.

Nếu table panel cần scroll nội bộ ở một số viewport, chỉ làm khi UX thực sự tốt hơn và không phá pagination hiện tại.

---

# 50. AVOID DOUBLE SCROLL

Không tạo:

```text
body scroll
+
content scroll
+
table scroll
```

cùng lúc.

Một primary vertical scroll là ưu tiên.

---

# 51. TABLE STICKY HEADER

Nếu table đủ dài và architecture phù hợp:

có thể dùng sticky table header.

Ví dụ:

```css
thead {
  position: sticky;
  top: ...;
}
```

Nhưng phải tính đúng navbar offset.

Không làm table header chui dưới navbar.

---

# 52. HOVER / TOOLTIP

Charts:

* hover point/bar
* dark tooltip

Table:

* subtle row hover

Buttons:

* small brightness

Không animation liên tục.

---

# 53. PERFORMANCE

Không thêm hàng loạt:

```text
backdrop-filter blur
huge box shadow
animated gradient
```

Màn financial data phải nhẹ.

---

# 54. RESPONSIVE TABLET

At:

```text
768–1199
```

KPI:

```text
2 × 2
```

Charts:

```text
stack
```

Table có thể internal horizontal scroll.

Filters wrap.

Không cố ép desktop layout.

---

# 55. MOBILE

Màn mobile:

* sidebar drawer
* KPI 2 columns hoặc 1 column
* charts stack
* chart height khoảng 220–250px
* filters stack
* expense table → responsive cards nếu phù hợp

Không thu nhỏ full table đến mức unreadable.

---

# 56. TABLE MOBILE CARD

Possible structure:

```text
Thi công mặt bằng

Xây dựng

Dự toán
120.000.000 ₫

Thực chi
80.000.000 ₫

Nam

Một phần

Actions
```

Dùng cùng data/functionality.

---

# 57. VALIDATION SAU IMPLEMENT

Sau khi code:

Test:

```text
1920 × 1080
1440 × 900
1366 × 768
1280 × 800
1024
768
430
375
```

---

# 58. DESKTOP SUCCESS TEST

Ở màn desktop, tự hỏi:

> Tôi có thể thấy phần đầu của table ngay khi mở trang không?

Nếu câu trả lời là:

```text
Không, phải scroll một đoạn dài
```

thì layout CHƯA ĐẠT.

Tiếp tục giảm:

* KPI height
* chart height
* gaps
* padding

nhưng không làm mất readability.

---

# 59. VISUAL SUCCESS TEST

Màn phải giống thiết kế reference về:

* brand
* color
* panel treatment
* chart quality
* visual hierarchy
* button
* tabs
* table

Nhưng phải được triển khai responsive và data-driven thực sự.

---

# 60. FINAL OBJECTIVE

Transform the old Budget page into:

> **a compact premium dark financial management screen where summary + analysis remain visible, but the expense table begins early enough that the user can manage expenses without unnecessary scrolling.**

Do NOT merely change:

* colors
* border-radius
* chart palette

You must improve:

* vertical density
* chart sizing
* panel sizing
* layout hierarchy
* filter placement
* table positioning
* responsive behavior

while preserving all real data and all existing functionality.
