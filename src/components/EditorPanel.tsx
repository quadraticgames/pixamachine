import { useState } from "react";
import { type LucideIcon, Grid3X3, Layers, Palette as PaletteIcon, Sliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaletteSelector } from "@/components/PaletteSelector";
import { RichTooltip } from "@/components/RichTooltip";
import { OverlayControls, PixelControls, ToneControls } from "@/components/EffectsControls";
import { type PixelEngineOptions } from "@/lib/pixelEngine";

interface EditorPanelProps {
  selectedPalette: string;
  onSelectPalette: (paletteId: string) => void;
  options: PixelEngineOptions;
  onChange: (options: PixelEngineOptions) => void;
}

const TABS: { value: string; label: string; icon: LucideIcon; hint: string }[] = [
  {
    value: "palette",
    label: "Palette",
    icon: PaletteIcon,
    hint: "The color set every pixel is snapped to, from real console palettes to full 24-bit color.",
  },
  {
    value: "pixel",
    label: "Pixel",
    icon: Grid3X3,
    hint: "Block size and dithering: how chunky the pixels are and how gradients are broken up.",
  },
  {
    value: "tone",
    label: "Tone",
    icon: Sliders,
    hint: "Brightness, contrast, saturation and hue, applied before the image is quantized.",
  },
  {
    value: "overlays",
    label: "Overlays",
    icon: Layers,
    hint: "Pixel shape, grid lines and CRT scanlines drawn on top of the pixel art.",
  },
];

/**
 * The editor's right-hand rail: every image option lives in a tab in here, so
 * the canvas keeps the rest of the width.
 */
export function EditorPanel({
  selectedPalette,
  onSelectPalette,
  options,
  onChange,
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("palette");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:sticky lg:top-8">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1017]/90 shadow-xl backdrop-blur-xl">
        <TabsList className="w-full h-auto grid grid-cols-4 gap-1 rounded-none border-b border-white/[0.07] bg-transparent p-1.5">
          {/* The tooltip wraps a span rather than the trigger itself: both Radix
              components set data-state, and the tooltip's would win over the
              tab's, breaking the active styling. */}
          {TABS.map(({ value, label, icon: Icon, hint }) => (
            <RichTooltip key={value} label={label} hint={hint} side="left">
              <span className="flex">
                <TabsTrigger
                  value={value}
                  className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/80 data-[state=active]:bg-white/[0.09] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-white/10 sm:min-h-0"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </TabsTrigger>
              </span>
            </RichTooltip>
          ))}
        </TabsList>

        <div className="p-4 sm:p-5">
          <TabsContent value="palette" className="mt-0">
            <PaletteSelector
              selectedPalette={selectedPalette}
              onSelectPalette={onSelectPalette}
            />
          </TabsContent>

          <TabsContent value="pixel" className="mt-0">
            <PixelControls options={options} onChange={onChange} />
          </TabsContent>

          <TabsContent value="tone" className="mt-0">
            <ToneControls options={options} onChange={onChange} />
          </TabsContent>

          <TabsContent value="overlays" className="mt-0">
            <OverlayControls options={options} onChange={onChange} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
