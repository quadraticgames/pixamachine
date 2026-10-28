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
import { Github, Shuffle } from "lucide-react";

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
  const [samplesRequest, setSamplesRequest] = useState<number>(0);

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

  // Handle image upload from file or URL
  const handleImageUpload = useCallback((fileOrUrl: File | string, presetOptions?: { paletteId?: string; pixelSize?: number }) => {
    if (typeof fileOrUrl === 'string') {
      setImage(fileOrUrl);
      if (presetOptions?.paletteId) setSelectedPaletteId(presetOptions.paletteId);
      if (presetOptions?.pixelSize) {
        setEngineOptions(prev => ({ ...prev, pixelSize: presetOptions.pixelSize || 8 }));
      }
      toast.success("Sample loaded successfully!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
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
  // and the Unsplash samples — while keeping the palette and engine settings
  // already dialled in for the next image.
  const handleNewImage = useCallback(() => {
    setImage(null);
    setProcessedCanvas(null);
    // Ask the upload screen for a fresh set of Unsplash photos.
    setSamplesRequest((count) => count + 1);
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
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5 group">
                <PixaMachineMark className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" />
                <div>
                  <h1 className="text-xl sm:text-2xl leading-tight font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                    Pixa Machine
                  </h1>
                  <p className="text-[11px] leading-tight text-white/50 font-sans">
                    Retro Console & Aesthetic Pixel Art Studio
                  </p>
                </div>
              </a>
            </div>

            {/* Header Action Items */}
            <div className="flex items-center gap-2">
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
                      className="flex h-8 w-8 items-center justify-center p-0 text-xs font-medium"
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

              <HeaderTooltip
                label="Source code"
                hint="Open the Pixa Machine repository on GitHub in a new tab."
              >
                <a
                  href="https://github.com/quadraticgames/pixamachine"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Source code on GitHub"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
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

              <ImageUploader
                onUpload={handleImageUpload}
                refreshSamples={samplesRequest > 0}
              />
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
        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-sans">
          <div className="flex items-center gap-2">
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
