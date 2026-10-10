# Abhilash Joyeal Uppalaguptha | Interactive 3D Portfolio

An interactive, hand-drawn 3D portfolio for **Abhilash Joyeal Uppalaguptha**, an ECE student (Aditya University, 2024-2028) working on VLSI design, embedded systems and IoT.

Walk through a sketchbook corridor and open four doors:

| Room | What's inside |
|---|---|
| **About** | Intro, awards (public speaking, leadership, builds), journey (Aditya University, OPTICA) and skill balloons |
| **Gallery** | Project cards: BitFlow, Trana-Trace, NAVIEL, OPTICA Student Chapter |
| **Studio** | Talks, events and updates on a tower of TVs, monitors and phones |
| **Contact** | Email, LinkedIn, GitHub, BitFlow and the resume PDF |

A light link-in-bio page lives at `/start`, and the resume is served at `/resume.pdf`.

## Built with

React 19, Three.js / React Three Fiber, GSAP and Vite. Based on the open-source
[portfolio-itom](https://github.com/ITomPoland/portfolio-itom) engine by Tomasz Szmajda (see [Credits & license](#credits--license)).

## Project structure

```
src/
  data/profile.js        all personal content (single source of truth)
  hooks/useContentData   exposes projects / studio items / awards to the rooms
  components/
    canvas/entrance      street, doors, cat, window
    canvas/corridor      infinite corridor, doors, hero text, avatar, picture frames
    canvas/rooms/        About (sky), Gallery (cards), Studio (screen tower), Contact (pier)
    canvas/shaders       paint / reveal materials
    dom, ui              preloader, HUD, overlay, screen-reader layer
  config/texturePreloadList.js   every texture loaded by the preloader (derived from profile.js)
seo-plugin.js            build-time SEO block, JSON-LD, llms.txt, robots.txt, sitemap.xml
public/                  textures, fonts, sounds, /start page, resume.pdf, _headers (Cloudflare)
scripts/art/             gen-art.mjs + source photo, event photos and art templates
```

## Editing content

All personal content comes from one file: [`src/data/profile.js`](src/data/profile.js)
(name, links, site URL, experience, projects, awards, skills, studio items, event photos). The 3D rooms,
the screen-reader layer, the SEO block, JSON-LD, `llms.txt`, `robots.txt` and `sitemap.xml` all read from it.
The `/start` page (`public/start/index.html`) is static HTML, so update its links by hand.

### Regenerating the artwork

Textures that show personal content (photo avatar, project cards, balloons, islands, award cards, studio screens,
event photos, entrance stickers, favicon, social card) are generated from `profile.js`, the portrait in
`scripts/art/photo.png` and the event photos in `scripts/art/events/`:

```bash
npm run art              # everything
npm run art -- balloons  # one group
```

Groups: `avatars`, `corridorPhotos`, `galleryCards`, `techLogos`, `balloons`, `islands`, `certificates`,
`monitorBezel`, `studioScreens`, `door`, `entranceDoors`, `wallArt`, `brand`.

## Scripts

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve dist/ locally
npm test          # /start page tests
npm run deploy    # build + upload to Cloudflare Pages (needs `npx wrangler login` once)
```

Optional environment variables are listed in [`.env.example`](.env.example) (contact form and analytics).

## Hosting

Live on **Cloudflare Pages** (project `portfolio-abhilash`, https://portfolio-abhilash.pages.dev), with the custom
domain https://abhilashjoyeal.work.gd. `public/_headers` sets security and cache headers, and Pages serves
`index.html` for the room URLs automatically. `vercel.json` holds the equivalent setup if you ever host on Vercel.

## Credits & license

The 3D engine, scene code and original hand-drawn artwork are by **Tomasz "ITom" Szmajda**
([portfolio-itom](https://github.com/ITomPoland/portfolio-itom)). The code is MIT-licensed (see [LICENSE](LICENSE)).
The original README states that the personal assets, textures, images and copywriting remain the copyright of
Tomasz Szmajda and may not be reused without explicit permission.
