export type DitherType = 'none' | 'bayer4' | 'bayer8' | 'floyd' | 'atkinson';
export type PixelShape = 'square' | 'circle';

export interface PixelEngineOptions {
  pixelSize: number;
  paletteColors?: [number, number, number][] | null;
  ditherType: DitherType;
  ditherStrength: number; // 0 to 1
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  pixelShape: PixelShape;
  showScanlines: boolean;
  showGrid: boolean;
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16)
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

// Red-mean weighted color distance for human perception
export function colorDistanceSq(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (((512 + rmean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rmean) * db * db) >> 8);
}

// Find nearest color in palette
export function findNearestColor(
  r: number, g: number, b: number,
  palette: [number, number, number][]
): [number, number, number] {
  let minDistance = Infinity;
  let best = palette[0];
  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    const dist = colorDistanceSq(r, g, b, c[0], c[1], c[2]);
    if (dist < minDistance) {
      minDistance = dist;
      best = c;
      if (dist === 0) break;
    }
  }
  return best;
}

// Bayer 4x4 matrix
const BAYER_4: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

// Bayer 8x8 matrix
const BAYER_8: number[][] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

function clamp(val: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, val));
}

// Apply pre-processing: brightness, contrast, saturation
export function applyAdjustments(
  r: number, g: number, b: number,
  brightness: number,
  contrast: number,
  saturation: number
): [number, number, number] {
  // 1. Brightness (-100 to 100)
  if (brightness !== 0) {
    const bOffset = (brightness / 100) * 128;
    r = clamp(r + bOffset);
    g = clamp(g + bOffset);
    b = clamp(b + bOffset);
  }

  // 2. Contrast (-100 to 100)
  if (contrast !== 0) {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    r = clamp(factor * (r - 128) + 128);
    g = clamp(factor * (g - 128) + 128);
    b = clamp(factor * (b - 128) + 128);
  }

  // 3. Saturation (-100 to 100)
  if (saturation !== 0) {
    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
    const sFactor = 1 + saturation / 100;
    r = clamp(gray + (r - gray) * sFactor);
    g = clamp(gray + (g - gray) * sFactor);
    b = clamp(gray + (b - gray) * sFactor);
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
}

export interface RenderResult {
  width: number;
  height: number;
  gridCols: number;
  gridRows: number;
  pixelGridData: Uint8ClampedArray; // gridCols x gridRows RGBA
}

// Downsamples image into pixel grid with dithering & quantization
export function processToPixelGrid(
  sourceCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PixelEngineOptions
): RenderResult {
  const { pixelSize, paletteColors, ditherType, ditherStrength, brightness, contrast, saturation } = options;

  const cols = Math.max(1, Math.floor(width / pixelSize));
  const rows = Math.max(1, Math.floor(height / pixelSize));

  // Extract raw source image data
  const srcImageData = sourceCtx.getImageData(0, 0, width, height);
  const srcData = srcImageData.data;

  // Step 1: Compute block averages for each cell
  const gridR = new Float32Array(cols * rows);
  const gridG = new Float32Array(cols * rows);
  const gridB = new Float32Array(cols * rows);
  const gridA = new Float32Array(cols * rows);

  for (let gy = 0; gy < rows; gy++) {
    const yStart = gy * pixelSize;
    const yEnd = Math.min(yStart + pixelSize, height);

    for (let gx = 0; gx < cols; gx++) {
      const xStart = gx * pixelSize;
      const xEnd = Math.min(xStart + pixelSize, width);

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      let count = 0;

      for (let y = yStart; y < yEnd; y++) {
        const rowOffset = y * width;
        for (let x = xStart; x < xEnd; x++) {
          const idx = (rowOffset + x) * 4;
          rSum += srcData[idx];
          gSum += srcData[idx + 1];
          bSum += srcData[idx + 2];
          aSum += srcData[idx + 3];
          count++;
        }
      }

      const cellIdx = gy * cols + gx;
      if (count > 0) {
        let r = rSum / count;
        let g = gSum / count;
        let b = bSum / count;
        const a = aSum / count;

        if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
          const adj = applyAdjustments(r, g, b, brightness, contrast, saturation);
          r = adj[0];
          g = adj[1];
          b = adj[2];
        }

        gridR[cellIdx] = r;
        gridG[cellIdx] = g;
        gridB[cellIdx] = b;
        gridA[cellIdx] = a;
      }
    }
  }

  // Step 2: Dithering and Palette Quantization
  const outGrid = new Uint8ClampedArray(cols * rows * 4);

  if (!paletteColors || paletteColors.length === 0) {
    // Original colors without quantization
    for (let i = 0; i < cols * rows; i++) {
      const outIdx = i * 4;
      outGrid[outIdx] = clamp(Math.round(gridR[i]));
      outGrid[outIdx + 1] = clamp(Math.round(gridG[i]));
      outGrid[outIdx + 2] = clamp(Math.round(gridB[i]));
      outGrid[outIdx + 3] = clamp(Math.round(gridA[i]));
    }
  } else if (ditherType === 'bayer4' || ditherType === 'bayer8') {
    // Ordered Bayer Dithering
    const matrix = ditherType === 'bayer4' ? BAYER_4 : BAYER_8;
    const mSize = matrix.length;
    const scale = (ditherStrength * 64) / (mSize * mSize);

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const i = gy * cols + gx;
        const threshold = (matrix[gy % mSize][gx % mSize] - (mSize * mSize) / 2) * scale;

        const r = clamp(gridR[i] + threshold);
        const g = clamp(gridG[i] + threshold);
        const b = clamp(gridB[i] + threshold);

        const [nr, ng, nb] = findNearestColor(r, g, b, paletteColors);
        const outIdx = i * 4;
        outGrid[outIdx] = nr;
        outGrid[outIdx + 1] = ng;
        outGrid[outIdx + 2] = nb;
        outGrid[outIdx + 3] = clamp(Math.round(gridA[i]));
      }
    }
  } else if (ditherType === 'floyd' || ditherType === 'atkinson') {
    // Error Diffusion Dithering (Floyd-Steinberg or Atkinson)
    const errR = new Float32Array(gridR);
    const errG = new Float32Array(gridG);
    const errB = new Float32Array(gridB);
    const strength = ditherStrength;

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const i = gy * cols + gx;
        const r = clamp(errR[i]);
        const g = clamp(errG[i]);
        const b = clamp(errB[i]);

        const [nr, ng, nb] = findNearestColor(r, g, b, paletteColors);
        const outIdx = i * 4;
        outGrid[outIdx] = nr;
        outGrid[outIdx + 1] = ng;
        outGrid[outIdx + 2] = nb;
        outGrid[outIdx + 3] = clamp(Math.round(gridA[i]));

        const diffR = (r - nr) * strength;
        const diffG = (g - ng) * strength;
        const diffB = (b - nb) * strength;

        const distribute = (xOffset: number, yOffset: number, factor: number) => {
          const nx = gx + xOffset;
          const ny = gy + yOffset;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const ni = ny * cols + nx;
            errR[ni] += diffR * factor;
            errG[ni] += diffG * factor;
            errB[ni] += diffB * factor;
          }
        };

        if (ditherType === 'floyd') {
          // Floyd-Steinberg: 7/16, 3/16, 5/16, 1/16
          distribute(1, 0, 7 / 16);
          distribute(-1, 1, 3 / 16);
          distribute(0, 1, 5 / 16);
          distribute(1, 1, 1 / 16);
        } else {
          // Atkinson: 1/8 to 6 neighbors
          distribute(1, 0, 1 / 8);
          distribute(2, 0, 1 / 8);
          distribute(-1, 1, 1 / 8);
          distribute(0, 1, 1 / 8);
          distribute(1, 1, 1 / 8);
          distribute(0, 2, 1 / 8);
        }
      }
    }
  } else {
    // None (direct nearest color matching)
    for (let i = 0; i < cols * rows; i++) {
      const [nr, ng, nb] = findNearestColor(gridR[i], gridG[i], gridB[i], paletteColors);
      const outIdx = i * 4;
      outGrid[outIdx] = nr;
      outGrid[outIdx + 1] = ng;
      outGrid[outIdx + 2] = nb;
      outGrid[outIdx + 3] = clamp(Math.round(gridA[i]));
    }
  }

  return {
    width,
    height,
    gridCols: cols,
    gridRows: rows,
    pixelGridData: outGrid
  };
}

// Renders the pixel grid onto a target canvas with options (square/bead, scanlines, grid)
export function renderPixelGridToCanvas(
  targetCanvas: HTMLCanvasElement,
  result: RenderResult,
  options: PixelEngineOptions
): void {
  const { width, height, gridCols, gridRows, pixelGridData } = result;
  const { pixelSize, pixelShape, showScanlines, showGrid } = options;

  targetCanvas.width = width;
  targetCanvas.height = height;
  const ctx = targetCanvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  if (pixelShape === 'circle') {
    // Bead / Circle Mode
    const radius = Math.max(1, (pixelSize / 2) * 0.92);
    for (let gy = 0; gy < gridRows; gy++) {
      const cy = gy * pixelSize + pixelSize / 2;
      for (let gx = 0; gx < gridCols; gx++) {
        const i = (gy * gridCols + gx) * 4;
        const a = pixelGridData[i + 3] / 255;
        if (a <= 0) continue;

        ctx.fillStyle = `rgba(${pixelGridData[i]}, ${pixelGridData[i + 1]}, ${pixelGridData[i + 2]}, ${a})`;
        const cx = gx * pixelSize + pixelSize / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Standard Square Mode
    for (let gy = 0; gy < gridRows; gy++) {
      const y = gy * pixelSize;
      const bH = Math.min(pixelSize, height - y);

      for (let gx = 0; gx < gridCols; gx++) {
        const x = gx * pixelSize;
        const bW = Math.min(pixelSize, width - x);
        const i = (gy * gridCols + gx) * 4;
        const a = pixelGridData[i + 3] / 255;
        if (a <= 0) continue;

        ctx.fillStyle = `rgba(${pixelGridData[i]}, ${pixelGridData[i + 1]}, ${pixelGridData[i + 2]}, ${a})`;
        ctx.fillRect(x, y, bW, bH);
      }
    }
  }

  // Optional Pixel Grid Overlay
  if (showGrid && pixelSize >= 4) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = 0; gx <= gridCols; gx++) {
      const x = Math.min(gx * pixelSize + 0.5, width);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let gy = 0; gy <= gridRows; gy++) {
      const y = Math.min(gy * pixelSize + 0.5, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  // Optional CRT Scanlines Effect
  if (showScanlines) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 2);
    }
  }
}

// Generate an exact 1x or integer-scaled canvas for export
export function generateExportCanvas(
  result: RenderResult,
  scaleFactor: number // 1 for native 1x, or 2, 4, 8, etc.
): HTMLCanvasElement {
  const { gridCols, gridRows, pixelGridData } = result;
  const canvas = document.createElement('canvas');
  canvas.width = gridCols * scaleFactor;
  canvas.height = gridRows * scaleFactor;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;

  if (scaleFactor === 1) {
    // Exact 1x raw pixel canvas
    const imgData = ctx.createImageData(gridCols, gridRows);
    imgData.data.set(pixelGridData);
    ctx.putImageData(imgData, 0, 0);
  } else {
    // Nearest-neighbor upscaled
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridCols;
    tempCanvas.height = gridRows;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      const imgData = tempCtx.createImageData(gridCols, gridRows);
      imgData.data.set(pixelGridData);
      tempCtx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }
  }

  return canvas;
}
