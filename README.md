# Arcade Atlas

Arcade Atlas is a static, frontend-first game catalog for publishing games and their authorized download links. It uses original abstract SVG demo artwork and clearly marks the sample catalog data.

## Features

- Responsive mobile-first catalog with featured and latest sections
- Client-side search by title, category, and tags
- Category filtering and category navigation
- Detail pages driven by a URL slug
- Clear unavailable-download state when no authorized URL is supplied
- Semantic markup, visible focus states, alt text, reduced-motion support, and friendly error/empty states
- No framework, build step, API keys, or external game assets required

## Run locally

Because the app fetches `data/games.json`, use a local static server rather than opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Any static host works for deployment, including GitHub Pages, Netlify, or Cloudflare Pages.

## Add a game

Add an object to `data/games.json` following the existing schema. Use a unique `id` and URL-safe `slug`, provide an image path, and set `status` to `published` when ready. Images should be owned by the site owner or clearly licensed. The frontend filters malformed records but does not replace server-side validation.

`downloadUrl` must be an HTTPS URL to a resource the site owner is authorized to distribute. An empty value intentionally displays “Download unavailable”; the app never invents a download URL. External download links open in a new tab and are labeled as external.

## Deployment

Upload the repository contents to a static host with `index.html` as the entry point. Update the placeholder canonical URLs and Open Graph metadata in each HTML page, and update `sitemap.xml` with the real domain. Configure HTTPS on the host.

## Future backend architecture

The planned flow is browser → authenticated backend API → database/object storage → authorized download resource. A future `/admin` area should support login, CRUD operations, publishing state, image management, categories, and analytics. Authentication, authorization, URL validation, and ownership checks must happen on the server; frontend checks are not a security boundary.

## Security considerations

There are no secrets or API keys in this frontend. Data is rendered with DOM text APIs instead of untrusted HTML. Only HTTPS download URLs are accepted by the detail-page CTA. Before adding an API, validate all fields server-side, restrict external URL schemes and destinations as appropriate, use secure sessions, audit admin changes, and confirm distribution rights for every resource.
