# Requirements Change Log

---

## [v0.1.0] — 2026-03-06

### Type: Initial Requirements

### Instruction (verbatim)
> Augmentative and Alternative Communication (AAC) device
>
> This is a web application software that allows creating a profile for a child using Google account and then invite others using their Google email addresses so that they will be invited to have access to this kid's profile. Once kids log in, they see a default AAC screen with 12 squares horizontally and 8 squares vertically, a grid. Each grid cell is a button. Each button on the grid has an internal name, ie, button B2:12 is on the second row, 12 column. There are different screens. The first row of buttons allows navigating between screens.
>
> The B1:1 button is the shortcut to get back to the AAC screen. AAC screen is in landscape mode.
>
> The B1:2 Button brings up the calendar. The calendar is in landscape mode. On this screen, the first row with navigational buttons remains, but the rest of the screen below switches into the calendar grid, where each row has seven columns. In each row, you can see the days that are going for each month. You can scroll from today or from this week, two weeks before that happened, or scroll to things that will happen later. It should fill the screen at least for this week and the two upcoming weeks, ensuring the cell for each day is large and allows for each day to have four icons for four activities you will be doing that day.

### Changes Applied to REQUIREMENTS.md
- Created initial requirements document covering:
  - User management (Google sign-in, child profiles, caregiver invites)
  - Grid layout (12×8, button naming convention B{row}:{column})
  - Navigation row (Row 1 reserved for screen navigation)
  - B1:1 → AAC Screen shortcut
  - B1:2 → Calendar screen
  - AAC Screen specification (landscape, full grid)
  - Calendar Screen specification (landscape, 7-column week rows, scrollable ±2 weeks, 4 activity icons per day cell)

---

## [v0.2.0] — 2026-03-06

### Type: Implementation

### Instruction (verbatim)
> build a Nextjs application using these Scroll UX components. https://github.com/Adityakishore0/ScrollX-UI

### Changes Applied

**Next.js application scaffolded** with:
- Framework: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Auth: NextAuth.js v5 beta with Google OAuth + Prisma adapter
- Database: Prisma v6 + SQLite (`prisma/dev.db`)
- UI library: ScrollX UI components (copy-as-code) — motion, clsx, tailwind-merge, class-variance-authority, lucide-react

**ScrollX UI components** (`src/components/ui/`):
- `SpotlightCard` — radial hover glow for AAC grid cells
- `ShinyButton` — shimmer button for sign-in and profile creation
- `MorphyButton` — morphing button for calendar activity slots
- `ProfileCard` — animated profile selector card

**Screens built**:
- `/auth/signin` — Google OAuth sign-in page
- `/profiles` — child profile selector
- `/profiles/new` — create child profile with email invite list
- `/aac` — 12×8 AAC grid with sentence bar + Web Speech TTS
- `/calendar` — scrollable weekly calendar with 4 activity slots per day

**API routes**:
- `GET/POST /api/profiles`
- `POST /api/profiles/[id]/invite`
- `GET/POST/DELETE /api/activities`

**Prisma schema**: User, Account, Session, VerificationToken, ChildProfile, ProfileAccess, Activity

---

## [v0.3.0] — 2026-03-06

### Type: UX Change — Calendar Activity Icons

### Instruction (verbatim)
> for calendar it is currently showing four line items for the calendar day. I wanted each day to have square icons. First, I can add one item for a day that will be one big icon, like on the talker. If I add two, then they get smaller so they fit two on the screen. If I add a third one, they fit three and four, and so on, so they get smaller and fuller to fit into one day as icons, not like rows with text.

### Changes Applied to REQUIREMENTS.md
- Calendar day cells now display activity icons as square tiles, not text rows
- Layout adapts dynamically based on number of activities:
  - 0 activities → 1 large "+" add tile
  - 1 activity → 1 large icon tile + 1 "+" add tile (2-column)
  - 2 activities → 2 icon tiles + 1 "+" spanning full width (2×2 grid)
  - 3 activities → 3 icon tiles + 1 "+" (2×2 grid)
  - 4 activities → 2×2 grid of 4 icon tiles, no add button (max reached)
- Each tile shows a centered icon + tiny label; color-coded by position
- "+" add tile uses dashed border, same slot size as activity tiles

### Changes Applied to REQUIREMENTS.md
- Updated Calendar Screen specification: activity cells are square icon tiles, adaptive layout

---

## [v0.4.0] — 2026-03-07

### Type: UX Change — Calendar Infinite Scroll

### Instruction (verbatim)
> in calendar there are earlier and later buttons to navigate. I don't want them, I want infinite scroll so that items are loaded dynamically as i scroll. clicking on the top calendar icon on the menu should bring calendar to the view with the current week in the view

### Changes Applied
- Removed "Earlier" / "Later" navigation buttons from the calendar
- Implemented infinite scroll via `IntersectionObserver` on sentinel elements at top and bottom of scroll container
- Past and future weeks are loaded in chunks of 4 as the user scrolls to the edge
- Scroll position is preserved when prepending past weeks (no jump)
- Calendar auto-scrolls to the current week on mount
- B1:2 (Calendar nav button): if already on `/calendar`, dispatches `calendar:scrollToToday` event to smoothly scroll back to the current week instead of navigating

---
