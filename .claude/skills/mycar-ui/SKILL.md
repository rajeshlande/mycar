---
name: mycar-ui
description: Use when changing myCar React pages, shared components, forms, charts, navigation, responsive layout, themes, copy, or accessibility.
---

# myCar UI workflow

## Design contract

- Product name: **myCar**. Tone: calm, practical, automotive; green/ivory light theme and forest dark theme.
- Reuse `src/components/ui.jsx`, existing forms, `CategoryIcon`, `PageHeading`, and CSS variables in `src/styles.css`.
- Keep desktop sidebar/mobile drawer behavior, visible focus states, accessible labels, and reduced-motion support.
- Use local fonts and embedded/local assets. Do not add CDN dependencies for core UI.
- Vehicle images are generic illustrations; do not imply they are exact photos of a recorded make/model.

## Before editing

1. Read `AGENTS.md` and the target page/component plus its data/action dependencies.
2. Identify loading, empty, error, success, and offline states affected by the change.
3. Keep sample mode visibly labeled and memory-only. Never make sample edits look like cloud saves.
4. Preserve keyboard operation and dialog focus trapping. Do not remove confirmation for destructive actions.

## Implementation

- Make the smallest coherent change using existing patterns.
- Initialize dialog focus synchronously in a layout effect, never with a delayed timer that can steal focus during typing. Restore focus before a replacement dialog mounts. Regression-test both behaviors.
- Keep money/date/distance formatting in `src/lib/logic.mjs`; do not duplicate rounding or currency logic in components.
- Keep forms validated before mutation and show provider errors safely.
- Check both light and dark themes and at least 390 px mobile and desktop widths.
- Do not introduce horizontal page overflow, color-only status, or unlabeled icon buttons.

## Verify

```sh
npm run build
npm run test:browser
```

The browser suite includes mobile overflow and axe-core WCAG A/AA checks. For visual changes, inspect screenshots and console errors. Automated checks do not replace manual keyboard/screen-reader review; report what was actually checked.
