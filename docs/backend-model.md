# Backend architecture proposal

This repository currently has no server, database, authentication, or private storage. The public catalog remains static and read-only. The `/admin` page is a UX prototype that can edit a browser-local draft only; it is not an authentication boundary and does not publish data to the public site.

## Proposed production flow

`Browser → HTTPS API → authenticated session → authorization policy → database/object storage → public catalog API`

The public frontend should eventually request published records from `GET /api/games`. The admin frontend should use a separate authenticated API under `/api/admin`.

## Data model

### `users` / `admins`

- `id` UUID primary key
- `email` unique, normalized
- `password_hash` managed by a mature password-hashing library, never stored as plaintext
- `role` enum: `owner`, `editor`
- `mfa_enabled`, `created_at`, `last_login_at`
- `disabled_at` nullable

Use secure, HttpOnly, SameSite cookies for sessions or a carefully designed short-lived token flow. Add rate limiting, CSRF protection for cookie-authenticated mutations, session revocation, MFA for owners, and audit logging.

### `categories`

- `id` UUID primary key
- `slug` unique
- `name`
- `created_at`

### `games`

- `id` UUID primary key
- `slug` unique and lowercase
- `title`
- `short_description`, `description`
- `category_id` foreign key
- `tags` normalized in a join table or validated array
- `version`, `file_size`, `platforms`
- `developer`, `publisher`, `release_date`
- `cover_asset_id` nullable foreign key
- `status` enum: `draft`, `published`, `archived`
- `featured` boolean
- `created_by`, `updated_by` foreign keys
- `created_at`, `updated_at`, `published_at`

### `download_records`

- `id` UUID primary key
- `game_id` foreign key
- `url` encrypted or access-controlled according to provider needs
- `label`, `platform`, `version`, `file_size`
- `authorization_confirmed_at` and `authorization_reference` (internal evidence, never exposed publicly)
- `active` boolean
- `created_by`, `created_at`, `updated_at`

Prefer controlled object storage and short-lived signed URLs for files hosted by the owner. If an external provider is used, treat its URL as untrusted input and review it before publication.

## Suggested API

- `POST /api/auth/login` — authenticate with server-side credentials and rate limits
- `POST /api/auth/logout` — revoke session
- `GET /api/games` — published games only
- `GET /api/games/:slug` — one published game
- `GET /api/admin/games` — authenticated staff list
- `POST /api/admin/games` — create draft after validation
- `PATCH /api/admin/games/:id` — edit a draft or published record
- `POST /api/admin/games/:id/publish` — explicit publish transition
- `POST /api/admin/games/:id/unpublish` — return to draft
- `DELETE /api/admin/games/:id` — soft-delete/archive, never destructive by default
- `POST /api/admin/games/:id/downloads` — create an authorized download record

The backend, not the browser, must enforce role permissions and publish transitions.

## Required server-side validation

- Required string fields must be present, trimmed, and length-limited.
- Slugs must be lowercase, URL-safe, unique, and immutable or redirect-aware after publication.
- Status transitions require an authenticated editor/owner.
- Categories and platforms must come from controlled values or validated records.
- Download URLs must parse successfully, use `https:`, reject credentials and unsafe schemes, and be checked against an allowlist or review workflow where practical.
- Validate redirects and final destinations server-side when appropriate; do not blindly fetch arbitrary URLs (SSRF risk).
- Confirm the site owner has distribution rights before publication and retain internal evidence.
- Validate image MIME type, size, dimensions, and ownership before storing it.
- Revalidate all fields on every mutation. Client-side validation is only a usability feature.

## Environment variables

See `.env.example`. Secrets must be supplied by the deployment platform, never committed or bundled into frontend JavaScript.
