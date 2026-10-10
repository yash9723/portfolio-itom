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

## Editing content

All personal content comes from one file: [`src/data/profile.js`](src/data/profile.js)
(name, links, experience, projects, awards, skills, studio items). The 3D rooms, the screen-reader layer,
the SEO block, JSON-LD, `llms.txt`, `robots.txt` and `sitemap.xml` all read from it.

**TODO before going live:** fill in the GitHub, LinkedIn, Trana-Trace and NAVIEL links and `SITE_URL`
in `profile.js`, and the GitHub/LinkedIn links in `public/start/index.html`.

### Regenerating the artwork

Textures that show personal content (photo avatar with a sticker border, project cards, balloons, islands, award cards, studio screens,
favicon, social card) are generated from `profile.js` and the photo in `scripts/art/photo.png`:

```bash
node scripts/art/gen-art.mjs
```

Run a single group with e.g. `node scripts/art/gen-art.mjs balloons` (groups: `avatars`, `galleryCards`,
`techLogos`, `balloons`, `islands`, `certificates`, `monitorBezel`, `studioScreens`, `door`, `entranceDoors`, `wallArt`, `brand`).

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
node --test scripts/test-start.mjs
```

Optional environment variables are listed in [`.env.example`](.env.example) (contact form and analytics).

## Deploying to Vercel

Import the repository in Vercel. `vercel.json` already sets the Vite build, the SPA routes
(`/about`, `/gallery`, `/studio`, `/contact`), the `/start` page and the cache headers. Add the
variables from `.env.example` in the project settings if you use them.

## Credits & license

The 3D engine, scene code and original hand-drawn artwork are by **Tomasz "ITom" Szmajda**
([portfolio-itom](https://github.com/ITomPoland/portfolio-itom)). The code is MIT-licensed (see [LICENSE](LICENSE)).
The original README states that the personal assets, textures, images and copywriting remain the copyright of
Tomasz Szmajda and may not be reused without explicit permission.
