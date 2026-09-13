---
name: WatchTracker
description: Warm beige and walnut watch ranking with light and dark modes.
colors:
  accent: "#795638"
  background: "#f4efe7"
  surface: "#fffaf3"
  surface-priority: "#e8dccb"
  text: "#392d25"
  muted: "#72604f"
  line: "#d5c5b3"
  card-border: "#d5c5b3"
  priority-border: "#795638"
  photo-background: "#eee5d8"
  photo-label: "#72604f"
  count-background: "#e8dccb"
  priority-background: "#e8dccb"
  priority-text: "#523923"
  tag-text: "#392d25"
  tag-border: "#d5c5b3"
  control-hover: "#e8dccb"
  control-hover-text: "#392d25"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "52px"
    fontWeight: 500
    lineHeight: 1.17
    letterSpacing: "-1.8px"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    letterSpacing: "-0.5px"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.4px"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  price:
    fontFamily: "Manrope, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    letterSpacing: "-0.6px"
rounded:
  tag: "4px"
  control: "5px"
  count: "6px"
  photo: "8px"
  card: "12px"
spacing:
  compact: "12px"
  content: "16px"
  card: "22px"
  gutter: "48px"
components:
  watch-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "22px"
  watch-card-priority:
    backgroundColor: "{colors.surface-priority}"
    rounded: "{rounded.card}"
  move-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    height: "36px"
  move-button-hover:
    backgroundColor: "{colors.control-hover}"
    textColor: "{colors.control-hover-text}"
  style-tag:
    textColor: "{colors.tag-text}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
  priority-badge:
    backgroundColor: "{colors.priority-background}"
    textColor: "{colors.priority-text}"
    rounded: "{rounded.tag}"
    padding: "3px 7px"
  photo-placeholder:
    backgroundColor: "{colors.photo-background}"
    textColor: "{colors.photo-label}"
    rounded: "{rounded.photo}"
    width: "130px"
    height: "142px"
---

# Design System: WatchTracker

## Overview

**Creative North Star: "The Personal Watch Ranking"**

A compact editorial introduction leads into a practical, vertically ordered collection. Dark green neutrals and a muted sage accent make the first choice legible without overwhelming watch names, specifications, or prices.

The visual system is restrained and operational: clear position numbers, quiet metadata, and explicit reorder controls. This document refreshes the original design brief from the shipped implementation in src/index.css and src/App.tsx.

**Key Characteristics:**

- Dark tonal surfaces with fine borders.
- Manrope titles and prices paired with DM Sans body copy.
- A persistent vertical ranking with a distinct first item.
- Explicit placeholders and visible keyboard focus.

## Colors

Sage provides emphasis against green charcoal surfaces. The frontmatter preserves the implemented palette.

### Primary

The accent identifies highlighted headline text, brand labels, counts, focus outlines, and the first rank. Priority badges have their own subdued green fill and pale text.

### Neutral

Background frames the page; surface contains each watch; surface-priority highlights the leading watch. Text carries names and prices, while muted carries specifications and supporting copy. Fine line and card-border colors separate content. Photo-background reserves space for future imagery.

## Typography

Manrope, with a sans-serif fallback, supplies titles, position numbers, the wordmark, and prices. DM Sans, also with a sans-serif fallback, supplies body text and metadata. Fonts are served locally.

Display identifies the introduction; headline identifies the ranking; title identifies each watch. Specifications use (12px), line height (1.65), and a maximum width of (53ch). Prices and rank numbers use tabular numerals. Below the mobile breakpoint, display becomes (39px), ranking headline (18px), watch title (14px), and price (20px). Small metadata ranges from (9px) to (12px).

## Layout

The centered page has a maximum width of (1240px) with desktop side padding from the gutter token. Desktop rows use five columns: position (36px), image (130px), flexible details, price (188px), and controls (30px), separated by (23px).

Between (768px) and (1050px), page padding becomes (28px), row padding (18px), and image width (100px). At (767px) and below, page padding becomes (20px), header height becomes (76px), and secondary introductory copy disappears. Rows use position (24px), image (82px), and flexible details. Price moves below the image and details; move controls sit at the lower right. Mobile rows use (16px 12px) padding and (14px) list gaps. The footer stacks vertically.

## Elevation & Depth

Resting surfaces are flat, separated by tone and fine borders. The first row gains a lighter surface and stronger border. Dragging alone adds a shadow (0 14px 35px #0008), raises stacking to (10), and reduces opacity to (0.85). There is no decorative resting shadow.

## Shapes

Cards have softly rounded corners; inset photo areas are slightly tighter; tags and controls are compact rounded rectangles. Keep the frontmatter radius hierarchy. Borders remain thin (1px), including the mobile price divider. Photographs use containment so the complete watch remains visible.

## Components

### Ranking row

A row combines its two-digit position, dedicated drag handle, photo area, descriptive details, estimated price, and up/down controls. Only the first item has the next-purchase badge. Reordering updates that treatment with the position. Pointer dragging starts after (8px); keyboard sorting and explicit move buttons support the same task. Order is local to the browser; the status changes and an alert appears if saving fails.

### Controls and links

Move controls have transparent resting backgrounds and tonal hover feedback. Endpoint controls are disabled with opacity (0.25). Dragging uses grab/grabbing cursors and suppresses touch scrolling only on the handle. Buttons and links have a sage focus outline (2px), offset (5px). Mobile move controls are (32px) wide and (44px) high. Reduced-motion preferences disable transitions and animations. Valid store links underline on hover; missing links remain plain text.

### Tags and placeholders

Style tags are outlined metadata; the next-purchase badge is filled. The photo placeholder pairs a light image outline icon with “Foto em breve”. Broken images fall back to the same placeholder. The current eight-watch catalog is maintained in code; photos and store URLs are explicitly deferred, and there is no add/edit form. Price labels always distinguish an estimate or range.

## Do's and Don'ts

- **Do** preserve the vertical ranking and first-position emphasis.
- **Do** keep prices labeled as estimates and pending assets explicitly described.
- **Do** retain keyboard sorting, move controls, visible focus, and reduced-motion support.
- **Don't** substitute an unrelated watch photograph for a missing asset.
- **Don't** style missing store links as active buttons.
- **Don't** add resting shadows or ornamental surfaces that compete with the ranking.

Review evidence: .impeccable/review/desktop.png and .impeccable/review/mobile.png. Recorded review disposition: ship; no findings. Production build and interaction checks passed, including keyboard and pointer reordering with persistence.


## Theme and expansion update

Light mode is the default: warm paper, beige surfaces, walnut actions. Dark mode uses brown surfaces and warm cream text; the header toggle persists locally. Only one watch expands at a time. Expanded covers are hidden, with a single gallery above the specifications. Gallery stage: 480px desktop and 320px mobile, maximum width 640px. Panel opening uses 420ms and closing 300ms, respecting reduced motion.

## Focused watch dialog
Watch details now open in a modal instead of expanding the list. Width is capped at 880px; the header remains visible above an internally scrolling body. Entrance uses 650ms opacity and scale, exit 500ms, with reduced-motion support. Gallery dimensions and warm themes remain unchanged.

