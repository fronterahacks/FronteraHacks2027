# Frontera Hacks 2027

The official website for **Frontera Hacks 2027**, the 4th annual 24-hour hackathon hosted by
[Frontera Devs](https://www.youtube.com/@fronteradevs/) in **McAllen, TX** on **March 6–7, 2027**.

A single-page site with scroll-driven 3D and motion: the Frontera Devs mascot as an interactive
voxel figure, a neon timeline that lights up through the schedule, and a neon frontier finale.

## Features

- **3D voxel mascot** built cube-for-pixel from the pixel-art logo. It watches the cursor, blinks,
  tips its hat on hover, scatters into cubes as you scroll away, and reassembles when you return.
- **Neon countdown** to hacking start, with rolling digits and a random neon-sign flicker.
- **Scroll-driven reveals**: titles assemble letter by letter in 3D and "ignite" like neon;
  paragraphs light up word by word; section labels glitch-decode.
- **Schedule as a neon timeline**: a 3D light tube runs through every event, with a pulse that
  follows your scroll and lights each row as it arrives.
- **Frontier finale** in the footer: a neon desert grid, mesas and a striped sunset, where the
  mascot reassembles and tips its hat goodbye.
- Expanding Tracks and FAQ rows, a tilting glass sponsor card, magnetic buttons and film grain.
- **Accessible by design**: semantic HTML, keyboard support, screen-reader-friendly text effects,
  and a full **reduced-motion** mode (OS setting) that switches the animations off.

## Tech stack

| Area | Tools |
| --- | --- |
| Build / dev server | [Vite](https://vite.dev) + [TypeScript](https://www.typescriptlang.org) |
| UI | [React](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (theme tokens in `src/index.css`) |
| 3D | [Three.js](https://threejs.org) via [React Three Fiber](https://r3f.docs.pmnd.rs), custom GLSL shaders |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering) |
| Animation | [GSAP](https://gsap.com) (ScrollTrigger, SplitText) |
| Font | Hanken Grotesk (self-hosted via Fontsource) |
| Hosting | [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) (static assets) |

## Run it locally

**Requirements:** [Node.js](https://nodejs.org) 20.19+ or 22.12+ (developed on Node 24) and npm.

```bash
git clone <this-repo-url>
cd FronteraHacks2027
npm install
npm run dev
```

Then open the URL it prints (usually <http://localhost:5173>). Changes reload instantly.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Type-check and build the production site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run preview:cf` | Build and run locally on Cloudflare's runtime (with the real security headers) |
| `npm run lint` | Check the code with ESLint |
| `npm run deploy` | Build and publish to Cloudflare (needs `npx wrangler login` first) |
| `npm run voxelize:mascot` | Regenerate the 3D mascot data from the logo PNG |

## Editing content

**All text, dates, links, schedule, FAQ and sponsors live in one file: [`src/data/event.ts`](src/data/event.ts).**
Edit it and every section updates; no component code needs to change. Some examples:

- **Registration:** `event.registerUrl` (Airtable link) and `event.registerLabel`
  (`'Pre-register'` now; change to `'Register'` when full registration opens).
- **Countdown times:** `countdown.start` / `countdown.end` (include the time zone offset;
  McAllen is `-06:00` that weekend).
- **Schedule, tracks, FAQ:** the `schedule.days`, `tracks.items` and `faq.items` lists.
- **Sponsors:** `sponsors.items`. Add a logo to `src/assets/sponsors/` and import it; the layout
  adapts to the number of sponsors.
- **Socials:** `socials`. An entry with `url: null` stays hidden.

### Adding images

Photos should be cropped, resized and stripped of metadata (camera photos can contain GPS
location) before they go in the repo:

```bash
# Square crop at (left, top) of the given size, saved as a 600x600 WebP with no metadata
node scripts/prepare-photo.mjs <input.jpg> src/assets/pillars/<name>.webp <left> <top> <size>

# White logo on a dark background -> transparent white PNG
node scripts/extract-white-logo.mjs <input.png> src/assets/sponsors/<name>.png
```

## Project structure

```
src/
  App.tsx            Page layout: 3D canvas, nav, sections, footer
  index.css          Tailwind theme (colours, fonts, animations, utilities)
  data/event.ts      All site content
  sections/          Hero, About, Tracks, Schedule, Sponsors, Faq, Footer
  components/        Shared UI: Nav, Countdown, RevealText, Reveal, SectionHeading,
                     GlitchText, Magnetic, GrainOverlay
  hooks/             Reduced motion, glitch text, in-view, tilt, velocity skew, flicker
  scroll/            Lenis smooth scroll + shared scroll state
  three/             The 3D scene (lazy-loaded)
    Scene.tsx          Canvas, lighting, frame driver
    mascot/            Voxel mascot (generated grid, parts, scatter effects)
    timeline/          Schedule neon tube and node measurement
    finale/            Footer desert terrain, sun, horizon line
scripts/             Mascot voxelizer and image-prep tools (dev only)
public/              Favicons, web manifest, grain texture, _headers
wrangler.jsonc       Cloudflare deployment config
```

## Deployment

The site deploys to **Cloudflare Workers** as static files (`wrangler.jsonc`).

```bash
npx wrangler login   # once, opens the browser to authorize
npm run deploy       # builds and uploads; prints the live URL
```

`public/_headers` adds security headers to every response (Content Security Policy,
clickjacking protection, HSTS, Permissions-Policy, and more) and long-term caching for hashed
assets. Test them locally with `npm run preview:cf`.

## Accessibility and performance

- Respects **`prefers-reduced-motion`**: smooth scroll, reveals, glitches, flicker, 3D scatter
  and CSS transitions are switched off; content stays fully readable.
- The 3D scene loads separately after the page content, and **stops rendering** when no 3D is on
  screen.
- Keyboard-friendly controls with visible focus states; animated text always has a readable copy
  for screen readers.

---

Made with ♡ by the Frontera Devs team.
