import type { ReactNode } from "react"
import { DiamondMark } from "@/components/Logo"
import { cn } from "@/lib/utils"

/**
 * Etiqueta acima dos títulos de seção: diamante do logo + fio de luz + texto em caixa normal.
 * `light` é para seções de fundo claro.
 */
export function Kicker({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p className={cn("kicker inline-flex items-center gap-3", className)}>
      <DiamondMark className={cn("h-3.5 w-4 shrink-0", light ? "text-azure" : "text-ice")} />
      <span
        aria-hidden="true"
        className={cn("h-px w-8 bg-gradient-to-r to-transparent", light ? "from-azure/70" : "from-ice/70")}
      />
      <span className={cn("font-wide text-[13px] font-medium tracking-[0.02em]", light ? "text-ink/70" : "text-white/80")}>
        {children}
      </span>
    </p>
  )
}
