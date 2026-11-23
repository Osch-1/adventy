---
name: "Окна декабря — local winter house"
description: "Main calendar facade integrated locally; browser visual QA pending."
colors:
  winter-night: "#17323d"
  cream-text: "#f7ead4"
  muted-caption: "#c3d3d5"
  muted-status: "#d3dedb"
  warm-focus: "#e8c78e"
  window-focus: "#eecb87"
  shutter-number: "#f7e5bd"
  help-paper: "#f3e6cb"
  help-ink: "#243b40"
  task-paper: "#f3e7cf"
  task-ink: "#263c3c"
  date-ink: "#803e32"
  task-link: "#8e3429"
  control-surface: "#254853"
  control-border: "#789396"
  close-hover: "#e8d9ba"
  mullion-teal: "#1a414b"
typography:
  display:
    fontFamily: "'December Lora', serif"
    fontSize: "clamp(32px, 5vw, 48px)"
    fontWeight: 400
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'December Lora', serif"
    fontSize: "clamp(27px, 5vw, 36px)"
    fontWeight: 400
    lineHeight: 1.18
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    fontSize: "18px"
    lineHeight: 1.65
  label:
    fontSize: "14px"
  window-number:
    fontFamily: "'December Lora', serif"
    fontSize: "clamp(38px, 12vw, 66px)"
    fontWeight: 700
  glass-number:
    fontFamily: "'December Lora', serif"
    fontSize: "30px"
    fontWeight: 700
rounded:
  control: "6px"
  help: "8px"
  task: "4px"
spacing:
  compact: "12px"
  related: "14px"
  group: "24px"
  inset: "20px"
  wide: "40px"
components:
  task-card:
    backgroundColor: "{colors.task-paper}"
    textColor: "{colors.task-ink}"
    rounded: "{rounded.task}"
    width: "min(680px, calc(100% - 32px))"
  help-panel:
    backgroundColor: "{colors.help-paper}"
    textColor: "{colors.help-ink}"
    rounded: "{rounded.help}"
    padding: "20px"
  day-select:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.cream-text}"
    rounded: "{rounded.control}"
    padding: "10px 32px 10px 12px"
  close-button:
    textColor: "{colors.task-ink}"
    rounded: "{rounded.control}"
    width: "44px"
    height: "44px"
  close-button-hover:
    backgroundColor: "{colors.close-hover}"
---

# Design System: Окна декабря — isolated window

## Current implementation — 6 November 2026

The main `/` calendar now renders the illustrated winter house. `winter-house-base-v1.png` preserves the painted roof, snowy facade, entrance, two glazed halls and two closed story windows; 31 task apertures are overlaid with real `AdventWindow` buttons. Placement uses `src/lib/houseLayout.js` in the 1672×941 coordinate system. The facade variant reuses the original moving shutters and split numbers, different room atlas tiles and wooden sash, while omitting the standalone raster outer frame already painted on the building.

The main header places Adventy at the upper left and «Как участвовать» at the upper right. The help panel opens below the trigger and shares its right edge. The native `CalendarDialog` preserves API text and links, focus return, Escape/backdrop dismissal, and scroll restoration. The main page supports server clock and the existing date schedule; the DEV-only selector simulates both appearance and task access. Production contains the house and task UI but excludes test controls and the isolated preview. Desktop is the current design target; the narrow three-column task fallback is functional, not a finished mobile house illustration. The details below describe the retained isolated window prototype where not superseded by this section.

Fresh checks: 15 frontend tests, 146 API tests, production and DEV builds passed. The rendering test compiles actual JSX through Vite and checks the 31 task buttons and shutter states. Browser access to the local origin is denied by saved permissions; alignment, animation and interaction still need visual QA. There are no new implementation screenshots or visual approval. Generation prompt: `src/Api/ClientApp/src/assets/house/ASSET_NOTES.md`. No commit or deployment was performed.

## Overview

**Creative North Star: "Окна декабря"**

A snowy, illustrated wooden window makes daily discovery tangible: cold teal shutters give way to a warmly lit interior, followed by a quiet cream reading surface. The Russian heading and day number use Lora; interface controls and challenge copy use the existing sans-serif stack.

This is a scan of the first functional component at the DEV-only `/window-preview` route, not a specification of a completed house. `main.jsx` leaves the existing calendar as the production interface. These extracted values are provisional for the full house; re-scan after integration. The direction authority is `PRODUCT.md`, `docs/DESIGN_NOTES_LOCAL.md`, and the latest approved decision composition (`.impeccable/mocks/decision/winter-windows-halls-v4-glazed.png`). No separate quality-bar or seed document was supplied.

**Key Characteristics:**

- Illustrated materials rather than generic oversized cards.
- Cool surroundings, warm revealed interior, calm reading paper.
- Real text, native controls, visible keyboard focus.
- Date-driven window appearance; separately authorized challenge content.

## Colors

The component pairs winter-night teal and pale cream with warm paper and restrained red-brown reading accents. The frontmatter records the exact source colors; raster artwork has its own painted palette, not an extracted CSS scale.

### Primary

- **Warm focus:** visible keyboard outlines and selected text on the preview; the window has its own slightly lighter focus color.
- **Date ink / task link:** dates and actionable links on the cream task surface.

### Neutral

- **Winter night / cream text:** the preview canvas and primary foreground.
- **Muted caption / muted status:** supporting preview text.
- **Help paper / help ink:** instruction popover.
- **Task paper / task ink:** challenge reading surface.
- **Control surface / control border:** native development day selector.

## Typography

Lora is self-hosted as `December Lora` from `src/Api/ClientApp/src/assets/fonts/Lora.ttf`, with the accompanying `OFL.txt`. It carries headings and the live day number. Challenge text uses the inherited system sans-serif stack for readable Russian body copy. The approved challenge content, including its existing emoji, remains content rather than a new icon system.

The frontmatter describes the observed display, title, body, label and number roles. Header labels shrink to (12px) at the component's mobile breakpoint. Challenge text preserves line breaks and wraps long strings; headings balance where supported. No global typography scale for the future house has been established.

## Layout

The isolated preview centers one window in a column with a maximum stage width of (650px). The window is at most (390px) wide, shrinks to its container, and retains its source aspect ratio (1122 / 1402). Its painted opening sits at left (19.5%), top (18.7%), width (61%), height (66.5%). Preserve that registration when changing assets.

The page uses horizontal fluid padding (`clamp(20px, 5vw, 72px)`). At (480px) and below the header tightens, stage margin changes, and task padding becomes (58px 24px 32px), compared with desktop (56px 40px 44px). The task dialog has a viewport-relative height limit and its own vertical scrolling. Its close target is (44px) square.

The day selector, return link, testing caption and status copy belong to this development harness. They do not establish the full calendar's composition. The approved three-column mobile house, 35-window facade, halls and story windows remain future work.

## Elevation & Depth

Depth comes from the original raster outer frame and shutters, 31 distinct residential interiors in `rooms-atlas-v2.png`, a glass reflection and the transparent `wooden-sash-v2.png` overlay. The sash has painted wood grain, worn edges and bevelled moulding; flat CSS mullions are removed. The old hall interior is retained only as a historical source asset. Tomorrow's room uses the same fixed tint (`blur(16px) brightness(.58) saturate(.65)`, scaled to 1.12), without progressive blur. Shutter hinges, movement and split live numbers are unchanged. Room and sash generation prompts are recorded in `src/Api/ClientApp/src/assets/window-demo/ASSET_NOTES.md`.

## Shapes

The illustrated silhouette belongs to the supplied raster frame, not a generic rounded card. Supporting controls have gently curved corners; the help surface is slightly rounder and the reading dialog rounder again. Keep these roles separate from the painted architecture. The component's window outline rounds only its focus boundary.

## Components

### Illustrated window button

One semantic button contains decorative raster layers and live day numbers. The frame and interior are images; the two shutters use a shared texture split into left and right halves. Busy state disables the button and announces `aria-busy`; date-driven open state updates `aria-expanded`, and `aria-description` names its glass state. Hover brightens closed shutters. Keyboard focus uses a prominent outline outside the artwork. Open glass carries the number at top (5%); vertical mullion sits at left (49%), width (2%), and horizontal mullion at top (37%), height (1.4%).

**The Calendar Appearance Rule.** Past and today's windows are clear, tomorrow's is tinted with open shutters, and later windows stay closed, independently of clicks. Challenge content requires separate server authorization.

This latest approved behavior replaces API-controlled opening: at local midnight November 30, December 1 opens tinted; at local midnight December 1, window 1 becomes clear, window 2 opens tinted and 3–31 remain closed. The leaves turn to opposite (112deg) angles over (750ms); reduced motion removes the transition. Clicking requests the task without changing the scheduled appearance; denied future content shows only the placeholder, and errors show a retry explanation. No task-delay timer remains.

The clock comes from the no-store UTC `/api/clock` endpoint backed by injected `TimeProvider`, converted to the browser's time zone. The client advances using monotonic elapsed time, ticks each second, and re-synchronizes every (60 seconds), on focus and on visibility return. Until the initial clock is available the window stays closed.

### Task dialog

A native modal dialog presents the API's title and message on warm paper. Supported Markdown links remain real anchors, including the December 6 instruction link. The dialog supports its close button, Escape and backdrop dismissal. While open it locks document scrolling; dismissal restores scrolling and focus to the triggering window. Long content scrolls inside the constrained dialog.

The 6 November task-card refinement replaces title emoji with a winter letter treatment matching the house: an authored transparent fir/lantern/envelope/key vignette, a fine inset rule, 84px live day numeral (64px narrow), 22px month, and restrained 32px Lora heading (27px narrow). The 680px paper panel uses 48px reading insets (32px narrow), an unobstructed 44px close control and scrollable long content. `taskTitle()` removes decorative leading emoji only from presentation; API content is unchanged. The same `CalendarDialog` now serves the main calendar and `/window-preview`.

Asset and exact built-in imagegen prompt: `src/Api/ClientApp/src/assets/task-card/ASSET_NOTES.md`. Sixteen frontend tests and the production build passed; static Impeccable scan on changed targets returned `[]`. Browser visual inspection remains blocked by saved origin permissions, so this refinement has no screenshot-based visual approval.

### Participation help

The upper-left native disclosure shows its instruction directly below the trigger on pointer hover or visible keyboard focus. Touch uses native tapping. Leaving focus closes it; Escape closes it. The fixed focus issue is evidenced by `.impeccable/review/window-desktop-help-focus.png`.

### Development controls

The native selectors and return link support component verification only. Test dates span November 29, 2026 to January 1, 2027 and control both appearance and content access. Future windows fail closed before fetching. Available simulated tasks use `/api/dev/window-preview/adventure`, whose server validation uses the selected calendar date and is unavailable outside Development. Legacy `first`/`second` bypass parameters are ignored by this preview. Live mode still uses the original task API. Changing day/date aborts pending requests and clears the dialog; synchronized date changes do the same.

The main sample is now 260px wide; the desktop overview shows eight smaller windows per row, with distinct rooms selected deterministically by day from the 8×4 atlas. The final tile is reserved. This overview supports visual comparison at facade scale and does not implement the full house. The user currently prioritizes desktop.

### Validation after the user feedback

13 frontend tests and 146 API tests passed, including the all-days/all-preview-dates access matrix and simulation rejection outside Development. Production and separate DEV builds passed. The production bundle excludes the preview artwork. Browser access to the local origin was denied by the permission gate, so the new composition has not received browser visual QA; previous screenshot approvals do not apply to these new assets.

## Do's and Don'ts

### Do:

- **Do** keep day numbers and challenge copy as live text.
- **Do** preserve raster layer registration and visible keyboard focus.
- **Do** derive glass and shutters from the calendar date while keeping task content server-authorized.
- **Do** honor reduced motion and preserve a readable, scrollable task dialog.

### Don't:

- **Don't** present this isolated preview as the completed winter house.
- **Don't** infer a full-house token system from development harness controls.
- **Don't** restore the rejected generic blue/purple gradient and oversized card aesthetic as this direction's visual identity.
- **Don't** treat discussed people, garlands or accumulating decorations as implemented features.
