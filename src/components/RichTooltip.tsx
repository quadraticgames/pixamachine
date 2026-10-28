import { type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Side = "top" | "right" | "bottom" | "left";

interface RichTooltipProps {
  /** Short name of the action, shown in bold. */
  label: string;
  /** One sentence explaining what the control actually does. */
  hint: string;
  /** Where the bubble opens; it flips itself when there is no room. */
  side?: Side;
  children: ReactNode;
}

/**
 * Shared tooltip for icon-only buttons and abstract controls: a name plus a
 * sentence of explanation, in the app's own styling rather than a bare browser
 * `title`. The provider lives at the app root.
 */
export function RichTooltip({ label, hint, side = "bottom", children }: RichTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        align="center"
        sideOffset={10}
        collisionPadding={12}
        className="max-w-64 rounded-xl border border-white/10 bg-[#16171f] px-3.5 py-2.5 text-xs text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      >
        <div className="flex items-start gap-2">
          {/* Accent pip ties the tooltip to the app's purple, not a generic OS bubble */}
          <span
            aria-hidden="true"
            className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.85)]"
          />
          <div className="space-y-0.5">
            <p className="text-[12px] font-semibold leading-tight text-white">{label}</p>
            <p className="text-[11px] leading-relaxed text-white/55">{hint}</p>
          </div>
        </div>
        <TooltipPrimitive.Arrow className="fill-[#16171f]" width={12} height={6} />
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The same bubble attached to a text label that isn't a button — slider names,
 * section headings. The wrapper is focusable so the hint is reachable from the
 * keyboard, not just by hovering.
 */
export function TooltipLabel({
  label,
  hint,
  side = "left",
  className,
  children,
}: RichTooltipProps & { className?: string }) {
  return (
    <RichTooltip label={label} hint={hint} side={side}>
      <span
        tabIndex={0}
        className={`cursor-help rounded outline-none transition-colors focus-visible:ring-1 focus-visible:ring-purple-400/60 ${className ?? ""}`}
      >
        {children}
      </span>
    </RichTooltip>
  );
}
