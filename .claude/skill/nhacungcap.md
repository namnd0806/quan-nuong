# PROMPT TRIỂN KHAI — NƯỚNG CHILL SUPPLIER MANAGEMENT

Bạn đang thực hiện nhiệm vụ **nâng cấp toàn bộ module Nhà cung cấp** của dự án Nướng Chill.

Module này gồm đúng 4 trạng thái giao diện:

1. Màn danh sách Nhà cung cấp
2. Modal Thêm nhà cung cấp
3. Modal Xem chi tiết nhà cung cấp
4. Modal Chỉnh sửa nhà cung cấp

Đây là nhiệm vụ:

> UPGRADE EXISTING UI

không phải:

> REBUILD BUSINESS LOGIC FROM SCRATCH

---

## 1. ĐỌC SKILL TRƯỚC KHI CODE

Bắt buộc đọc toàn bộ file:

```text
claude/skill/supplier_skill.md

Đây là source of truth về:

design rule
layout
typography
spacing
status colors
modal
table
responsive
Supplier-specific UX

Không được bỏ qua skill này.

2. ĐỌC 4 ẢNH THIẾT KẾ ĐÃ CHỐT

Bắt buộc mở và phân tích kỹ:

claude/upgrade_UI/supplier.png
claude/upgrade_UI/supplier_add.png
claude/upgrade_UI/supplier_view.png
claude/upgrade_UI/supplier_edit.png

Các ảnh này là:

VISUAL SOURCE OF TRUTH

Cần bám sát về:

bố cục
tỷ lệ
màu
card
bảng
form
modal
hierarchy
CTA
status
spacing

Không tự thiết kế lại theo style khác.

3. APP SHELL ĐÃ CHỐT — KHÔNG ĐƯỢC THAY ĐỔI

Sidebar và Header hiện tại đã được chốt ở các màn trước.

Đây là rule cực kỳ quan trọng.

Không được tự redesign:

Logo
Sidebar width
Sidebar spacing
Sidebar icons
Active navigation
Top header
Search
Date
Theme
Fullscreen
Notification
Avatar

Phải reuse chính xác shell hiện tại trong source code.

Chỉ thay:

active navigation = Nhà cung cấp
4. LOGO

Phải dùng chính logo Nướng Chill đã có trong code/assets hiện tại.

Không generate logo mới.

Không dùng:

QUÁN NƯỚNG

Không dùng emoji 🔥.

Không tự thay đổi tỷ lệ, chữ hoặc màu của logo.

Ưu tiên:

reuse component / asset shell đang dùng ở Dashboard hoặc các màn đã hoàn thiện.

5. ĐỌC CODE NHÀ CUNG CẤP HIỆN TẠI

Trước khi sửa UI, đọc đầy đủ:

Supplier page

Supplier table/list

Supplier filters

Supplier status logic

Supplier category logic

Supplier view/grid switch

Add Supplier modal

View Supplier modal

Edit Supplier modal

Logo/image upload

Products supplied logic

Search

Pagination

Hooks

Services/API

State management

Validation

Permissions

Responsive styles

Không code trước khi hiểu logic hiện có.

6. GIỮ NGUYÊN BUSINESS LOGIC

Tuyệt đối không làm hỏng:

API
routing
search
category filter
status filter
pagination
list/grid switch
add supplier
edit supplier
view supplier
logo upload
products supplied
status
category
notes
validation
permissions

Không đổi API contract chỉ để UI dễ code hơn.

Không mock data từ ảnh.

7. KHÔNG HARDCODE DATA TỪ DESIGN

Các dữ liệu ví dụ như:

Hải Sản Lộc Biển
087xxxxxxx
Tôm sú
Cá hồi
6 nhà cung cấp
4 đang hợp tác
2 đang xem xét

chỉ để minh họa thiết kế.

Production UI phải lấy từ:

real state / API / backend
8. MÀN NHÀ CUNG CẤP — FINAL STRUCTURE

Desktop hierarchy:

Nhà cung cấp                     + Thêm nhà cung cấp
Quản lý danh sách nhà cung cấp

4 KPI

Search
Category
Status
List/Grid

Supplier table

Pagination

Giữ layout compact.

Không thêm chart hoặc dashboard section không liên quan.

9. 4 KPI

Giữ đúng:

TẤT CẢ
ĐANG HỢP TÁC
ĐANG XEM XÉT
NGỪNG HỢP TÁC

Semantic colors:

Tất cả
→ Blue

Đang hợp tác
→ Green

Đang xem xét
→ Orange

Ngừng hợp tác
→ Purple

Data thật.

Không hardcode số.

10. KPI DESIGN

KPI phải giống ảnh reference:

dark navy base
soft border
rounded 14–16px
compact icon block
strong number
muted secondary text
semantic accent

Không fill full card bằng màu.

Không glow quá mạnh.

11. TOOLBAR

Giữ:

Tìm nhà cung cấp...

Tất cả danh mục

Tất cả trạng thái

List / Grid switch

Các control phải:

cùng chiều cao
cùng radius
căn thẳng
compact

Không để filter cao/thấp lệch nhau.

12. SUPPLIER TABLE

Columns:

NHÀ CUNG CẤP
DANH MỤC
SẢN PHẨM CUNG CẤP
TRẠNG THÁI
GHI CHÚ
THAO TÁC

Không xóa các cột đang có logic thật.

13. SUPPLIER ROW

Hiển thị:

Avatar/logo

Tên nhà cung cấp
Số điện thoại

Nếu supplier có logo:

use real logo

Nếu không:

fallback initial avatar

Fallback avatar dùng:

blue-purple gradient

không dùng emoji.

14. CATEGORY

Category hiển thị bằng pill nhỏ.

Ví dụ:

Hải sản
Rau củ
Gas
Gia vị
Đồ uống
Bao bì

Nhưng dữ liệu phải lấy từ API.

15. SẢN PHẨM CUNG CẤP

Display count:

2 sản phẩm

Nếu icon Eye hiện tại mở danh sách sản phẩm:

giữ chức năng.

Nếu chỉ là decorative icon không có logic:

không tạo fake action.

16. STATUS

Use semantic pill:

Đang hợp tác
Đang xem xét
Ngừng hợp tác

Nếu hiện tại support inline update:

giữ editable status.

Nếu không:

giữ display-only.

Không tự thay đổi behavior.

17. ROW ACTIONS

Giữ actions hiện tại.

Thiết kế:

Eye
Pencil
MoreVertical

Outline icon.

Default muted.

Hover:

View → Blue
Edit → Blue
Danger → Red
18. PAGINATION

Dùng real data.

Ví dụ layout:

Hiển thị 1–6 trong 6 nhà cung cấp

                      <   1   >

Active page:

blue
soft glow
19. MODAL THÊM NHÀ CUNG CẤP

Bám sát:

claude/upgrade_UI/supplier_add.png

Modal phải:

centered
dark overlay
dark navy surface
thin blue border
16px radius
clear hierarchy

Không dùng right drawer.

20. THÊM NHÀ CUNG CẤP — FIELDS

Preserve 100% existing fields:

Logo nhà cung cấp

Tên nhà cung cấp *

Số điện thoại

Email

Địa chỉ

Danh mục *

Trạng thái *

Sản phẩm cung cấp

Ghi chú

Không invent field.

Không remove field.

21. ADD MODAL LAYOUT

Full width:

Tên nhà cung cấp
Địa chỉ

Two columns:

Số điện thoại | Email

Danh mục | Trạng thái

Products:

[input product.......................] [+ Thêm]

product chips / empty state

Footer:

Hủy                  Lưu
22. LOGO UPLOAD

Reuse upload logic hiện tại.

Không đổi API.

UI cần đẹp hơn:

preview / fallback
Tải ảnh lên
helper text

Nếu chưa có ảnh:

dùng fallback icon/initial sạch.

Không dùng emoji storefront.

23. MODAL XEM CHI TIẾT

Bám sát:

claude/upgrade_UI/supplier_view.png

Đây là READ ONLY.

Không dùng input editable.

24. DETAIL MODAL HEADER

Layout:

Avatar   Tên nhà cung cấp   Status

                             X

Supplier name là visual focus.

Status nằm cạnh name.

25. DETAIL CONTENT

Giữ các section:

THÔNG TIN LIÊN HỆ

SẢN PHẨM CUNG CẤP

GHI CHÚ

THÔNG TIN KHÁC

Nếu field không có data:

Chưa cập nhật

Không invent data.

26. THÔNG TIN LIÊN HỆ

Hiển thị bằng icon + text:

Phone

Email

Address

Modern outline icons.

Không dùng form input.

27. PRODUCTS DETAIL

List đơn giản:

• Tôm sú
• Cá hồi

Không cần giant cards.

Use real product list.

28. OTHER INFO

Chỉ render data thực sự tồn tại.

Ví dụ nếu có:

Danh mục
Ngày tạo
Đặt hàng gần nhất

Nếu backend không có field nào đó:

không mock để giống ảnh.

29. DETAIL MODAL ACTION

Footer:

Đóng

Neutral button.

Không cần primary glowing CTA.

30. MODAL CHỈNH SỬA

Bám sát:

claude/upgrade_UI/supplier_edit.png

Preserve toàn bộ current supplier data.

31. EDIT MODAL TOP

Desktop:

LOGO / AVATAR       THÔNG TIN CƠ BẢN

Logo approximately:

25%

Form:

75%

Mục tiêu:

giảm chiều cao modal nhưng vẫn rõ hierarchy.

32. EDIT FIELDS

Preserve:

Tên nhà cung cấp

Số điện thoại

Email

Địa chỉ

Danh mục

Trạng thái

Sản phẩm cung cấp

Ghi chú

Không bỏ field cũ.

33. EDIT PRODUCTS

Use:

[Nhập tên sản phẩm...............] [+ Thêm]

[Tôm sú ×]
[Cá hồi ×]

Đã có: 2 sản phẩm

Maintain existing functionality.

No fake interactions.

34. NOTES

Textarea full width.

Preserve actual text.

Nếu current code có max-length/count:

giữ.

Nếu không có:

không tự invent validation.

35. EDIT FOOTER

Use:

Hủy                 Lưu thay đổi

Primary:

blue gradient
white text
soft glow

Secondary:

dark
neutral border
36. MODAL TYPOGRAPHY

Hierarchy phải rõ.

Modal title
22–26px / 700

Section heading
12–14px / 600–700

Field label
12–13px / 500–600

Input text
13–14px

Helper text
11–12px muted

Không làm tất cả cùng size/weight.

37. MODAL SPACING

Recommended:

Title → body
20–24px

Section heading → content
12px

Label → input
6–8px

Fields gap
12–16px

Section gap
20–24px

Không để khoảng trống quá lớn.

Không làm form chật.

38. INPUT STYLE

Use approved dark input:

40–44px height

dark navy
thin border
10px radius

Focus:

blue border
soft focus ring

Do not use bright input backgrounds.

39. DROPDOWN

Use same component style as:

Dashboard
Checklist
Menu & Cost

No browser-default dropdown visuals.

40. OVERLAY

Modal background overlay:

dark
slight blur

Background content vẫn nhận ra được nhưng không cạnh tranh modal.

41. SCROLL

Nếu modal cao:

fixed/sticky header
scrollable modal body
stable footer

Không scroll cả background page khi modal mở.

42. RESPONSIVE MAIN PAGE

Desktop:

4 KPIs
toolbar one row
table

Tablet:

2 × 2 KPI
toolbar wraps
table internal horizontal scroll if needed

Mobile:

sidebar drawer
KPI 2 columns
filters stack
supplier cards instead of compressed desktop table
43. RESPONSIVE MODAL

Tablet:

width: calc(100vw - 48px)

Mobile:

near full-screen

Collapse 2-column fields → 1-column.

Header/footer should stay accessible.

44. DO NOT CHANGE APP SHELL

Repeat this rule before coding:

DO NOT redesign:

Sidebar
Header
Logo
Navigation icons
Search
Date
Notification
Avatar

Reuse approved implementation directly.

45. DO NOT ADD UNREQUESTED FEATURES

Không thêm:

supplier rating
supplier analytics
purchase orders
payments
supplier score
AI recommendation
charts
timeline

unless already exists.

46. DO NOT STOP AT ANALYSIS

Sau khi đọc code:

IMPLEMENT CODE DIRECTLY.

Không chỉ trả về plan.

Không chỉ mô tả CSS.

Không chỉ nói “I recommend”.

47. BUILD VERIFICATION

Sau implementation:

run relevant:

typecheck
lint
build

Fix errors introduced by the redesign.

48. FUNCTIONAL VALIDATION

Verify:

Supplier list loads

Search works

Category filter works

Status filter works

List/Grid switch works

Pagination works

Add Supplier works

View Supplier works

Edit Supplier works

Logo upload works

Products can be added

Products can be removed

Notes work

Category works

Status works

API stays correct
49. VISUAL VALIDATION

Compare directly to:

claude/upgrade_UI/supplier.png
claude/upgrade_UI/supplier_add.png
claude/upgrade_UI/supplier_view.png
claude/upgrade_UI/supplier_edit.png

Check:

spacing
card height
modal width
alignment
font hierarchy
border
glow
status colors
CTA
inputs
products
table density

Continue refining if first render is not close enough.

50. APP SHELL VALIDATION

Before completing, confirm:

Sidebar visually identical to approved shell

Header visually identical to approved shell

Nướng Chill logo identical

Nhà cung cấp active

All other navigation unchanged

If shell differs:

task is NOT complete.

51. FINAL OBJECTIVE

The final result must look like:

The existing Supplier module has been upgraded into the same premium Nướng Chill product design system used by Dashboard, Checklist and Menu & Cost.

while preserving:

real data
API
business logic
validation
permissions
interactions

Do not simply recolor the old page.

Upgrade:

layout
hierarchy
KPI
filters
table
pagination
modals
form spacing
read-only detail presentation
responsive behavior
visual consistency
52. FINAL EXECUTION ORDER

Follow exactly:

1. Read claude/skill/supplier_skill.md

2. Open:
   claude/upgrade_UI/supplier.png
   claude/upgrade_UI/supplier_add.png
   claude/upgrade_UI/supplier_view.png
   claude/upgrade_UI/supplier_edit.png

3. Inspect and reuse the approved Sidebar/Header implementation

4. Read current Supplier source code

5. Understand all real data/actions

6. Upgrade Supplier main screen

7. Upgrade Add Supplier modal

8. Upgrade View Supplier modal

9. Upgrade Edit Supplier modal

10. Verify real functionality

11. Verify responsiveness

12. Compare visually with all 4 references

13. Refine until consistent

14. Run build/typecheck/lint and fix issues