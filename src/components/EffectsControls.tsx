import { type LucideIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DitherType,
  PixelEngineOptions,
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
} from "lucide-react";

interface ControlsProps {
  options: PixelEngineOptions;
  onChange: (options: PixelEngineOptions) => void;
}

const PIXEL_PRESETS = [4, 6, 8, 12, 16, 24, 32];

const DITHER_MODES: { id: DitherType; label: string; hint: string }[] = [
  { id: 'none', label: 'None', hint: 'Flat Quantization' },
  { id: 'bayer4', label: 'Bayer 4×4', hint: 'Retro Ordered' },
  { id: 'bayer8', label: 'Bayer 8×8', hint: 'Fine Ordered' },
  { id: 'floyd', label: 'Floyd-Steinberg', hint: 'Smooth Diffusion' },
  { id: 'atkinson', label: 'Atkinson', hint: 'Macintosh Classic' },
];

/** Section heading with an optional right-aligned value badge. */
function SectionHeading({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-purple-400" />
        {label}
      </label>
      {value && (
        <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
          {value}
        </span>
      )}
    </div>
  );
}

/** Pixel tab: output resolution and dithering. */
export function PixelControls({ options, onChange }: ControlsProps) {
  const update = (patch: Partial<PixelEngineOptions>) => onChange({ ...options, ...patch });

  return (
    <div className="space-y-6">
      {/* Pixel Size */}
      <div className="space-y-3">
        <SectionHeading icon={Grid3X3} label="Pixel Size" value={`${options.pixelSize}px`} />

        <Slider
          value={[options.pixelSize]}
          onValueChange={([val]) => update({ pixelSize: val })}
          min={2}
          max={48}
          step={1}
          className="w-full cursor-pointer"
        />

        {/* Quick Size Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-white/50 uppercase font-mono mr-1">Presets:</span>
          {PIXEL_PRESETS.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => update({ pixelSize: size })}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
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

      {/* Dithering */}
      <div className="space-y-3">
        <SectionHeading
          icon={Sparkles}
          label="Dithering Algorithm"
          value={options.ditherType !== 'none' ? `${Math.round(options.ditherStrength * 100)}%` : undefined}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 text-xs">
          {DITHER_MODES.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => update({ ditherType: m.id })}
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

        {options.ditherType !== 'none' && (
          <div className="space-y-1.5">
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
    </div>
  );
}

/** Tone tab: pre-processing brightness, contrast and saturation. */
export function ToneControls({ options, onChange }: ControlsProps) {
  const update = (patch: Partial<PixelEngineOptions>) => onChange({ ...options, ...patch });

  const hasAdjustments =
    options.brightness !== 0 || options.contrast !== 0 || options.saturation !== 0;

  const sliders: {
    label: string;
    icon: LucideIcon;
    value: number;
    patch: (value: number) => Partial<PixelEngineOptions>;
  }[] = [
    { label: 'Brightness', icon: Sun, value: options.brightness, patch: (value) => ({ brightness: value }) },
    { label: 'Contrast', icon: ContrastIcon, value: options.contrast, patch: (value) => ({ contrast: value }) },
    { label: 'Saturation', icon: Sparkles, value: options.saturation, patch: (value) => ({ saturation: value }) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          Tone Adjustments
        </label>
        <button
          type="button"
          onClick={() => update({ brightness: 0, contrast: 0, saturation: 0 })}
          disabled={!hasAdjustments}
          className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {sliders.map(({ label, icon: Icon, value, patch }) => (
        <div key={label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Icon className="w-3 h-3" /> {label}
            </span>
            <span className="font-mono text-[11px] text-white/60">
              {value > 0 ? `+${value}` : value}
            </span>
          </div>
          <Slider
            value={[value]}
            onValueChange={([val]) => update(patch(val))}
            min={-100}
            max={100}
            step={2}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}

/** Overlays tab: pixel shape and the CRT-style display overlays. */
export function OverlayControls({ options, onChange }: ControlsProps) {
  const update = (patch: Partial<PixelEngineOptions>) => onChange({ ...options, ...patch });

  return (
    <div className="grid grid-cols-1 gap-2">
      {/* Pixel Shape Toggle */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
        <span className="text-xs text-white/80 flex items-center gap-1.5">
          {options.pixelShape === 'square' ? <Square className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
          {options.pixelShape === 'square' ? 'Square' : 'Bead / Dot'}
        </span>
        <button
          type="button"
          onClick={() => update({ pixelShape: options.pixelShape === 'square' ? 'circle' : 'square' })}
          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-600 text-white hover:bg-purple-500 transition-colors"
        >
          Switch
        </button>
      </div>

      {/* Pixel Grid Toggle */}
      <label className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
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
      <label className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
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
  );
}
