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

## [v0.5.0] — 2026-03-09

### Type: New Screen — First-Then Board

### Instruction (verbatim)
> The third B1:3 Button will be a first then. So, on this screen, the user can select what happens first. And what will follow. On this screen, it will show a few of the recently pressed AAC buttons. The user should confirm which item from those AAC buttons they think the user is requesting. After that selection is made, the user should decide what happened first before that item becomes available.
> It can be waiting for some period of time. There should be predefined buttons for wait time: 1 minute, 2 minutes, 3 minutes, 5 minutes, 10 minutes, 15 minutes, 20 minutes, 30 minutes, 1 hour. The user should also be able to use visual controls to add waiting time, or instead of waiting, the user can say that first you need to do something different and select what that thing is from the AAC screen. If that thing needs to happen only once or several times, for example, if you press on a see that you want a burger, then you go to the first menu to confirm that the user wants a burger. Before that, we will select salad, for example, from the AAC and say that salad has to be 10 times, so the user understands that they need to make 10 bites of salad before they get their burger.
> When all of the 10 times have happened, we show that you get your burger and celebrate getting the burger each time it is eaten. The user presses on the salad icon and confirms it, and the same thing happens after the timer is up. It should show the item that you get, with a celebration animation, and of course the number of tokens you need to do should be able to be customized. There should be predefined, like 5, 10, or I don't know, two, three, how many, plus the ability to change those through the UI.

### Changes Applied to REQUIREMENTS.md
- Added B1:3 → First-Then Screen to navigation section
- Added full First-Then Screen specification:
  - 3-step setup flow: select THEN item → select FIRST mode → configure
  - Wait mode: 9 predefined durations + ±1 min visual adjuster + circular countdown
  - Task mode: AAC item picker + token count (predefined 1/2/3/5/7/10 + custom +/−) + tappable token progress
  - Celebration overlay with burst particle animation on completion

### Changes Applied to Code
- `src/data/aacButtons.ts` — extracted `DEFAULT_BUTTONS` and `AACButtonEntry` type (shared between AAC grid and First-Then pickers)
- `src/components/aac/AACGrid.tsx` — imports from shared data file
- `src/app/aac/AACScreen.tsx` — saves each button press to `localStorage["aac:recentButtons"]` (max 12, deduplicated)
- `src/components/layout/NavBar.tsx` — added B1:3 First-Then nav button
- `src/app/first-then/page.tsx` — new route
- `src/app/first-then/FirstThenScreen.tsx` — full state-machine screen (8 phases)

---
