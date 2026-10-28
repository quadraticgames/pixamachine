import { type LucideIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RichTooltip, TooltipLabel } from "@/components/RichTooltip";
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
  RotateCw,
} from "lucide-react";

interface ControlsProps {
  options: PixelEngineOptions;
  onChange: (options: PixelEngineOptions) => void;
}

const PIXEL_PRESETS = [4, 6, 8, 12, 16, 24, 32];

// What each preset size actually looks like, so the chips explain themselves.
const PIXEL_PRESET_HINTS: Record<number, string> = {
  4: 'Very fine blocks — closest to the source photo, busiest detail.',
  6: 'Fine blocks, roughly Game Boy Advance sprite scale.',
  8: 'The sweet spot: NES-era sprite scale with detail left over.',
  12: 'Chunky and readable — good for portraits and icons.',
  16: 'Heavily blocked. Shapes and silhouettes dominate.',
  24: 'Poster-scale blocks. Best with flat subjects and few colors.',
  32: 'Maximum abstraction — a handful of blocks per face.',
};

const DITHER_MODES: { id: DitherType; label: string; hint: string; detail: string }[] = [
  {
    id: 'none',
    label: 'None',
    hint: 'Flat Quantization',
    detail: 'Snap every pixel to its nearest palette color. Cleanest edges, but gradients turn into visible bands.',
  },
  {
    id: 'bayer4',
    label: 'Bayer 4×4',
    hint: 'Retro Ordered',
    detail: 'A 4×4 ordered pattern that fakes extra colors. Crisp, tileable and unmistakably retro.',
  },
  {
    id: 'bayer8',
    label: 'Bayer 8×8',
    hint: 'Fine Ordered',
    detail: 'The same ordered approach at 8×8, so gradients come out smoother than Bayer 4×4.',
  },
  {
    id: 'floyd',
    label: 'Floyd-Steinberg',
    hint: 'Smooth Diffusion',
    detail: 'Diffuses each pixel\'s rounding error to its neighbours — the smoothest gradients, but grainy.',
  },
  {
    id: 'atkinson',
    label: 'Atkinson',
    hint: 'Macintosh Classic',
    detail: 'Spreads only part of the error, keeping highlights bright and shadows dark. The early Mac look.',
  },
];

/** Section heading with an optional right-aligned value badge and a tooltip. */
function SectionHeading({
  icon: Icon,
  label,
  hint,
  value,
  tooltip,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  value?: string;
  /** Where the bubble opens; the rail sits on the right, so left by default. */
  tooltip?: string;
}) {
  const heading = (
    <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-purple-400" />
      {label}
    </label>
  );

  return (
    <div className="flex items-center justify-between gap-2">
      {hint ? (
        <TooltipLabel label={label} hint={hint} side={tooltip === 'bottom' ? 'bottom' : 'left'}>
          {heading}
        </TooltipLabel>
      ) : (
        heading
      )}
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
        <SectionHeading
          icon={Grid3X3}
          label="Pixel Size"
          hint="How many source pixels each block covers. Higher values mean fewer, larger blocks."
          value={`${options.pixelSize}px`}
        />

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
            <RichTooltip
              key={size}
              label={`${size}px blocks`}
              hint={PIXEL_PRESET_HINTS[size]}
              side="left"
            >
              <button
                type="button"
                onClick={() => update({ pixelSize: size })}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors sm:px-2 sm:py-0.5 ${
                  options.pixelSize === size
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {size}p
              </button>
            </RichTooltip>
          ))}
        </div>
      </div>

      {/* Dithering */}
      <div className="space-y-3">
        <SectionHeading
          icon={Sparkles}
          label="Dithering Algorithm"
          hint="How leftover colors are approximated. Ordered patterns look retro; diffusion looks smoother."
          value={options.ditherType !== 'none' ? `${Math.round(options.ditherStrength * 100)}%` : undefined}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 text-xs">
          {DITHER_MODES.map(m => (
            <RichTooltip key={m.id} label={`${m.label} dithering`} hint={m.detail} side="left">
              <button
                type="button"
                onClick={() => update({ ditherType: m.id })}
                className={`p-2 rounded-lg border text-left transition-all ${
                  options.ditherType === m.id
                    ? 'border-purple-400/50 bg-purple-500/[0.10] text-purple-100'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/65 hover:border-white/15 hover:bg-white/[0.06]'
                }`}
              >
                <div className="font-semibold text-xs">{m.label}</div>
                <div className="text-[10px] text-white/50">{m.hint}</div>
              </button>
            </RichTooltip>
          ))}
        </div>

        {options.ditherType !== 'none' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-white/60">
              <TooltipLabel
                label="Dithering Strength"
                hint="How strongly the pattern is mixed in. Lower is subtler; above 100% exaggerates it."
                side="left"
              >
                <span>Dithering Strength</span>
              </TooltipLabel>
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

/** Tone tab: pre-processing brightness, contrast, saturation and hue. */
export function ToneControls({ options, onChange }: ControlsProps) {
  const update = (patch: Partial<PixelEngineOptions>) => onChange({ ...options, ...patch });

  const hasAdjustments =
    options.brightness !== 0 ||
    options.contrast !== 0 ||
    options.saturation !== 0 ||
    options.hue !== 0;

  const sliders: {
    label: string;
    hint: string;
    icon: LucideIcon;
    value: number;
    patch: (value: number) => Partial<PixelEngineOptions>;
  }[] = [
    {
      label: 'Brightness',
      hint: 'Lifts or lowers the whole image before quantizing, so dark photos survive a small palette.',
      icon: Sun,
      value: options.brightness,
      patch: (value) => ({ brightness: value }),
    },
    {
      label: 'Contrast',
      hint: 'Pushes midtones apart so palette bands separate instead of blending together.',
      icon: ContrastIcon,
      value: options.contrast,
      patch: (value) => ({ contrast: value }),
    },
    {
      label: 'Saturation',
      hint: 'Color intensity. Turn it down so noisy colors stop claiming palette slots.',
      icon: Sparkles,
      value: options.saturation,
      patch: (value) => ({ saturation: value }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          Tone Adjustments
        </label>
        <RichTooltip
          label="Reset tone"
          hint="Return brightness, contrast, saturation and hue to zero, leaving the palette alone."
          side="left"
        >
          <button
            type="button"
            onClick={() => update({ brightness: 0, contrast: 0, saturation: 0, hue: 0 })}
            disabled={!hasAdjustments}
            className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </RichTooltip>
      </div>

      {sliders.map(({ label, hint, icon: Icon, value, patch }) => (
        <div key={label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/70">
            <TooltipLabel label={label} hint={hint} side="left">
              <span className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" /> {label}
              </span>
            </TooltipLabel>
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

      {/* Hue sits last and wears a rainbow track, so the rotation is legible */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-white/70">
          <TooltipLabel
            label="Hue"
            hint="Rotates every color around the wheel. A quick way to restyle a photo or match an aesthetic."
            side="left"
          >
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3 h-3" /> Hue
            </span>
          </TooltipLabel>
          <span className="font-mono text-[11px] text-white/60">
            {options.hue > 0 ? `+${options.hue}` : options.hue}°
          </span>
        </div>
        <Slider
          value={[options.hue]}
          onValueChange={([val]) => update({ hue: val })}
          min={-180}
          max={180}
          step={1}
          trackClassName="hue-track h-2.5"
          rangeClassName="bg-transparent"
          className="w-full"
        />
      </div>
    </div>
  );
}

/** Overlays tab: pixel shape and the CRT-style display overlays. */
export function OverlayControls({ options, onChange }: ControlsProps) {
  const update = (patch: Partial<PixelEngineOptions>) => onChange({ ...options, ...patch });

  return (
    <div className="grid grid-cols-1 gap-2">
      {/* Pixel Shape Toggle */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
        <TooltipLabel
          label="Pixel shape"
          hint="Square blocks read as hardware pixels; bead/dot rounds each one into a perler-bead look."
          side="left"
        >
          <span className="text-xs text-white/80 flex items-center gap-1.5">
            {options.pixelShape === 'square' ? <Square className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
            {options.pixelShape === 'square' ? 'Square' : 'Bead / Dot'}
          </span>
        </TooltipLabel>
        <RichTooltip
          label="Switch pixel shape"
          hint="Toggle between square pixels and round bead-style pixels."
          side="left"
        >
          <button
            type="button"
            onClick={() => update({ pixelShape: options.pixelShape === 'square' ? 'circle' : 'square' })}
            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-600 text-white hover:bg-purple-500 transition-colors"
          >
            Switch
          </button>
        </RichTooltip>
      </div>

      {/* Pixel Grid Toggle */}
      <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]">
        <TooltipLabel
          label="Grid lines"
          hint="Draw a faint line between blocks. Best at large pixel sizes, and it is baked into the download."
          side="left"
        >
          <span className="text-xs text-white/80 flex items-center gap-1.5">
            <Grid3X3 className="w-3.5 h-3.5" />
            Grid Lines
          </span>
        </TooltipLabel>
        <Switch
          checked={options.showGrid}
          onCheckedChange={(checked) => update({ showGrid: checked })}
        />
      </label>

      {/* CRT Scanlines Toggle */}
      <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]">
        <TooltipLabel
          label="CRT scanlines"
          hint="Overlay horizontal TV lines for a monitor look. Exports keep the scanlines."
          side="left"
        >
          <span className="text-xs text-white/80 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5" />
            CRT Scanlines
          </span>
        </TooltipLabel>
        <Switch
          checked={options.showScanlines}
          onCheckedChange={(checked) => update({ showScanlines: checked })}
        />
      </label>
    </div>
  );
}
