export interface SampleAttribution {
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
}

export interface SampleImage {
  id: string;
  name: string;
  category: string;
  recommendedPixelSize: number;
  imageUrl: string;
  thumbnailUrl?: string;
  attribution?: SampleAttribution;
  /** True for the bundled photos in /public/samples, false for live API photos. */
  bundled?: boolean;
}

// ---------------------------------------------------------------------------
// Bundled samples
//
// Four photographs from Unsplash, downloaded once and served from
// /public/samples, used when the API is unavailable: no access key, offline,
// or the hourly request budget is spent. Bundling is deliberate — a visitor on
// a spent budget still gets real photographs instead of placeholder art, and
// it costs no API requests.
//
// Chosen for what survives quantization: hard silhouettes, strong light, and a
// narrow enough set of hues to read cleanly at 4-16 colours.
// Each ~1200px wide and 60-195KB.
// ---------------------------------------------------------------------------

const UNSPLASH_UTM = "?utm_source=pixamachine&utm_medium=referral";

export const UNSPLASH_HOME_URL = `https://unsplash.com/${UNSPLASH_UTM}`;

export const FALLBACK_SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "bundled-neon-city",
    name: "Neon Skyline",
    category: "Unsplash",
    recommendedPixelSize: 8,
    imageUrl: "/samples/neon-city.jpg",
    bundled: true,
    attribution: {
      photographer: "Irina Iriser",
      photographerUrl: `https://unsplash.com/@iriser${UNSPLASH_UTM}`,
      photoUrl: `https://unsplash.com/photos/high-rise-buildings-at-nighttime-rhRlzHJcv5w${UNSPLASH_UTM}`,
    },
  },
  {
    id: "bundled-mountain-sunset",
    name: "Mountain Sunset",
    category: "Unsplash",
    recommendedPixelSize: 8,
    imageUrl: "/samples/mountain-sunset.jpg",
    bundled: true,
    attribution: {
      photographer: "Vazgen",
      photographerUrl: `https://unsplash.com/@koryunhills${UNSPLASH_UTM}`,
      photoUrl: `https://unsplash.com/photos/silhouette-of-mountains-during-sunset-xqmeyzoRY7U${UNSPLASH_UTM}`,
    },
  },
  {
    id: "bundled-jellyfish",
    name: "Jellyfish",
    category: "Unsplash",
    recommendedPixelSize: 6,
    imageUrl: "/samples/jellyfish.jpg",
    bundled: true,
    attribution: {
      photographer: "Sasha • Make Stories Studio",
      photographerUrl: `https://unsplash.com/@sanfrancisco${UNSPLASH_UTM}`,
      photoUrl: `https://unsplash.com/photos/underwater-photography-of-jellyfish-r5sWUXSgEfg${UNSPLASH_UTM}`,
    },
  },
  {
    id: "bundled-portrait",
    name: "Studio Portrait",
    category: "Unsplash",
    recommendedPixelSize: 10,
    imageUrl: "/samples/portrait-studio.jpg",
    bundled: true,
    attribution: {
      photographer: "Michael Guertin",
      photographerUrl: `https://unsplash.com/@imik${UNSPLASH_UTM}`,
      photoUrl: `https://unsplash.com/photos/woman-with-windblown-hair-against-a-dark-background-n7R_kbDXJoI${UNSPLASH_UTM}`,
    },
  },
];

// ---------------------------------------------------------------------------
// Unsplash samples
//
// The access key lives on the dev server (see vite.config.ts), so the browser
// only calls this same-origin path and the key never ships in the bundle.
// ---------------------------------------------------------------------------

const UNSPLASH_RANDOM_PATH = "/api/unsplash/photos/random";

// Each slot opens at a different pixel size, so a fresh set of random photos
// doesn't all render at the same scale. Palettes are left alone: every image
// starts on Original Colors.
const SLOT_PIXEL_SIZES = [8, 8, 6, 10];

/**
 * Curated search themes, one per landing-screen visit.
 *
 * Plain /photos/random happily hands back office plants and backlit laptops,
 * which quantize into mush. These are chosen for what survives a 4-16 colour
 * palette: hard silhouettes, strong light, saturated colour, recognisable
 * subjects. A theme still returns four different photographs — it narrows the
 * pool, it doesn't repeat one shot.
 *
 * Weighted towards flowers, botanicals and landscapes: soft petals are harder
 * to quantize than a neon sign, but a flower with a bit of contrast and a
 * strong colour still reads at 8px, and it is what most people want to feed a
 * pixel-art tool. The neon, street and portrait themes stay for contrast.
 *
 * One search per visit, not one per card: the demo access tier allows 50
 * requests an hour, so four searches per load would exhaust it in twelve
 * visits. Callers fall back to plain random if a theme ever comes back empty.
 */
const SAMPLE_THEMES = [
  // Botanical
  "wildflower meadow",
  "flower macro",
  "tropical flowers",
  "lotus flower",
  "sunflower field",
  "lavender field",
  "cherry blossom",
  // Landscapes and natural beauty
  "mountain sunrise",
  "desert dunes",
  "autumn forest fog",
  "mushroom macro",
  "jellyfish",
  "coral reef",
  "lighthouse in a storm",
  "ski slope",
  "surfer big wave",
  // Contrast: hard light and urban colour
  "neon signs at night",
  "tokyo street at night",
  "vintage car",
  "cinema marquee",
  "retro computer",
  "hot air balloon",
  "dramatic portrait lighting",
];

/** A fresh theme for this visit; the rest of the set follows from it. */
function pickTheme(): string {
  return SAMPLE_THEMES[Math.floor(Math.random() * SAMPLE_THEMES.length)];
}

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
  const pixelSize = SLOT_PIXEL_SIZES[index % SLOT_PIXEL_SIZES.length];
  const label = (photo.alt_description || photo.description || "Random photo").trim();

  return {
    id: photo.id,
    name: label.length > 28 ? `${label.slice(0, 27).trimEnd()}…` : label,
    category: "Unsplash",
    recommendedPixelSize: pixelSize,
    imageUrl: photo.urls.regular,
    thumbnailUrl: photo.urls.small,
    attribution: {
      photographer: photo.user?.name ?? "Unknown photographer",
      photographerUrl: `${photo.user?.links?.html ?? "https://unsplash.com"}${UNSPLASH_UTM}`,
      photoUrl: `${photo.links?.html ?? "https://unsplash.com"}${UNSPLASH_UTM}`,
    },
  };
}

async function requestSamples(params: URLSearchParams, count: number): Promise<SampleImage[] | null> {
  const response = await fetch(`${UNSPLASH_RANDOM_PATH}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) return null;

  const samples = payload.filter(isUnsplashPhoto).slice(0, count).map(toSampleImage);
  return samples.length > 0 ? samples : null;
}

/**
 * Fetches a fresh random set of photos from Unsplash. Resolves to null when no
 * access key is configured, the request fails, or the payload is not usable, so
 * callers can keep showing the bundled samples.
 *
 * Nothing is cached: every call, including a browser reload, draws a new set.
 */
export async function fetchUnsplashSamples(count = 4): Promise<SampleImage[] | null> {
  const base = { count: String(count), orientation: "landscape" };
  const themed = new URLSearchParams({ ...base, query: pickTheme() });

  try {
    const samples = await requestSamples(themed, count);
    if (samples) return samples;

    // A theme can come back empty (or the request can be refused), so try once
    // more unthemed before handing back the bundled photos.
    return await requestSamples(new URLSearchParams(base), count);
  } catch {
    // No key configured, offline, or a non-JSON response (e.g. the dev
    // server's SPA fallback when the proxy is disabled).
    return null;
  }
}
