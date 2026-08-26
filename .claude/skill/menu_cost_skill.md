# NƯỚNG CHILL — MENU & COST UPGRADE SKILL

## 1. PURPOSE

This skill applies ONLY to the **Menu & Cost module** of the Nướng Chill application.

It covers exactly three approved UI areas:

1. Menu & Cost main screen
2. Add Dish modal — `Thêm món mới`
3. Edit Dish modal — `Chỉnh sửa món`

Do NOT automatically apply Menu & Cost-specific layout rules to:

* Dashboard
* Checklist
* Ngân sách
* Nhà cung cấp
* Ghi chú
* Cài đặt

Those screens have separate design rules.

The objective is:

> Upgrade the existing Menu & Cost implementation into the approved Nướng Chill Menu & Cost design while preserving all existing real data, API integration and business functionality.

---

# 2. IMPORTANT CONTEXT

This is an UPGRADE task.

The application already contains:

* real menu data
* real pricing data
* real cost data
* Food Cost calculations
* menu categories
* add/edit/delete behavior
* modal forms
* filters
* table/list behavior

Do NOT rebuild the module from scratch without first reading the existing implementation.

---

# 3. APPROVED VISUAL REFERENCES

There are three approved design references:

```text
1. Menu & Cost main screen
2. Thêm món mới modal
3. Chỉnh sửa món modal
```

These approved references are the visual source of truth.

When there is a conflict between:

```text
old visual design
vs
approved new design
```

use the approved new design.

When there is a conflict between:

```text
approved design
vs
working business functionality
```

preserve the working functionality and integrate it appropriately into the new visual system.

---

# 4. READ EXISTING CODE FIRST

Before changing any code:

1. Read the Menu & Cost page.
2. Read all Menu table/list components.
3. Read KPI components.
4. Read filters.
5. Read category tabs.
6. Read list/grid switch behavior.
7. Read Food Cost report action.
8. Read Add Dish modal.
9. Read Edit Dish modal.
10. Read image upload logic.
11. Read category logic.
12. Read price / cost inputs.
13. Read Food Cost calculation.
14. Read target percentage logic.
15. Read profit calculation.
16. Read variable-cost logic if partially implemented.
17. Read APIs.
18. Read hooks/services.
19. Read validation.
20. Read state management.
21. Read responsive styling.

Only after understanding the current implementation should the UI be upgraded.

---

# 5. PRESERVE ALL REAL DATA

Never hardcode values shown in the design mockup.

Values such as:

```text
6 món
27.12%
59.000đ
16.000đ
6.000đ
30%
```

are examples from the visual reference.

Production UI must use real application data.

---

# 6. DO NOT BREAK EXISTING FUNCTIONALITY

Preserve:

* Add dish
* Edit dish
* Delete dish
* Image upload
* Category selection
* Dish code
* Sale price
* Base cost
* Food Cost target
* Food Cost calculations
* Profit calculations
* Search
* Category filters
* Status filters
* List/grid view
* Food Cost report
* Navigation
* API contracts
* Validation
* Permissions

Do not remove functionality simply because it is not highly visible in the approved screenshot.

---

# 7. DESIGN STYLE

Official Menu & Cost style:

> **Modern Futuristic Dark SaaS — Restaurant Cost Management**

Visual balance:

```text
85% clean professional SaaS
15% futuristic neon
```

The Menu & Cost screen should feel slightly more operational and data-focused than Dashboard.

Do NOT turn it into:

* gaming UI
* cyberpunk UI
* restaurant poster UI
* overly colorful food menu UI

---

# 8. GLOBAL COLOR FOUNDATION

Base background:

```css
--bg-page: #06101f;
--surface-1: #0b1728;
--surface-2: #0e1c30;
--surface-3: #122137;
```

Primary interaction:

```css
--primary: #2585ff;
--primary-hover: #3b91ff;
```

Semantic colors:

```css
--success: #16d99a;
--warning: #ffad1f;
--danger: #ff4d5e;
--purple: #8b5cf6;
```

---

# 9. APPLICATION SHELL

Use the approved Nướng Chill shell.

Brand:

```text
Nướng Chill
Pre-opening
```

Do NOT revert to:

```text
QUÁN NƯỚNG
```

Sidebar:

* dark navy
* modern outline icons
* Menu & Cost active
* blue active background
* thin blue border
* subtle blue glow

Top Navbar:

* search
* date
* theme
* fullscreen if existing
* notification
* user avatar

Preserve existing behavior.

---

# 10. MENU & COST ACTIVE SIDEBAR ITEM

On this screen:

```text
Menu & Cost
```

must be active.

Preferred icon:

```text
Utensils
ForkKnife
UtensilsCrossed
```

Use the same icon library and stroke style as Dashboard and Checklist.

---

# 11. MAIN SCREEN STRUCTURE

Desktop hierarchy:

```text
Menu & Cost                           + Thêm món
Quản lý menu và tính giá vốn món ăn

5 KPI CARDS

Search
Category filter
Status filter
Food Cost report
View switch

CATEGORY TABS

MENU TABLE
```

Keep this hierarchy compact.

---

# 12. PAGE TITLE

Use:

```text
Menu & Cost
```

Subtitle:

```text
Quản lý menu và tính giá vốn món ăn
```

Approved title may use a restrained:

```text
blue → purple gradient
```

Do not over-glow the heading.

---

# 13. ADD DISH BUTTON

Primary CTA:

```text
+ Thêm món
```

Style:

* electric blue
* slight blue-purple gradient
* white text
* subtle outer glow
* 10–12px radius
* compact height

Recommended:

```text
42–46px
```

---

# 14. KPI SECTION

Keep exactly the current useful KPI information.

Approved visual direction contains:

```text
TỔNG SỐ MÓN
FOOD COST TB
MÓN ĐẠT MỤC TIÊU
MÓN VƯỢT MỤC TIÊU
DANH MỤC
```

Use actual application values.

---

# 15. KPI LAYOUT

Desktop:

```text
5 equal or visually balanced cards
```

Keep them compact.

Target height:

```text
120–135px
```

Do not create giant Dashboard-style panels.

---

# 16. KPI CARD STYLE

Use consistent dark base surfaces.

Semantic accents:

```text
Tổng số món
→ Blue / Blue-Purple

Food Cost TB
→ Amber

Đạt mục tiêu
→ Green

Vượt mục tiêu
→ Red

Danh mục
→ Purple
```

Color must appear primarily in:

* icon
* icon background
* label
* progress
* subtle local border/glow

Do NOT strongly fill the entire cards with these colors.

---

# 17. KPI FOOD COST

Food Cost average is an important operational KPI.

Display:

```text
27.12%
```

with target:

```text
Mục tiêu: ≤ 30%
```

If the average exceeds target:

use warning/danger semantic treatment.

If within target:

use green or approved positive treatment.

Use real data.

---

# 18. TOOLBAR

Approved toolbar contains:

```text
Search
Category filter
Status filter
Báo cáo Food Cost
List/Grid switch
```

All controls should align vertically.

Target control height:

```text
42–46px
```

---

# 19. SEARCH

Placeholder:

```text
Tìm kiếm món ăn, mã món...
```

Use:

* dark input
* outline search icon
* subtle border
* blue focus ring

Do not make it excessively wide.

---

# 20. FOOD COST REPORT BUTTON

Use:

```text
Báo cáo Food Cost
```

Secondary action styling:

* dark background
* thin border
* small report/chart icon
* white or light text

It must NOT compete visually with `+ Thêm món`.

---

# 21. LIST / GRID SWITCH

Use a compact segmented control.

Example:

```text
List | Grid
```

Active state:

```text
blue background
blue border
small glow
```

Inactive:

```text
dark transparent
muted icon
```

Preserve current view-switch functionality.

---

# 22. CATEGORY TABS

Approved structure:

```text
Tất cả   6
Thịt nướng   2
Hải sản      1
Lẩu          1
Món phụ      1
Đồ uống      1
```

Use real category counts.

---

# 23. CATEGORY TAB STYLE

Active:

```text
blue gradient/tint
white text
small count badge
```

Inactive:

```text
transparent
muted text
dark count badge
```

Keep total tab height:

```text
40–44px
```

---

# 24. MENU TABLE

Approved table columns:

```text
MÓN ĂN
DANH MỤC
GIÁ BÁN
GIÁ VỐN
CHI PHÍ BIẾN ĐỔI
FOOD COST
MỤC TIÊU
LỢI NHUẬN
TRẠNG THÁI
THAO TÁC
```

Do NOT remove `CHI PHÍ BIẾN ĐỔI`.

This column is part of the newly approved Menu & Cost functionality.

---

# 25. VARIABLE COST COLUMN

Display:

```text
6.000đ
2 khoản
```

or:

```text
18.000đ
3 khoản
```

Main line:

```text
TOTAL VARIABLE COST
```

Secondary line:

```text
NUMBER OF VARIABLE COST ITEMS
```

Do NOT show all cost items inside the main table.

The table should remain compact.

---

# 26. VARIABLE COST TABLE VALUE

Example:

```text
6.000đ
2 khoản
```

Use:

* amount as primary text
* count as small muted secondary text

If no variable costs:

```text
0đ
```

Optional secondary:

```text
Chưa có khoản
```

or omit secondary line if the table becomes visually cleaner.

---

# 27. FOOD COST CALCULATION

Variable Cost must participate in Food Cost.

Unless existing business rules explicitly differ, expected calculation is:

```text
Food Cost (%)
=
(Giá vốn + Tổng chi phí biến đổi)
÷ Giá bán
× 100%
```

Use actual application rules as the functional source of truth.

Do NOT hardcode Food Cost.

---

# 28. PROFIT CALCULATION

Unless the existing product defines profit differently, expected operational profit is:

```text
Lợi nhuận
=
Giá bán
- Giá vốn
- Tổng chi phí biến đổi
```

If an existing backend calculation already exists:

use it.

Do not introduce competing frontend formulas.

---

# 29. FOOD COST DISPLAY

Display:

```text
27.12%
```

with a small progress indicator below.

Positive:

```text
Green
```

Exceeded target:

```text
Red
```

Example:

```text
27.12%
━━━━━━
```

Keep compact.

---

# 30. TARGET COLUMN

Display target clearly.

Example:

```text
≤ 30%
```

Do not duplicate excessive text such as:

```text
Mục tiêu Food Cost tối đa 30%
```

inside every row.

---

# 31. STATUS

Approved examples:

```text
Đạt mục tiêu
Vượt mục tiêu
```

Style:

```text
compact semantic pill
```

Green:

```text
Đạt mục tiêu
```

Red:

```text
Vượt mục tiêu
```

Avoid full saturated backgrounds.

---

# 32. TABLE ROWS

Target height:

```text
58–66px
```

Rows must be dense enough for menu management but still allow:

* food thumbnail
* dish name
* dish code
* category
* metrics

---

# 33. DISH CELL

Structure:

```text
[thumbnail] Salad dầu giấm
            MN-005
```

Thumbnail:

```text
36–42px
```

Rounded container.

Use uploaded image when available.

Use fallback icon only when no image exists.

---

# 34. CATEGORY CELL

Use:

```text
small category icon + category label
```

only if category icons are already part of the approved Menu & Cost design.

Do not use emoji.

---

# 35. ACTIONS

Main row actions:

```text
Edit
Delete
```

Use outline icons.

Recommended:

```text
Pencil
Trash
```

Default muted.

Hover:

```text
Edit → Blue
Delete → Red
```

---

# 36. MAIN SCREEN RESPONSIVE

Large desktop:

```text
5 KPIs in one row
full toolbar
category tabs
table
```

Laptop:

* reduce card gaps
* reduce card padding
* preserve table readability

Tablet:

```text
KPI 3 + 2
toolbar wraps
```

Mobile:

* sidebar drawer
* KPI 2 columns
* toolbar stack
* table becomes responsive cards if needed

Do not make the entire page horizontally overflow.

---

# 37. MODAL DESIGN PRINCIPLE

Both:

```text
Thêm món mới
Chỉnh sửa món
```

must use the same design language.

They should feel like two states of the same component.

Do NOT build two visually unrelated modal designs.

---

# 38. MODAL POSITION

Desktop modals must appear centered.

Use:

```text
center horizontally
center vertically when possible
```

Do NOT use right-side drawer style for these two screens.

---

# 39. MODAL OVERLAY

Use:

```css
background: rgba(1, 7, 16, 0.76);
```

Optional:

```css
backdrop-filter: blur(3px);
```

Keep blur restrained.

The background Menu & Cost screen should remain recognizable but visually inactive.

---

# 40. MODAL BASE

Approved direction:

```css
background:
  linear-gradient(
    180deg,
    #0c1a2e,
    #081629
  );

border:
  1px solid rgba(96,165,250,.18);

border-radius:
  16px;
```

Use slight elevation.

Do NOT make the modal a plain flat rectangle.

---

# 41. MODAL WIDTH

Desktop target:

```text
700–820px
```

Adjust to existing field requirements.

Edit modal may be slightly wider if necessary because it shows more variable-cost data.

Do not exceed an unreasonable portion of the viewport.

---

# 42. MODAL HEIGHT

Prefer:

```text
max-height: 88–92vh
```

If content exceeds viewport:

scroll only the modal body.

Keep:

```text
header stable
footer stable
```

when possible.

Avoid forcing the entire page behind the overlay to scroll.

---

# 43. TYPOGRAPHIC HIERARCHY — CRITICAL

The old modal suffered from weak hierarchy.

New hierarchy must be obvious.

Modal title:

```text
24–28px
700
```

Optional subtle blue-purple gradient.

Subtitle:

```text
12–13px
Muted
```

Section title:

```text
12–14px
600–700
uppercase or semi-uppercase
```

Field label:

```text
12–13px
500–600
```

Input:

```text
13–14px
```

Helper:

```text
11–12px
Muted
```

Do NOT make:

```text
modal title
section title
field label
helper text
```

all the same visual size.

---

# 44. MODAL SPACING SYSTEM

Use strong grouping.

Recommended:

```text
Title → subtitle
4–6px

Header → first section
20–24px

Section title → fields
12–14px

Field label → input
6–8px

Field row gap
12px

Between sections
18–24px
```

Avoid huge 30–40px empty spaces.

Avoid cramming all controls together.

---

# 45. ADD MODAL STRUCTURE

Approved Add modal sections:

```text
THÊM MÓN MỚI
Subtitle

1  HÌNH ẢNH MÓN ĂN

2  THÔNG TIN MÓN ĂN

3  GIÁ BÁN & GIÁ VỐN

4  CHI PHÍ BIẾN ĐỔI

Footer:
Hủy
Lưu món
```

The numbered section treatment helps hierarchy.

Use restrained blue/purple accent.

---

# 46. ADD MODAL — KEEP EXISTING FIELDS

Do NOT invent unrelated new fields.

Keep the existing real fields.

Expected current fields include:

```text
Hình ảnh món ăn

Tên món
Danh mục
Mã món

Giá bán
Giá vốn
Mục tiêu

Chi phí biến đổi

Food Cost calculated value
```

If current production code contains additional valid fields:

preserve them.

---

# 47. IMAGE UPLOAD AREA

Use a compact upload panel.

Structure:

```text
[image/fallback preview]

Tải ảnh lên

PNG, JPG tối đa 5MB.
Nếu không tải ảnh,
biểu tượng sẽ được dùng.
```

Use outline image/upload icon.

Do NOT use emoji plate icons in production.

---

# 48. IMAGE PREVIEW — EDIT MODE

Edit modal should display current dish image.

Allow:

```text
Tải ảnh lên
```

or:

```text
Đổi ảnh
```

depending on existing behavior.

Do not erase the current image until the new upload succeeds.

---

# 49. FORM INPUT STYLE

Inputs:

```css
background: #101f34;
border: 1px solid rgba(148,163,184,.12);
border-radius: 9px;
```

Focus:

```css
border-color: rgba(37,133,255,.65);

box-shadow:
  0 0 0 3px
  rgba(37,133,255,.07);
```

Keep heights:

```text
40–44px
```

---

# 50. PRICE INPUT

Currency fields may show:

```text
đ
```

as suffix.

Example:

```text
59.000                         đ
```

Do not force users to type the currency symbol.

Use numeric formatting that does not destroy input editing behavior.

---

# 51. PRICE & COST SECTION

Approved hierarchy:

```text
GIÁ BÁN & GIÁ VỐN

Giá bán
Giá vốn
Mục tiêu
```

In Edit modal, optional informational note:

```text
Giá vốn sẽ bao gồm
giá vốn nguyên liệu cố định
và tổng chi phí biến đổi bên dưới.
```

Use a compact blue information card.

Do not create a large explanatory panel.

---

# 52. VARIABLE COST — CORE FEATURE

This is the main new feature.

The user can add multiple variable-cost items for one dish.

Each variable cost item should at minimum contain:

```text
Tên khoản chi
Số tiền
```

The application must calculate:

```text
Tổng chi phí biến đổi
=
sum(all variable cost amounts)
```

and use that result in the main Menu table.

---

# 53. ADD MODAL — VARIABLE COST ROW

Approved Add modal uses a simple structure:

```text
TÊN KHOẢN CHI      SỐ TIỀN       THAO TÁC

[_____________]    [________ đ]     Delete

[_____________]    [________ đ]     Delete

+ Thêm chi phí
```

Do NOT make adding a variable cost require another modal by default.

Inline rows are preferred.

---

# 54. ADD VARIABLE COST

Button:

```text
+ Thêm chi phí
```

Style:

```text
transparent dark background
blue dashed/thin border
blue text
```

This is secondary interaction.

Do not style it like the primary `Lưu món` button.

---

# 55. VARIABLE COST ROW DELETE

Use:

```text
Trash outline icon
```

Muted by default.

Hover:

```text
Red
```

Do not use a large red button.

---

# 56. VARIABLE COST EMPTY STATE

A new dish may start with:

```text
0 variable cost rows
```

or one empty initial row depending on existing UX.

If no cost items exist:

```text
Tổng chi phí biến đổi = 0đ
```

Food Cost must still calculate correctly from base cost.

---

# 57. ADD MODAL VARIABLE COST SUMMARY

On the bottom-right of the variable cost section display:

```text
Tổng chi phí biến đổi      0đ
Food Cost tạm tính          0%
```

Use real-time values.

This is a summary card, not an editable input.

---

# 58. REAL-TIME CALCULATION

When the user changes:

```text
Giá bán
Giá vốn
Chi phí biến đổi
```

update the calculated values immediately:

```text
Tổng chi phí biến đổi
Food Cost
```

Do not require saving before the preview updates.

---

# 59. FOOD COST PREVIEW

Food Cost field in modal should be read-only if automatically calculated.

It must visually look computed.

Use:

```text
slightly darker/read-only surface
```

Do not allow accidental direct editing if business logic defines it as calculated.

---

# 60. EDIT MODAL STRUCTURE

Approved Edit modal:

```text
CHỈNH SỬA MÓN

IMAGE              DISH INFORMATION

PRICE & COST

VARIABLE COST

SUMMARY

FOOD COST FORMULA

Footer:
Hủy
Cập nhật món
```

Keep it structured and compact.

---

# 61. EDIT MODAL TOP LAYOUT

On desktop:

```text
Image area
|
Dish information
```

The image section may use roughly:

```text
25–28%
```

and form info:

```text
72–75%
```

This prevents unnecessary vertical height.

Add modal does not have to use the exact same image layout if the approved Add design differs.

---

# 62. EDIT VARIABLE COST TABLE

Edit modal may expose more detail than Add modal.

Approved structure:

```text
#
TÊN CHI PHÍ
MÔ TẢ (TÙY CHỌN)
SỐ TIỀN
THAO TÁC
```

Example:

```text
1  Bao bì       Hộp nhựa đựng salad     1.000     Delete
2  Nước chấm    Nước sốt dầu giấm       2.000     Delete
3  Khăn giấy    Khăn giấy ăn               500     Delete
4  Rau ăn kèm   Lettuce, cà chua bi      3.000     Delete
```

Use actual application data.

---

# 63. DESCRIPTION FIELD

Description is optional.

Do NOT make it mandatory.

If current backend does not support description:

do not invent a persisted field without instruction.

If implemented as part of the new feature:

keep it optional.

---

# 64. VARIABLE COST REORDER

If the UI shows a drag handle:

```text
⋮⋮
```

it should only be included if row reordering actually works or is implemented as part of the feature.

Do not create decorative drag handles with no behavior.

---

# 65. VARIABLE COST SUMMARY — EDIT

Approved summary cards:

```text
TỔNG CHI PHÍ BIẾN ĐỔI
6.500

FOOD COST (%) (TỰ ĐỘNG)
27.12%
```

Use two compact cards.

They should visually stand out from inputs but remain secondary to the form itself.

---

# 66. VARIABLE COST SUMMARY STYLE

Use:

```text
dark elevated surface
blue icon container
large white value
small muted label
```

Do not use excessively glowing statistic cards inside the modal.

---

# 67. FOOD COST FORMULA

Show a small informational formula below the summary:

```text
Food Cost (%) =
(Giá vốn + Tổng chi phí biến đổi)
/
Giá bán
× 100%
```

Keep this helper subtle.

Do not create a giant explanatory panel.

---

# 68. ADD VS EDIT CONSISTENCY

Both modals must share:

* same surface
* same border
* same radius
* same title treatment
* same input design
* same section titles
* same buttons
* same overlay
* same semantic colors

The differences must come from task requirements, not styling inconsistency.

---

# 69. ADD MODAL PRIMARY ACTION

Use:

```text
Lưu món
```

Primary button.

Blue → purple subtle gradient.

---

# 70. EDIT MODAL PRIMARY ACTION

Use:

```text
Cập nhật món
```

Same primary style.

Do NOT label it simply:

```text
Lưu
```

if the existing approved UI uses `Cập nhật món`.

---

# 71. CANCEL BUTTON

Use:

```text
Hủy
```

Style:

* dark
* thin neutral border
* white/secondary text

No glow.

---

# 72. FOOTER

Modal footer should clearly separate actions from form content.

Recommended:

```text
Hủy                                 Lưu món
```

or:

```text
Hủy                         Cập nhật món
```

Use a subtle top border if necessary.

Avoid huge footer height.

---

# 73. VALIDATION

Required fields should show:

```text
*
```

in red.

On error:

* red border
* concise helper text

Do not use toast alone for basic field validation.

---

# 74. VARIABLE COST VALIDATION

For each item:

`Tên khoản chi`

should be required when a cost amount is provided.

`Số tiền`

should:

* be numeric
* be >= 0
* not accept invalid currency strings

If an empty row is automatically created but unused:

do not necessarily block save unless current UX requires it.

---

# 75. REMOVE EMPTY COST ITEMS

Before saving:

ignore completely empty optional variable-cost rows if appropriate.

Do NOT create meaningless backend records such as:

```text
name: ""
amount: 0
```

unless the API specifically requires them.

---

# 76. CALCULATION PRECISION

Perform calculations using numeric values.

Do not calculate from visually formatted strings such as:

```text
"59.000đ"
```

Keep formatting separate from data representation.

---

# 77. MONEY FORMATTING

Display:

```text
59.000đ
```

or project-wide approved money format.

Maintain consistency within the Menu & Cost module.

Do not mix:

```text
59.000đ
59,000
59000 VND
```

on the same screen.

---

# 78. MAIN TABLE VARIABLE-COST UPDATE

When a dish is saved/updated:

the Menu table must immediately reflect:

```text
new total variable cost
new variable cost item count
new Food Cost
new profit
new status
```

according to real application logic.

Do not require a full page refresh if the existing architecture supports reactive updates.

---

# 79. FOOD COST STATUS RECALCULATION

After variable-cost changes:

recalculate whether the dish is:

```text
Đạt mục tiêu
```

or:

```text
Vượt mục tiêu
```

using the real target.

Do not keep stale status values.

---

# 80. KPI RECALCULATION

If variable cost changes affect Food Cost:

the summary KPIs may also need updating:

```text
FOOD COST TB
MÓN ĐẠT MỤC TIÊU
MÓN VƯỢT MỤC TIÊU
```

Use existing state/query invalidation mechanisms.

Do not hardcode updates locally.

---

# 81. TABLE DENSITY

The Menu table should remain visible high in the viewport.

Do not make:

* page header too high
* KPI cards too high
* toolbar too high
* tabs too high

The Menu table is the primary workspace.

---

# 82. DESKTOP VIEWPORT OBJECTIVE

At:

```text
1920 × 1080
```

the user should ideally see:

```text
Page header
5 KPI cards
Toolbar
Category tabs
Table header
multiple menu rows
```

without unnecessary scrolling.

---

# 83. MODAL VIEWPORT OBJECTIVE

At 1080px viewport height:

Add/Edit modal should fit as much content as reasonably possible.

Do not create giant spacing that forces scrolling unnecessarily.

At the same time:

do NOT make the modal cramped.

Use:

```text
compact section layout
two-column fields
clear hierarchy
```

instead of reducing all text sizes.

---

# 84. RESPONSIVE MODALS

Tablet:

```text
modal width ≈ calc(100vw - 48px)
```

Two-column form may become one column when needed.

Mobile:

```text
near full-screen modal
```

Use:

* sticky header
* scrollable body
* sticky footer

Variable-cost rows may become stacked cards.

---

# 85. MOBILE VARIABLE COST ITEM

Example:

```text
Chi phí #1

Tên khoản chi
[ Bao bì ]

Mô tả
[ Hộp salad ]

Số tiền
[ 1.000đ ]

Delete
```

Do not squeeze the desktop variable-cost table into 375px width.

---

# 86. HOVER

Use restrained hover.

Inputs:

no animation beyond border/focus.

Buttons:

```text
150–200ms
```

Table row:

slightly brighter surface.

Variable-cost delete:

turn red on hover.

Primary buttons:

slight brightness + glow increase.

---

# 87. NO EXCESSIVE GLOW

Glow allowed on:

* Menu & Cost active sidebar
* Add Dish primary button
* active view switch
* focused input
* primary save/update button
* KPI icon
* active category tab

Do NOT glow:

* every table cell
* every variable-cost row
* all section headers
* every form border

---

# 88. COMPONENT REUSE

Prefer reusable components such as:

```text
MenuCostKpiCard
MenuToolbar
CategoryTabs
MenuTable
FoodCostIndicator
MenuStatusBadge

DishModal
DishImageUploader
DishBasicInfoSection
DishPriceCostSection
VariableCostSection
VariableCostRow
VariableCostSummary
```

Avoid duplicated Add/Edit form code if both screens share fields.

---

# 89. ADD AND EDIT SHOULD SHARE FORM COMPONENTS

Prefer architecture:

```text
DishForm
```

with modes:

```text
create
edit
```

rather than maintaining two entirely independent forms.

Example conceptual structure:

```text
<DishForm
  mode="create"
/>

<DishForm
  mode="edit"
/>
```

Do not force this refactor if the current code architecture makes it unsafe, but eliminate unnecessary duplicated UI logic when practical.

---

# 90. VARIABLE COST STATE MODEL

Use an array-like state structure.

Conceptually:

```text
variableCosts = [
  {
    id,
    name,
    description?,
    amount
  }
]
```

Do not create hardcoded fields such as:

```text
variableCost1
variableCost2
variableCost3
```

The feature must support a variable number of costs.

---

# 91. VARIABLE COST ADD

Click:

```text
+ Thêm chi phí
```

adds one new variable-cost row.

There should be no arbitrary visual limit such as exactly 3 rows unless the business rule explicitly defines one.

---

# 92. VARIABLE COST REMOVE

Delete should remove only that cost row.

Update:

```text
totalVariableCost
Food Cost
profit
```

immediately.

---

# 93. EXISTING BACKEND COMPATIBILITY

Before modifying payload structure:

read the current backend/API contract.

If variable costs require a new API structure:

adapt carefully.

Do not silently break existing menu saving.

If temporary frontend migration logic is necessary:

keep it isolated and documented.

---

# 94. IMAGE UPLOAD

Preserve existing upload validation:

```text
PNG / JPG
max size
```

Do not change upload restrictions without requirement.

---

# 95. MODAL SCROLLBAR

If modal body requires internal scroll:

style scrollbar subtly if supported.

Do not use a bright browser scrollbar that conflicts with the UI.

Do not hide scrollbar if doing so harms usability.

---

# 96. ACCESSIBILITY

Ensure:

* focus visible
* buttons keyboard accessible
* form labels connected correctly
* required fields communicated with text/symbol
* delete action has accessible label
* color not used alone for status meaning

---

# 97. DO NOT ADD UNREQUESTED FUNCTIONALITY

Do NOT add random features such as:

* ingredient inventory integration
* supplier picker
* recipe builder
* taxes
* discounts
* margin simulator
* AI food pricing

unless these already exist in the application or are explicitly requested.

The main new requirement is:

> multiple variable costs per dish.

---

# 98. EXACT APPROVED DECISIONS

These decisions are FINAL unless explicitly changed:

### Main Menu & Cost

Use the approved dark Nướng Chill layout.

### New column

Use:

```text
CHI PHÍ BIẾN ĐỔI
```

### Main table variable-cost display

Show:

```text
total amount
+
number of cost items
```

### Add modal

Variable costs can be added as multiple inline rows.

### Edit modal

Existing variable costs are displayed as an editable list/table.

### Variable cost total

Automatically calculated.

### Food Cost

Automatically recalculated.

### Main modal placement

Centered.

### Modal design

Dark navy, blue-purple accent, professional SaaS.

### Main CTA

```text
Lưu món
Cập nhật món
```

### App shell

Use Nướng Chill branding.

Do not reinterpret these without instruction.

---

# 99. FORBIDDEN REDESIGNS

Do NOT:

* convert Menu & Cost into card-only layout on desktop
* remove the table
* replace table with giant menu cards
* create multiple nested modals for basic variable cost editing
* use plain white forms
* use emoji UI
* make all cards heavily gradient
* make Food Cost chart-like and oversized
* use one color for all statuses
* remove real fields from Add/Edit forms
* place Add/Edit form in a right-side drawer
* make Variable Cost an editable value without item breakdown

---

# 100. IMPLEMENTATION WORKFLOW

## STEP 1 — READ

Read:

```text
Menu & Cost page
Add modal
Edit modal
API
hooks
Food Cost logic
```

---

## STEP 2 — MAP DATA

Determine:

```text
dish
category
price
baseCost
variableCosts
variableCostTotal
foodCost
target
profit
status
image
```

---

## STEP 3 — PRESERVE LOGIC

Keep existing real behavior.

---

## STEP 4 — IMPLEMENT VARIABLE COST

Support:

```text
multiple cost items
add
edit
delete
total
```

---

## STEP 5 — UPDATE CALCULATIONS

Ensure:

```text
Food Cost
Profit
Status
KPIs
```

update correctly.

---

## STEP 6 — UPGRADE MAIN SCREEN

Apply approved Menu & Cost design.

---

## STEP 7 — UPGRADE ADD MODAL

Apply approved:

```text
section hierarchy
spacing
variable-cost rows
summary
```

---

## STEP 8 — UPGRADE EDIT MODAL

Apply approved:

```text
image + information
price section
variable-cost table
summary
formula
```

---

## STEP 9 — RESPONSIVE

Test all three UI states.

---

## STEP 10 — VERIFY

Compare directly to the three approved designs.

Do not stop when the app merely compiles.

---

# 101. FUNCTIONAL VALIDATION

Before finishing verify:

* [ ] Search works
* [ ] Category filters work
* [ ] Status filters work
* [ ] List/grid switch works
* [ ] Food Cost report works
* [ ] Add Dish opens
* [ ] Edit Dish opens
* [ ] Delete Dish still works
* [ ] Image upload works
* [ ] Category selection works
* [ ] Dish code works
* [ ] Sale price works
* [ ] Base cost works
* [ ] Target works
* [ ] Variable cost row can be added
* [ ] Variable cost row can be edited
* [ ] Variable cost row can be deleted
* [ ] Variable cost total is correct
* [ ] Food Cost updates correctly
* [ ] Profit updates correctly
* [ ] Status updates correctly
* [ ] KPI totals update correctly
* [ ] Real API payload remains correct

---

# 102. VISUAL VALIDATION — MAIN SCREEN

Verify:

* [ ] Nướng Chill branding correct
* [ ] Menu & Cost active
* [ ] Title uses approved visual style
* [ ] Five KPIs correctly styled
* [ ] Toolbar compact
* [ ] Tabs compact
* [ ] Table starts high enough
* [ ] Variable Cost column visible
* [ ] Variable-cost amount easy to scan
* [ ] Variable-cost item count visible
* [ ] Food Cost indicator polished
* [ ] Status badges semantic
* [ ] Row actions restrained
* [ ] No excessive glow
* [ ] No horizontal page overflow

---

# 103. VISUAL VALIDATION — ADD MODAL

Verify:

* [ ] Modal centered
* [ ] Dark overlay
* [ ] Strong title hierarchy
* [ ] Clear subtitle
* [ ] Numbered/structured sections
* [ ] Image section clear
* [ ] Existing fields preserved
* [ ] Price section visually grouped
* [ ] Variable Cost section is prominent
* [ ] Variable cost rows aligned
* [ ] Add Cost action obvious
* [ ] Total Variable Cost visible
* [ ] Temporary Food Cost visible
* [ ] Footer actions clear
* [ ] Modal does not feel cramped
* [ ] Modal does not have excessive empty spacing

---

# 104. VISUAL VALIDATION — EDIT MODAL

Verify:

* [ ] Existing dish image visible
* [ ] Information section clear
* [ ] Price/Cost hierarchy clear
* [ ] Info card subtle
* [ ] Variable Cost list/table readable
* [ ] Description column optional
* [ ] Amount right aligned
* [ ] Delete actions clear
* [ ] Add Cost action clear
* [ ] Variable-cost total visually prominent
* [ ] Auto Food Cost visually prominent
* [ ] Formula helper visible but secondary
* [ ] Hủy / Cập nhật món clearly separated

---

# 105. RESPONSIVE VALIDATION

Test at minimum:

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

Main screen:

no page-level horizontal overflow.

Modal:

usable at every viewport.

---

# 106. FINAL QUALITY TEST

Ask:

> If the user opens Dashboard → Checklist → Menu & Cost, do all three screens clearly look like the same Nướng Chill product?

Then ask:

> Does Menu & Cost still feel specifically optimized for food pricing and cost management?

Both answers must be:

```text
YES
```

---

# 107. FINAL RULE

This skill is ONLY for:

> **NƯỚNG CHILL — MENU & COST**

including:

```text
Menu & Cost main screen
Thêm món mới modal
Chỉnh sửa món modal
```

The implementation must preserve all existing real data and business behavior.

The primary new functional UX requirement is:

> A dish may contain MULTIPLE variable-cost items.

These items must:

```text
be independently editable
be removable
be addable
be summed automatically
feed into Food Cost
feed into profit calculations
appear as a total in the Menu table
```

The final result must not simply recolor the old screen.

Upgrade:

* hierarchy
* spacing
* typography
* KPI cards
* toolbar
* category tabs
* table
* Variable Cost column
* modal structure
* form hierarchy
* variable-cost management
* summary calculations
* responsive behavior

until the Menu & Cost module fully matches the approved Nướng Chill design language.