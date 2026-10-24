import { useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { PECAS } from "@/data"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { Kicker } from "@/components/Kicker"

export function Pecas() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      // colunas sobem em velocidades diferentes
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".peca").forEach((el, i) => {
          gsap.fromTo(el, { y: 60 + (i % 2) * 90 }, {
            y: -(i % 2) * 60,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          })
        })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section id="pecas" ref={root} className="relative overflow-hidden bg-ink-2 px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Kicker className="mb-5">{t("Partes e peças")}</Kicker>
          <h2 className="font-wide text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[0.98] tracking-tight text-white">
            {t("Reposição sem esperar importação.")}
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-white/60">
            {t(
              "Correntes, correias, coifas, escovas, bombas d’água, rolamentos e peças de mandril para lapidadoras, biseladoras e mesas de corte, com estoque no Brasil."
            )}
          </p>
          <a
            href="/pecas"
            className="glass mt-9 inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm text-white transition-colors hover:bg-white/10"
          >
            {t("Ver todas as peças")} <ArrowUpRight className="h-4 w-4 text-ice" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:col-span-8">
          {PECAS.map((p) => (
            <figure key={p.nome} className="peca group overflow-hidden rounded-3xl border border-white/10 bg-ink">
              <div className="overflow-hidden bg-white">
                <img
                  src={p.img}
                  alt={t(p.nome)}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-2 p-4 text-sm text-white md:p-5 md:text-base">
                {t(p.nome)}
                <span className="h-2 w-2 shrink-0 rounded-full bg-ice transition-transform duration-300 group-hover:scale-150" />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
