---
name: WatchTracker
description: Haute Horlogerie luxury white atelier and midnight obsidian watch ranking.
colors:
  accent: "#947132"
  background: "#f8f9fa"
  surface: "#ffffff"
  surface-priority: "#ffffff"
  text: "#090a0c"
  muted: "#525866"
  line: "#e2e5e9"
  card-border: "#e2e5e9"
  priority-border: "#947132"
  photo-background: "#f1f3f5"
  photo-label: "#525866"
  count-background: "#f3f4f6"
  priority-background: "#f3f4f6"
  priority-text: "#090a0c"
  tag-text: "#090a0c"
  tag-border: "#e2e5e9"
  control-hover: "#f3f4f6"
  control-hover-text: "#090a0c"
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
  control: "6px"
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

# Design System: WatchTracker (Haute Horlogerie Edition)

## Overview

**Creative North Star: "Haute Horlogerie & The Curated Watch Collection"**

An editorial atelier aesthetic inspired by the premier luxury watchmaking houses of Geneva and Glashütte. Clean, luminous gallery-white canvases, surgical-steel micro-borders, deep obsidian typography, and understated Geneva Gold / Champagne accents deliver an unmistakable aura of luxury, precision, and prestige.

The visual system is disciplined, architectural, and operational: razor-sharp 1px borders, high-contrast typography, and floating watch silhouettes with transparent backdrops.

**Key Characteristics:**

- Pure, luminescent white surfaces (`#ffffff`) on a calm gallery canvas (`#f8f9fa`) in Light mode; deep obsidian (`#090a0c`) and anthracite in Dark mode.
- Subtle Swiss Geneva Gold (`#947132` light / `#d4af37` dark) accents for the hallmark watch icon, ranking badges, and interactive highlights.
- Manrope headings and prices with tabular numerals, paired with clean DM Sans body text.
- Surgical steel hairline borders (`#e2e5e9` / `#22262f`) providing tactile separation without heavy visual noise.
- Transparent watch photography presented in pristine, shadowless gallery stages.

## Colors

### Primary & Accents

Geneva Gold (`#947132` light / `#d4af37` dark) provides horological distinction against crisp white and dark ceramic surfaces. Used on brand names, the next-purchase border, and focus outlines.

### Neutrals

- **Canvas**: `#f8f9fa` (Light) / `#090a0c` (Dark).
- **Surfaces**: Pure `#ffffff` cards with subtle 1px border.
- **Ink**: Deep obsidian `#090a0c` (Light) / platinum `#f4f6f8` (Dark).
- **Muted**: Polished titanium `#525866` (Light) / steel gray `#8f9aa8` (Dark).
- **Line & Borders**: Precision 1px hairline `#e2e5e9` (Light) / `#22262f` (Dark).

## Elevation & Depth

Surfaces rest on crisp planes separated by razor-thin 1px borders and gentle diffusion shadows (`0 1px 3px 0 rgb(0 0 0 / 0.03)`). The leading watch in the ranking features a prestigious gold border and halo (`box-shadow: 0 0 0 1px var(--tone-accent), 0 6px 20px -2px rgb(148 113 50 / 0.12)`).
