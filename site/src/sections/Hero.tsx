import { lazy, Suspense, useEffect, useRef } from "react"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { DiamondMark } from "@/components/Logo"
import { Magnetic } from "@/components/Magnetic"
import { SplitWords } from "@/components/SplitWords"
import { t } from "@/i18n"
import { gsap, prefersReducedMotion, scrollState, scrollToId } from "@/lib/motion"

const HeroScene = lazy(() => import("@/three/HeroScene"))

// slugs de CATEGORIAS_MAQUINAS (maquinasCategorias.ts)
const ATALHOS = [
  { etapa: "Cortar", nome: "Mesas de corte CNC", slug: "mesa-de-corte" },
  { etapa: "Lapidar", nome: "Lapidadoras e bilaterais", slug: "lapidacao" },
  { etapa: "Lavar", nome: "Lavadoras de vidro", slug: "lavadora" },
  { etapa: "Laminar", nome: "Forno de laminação EVA", slug: "forno-eva" },
]

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  // rolagem → cena 3D e saída do texto
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(scrollState, {
        hero: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
      gsap.to(".hero-content", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "20% top", end: "80% top", scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // entrada depois da abertura
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 1 })
        .from(".hero-title .word", { yPercent: 120, rotate: 6, duration: 1.4, stagger: 0.07 }, "-=0.7")
        .from(".hero-sub", { y: 24, opacity: 0, duration: 1.1 }, "-=1")
        .from(".hero-cta > *", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, "-=0.9")
        .from(".hero-links li", { y: 30, opacity: 0, duration: 1, stagger: 0.07 }, "-=0.8")
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <section id="topo" ref={root} className="relative min-h-[100svh] overflow-hidden bg-ink md:h-[100svh] md:min-h-[680px]">
      <Suspense fallback={<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,#0b2a5c,#05080f_60%)]" />}>
        <HeroScene />
      </Suspense>

      {/* escurecimento embaixo, onde fica o texto, para leitura */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_85%,rgba(5,8,15,0.85),transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="hero-content relative z-10 mx-auto flex h-full min-h-[100svh] max-w-7xl flex-col items-center justify-end px-5 pb-8 pt-[38svh] text-center md:min-h-0 md:px-8 md:pb-10 md:pt-[34svh]">
        <p className="hero-eyebrow mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-ink/50 py-1.5 pl-3 pr-4 backdrop-blur-md">
          <DiamondMark className="h-3.5 w-4 text-ice" />
          <span className="font-wide text-[12px] font-medium text-white/85 sm:text-[13px]">{t("Máquinas para a indústria do vidro")}</span>
        </p>

        {/* duas linhas fixas no computador para o diamante caber em cima */}
        <h1 className="hero-title font-wide text-[clamp(2.3rem,4.9vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-white">
          <SplitWords text={t("Do corte ao")} /> <SplitWords text={t("acabamento,")} className="word text-gradient" />
          <br className="hidden md:block" /> <SplitWords text={t("a linha completa.")} />
        </h1>

        <p className="hero-sub mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          {t(
            "Mesas de corte CNC, lapidadoras, bilaterais, lavadoras e fornos de laminação com o melhor custo-benefício do mercado. Instalação, treinamento e assistência técnica com equipe própria."
          )}
        </p>

        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <button
              onClick={() => scrollToId("orcamento")}
              className="group inline-flex h-14 cursor-pointer items-center gap-3 rounded-2xl bg-white pl-6 pr-2 font-medium text-ink transition-colors duration-200 hover:bg-ice"
            >
              {t("Pedir orçamento")}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </Magnetic>
          <a
            href="/maquinas"
            className="glass inline-flex h-14 items-center rounded-2xl px-6 font-medium text-white transition-colors duration-200 hover:bg-white/10"
          >
            {t("Ver máquinas")}
          </a>
        </div>

        {/* atalhos para as linhas mais procuradas, direto no catálogo filtrado */}
        <nav aria-label={t("Linhas de máquinas")} className="hero-links mt-10 w-full md:mt-14">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
            {ATALHOS.map((a) => (
              <li key={a.slug}>
                <a
                  href={`/maquinas?linha=${a.slug}`}
                  className="group flex h-full items-center justify-between gap-3 bg-ink/75 px-4 py-4 text-left backdrop-blur-xl transition-colors duration-200 hover:bg-ink-2/90 md:px-6 md:py-5"
                >
                  <span>
                    <span className="block font-wide text-[12px] text-ice/80">{t(a.etapa)}</span>
                    <span className="mt-1 block text-sm text-white md:text-base">{t(a.nome)}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ice" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* indicador de rolagem: trilho fino com um ponto de luz descendo, como luz atravessando o vidro */}
      <button
        onClick={() => scrollToId("numeros")}
        className="group absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 cursor-pointer flex-col items-center gap-3 xl:flex"
        aria-label={t("Rolar para baixo")}
      >
        <span className="relative h-24 w-px overflow-hidden bg-gradient-to-b from-white/5 via-white/20 to-white/5">
          <span className="scroll-light absolute left-1/2 top-0 h-8 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-ice to-transparent" />
        </span>
        <DiamondMark className="h-3 w-3.5 text-white/40 transition-colors duration-300 group-hover:text-ice" />
        <span className="font-wide text-[11px] text-white/45 transition-colors duration-300 group-hover:text-white">{t("role")}</span>
      </button>
    </section>
  )
}
