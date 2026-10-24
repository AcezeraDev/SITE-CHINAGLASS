import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { t } from "@/i18n"
import { gsap, scrollState } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { CORTE0, CORTES, DESTAQUE0, ETAPAS, FIM, PECAS, PLANO, VIDRO, VIDRO_MM, etapaDaJornada, tempoDaJornada } from "@/three/jumboTempo"
import { Kicker } from "@/components/Kicker"

const JornadaCorte = lazy(() => import("@/three/JornadaCorte"))

// `curto` é o rótulo do trilho de progresso
const ATOS = [
  {
    t: "Carregamento",
    curto: "Carga",
    d: "Os braços com ventosas levantam a chapa do cavalete e a deitam na carregadora, sem esforço manual.",
    status: "Carregando",
  },
  {
    t: "Alimentação",
    curto: "Entrada",
    d: "A chapa rola sobre as rodas da carregadora e entra na mesa CNC já alinhada, pronta para o corte.",
    status: "Alimentando",
  },
  {
    t: "Corte CNC",
    curto: "Corte",
    d: "O pórtico percorre o plano de corte otimizado com a roda de diamante: menos sobra e mais peças por chapa.",
    status: "Cortando",
  },
  {
    t: "Destaque",
    curto: "Destaque",
    d: "Na mesa de destaque a chapa riscada se separa em peças sob medida, prontas para lapidar.",
    status: "Destacando",
  },
]

// o scroll para no fim de cada etapa, com a cena dela completa
const PARADAS = [0, ...ETAPAS.slice(1).map((p) => p - 0.02), 1]

const fmt = (n: number) => n.toFixed(1).padStart(6, "0")

/** Cena fixada: a linha de corte Jumbo funcionando, uma etapa por trecho de scroll */
export function Chapas3D() {
  const root = useRef<HTMLElement>(null)
  const [ato, setAto] = useState(0)
  const hud = useRef<{ x: HTMLElement | null; y: HTMLElement | null; bar: HTMLElement | null; pieces: HTMLElement | null }>({
    x: null,
    y: null,
    bar: null,
    pieces: null,
  })

  useEffect(() => {
    const feitos = CORTES.map(() => 0)
    const prog = { p: 0 }
    // scrub com atraso: a máquina acompanha o scroll com inércia, sem trancos
    const tween = gsap.to(prog, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        snap: { snapTo: PARADAS, duration: { min: 0.3, max: 0.9 }, delay: 0.25, ease: "power1.inOut" },
      },
      onUpdate: () => {
        const p = prog.p
        scrollState.jornada = p
        const etapa = etapaDaJornada(p)
        setAto((a) => (a === etapa ? a : etapa))
        // painel CNC atualizado direto no DOM, sem re-renderizar
        const r = tempoDaJornada(p)
        const roda = r < CORTE0 ? null : PLANO.em(Math.min(r, FIM) - CORTE0, feitos)
        const h = hud.current
        if (h.x) h.x.textContent = fmt(roda ? Math.max(0, ((roda.x + VIDRO[0] / 2) / VIDRO[0]) * VIDRO_MM[0]) : 0)
        if (h.y) h.y.textContent = fmt(roda ? Math.max(0, ((roda.z + VIDRO[1] / 2) / VIDRO[1]) * VIDRO_MM[1]) : 0)
        if (h.bar) h.bar.style.transform = `scaleX(${p})`
        if (h.pieces) h.pieces.textContent = String(r < DESTAQUE0 ? 1 : PECAS.length).padStart(2, "0")
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section ref={root} aria-label={t("Linha de corte em funcionamento")} className="relative h-[480vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_68%_55%,rgba(47,123,255,0.16),transparent_70%)]" />
        <Suspense fallback={null}>
          <JornadaCorte />
        </Suspense>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent md:bg-gradient-to-r md:from-ink/90 md:via-ink/20 md:to-transparent md:to-55%" />

        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 md:justify-center md:px-8 md:pb-0">
          <Kicker className="mb-6">{t("Linha de corte em funcionamento")}</Kicker>

          {/* títulos: troca com máscara e desfoque */}
          <div className="relative h-[13.5rem] max-w-md md:h-[15rem]">
            {ATOS.map((a, i) => (
              <div
                key={a.t}
                aria-hidden={i !== ato}
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]",
                  i === ato ? "translate-y-0 opacity-100 blur-0" : i < ato ? "-translate-y-8 opacity-0 blur-sm" : "translate-y-8 opacity-0 blur-sm"
                )}
              >
                <span className="font-mono text-sm text-white/40">
                  {String(i + 1).padStart(2, "0")} / {String(ATOS.length).padStart(2, "0")}
                </span>
                <h2 className="font-wide mt-2 text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-none tracking-tight text-white">{t(a.t)}</h2>
                <p className="mt-5 leading-relaxed text-white/65">{t(a.d)}</p>
              </div>
            ))}
          </div>

          {/* trilho de progresso com os 4 atos */}
          <ol className="mt-2 grid max-w-md grid-cols-4 gap-2" aria-label={t("Etapas")}>
            {ATOS.map((a, i) => (
              <li key={a.t} className="flex flex-col gap-2">
                <span className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
                  <span
                    className="absolute inset-0 origin-left bg-gradient-to-r from-azure to-ice transition-transform duration-500"
                    style={{ transform: `scaleX(${i < ato ? 1 : i === ato ? 0.5 : 0})` }}
                  />
                </span>
                <span className={cn("font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-500", i <= ato ? "text-white/80" : "text-white/30")}>
                  {t(a.curto)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* painel CNC */}
        <div className="glass pointer-events-none absolute bottom-10 right-8 z-10 hidden w-72 rounded-2xl p-4 font-mono text-[11px] text-white/70 md:block">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-[0.18em] text-white/45">CNC · Linha Jumbo</span>
            <span className="flex items-center gap-1.5 text-ice">
              <span className={cn("h-1.5 w-1.5 rounded-full", ato === 2 ? "animate-pulse bg-[#ff5a36]" : "bg-ice")} />
              {t(ATOS[ato].status)}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-white">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.15em] text-white/40">X mm</dt>
              <dd ref={(el) => { hud.current.x = el }} className="text-sm tabular-nums">0000.0</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.15em] text-white/40">Y mm</dt>
              <dd ref={(el) => { hud.current.y = el }} className="text-sm tabular-nums">0000.0</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.15em] text-white/40">{t("Peças")}</dt>
              <dd ref={(el) => { hud.current.pieces = el }} className="text-sm tabular-nums">01</dd>
            </div>
          </dl>
          <div className="mt-3 h-px overflow-hidden bg-white/10">
            <div ref={(el) => { hud.current.bar = el }} className="h-full origin-left scale-x-0 bg-ice" />
          </div>
          <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-white/35">{t("Chapa 4200 × 2800 mm · simulação")}</p>
        </div>
      </div>
    </section>
  )
}
