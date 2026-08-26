# NƯỚNG CHILL — DASHBOARD UPGRADE SKILL

## 1. PURPOSE

This skill applies ONLY to the **Dashboard screen** of the Nướng Chill application.

Do NOT apply Dashboard-specific layout rules from this skill to other screens such as:

* Checklist
* Ngân sách
* Menu & Cost
* Nhà cung cấp
* Ghi chú
* Cài đặt

Those screens will have their own design skills.

Your responsibility here is:

> Read the existing Dashboard implementation, preserve its business logic and data behavior, then upgrade the Dashboard UI to match the APPROVED Nướng Chill Dashboard design.

This is an upgrade of an existing screen.

Do NOT create an unrelated Dashboard from scratch.

---

# 2. APPROVED DASHBOARD IS THE SOURCE OF TRUTH

The approved Dashboard design is final.

Do not redesign its visual direction unless explicitly instructed.

Preserve the approved concepts:

* Dark navy futuristic SaaS style
* Nướng Chill logo
* Modern outline sidebar icons
* 4 KPI cards
* Budget trend chart
* Multi-ring task progress chart
* Task overview bar
* Highlighted Total Tasks panel
* Important Tasks panel
* Budget Warning panel
* Blue neon action styling
* Semantic status colors
* Compact, balanced layout

The task is to reproduce this design language accurately in code.

---

# 3. CONTEXT: UPGRADE FROM OLD DASHBOARD

Before editing code:

1. Read the current Dashboard page.
2. Read all child components used by Dashboard.
3. Identify current API/data sources.
4. Identify state management.
5. Identify chart libraries.
6. Identify existing responsive behavior.
7. Identify navigation behavior.
8. Identify click actions.
9. Identify current reusable components.
10. Identify any logic shared with other screens.

Only after understanding the current Dashboard should you modify the UI.

---

# 4. DO NOT BREAK DASHBOARD LOGIC

Preserve:

* API integrations
* Current Dashboard data
* Navigation
* Existing routing
* Search behavior
* Date behavior
* Theme controls
* Notifications
* User menu
* Task calculations
* Budget calculations
* Chart data
* Detail navigation
* "Xem tất cả" behavior
* "Xem chi tiết" behavior

Do NOT replace dynamic data with static mock values.

Reference numbers shown in design screenshots are visual examples only.

Always use real application data.

---

# 5. DASHBOARD DESIGN STYLE

Official Dashboard style:

> **Modern Futuristic Dark SaaS Dashboard**

Target visual balance:

> 80% professional SaaS
> 20% futuristic neon

The Dashboard must feel:

* premium
* modern
* clean
* compact
* data-focused
* slightly futuristic
* not overly decorative

Avoid cyberpunk/game UI.

---

# 6. PAGE BACKGROUND

Use a deep navy background, not pure black.

Recommended direction:

```css
background:
  radial-gradient(
    circle at 45% -10%,
    rgba(37, 99, 235, 0.05),
    transparent 38%
  ),
  #06101f;
```

Main surfaces:

```css
--surface-main: #0b1728;
--surface-secondary: #0e1c30;
```

Do not use bright background gradients.

---

# 7. DASHBOARD LAYOUT

Desktop Dashboard structure:

```text
┌──────── SIDEBAR ────────┬─────────────────────────────────────────┐
│                         │ HEADER                                  │
│                         │                                         │
│                         │ Dashboard                               │
│                         │ Subtitle                                │
│                         │                                         │
│                         │ KPI 1 | KPI 2 | KPI 3 | KPI 4           │
│                         │                                         │
│                         │ Budget Trend       | Task Progress      │
│                         │                    |                    │
│                         │ Task Overview Bar                       │
│                         │                                         │
│                         │ Important Tasks    | Budget Warning     │
│                         │                                         │
└─────────────────────────┴─────────────────────────────────────────┘
```

The visual hierarchy above must remain.

---

# 8. DASHBOARD CONTENT GRID

Use a responsive 12-column grid.

Recommended:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}
```

Critical:

```css
.dashboard-grid > * {
  min-width: 0;
}
```

Do not use excessive fixed pixel widths.

---

# 9. PAGE CONTENT WIDTH

Keep Dashboard centered on large screens.

```css
.dashboard-content {
  width: 100%;
  max-width: 1600px;
  margin-inline: auto;
  padding: 24px 28px 32px;
}
```

Do not stretch cards indefinitely on ultrawide monitors.

---

# 10. SIDEBAR

Sidebar is part of the approved Dashboard.

Approximate width:

```text
230–250px
```

Background should remain slightly darker than content.

---

# 11. NƯỚNG CHILL LOGO

Use the approved Nướng Chill branding in the sidebar.

Visual:

```text
🔥  Nướng
    Chill

Pre-opening
```

Characteristics:

* Flame logo
* Orange/yellow/red flame
* “Nướng” white
* “Chill” orange
* Small “Pre-opening” orange

Do not revert to the old "QUÁN NƯỚNG" logo.

Do not replace the logo unless explicitly requested.

---

# 12. SIDEBAR ICONS

Use the approved modern outline icon style.

Required navigation concepts:

Dashboard:

* grid/dashboard icon

Checklist:

* clipboard-check

Ngân sách:

* wallet/card

Menu & Cost:

* utensils/fork-spoon

Nhà cung cấp:

* storefront/shop

Ghi chú:

* file/document

Cài đặt:

* settings

Rules:

* same icon family
* same stroke weight
* approximately 20–22px
* no emoji
* no 3D icons
* no mixed icon styles

---

# 13. ACTIVE SIDEBAR ITEM

Dashboard active state:

```text
Blue translucent background
Blue outline
Very subtle blue glow
Blue icon
White text
Arrow at right
```

Example:

```css
.sidebar-item.active {
  background: rgba(37, 133, 255, 0.13);
  border: 1px solid rgba(37, 133, 255, 0.60);
  box-shadow: 0 0 18px rgba(37, 133, 255, 0.10);
}
```

Inactive items should remain clean and muted.

---

# 14. HEADER

Dashboard header contains:

```text
Search
Date
Theme
Notification
Avatar
```

Keep header compact.

Suggested height:

```text
60–68px
```

Search box should not dominate the page.

Recommended desktop width:

```text
250–300px
```

Header controls:

* dark surface
* subtle border
* 10–12px radius
* muted icons
* active hover states

---

# 15. DASHBOARD PAGE TITLE

Use:

```text
Dashboard
Tổng quan tiến độ và tình hình chuẩn bị mở quán
```

Approximate hierarchy:

```text
Dashboard
28–32px
700

Subtitle
13–14px
Muted
```

Do not place the title inside another card.

---

# 16. KPI SECTION

Dashboard contains exactly 4 primary KPI cards.

Order:

1. TIẾN ĐỘ SETUP
2. NGÂN SÁCH DỰ KIẾN
3. ĐÃ CHI TIÊU
4. CÒN LẠI

Desktop:

```text
4 equal columns
```

---

# 17. KPI CARD STRUCTURE

Each KPI card should contain:

```text
ICON      LABEL              MENU

MAIN VALUE

DESCRIPTION

BADGE                     MINI SPARKLINE
```

Example:

```text
◎  TIẾN ĐỘ SETUP

20%

2 / 10 công việc

↑ 5% so với tuần trước        ╱╲╱╲
```

---

# 18. KPI VISUAL RULES

All KPI cards must share the same base dark surface.

Do NOT give every KPI an entirely different colored background.

Color should mainly appear in:

* icon ring
* badge
* sparkline
* subtle local glow

Semantic colors:

```text
Setup        Blue
Budget       Purple
Spent        Orange
Remaining    Green
```

---

# 19. KPI CARD STYLE

Recommended:

```css
.kpi-card {
  background:
    linear-gradient(
      180deg,
      rgba(15, 29, 49, 0.96),
      rgba(9, 21, 38, 0.96)
    );

  border: 1px solid rgba(148, 163, 184, 0.10);
  border-radius: 14px;
  padding: 18px 20px;
}
```

Hover should be subtle.

Do not significantly move or scale the card.

---

# 20. KPI NUMBERS

Main KPI value must visually dominate.

Example:

```text
300.000.000 ₫
```

Use Vietnamese money formatting consistently.

Preferred:

```text
300.000.000 ₫
```

Not:

```text
300.000.000đ
300000000
```

---

# 21. KPI ICONS

Use circular/rounded icon containers with restrained glow.

Do not use oversized icon cards.

Example dimensions:

```text
42–46px
```

Glow should remain localized around the icon.

---

# 22. KPI SPARKLINES

Keep mini chart simple:

* thin smooth line
* no axis
* no labels
* subtle gradient below
* color matches KPI semantic color

Do not let sparkline compete with main KPI value.

---

# 23. MAIN CHART ROW

Below KPI cards:

```text
BUDGET TREND      TASK PROGRESS
```

Recommended desktop ratio:

```text
7 / 5
```

or roughly:

```text
58% / 42%
```

Implementation example:

```css
.main-chart-row {
  display: grid;
  grid-template-columns:
    minmax(0, 7fr)
    minmax(360px, 5fr);
  gap: 16px;
}
```

---

# 24. BUDGET TREND PANEL

Title:

```text
XU HƯỚNG NGÂN SÁCH THEO HẠNG MỤC
```

Top-right selector:

```text
Đơn vị: Triệu đồng
```

Legend:

```text
● Ngân sách
● Đã chi
```

---

# 25. BUDGET TREND CHART

Use the approved style.

Series:

```text
Ngân sách → Blue
Đã chi   → Green
```

Required styling:

* smooth lines
* approximately 2px stroke
* low-opacity horizontal grid
* subtle area gradient
* highlighted point
* dark tooltip
* clean axes

Do not use default library chart appearance.

---

# 26. BUDGET CHART TOOLTIP

Tooltip should resemble a small floating panel.

Example:

```text
Thiết bị

● Ngân sách: 85M
● Đã chi:    70M
```

Use:

* dark background
* thin border
* 8–10px radius
* value bold
* colored dots

No huge tooltip shadows.

---

# 27. TASK PROGRESS PANEL

Title:

```text
TIẾN ĐỘ CÔNG VIỆC
```

This panel uses the APPROVED original concentric radial design.

Do NOT change it to a standard donut or pie chart.

---

# 28. APPROVED TASK PROGRESS CHART

Required format:

**Multiple concentric partial radial rings**

Visual concept:

```text
        Purple outer ring
      Orange middle ring
    Green inner ring

         20%
       Hoàn thành
```

The approved version uses:

* Purple
* Orange
* Green
* dark inactive rings

Center:

```text
20%
Hoàn thành
```

This radial style is final.

Do not replace it unless explicitly requested.

---

# 29. TASK STATUS DATA

Right side of task progress panel:

```text
● Hoàn thành        2       20%
● Đang làm          3       30%
● Chưa làm          4       40%
● Quá hạn           1       10%
```

Semantic colors:

```text
Hoàn thành → Green
Đang làm   → Orange
Chưa làm   → Purple
Quá hạn    → Red
```

Use real application values.

---

# 30. TASK PROGRESS BUTTON

This panel uses:

```text
Xem chi tiết →
```

Style:

```text
dark transparent blue
thin electric-blue border
small blue glow
rounded rectangle
```

Example CSS direction:

```css
.detail-button {
  background: rgba(37, 133, 255, 0.06);
  border: 1px solid rgba(37, 133, 255, 0.7);
  color: #60a5fa;
  border-radius: 10px;
}
```

Hover:

```text
brighter border
slightly brighter background
arrow moves 2–3px right
```

---

# 31. TASK OVERVIEW PANEL

Below the chart row:

```text
TỔNG QUAN CÔNG VIỆC
```

This is a single wide horizontal panel.

Do NOT revert to four independent large cards.

---

# 32. TASK OVERVIEW CONTENT

Layout:

```text
Quá hạn
Đang làm
Hoàn thành
Chưa làm
Tổng công việc
```

Example:

```text
🔴 1          🟠 3          🟢 2          🟣 4          10
Quá hạn       Đang làm      Hoàn thành    Chưa làm      Tổng công việc
```

Use appropriate outline icons, not emoji.

---

# 33. TASK OVERVIEW STATUS ITEMS

Each status item should include:

```text
Circular icon
Large number
Small label
```

Use vertical separators between groups.

Do not create large individual card backgrounds for each status.

The full section should read visually as one unified component.

---

# 34. TASK OVERVIEW SEGMENT BAR

At bottom of the panel use a thin segmented status bar.

Order:

```text
Red
Orange
Green
Purple
```

Each section can reflect its task count proportionally.

Keep height approximately:

```text
3–4px
```

Do not use a thick progress bar.

---

# 35. TOTAL TASK PANEL — IMPORTANT

The final `Tổng công việc` section must NOT look plain.

It should be slightly more visually alive than the other four status sections.

Approved treatment:

```text
10
Tổng công việc
Toàn bộ hạng mục
```

Enhancement:

* soft blue border
* subtle blue corner glow
* dark blue elevated background
* optional small mini radial/ring visual
* large number

This panel should be noticeable but not distracting.

---

# 36. TOTAL TASK PANEL LIMIT

Do not over-design it.

Avoid:

* huge neon effect
* animated circles
* aggressive gradients
* oversized icon

It must remain integrated into the full task overview panel.

---

# 37. BOTTOM ROW

Below Task Overview:

```text
VIỆC QUAN TRỌNG       CẢNH BÁO NGÂN SÁCH
```

Both panels should align vertically.

Their heights should feel balanced.

---

# 38. IMPORTANT TASK PANEL

Title:

```text
VIỆC QUAN TRỌNG
```

Top-right action:

```text
Xem tất cả →
```

NOT:

```text
Xem chi tiết
```

---

# 39. IMPORTANT TASK ROWS

Approved row style:

```text
●  Lắp máy lạnh        22/08/2026       Quá hạn
●  Lắp hệ thống hút khói 22/08/2026     Đang làm
●  Sơn tường           24/08/2026       Đang làm
●  Hoàn thiện nền      20/08/2026       Hoàn thành
```

Do NOT add decorative icons before task names.

The status dot is enough.

---

# 40. IMPORTANT TASK STATUS DOTS

Use:

```text
Red     Quá hạn
Orange  Đang làm
Green   Hoàn thành
Blue    Neutral/other
```

Do not add unnecessary icons for:

* air conditioning
* wall painting
* construction
* etc.

The approved version removed these icons intentionally.

---

# 41. IMPORTANT TASK BADGES

Badges should be compact.

Example:

```css
background: rgba(status-color, 0.12);
color: status-color;
border-radius: 999px;
```

Avoid full saturated backgrounds.

---

# 42. BUDGET WARNING PANEL

Title:

```text
CẢNH BÁO NGÂN SÁCH
```

Top-right action:

```text
Xem tất cả →
```

NOT:

```text
Xem chi tiết
```

---

# 43. BUDGET WARNING ROWS

Use the CLEAN ORIGINAL budget-warning layout.

Do NOT add icons for each budget category.

Example:

```text
Thiết bị bếp                     94.000.000 / 45.000.000 ₫

██████████████████████████████████████           209%
```

---

# 44. BUDGET WARNING STATUS

If budget exceeded:

```text
Red progress
Red percentage badge
```

Example:

```text
209%
```

If normal:

```text
Green progress
Green percentage badge
```

If unused:

```text
Gray progress
0%
```

Do not assign multiple random colors.

---

# 45. BUDGET WARNING PANEL — FINAL LAYOUT

Expected:

```text
Thiết bị bếp                        94M / 45M
█████████████████████████████████       209%

Thi công mặt bằng                  80M / 120M
██████████████████████                  67%

Nguyên vật liệu ban đầu             25M / 60M
████████████                              42%

Bàn ghế & nội thất                   0 / 70M
                                            0%
```

Use actual formatted application data.

---

# 46. PANEL HEADER ACTION BUTTONS

For bottom panels use:

```text
Xem tất cả →
```

Style should be lighter than the main `Xem chi tiết` CTA.

Recommended:

```text
transparent/dark background
thin blue border
blue text
small radius
minimal glow
```

Do not make all buttons equally prominent.

---

# 47. COLORS

Dashboard semantic colors:

```css
--dashboard-blue: #2585ff;
--dashboard-purple: #8b5cf6;
--dashboard-green: #16d99a;
--dashboard-orange: #ff920d;
--dashboard-red: #ff4455;
```

Rules:

Blue:

* active navigation
* action buttons
* interactive states
* budget series

Purple:

* not started
* budget KPI

Green:

* completed
* remaining
* normal budget
* spent chart series when appropriate

Orange:

* in progress
* spent KPI

Red:

* overdue
* budget exceeded
* alerts

---

# 48. TYPOGRAPHY

Suggested font:

```text
Inter
Geist
Manrope
```

Use the existing project font if equivalent.

Dashboard hierarchy:

```text
Page title             28–32px / 700
Panel title            14–16px / 600–700
KPI number             26–32px / 700
Overview number        22–26px / 700
Body                   13–14px
Muted                  12–13px
Badge                  11–12px
```

---

# 49. PANEL STYLE

Panel base:

```css
.dashboard-panel {
  background:
    linear-gradient(
      180deg,
      rgba(14, 28, 48, 0.96),
      rgba(8, 20, 36, 0.96)
    );

  border: 1px solid rgba(148, 163, 184, 0.10);
  border-radius: 14px;
}
```

Avoid excessive glass blur.

---

# 50. GLOW

Glow should only reinforce priority.

Allowed:

* active sidebar
* main detail button
* Total Tasks panel
* chart selected point
* KPI icon

Avoid glow on:

* every panel
* every row
* all text
* every icon

---

# 51. SPACING

Use consistent spacing.

Preferred:

```text
Page gap         16–20px
Panel padding    18–22px
Panel gap        16px
Row gap          8–10px
Icon gap         10–12px
```

Avoid large unused whitespace.

This Dashboard is information-dense by design.

---

# 52. RESPONSIVE — LARGE DESKTOP

At >= 1440px:

```text
4 KPI cards

Budget chart 7/12
Progress    5/12

Task overview full width

Important tasks
Budget warnings
```

Keep the approved composition.

---

# 53. RESPONSIVE — LAPTOP

At approximately 1200–1439px:

* reduce panel padding slightly
* reduce gap slightly
* maintain 4 KPI cards if readable
* prevent KPI amount overflow
* maintain two-column charts where possible

Never let text overlap charts.

---

# 54. RESPONSIVE — TABLET

At 768–1199px:

KPI:

```text
2 × 2
```

Charts:

```text
stack vertically if needed
```

Bottom:

```text
Important Tasks
Budget Warning
```

stack if there is insufficient width.

Task Overview may remain horizontal until it becomes unreadable.

---

# 55. RESPONSIVE — MOBILE

At < 768px:

Sidebar:

```text
drawer / collapsible
```

Dashboard:

```text
1 column
```

KPI:

```text
1 or 2 columns depending on width
```

Charts:

```text
stack
```

Task overview:

may wrap into 2 × 2 + Total Tasks.

Bottom panels:

stack.

No horizontal page overflow.

---

# 56. CRITICAL CSS RULES

Use:

```css
min-width: 0;
```

on flex/grid children.

Charts:

```css
width: 100%;
max-width: 100%;
```

Long text:

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

Do not allow card content to break the Dashboard grid.

---

# 57. CHART CONTAINER

Do not let chart canvas create random height.

Use predictable panel height/min-height.

For desktop, maintain visually balanced chart panels.

Avoid excessive fixed height where unnecessary.

---

# 58. HOVER

Dashboard hover interactions should be restrained.

Cards:

```text
border becomes slightly brighter
```

Rows:

```text
surface becomes slightly brighter
```

Buttons:

```text
blue border brightens
arrow moves right
```

Do not scale entire panels.

---

# 59. ANIMATION

Use:

```text
150–220ms ease-out
```

Suitable for:

* sidebar hover
* row hover
* button hover
* tooltip
* dropdown

Avoid continuous neon animation.

---

# 60. DO NOT ADD NEW DASHBOARD CONTENT WITHOUT NEED

Do not add random widgets such as:

* calendar panel
* weather
* activity feed
* employee card
* revenue chart
* clock
* extra statistics

unless existing Dashboard functionality already requires them.

The approved information architecture is sufficient.

---

# 61. DO NOT REMOVE CONTENT

Do not remove:

* KPI cards
* charts
* task overview
* important tasks
* budget warning

unless explicitly instructed.

---

# 62. DO NOT REINTRODUCE OLD DESIGN

Do NOT revert to:

* giant independent task status cards
* plain total-task card
* normal pie chart
* old logo
* old sidebar icons
* icons in Important Tasks
* icons in Budget Warning rows
* plain text-only "Xem chi tiết"
* bright panel backgrounds

---

# 63. EXACT DASHBOARD DECISIONS ALREADY APPROVED

The following decisions are FINAL unless the user explicitly changes them:

### Progress chart

Use the multi-ring radial chart.

### Important Tasks

NO unnecessary row icons.

### Budget Warning

NO category icons.

Use progress bars like the old clean version.

### Bottom panel actions

Use:

```text
Xem tất cả
```

### Progress panel action

Use:

```text
Xem chi tiết
```

### Total Tasks

Use an enhanced blue-highlighted mini panel.

### Sidebar

Use modern outline icons.

### Branding

Use Nướng Chill logo.

Do not reinterpret these choices.

---

# 64. IMPLEMENTATION WORKFLOW

When upgrading the Dashboard:

## STEP 1 — READ

Read:

* Dashboard page
* child components
* styles
* charts
* API/data hooks
* layout components

## STEP 2 — MAP EXISTING DATA

Determine what existing data maps to:

```text
Setup progress
Total budget
Spent
Remaining

Budget categories
Task completion
Task status
Important tasks
Budget warnings
```

## STEP 3 — PRESERVE LOGIC

Keep all real behavior.

## STEP 4 — RESTRUCTURE LAYOUT

Move components into the approved Dashboard hierarchy.

## STEP 5 — RESTYLE

Apply the approved Nướng Chill Dashboard styling.

## STEP 6 — UPDATE CHARTS

Customize existing chart library rather than changing library unnecessarily.

## STEP 7 — RESPONSIVE

Verify common screen widths.

## STEP 8 — CLEAN UP

Remove obsolete Dashboard-only styles that conflict with the new design.

## STEP 9 — VERIFY

Compare result visually against the approved Dashboard.

---

# 65. FUNCTIONAL VERIFICATION

After implementation confirm:

* KPI values still update correctly
* budget data still updates correctly
* task counts remain correct
* chart data remains correct
* buttons navigate correctly
* search still works
* date control still works
* notifications still work
* user menu still works
* theme control still works
* sidebar navigation still works

---

# 66. VISUAL VERIFICATION

Before finishing check:

* [ ] Nướng Chill logo is correct
* [ ] Sidebar icon style matches approved version
* [ ] Dashboard active state is correct
* [ ] KPI layout uses four cards
* [ ] KPI surfaces are consistent
* [ ] Budget chart uses blue + green
* [ ] Chart tooltip is styled
* [ ] Task Progress uses multi-ring radial chart
* [ ] Task Progress has "Xem chi tiết"
* [ ] Task Overview is one unified horizontal panel
* [ ] Total Tasks panel is visually enhanced
* [ ] Important Tasks contains no unnecessary row icons
* [ ] Important Tasks uses "Xem tất cả"
* [ ] Budget Warning contains no category icons
* [ ] Budget Warning progress design matches approved version
* [ ] Budget Warning uses "Xem tất cả"
* [ ] Layout is balanced
* [ ] No text overflow
* [ ] No chart overflow
* [ ] No horizontal page scroll
* [ ] Responsive behavior is correct

---

# 67. FINAL QUALITY TEST

Ask:

> If the user compares this implementation directly with the approved Dashboard mockup, does it clearly represent the same final design?

If not:

continue refining.

Do not consider the Dashboard complete after only:

* changing colors
* adding border-radius
* adding glow

The upgrade must include:

* layout
* hierarchy
* spacing
* charts
* cards
* icons
* buttons
* responsiveness
* interactions

---

# 68. FINAL RULE

This skill is ONLY for:

> **Nướng Chill Dashboard**

Do not extrapolate Dashboard-specific structures to other pages.

Future screens will have separate design skills.

When editing the Dashboard, treat the approved design as FINAL and implement it faithfully while preserving the existing working functionality.
# 69. APP SHELL — NAVBAR + SIDEBAR

The Dashboard App Shell shown in the approved reference image is part of the FINAL design.

Reference:

```text
claude/upgrade_UI/dashboard.png
```

The following components must be reproduced consistently:

* Left Sidebar
* Nướng Chill brand area
* Sidebar navigation
* Sidebar icons
* Active navigation state
* Sidebar footer/settings area
* Top Navbar / Header
* Search
* Date control
* Header utility icons
* Notification
* User avatar/profile

Do NOT keep the old application shell if it visually conflicts with the approved Dashboard.

The new Dashboard must look like one complete product, not a new content area inserted inside the old navigation UI.

---

# 70. SIDEBAR — FINAL STRUCTURE

Desktop sidebar follows this approximate structure:

```text
┌─────────────────────────┐
│                         │
│   🔥 Nướng Chill        │
│      Pre-opening        │
│                         │
│  ────────────────────   │
│                         │
│   ▦   Dashboard      ›  │
│   ✓   Checklist         │
│   ◫   Ngân sách         │
│   🍴  Menu & Cost       │
│   ▱   Nhà cung cấp      │
│   ▤   Ghi chú           │
│                         │
│                         │
│                         │
│   ⚙   Cài đặt           │
│                         │
└─────────────────────────┘
```

IMPORTANT:

The symbols above only explain structure.

Do NOT use emoji as actual production icons.

Use the project's proper icon library or SVG icons.

---

# 71. SIDEBAR WIDTH

Desktop target:

```text
235px – 250px
```

Recommended:

```css
.sidebar {
  width: 244px;
  flex: 0 0 244px;
}
```

Do not make the sidebar excessively wide.

Do not allow its width to change depending on page content.

---

# 72. SIDEBAR BACKGROUND

Sidebar should be slightly darker than the main Dashboard area.

Recommended visual direction:

```css
background:
  linear-gradient(
    180deg,
    #071321 0%,
    #06101d 100%
  );
```

Optional subtle separation:

```css
border-right:
  1px solid rgba(148, 163, 184, 0.08);
```

Do NOT use a bright blue sidebar.

Do NOT use pure black unless required by the existing theme implementation.

---

# 73. NƯỚNG CHILL BRAND AREA

The old branding:

```text
QUÁN NƯỚNG
Pre-opening
```

must NOT remain on the upgraded Dashboard.

Replace it with the approved:

```text
Nướng Chill
Pre-opening
```

The new Nướng Chill branding visible in:

```text
claude/upgrade_UI/dashboard.png
```

is the source of truth.

---

# 74. NƯỚNG CHILL LOGO ICON

The approved logo uses a modern FIRE / FLAME symbol.

Visual characteristics:

```text
Modern flame shape
Rounded organic geometry
Warm gradient
Orange / amber / red
Dark background
Premium, simple and recognizable
```

Approximate palette:

```css
--logo-yellow: #ffcc45;
--logo-orange: #ff8a1f;
--logo-deep-orange: #ff5c1a;
```

The flame may contain a subtle gradient such as:

```css
linear-gradient(
  145deg,
  #ffd25a,
  #ff8a1f 55%,
  #ff5c1a
);
```

Do NOT use:

* emoji 🔥
* cartoon fire
* clip-art fire
* overly detailed flames
* photorealistic fire
* random restaurant icons

The logo must look like a real SaaS/product brand mark.

---

# 75. LOGO ASSET PRIORITY

Before creating a new logo implementation:

1. Search the project for the approved Nướng Chill logo asset.
2. Search existing SVG/image assets.
3. Reuse the correct approved asset if available.

If the exact asset does not exist:

Create a clean SVG/component matching the reference image.

Do NOT substitute another random flame icon without checking the reference.

The visual reference remains:

```text
claude/upgrade_UI/dashboard.png
```

---

# 76. BRAND WORDMARK

Next to the flame logo display:

```text
Nướng Chill
```

Visual hierarchy:

```text
Nướng
white / near-white

Chill
warm orange
```

Recommended direction:

```css
.brand-main {
  color: #f8fafc;
  font-weight: 700;
}

.brand-accent {
  color: #ff8a1f;
  font-weight: 700;
}
```

Do NOT make the entire wordmark orange.

---

# 77. PRE-OPENING LABEL

Below the main wordmark:

```text
Pre-opening
```

Style:

```text
small
orange / amber
muted compared with brand name
```

Suggested:

```css
font-size: 11px;
font-weight: 500;
color: rgba(255, 146, 13, 0.85);
```

It must remain secondary to `Nướng Chill`.

---

# 78. BRAND AREA DIMENSIONS

The brand area should not consume excessive vertical space.

Recommended approximate layout:

```text
Flame icon: 38–44px

Gap:
10–12px

Wordmark:
18–22px

Pre-opening:
10–12px
```

Brand wrapper:

```css
display: flex;
align-items: center;
```

Do not vertically center the logo inside an oversized 100px+ header block.

---

# 79. SIDEBAR NAVIGATION ICON STYLE

Sidebar uses MODERN OUTLINE icons.

The approved style is:

```text
Clean
Geometric
Thin/medium stroke
Rounded joins
Consistent optical size
Minimal
Professional SaaS
```

Recommended:

```text
Icon size: 19–22px
Stroke width: approximately 1.7–2px
```

Do NOT mix:

* outline icons
* filled icons
* emojis
* duotone icons
* 3D icons

All navigation icons must feel like one icon family.

---

# 80. NAVIGATION ICON MAPPING

Use the following semantic icon direction.

## Dashboard

Prefer:

```text
LayoutDashboard
Grid
Dashboard squares
```

Meaning:

```text
overview / dashboard
```

---

## Checklist

Prefer:

```text
ClipboardCheck
ListChecks
ClipboardList
```

Meaning:

```text
tasks / checklist
```

---

## Ngân sách

Prefer:

```text
Wallet
CreditCard
WalletCards
```

Preferred visual direction:

```text
Wallet
```

Meaning:

```text
budget / finance
```

---

## Menu & Cost

Prefer:

```text
Utensils
ForkKnife
UtensilsCrossed
```

Meaning:

```text
restaurant menu / food cost
```

Do NOT use a generic calculator icon if an utensils icon is available.

---

## Nhà cung cấp

Prefer:

```text
Store
Storefront
BuildingStore
```

Meaning:

```text
supplier / vendor
```

---

## Ghi chú

Prefer:

```text
FileText
NotebookPen
StickyNote
```

Meaning:

```text
notes / documents
```

---

## Cài đặt

Prefer:

```text
Settings
Cog
```

Meaning:

```text
application settings
```

---

# 81. ICON LIBRARY RULE

Inspect the existing project first.

If the project already uses:

```text
Lucide
Heroicons
Tabler
Phosphor
Material Symbols
```

reuse the existing icon library whenever possible.

Do NOT install another icon library only for the Dashboard unless necessary.

Consistency is more important than selecting a specific library.

---

# 82. SIDEBAR ITEM STRUCTURE

Each navigation item should approximately follow:

```text
ICON     LABEL                      CHEVRON
```

Implementation direction:

```css
.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 12px;
}
```

The label area should use:

```css
flex: 1;
min-width: 0;
```

---

# 83. ACTIVE DASHBOARD ITEM

The active Dashboard item is an important visual element from the approved design.

Use:

```text
soft blue background
thin blue border
subtle blue outer glow
blue icon
bright white label
small right chevron
```

Example direction:

```css
.sidebar-nav-item.active {
  background:
    linear-gradient(
      90deg,
      rgba(37, 133, 255, 0.16),
      rgba(37, 133, 255, 0.07)
    );

  border:
    1px solid rgba(37, 133, 255, 0.55);

  box-shadow:
    0 0 18px rgba(37, 133, 255, 0.08);

  color: #f8fafc;
}
```

Radius:

```text
10–12px
```

---

# 84. ACTIVE ICON

Active Dashboard icon:

```text
electric blue
```

Suggested:

```css
color: #4c9cff;
```

A very subtle icon glow is acceptable.

Example:

```css
filter:
  drop-shadow(
    0 0 4px rgba(37, 133, 255, 0.25)
  );
```

Do not make it strongly neon.

---

# 85. ACTIVE ITEM LEFT ACCENT

If consistent with the implementation, an optional thin blue accent can be added inside the active item.

Example:

```text
▌ Dashboard
```

Approximate:

```css
width: 2px;
height: 20px;
border-radius: 999px;
```

However:

Do NOT use both an oversized accent bar and an aggressive border.

Keep the result close to:

```text
claude/upgrade_UI/dashboard.png
```

---

# 86. INACTIVE SIDEBAR ITEM

Inactive navigation:

```css
color: #9aa8bb;
background: transparent;
border: 1px solid transparent;
```

Icon:

```css
color: #8391a6;
```

Do not make inactive items as bright as the active Dashboard item.

---

# 87. SIDEBAR ITEM HOVER

Hover should feel modern but restrained.

Recommended:

```css
.sidebar-nav-item:hover {
  background: rgba(255,255,255,0.035);
  color: #e6edf7;
}
```

Icon may brighten slightly.

No large movement.

No scaling.

No strong glow.

---

# 88. SIDEBAR NAVIGATION SPACING

Avoid huge gaps between menu items.

Recommended:

```text
4–6px vertical gap
```

Section padding:

```text
16–20px horizontally
```

The sidebar should remain compact and efficient.

---

# 89. SETTINGS PLACEMENT

`Cài đặt` should visually sit toward the lower area of the sidebar when the application shell allows it.

Recommended structure:

```css
.sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar-main-navigation {
  flex: 1;
}

.sidebar-footer {
  margin-top: auto;
}
```

This helps separate primary application navigation from system settings.

---

# 90. TOP NAVBAR / HEADER — FINAL STYLE

The top Navbar visible in the approved Dashboard is part of the redesign.

Do NOT keep an old header style if it visually conflicts with the new Dashboard.

Desktop structure approximately:

```text
┌─────────────────────────────────────────────────────────────┐
│             Search             Date    Theme  Bell  Avatar  │
└─────────────────────────────────────────────────────────────┘
```

The exact component order should preserve existing functional behavior.

---

# 91. NAVBAR HEIGHT

Target:

```text
60–68px
```

Recommended:

```css
height: 64px;
```

Avoid an oversized navbar.

---

# 92. NAVBAR BACKGROUND

Use dark navy surface consistent with the Dashboard.

Recommended:

```css
background:
  rgba(7, 18, 32, 0.94);
```

Optional:

```css
border-bottom:
  1px solid rgba(148, 163, 184, 0.08);
```

Do not use a visually heavy bottom border.

---

# 93. STICKY NAVBAR

If the existing application architecture supports it safely, use:

```css
position: sticky;
top: 0;
z-index: 40;
```

The navbar should remain visible while Dashboard content scrolls.

IMPORTANT:

Ensure the chart/content is NOT hidden underneath the navbar.

Do not reproduce the old layout bug where chart content is clipped by the fixed/sticky header.

---

# 94. NAVBAR SEARCH

Search should be modern dark SaaS style.

Structure:

```text
⌕   Tìm kiếm...
```

Recommended desktop width:

```text
250–320px
```

Style:

```css
background:
  rgba(15, 30, 50, 0.75);

border:
  1px solid rgba(148, 163, 184, 0.12);

border-radius:
  10–12px;
```

Placeholder:

```css
color: #65758b;
```

Search icon:

```css
color: #8291a6;
```

Focus:

```css
border-color:
  rgba(37, 133, 255, 0.55);

box-shadow:
  0 0 0 3px
  rgba(37, 133, 255, 0.07);
```

---

# 95. DATE CONTROL

Keep existing date functionality.

Restyle to match the new Dashboard.

Visual:

```text
calendar icon
date
optional chevron
```

Use:

* dark surface
* subtle border
* muted calendar icon
* bright readable date

Do NOT hardcode the date shown in the design image.

Use actual application data.

---

# 96. NAVBAR ICON BUTTONS

Utility controls such as:

```text
Theme
Fullscreen if still supported
Notification
Other existing utilities
```

should use unified icon buttons.

Approximate:

```css
width: 36–40px;
height: 36–40px;
border-radius: 10px;
```

Style:

```css
background:
  rgba(15, 30, 50, 0.65);

border:
  1px solid rgba(148,163,184,0.10);
```

Hover:

```css
background:
  rgba(37,133,255,0.08);

border-color:
  rgba(37,133,255,0.25);
```

---

# 97. NOTIFICATION ICON

Notification uses a clean outline bell icon.

If unread notifications exist:

use a small indicator.

Example:

```text
bell
+
small red/orange dot
```

Do not use a large badge unless the existing product actually displays notification counts.

---

# 98. USER AVATAR / PROFILE

Keep existing profile functionality.

Visual direction:

```text
small circular avatar
optional user name
optional dropdown chevron
```

Avatar recommended:

```text
34–38px
```

If the design only shows avatar:

do not force the full user name into the navbar.

Follow available width.

---

# 99. NAVBAR ALIGNMENT

Desktop navbar controls should align vertically.

Use:

```css
display: flex;
align-items: center;
```

Use consistent gaps:

```text
8–12px
```

Avoid random spacing between controls.

---

# 100. APP SHELL RESPONSIVE RULES

Navbar and Sidebar must also be responsive.

Do NOT only make Dashboard content responsive.

---

# 101. LAPTOP SIDEBAR

At narrower desktop widths:

Sidebar may remain full width if enough room exists.

If necessary, reduce:

```text
244px → approximately 220px
```

but keep labels visible.

Do not shrink icons excessively.

---

# 102. TABLET SIDEBAR

At tablet width, replace fixed sidebar with either:

```text
collapsed navigation
```

or:

```text
drawer
```

depending on the current application architecture.

Preferred behavior:

```text
hamburger / menu button
→ open dark drawer
→ same Nướng Chill branding
→ same navigation icons
```

Do NOT leave a 240px sidebar permanently visible if it makes content unusable.

---

# 103. MOBILE NAVIGATION

At mobile width:

Sidebar becomes an off-canvas drawer.

Navbar approximately:

```text
Menu button
Nướng Chill / compact brand
Right utility controls
```

Search may:

* reduce width
* become search icon
* move below header

depending on existing UX.

Never create horizontal scrolling just to preserve desktop navbar controls.

---

# 104. MOBILE BRANDING

When space is limited:

Allowed compact version:

```text
🔥 Nướng Chill
```

However, use the real flame logo asset/SVG.

Do not substitute emoji.

`Pre-opening` may be hidden at very narrow widths if necessary.

The main brand must remain recognizable.

---

# 105. NAVBAR + SIDEBAR Z-INDEX

Maintain predictable layering.

Example:

```text
Main content     1
Sticky navbar   40
Sidebar         50
Drawer overlay  60
Drawer          70
Dropdown        80+
Modal           existing modal layer
```

Adapt to the current architecture.

Avoid navbar overlapping sidebar incorrectly.

---

# 106. APP SHELL SCROLLING

Preferred desktop behavior:

```text
Sidebar:
stable

Navbar:
sticky

Main content:
vertical page scroll
```

Avoid multiple unexpected nested scrollbars.

Specifically avoid:

```text
sidebar scroll
+
main wrapper scroll
+
body scroll
```

unless the existing architecture intentionally requires it.

---

# 107. APP SHELL DIVIDER

Do not create visually strong separators.

Sidebar/content separation and Navbar/content separation should use:

```text
subtle border
surface contrast
spacing
```

not thick lines.

---

# 108. BRAND COLOR VS UI PRIMARY COLOR

IMPORTANT DESIGN RULE:

The Nướng Chill brand logo uses:

```text
Orange / warm colors
```

The application interaction system uses:

```text
Electric Blue
```

Therefore:

Orange is NOT the global primary UI color.

Correct usage:

```text
Logo          → Orange

Sidebar active
Buttons
Links
Focus
Navigation   → Blue
```

This contrast is intentional and is part of the approved Dashboard design.

---

# 109. DO NOT OVERUSE THE FLAME

The Nướng Chill flame belongs mainly to:

* brand logo
* app identity
* optional loading/brand experience

Do NOT place flame icons on:

* KPI cards
* every button
* task rows
* budget rows
* chart labels
* all navigation items

This would weaken the brand.

---

# 110. DO NOT CHANGE THE NEW APP SHELL ARBITRARILY

The following are APPROVED decisions:

```text
Nướng Chill flame logo
Nướng Chill wordmark
Pre-opening subtitle

Dark navy Sidebar
Modern outline sidebar icons
Blue active navigation item

Dark compact Navbar
Dark Search control
Date control
Utility icon buttons
Notification
Avatar
```

Do not independently redesign these parts into another style.

---

# 111. APP SHELL VISUAL VERIFICATION

Before declaring Dashboard complete, verify:

* [ ] Old `QUÁN NƯỚNG` branding is removed
* [ ] New Nướng Chill branding is visible
* [ ] Flame logo matches approved visual direction
* [ ] Logo is not an emoji
* [ ] `Nướng` and `Chill` styling matches reference
* [ ] `Pre-opening` remains secondary
* [ ] Sidebar width is balanced
* [ ] Sidebar background matches Dashboard
* [ ] All sidebar icons use one icon family
* [ ] Dashboard icon correctly represents Dashboard
* [ ] Checklist icon correctly represents Checklist
* [ ] Ngân sách icon correctly represents finance
* [ ] Menu & Cost icon uses restaurant/utensils semantics
* [ ] Nhà cung cấp icon uses storefront semantics
* [ ] Ghi chú icon uses document/note semantics
* [ ] Cài đặt uses settings icon
* [ ] Dashboard active item uses blue highlight
* [ ] Inactive menu items remain muted
* [ ] Hover states are subtle
* [ ] Navbar matches the new dark design
* [ ] Search has correct dark styling
* [ ] Date control is restyled
* [ ] Utility icon buttons share one style
* [ ] Notification remains functional
* [ ] User profile remains functional
* [ ] Navbar does not cover Dashboard content
* [ ] Sidebar and Navbar work correctly on tablet/mobile
* [ ] No unexpected nested scrolling
* [ ] No horizontal overflow

---

# 112. REFERENCE PRIORITY FOR APP SHELL

When implementing Navbar, Sidebar, logo or navigation icons, use this priority:

```text
1. claude/upgrade_UI/dashboard.png
2. Existing functional behavior
3. Rules inside dashboard_skill.md
4. Existing old visual style
```

Meaning:

The old Navbar/Sidebar functionality should be preserved.

The old Navbar/Sidebar appearance should NOT override the approved new design.

---

# 113. FINAL APP SHELL RULE

Do not treat Sidebar and Navbar as unrelated legacy components.

They are part of the Dashboard redesign.

The completed Dashboard must look like:

> one newly designed application shell containing one newly upgraded Dashboard.

NOT:

> a new Dashboard placed inside the old application navigation.

The final result must visually match the approved Nướng Chill Dashboard reference as one coherent product.
