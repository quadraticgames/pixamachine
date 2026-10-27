import { useEffect, useRef, useState, useMemo } from "react";
import { CLASSIC_PALETTES } from "@/lib/palettes";
import { LoadingSpinner } from "./LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";

interface PixelatedImageProps {
  src: string;
  pixelSize: number;
  paletteId?: string;
  onCanvasRender?: (canvas: HTMLCanvasElement) => void;
}

// Cache for processed images
const processedImageCache = new Map<string, ImageData>();

// Helper function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

// Optimized color distance calculation
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const rmean = (rgb1[0] + rgb2[0]) / 2;
  const r = rgb1[0] - rgb2[0];
  const g = rgb1[1] - rgb2[1];
  const b = rgb1[2] - rgb2[2];
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
}

// Memoized palette RGB values
function usePaletteRgb(paletteId: string) {
  return useMemo(() => {
    const palette = CLASSIC_PALETTES.find(p => p.id === paletteId);
    if (!palette || palette.id === 'original') return null;
    return palette.colors.map(color => hexToRgb(color));
  }, [paletteId]);
}

// Efficient block processing function
function processImageBlock(
  sourceData: ImageData,
  x: number,
  y: number,
  blockSize: number,
  width: number
): [number, number, number, number] {
  let r = 0, g = 0, b = 0, a = 0;
  const data = sourceData.data;
  const maxX = Math.min(x + blockSize, width);
  const maxY = Math.min(y + blockSize, sourceData.height);
  let count = 0;

  for (let py = y; py < maxY; py++) {
    for (let px = x; px < maxX; px++) {
      const i = (py * width + px) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      a += data[i + 3];
      count++;
    }
  }

  return [
    Math.round(r / count),
    Math.round(g / count),
    Math.round(b / count),
    Math.round(a / count)
  ];
}

export function PixelatedImage({
  src,
  pixelSize,
  paletteId = 'original',
  onCanvasRender
}: PixelatedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const debouncedPixelSize = useDebounce(pixelSize, 150);
  const paletteRgb = usePaletteRgb(paletteId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const processImage = () => {
      const targetWidth = img.width;
      const targetHeight = img.height;
      
      setAspectRatio(targetHeight / targetWidth * 100);
      
      // Check cache first
      const cacheKey = `${src}-${debouncedPixelSize}-${paletteId}`;
      const cached = processedImageCache.get(cacheKey);
      if (cached) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.putImageData(cached, 0, 0);
        if (onCanvasRender) onCanvasRender(canvas);
        setIsProcessing(false);
        return;
      }

      // Set up canvases
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { alpha: true });
      if (!tempCtx) return;
      
      tempCanvas.width = targetWidth;
      tempCanvas.height = targetHeight;
      
      // Draw and process original image
      tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);

      // Apply color palette if needed
      if (paletteRgb) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          let minDistance = Infinity;
          let closestColor = paletteRgb[0];
          
          const rgb: [number, number, number] = [data[i], data[i + 1], data[i + 2]];
          
          for (const paletteColor of paletteRgb) {
            const distance = colorDistance(rgb, paletteColor);
            if (distance < minDistance) {
              minDistance = distance;
              closestColor = paletteColor;
            }
          }
          
          data[i] = closestColor[0];
          data[i + 1] = closestColor[1];
          data[i + 2] = closestColor[2];
        }
        tempCtx.putImageData(imageData, 0, 0);
      }

      // Create pixelation effect
      const blockSize = debouncedPixelSize;
      for (let y = 0; y < targetHeight; y += blockSize) {
        for (let x = 0; x < targetWidth; x += blockSize) {
          const [r, g, b, a] = processImageBlock(imageData, x, y, blockSize, targetWidth);
          ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }

      // Cache the result
      processedImageCache.set(cacheKey, ctx.getImageData(0, 0, targetWidth, targetHeight));
      
      // Limit cache size
      if (processedImageCache.size > 20) {
        const firstKey = processedImageCache.keys().next().value;
        processedImageCache.delete(firstKey);
      }

      if (onCanvasRender) {
        onCanvasRender(canvas);
      }

      setIsProcessing(false);
    };

    img.onload = processImage;
  }, [src, debouncedPixelSize, paletteId, paletteRgb, onCanvasRender]);

  return (
    <div className="relative w-full">
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <LoadingSpinner />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
}
