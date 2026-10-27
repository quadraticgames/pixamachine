export interface SampleAttribution {
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
}

export interface SampleImage {
  id: string;
  name: string;
  category: string;
  recommendedPalette: string;
  recommendedPixelSize: number;
  imageUrl: string;
  thumbnailUrl?: string;
  attribution?: SampleAttribution;
}

// Crisp vector SVG scenes kept as the offline fallback, used whenever the
// Unsplash samples are unavailable (no API key, offline, or rate limited).
export const FALLBACK_SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'cyberpunk',
    name: 'Cyber City',
    category: 'Sci-Fi',
    recommendedPalette: 'cyberpunk',
    recommendedPixelSize: 8,
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#090124"/>
            <stop offset="50%" stop-color="#2d0b5a"/>
            <stop offset="85%" stop-color="#801b68"/>
            <stop offset="100%" stop-color="#d63384"/>
          </linearGradient>
          <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#ffbb00"/>
          </linearGradient>
          <linearGradient id="grid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#00ffff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ff007f" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#sky)"/>
        <!-- Sun -->
        <circle cx="300" cy="220" r="90" fill="url(#sun)"/>
        <line x1="200" y1="210" x2="400" y2="210" stroke="#090124" stroke-width="4"/>
        <line x1="205" y1="225" x2="395" y2="225" stroke="#090124" stroke-width="6"/>
        <line x1="215" y1="242" x2="385" y2="242" stroke="#090124" stroke-width="8"/>
        <line x1="230" y1="262" x2="370" y2="262" stroke="#090124" stroke-width="10"/>

        <!-- Distant Skyline -->
        <polygon points="20,290 50,230 70,230 70,290" fill="#1b0a33"/>
        <polygon points="80,290 100,190 130,190 140,290" fill="#1b0a33"/>
        <polygon points="150,290 170,160 210,160 220,290" fill="#160829"/>
        <polygon points="240,290 260,200 290,200 300,290" fill="#240c42"/>
        <polygon points="320,290 340,170 380,170 390,290" fill="#160829"/>
        <polygon points="410,290 430,210 470,210 480,290" fill="#240c42"/>
        <polygon points="500,290 520,180 560,180 570,290" fill="#1b0a33"/>

        <!-- Foreground Neon Skyscrapers -->
        <rect x="40" y="220" width="60" height="180" fill="#0c0417" stroke="#ff007f" stroke-width="1.5"/>
        <rect x="120" y="180" width="75" height="220" fill="#080211" stroke="#00ffff" stroke-width="1.5"/>
        <rect x="220" y="240" width="55" height="160" fill="#0c0417" stroke="#ff00aa" stroke-width="1.5"/>
        <rect x="340" y="200" width="85" height="200" fill="#080211" stroke="#00ffff" stroke-width="1.5"/>
        <rect x="450" y="230" width="60" height="170" fill="#0c0417" stroke="#ff5500" stroke-width="1.5"/>
        <rect x="530" y="210" width="50" height="190" fill="#080211" stroke="#ff007f" stroke-width="1.5"/>

        <!-- Windows -->
        <g fill="#00ffff" opacity="0.8">
          <rect x="50" y="230" width="6" height="8"/><rect x="70" y="230" width="6" height="8"/>
          <rect x="50" y="250" width="6" height="8"/><rect x="80" y="260" width="6" height="8"/>
          <rect x="135" y="195" width="8" height="10"/><rect x="155" y="195" width="8" height="10"/>
          <rect x="135" y="215" width="8" height="10"/><rect x="175" y="215" width="8" height="10"/>
          <rect x="360" y="220" width="8" height="12"/><rect x="380" y="220" width="8" height="12"/>
          <rect x="360" y="250" width="8" height="12"/><rect x="400" y="260" width="8" height="12"/>
        </g>
        <g fill="#ff007f" opacity="0.9">
          <rect x="60" y="240" width="6" height="8"/><rect x="80" y="240" width="6" height="8"/>
          <rect x="145" y="205" width="8" height="10"/><rect x="165" y="235" width="8" height="10"/>
          <rect x="235" y="255" width="6" height="8"/><rect x="255" y="270" width="6" height="8"/>
          <rect x="370" y="235" width="8" height="12"/><rect x="390" y="235" width="8" height="12"/>
        </g>

        <!-- Perspective Neon Grid Horizon -->
        <rect x="0" y="340" width="600" height="60" fill="#070114"/>
        <line x1="0" y1="350" x2="600" y2="350" stroke="#00ffff" stroke-width="1" opacity="0.4"/>
        <line x1="0" y1="365" x2="600" y2="365" stroke="#00ffff" stroke-width="1.5" opacity="0.6"/>
        <line x1="0" y1="385" x2="600" y2="385" stroke="#00ffff" stroke-width="2" opacity="0.8"/>
        <line x1="300" y1="340" x2="100" y2="400" stroke="#ff00aa" stroke-width="1.5"/>
        <line x1="300" y1="340" x2="200" y2="400" stroke="#ff00aa" stroke-width="1.5"/>
        <line x1="300" y1="340" x2="300" y2="400" stroke="#ff00aa" stroke-width="1.5"/>
        <line x1="300" y1="340" x2="400" y2="400" stroke="#ff00aa" stroke-width="1.5"/>
        <line x1="300" y1="340" x2="500" y2="400" stroke="#ff00aa" stroke-width="1.5"/>
      </svg>
    `)}`
  },
  {
    id: 'landscape',
    name: 'Fuji Sunset',
    category: 'Nature',
    recommendedPalette: 'endesga32',
    recommendedPixelSize: 8,
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="lSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff7e47"/>
            <stop offset="40%" stop-color="#ffb86c"/>
            <stop offset="75%" stop-color="#fdf1c8"/>
            <stop offset="100%" stop-color="#b6e0e6"/>
          </linearGradient>
          <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#ffe49e"/>
            <stop offset="100%" stop-color="#ff5722"/>
          </radialGradient>
        </defs>
        <rect width="600" height="400" fill="url(#lSky)"/>
        <!-- Big Sun -->
        <circle cx="300" cy="180" r="75" fill="url(#sunG)"/>
        <!-- Mt Fuji Mountain -->
        <polygon points="120,320 285,130 315,130 480,320" fill="#3b3355"/>
        <!-- Snow Cap -->
        <polygon points="285,130 315,130 350,175 330,170 315,185 295,170 280,185 250,175" fill="#f4f6fc"/>
        <polygon points="280,185 295,170 305,210 285,200" fill="#e1e6f7"/>
        <!-- Midground Mountains -->
        <polygon points="0,350 150,250 290,350" fill="#4d5382" opacity="0.9"/>
        <polygon points="330,350 460,260 600,350" fill="#4d5382" opacity="0.9"/>
        <!-- Lake Water -->
        <rect x="0" y="320" width="600" height="80" fill="#2d4059"/>
        <!-- Water Sun Reflection -->
        <ellipse cx="300" cy="335" rx="50" ry="4" fill="#fdf1c8" opacity="0.7"/>
        <ellipse cx="300" cy="345" rx="70" ry="5" fill="#ffb86c" opacity="0.6"/>
        <ellipse cx="300" cy="360" rx="90" ry="7" fill="#ff7e47" opacity="0.5"/>
        <!-- Pine Tree Silhouette Foregrounds -->
        <polygon points="20,400 35,320 50,400" fill="#1b1d28"/>
        <polygon points="40,400 60,300 80,400" fill="#14151f"/>
        <polygon points="70,400 85,335 100,400" fill="#1b1d28"/>
        <polygon points="500,400 520,310 540,400" fill="#14151f"/>
        <polygon points="530,400 545,330 560,400" fill="#1b1d28"/>
      </svg>
    `)}`
  },
  {
    id: 'gameboy_zelda',
    name: 'Retro Quest',
    category: 'Gaming',
    recommendedPalette: 'gameboy',
    recommendedPixelSize: 6,
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#8bac0f"/>
        <!-- Dungeon Stones -->
        <g fill="#306230" stroke="#0f380f" stroke-width="3">
          <rect x="40" y="40" width="520" height="320" fill="#9bbc0f"/>
          <!-- Brick grid -->
          <line x1="40" y1="120" x2="560" y2="120"/>
          <line x1="40" y1="200" x2="560" y2="200"/>
          <line x1="40" y1="280" x2="560" y2="280"/>
          <line x1="160" y1="40" x2="160" y2="120"/>
          <line x1="320" y1="40" x2="320" y2="120"/>
          <line x1="480" y1="40" x2="480" y2="120"/>
          <line x1="100" y1="120" x2="100" y2="200"/>
          <line x1="240" y1="120" x2="240" y2="200"/>
          <line x1="380" y1="120" x2="380" y2="200"/>
          <line x1="500" y1="120" x2="500" y2="200"/>
        </g>
        <!-- Treasure Chest -->
        <g transform="translate(250, 150)">
          <rect x="0" y="25" width="100" height="60" rx="6" fill="#306230" stroke="#0f380f" stroke-width="4"/>
          <path d="M 0 25 Q 50 -10 100 25 Z" fill="#306230" stroke="#0f380f" stroke-width="4"/>
          <rect x="40" y="25" width="20" height="25" fill="#8bac0f" stroke="#0f380f" stroke-width="3"/>
          <circle cx="50" cy="35" r="4" fill="#0f380f"/>
          <!-- Shimmer Stars -->
          <polygon points="120,5 125,20 140,25 125,30 120,45 115,30 100,25 115,20" fill="#9bbc0f"/>
          <polygon points="-20,10 -16,22 -4,26 -16,30 -20,42 -24,30 -36,26 -24,22" fill="#9bbc0f"/>
        </g>
        <!-- Swords and Shield motif -->
        <text x="300" y="335" font-family="monospace" font-size="22" font-weight="bold" fill="#0f380f" text-anchor="middle">
          ★ LEVEL 1-1 ★
        </text>
      </svg>
    `)}`
  },
  {
    id: 'fruit',
    name: 'Arcade Cherry',
    category: 'Icons',
    recommendedPalette: 'pico8',
    recommendedPixelSize: 10,
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#181425"/>
        <!-- Radial glow -->
        <circle cx="300" cy="200" r="160" fill="#2d173b" opacity="0.6"/>
        <!-- Cherry Stems -->
        <path d="M 300 80 Q 240 120 220 220" fill="none" stroke="#63c74d" stroke-width="12" stroke-linecap="round"/>
        <path d="M 300 80 Q 360 120 370 240" fill="none" stroke="#3e8948" stroke-width="12" stroke-linecap="round"/>
        <!-- Top Leaf -->
        <path d="M 300 80 Q 350 40 400 65 Q 360 100 300 80 Z" fill="#63c74d" stroke="#265c42" stroke-width="4"/>
        <!-- Left Cherry -->
        <circle cx="210" cy="250" r="65" fill="#e43b44"/>
        <circle cx="190" cy="230" r="20" fill="#ff76a6" opacity="0.8"/>
        <circle cx="180" cy="220" r="8" fill="#ffffff"/>
        <!-- Right Cherry -->
        <circle cx="370" cy="265" r="70" fill="#be1e2d"/>
        <circle cx="350" cy="245" r="22" fill="#ff76a6" opacity="0.7"/>
        <circle cx="340" cy="235" r="9" fill="#ffffff"/>
      </svg>
    `)}`
  }
];

// ---------------------------------------------------------------------------
// Unsplash samples
//
// The access key lives on the dev server (see vite.config.ts), so the browser
// only calls this same-origin path and the key never ships in the bundle.
// ---------------------------------------------------------------------------

const UNSPLASH_RANDOM_PATH = "/api/unsplash/photos/random";
const SESSION_CACHE_KEY = "pixamachine:unsplash-samples:v1";
const UNSPLASH_UTM = "?utm_source=pixamachine&utm_medium=referral";

export const UNSPLASH_HOME_URL = `https://unsplash.com/${UNSPLASH_UTM}`;

// Each slot keeps a distinct palette and pixel size, so random photos still
// demonstrate what the different palettes do.
const SLOT_DEFAULTS = [
  { recommendedPalette: "cyberpunk", recommendedPixelSize: 8 },
  { recommendedPalette: "endesga32", recommendedPixelSize: 8 },
  { recommendedPalette: "gameboy", recommendedPixelSize: 6 },
  { recommendedPalette: "pico8", recommendedPixelSize: 10 },
];

interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: { regular: string; small: string };
  links: { html: string };
  user: { name: string; links: { html: string } };
}

// Unsplash requires API images to be hotlinked from their CDN, so anything
// pointing elsewhere is treated as an unusable response.
function isUnsplashPhoto(value: unknown): value is UnsplashPhoto {
  const photo = value as UnsplashPhoto | null;
  return Boolean(
    photo &&
      typeof photo.id === "string" &&
      typeof photo.urls?.regular === "string" &&
      photo.urls.regular.startsWith("https://images.unsplash.com/")
  );
}

function toSampleImage(photo: UnsplashPhoto, index: number): SampleImage {
  const slot = SLOT_DEFAULTS[index % SLOT_DEFAULTS.length];
  const label = (photo.alt_description || photo.description || "Random photo").trim();

  return {
    id: photo.id,
    name: label.length > 28 ? `${label.slice(0, 27).trimEnd()}…` : label,
    category: "Unsplash",
    ...slot,
    imageUrl: photo.urls.regular,
    thumbnailUrl: photo.urls.small,
    attribution: {
      photographer: photo.user?.name ?? "Unknown photographer",
      photographerUrl: `${photo.user?.links?.html ?? "https://unsplash.com"}${UNSPLASH_UTM}`,
      photoUrl: `${photo.links?.html ?? "https://unsplash.com"}${UNSPLASH_UTM}`,
    },
  };
}

function readSessionCache(): SampleImage[] | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as SampleImage[]) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(samples: SampleImage[]): void {
  try {
    window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(samples));
  } catch {
    // Storage can be unavailable or full; caching is only an optimisation.
  }
}

/**
 * Fetches random photos from Unsplash. Resolves to null when no access key is
 * configured, the request fails, or the payload is not usable, so callers can
 * keep showing the built-in samples. One fetch per browser session: the demo
 * rate limit is 50 requests/hour.
 */
export async function fetchUnsplashSamples(count = 4): Promise<SampleImage[] | null> {
  const cached = readSessionCache();
  if (cached && cached.length >= count) return cached.slice(0, count);

  try {
    const response = await fetch(`${UNSPLASH_RANDOM_PATH}?count=${count}&orientation=landscape`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return null;

    const samples = payload.filter(isUnsplashPhoto).slice(0, count).map(toSampleImage);
    if (samples.length === 0) return null;

    writeSessionCache(samples);
    return samples;
  } catch {
    // No key configured, offline, or a non-JSON response (e.g. the dev
    // server's SPA fallback when the proxy is disabled).
    return null;
  }
}
