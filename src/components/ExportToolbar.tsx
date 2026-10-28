import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeaderTooltip } from "@/components/HeaderTooltip";
import { toast } from "sonner";
import { 
  Copy, 
  Download, 
  Upload, 
  Check, 
  Palette as PaletteIcon
} from "lucide-react";
import { type Palette } from "@/lib/palettes";

interface ExportToolbarProps {
  processedCanvas: HTMLCanvasElement | null;
  currentPalette: Palette;
  onUploadNew: () => void;
}

export function ExportToolbar({
  processedCanvas,
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

  // 2. Download exactly what is on screen, overlays included
  const handleDownload = () => {
    if (!processedCanvas) {
      toast.error("No image to download");
      return;
    }

    const downloadCanvas = processedCanvas;
    const fileName = `pixa-machine-${currentPalette.id}.png`;

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
    // Compact cluster: these live in the header, where every control is an
    // icon, so each one carries a tooltip that names and explains it.
    <div className="flex items-center gap-2">
      {/* Upload New Button */}
      <HeaderTooltip
        label="New image"
        hint="Leave this image and go back to the upload screen for a different photo."
      >
        <Button
          variant="outline"
          onClick={onUploadNew}
          aria-label="New image"
          className="flex h-8 w-8 items-center justify-center p-0 text-xs font-medium"
        >
          <Upload className="w-3.5 h-3.5" />
        </Button>
      </HeaderTooltip>

      {/* Export Palette Button */}
      {currentPalette.colors.length > 0 && (
        <HeaderTooltip
          label={`${currentPalette.name} palette`}
          hint={`Download these ${currentPalette.colors.length} colors as a .hex file.`}
        >
          <Button
            variant="outline"
            onClick={handleExportPalette}
            aria-label="Export palette"
            className="flex h-8 w-8 items-center justify-center border-transparent bg-transparent p-0 text-xs text-white/70 shadow-none hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
          >
            <PaletteIcon className="w-3.5 h-3.5 text-purple-400" />
          </Button>
        </HeaderTooltip>
      )}

      {/* Copy to Clipboard */}
      <HeaderTooltip
        label={copied ? 'Copied' : 'Copy'}
        hint={copied
          ? 'The pixel art is on your clipboard, ready to paste.'
          : 'Put the current pixel art on your clipboard as a PNG.'}
      >
        <Button
          variant="outline"
          onClick={handleCopyClipboard}
          aria-label={copied ? 'Copied' : 'Copy pixel art to clipboard'}
          className={`flex h-8 w-8 items-center justify-center p-0 text-xs transition-colors ${
            copied
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200 shadow-sm'
              : ''
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </HeaderTooltip>

      {/* Download: one click, exactly what is on screen */}
      <HeaderTooltip
        label="Download PNG"
        hint="Save the current view exactly as you see it, overlays included."
      >
        <Button
          onClick={handleDownload}
          aria-label="Download the current view as a PNG"
          className="flex h-8 w-8 items-center justify-center border-white/10 bg-gradient-to-b from-purple-500 to-purple-600 p-0 text-xs font-semibold text-white shadow-[0_4px_14px_-6px_rgba(124,58,237,0.9)] hover:from-purple-400 hover:to-purple-500"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </HeaderTooltip>
    </div>
  );
}
