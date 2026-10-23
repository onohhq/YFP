# Your Fave Photobooth website

Production build of the `Your Fave Photobooth v1` design from `project/`. It is a plain static site: hand-written HTML, one stylesheet and one script. It needs no build step and no framework, and it no longer depends on the design tool's `support.js` runtime.

## Pages

| Address | File | In Google |
| --- | --- | --- |
| `/` | `index.html` | yes |
| `/photobooths/` | `photobooths/index.html` | yes |
| `/events/` | `events/index.html` | yes |
| `/corporate/` | `corporate/index.html` | yes |
| `/weddings/` | `weddings/index.html` | yes |
| `/faq/` | `faq/index.html` | yes |
| `/contact/` | `contact/index.html` | yes |
| `/thankyou/` | `thankyou/index.html` | no (noindex) |
| `/dp/` | `dp/index.html` | no (noindex) |
| `/connect/` | `connect/index.html` | no (noindex) |
| `/connect2/` | `connect2/index.html` | no (noindex) |
| any missing page | `404.html` | no (noindex) |

- `css/site.css` holds every style. Colors and fonts are CSS variables at the top.
- `js/site.js` runs the menu, intro and page-change curtain, scroll reveals, parallax, pinned sideways carousels, FAQ accordion, rotating reviews and the `/dp` background video.
- `robots.txt`, `sitemap.xml` and `llms.txt` are the search-engine and AI-search files.

## Preview locally

Links are root-relative (`/events/`), so serve the folder rather than opening files directly:

```sh
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Upload the contents of `site/` to the root of any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages). On Netlify or Cloudflare Pages you can drag and drop the folder. Then point `yourfavephotobooth.com` at it. Most of these hosts serve `404.html` for missing pages automatically.

After launch:

- In LeadConnector, set the "Website lead form" redirect to `https://yourfavephotobooth.com/thankyou/`.
- Submit `https://yourfavephotobooth.com/sitemap.xml` in Google Search Console.
- Replace the Facebook and LinkedIn placeholders in the footer (search for `TODO`).

## Editing

The header, menu, reviews and footer are repeated in each page's HTML, so a change to one of them must be made in every page that has it. Per-page SEO (title, description, canonical, Open Graph, breadcrumb data) sits in each page's `<head>`. The FAQ structured data is only on `/faq/`.

After changing `css/site.css` or `js/site.js`, raise the `?v=` number on their links in every page (for example `site.css?v=2` to `site.css?v=3`). Browsers then download the new file instead of using a cached copy.

To swap a photo, replace the file in `assets/photos/` and keep the same name.

## Behavior notes

- The layout is a grid of boxes separated by 6px gaps: three columns on wide screens, two on tablets and one on phones.
- Motion is skipped entirely for visitors who have "reduce motion" turned on in their device settings.
- Moving between pages, a grid of navy tiles closes over the screen and opens on the next page. The first page you open plays the logo intro.
- Boxes wipe up into view as you scroll. The hero photo or video shrinks into a frame as you scroll past it.
- On computers with a mouse, a small square cursor follows the pointer and grows into an "Open" or "Read" badge over clickable boxes.
- The Contact, Thank You, Digital Photos and Connect pages have no header or footer, as in the design.
- The two forms (`/contact/` and `/dp/`) are LeadConnector embeds. Their fonts and colors come from the form settings in LeadConnector.
