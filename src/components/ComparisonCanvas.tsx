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
      if (e.touches.length > 0) handleSplitMove(e.touches[0].clientX);
    };
    const onMouseUp = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
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
        className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-neutral-950/80 shadow-2xl backdrop-blur-sm select-none"
        style={{
          minHeight: '340px',
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
        <div className="relative w-full flex items-center justify-center overflow-auto p-3">
          <div className="relative max-w-full">
            {/* Underlying Original Image */}
            <img
              src={src}
              alt="Original"
              className="block max-w-full max-h-[65vh] object-contain rounded-lg"
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
            <div 
              className="absolute top-0 bottom-0 z-20 cursor-ew-resize flex items-center justify-center group"
              style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
              onMouseDown={() => setIsDraggingSplit(true)}
              onTouchStart={() => setIsDraggingSplit(true)}
            >
              {/* Vertical line with glow */}
              <div className="w-[3px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] group-hover:bg-purple-300" />
              {/* Circular Grabber */}
              <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-900 border-2 border-white shadow-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                <SplitSquareVertical className="w-4 h-4 text-purple-400" />
              </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute top-3 left-3 pointer-events-none z-10">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider font-semibold uppercase bg-black/75 border border-white/20 text-white shadow-md">
                Original
              </span>
            </div>
            <div className="absolute top-3 right-3 pointer-events-none z-10">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider font-semibold uppercase bg-purple-900/80 border border-purple-400 text-purple-200 shadow-md">
                Pixel Art
              </span>
            </div>
          </div>
        </div>

        {/* Footer info badge in canvas */}
        {imageSize.width > 0 && (
          <div className="px-3 py-1.5 border-t border-white/10 bg-black/60 flex items-center justify-between text-[11px] text-white/60 font-mono">
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
