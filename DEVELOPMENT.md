# Development guide

## Architecture

This is a dependency-free static site. HTML pages provide semantic shells, `css/style.css` contains the design system and shared components, `css/responsive.css` contains breakpoint-specific layout rules, and ES modules in `js/` provide data loading, shared rendering, search, and detail-page behavior. `data/games.json` is the current content source.

## Design system

The visual language uses a warm paper background, near-black ink, acid-lime accent, and orange action color. Typography pairs Manrope for readable UI with DM Mono for metadata and labels. Shared tokens for colors, spacing-adjacent layout values, radius, and shadows live in `:root`. Cards and buttons have restrained motion and honor `prefers-reduced-motion`.

## Data flow

Pages import the module they need. `app.js` renders the shared header/footer, fetches and validates the JSON collection, and exposes the reusable card renderer. `search.js` populates category options and filters in memory. `game-details.js` reads the `slug` query parameter, finds the matching record, and renders details using DOM APIs. A missing or invalid record produces an intentional friendly state.

## Component organization

There is no framework component layer yet. The reusable units are the `gameCard`, shared shell, metadata item, and state renderers. Keep content/data concerns in `data/`, global visual primitives in `style.css`, breakpoint layout in `responsive.css`, and page behavior in focused modules rather than growing a single script.

## Recommended development sequence

1. Add a backend API and database abstraction while preserving the current JSON shape.
2. Add server-side schema validation and an authenticated admin area.
3. Move authorized files and images to controlled object storage.
4. Add publish workflows, audit logs, analytics, moderation, and automated accessibility/link checks.
5. Replace static metadata URLs with the production domain and add CI validation.

Do not implement fake authentication. Until the backend exists, this project should remain a public read-only catalog.
