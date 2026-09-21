# Arcade Atlas

Arcade Atlas is a static, frontend-first game catalog for games and authorized download resources. Phase 2 adds an owner publishing-console prototype while keeping the public experience unchanged.

## Current architecture

- Dependency-free HTML, CSS, and native ES modules
- Public catalog powered by `data/games.json`
- Shared design system in `css/style.css` and responsive rules in `css/responsive.css`
- `/admin/index.html` is a local UX prototype for editing catalog records
- `docs/backend-model.md` defines the production API and database proposal

The admin prototype loads sample records and stores edits in this browser's `localStorage`. It does **not** authenticate users, write to GitHub, update `data/games.json`, or publish anything to a server.

## Features

- Responsive public catalog, search, categories, details, and authorized-download states
- Admin dashboard with record counts and search
- Add/edit/delete game records in a local draft
- Publish/unpublish workflow prototype; publishing requires an HTTPS download URL
- Required-field, slug, uniqueness, and download URL validation
- Clear error/success states and a prominent security boundary warning
- Original abstract demo artwork; sample records remain marked with `demo: true`

## Run locally

Use a static server because the app fetches JSON modules and data:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` for the public site or `http://localhost:8000/admin/` for the prototype console. There is currently no package manager, build command, or backend server.

## How game records and downloads work

The current demo shape is in `data/games.json`. Add records with unique `id` and URL-safe `slug`, metadata, an owned/licensed cover image, and `demo: true` while using sample content. A blank `downloadUrl` intentionally renders “Download unavailable.” Never invent a URL. A real production implementation must store download records server-side and verify authorization before publication.

## Proposed backend and database

The target architecture is browser → authenticated HTTPS API → authorization layer → database/object storage → authorized download resource. See [`docs/backend-model.md`](docs/backend-model.md) for proposed `users`, `categories`, `games`, and `download_records` models, routes, transitions, and server validation.

The future `/admin` area requires real server-side login, secure sessions, role checks, MFA for owners, CSRF protection where applicable, rate limiting, audit logs, and soft deletion. Do not add fake authentication to the static site.

## Environment variables

`.env.example` documents future backend settings such as `DATABASE_URL`, `SESSION_SECRET`, `API_BASE_URL`, and object-storage configuration. It is a template only. Frontend code must never contain database credentials, session secrets, API keys, or storage secrets.

## Deployment

The current public site can deploy to GitHub Pages, Netlify, Cloudflare Pages, or any static host. Configure HTTPS and replace `example.com` canonical/sitemap placeholders before launch. Do not expose `/admin` as a production publishing tool until it is connected to an authenticated backend. Deploy the API separately with secret values configured in the platform environment, private database access, backups, logging, and monitoring.

## Security considerations

Frontend validation is not security. The browser can be modified by any visitor, localStorage can be edited, and the demo console has no identity or authorization. A backend must validate every request, confirm distribution rights, restrict URL schemes, protect sessions, validate uploads, prevent SSRF, and record administrative changes. Only distribute files the site owner owns or is authorized to distribute.
