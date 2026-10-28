interface PixaMachineMarkProps {
  className?: string;
}

/**
 * The PixaMachine mark: the four brand squares from logo.svg, at the same
 * geometry and colours as the source file (violet #3F00FF, magenta #FF00D9,
 * rose #FF0091, silver #C0C0C0).
 *
 * The supplied logo file draws its wordmark as SVG <text> in the Windows-only
 * 'Javanese Text' font with per-glyph positions hard-coded for that font, so
 * the wordmark is rendered as live text in the app font instead.
 */
export function PixaMachineMark({ className }: PixaMachineMarkProps) {
  return (
    <svg
      viewBox="0 0 769 769"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width="368.405" height="368.405" fill="#3F00FF" />
      <rect x="400.405" y="0" width="368.405" height="368.405" fill="#FF00D9" />
      <rect x="0" y="400.405" width="368.405" height="368.405" fill="#FF0091" />
      <rect x="400.405" y="400.405" width="368.405" height="368.405" fill="#C0C0C0" />
    </svg>
  );
}
