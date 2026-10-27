import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Copy, 
  Download, 
  Upload, 
  Check, 
  Palette as PaletteIcon,
  Sparkles,
  ArrowDownToLine,
  FileCode
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  type RenderResult, 
  generateExportCanvas 
} from "@/lib/pixelEngine";
import { type Palette } from "@/lib/palettes";

interface ExportToolbarProps {
  processedCanvas: HTMLCanvasElement | null;
  renderResult: RenderResult | null;
  currentPalette: Palette;
  onUploadNew: () => void;
}

export function ExportToolbar({
  processedCanvas,
  renderResult,
  currentPalette,
  onUploadNew
}: ExportToolbarProps) {
  const [copied, setCopied] = useState<boolean>(false);

  // 1. One-click Copy to System Clipboard
  const handleCopyClipboard = async () => {
    if (!processedCanvas) {
      toast.error("No pixel art ready to copy");
      return;
    }

    try {
      processedCanvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image data");
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        toast.success("Pixel art copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch (err) {
      toast.error("Clipboard copy failed. Try downloading instead.");
    }
  };

  // 2. Download at chosen scale factor
  const handleDownload = (scaleFactor: number | 'screen') => {
    if (!processedCanvas) {
      toast.error("No image to download");
      return;
    }

    let downloadCanvas: HTMLCanvasElement;
    let fileName = `pixa-machine-${currentPalette.id}`;

    if (scaleFactor === 'screen' || !renderResult) {
      downloadCanvas = processedCanvas;
      fileName += '-screen.png';
    } else {
      downloadCanvas = generateExportCanvas(renderResult, scaleFactor);
      if (scaleFactor === 1) {
        fileName += `-${renderResult.gridCols}x${renderResult.gridRows}-1x.png`;
      } else {
        fileName += `-${scaleFactor}x.png`;
      }
    }

    try {
      const dataUrl = downloadCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      toast.success(`Downloaded pixel art (${downloadCanvas.width} × ${downloadCanvas.height}px)`);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  // 3. Export Palette as .hex or .gpl text file
  const handleExportPalette = () => {
    if (!currentPalette.colors || currentPalette.colors.length === 0) {
      toast.info("Original image uses full 24-bit dynamic colors");
      return;
    }

    const hexContent = currentPalette.colors.join('\n');
    const blob = new Blob([hexContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${currentPalette.id}-palette.hex`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${currentPalette.name} palette (.hex)`);
  };

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 p-4 bg-black/40 border border-white/15 rounded-xl backdrop-blur-md">
      {/* Upload New Button */}
      <Button
        variant="outline"
        onClick={onUploadNew}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs shadow-none active:shadow-none"
      >
        <Upload className="w-3.5 h-3.5" />
        New Image
      </Button>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Export Palette Button */}
        {currentPalette.colors.length > 0 && (
          <Button
            variant="outline"
            onClick={handleExportPalette}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/15 text-white/80 border-white/15 text-xs shadow-none active:shadow-none"
            title="Download hex palette file"
          >
            <PaletteIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Palette</span>
          </Button>
        )}

        {/* Copy to Clipboard */}
        <Button
          variant="outline"
          onClick={handleCopyClipboard}
          className={`flex items-center gap-1.5 text-xs transition-colors shadow-none active:shadow-none ${
            copied
              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </Button>

        {/* Download Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 shadow-lg border-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download
              <ArrowDownToLine className="w-3 h-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-900 border-white/20 text-white font-sans text-xs min-w-[210px]">
            <DropdownMenuLabel className="text-white/60 text-[10px] uppercase font-mono tracking-wider">
              Download Scale
            </DropdownMenuLabel>
            
            {renderResult && (
              <>
                <DropdownMenuItem 
                  onClick={() => handleDownload(1)}
                  className="cursor-pointer hover:bg-white/10 flex justify-between"
                >
                  <span className="font-semibold text-purple-300">1× Native Pixel Scale</span>
                  <span className="font-mono text-white/50 text-[10px]">{renderResult.gridCols}×{renderResult.gridRows}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleDownload(2)}
                  className="cursor-pointer hover:bg-white/10 flex justify-between"
                >
                  <span>2× Scaled</span>
                  <span className="font-mono text-white/50 text-[10px]">{renderResult.gridCols * 2}×{renderResult.gridRows * 2}</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => handleDownload(4)}
                  className="cursor-pointer hover:bg-white/10 flex justify-between"
                >
                  <span className="font-medium text-amber-200">4× Crisp HD (Recommended)</span>
                  <span className="font-mono text-white/50 text-[10px]">{renderResult.gridCols * 4}×{renderResult.gridRows * 4}</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => handleDownload(8)}
                  className="cursor-pointer hover:bg-white/10 flex justify-between"
                >
                  <span>8× Ultra HD</span>
                  <span className="font-mono text-white/50 text-[10px]">{renderResult.gridCols * 8}×{renderResult.gridRows * 8}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
              </>
            )}

            <DropdownMenuItem 
              onClick={() => handleDownload('screen')}
              className="cursor-pointer hover:bg-white/10 flex justify-between"
            >
              <span>Current View (with Overlays)</span>
              <span className="font-mono text-white/50 text-[10px]">PNG</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
