import { useState, useMemo } from "react";
import { CLASSIC_PALETTES, PALETTE_CATEGORIES, type Palette } from "@/lib/palettes";
import { Badge } from "@/components/ui/badge";
import { RichTooltip, TooltipLabel } from "@/components/RichTooltip";
import { Check, Info, Palette as PaletteIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PaletteSelectorProps {
  selectedPalette: string;
  onSelectPalette: (paletteId: string) => void;
}

// What each filter actually contains, for the category pills.
const CATEGORY_HINTS: Record<string, string> = {
  all: 'Every palette in the app, plus Original Colors for no quantization at all.',
  handheld: 'Game Boy, Game Boy Pocket, PICO-8 and other small-screen color sets.',
  console: 'NES, Master System, Atari 2600 and the other living-room hardware.',
  pc: 'CGA, EGA, Windows 95 and MS-DOS sets from the early PC era.',
  creative: 'Hand-picked aesthetic palettes such as Cyberpunk and Vaporwave.',
};

export function PaletteSelector({
  selectedPalette,
  onSelectPalette,
}: PaletteSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const currentPalette = useMemo(() => {
    return CLASSIC_PALETTES.find(p => p.id === selectedPalette) || CLASSIC_PALETTES[0];
  }, [selectedPalette]);

  const filteredPalettes = useMemo(() => {
    return CLASSIC_PALETTES.filter(p => activeCategory === 'all' || p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-3">
      {/* Heading row */}
      <div className="flex items-center justify-between">
        <TooltipLabel
          label="Color palette"
          hint="Every pixel is snapped to the nearest color in this set, which is what gives pixel art its era."
          side="left"
        >
          <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
            <PaletteIcon className="w-3.5 h-3.5 text-purple-400" />
            Color Palette
          </label>
        </TooltipLabel>
        <TooltipLabel
          label="Color count"
          hint="How many colors this palette allows. Fewer colors means more visible quantization."
          side="left"
        >
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
            {currentPalette.colors.length > 0 ? `${currentPalette.colors.length} Colors` : 'Original Full Color'}
          </span>
        </TooltipLabel>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {PALETTE_CATEGORIES.map(cat => (
          <RichTooltip
            key={cat.id}
            label={cat.label}
            hint={CATEGORY_HINTS[cat.id] ?? 'Filter the palette list.'}
            side="left"
          >
            <button
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all sm:px-2.5 sm:py-1 ${
                activeCategory === cat.id
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white/90'
              }`}
            >
              {cat.label}
            </button>
          </RichTooltip>
        ))}
      </div>

      {/* Scrollable Palette Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-1 select-none scrollbar-slim sm:max-h-56">
        {filteredPalettes.map((palette) => {
          const isSelected = palette.id === selectedPalette;
          const swatchCount = palette.colors.length > 0 ? `${palette.colors.length} colors` : 'no quantization';
          return (
            <RichTooltip
              key={palette.id}
              label={palette.name}
              hint={`${palette.era ? `${palette.era} · ` : ''}${swatchCount} · ${palette.description}`}
              side="left"
            >
              <button
                type="button"
                onClick={() => onSelectPalette(palette.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? 'border-purple-400/50 bg-purple-500/[0.10] shadow-sm'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className={`font-semibold ${isSelected ? 'text-purple-200' : 'text-white'}`}>
                    {palette.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {palette.era && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-white/70">
                        {palette.era}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-purple-300" />
                    )}
                  </div>
                </div>

                {/* Swatch color strip */}
                {palette.colors.length > 0 ? (
                  <div className="flex h-3.5 w-full rounded-md overflow-hidden border border-black/30">
                    {palette.colors.slice(0, 24).map((c, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full min-w-[3px]"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    {palette.colors.length > 24 && (
                      <div className="bg-black/60 px-1 text-[9px] text-white/80 font-mono flex items-center justify-center">
                        +{palette.colors.length - 24}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-3.5 w-full rounded-md bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80 border border-black/30 flex items-center justify-center text-[9px] text-white font-mono">
                    24-Bit RGB
                  </div>
                )}
              </button>
            </RichTooltip>
          );
        })}
      </div>

      {/* Selected Palette Description Banner */}
      {currentPalette.description && (
        <div className="flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-[11px] leading-relaxed text-white/70">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>{currentPalette.name}</span>
              <span className="text-purple-300 font-normal">({currentPalette.categoryLabel})</span>
            </div>
            <p className="text-white/70 font-sans">{currentPalette.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
