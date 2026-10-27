import { DiamondMark } from "@/components/Logo"
import { t } from "@/i18n"
import { cn } from "@/lib/utils"

/** Ocupa o lugar do modelo 3D enquanto ele baixa e monta: o diamante se desenha em linha, sobre um piso que pulsa */
export function Carregando3D({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none flex flex-col items-center justify-center gap-5", className)} aria-hidden="true">
      <div className="relative flex h-24 w-32 items-end justify-center">
        {/* piso: elipse tracejada, como a sombra que o modelo vai ter */}
        <span className="carregando-3d-piso absolute bottom-0 h-6 w-32 rounded-[50%] border border-dashed border-ice/25" />
        <DiamondMark className="carregando-3d relative mb-5 h-14 w-16 text-ice/70" />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">{t("Montando modelo 3D")}</span>
    </div>
  )
}
