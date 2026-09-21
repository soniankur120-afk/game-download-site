# Development guide

## Current architecture

Arcade Atlas remains a dependency-free static site. Public HTML pages use native ES modules and the shared design system. `js/app.js` owns catalog loading, validation, reusable cards, and public shell rendering. `js/search.js` and `js/game-details.js` are page-focused modules. `data/games.json` is demo content, and assets are original abstract SVGs.

The new `/admin/index.html` and `admin/admin.js` form a deliberately isolated publishing-console prototype. It reuses the public design tokens, reads the current catalog, and keeps edits in a namespaced `localStorage` key. This makes the workflows testable without pretending a static site can authenticate or persist securely.

## Admin workflow prototype

1. Open `/admin/` locally.
2. Search existing records or choose **Add a game**.
3. Complete required fields. Slugs are lowercase and unique.
4. Save to the local browser draft.
5. Use Edit, Publish/Unpublish, or Delete from the record list.
6. Publishing is blocked unless an authorized HTTPS download URL is present.

This data is not shared with visitors, does not update `data/games.json`, and can be cleared by removing the `arcade-atlas-admin-draft-v1` localStorage key. It is a UI prototype, not an admin system.

## Design system and component organization

The existing warm paper, ink, lime, and orange visual language is preserved. `admin/admin.css` adds only admin layout primitives and form states. Shared buttons, cards, focus rings, typography, and responsive behavior remain in `css/style.css` and `css/responsive.css`.

Keep data/content in `data/`, public behavior in `js/`, admin behavior in `admin/`, and backend contracts/documentation in `docs/`. Prefer DOM APIs and text nodes for untrusted values.

## Production backend plan

Implement the API described in `docs/backend-model.md` in a separate server application. Recommended sequence:

1. Define and migrate the database schema for admins, categories, games, assets, and download records.
2. Implement secure server-side authentication, sessions, MFA, roles, rate limits, CSRF protection, and audit logging.
3. Add request schemas and server-side validation for every create/edit/publish operation.
4. Add private object storage and controlled download delivery or reviewed external providers.
5. Replace the local JSON adapter with API calls behind a small client module; preserve the current UI.
6. Add automated tests for authorization, validation, publish transitions, URL safety, and accessibility/link checks.
7. Deploy static frontend and API separately with HTTPS, private database networking, backups, and monitoring.

## Environment and deployment

`.env.example` lists backend-only configuration. Real values must be injected by the deployment environment and never committed. The static frontend can run with Python's HTTP server; the future API should have its own local development command and CI pipeline.

## Security boundary

No frontend-only check is authoritative. `localStorage`, HTML, JavaScript, and browser requests are user-controlled. Do not call the prototype production-secure, add secrets to it, or use it to publish copyrighted/unlicensed files. The backend must confirm ownership or distribution permission for every game and download resource before publication.
