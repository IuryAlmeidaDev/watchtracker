# Inline watch details extension

Date: 2026-09-13

This is an ordinary extension of the incumbent WatchTracker interface. The dark green surfaces, sage accent, DM Sans body text, Manrope headings, and priority ranking remain the visual authority. No new visual world or global design direction was established. `DESIGN.md` and `.impeccable/design.json` are preserved.

## Surface behavior

Watch photos, model names, and disclosure controls reveal details inside ranking rows. Catalog photo controls reveal the same details and allow the expanded card to span the grid. The panel pairs a seller-photo gallery with supplied specifications, an estimated price, and the available listing link. Narrow screens stack the gallery above the information.

The gallery provides a selected-image count, previous/next controls and thumbnails when multiple images exist. Empty galleries and failed images have explicit text fallbacks. Closing details or pressing Escape restores focus to the photo trigger. Carousel motion honors the reduced-motion preference. Sorting remains a separate control.

## Evidence and completion

Reviewed the product/design documents, `src/App.tsx`, `WatchDetails.tsx`, `WatchCarousel.tsx`, `WatchExpandablePhoto.tsx`, `WatchPhoto.tsx`, and relevant `src/index.css` rules. Eight seller-photo provenance sidecars are present under `public/watches/`; the sampled Tandorio sidecar records its source URL, item number, variant and download date. Desktop/mobile detail captures exist under `.impeccable/review/`.

The implementation owner reports eight passing browser tests and a passing production build. Reviewer disposition supplied for this documentation handoff: ship, with no material extension fixes. Those checks were not rerun during this documentation-only pass.

## Existing documentation drift

`PRODUCT.md` still describes photos and listings as forthcoming and catalog updates as code-only. The current interface includes seller galleries, listing actions and catalog-management controls. The existing design documents also describe the earlier placeholder-focused surface and do not inventory the expanded details components. These observations are recorded without refreshing product truth, global tokens, or the design sidecar as part of this extension.
