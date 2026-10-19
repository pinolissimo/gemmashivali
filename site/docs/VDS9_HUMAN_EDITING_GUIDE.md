# Human Editing Guide — Gemma Shivali

**Visual Design Studio — 2026-10**

This document is the manual inspection entry point. Keep it updated as the project grows.

## How to read VDS code

Every editable source file begins with:

`Visual Design Studio — VDS Engine 9`
`Created: YYYY-MM`
`Purpose: ...`

Every named executable unit has a JSDoc block containing `Purpose:`. Read that before changing implementation details.

## Recommended project edit surfaces

- `src/pages/` — page composition and page-level content contracts.
- `src/components/` — reusable visual/interactive components.
- `src/styles/` — human-owned design tokens and layout/presentation source.
- `src/content/` — structured editorial content/evidence where the project uses separated content data.
- `src/config/` — project-level Search/GEO/performance configuration.
- `public/` — original static assets only; generated derivatives should be rebuilt.
- `docs/` — architectural decisions, operating procedures and this manual edit map.

The project may use a subset of these directories. When the agent creates a different permanent edit surface, it must document it here.

## Gemma Shivali project edit map

- `src/build.mjs` — the only page renderer and VDS9 compiler entry point. It reads the JSON content, renders the six precompiled semantic pages, binds Search/GEO manifests and writes the release.
- `src/content/site.json` — home, services, FAQ, contact, hero film frames and all editorial copy.
- `src/content/legal.json` — the four legal pages, preserved as structured HTML sections.
- `src/content/images.json` — intrinsic dimensions and byte sizes for every local raster image used by the renderer.
- `src/styles/site.css` — human-owned tokens, layout, responsive rules and the CSS-only cinematic hero animation.
- `public/images/` — optimized local photography, official WhatsApp glyphs, favicons and social image.
- `public/fonts/` — self-hosted Open Sans and Cormorant Garamond files.
- `dist/` — generated VDS9 release. Never edit it as a source of truth; rebuild with `node src/build.mjs` from `site/`.
- Engine dependency: `../../engine/VDS-ENGINE-9` (cloned separately; not part of this repository).
- Rebuild command: `node src/build.mjs` from the `site/` directory.
- Human-code validation: `node engine/VDS-ENGINE-9/scripts/check-project-code.mjs site` from the workspace root.
- Local preview: `python -m http.server 8123 --directory site/dist` from the workspace root.

The hero film is intentionally CSS-only: no runtime JavaScript, no third-party player, no remote media. The first and last frames are the original site hero; the intermediate frames are locally stored editorial photography. Keep the frame order, the 45-second cycle and the reduced-motion fallback when editing.

## Do not edit directly

- build/output directories;
- immutable release stores;
- durable evidence records;
- generated sitemap/robots/knowledge artifacts;
- attestation receipts or audit evidence.

Change their source contract/configuration and rebuild instead.

## Manual-change checklist

1. Read the file banner and function purpose.
2. Identify the owning VDS contract before changing behavior.
3. Preserve Search identity and semantic HTML.
4. Keep progressive enhancement optional for primary content.
5. Run project tests and the human-code validator.
6. Update this guide if the place a human should edit has changed.
