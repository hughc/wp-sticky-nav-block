# Sticky Nav Block

## core functionality

Provides a single Gutenberg block that renders a navigational menu / ToC that allows the user to jump to different headings with a smooth scroll effect.

## block parameters

- `scrollToOffset` — scroll-to offset (px above the y co-ord of heading and top of page)
- `tagsList` — comma-separated list of tags to generate TOC from (e.g. `h2, h3`)
- `excludeClass` — a single optional class that, when present on an element, skips inclusion in the ToC
- `menuTag` — choose tag for menu items (`ul` / `ol`)
- `headerText` — customizable header/title text for the block
- `collapsible` — boolean; enables expand/collapse toggle on mobile

### rendering

- PHP-rendered from `post_content` (server-side render via `register_block_type` with `render_callback`)
- JS handles scrollspy, smooth scroll, and collapsible toggle on the front end

### html

- if tags list has > 1 item, generate nested lists (purely tag-based nesting: all h3 follow preceding h2, etc.)
- scope: current post only

### css

- desktop (≥768px): `position: sticky; top: 0` — pins to viewport edge on scroll, no sidebar needed
- mobile (<768px): inline, acts as a regular jump-menu; when `collapsible` is enabled, provides a toggle to expand/collapse the ToC
- core css defined as SCSS, compiled via Vite
- BEMIT helper classes (snb-block, snb-block**header, snb-block**title, snb-block**list, snb-block**item, snb-block\_\_link, etc.)
