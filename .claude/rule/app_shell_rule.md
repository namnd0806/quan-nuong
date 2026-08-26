# NƯỚNG CHILL — GLOBAL APP SHELL RULE

## 1. PURPOSE

This rule defines the FINAL and APPROVED application shell for the Nướng Chill project.

It applies globally to ALL screens and ALL future UI upgrade tasks.

This rule controls:

- Sidebar
- Nướng Chill logo / brand area
- Sidebar navigation
- Sidebar icons
- Active navigation state
- Sidebar footer
- User profile
- Top Header / Navbar
- Header search
- Date control
- Theme control
- Fullscreen control
- Notification control
- Avatar

These elements are already approved.

They must NOT be redesigned independently by screen-specific skills.

---

# 2. GLOBAL VISUAL REFERENCES

The FINAL Sidebar + Logo reference is:

```text
.claude/upgrade_UI/sidebar_logo.png

The FINAL Header reference is:

.claude/upgrade_UI/header.png

These two images are GLOBAL VISUAL SOURCES OF TRUTH.

Every screen must follow them.

Examples:

Dashboard
Checklist
Ngân sách
Menu & Cost
Nhà cung cấp
Ghi chú
Cài đặt

Only the active Sidebar item changes between pages.

The visual structure of the Sidebar and Header does NOT change.

3. SOURCE-OF-TRUTH PRIORITY

For any Sidebar / Header / Logo decision, use this priority:

1. .claude/upgrade_UI/sidebar_logo.png
2. .claude/upgrade_UI/header.png
3. Existing implementation that already matches these references
4. This global app shell rule
5. Screen-specific skills
6. Old legacy UI

IMPORTANT:

A screen-specific skill is NOT allowed to override the final Sidebar/Header design.

If a screen skill contains an older Sidebar or Header description that conflicts with these references:

IGNORE the outdated screen-specific shell description.

Use this global rule instead.

4. DO NOT REDESIGN THE APP SHELL

For future screen-upgrade tasks:

DO NOT independently redesign:

Logo
Sidebar
Sidebar width
Sidebar background
Navigation spacing
Navigation icons
Navigation typography
Active state
Cài đặt placement
User profile

Header
Search
Date
Theme button
Fullscreen button
Notification
Avatar

These elements are considered FINAL.

The task for each individual page is to redesign only:

MAIN CONTENT
PAGE COMPONENTS
PAGE MODALS
PAGE-SPECIFIC RESPONSIVE CONTENT

unless the user explicitly requests a new global shell.

5. SIDEBAR REFERENCE

Always inspect:

.claude/upgrade_UI/sidebar_logo.png

before making any changes related to Sidebar.

Do NOT infer the Sidebar from old screenshots.

Do NOT copy Sidebar styles from an outdated page.

6. FINAL BRANDING

Use the exact approved Nướng Chill brand shown in:

.claude/upgrade_UI/sidebar_logo.png

The brand includes:

Flame logo

Nướng
Chill

small supporting brand text if present in the approved asset

Pre-opening

Do NOT replace it with:

QUÁN NƯỚNG

Do NOT create a different Nướng Chill logo.

Do NOT use an emoji flame.

Do NOT replace the flame with a generic icon.

Do NOT recolor the brand arbitrarily.

Do NOT change the wordmark layout.

7. LOGO ASSET RULE

Before implementing the logo:

Search the project for the approved logo asset/component.
Reuse the existing approved asset if available.
Reuse the existing Sidebar brand component if it already matches the reference.

Do NOT create a duplicate logo component if one correct implementation already exists.

Do NOT redraw the logo differently on each page.

8. BRAND COLORS

The approved brand logo contains warm colors:

Orange
Amber
Yellow

The product UI interaction color remains:

Electric Blue

Therefore:

Logo / brand
→ warm orange family

Navigation / buttons / focus / active
→ blue

Do NOT turn the entire UI orange because the logo is orange.

9. SIDEBAR GENERAL STYLE

The Sidebar must follow the approved dark SaaS appearance.

Visual direction:

Deep navy background
Thin separation from content
Modern outline icons
Clean typography
Compact navigation
Soft blue active state
Very limited glow

Do NOT create:

bright blue Sidebar
purple Sidebar
orange Sidebar
white Sidebar
glass-heavy Sidebar
gaming Sidebar
10. SIDEBAR WIDTH

Match the approved reference.

Desktop target should remain approximately:

240–270px

Use the actual width from the current approved implementation when available.

Do NOT allow individual pages to set different Sidebar widths.

For example, avoid:

Dashboard Sidebar = 240px
Checklist Sidebar = 280px
Supplier Sidebar = 220px

The Sidebar must remain globally stable.

11. SIDEBAR STRUCTURE

Use this navigation order:

Dashboard

Checklist

Ngân sách

Menu & Cost

Nhà cung cấp

Ghi chú

Lower area:

Cài đặt

Bottom:

Avatar
User name
Role
Chevron

Do NOT reorder the main navigation without explicit instruction.

12. SIDEBAR ICONS

Use ONE modern outline icon family.

Icons must match the approved visual reference.

Recommended semantic mappings:

Dashboard
→ LayoutDashboard / Grid

Checklist
→ ClipboardCheck

Ngân sách
→ Wallet

Menu & Cost
→ Utensils

Nhà cung cấp
→ Storefront

Ghi chú
→ FileText

Cài đặt
→ Settings

Rules:

same stroke family
same optical size
same stroke weight
same visual language

Do NOT use:

emoji
3D icons
mixed icon libraries
random filled icons
cartoon icons
13. ICON SIZE

Match the approved Sidebar.

Target:

approximately 20–22px

Do not create individual icon sizes per screen.

14. INACTIVE SIDEBAR ITEMS

Inactive items should remain:

transparent background
muted gray-blue icon
muted light text

They must NOT compete visually with the active navigation.

15. SIDEBAR HOVER

Use a restrained hover.

Suggested visual direction:

slightly brighter dark surface
slightly brighter text
slightly brighter icon

No scaling.

No exaggerated animation.

No large glow.

16. ACTIVE SIDEBAR ITEM

Only ONE primary navigation item should be active.

Examples:

Dashboard page
→ Dashboard active

Checklist page
→ Checklist active

Ngân sách page
→ Ngân sách active

Menu & Cost page
→ Menu & Cost active

Nhà cung cấp page
→ Nhà cung cấp active

Ghi chú page
→ Ghi chú active

Approved active visual:

dark blue translucent fill
thin blue border
soft blue glow
white label
bright outline icon

Match:

.claude/upgrade_UI/sidebar_logo.png

Do not invent a new active state.

17. ACTIVE NAVIGATION COLOR

Primary interaction remains:

Electric Blue

Optional blue-purple tint is acceptable only if already visible in the approved reference.

Do NOT use:

orange active navigation
green active navigation
red active navigation
category-dependent navigation colors
18. SIDEBAR FOOTER

Cài đặt must stay visually separated toward the bottom.

User profile remains at the bottom of Sidebar.

Structure should approximately follow:

Cài đặt

----------------

Avatar
name
role
chevron

Do not move the profile into the top Header unless explicitly requested.

19. USER PROFILE

Keep existing functionality.

Approved structure:

Avatar

name

role

chevron

Example:

N
nam
Chủ quán

Use actual user data.

Do NOT hardcode:

nam

if the application already has real profile data.

20. SIDEBAR RESPONSIVE BEHAVIOR

Desktop:

fixed/stable Sidebar
labels visible

Tablet/mobile:

Sidebar may become collapsible / drawer

Do NOT shrink desktop navigation into unreadable icons just to preserve width.

When collapsed or used as a drawer:

reuse the same logo, menu items and icon styles.

21. FINAL HEADER REFERENCE

Always inspect:

.claude/upgrade_UI/header.png

before changing anything related to the Header.

The Header is GLOBAL.

Do NOT copy Header styling from old screenshots.

22. HEADER STRUCTURE

Approved desktop Header approximately contains:

Search

Date

Theme

Fullscreen

Notification

Avatar

Preserve existing working utility functions.

Do not remove controls simply because one page does not use them.

23. HEADER HEIGHT

Match the approved implementation.

Target:

approximately 60–68px

Do NOT give different pages different header heights.

24. HEADER BACKGROUND

Use the approved dark navy header.

Visual:

deep navy
thin bottom separator
clean SaaS styling

Do not create page-specific Header gradients.

25. HEADER POSITION

If the approved application shell currently uses:

sticky

or:

fixed

preserve that behavior.

Do NOT switch between fixed and static per screen.

Ensure:

Header never covers main content.
26. SEARCH CONTROL

The Search control must visually match:

.claude/upgrade_UI/header.png

Approved characteristics:

dark navy surface
thin border
10–12px radius
search icon
muted placeholder
compact height

Do NOT use:

white search field
full-width giant search bar
heavy glassmorphism
strong glow
27. HEADER SEARCH FUNCTIONALITY

Preserve the actual application behavior.

If Header search is global:

keep global behavior.

If it is currently cosmetic or page-bound:

do not silently introduce a new global search architecture.

This rule controls visual design, not new business logic.

28. DATE CONTROL

Keep the date area from the approved Header.

Structure:

Calendar icon
DD/MM/YYYY

Use actual date/application state.

Do NOT hardcode the screenshot date.

29. DATE FORMAT

Preferred visible format:

26/08/2026

or current application standard.

Do not randomly mix date formats between Header and content.

30. THEME CONTROL

Use the approved Theme icon/button.

Match:

.claude/upgrade_UI/header.png

Keep existing functionality.

Do not redesign it as a large toggle unless explicitly requested.

31. FULLSCREEN CONTROL

If Fullscreen exists in the current approved shell:

preserve it.

Use the approved outline icon.

Do not add text such as:

Toàn màn hình

inside the compact Header.

32. NOTIFICATION CONTROL

Use the approved outline Bell control.

Unread indicator may appear as:

small red badge

or:

9+

if actual application data supports counts.

Do NOT hardcode:

9+

from the reference.

33. HEADER AVATAR

Keep the approved compact circular avatar.

Use actual current user data.

Visual direction:

blue-purple gradient / current profile image

Do not make it excessively large.

34. HEADER CONTROL HEIGHTS

Search, date and utility controls should visually align.

Target approximately:

36–44px

depending on the existing approved component.

Do not allow:

Search = 48px
Date = 36px
Theme = 52px

unless the reference explicitly requires it.

35. HEADER SPACING

Use consistent gap:

8–12px

between utility controls.

Avoid arbitrary spacing.

36. HEADER RESPONSIVE RULE

Desktop:

Search + utilities visible

Tablet:

Search may reduce width

Mobile:

Search may collapse or move
utilities may reduce

But maintain:

brand/navigation access
date or essential utility access
user access

Do not create horizontal page overflow.

37. APP SHELL LAYOUT

Expected desktop structure:

┌────────────────┬───────────────────────────────────────┐
│                │ HEADER                                │
│                ├───────────────────────────────────────┤
│    SIDEBAR     │                                       │
│                │ PAGE CONTENT                          │
│                │                                       │
│                │                                       │
└────────────────┴───────────────────────────────────────┘

The app shell must remain consistent across all screens.

38. DO NOT DUPLICATE SHELL COMPONENTS

If the codebase already has:

AppLayout
Sidebar
Header
TopNav
Navbar
MainLayout

reuse the existing shared component.

Do NOT create:

DashboardSidebar
ChecklistSidebar
BudgetSidebar
SupplierSidebar
NotesSidebar

with duplicate markup.

Similarly, do NOT create individual Headers per page.

39. SINGLE SOURCE OF IMPLEMENTATION

Preferred architecture:

AppShell
├── Sidebar
├── Header
└── MainContent

Pages render only inside:

MainContent

Individual screens should NOT own the global Sidebar/Header styling.

40. SCREEN-SPECIFIC SKILLS

Screen skills currently include files such as:

.claude/skill/dashboard_skill.md

.claude/skill/checklist_skill.md

.claude/skill/ngansach_skill.md

.claude/skill/menu_cost_skill.md

.claude/skill/nhacungcap.md

These skills may control:

page content
cards
charts
tables
filters
page-specific modals
page-specific responsive behavior

They may NOT override:

global logo
Sidebar
Header
navigation icons
global profile block
global shell dimensions
41. CONFLICT RESOLUTION

If a screen skill says:

use another logo

IGNORE that instruction.

If a screen skill shows an old Header:

IGNORE the old Header.

If a page reference contains an outdated Sidebar/Header:

USE ONLY the content portion of that page reference.

For Sidebar/Header use:

.claude/upgrade_UI/sidebar_logo.png

.claude/upgrade_UI/header.png

These two always win.

42. OLD REFERENCE SCREENSHOTS

Some older page screenshots may contain:

QUÁN NƯỚNG
old flame logo
old sidebar icons
old navbar
different search width
different notification UI

These parts are LEGACY.

Do NOT reproduce them.

Use the latest global references instead.

43. MODAL BACKGROUND

When page-specific modals open:

the global Sidebar/Header remain visible behind the overlay according to the current layout.

Modal overlay should dim them.

Do NOT reconstruct another fake Sidebar/Header inside modal screenshots/components.

44. Z-INDEX

Use consistent layering.

Conceptual order:

Main content
< Header / Sidebar
< Dropdown
< Modal overlay
< Modal
< Modal dropdown/popover

Adapt to the current codebase.

Avoid Header appearing above a modal incorrectly.

45. SCROLLING

Preferred behavior:

Sidebar stable

Header stable/sticky according to existing implementation

Page content scrolls

Avoid unnecessary:

body scroll
+
layout scroll
+
content scroll

at the same time.

46. PAGE WIDTH

The Sidebar and Header must not cause content width calculations to break.

Use:

min-width: 0;

on relevant flex/grid containers.

Main content should consume remaining width correctly.

47. RESPONSIVE VALIDATION

Every future screen must check App Shell at:

1920 × 1080

1440 × 900

1366 × 768

1280 × 800

1024

768

430

375

The Sidebar/Header should not unexpectedly change style.

48. GLOBAL VISUAL VALIDATION

Before completing ANY future screen, confirm:

Logo
 matches .claude/upgrade_UI/sidebar_logo.png
 correct flame
 correct Nướng Chill wordmark
 correct Pre-opening
 no QUÁN NƯỚNG legacy branding
 no emoji
Sidebar
 correct width
 correct background
 correct navigation order
 correct icon family
 correct spacing
 only current page is active
 correct blue active state
 Cài đặt in correct lower area
 user profile at bottom
Header
 matches .claude/upgrade_UI/header.png
 correct height
 correct background
 Search matches
 Date matches
 Theme matches
 Fullscreen matches if supported
 Notification matches
 Avatar matches
 alignment is consistent

If any of these fail:

THE PAGE IS NOT COMPLETE.

49. IMPLEMENTATION CHECK BEFORE CREATING NEW SHELL CODE

Before writing Sidebar or Header code:

ASK INTERNALLY:

Does this component already exist in the project?

If YES:

reuse it.

If it is visually slightly outdated:

upgrade the shared component ONCE.

Do NOT patch every page individually.

50. DO NOT ALLOW PAGE-SPECIFIC SHELL CSS

Avoid patterns like:

.dashboard .sidebar { ... }

.checklist .sidebar { ... }

.supplier .sidebar { ... }

.menu-cost .sidebar { ... }

unless absolutely required for routing/active state.

Global shell visuals should live in one shared implementation.

51. ACTIVE STATE IS THE MAIN PAGE DIFFERENCE

Between different pages, the Sidebar should change ONLY the active item.

Examples:

Dashboard
→ Dashboard active

Checklist
→ Checklist active

Ngân sách
→ Ngân sách active

Menu & Cost
→ Menu & Cost active

Nhà cung cấp
→ Nhà cung cấp active

Ghi chú
→ Ghi chú active

Everything else must remain visually stable.

52. DO NOT INFER BRAND FROM GENERATED MOCKUPS

Generated design mockups may occasionally render the brand/logo imperfectly.

Do NOT use those generated approximations as the source of truth for Logo, Sidebar or Header.

Always use:

.claude/upgrade_UI/sidebar_logo.png
.claude/upgrade_UI/header.png

This rule exists specifically to prevent visual drift between screens.

53. IMPORTANT — SCREEN IMAGE CROPPING

When a page reference contains the full application screenshot:

split it mentally into:

GLOBAL APP SHELL
+
PAGE CONTENT

For:

GLOBAL APP SHELL

ignore the screenshot shell and use the two approved global references.

For:

PAGE CONTENT

follow the page-specific reference/skill.

54. FINAL EXECUTION RULE FOR EVERY SCREEN

Whenever upgrading a screen, Claude must follow this order:

1. Read this global App Shell rule.

2. Open:
   .claude/upgrade_UI/sidebar_logo.png
   .claude/upgrade_UI/header.png

3. Identify the existing shared Sidebar/Header implementation.

4. Reuse it.

5. Read the page-specific skill.

6. Open the page-specific design reference.

7. Upgrade ONLY the page-specific content and modals.

8. Set the correct active Sidebar route.

9. Verify Sidebar/Header against the global reference.

10. Verify the page content against its page-specific reference.

11. Run responsive checks.

12. Build/typecheck/lint.
55. FINAL RULE

The Nướng Chill app shell is FINAL.

From now on:

Sidebar + Logo + Header are global shared components.

Individual screen design tasks must NOT redesign them.

The only screen-specific difference in Sidebar is:

active navigation item.

Always use:

.claude/upgrade_UI/sidebar_logo.png

for Sidebar/Brand reference.

Always use:

.claude/upgrade_UI/header.png

for Header reference.

If another screenshot or skill conflicts with these:

THIS GLOBAL RULE WINS.


Sau đó trong **đầu mỗi skill màn hình**, bạn chỉ cần thêm đoạn rất ngắn này để Claude bắt buộc đọc rule toàn cục trước:

```md
## GLOBAL APP SHELL — REQUIRED

Before implementing this screen, read:

```text
.claude/rule/app_shell_rule.md

The global Sidebar, Nướng Chill branding and Header are already FINAL.

Do NOT redesign them.

Use:

.claude/upgrade_UI/sidebar_logo.png
.claude/upgrade_UI/header.png

as the global visual source of truth.

This screen-specific skill controls only page content and page-specific modals.

If this skill conflicts with app_shell_rule.md regarding Logo, Sidebar or Header:

app_shell_rule.md ALWAYS WINS.