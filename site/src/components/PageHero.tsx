import { useEffect, useRef, type ReactNode } from "react"
import { ArrowDown, ChevronRight } from "lucide-react"
import { SplitWords } from "@/components/SplitWords"
import { t } from "@/i18n"
import { gsap, prefersReducedMotion, scrollToId } from "@/lib/motion"

/** Abertura das páginas internas: trilha, título em duas partes, texto, selos e atalho para o conteúdo (textos já traduzidos) */
export function PageHero({
  crumb,
  title,
  accent,
  sub,
  chips = [],
  cta,
  aside,
}: {
  crumb: string
  title: string
  accent: string
  sub: string
  chips?: string[]
  cta?: { label: string; target: string }
  aside?: ReactNode
}) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
        .from(".pg-crumb", { y: 16, opacity: 0, duration: 0.9 })
        .from(".pg-title .word", { yPercent: 120, rotate: 5, duration: 1.3, stagger: 0.08 }, "-=0.6")
        .from(".pg-sub, .pg-chip", { y: 20, opacity: 0, duration: 1, stagger: 0.06 }, "-=0.9")
        .from(".pg-aside", { y: 40, opacity: 0, duration: 1.2 }, "-=1")
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative overflow-hidden bg-ink px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-44">
      <div className="blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute right-[-10%] top-10 h-[34rem] w-[34rem] rounded-full bg-azure/20 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <nav aria-label={t("Você está em")} className="pg-crumb mb-6 flex items-center gap-2 font-wide text-[13px] text-white/50">
            <a href="/" className="transition-colors hover:text-white">{t("Início")}</a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ice" aria-current="page">{crumb}</span>
          </nav>
          <h1 className="pg-title font-wide max-w-[14ch] text-[clamp(2.6rem,6.4vw,6rem)] font-semibold leading-[0.95] tracking-tight text-white">
            <SplitWords text={title} /> <SplitWords text={accent} className="word text-gradient" />
          </h1>
          <p className="pg-sub mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">{sub}</p>
          {chips.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c} className="pg-chip rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] text-white/75 backdrop-blur-md">
                  {c}
                </li>
              ))}
            </ul>
          )}
          {cta && (
            <button
              onClick={() => scrollToId(cta.target)}
              className="pg-chip mt-10 inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowDown className="h-4 w-4 animate-bounce text-ice" /> {cta.label}
            </button>
          )}
        </div>
        {aside && <div className="pg-aside">{aside}</div>}
      </div>
    </section>
  )
}
