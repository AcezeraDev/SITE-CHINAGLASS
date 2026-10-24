import { lazy, Suspense, useEffect, useRef } from "react"
import { ArrowDown, ChevronRight } from "lucide-react"
import { SplitWords } from "@/components/SplitWords"
import { t } from "@/i18n"
import { gsap, prefersReducedMotion, scrollState, scrollToId } from "@/lib/motion"
import { PECAS_CATALOGO } from "@/pecasData"

const PartsScene = lazy(() => import("@/three/PartsScene"))

export function PecasHero() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    scrollState.hero = 0
    const ctx = gsap.context(() => {
      gsap.to(scrollState, {
        hero: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
      if (prefersReducedMotion()) return
      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.15 })
        .from(".ph-crumb", { y: 16, opacity: 0, duration: 0.9 })
        .from(".ph-title .word", { yPercent: 120, rotate: 5, duration: 1.3, stagger: 0.08 }, "-=0.6")
        .from(".ph-sub, .ph-chip", { y: 20, opacity: 0, duration: 1, stagger: 0.06 }, "-=0.9")
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative overflow-hidden bg-ink pb-16 pt-32 md:min-h-[86svh] md:pb-0 md:pt-0">
      <div className="blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute right-[-10%] top-1/4 h-[36rem] w-[36rem] rounded-full bg-azure/20 blur-[140px]" />
      <div className="relative h-[46svh] md:absolute md:inset-0 md:h-auto">
        <Suspense fallback={null}>
          <PartsScene />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-5 md:min-h-[86svh] md:justify-center md:px-8">
        <nav aria-label={t("Você está em")} className="ph-crumb mb-6 flex items-center gap-2 font-wide text-[13px] text-white/50">
          <a href="/" className="transition-colors hover:text-white">{t("Início")}</a>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ice" aria-current="page">{t("Partes e peças")}</span>
        </nav>
        <h1 className="ph-title font-wide max-w-[12ch] text-[clamp(2.6rem,6.4vw,6rem)] font-semibold leading-[0.95] tracking-tight text-white">
          <SplitWords text={t("Partes e")} /> <SplitWords text={t("peças.")} className="word text-gradient" />
        </h1>
        <p className="ph-sub mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
          {t("Reposição a pronta entrega para lapidadoras e biseladoras chinesas. Monte sua lista e peça o preço de tudo de uma vez.")}
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {[t("{n} peças no catálogo", { n: PECAS_CATALOGO.length }), t("Pronta entrega"), t("Lapidadoras e biseladoras chinesas")].map((c) => (
            <li key={c} className="ph-chip rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] text-white/75 backdrop-blur-md">
              {c}
            </li>
          ))}
        </ul>
        <button
          onClick={() => scrollToId("catalogo")}
          className="ph-chip mt-10 inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowDown className="h-4 w-4 animate-bounce text-ice" /> {t("Ver catálogo")}
        </button>
      </div>
    </section>
  )
}
