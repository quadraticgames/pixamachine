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
import { UploadCloud, Clipboard } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (fileOrUrl: File | string, presetOptions?: { pixelSize?: number }) => void;
}

export const ImageUploader = ({ onUpload }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  // Null while the first request is in flight. Starting on the built-in SVG
  // samples made them flash on every load, since they render instantly and are
  // replaced a moment later by the photos.
  const [samples, setSamples] = useState<SampleImage[] | null>(null);

  // Every mount draws a new set: a reload, and returning here via New Image,
  // both go back out to Unsplash. The built-in samples are only a fallback for
  // a failed request, so they never appear on a normal load.
  useEffect(() => {
    let isCancelled = false;

    fetchUnsplashSamples(4).then((fetched) => {
      if (isCancelled) return;
      setSamples(fetched ?? FALLBACK_SAMPLE_IMAGES);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const isLoadingSamples = samples === null;
  // Live results come from the API; the bundled ones ship with the app and
  // only appear when the request failed.
  const hasLiveSamples = samples?.some((sample) => sample.attribution && !sample.bundled) ?? false;
  const hasBundledSamples = samples?.some((sample) => sample.bundled) ?? false;

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
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Main Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative h-[180px] sm:h-[207px] w-full rounded-2xl border border-dashed transition-all duration-300 ease-out cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4 sm:p-5 text-center select-none backdrop-blur-md",
          isDragging 
            ? "border-purple-400/60 bg-purple-500/[0.08] scale-[1.005] shadow-[0_0_28px_-6px_rgba(168,85,247,0.5)]" 
            : "border-white/10 bg-white/[0.02] hover:border-purple-400/40 hover:bg-white/[0.04] shadow-sm"
        )}
      >
        <input {...getInputProps()} />

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-3.5">
          <div className="w-14 h-14 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-[16px] leading-snug font-bold text-white tracking-wide">
              Drop your image here, or <span className="text-purple-400 underline underline-offset-4">browse</span>
            </h3>
            <p className="text-[11px] text-white/60 font-sans">
              Supports PNG, JPG, WEBP, and GIF (up to 20MB)
            </p>
          </div>

          {/* Keyboard paste tip is desktop-only; phones have no Ctrl key */}
          <div className="hidden items-center gap-2 pt-2 sm:flex">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-white/10 text-white/80 border border-white/15">
              <Clipboard className="w-3 h-3 text-purple-300" />
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/20 text-white font-mono">Ctrl+V</kbd> to paste
            </span>
          </div>
        </div>
      </div>

      {/* Or pick a sample image */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Or try with a sample image
          </span>
          <span className="text-[11px] text-white/50">
            {isLoadingSamples
              ? "Loading random photos…"
              : hasLiveSamples
                ? "Random from Unsplash"
                : hasBundledSamples
                  ? "Bundled Unsplash photos"
                  : "One-click demo"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Placeholder cards hold the grid's shape while the photos load, so
              nothing shifts when they arrive */}
          {isLoadingSamples &&
            Array.from({ length: 4 }, (_, i) => (
              <div
                key={`sample-skeleton-${i}`}
                aria-hidden="true"
                className="flex flex-col space-y-2 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-2"
              >
                <div className="h-[86px] w-full animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.05]" />
                {/* Same height as the photographer credit line it stands in for */}
                <div className="h-[15px] w-20 animate-pulse rounded-full bg-white/[0.06]" />
              </div>
            ))}

          {samples?.map((sample) => (
            <div
              key={sample.id}
              className="group relative flex flex-col space-y-2 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-lg"
            >
              <button
                type="button"
                onClick={() => onUpload(sample.imageUrl, {
                  pixelSize: sample.recommendedPixelSize
                })}
                className="flex flex-col space-y-2 text-left"
              >
                {/* Image preview thumb */}
                <div className="relative h-[86px] w-full overflow-hidden rounded-lg border border-white/[0.06] bg-[#0b0c12]">
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

        {(hasLiveSamples || hasBundledSamples) && (
          <p className="px-1 text-[10px] text-white/35">
            Photos from{" "}
            <a
              href={UNSPLASH_HOME_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-purple-300 transition-colors"
            >
              Unsplash
            </a>
            {hasLiveSamples ? " — a new theme each visit." : "."}
          </p>
        )}
      </div>
    </div>
  );
};
