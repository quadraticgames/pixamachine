import { type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderTooltipProps {
  /** Short name of the action, shown in bold. */
  label: string;
  /** One sentence explaining what the button actually does. */
  hint: string;
  children: ReactNode;
}

/**
 * Rich tooltip for the header's icon-only controls, which have no visible
 * label: a name plus a sentence of explanation, instead of a bare browser
 * title. The provider lives at the app root.
 */
export function HeaderTooltip({ label, hint, children }: HeaderTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={10}
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
