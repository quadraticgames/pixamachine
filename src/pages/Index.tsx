import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ImageUploader";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { EditorPanel } from "@/components/EditorPanel";
import { ExportToolbar } from "@/components/ExportToolbar";
import { CLASSIC_PALETTES, type Palette } from "@/lib/palettes";
import { 
  type PixelEngineOptions, 
  type RenderResult, 
  hexToRgb 
} from "@/lib/pixelEngine";
import { Keyboard, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DEFAULT_OPTIONS: PixelEngineOptions = {
  pixelSize: 8,
  paletteColors: null,
  ditherType: 'none',
  ditherStrength: 1.0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  pixelShape: 'square',
  showScanlines: false,
  showGrid: false,
};

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('original');
  const [engineOptions, setEngineOptions] = useState<PixelEngineOptions>(DEFAULT_OPTIONS);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const currentPalette = CLASSIC_PALETTES.find(p => p.id === selectedPaletteId) || CLASSIC_PALETTES[0];

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement, result: RenderResult) => {
    setProcessedCanvas(canvas);
    setRenderResult(result);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0d14] text-white selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 flex flex-col min-h-screen justify-between">
        <div className="space-y-8">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl leading-tight font-bold font-pixel tracking-wide text-white group-hover:text-purple-300 transition-colors">
                    ArtPixelfy
                  </h1>
                  <p className="text-[11px] leading-tight text-white/50 font-sans">
                    Retro Console & Aesthetic Pixel Art Studio
                  </p>
                </div>
              </a>
            </div>

            {/* Header Action Items */}
            <div className="flex items-center gap-2">
              {/* Keyboard Shortcuts Dialog */}
              <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Shortcuts</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-neutral-900 border-white/20 text-white font-sans max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                      <Keyboard className="w-4 h-4 text-purple-400" />
                      Keyboard Shortcuts
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 text-xs text-white/80 pt-2">
                    <div className="flex items-center justify-between p-2 rounded-md bg-white/5">
                      <span>Paste image from clipboard</span>
                      <kbd className="px-2 py-0.5 rounded-md bg-black border border-white/20 font-mono text-[11px]">Ctrl + V</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-white/5">
                      <span>Drag split divider</span>
                      <span className="text-white/60">Mouse / Touch</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <a
                href="https://github.com/quadraticgames/pixamachine"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
              >
                v2.0
              </a>
            </div>
          </header>

          {/* Main Content Area */}
          {!image ? (
            <div className="py-6">
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
                <h2 className="text-2xl sm:text-3xl leading-tight font-bold font-pixel tracking-wide text-white">
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
              {/* Canvas, with every image option in the tabbed rail beside it */}
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

              {/* Bottom Action / Export Bar */}
              <ExportToolbar
                processedCanvas={processedCanvas}
                renderResult={renderResult}
                currentPalette={currentPalette}
                onUploadNew={() => fileInputRef.current?.click()}
              />

              {/* Hidden file input for "Upload New Image" */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>
          )}
        </div>

        {/* Studio Footer */}
        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-sans">
          <div className="flex items-center gap-2">
            <span>ArtPixelfy Studio v2.0</span>
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
