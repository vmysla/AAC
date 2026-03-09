# AAC Device — Product Requirements

## Overview

A web application providing an Augmentative and Alternative Communication (AAC) device experience. The app allows caregivers to create a profile for a child, invite others to access that profile, and provides a touch-friendly grid-based communication interface.

---

## User Management

- Users sign in using a **Google account**.
- A caregiver can **create a profile for a child**.
- The caregiver can **invite others** by entering their Google email addresses; invitees gain access to the child's profile.
- Once a child's profile is accessed, the user lands on the default **AAC screen**.

---

## Grid Layout

- The AAC screen is in **landscape mode**.
- The default grid is **12 columns × 8 rows**.
- Each grid cell is a **button**.
- Buttons are identified by their position using the naming convention **B{row}:{column}** (e.g., B2:12 = row 2, column 12).

---

## Navigation

- **Row 1** (B1:1 through B1:12) is reserved for **screen navigation buttons**; this row remains visible on all screens.
- **B1:1** — Shortcut to return to the AAC screen.
- **B1:2** — Opens the **Calendar screen**.

---

## AAC Screen

- Default landing screen after login.
- Displays the full 12×8 grid of communication buttons.
- Landscape orientation.

---

## Calendar Screen

- Accessible via **B1:2**.
- Landscape orientation.
- Row 1 navigation bar remains visible; the area below switches to the **calendar grid**.
- Calendar grid rows have **7 columns** (one per day of the week).
- **Infinite scroll**: weeks load dynamically as the user scrolls up (past) or down (future) — no navigation buttons.
- Opens with the current week in view; tapping B1:2 while already on the calendar scrolls back to today.
- Each day cell displays activity icons as **adaptive square tiles** (talker-style):
  - **1 activity** → 1 large icon fills the cell
  - **2 activities** → 2 equal icons side by side
  - **3 activities** → 2 on top + 1 spanning full width below
  - **4 activities** → 2×2 grid of equal icons
- A "+" add tile occupies the next available slot until the maximum of 4 is reached.
- Each tile shows a centered icon and a small label; color-coded by slot position.

*Last updated: 2026-03-06*

---

## Screen Summary

| Button | Target Screen |
|--------|--------------|
| B1:1   | AAC Screen   |
| B1:2   | Calendar     |

---

*Last updated: 2026-03-06*
