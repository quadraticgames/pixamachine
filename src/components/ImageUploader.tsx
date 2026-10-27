import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FALLBACK_SAMPLE_IMAGES,
  UNSPLASH_HOME_URL,
  fetchUnsplashSamples,
  type SampleImage
} from "@/lib/samples";
import { UploadCloud, Sparkles, Clipboard, ArrowRight } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (fileOrUrl: File | string, presetOptions?: { paletteId?: string; pixelSize?: number }) => void;
}

export const ImageUploader = ({ onUpload }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [samples, setSamples] = useState<SampleImage[]>(FALLBACK_SAMPLE_IMAGES);
  const [isLoadingSamples, setIsLoadingSamples] = useState(true);

  // Swap in a random set of Unsplash photos when they arrive; the built-in
  // samples stay on screen until then, and remain if the request fails.
  useEffect(() => {
    let isCancelled = false;

    fetchUnsplashSamples(4).then((fetched) => {
      if (isCancelled) return;
      if (fetched) setSamples(fetched);
      setIsLoadingSamples(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const hasUnsplashSamples = samples.some((sample) => sample.attribution);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WEBP, GIF)");
        return;
      }

      onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Main Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative h-[240px] sm:h-[280px] w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 text-center select-none backdrop-blur-md",
          isDragging 
            ? "border-purple-400 bg-purple-950/40 scale-[1.01] shadow-[0_0_30px_rgba(168,85,247,0.3)]" 
            : "border-white/20 bg-black/40 hover:border-purple-400/70 hover:bg-black/50 shadow-xl"
        )}
      >
        <input {...getInputProps()} />

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg leading-snug font-bold text-white tracking-wide">
              Drop your image here, or <span className="text-purple-400 underline underline-offset-4">browse</span>
            </h3>
            <p className="text-xs text-white/60 font-sans">
              Supports PNG, JPG, WEBP, and GIF (up to 20MB)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-white/10 text-white/80 border border-white/15">
              <Clipboard className="w-3 h-3 text-purple-300" />
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/20 text-white font-mono">Ctrl+V</kbd> to paste
            </span>
          </div>
        </div>
      </div>

      {/* Or Select Sample Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Or try with a sample preset
          </span>
          <span className="text-[11px] text-white/50">
            {isLoadingSamples
              ? "Loading random photos…"
              : hasUnsplashSamples
                ? "Random from Unsplash"
                : "One-click demo"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="group relative rounded-xl overflow-hidden border border-white/15 bg-black/40 hover:border-purple-400 hover:scale-[1.02] transition-all p-2.5 flex flex-col space-y-2.5 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => onUpload(sample.imageUrl, {
                  paletteId: sample.recommendedPalette,
                  pixelSize: sample.recommendedPixelSize
                })}
                className="flex flex-col space-y-2 text-left"
              >
                {/* Image preview thumb */}
                <div className="w-full h-24 rounded-lg overflow-hidden bg-neutral-900 border border-black/40 relative">
                  <img
                    src={sample.thumbnailUrl ?? sample.imageUrl}
                    alt={sample.name}
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/70 text-white/80">
                    {sample.category}
                  </span>
                </div>

                {/* Title & subtitle */}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {sample.name}
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Unsplash requires crediting the photographer */}
              {sample.attribution && (
                <a
                  href={sample.attribution.photographerUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Photo by ${sample.attribution.photographer} on Unsplash`}
                  className="block w-full truncate text-[10px] text-white/40 hover:text-purple-300 transition-colors"
                >
                  Photo by {sample.attribution.photographer}
                </a>
              )}
            </div>
          ))}
        </div>

        {hasUnsplashSamples && (
          <p className="px-1 text-[10px] text-white/35">
            Photos from{" "}
            <a
              href={UNSPLASH_HOME_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-purple-300 transition-colors"
            >
              Unsplash
            </a>{" "}
            — a fresh random set each session.
          </p>
        )}
      </div>
    </div>
  );
};
