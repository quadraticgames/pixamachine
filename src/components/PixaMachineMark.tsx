interface PixaMachineMarkProps {
  className?: string;
}

/**
 * The Pixa Machine mark: the three brand squares from logo.svg, at the same
 * colours and proportions (blue #1236FF, pink #FF12C5, grey #C8C8C8).
 *
 * The supplied logo file draws its wordmark as SVG <text> in the Windows-only
 * 'Javanese Text' font with per-glyph positions hard-coded for that font, so
 * the wordmark is rendered as live text in the app font instead.
 */
export function PixaMachineMark({ className }: PixaMachineMarkProps) {
  return (
    <svg
      viewBox="0 0 146.4 148.5"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width="68.3" height="68.3" fill="#1236FF" />
      <rect x="78.1" y="0" width="68.3" height="68.3" fill="#FF12C5" />
      <rect x="0" y="80.2" width="68.3" height="68.3" fill="#C8C8C8" />
    </svg>
  );
}
