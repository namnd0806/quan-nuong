# NƯỚNG CHILL — CHECKLIST UPGRADE SKILL

## 1. PURPOSE

This skill applies ONLY to the **Checklist screen** of the Nướng Chill application.

Do NOT automatically apply Checklist-specific layout rules to:

* Dashboard
* Ngân sách
* Menu & Cost
* Nhà cung cấp
* Ghi chú
* Cài đặt

Those screens have or will have their own design skills.

The responsibility of this skill is:

> Read the existing Checklist implementation, preserve all existing functionality and business logic, then upgrade the old Checklist UI into the approved Nướng Chill Checklist design.

This is:

> UPGRADE EXISTING CHECKLIST

NOT:

> REBUILD AN UNRELATED CHECKLIST FROM SCRATCH

---

# 2. SOURCE OF TRUTH

Use the following priority.

## Visual source of truth

```text
claude/upgrade_UI/checklist.png
```

This image defines:

* layout
* spacing
* visual hierarchy
* component placement
* colors
* sidebar appearance
* navbar appearance
* cards
* filters
* table
* buttons
* badges
* pagination

## Implementation rule source

```text
claude/skill/checklist_skill.md
```

## Functional source of truth

The existing application source code.

Existing code remains the source of truth for:

* APIs
* data
* routes
* business logic
* actions
* permissions
* validation

---

# 3. DESIGN DIRECTION

Official Checklist style:

> **Modern Futuristic Dark SaaS UI**

Target balance:

> 80% professional SaaS
> 20% futuristic neon

The screen must feel:

* premium
* clean
* modern
* compact
* data-oriented
* easy to scan
* easy to operate

Do NOT turn it into:

* gaming UI
* cyberpunk UI
* highly glowing neon UI
* glassmorphism-heavy UI

---

# 4. CONTEXT — OLD UI UPGRADE

Before editing anything:

1. Read the current Checklist page.
2. Read child components.
3. Read task table/list components.
4. Read filter components.
5. Read add/edit task forms or modals.
6. Read hooks.
7. Read API/services.
8. Read state management.
9. Read pagination logic.
10. Read status logic.
11. Read priority logic.
12. Read category logic.
13. Read assignment logic.
14. Read routing/navigation.
15. Read responsive CSS.

Do not start redesigning before understanding the existing implementation.

---

# 5. PRESERVE FUNCTIONALITY

Do NOT break:

* Add task
* Edit task
* Delete task
* Select task
* Bulk selection if available
* Search
* Category filter
* Priority filter
* Status filter
* Advanced filter
* Pagination
* Page size
* Task assignment
* Deadline
* Priority updates
* Status updates
* API integration
* Notifications
* Routing
* Permissions

Do NOT replace real data with values copied from the mockup.

Numbers shown in `checklist.png` are visual examples only.

---

# 6. FINAL PAGE STRUCTURE

Desktop Checklist hierarchy:

```text
┌──────── SIDEBAR ────────┬─────────────────────────────────────────┐
│                         │ TOP NAVBAR                              │
│ Nướng Chill             │                                         │
│                         │ Checklist             + Thêm công việc  │
│ Dashboard               │ Subtitle                                │
│ Checklist               │                                         │
│ Ngân sách               │ 5 STATUS SUMMARY CARDS                 │
│ Menu & Cost             │                                         │
│ Nhà cung cấp            │ SEARCH + FILTERS                       │
│ Ghi chú                 │                                         │
│                         │ TASK TABLE                              │
│                         │                                         │
│ Cài đặt                 │ PAGINATION                             │
│ Profile                 │                                         │
└─────────────────────────┴─────────────────────────────────────────┘
```

This hierarchy is approved.

---

# 7. PAGE BACKGROUND

Use the same dark navy foundation as the Nướng Chill product.

Recommended direction:

```css
background:
  radial-gradient(
    circle at 50% -10%,
    rgba(37, 99, 235, 0.05),
    transparent 38%
  ),
  #06101f;
```

Do not use pure black.

---

# 8. MAIN CONTENT

Recommended:

```css
.checklist-content {
  width: 100%;
  max-width: 1600px;
  margin-inline: auto;
  padding: 24px 28px 32px;
}
```

Do not stretch the table indefinitely on very wide displays.

---

# 9. APP SHELL

Checklist uses the same approved Nướng Chill application shell as Dashboard.

This includes:

* Nướng Chill logo
* Sidebar
* Modern outline icons
* Dark top navbar
* Search
* Date control
* Theme control
* Fullscreen if supported
* Notification
* Avatar

Do NOT keep the old `QUÁN NƯỚNG` branding.

---

# 10. NƯỚNG CHILL BRAND

Approved branding:

```text
🔥 Nướng Chill
   Pre-opening
```

Use the actual project logo/SVG if available.

Do NOT use emoji in production.

Visual characteristics:

* flame symbol
* orange/yellow/red
* `Nướng` white
* `Chill` orange
* `Pre-opening` small orange

---

# 11. SIDEBAR

Desktop target width:

```text
235px – 250px
```

Recommended:

```css
width: 244px;
```

Background should be slightly darker than main content.

---

# 12. SIDEBAR ICONS

Use one modern outline icon family.

Mapping:

```text
Dashboard
→ LayoutDashboard / Grid

Checklist
→ ClipboardCheck / ListChecks

Ngân sách
→ Wallet

Menu & Cost
→ Utensils

Nhà cung cấp
→ Store

Ghi chú
→ FileText

Cài đặt
→ Settings
```

Do NOT:

* use emoji
* mix filled and outline icons
* use random icon libraries together

---

# 13. CHECKLIST ACTIVE NAVIGATION

On this screen:

```text
Checklist
```

must be the active sidebar item.

NOT Dashboard.

Approved active style:

```text
blue translucent background
thin blue border
subtle blue glow
bright icon
white text
```

Recommended:

```css
.sidebar-item.active {
  background:
    linear-gradient(
      90deg,
      rgba(37,133,255,0.16),
      rgba(37,133,255,0.07)
    );

  border:
    1px solid rgba(37,133,255,0.55);

  box-shadow:
    0 0 18px rgba(37,133,255,0.08);
}
```

---

# 14. TOP NAVBAR

Keep the approved Nướng Chill navbar.

It contains the existing relevant controls such as:

```text
Search
Date
Theme
Fullscreen
Notification
Avatar
```

Do not alter working behavior.

Only upgrade its styling if necessary.

---

# 15. PAGE HEADER

Checklist page header:

```text
Checklist
Theo dõi các công việc chuẩn bị mở quán
```

Hierarchy:

```text
Checklist
28–32px
700

Subtitle
13–14px
Muted
```

---

# 16. ADD TASK BUTTON

Top-right primary action:

```text
+ Thêm công việc
```

This is the most important action on the Checklist screen.

Style:

```text
electric blue
medium glow
white text
plus icon
rounded rectangle
```

Recommended direction:

```css
.add-task-button {
  background:
    linear-gradient(
      180deg,
      #287cff,
      #1764e8
    );

  border:
    1px solid rgba(96,165,250,0.65);

  border-radius: 11px;

  color: #fff;

  box-shadow:
    0 8px 22px rgba(37,133,255,0.18);
}
```

Hover:

* slightly brighter
* subtle lift
* no aggressive animation

---

# 17. STATUS SUMMARY SECTION

Below the page title, show exactly 5 summary cards:

```text
TẤT CẢ
CHƯA LÀM
ĐANG LÀM
HOÀN THÀNH
QUÁ HẠN
```

Desktop:

```text
5 cards in one row
```

---

# 18. SUMMARY CARD STRUCTURE

Each card:

```text
ICON

LABEL

COUNT
công việc
```

Approximate:

```text
┌────────────────────┐
│ [icon]             │
│        TẤT CẢ      │
│        10          │
│        công việc   │
└────────────────────┘
```

Keep the cards compact.

---

# 19. SUMMARY CARD COLORS

Semantic colors:

```text
Tất cả
→ Blue

Chưa làm
→ Orange

Đang làm
→ Purple

Hoàn thành
→ Green

Quá hạn
→ Red
```

Do not color the full cards strongly.

Use status colors mainly for:

* icon container
* label
* subtle glow/border
* small details

---

# 20. ACTIVE SUMMARY CARD

The selected summary card should have stronger emphasis.

In the approved design:

```text
TẤT CẢ
```

is selected.

Treatment:

```text
stronger blue border
blue-tinted surface
subtle blue glow
```

Recommended:

```css
.summary-card.active {
  border:
    1px solid rgba(37,133,255,0.70);

  background:
    linear-gradient(
      135deg,
      rgba(37,133,255,0.12),
      rgba(11,23,40,0.96)
    );

  box-shadow:
    0 0 20px rgba(37,133,255,0.08);
}
```

---

# 21. SUMMARY CARD BASE

Inactive cards:

```css
.summary-card {
  background: #0b1728;

  border:
    1px solid rgba(148,163,184,0.12);

  border-radius: 14px;
}
```

Do not make them overly colorful.

---

# 22. SUMMARY CARD ICON

Use a rounded dark colored container.

Approximate:

```text
44–48px
```

Example:

```text
Tất cả
→ clipboard icon

Chưa làm
→ clock icon

Đang làm
→ hourglass icon

Hoàn thành
→ check-circle

Quá hạn
→ x-circle / alert
```

Keep all icons in one visual family.

---

# 23. FILTER TOOLBAR

Below summary cards:

```text
Search task
Category
Priority
Advanced Filter
```

Layout:

```text
[ Search........................ ]

[ Tất cả hạng mục ]

[ Tất cả ưu tiên ]

[ Bộ lọc ]
```

All controls must align vertically.

---

# 24. TASK SEARCH

Placeholder:

```text
Tìm kiếm công việc...
```

Style:

```text
dark surface
search icon
thin border
10–12px radius
```

Focus:

```text
blue border
subtle blue ring
```

Do not use an oversized search control.

---

# 25. CATEGORY FILTER

Label/value example:

```text
Tất cả hạng mục
⌄
```

Use dark SaaS dropdown styling.

Do not leave native browser appearance.

---

# 26. PRIORITY FILTER

Example:

```text
Tất cả ưu tiên
⌄
```

Same dimensions and styling as category filter.

All select controls should share one component style.

---

# 27. ADVANCED FILTER BUTTON

Use:

```text
filter/sliders icon
Bộ lọc
```

This is secondary action.

Style:

```text
dark surface
thin border
muted/white text
```

Do NOT style it as strongly as `Thêm công việc`.

---

# 28. FILTER ALIGNMENT

Desktop:

```text
Search                  Category     Priority     Filter
```

Recommended proportions:

```text
Search
≈ 32–36%

Category
≈ 18%

Priority
≈ 18%

Filter
auto width
```

Use flexible grid/flex.

Do not hardcode widths that break at laptop resolutions.

---

# 29. TASK TABLE CONTAINER

The table sits inside one large dark panel.

Style:

```css
.task-table-panel {
  background:
    rgba(10, 23, 40, 0.96);

  border:
    1px solid rgba(148,163,184,0.11);

  border-radius:
    14px;

  overflow:
    hidden;
}
```

Do not use white table backgrounds.

---

# 30. TABLE COLUMNS

Approved columns:

```text
SELECT

CÔNG VIỆC

HẠNG MỤC

NGƯỜI PHỤ TRÁCH

DEADLINE

ƯU TIÊN

TRẠNG THÁI

ACTIONS
```

Maintain this information architecture unless existing application data requires more.

---

# 31. TABLE HEADER

Use:

```text
uppercase / semi-uppercase
small muted text
medium weight
```

Example:

```text
CÔNG VIỆC
HẠNG MỤC
NGƯỜI PHỤ TRÁCH
DEADLINE
ƯU TIÊN
TRẠNG THÁI
```

Recommended:

```text
12–13px
600
#9aa8bb
```

Do not make table headers bright white.

---

# 32. TABLE ROW HEIGHT

Rows should be compact but comfortable.

Target:

```text
56–64px
```

Avoid overly tall enterprise tables.

---

# 33. TABLE DIVIDERS

Use subtle horizontal separators.

Example:

```css
border-top:
  1px solid rgba(148,163,184,0.08);
```

Do not draw strong vertical lines between every column.

---

# 34. TABLE ROW HOVER

Hover:

```text
slightly brighter dark navy
```

Example:

```css
.task-row:hover {
  background:
    rgba(37,133,255,0.025);
}
```

No row scaling.

---

# 35. CHECKBOXES

Checkboxes should fit the dark design.

Unchecked:

```text
dark transparent fill
gray border
```

Checked:

```text
blue background
white check
```

Use a consistent custom checkbox or themed existing checkbox.

Do not leave an ugly browser-default checkbox if it conflicts visually.

---

# 36. TASK NAME

Task name is one of the strongest text items in each row.

Use:

```text
Primary text
13–14px
500–600
```

Example:

```text
Lắp hệ thống hút khói
```

Do not make it a huge bold heading.

---

# 37. CATEGORY BADGES

Examples:

```text
Xây dựng
Thiết bị
```

Category badge may use its category semantic color.

Example:

```text
Xây dựng
→ Orange

Thiết bị
→ Blue
```

Style:

```text
soft tinted background
colored text
optional small category icon
pill radius
```

Use category icons only if the current product consistently uses them.

---

# 38. CATEGORY BADGE STYLE

Recommended:

```css
.category-badge {
  padding:
    5px 10px;

  border-radius:
    999px;

  font-size:
    12px;

  font-weight:
    600;
}
```

Do not create huge badges.

---

# 39. ASSIGNEE

Display:

```text
Avatar + Name
```

Example:

```text
[N] Nam (Bạn)
```

Avatar:

```text
28–32px
circular
```

Use existing profile data.

Do not hardcode avatar initials if real avatar data exists.

---

# 40. CURRENT USER LABEL

If the assignee is the logged-in user and the existing system supports it:

```text
Nam (Bạn)
```

is acceptable.

Do not invent `(Bạn)` unless the application actually identifies the current user.

---

# 41. DEADLINE

Display:

```text
calendar icon
DD/MM/YYYY
```

Example:

```text
22/08/2026
```

Use consistent date formatting throughout Checklist.

---

# 42. OVERDUE DEADLINES

If a task is overdue, the existing business rules determine the status.

Do not independently infer overdue logic from UI if backend logic already exists.

The deadline text itself may remain muted while the status badge communicates overdue.

---

# 43. PRIORITY LEVELS

Supported examples:

```text
Cao
Trung bình
Thấp
```

Semantic:

```text
Cao
→ Red

Trung bình
→ Orange

Thấp
→ Green or muted blue/green
```

Use actual project priority values.

---

# 44. PRIORITY CONTROL

In the approved design, priority appears as a compact pill/select.

Example:

```text
Cao ⌄
```

If priority is editable inline in existing code, preserve that behavior.

If it is display-only, do not turn it into an editable dropdown accidentally.

---

# 45. PRIORITY BADGE

Use tinted low-opacity background.

Example:

```css
.priority-high {
  color: #ff5c6c;
  background: rgba(255,68,85,0.10);
  border: 1px solid rgba(255,68,85,0.26);
}
```

Do not use bright filled red buttons.

---

# 46. TASK STATUS

Statuses:

```text
Chưa làm
Đang làm
Hoàn thành
Quá hạn
```

Semantic colors:

```text
Chưa làm
→ muted blue / neutral

Đang làm
→ Purple

Hoàn thành
→ Green

Quá hạn
→ Red
```

If current application uses orange for another state, preserve semantic consistency across the project.

---

# 47. STATUS CONTROL

Status may appear as:

```text
Chưa làm ⌄
Đang làm ⌄
```

If existing system supports inline status modification, preserve it.

The design must not remove that capability.

---

# 48. STATUS BADGE

Example:

```css
.status-working {
  background:
    rgba(139,92,246,0.12);

  color:
    #9d73ff;
}
```

Rounded pill.

Compact.

---

# 49. ROW ACTIONS

Approved row actions:

```text
Edit
Delete
```

Use outline icons.

Recommended:

```text
Pencil
Trash2
```

Do not use filled colored buttons for every row.

Default:

```text
muted gray icons
```

Hover:

```text
Edit
→ Blue

Delete
→ Red
```

---

# 50. ACTION BUTTON HIT AREA

Although icons look small, interaction target should remain usable.

Recommended:

```text
32–36px
```

Do not create tiny 16px clickable areas.

---

# 51. TABLE TOOL ICON

The top-right table header may include a sliders/settings icon if the current feature supports:

* column visibility
* table configuration
* advanced controls

Do not add non-functional decorative controls.

If the old app has no corresponding behavior and the reference control has no requirement, either wire it correctly or omit it.

Never create fake interaction.

---

# 52. PAGINATION FOOTER

At the bottom of the table include:

Left:

```text
Hiển thị 1 - 5 trong 10 công việc
```

Center:

```text
‹  1  2  ›
```

Right:

```text
10 / trang
```

Use real pagination data.

Do not hardcode values from the design.

---

# 53. PAGINATION BUTTONS

Active page:

```text
blue background
blue border
white text
subtle glow
```

Inactive:

```text
dark surface
thin border
muted text
```

Disabled:

```text
lower opacity
no hover
```

---

# 54. PAGE SIZE SELECT

Example:

```text
10 / trang
⌄
```

Use the same dropdown styling as filters.

Do not use browser-default select UI.

---

# 55. TABLE EMPTY STATE

If no tasks match filters:

Do not show a broken empty table.

Use a clean empty state:

```text
outline checklist icon

Không tìm thấy công việc

Thử thay đổi bộ lọc hoặc thêm công việc mới.
```

Optional:

```text
+ Thêm công việc
```

if appropriate.

---

# 56. LOADING STATE

When fetching tasks:

Prefer skeleton rows.

Example:

```text
████████
████████████
██████
```

Use subtle shimmer.

Do not flash a blank table.

---

# 57. ERROR STATE

If task retrieval fails:

Display a clean error state.

Example:

```text
Không thể tải danh sách công việc

Thử lại
```

Do not expose raw backend stack traces.

---

# 58. ADD TASK MODAL / FORM

If `Thêm công việc` opens an existing modal/form:

Preserve all fields and validation.

Upgrade the modal styling to match Checklist.

Dark modal:

```text
dark navy surface
16px radius
subtle border
```

Controls:

```text
10px radius
dark input surface
blue focus state
```

---

# 59. EDIT TASK

Editing must preserve existing behavior.

The user should not lose any existing editable fields during UI modernization.

---

# 60. DELETE TASK

Do not make delete instantaneous if the existing product currently requires confirmation.

If a confirmation modal exists, preserve it.

Danger action:

```text
Red
```

Primary cancel/neutral behavior should remain clear.

---

# 61. BULK SELECTION

If the existing Checklist supports selecting multiple rows:

preserve bulk selection behavior.

The header checkbox should represent:

* none selected
* partially selected
* all selected

Do not implement purely decorative checkboxes.

---

# 62. FILTER STATE

Filters should remain usable together.

Example:

```text
Search
+
Category
+
Priority
+
Status / advanced filter
```

Changing one filter must not silently reset unrelated filters unless existing logic intentionally does so.

---

# 63. FILTER RESET

If advanced filters are active, provide the existing reset/clear behavior.

If old UI already supports reset, keep it.

Do not remove useful filtering controls just to make the toolbar visually simpler.

---

# 64. RESPONSIVE — LARGE DESKTOP

At >= 1440px:

```text
5 status cards in one row

Search + filters in one row

Full data table
```

Maintain the approved desktop composition.

---

# 65. RESPONSIVE — LAPTOP

At approximately:

```text
1200–1439px
```

Reduce:

* content padding
* card gaps
* table column spacing

Keep table readable.

Do not allow:

* action icons to overlap
* long task names to break row
* badges to overflow

---

# 66. RESPONSIVE — TABLET

At:

```text
768–1199px
```

Status cards may use:

```text
3 + 2
```

or:

```text
2 + 2 + 1
```

depending on available width.

Filters may wrap.

Example:

```text
Search full width

Category
Priority
Filter
```

Table may use controlled horizontal scrolling only if necessary.

Prefer hiding secondary columns only if product requirements allow it.

---

# 67. RESPONSIVE — MOBILE

At:

```text
< 768px
```

Sidebar becomes drawer.

Page header:

```text
Checklist
Subtitle

+ Thêm
```

or responsive compact equivalent.

Summary cards:

```text
2 columns
```

or horizontal compact cards if appropriate.

---

# 68. MOBILE TASK DISPLAY

Do NOT shrink the full desktop table until unreadable.

On small screens, transform rows into task cards if appropriate.

Recommended mobile structure:

```text
┌──────────────────────────────┐
│ □  Lắp hệ thống hút khói    │
│                              │
│ Xây dựng                     │
│ Nam (Bạn)                    │
│ 22/08/2026                   │
│                              │
│ Cao          Chưa làm        │
│                              │
│ Edit                  Delete │
└──────────────────────────────┘
```

Maintain the same data and actions.

---

# 69. GRID SAFETY

Use:

```css
min-width: 0;
```

on flex/grid children.

Critical for:

* search
* filters
* cards
* table wrappers
* navbar
* content

---

# 70. TEXT OVERFLOW

For long task names:

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

Provide title/tooltip if useful.

Do not allow long text to destroy table layout.

---

# 71. TABLE OVERFLOW

Desktop should NOT require page-level horizontal scrolling.

If table needs internal overflow:

```css
overflow-x: auto;
```

inside the table container only.

Never cause the entire application shell to overflow horizontally.

---

# 72. COLORS

Use consistent semantic colors:

```css
--primary: #2585ff;

--success: #16d99a;

--warning: #ff920d;

--danger: #ff4455;

--purple: #8b5cf6;

--text-primary: #f8fafc;

--text-secondary: #a8b3c7;

--text-muted: #65758b;

--surface-1: #0b1728;

--surface-2: #0e1c30;
```

Do not randomize colors.

---

# 73. BORDER SYSTEM

Recommended:

```css
--border-soft:
  rgba(148,163,184,0.10);

--border-active:
  rgba(37,133,255,0.55);
```

Avoid bright white borders.

---

# 74. RADIUS

Checklist radius system:

```text
Main table panel
14–16px

Summary card
14px

Input
10–12px

Button
10–12px

Dropdown
10px

Badge
999px

Icon container
10–12px
```

Keep consistent.

---

# 75. SPACING

Preferred system:

```text
4
8
12
16
20
24
32
```

Typical:

```text
Page padding
24–28px

Card gap
16px

Summary card padding
18–20px

Toolbar gap
12–16px

Table row horizontal padding
18–20px
```

Do not use arbitrary spacing everywhere.

---

# 76. TYPOGRAPHY

Preferred:

```text
Inter
Geist
Manrope
```

Or use the existing project font if equivalent.

Hierarchy:

```text
Page title
28–32px / 700

Subtitle
13–14px

Summary count
26–30px / 700

Summary label
11–12px / 600

Table header
12–13px / 600

Task name
13–14px / 500–600

Body
13–14px

Badge
11–12px
```

---

# 77. HOVER

Keep hover subtle.

Summary cards:

```text
slightly brighter border
```

Table rows:

```text
slightly brighter surface
```

Buttons:

```text
subtle brightness
```

Icons:

```text
semantic hover color
```

No aggressive scale effects.

---

# 78. ANIMATION

Use approximately:

```text
150–220ms ease-out
```

Suitable for:

* button hover
* dropdown
* table row hover
* modal
* pagination
* sidebar

Do not add continuous animations.

---

# 79. ACCESSIBILITY

Ensure:

* readable contrast
* keyboard focus states
* button labels
* usable checkbox target
* status conveyed with text, not color alone

Example:

```text
red + Quá hạn
```

not red-only.

---

# 80. DO NOT DUPLICATE FILTERS

If current Checklist already has working filter controls:

reuse or restyle them.

Do not create a new second filtering system alongside the old one.

---

# 81. DO NOT HARD-CODE COUNTS

Summary cards:

```text
10
4
3
2
1
```

in the mockup are reference values.

They must come from application data.

The totals must always remain consistent with task data.

---

# 82. STATUS COUNT CONSISTENCY

Ensure:

```text
All tasks
```

matches the overall dataset.

And:

```text
Not Started
In Progress
Completed
Overdue
```

must derive from the same business rules used elsewhere.

Do not calculate them differently only for UI.

---

# 83. TABLE DATA CONSISTENCY

The same task should display consistent:

* category
* assignee
* deadline
* priority
* status

throughout the application.

Do not modify raw values purely for visual appearance.

---

# 84. DO NOT ADD DECORATIVE CLUTTER

Do NOT add:

* chart
* random progress graph
* calendar widget
* productivity score
* random statistics
* task heatmap
* extra cards

unless the application already requires them.

This Checklist is primarily:

> manage tasks efficiently.

---

# 85. DO NOT OVER-GLOW

Glow is allowed on:

* Checklist active sidebar
* selected summary card
* primary Add Task button
* focused controls

Do not glow:

* all table rows
* all badges
* all summary cards
* every icon

---

# 86. COMPONENT REUSE

Before creating new components, inspect current components.

Prefer reusable Checklist components such as:

```text
ChecklistStatsCard

ChecklistToolbar

TaskTable

TaskRow

CategoryBadge

PriorityBadge

TaskStatusBadge

AssigneeCell

DeadlineCell

Pagination

TaskFormModal
```

Do not create five separate stat card implementations.

---

# 87. DESIGN TOKENS

Do not hardcode duplicated values across every component.

Reuse the project's token system where possible.

If necessary, create Checklist-specific semantic mappings using shared base colors.

---

# 88. ICON LIBRARY

Use the existing project icon library.

Do not install another dependency unless truly necessary.

All Checklist icons must match the Sidebar and Dashboard icon language.

---

# 89. EXISTING UI LIBRARY

If the project uses:

* Ant Design
* MUI
* shadcn
* Tailwind components
* Prime
* another component system

keep the functionality.

Theme the existing components to match Nướng Chill.

Do not unnecessarily rebuild mature dropdowns, checkboxes or modals.

---

# 90. IMPLEMENTATION WORKFLOW

When upgrading Checklist:

## STEP 1 — READ

Read:

```text
claude/skill/checklist_skill.md
```

Read:

```text
claude/upgrade_UI/checklist.png
```

Then inspect the old Checklist source.

---

## STEP 2 — ANALYZE

Identify:

```text
task source
task CRUD
statuses
priorities
categories
assignees
deadlines
search
filters
pagination
```

---

## STEP 3 — PRESERVE

Preserve all working behavior.

---

## STEP 4 — RESTRUCTURE

Upgrade:

* page hierarchy
* summary cards
* toolbar
* table
* pagination
* responsive structure

---

## STEP 5 — RESTYLE

Apply the approved visual system.

---

## STEP 6 — VERIFY

Test functionality.

---

## STEP 7 — VISUAL COMPARE

Compare implementation directly to:

```text
claude/upgrade_UI/checklist.png
```

Continue adjusting until visually coherent.

---

# 91. DO NOT STOP AT ANALYSIS

After analyzing the project:

IMPLEMENT THE CODE.

Do not only reply:

```text
I recommend...
I can...
The page should...
```

The expected task is actual implementation.

---

# 92. BUILD VALIDATION

After coding:

* run type checking if available
* run lint if appropriate
* run build
* inspect console warnings
* verify imports
* verify routes
* verify styles
* verify task actions

Fix errors introduced by the upgrade.

---

# 93. RESPONSIVE VALIDATION

Check at least:

```text
1920px

1440px

1280px

1024px

768px

430px

375px
```

Ensure there is no unintended page-level horizontal scrolling.

---

# 94. FUNCTIONAL CHECKLIST

Before finishing:

* [ ] Add task works
* [ ] Edit task works
* [ ] Delete task works
* [ ] Search works
* [ ] Category filter works
* [ ] Priority filter works
* [ ] Advanced filters still work
* [ ] Status editing works if supported
* [ ] Priority editing works if supported
* [ ] Pagination works
* [ ] Page-size selector works
* [ ] Checkbox selection works
* [ ] Task counts are correct
* [ ] API calls remain correct
* [ ] Routes remain correct

---

# 95. VISUAL CHECKLIST

Before finishing:

* [ ] Nướng Chill logo is used
* [ ] Checklist is active in Sidebar
* [ ] Sidebar icons match final Dashboard style
* [ ] Navbar matches Nướng Chill style
* [ ] Page title matches reference
* [ ] Add Task button matches reference
* [ ] Five summary cards exist
* [ ] Semantic colors are correct
* [ ] Selected summary card is visually clear
* [ ] Search + filters align well
* [ ] Table uses dark premium surface
* [ ] Table header is muted
* [ ] Rows are compact
* [ ] Category badges are correct
* [ ] Assignee cell is readable
* [ ] Deadline uses calendar icon
* [ ] Priority badges are semantic
* [ ] Status badges are semantic
* [ ] Edit/Delete icons are subtle
* [ ] Pagination matches reference
* [ ] Empty state is handled
* [ ] Responsive behavior is usable
* [ ] No overflow
* [ ] No excessive glow

---

# 96. EXACT APPROVED CHECKLIST DECISIONS

The following visual decisions are considered APPROVED unless the user explicitly changes them:

### Application shell

Use the new Nướng Chill shell.

### Active sidebar

Checklist is active.

### Status overview

Use five summary cards.

### Selected status

`Tất cả` uses blue highlight.

### Primary action

Use `+ Thêm công việc`.

### Filters

Search + Category + Priority + Bộ lọc.

### Main content

Use a structured dark table.

### Category

Use compact category badges.

### Assignee

Avatar + name.

### Deadline

Calendar icon + date.

### Priority

Compact semantic pill.

### Status

Compact semantic pill.

### Row action

Outline Edit + Delete icons.

### Pagination

Footer integrated into table panel.

Do not reinterpret these without instruction.

---

# 97. FORBIDDEN CHECKLIST REDESIGNS

Do NOT change the approved Checklist into:

* Kanban-only layout
* giant task cards on desktop
* calendar-first layout
* chart dashboard
* white table
* brightly colored row backgrounds
* overly rounded mobile-style cards on desktop
* Excel-like heavy grid table
* Material default appearance
* Bootstrap default appearance

The approved design is a premium dark SaaS task table.

---

# 98. FUNCTIONALITY VS DESIGN

If the old Checklist has functionality not shown clearly in the reference image:

DO NOT delete it.

Integrate it into the new design appropriately.

Priority:

```text
1. Existing business functionality
2. Approved Checklist visual design
3. Responsive usability
4. Existing old visual styling
```

Old visual styling has the lowest priority.

---

# 99. FINAL QUALITY TEST

Ask:

> If Checklist is opened immediately after Dashboard, do they clearly look like two screens of the same Nướng Chill product?

They must share:

* brand
* sidebar
* navbar
* dark navy foundation
* border language
* icon style
* blue interactions
* typography
* spacing rhythm

But Checklist must still have its own task-management-oriented layout.

---

# 100. FINAL RULE

This skill is ONLY for the:

> **NƯỚNG CHILL CHECKLIST SCREEN**

Use:

```text
claude/upgrade_UI/checklist.png
```

as the final visual reference.

Use existing source code as the source of truth for behavior.

The final objective is:

> Transform the old Checklist into the approved modern Nướng Chill Checklist while preserving all existing task-management functionality.

Do NOT merely recolor the old screen.

Upgrade:

* app shell
* layout
* hierarchy
* summary statistics
* filters
* table
* badges
* actions
* pagination
* responsive behavior
* visual consistency

until the screen visually matches the approved design and works correctly.
