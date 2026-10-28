import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ImageUploader";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { EditorPanel } from "@/components/EditorPanel";
import { ExportToolbar } from "@/components/ExportToolbar";
import { PixaMachineMark } from "@/components/PixaMachineMark";
import { CLASSIC_PALETTES, type Palette } from "@/lib/palettes";
import { Button } from "@/components/ui/button";
import { HeaderTooltip } from "@/components/HeaderTooltip";
import { 
  type DitherType,
  type PixelEngineOptions, 
  hexToRgb 
} from "@/lib/pixelEngine";
import { Github, Maximize, Minimize, Shuffle } from "lucide-react";

const DEFAULT_OPTIONS: PixelEngineOptions = {
  pixelSize: 8,
  paletteColors: null,
  ditherType: 'none',
  ditherStrength: 1.0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  pixelShape: 'square',
  showScanlines: false,
  showGrid: false,
};

// Randomize draws from small, deliberately sane sets so every roll produces a
// usable image rather than an extreme one.
const RANDOM_PIXEL_SIZES = [4, 6, 8, 10, 12, 16];
const RANDOM_DITHER_TYPES: DitherType[] = ['none', 'bayer4', 'bayer8', 'floyd', 'atkinson'];

// Only palettes with a fixed colour list: "Original Colors" has none, which
// would hide the .hex export in the header. Randomize should always land on a
// palette you can actually export.
const RANDOM_PALETTES = CLASSIC_PALETTES.filter((palette) => palette.colors.length > 0);

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * Page-level full screen, i.e. what pressing F11 does in Chrome: the browser
 * chrome disappears and the editor fills the display. Esc still exits, so the
 * toggle only needs to keep its own label in sync.
 */
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // iOS Safari only allows full screen on video elements, so the control is
  // hidden there rather than shown as a dead button.
  const isSupported =
    typeof document !== "undefined" && document.fullscreenEnabled === true;

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    // Fires when the browser refuses the request (an embedded frame without
    // allowfullscreen, a policy, or a denied permission).
    const refuse = () => toast.error("This browser wouldn't switch to full screen.");

    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("fullscreenerror", refuse);
    sync();

    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("fullscreenerror", refuse);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast.error("This browser wouldn't switch to full screen.");
    }
  }, []);

  return { isFullscreen, isSupported, toggleFullscreen };
}

/** Integer between min and max inclusive, snapped to step. */
const pickInt = (min: number, max: number, step = 1): number => {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
};

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('original');
  const [engineOptions, setEngineOptions] = useState<PixelEngineOptions>(DEFAULT_OPTIONS);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const { isFullscreen, isSupported: canGoFullscreen, toggleFullscreen } = useFullscreen();

  // Derive palette RGB colors whenever selected palette changes
  useEffect(() => {
    const pal = CLASSIC_PALETTES.find(p => p.id === selectedPaletteId);
    if (!pal || pal.id === 'original' || pal.colors.length === 0) {
      setEngineOptions(prev => ({ ...prev, paletteColors: null }));
    } else {
      const rgbList = pal.colors.map(hexToRgb);
      setEngineOptions(prev => ({ ...prev, paletteColors: rgbList }));
    }
  }, [selectedPaletteId]);

  // Handle image upload from file or URL. Every new image starts on Original
  // Colors, so a palette picked for the previous photo never carries over; the
  // samples only preset a pixel size.
  const handleImageUpload = useCallback((fileOrUrl: File | string, presetOptions?: { pixelSize?: number }) => {
    if (typeof fileOrUrl === 'string') {
      setImage(fileOrUrl);
      setSelectedPaletteId('original');
      if (presetOptions?.pixelSize) {
        setEngineOptions(prev => ({ ...prev, pixelSize: presetOptions.pixelSize || 8 }));
      }
      toast.success("Sample loaded successfully!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setSelectedPaletteId('original');
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(fileOrUrl);
  }, []);

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageUpload(file);
            toast.success("Pasted image from clipboard!");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageUpload]);

  // Bringing in an image swaps the whole view, so start the editor from the top
  // rather than inheriting the scroll position of the upload screen.
  useEffect(() => {
    if (image) window.scrollTo(0, 0);
  }, [image]);

  // "New Image" returns to the start screen — the drop zone, the browse button
  // and a freshly drawn set of Unsplash samples, since the uploader mounts
  // again and fetches on mount.
  const handleNewImage = useCallback(() => {
    setImage(null);
    setProcessedCanvas(null);
  }, []);

  // Roll a fresh look for the image already loaded: palette, pixel size,
  // dithering, tone and overlays all change in one go.
  const handleRandomize = useCallback(() => {
    const palette = pick(RANDOM_PALETTES);

    setSelectedPaletteId(palette.id);
    setEngineOptions((prev) => ({
      ...prev,
      pixelSize: pick(RANDOM_PIXEL_SIZES),
      ditherType: pick(RANDOM_DITHER_TYPES),
      ditherStrength: pickInt(60, 150, 10) / 100,
      brightness: pickInt(-20, 20, 2),
      contrast: pickInt(-20, 30, 2),
      saturation: pickInt(-20, 40, 5),
      // Half the rolls keep the colors as-is; the rest rotate by a gentle amount.
      hue: pick([0, 0, pickInt(-60, 60, 15), pickInt(-60, 60, 15)]),
      pixelShape: pick(['square', 'circle'] as const),
      showScanlines: Math.random() < 0.35,
      showGrid: Math.random() < 0.2,
    }));

    toast.success(`Randomized — ${palette.name}`);
  }, []);

  const currentPalette = CLASSIC_PALETTES.find(p => p.id === selectedPaletteId) || CLASSIC_PALETTES[0];

  // The export only needs the rendered canvas, which already carries the
  // overlays — that is the "current view" the download writes out.
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setProcessedCanvas(canvas);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0d14] text-white selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-6 flex flex-col min-h-screen justify-between">
        <div className="space-y-5">
          {/* Header */}
          {/* On phones the actions get their own row under the brand, so the
              icon buttons stay thumb-sized instead of being squeezed */}
          <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5 group">
                <PixaMachineMark className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" />
                <div>
                  <h1 className="text-xl sm:text-2xl leading-tight font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                    Pixa Machine
                  </h1>
                  <p className="text-[10px] leading-tight text-white/50 font-sans sm:text-[11px]">
                    Retro Console & Aesthetic Pixel Art Studio
                  </p>
                </div>
              </a>
            </div>

            {/* Header Action Items */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              {/* Image actions live up here so the canvas keeps the vertical
                  room they used to take */}
              {image && (
                <>
                  <HeaderTooltip
                    label="Randomize"
                    hint="Roll a new palette, pixel size, dither, tone and overlays for this image."
                  >
                    <Button
                      variant="outline"
                      onClick={handleRandomize}
                      aria-label="Randomize every setting"
                      className="flex h-10 w-10 items-center justify-center p-0 text-xs font-medium sm:h-8 sm:w-8"
                    >
                      <Shuffle className="h-3.5 w-3.5 text-purple-400" />
                    </Button>
                  </HeaderTooltip>

                  <ExportToolbar
                    processedCanvas={processedCanvas}
                    currentPalette={currentPalette}
                    onUploadNew={handleNewImage}
                  />
                </>
              )}

              {canGoFullscreen && (
                <HeaderTooltip
                  label={isFullscreen ? "Exit full screen" : "Full screen"}
                  hint="Fill the screen with the editor, exactly like pressing F11. Esc brings the browser back."
                >
                  <Button
                    variant="outline"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
                    aria-pressed={isFullscreen}
                    className="flex h-10 w-10 items-center justify-center p-0 text-xs font-medium sm:h-8 sm:w-8"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-3.5 w-3.5 text-purple-400" />
                    ) : (
                      <Maximize className="h-3.5 w-3.5 text-purple-400" />
                    )}
                  </Button>
                </HeaderTooltip>
              )}

              <HeaderTooltip
                label="Source code"
                hint="Open the Pixa Machine repository on GitHub in a new tab."
              >
                <a
                  href="https://github.com/quadraticgames/pixamachine"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Source code on GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white sm:h-8 sm:w-8"
                >
                  <Github className="w-4 h-4" />
                </a>
              </HeaderTooltip>
            </div>
          </header>

          {/* Main Content Area */}
          {!image ? (
            <div className="pb-3">
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-5">
                <h2 className="text-2xl sm:text-3xl leading-tight font-bold tracking-tight text-white">
                  Convert Any Photo Into Iconic Retro Pixel Art
                </h2>
                <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-white/60 font-sans">
                  Quantize with authentic Game Boy, NES, CGA, PICO-8, and C64 color palettes using ordered Bayer & Floyd-Steinberg dithering algorithms.
                </p>
              </div>

              <ImageUploader onUpload={handleImageUpload} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Canvas with every image option in the tabbed rail beside it */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
                <ComparisonCanvas
                  src={image}
                  engineOptions={engineOptions}
                  onCanvasReady={handleCanvasReady}
                />

                <EditorPanel
                  selectedPalette={selectedPaletteId}
                  onSelectPalette={setSelectedPaletteId}
                  options={engineOptions}
                  onChange={setEngineOptions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Studio Footer */}
        <footer className="mt-12 border-t border-white/10 pt-5 pb-[env(safe-area-inset-bottom)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-[11px] text-white/50 font-sans sm:pt-6 sm:text-left sm:text-xs">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>Pixa Machine Studio v2.0</span>
            <span>•</span>
            <span>Client-side, privacy-first processing</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://quadraticgames.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <span>Built by Quadratic Games</span>
              <img
                src="/images/quadratic-logo.png"
                alt="Quadratic Games Logo"
                className="h-5 opacity-80 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
