import { useState } from "react";
import { type LucideIcon, Grid3X3, Layers, Palette as PaletteIcon, Sliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaletteSelector } from "@/components/PaletteSelector";
import { OverlayControls, PixelControls, ToneControls } from "@/components/EffectsControls";
import { type PixelEngineOptions } from "@/lib/pixelEngine";

interface EditorPanelProps {
  selectedPalette: string;
  onSelectPalette: (paletteId: string) => void;
  options: PixelEngineOptions;
  onChange: (options: PixelEngineOptions) => void;
}

const TABS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "palette", label: "Palette", icon: PaletteIcon },
  { value: "pixel", label: "Pixel", icon: Grid3X3 },
  { value: "tone", label: "Tone", icon: Sliders },
  { value: "overlays", label: "Overlays", icon: Layers },
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
      <div className="bg-black/40 border border-white/15 rounded-xl backdrop-blur-md overflow-hidden">
        <TabsList className="w-full h-auto grid grid-cols-4 gap-1 rounded-none border-b border-white/10 bg-transparent p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium text-white/50 transition-colors hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-purple-200 data-[state=active]:shadow-none data-[state=active]:ring-1 data-[state=active]:ring-purple-400/40"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="p-4">
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
