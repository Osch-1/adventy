# Adventy

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Colleagues in an IT department, including office employees in Yoshkar-Ola and remote employees in other time zones. The interface is in Russian and is used on desktop and mobile browsers.

## Product Purpose

A shared December ritual: open one daily challenge, complete it, and share the result in the department's Telegram chat.

## Operating Context

The 2026 calendar contains 31 cards, one for each day from December 1 through December 31. Challenges include photographs, small acts of kindness, creative activities, and team participation. No employee accounts are planned.

## Capabilities and Constraints

- Preserve all 31 user-approved challenge texts and their day assignments in src/Domain/DailyAdventureProvider.cs.
- Preserve API behavior, date validation, preview parameters, and server-controlled access to future challenges. A future card can be clicked but must not reveal its challenge before the server allows it.
- Preserve the instruction link on the word «тут» on December 6.
- Preserve card dismissal, help, responsive scrolling, and document scroll locking while a card is open.
- Existing stack: React 18, Vite 5, JavaScript and CSS; ASP.NET Core on .NET 9.
- This redesign is local only. Do not commit, push, or deploy without a new explicit instruction.
- Existing uncommitted TimeProvider and test improvements are outside the visual redesign and must be preserved.

## Brand Commitments

The user confirmed there is no mandatory corporate visual identity and authorized a complete visual redesign. Keep the friendly Russian voice and exact challenge content. The user rejects the existing generic blue/purple gradient, oversized card aesthetic.

## Evidence on Hand

The real calendar implementation, all 31 approved challenges, API tests, and screenshots from prior browser verification. No supplied logo, brand font, or original illustration assets.

## Product Principles

- Daily discovery and team connection lead the experience.
- A future challenge stays a surprise.
- Visual changes preserve working product behavior and real content.
- Russian typography and mobile readability are first-class requirements.

## Confirmed Redesign Direction

The user selected «Окна декабря», including its mobile adaptation. Desktop uses the illustrated winter townhouse; mobile uses large windows in three columns with vertical scrolling.

- Latest approved behavior replaces click/API-controlled shutters: past and today's task windows are open with clear glass; tomorrow's is open with fixed tinted glass; later windows remain shuttered, independently of clicks. At local midnight November 30, December 1 opens tinted; at local midnight December 1, window 1 becomes clear, window 2 opens tinted and windows 3–31 remain closed. Challenge content still requires existing server authorization.
- There are 35 windows: 31 numbered task windows, two glazed interior halls and two unnumbered shuttered story windows, after task 9 on the left and task 19 on the right at different heights. The halls show an actual room floor, walls and ceiling, with a smaller offset window on the opposite wall; no trees directly behind the front glass and no staircase. No special architecture singles out task 6.
- Remove «Каждый день — повод быть ближе» on desktop and mobile.
- Remove the bottom desktop instruction band.
- Place «Как участвовать» at the upper right, in the former month label position. Align the instructions to the right edge of the trigger. The disclosure opens on hover, keyboard focus, or tap.
- Approved visual references: .impeccable/mocks/decision/winter-windows.png and winter-windows-mobile.png, amended by these explicit changes. Updated mockups precede implementation.

## Current Local Implementation — 6 November 2026

The main `/` route now renders the winter house, with 31 interactive task windows positioned on the painted facade, two glazed halls and two unnumbered closed story windows. All seven dormers use the same architecture. Task windows use date-driven closed, tinted and clear appearances, distinct rooms, textured wooden glazing bars and live day numbers. The original shutter animation and split numbers are retained. Halls and story windows are part of the painted background and have no extra task actions. Story opening/animation has not been implemented. No spoiler content or progressive blur is implemented.

The DEV-only `/window-preview` remains available for isolated window inspection. The main local calendar also has a DEV-only test-date selector; production excludes those controls and uses server time. Desktop is the current visual target. A narrow-screen fallback keeps 31 tasks usable in three columns; full illustrated mobile composition remains a later visual step. The page uses a native task dialog with scroll lock/restoration and focus return; the December 6 instruction link is preserved through the existing API message.

Appearance uses `/api/clock` UTC from injected `TimeProvider` with no-store caching, converted to the browser's time zone. The client advances from the server anchor using monotonic elapsed time, ticks every second, and synchronizes every 60 seconds and on focus/visibility return. The development test-date selector covers November 29, 2026 through January 1, 2027 and controls both appearance and task access through the development-only `/api/dev/window-preview/adventure` endpoint. The preview never forwards legacy `first`/`second` bypass parameters. The real task API retains its existing validation and behavior.

All 31 task windows have distinct residential interiors in a shared painterly style, including sofas, chairs, tables and bookshelves. They use an 8×4 illustrated atlas (the final tile is reserved) and a textured wooden sash overlay instead of flat CSS mullions. The historical hall interior is not used for task windows. Browser visual QA of the newly integrated house remains pending because saved browser permissions deny the local origin. Passing builds and code tests do not establish visual approval. Nothing has been committed or published.

Task cards share the house's winter illustration world: a warm paper letter, prominent live December date, fine frame, and a painted fir/lantern/envelope/key vignette. At the user's request decorative leading emoji are omitted in displayed task titles. Original API titles/messages and the December 6 link are preserved. Both the main calendar and isolated preview use the same dialog component; no task-specific illustration hints at future content.
