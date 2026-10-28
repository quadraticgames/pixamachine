# Pixa Machine

A browser-based pixel-art studio. Drop a photo in and it is quantized to an authentic retro
palette with ordered or error-diffusion dithering, shown side by side against the original,
and exportable as a PNG.

Everything runs client-side in a canvas — no upload, no account, no server round-trip for the
image itself. The only backend is a small Node process that serves the built app and proxies
Unsplash so the API key never reaches the browser.

## Features

**Getting an image in**

- Drag and drop, the file browser, or <kbd>Ctrl</kbd>+<kbd>V</kbd> to paste from the clipboard
  (PNG, JPG, WEBP or GIF)
- A random set of four Unsplash photographs on the landing screen; **New Image** returns there
  and draws a fresh set

**Editing**

- Split view with a draggable divider between original and pixel art
- **16 palettes** — Original Colors (full 24-bit) plus 15 fixed ones: Game Boy DMG, Game Boy
  Pocket, Sega Game Gear, PICO-8, NES/Famicom, Sega Master System, Atari 2600, CGA Mode 4,
  Commodore 64, ZX Spectrum, MS-DOS Grayscale 16, Windows 95/Web Safe, EDG 32, Cyberpunk Neon
  and Vaporwave Sunset — filterable by Handhelds, Classic Consoles, Vintage PC & OS and
  Indie & Aesthetic
- Pixel size from 2–48px, with 4/6/8/12/16/24/32 presets
- Dithering: none, Bayer 4×4, Bayer 8×8, Floyd–Steinberg, Atkinson, with adjustable strength
- Tone: brightness, contrast, saturation and a full hue rotation (−180° to +180°, applied to
  the source blocks before quantization so palette matching stays accurate)
- Overlays: square or bead pixel shape, CRT scanlines, grid lines
- **Randomize** rolls a new palette plus every pixel, tone and overlay setting for the current
  image in one click

**Output**

- **Copy** the current pixel art to the clipboard as a PNG
- **Download** saves exactly what is on screen, overlays included
- Export the selected palette as a `.hex` file

The header is icon-only, with styled tooltips naming and explaining each action.

## Tech stack

- React 18 with TypeScript, built by Vite 5
- Tailwind CSS 3 with shadcn/ui components on Radix primitives
- A hand-written Canvas 2D pixel engine (`src/lib/pixelEngine.ts`): block averaging, dithering,
  weighted colour-distance quantization, then block rendering
- `react-dropzone`, `sonner` toasts and `lucide-react` icons
- Node 20+ HTTP server in production (`server.js`), with no framework

## Getting started

Requires Node 20 or newer.

```bash
npm install
cp .env.example .env.local   # optional: add UNSPLASH_ACCESS_KEY
npm run dev                  # http://localhost:8080
```

Without an Unsplash key the app still works — the landing screen shows its built-in sample
images instead of live photographs.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 8080, with the Unsplash proxy when a key is present |
| `npm run build` | Production build into `dist/` |
| `npm start` | Serves `dist/` and proxies `/api/unsplash/*` on `$PORT` |
| `npm run preview` | Vite preview of the last build |
| `npm run lint` | ESLint over the project |

## Unsplash samples

The landing screen calls `/api/unsplash/photos/random?count=4&orientation=landscape`. That path
is always handled server-side, so the access key is never part of the client bundle:

- **Development** — `vite.config.ts` reads `UNSPLASH_ACCESS_KEY` (unprefixed, via `loadEnv`) and
  configures a dev proxy that attaches `Authorization: Client-ID …`
- **Production** — `server.js` forwards the request to `api.unsplash.com` with the same header,
  allows only `/photos/*` so it cannot act as an open proxy, times out after 10s and sends
  `cache-control: no-store`

Results are cached in `sessionStorage` so a page reload does not spend another request; **New
Image** bypasses the cache for a new set. The Unsplash demo tier allows 50 requests per hour,
and the app falls back to its built-in samples (with a `Photo by …` credit link on each
photograph) when the API is unavailable.

Never name the variable `VITE_UNSPLASH_ACCESS_KEY` — the `VITE_` prefix would inline the key
into the browser bundle.

## Deployment

The app is deployed on Railway from `main`, configured by `railway.json`:

- **Builder** Railpack, which installs with npm from `package-lock.json` and runs `npm run build`
- **Start** `npm start` — serves `dist/` and the Unsplash proxy on `$PORT`
- **Health check** `/`, restarting on failure up to five times
- `UNSPLASH_ACCESS_KEY` set as a service variable, never committed
- SPA routes fall back to `dist/index.html`; a missing file *with* an extension returns a real
  404 so broken asset references stay visible

`package-lock.json` is the single lockfile — a stray `bun.lockb` would make Railpack switch
installers and fail with a frozen-lockfile error.

## Project layout

```
server.js                 production static server + Unsplash proxy
src/pages/Index.tsx       page state, header, layout
src/components/
  ComparisonCanvas.tsx    split view and the rendering canvas
  EditorPanel.tsx         tabbed rail (Palette / Pixel / Tone / Overlays)
  PaletteSelector.tsx     palette categories and cards
  EffectsControls.tsx     pixel, tone and overlay controls
  ImageUploader.tsx       drop zone, browse, Unsplash samples
  ExportToolbar.tsx       new image, palette export, copy, download
  HeaderTooltip.tsx       styled tooltips for the icon header
src/lib/
  pixelEngine.ts          dithering, quantization and rendering
  palettes.ts             palette definitions and categories
  samples.ts              Unsplash fetch and fallback samples
```

## Live demo

[pixamachine-production.up.railway.app](https://pixamachine-production.up.railway.app)
