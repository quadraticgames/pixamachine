import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  DitherType, 
  PixelEngineOptions, 
  PixelShape 
} from "@/lib/pixelEngine";
import { 
  Sliders, 
  Grid3X3, 
  Tv, 
  CircleDot, 
  Square, 
  Sun, 
  Contrast as ContrastIcon, 
  Sparkles, 
  RotateCcw,
  Layers
} from "lucide-react";

interface EffectsControlsProps {
  options: PixelEngineOptions;
  onChange: (options: PixelEngineOptions) => void;
}

export function EffectsControls({ options, onChange }: EffectsControlsProps) {
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);

  const update = (patch: Partial<PixelEngineOptions>) => {
    onChange({ ...options, ...patch });
  };

  const pixelPresets = [4, 6, 8, 12, 16, 24, 32];

  const resetAdjustments = () => {
    update({ brightness: 0, contrast: 0, saturation: 0 });
  };

  const hasAdjustments = options.brightness !== 0 || options.contrast !== 0 || options.saturation !== 0;

  return (
    <div className="bg-black/40 border border-white/15 rounded-xl p-4 backdrop-blur-md space-y-4">
      {/* 1. Pixel Size Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
            <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
            Pixel Size
          </label>
          <span className="font-mono text-purple-300 font-bold bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
            {options.pixelSize}px
          </span>
        </div>

        <Slider
          value={[options.pixelSize]}
          onValueChange={([val]) => update({ pixelSize: val })}
          min={2}
          max={48}
          step={1}
          className="w-full cursor-pointer"
        />

        {/* Quick Size Preset Chips */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-white/50 uppercase font-mono mr-1">Presets:</span>
          {pixelPresets.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => update({ pixelSize: size })}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                options.pixelSize === size
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {size}p
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* 2. Dithering Engine Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Dithering Algorithm
          </label>
          {options.ditherType !== 'none' && (
            <span className="text-[10px] font-mono text-purple-300">
              {Math.round(options.ditherStrength * 100)}% Intensity
            </span>
          )}
        </div>

        {/* Dither Mode Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'none', label: 'None', hint: 'Flat Quantization' },
            { id: 'bayer4', label: 'Bayer 4×4', hint: 'Retro Ordered' },
            { id: 'bayer8', label: 'Bayer 8×8', hint: 'Fine Ordered' },
            { id: 'floyd', label: 'Floyd-Steinberg', hint: 'Smooth Diffusion' },
            { id: 'atkinson', label: 'Atkinson', hint: 'Macintosh Classic' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => update({ ditherType: m.id as DitherType })}
              className={`p-2 rounded-lg border text-left transition-all ${
                options.ditherType === m.id
                  ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold text-xs">{m.label}</div>
              <div className="text-[10px] text-white/50">{m.hint}</div>
            </button>
          ))}
        </div>

        {/* Dither Strength Slider (visible if not 'none') */}
        {options.ditherType !== 'none' && (
          <div className="pt-1.5 space-y-1">
            <div className="flex justify-between text-[11px] text-white/60">
              <span>Dithering Strength</span>
              <span className="font-mono">{Math.round(options.ditherStrength * 100)}%</span>
            </div>
            <Slider
              value={[options.ditherStrength * 100]}
              onValueChange={([val]) => update({ ditherStrength: val / 100 })}
              min={10}
              max={150}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-white/10" />

      {/* 3. Pixel Shape & Display Overlays */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          Style & CRT Overlays
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Pixel Shape Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-white/80 flex items-center gap-1.5">
              {options.pixelShape === 'square' ? <Square className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
              {options.pixelShape === 'square' ? 'Square' : 'Bead / Dot'}
            </span>
            <button
              type="button"
              onClick={() => update({ pixelShape: options.pixelShape === 'square' ? 'circle' : 'square' })}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              Switch
            </button>
          </div>

          {/* Pixel Grid Toggle */}
          <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
            <span className="text-xs text-white/80 flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5" />
              Grid Lines
            </span>
            <Switch
              checked={options.showGrid}
              onCheckedChange={(checked) => update({ showGrid: checked })}
            />
          </label>

          {/* CRT Scanlines Toggle */}
          <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
            <span className="text-xs text-white/80 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              CRT Scanlines
            </span>
            <Switch
              checked={options.showScanlines}
              onCheckedChange={(checked) => update({ showScanlines: checked })}
            />
          </label>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* 4. Pre-processing Adjustments (Collapsible) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdjustments(!showAdjustments)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-purple-300 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Tone Adjustments</span>
            {hasAdjustments && (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            )}
          </button>

          {hasAdjustments && (
            <button
              type="button"
              onClick={resetAdjustments}
              className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Tone
            </button>
          )}
        </div>

        {showAdjustments && (
          <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-3 text-xs">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Brightness</span>
                <span className="font-mono">{options.brightness > 0 ? `+${options.brightness}` : options.brightness}</span>
              </div>
              <Slider
                value={[options.brightness]}
                onValueChange={([val]) => update({ brightness: val })}
                min={-100}
                max={100}
                step={2}
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><ContrastIcon className="w-3 h-3" /> Contrast</span>
                <span className="font-mono">{options.contrast > 0 ? `+${options.contrast}` : options.contrast}</span>
              </div>
              <Slider
                value={[options.contrast]}
                onValueChange={([val]) => update({ contrast: val })}
                min={-100}
                max={100}
                step={2}
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Saturation</span>
                <span className="font-mono">{options.saturation > 0 ? `+${options.saturation}` : options.saturation}</span>
              </div>
              <Slider
                value={[options.saturation]}
                onValueChange={([val]) => update({ saturation: val })}
                min={-100}
                max={100}
                step={2}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
