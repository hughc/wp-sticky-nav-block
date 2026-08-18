# Sticky Nav Block

A Gutenberg block that renders a navigational table of contents with smooth scroll, scrollspy, and responsive positioning.

## Block Attributes

| Attribute         | Type    | Default               | Description                                                       |
| ----------------- | ------- | --------------------- | ----------------------------------------------------------------- |
| `tagsList`        | string  | `"h2"`                | Comma-separated heading tags to include (e.g. `"h2,h3,h4"`)       |
| `excludeClass`    | string  | `""`                  | CSS class — headings with this class are skipped                  |
| `menuTag`         | string  | `"ul"`                | Menu list tag: `"ul"` or `"ol"`                                   |
| `headerText`      | string  | `"Table of Contents"` | Heading text shown above the menu                                 |
| `collapsible`     | boolean | `false`               | On mobile (<768px), menu collapses behind a toggle button         |
| `scrollToOffset`  | integer | `0`                   | Extra px subtracted from scroll-to-target position                |
| `topOffset`       | integer | `80`                  | CSS `--snb-top` value — distance from top of viewport when pinned |
| `showAfterScroll` | integer | `0`                   | Block stays hidden until user scrolls this many px, then fades in |

## Behaviour

- **Mobile (<768px):** inline flow, optional collapsible toggle.
- **Tablet/narrow desktop (768–1199px):** fixed right-panel, collapses to a compact icon pill that toggles open/closed. Gets around the issue
- **Desktop (≥1200px):** fixed right-panel, full menu always visible.

## CSS Custom Properties

All values below are defaults set by the plugin. Override any of them in your theme's style to restyle or change behaviour.
s
| Variable | Default | Controls |
| ------------------------ | ------------------------------ | ------------------------------------------------ |
| `--snb-top` | `80px` | Distance from top of viewport when pinned |
| `--snb-right` | `20px` | Distance from right edge when pinned |
| `--snb-width` | `280px` | Panel width when fully expanded |
| `--snb-max-height` | `calc(100vh - var(--snb-top))` | Max panel height (auto-derived) |
| `--snb-z-index` | `999` | Stacking order |
| `--snb-transition-speed` | `0.2s` | Fade transition speed |
| `--snb-bg` | `#fff` | Panel background colour |
| `--snb-border` | `#e0e0e0` | Panel border colour |
| `--snb-active-color` | `#0073aa` | Active link colour & hover accent |
| `--snb-collapse-width` | `1200px` | Viewport width below which collapse pill appears |
| `--snb-collapsed-width` | `44px` | Reference width for collapsed pill |
| `--snb-icon-color` | `currentColor` | SVG icon colour |

## Architecture

### PHP (server-side rendering)

The block is rendered dynamically via `render_callback` — no `save()` function is used. The front-end flow has three stages:

1. **`snb_render_block()`** — outputs the block's wrapper HTML (header, title, toggle buttons, empty `.snb-block__body` placeholder) and stores block attributes in the global `$snb_config`. Also hooks `the_content` at `PHP_INT_MAX` priority so it runs after all other content filters.

2. **`snb_the_content_filter()`** — runs on `the_content`. Uses `$snb_config` to know which headings to look for. Calls `snb_process_content()` to scan the rendered post HTML, then injects the generated menu into the block's `.snb-block__body` placeholder via regex replacement. Clears `$snb_config` after one run so it only fires once per page.

3. **`snb_process_content()`** — walks the full post HTML using `WP_HTML_Tag_Processor`. For every heading matching the configured tags (and not excluded by class), it:

   - Extracts the heading text and level (h2, h3, etc.)
   - Injects an `id` attribute if one doesn't already exist (generated from the heading text via `sanitize_title()`)
   - Returns the modified HTML plus a structured array of headings for menu building

4. **`snb_build_menu()` / `snb_render_heading_items()`** — recursively builds a nested `<ul>`/`<ol>` from the heading array. Nesting is determined by heading level changes (e.g. h2 → h3 opens a nested list, h3 → h2 closes it).

### Frontend JavaScript (`src/frontend.js`)

A single IIFE runs on page load. It finds every `[data-snb]` element and sets up:

- **Smooth scroll** — click handlers on `[data-snb-link]` elements scroll to the target heading, accounting for `scrollToOffset`.

- **`updateActiveLink()`** — scroll listener (passive). Does two things:

  - _Visibility fade_: if `showAfterScroll > 0` and the block is pinned, sets `--snb-visibility` and `pointer-events` to show/hide the block based on scroll position.
  - _Scrollspy_: walks headings to find the deepest heading whose top is above the current scroll position, then marks its link with `snb-block__link--active`.

- **Mobile collapsible toggle** — if the block has `snb-block--collapsible`, a toggle button shows/hides `.snb-block__body` on mobile (<768px) via `aria-expanded`.

- **Collapse icon toggle** — the `.snb-block__collapse-btn` swaps between collapsed/expanded state on tablet/narrow desktop. Reads the current state from the class list (not a JS variable) so it stays in sync with `maybePin()` on load and resize.

- **`maybePin()`** — breakpoint-driven layout engine called on load and resize. Three states:

  - _Mobile_ (`vw < desktopBreakpoint`): removes fixed positioning, restores inline flow.
  - _Narrow desktop_ (`desktopBreakpoint <= vw < collapseBreakpoint`): pins the block fixed, starts collapsed to the icon pill.
  - _Full desktop_ (`vw >= collapseBreakpoint`): pins the block fixed, always expanded.

  Uses a placeholder `<div>` to preserve document flow height when the block is removed from normal flow for fixed positioning.

- **`updateCollapseBtnVisibility(vw)`** — shows or hides the collapse button based on the current viewport width vs the per-block `desktopBreakpoint` and `collapseBreakpoint` values (read from `data-desktop-bp` / `data-collapse-bp` attributes). No CSS media queries are used for this — JS is the single source of truth.

## BEMIT Skeleton

Copy the rules below into your theme's `style.scss` to override plugin styles.
Selectors are listed with zero declarations — add properties as needed.

```scss
/* ===== Sticky Nav Block overrides ===== */

// Root CSS variables (override plugin defaults)
:root {
  --snb-top: 80px;
  --snb-right: 20px;
  --snb-width: 280px;
  --snb-max-height: calc(100vh - var(--snb-top));
  --snb-z-index: 999;
  --snb-transition-speed: 0.2s;
  --snb-bg: #fff;
  --snb-border: #e0e0e0;
  --snb-active-color: #0073aa;
  --snb-collapse-width: 1200px;
  --snb-collapsed-width: 44px;
  --snb-icon-color: currentColor;
}

// Root block — visibility & mobile margin
.snb-block {
}

// Pinned (fixed) state
.snb-block--pinned {
}

// Collapsed pill state (768–1199px)
.snb-block--pinned.snb-block--collapsed {
}
.snb-block--pinned.snb-block--collapsed .snb-block__header {
}

// Collapse toggle button (tablet/narrow desktop)
.snb-block__collapse-btn {
}

// SVG icons inside collapse button
.snb-block__icon {
}
.snb-block__icon--open {
} // hamburger — visible when collapsed (click to expand)
.snb-block__icon--close {
} // X — visible when expanded (click to collapse)

// Collapsed state — hides body, title; swaps icons
.snb-block--collapsed {
}
.snb-block--collapsed .snb-block__body {
}
.snb-block--collapsed .snb-block__title {
}
.snb-block--collapsed .snb-block__icon--open {
}
.snb-block--collapsed .snb-block__icon--close {
}

// Header row (title + buttons)
.snb-block__header {
}

// Title text
.snb-block__title {
}

// Mobile toggle button (<768px)
.snb-block__toggle {
}
.snb-block__toggle-icon {
}

// Menu container
.snb-block__body {
}

// Menu list
.snb-block__list {
}
.snb-block__list--nested {
}

// Individual menu item
.snb-block__item {
}

// Individual menu link
.snb-block__link {
}
.snb-block__link:hover {
}
.snb-block__link--active {
}
```
