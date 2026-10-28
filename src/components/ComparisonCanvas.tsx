import { useEffect, useRef, useState, useCallback } from "react";
import { SplitSquareVertical } from "lucide-react";
import { 
  type PixelEngineOptions, 
  type RenderResult, 
  processToPixelGrid, 
  renderPixelGridToCanvas 
} from "@/lib/pixelEngine";
import { LoadingSpinner } from "./LoadingSpinner";

interface ComparisonCanvasProps {
  src: string;
  engineOptions: PixelEngineOptions;
  onCanvasReady?: (canvas: HTMLCanvasElement, renderResult: RenderResult) => void;
}

export function ComparisonCanvas({
  src,
  engineOptions,
  onCanvasReady
}: ComparisonCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 to 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Mouse move & touch handlers for split dragging
  const handleSplitMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSplitPos(pos);
  }, []);

  useEffect(() => {
    if (!isDraggingSplit) return;

    const onMouseMove = (e: MouseEvent) => handleSplitMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      // Keep the page from scrolling underneath the finger mid-drag
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) handleSplitMove(e.touches[0].clientX);
    };
    const onMouseUp = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDraggingSplit, handleSplitMove]);

  // Process and render pixel canvas
  useEffect(() => {
    let isCancelled = false;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      if (isCancelled) return;
      originalImageRef.current = img;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Offscreen canvas to read original pixels
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, w, h);

      // Process through pixel engine
      const result = processToPixelGrid(offCtx, w, h, engineOptions);

      if (pixelCanvasRef.current) {
        renderPixelGridToCanvas(pixelCanvasRef.current, result, engineOptions);
        if (onCanvasReady) {
          onCanvasReady(pixelCanvasRef.current, result);
        }
      }

      setIsProcessing(false);
    };

    return () => {
      isCancelled = true;
    };
  }, [src, engineOptions, onCanvasReady]);

  return (
    <div className="space-y-3">
      {/* Main Canvas Presentation Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c12]/90 shadow-2xl backdrop-blur-sm select-none min-h-[240px] sm:min-h-[340px]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      >
        {isProcessing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
            <LoadingSpinner />
            <span className="text-white text-xs font-mono mt-2 tracking-wide">Processing pixels...</span>
          </div>
        )}

        {/* Interactive Split Slider */}
        <div className="relative w-full flex items-center justify-center overflow-auto p-3 sm:p-4">
          <div className="relative max-w-full">
            {/* Underlying Original Image. The height cap subtracts the header,
                gaps, footer and caption (~16rem) rather than a flat 65vh, so
                the editor fits the viewport instead of growing a scrollbar. */}
            <img
              src={src}
              alt="Original"
              className="block max-w-full max-h-[46vh] object-contain rounded-lg sm:max-h-[calc(100vh-16rem)]"
              style={{ imageRendering: 'auto' }}
            />

            {/* Overlaid Pixel Canvas clipped by split position */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `inset(0 0 0 ${splitPos}%)`
              }}
            >
              <canvas
                ref={pixelCanvasRef}
                className="block w-full h-full object-contain rounded-lg"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Split Draggable Handle Line */}
            {/* A 44px-wide hit strip on phones: the visible line stays 3px, but
                the finger has something to actually grab, and touch-action
                keeps the drag from scrolling the page */}
            <div 
              className="absolute top-0 bottom-0 z-20 flex w-11 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center group sm:w-8"
              style={{ left: `${splitPos}%` }}
              onMouseDown={() => setIsDraggingSplit(true)}
              onTouchStart={() => setIsDraggingSplit(true)}
            >
              {/* Vertical line with glow */}
              <div className="w-[3px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] group-hover:bg-purple-300" />
              {/* Circular Grabber */}
              <div className="absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#12131b] text-white shadow-lg transition-transform group-hover:scale-105 sm:h-8 sm:w-8">
                <SplitSquareVertical className="w-4 h-4 text-purple-400" />
              </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute top-2 left-2 pointer-events-none z-10 sm:top-4 sm:left-4">
              <span className="rounded-md border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                Original
              </span>
            </div>
            <div className="absolute top-2 right-2 pointer-events-none z-10 sm:top-4 sm:right-4">
              <span className="rounded-md border border-purple-400/40 bg-purple-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-purple-200 shadow-sm backdrop-blur-md sm:px-2.5 sm:py-1 sm:text-[11px]">
                Pixel Art
              </span>
            </div>
          </div>
        </div>

        {/* Footer info badge in canvas */}
        {imageSize.width > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t border-white/10 bg-black/60 px-3 py-2 font-mono text-[10px] text-white/60 sm:px-4 sm:text-[11px]">
            <span>Source: {imageSize.width} × {imageSize.height}px</span>
            <span>
              Grid: {Math.max(1, Math.floor(imageSize.width / engineOptions.pixelSize))} × {Math.max(1, Math.floor(imageSize.height / engineOptions.pixelSize))} blocks
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
