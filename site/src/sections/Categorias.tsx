import { Marquee } from "@/components/ui/marquee"
import { DiamondMark } from "@/components/Logo"
import { CATEGORIAS } from "@/data"
import { t } from "@/i18n"

export function Categorias() {
  const half = Math.ceil(CATEGORIAS.length / 2)
  const rows = [CATEGORIAS.slice(0, half), CATEGORIAS.slice(half)]
  return (
    <section id="categorias" aria-label={t("Linhas de máquinas")} className="relative overflow-hidden border-y border-white/5 bg-ink py-10">
      {rows.map((row, r) => (
        <Marquee key={r} reverse={r === 1} pauseOnHover className="[--duration:38s] [--gap:2.5rem]">
          {row.map((c) => (
            <span key={c} className="flex items-center gap-10">
              <span
                className={`font-wide whitespace-nowrap text-[clamp(1.6rem,4vw,3.4rem)] font-semibold tracking-tight ${
                  r === 0 ? "text-white" : "text-transparent [-webkit-text-stroke:1px_rgba(143,233,255,0.55)]"
                }`}
              >
                {t(c)}
              </span>
              <DiamondMark className="h-6 w-7 shrink-0 text-ice/60" />
            </span>
          ))}
        </Marquee>
      ))}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink" />
    </section>
  )
}
