/**
 * haoma logo, supplied by the owner (logo.svg, 2026-11-14). Paths unchanged;
 * the fill follows the text colour so the mark works in every theme.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" aria-hidden="true" focusable="false" className={className}>
      <path
        fill="currentColor"
        d="M450 450C339.543 450 250 360.457 250 250C250 139.543 339.543 50 450 50V450Z"
      />
      <path
        fill="currentColor"
        d="M50 450C160.457 450 250 360.457 250 250C250 139.543 160.457 50 50 50V450Z"
      />
    </svg>
  )
}
