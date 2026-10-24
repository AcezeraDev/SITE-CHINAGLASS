import { cn } from "@/lib/utils"

/** Diamante do logo da China Glass redesenhado em vetor */
export function DiamondMark({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 64 56" fill="none" className={cn("overflow-visible", className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" className={draw ? "diamond-draw" : undefined}>
        <path pathLength={1} d="M4 18 16 4h32l12 14L32 52z" />
        <path pathLength={1} d="M4 18h56" />
        <path pathLength={1} d="M16 4l6 14 10-14 10 14 6-14" />
        <path pathLength={1} d="M22 18l10 34 10-34" />
      </g>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DiamondMark className="h-7 w-8 text-ice" />
      <span className="font-wide text-[13px] font-semibold tracking-[0.22em] text-white">CHINA GLASS</span>
    </span>
  )
}
