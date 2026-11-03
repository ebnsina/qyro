# Qyro

A video player web component (`<qyro-player>`) built on Shaka Player. Source in `src/`, docs site in `site/`.

## Commands

- `pnpm dev`: harness dev server on port 5310; `test/harness/index.html?src=...` loads a stream.
- `pnpm test`: unit tests (vitest), `test/unit`.
- `pnpm test:e2e`: browser tests (playwright, `test/e2e`). Starts the dev server on port 5311.
- `pnpm check`: type check, plus the generated skill must be up to date (`pnpm skill` regenerates it).
- `pnpm build`: package, script build and size report.

## Layout

- `src/player/`: the element, its template (`template.ts`) and all styling (`styles.css`).
- `src/controls/`: behaviour per control (settings, context menu, scrubber, icons, focus).
- `src/engine/`: Shaka wrapper and error mapping. `src/analytics/`: Seyr hooks.
- `test/fixtures/`: sample streams, captions and chapters.

## Conventions

- Tabs for indentation. Format and lint follow the existing files.
- The look is one design, the rail: keys in a column at the right (a row above the bar on phones under 440px), dropdowns share `--_panel-radius`.
- Icons are Hugeicons SVG bodies copied into `src/controls/icons.ts`. Do not add the package back.
- Programmatic focus goes through `focusQuietly` (`src/controls/focus.ts`), so mouse and touch opens show no focus ring.
- Touch targets are at least 44px; the phone keys are 46px.

## Gotchas

- Container queries (`@container`) style children, not the player's own container element. Set custom properties on a child, or use literal values.
- `site/` has its own package and still imports Hugeicons for its demo.
- The demo site (`site/`, port 5180) uses the package's built `dist/` files, not `src/`. After any player change, run `pnpm build` at the root, then reload the demo.
