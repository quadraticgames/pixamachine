import { useState, useMemo } from "react";
import { CLASSIC_PALETTES, PALETTE_CATEGORIES, type Palette } from "@/lib/palettes";
import { Badge } from "@/components/ui/badge";
import { Check, Info, Palette as PaletteIcon, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PaletteSelectorProps {
  selectedPalette: string;
  onSelectPalette: (paletteId: string) => void;
}

export function PaletteSelector({
  selectedPalette,
  onSelectPalette,
}: PaletteSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentPalette = useMemo(() => {
    return CLASSIC_PALETTES.find(p => p.id === selectedPalette) || CLASSIC_PALETTES[0];
  }, [selectedPalette]);

  const filteredPalettes = useMemo(() => {
    return CLASSIC_PALETTES.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
          <PaletteIcon className="w-3.5 h-3.5 text-purple-400" />
          Color Palette
        </label>
        <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
          {currentPalette.colors.length > 0 ? `${currentPalette.colors.length} Colors` : 'Original Full Color'}
        </span>
      </div>

      {/* Main Selected Palette Bar */}
      <div className="bg-black/40 border border-white/15 rounded-xl p-3 backdrop-blur-md space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1">
          {PALETTE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search retro hardware, consoles, or indie palettes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400 font-sans"
          />
        </div>

        {/* Scrollable Palette Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 select-none">
          {filteredPalettes.map((palette) => {
            const isSelected = palette.id === selectedPalette;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => onSelectPalette(palette.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? 'bg-purple-950/70 border-purple-400 ring-1 ring-purple-400 shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className={`font-semibold ${isSelected ? 'text-purple-200' : 'text-white'}`}>
                    {palette.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {palette.era && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
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
                  <div className="flex h-3.5 w-full rounded overflow-hidden border border-black/30">
                    {palette.colors.slice(0, 24).map((c, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full min-w-[3px]"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    {palette.colors.length > 24 && (
                      <div className="bg-black/60 px-1 text-[8px] text-white/80 font-mono flex items-center justify-center">
                        +{palette.colors.length - 24}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-3.5 w-full rounded bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80 border border-black/30 flex items-center justify-center text-[9px] text-white font-mono">
                    24-Bit RGB
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Palette Description Banner */}
        {currentPalette.description && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-black/60 border border-white/10 text-white/80 text-[11px] leading-relaxed">
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
    </div>
  );
}
