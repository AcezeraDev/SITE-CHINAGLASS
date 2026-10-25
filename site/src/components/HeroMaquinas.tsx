import { Suspense, lazy, useEffect, useRef } from "react"
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronRight, Plus } from "lucide-react"
import { DiamondMark } from "@/components/Logo"
import { SplitWords } from "@/components/SplitWords"
import { BorderBeam } from "@/components/ui/border-beam"
import { NumberTicker } from "@/components/ui/number-ticker"
import { t } from "@/i18n"
import { gsap, prefersReducedMotion, scrollToId } from "@/lib/motion"
import { CATEGORIAS_MAQUINAS, TOTAL_MAQUINAS } from "@/maquinasCategorias"

const DiamanteVidro = lazy(() => import("@/three/DiamanteVidro"))

// uma máquina de cada linha, com fundo recortado, na ordem em que passam na esteira
const ESTEIRA = [
  { img: "/img/mesa-3em1-cut.webp", linha: "mesa-de-corte" },
  { img: "/img/lapidadora-copo-10-cut.webp", linha: "lapidacao" },
  { img: "/img/bilateral-20-cut.webp", linha: "bilateral" },
  { img: "/img/furadeira-4-cut.webp", linha: "furadeira" },
  { img: "/img/lavadora-vertical-cut.webp", linha: "lavadora" },
  { img: "/img/jateadora-cut.webp", linha: "jateadora" },
  { img: "/img/laser-140w-cut.webp", linha: "laser" },
  { img: "/img/centro-usinagem-cut.webp", linha: "centro-usinagem" },
  { img: "/img/forno-eva-cut.webp", linha: "forno-eva" },
  { img: "/img/carregadora-mesa-cut.webp", linha: "carregadoras" },
].map((m) => ({ ...m, cat: CATEGORIAS_MAQUINAS.find((c) => c.slug === m.linha)! }))

// peças na frente do vidro, como retalhos da produção
const RETALHOS = [
  { img: "/img/pecas/bomba-agua-cut.webp", pos: "left-[4%] -bottom-10", h: "h-24 md:h-32", d: 0, prof: 1 },
  { img: "/img/pecas/correia-cut.webp", pos: "left-[24%] -bottom-8", h: "h-14 md:h-20", d: -1.2, prof: 0.55 },
  { img: "/img/pecas/coifa-lapidadora-100-cut.webp", pos: "right-[30%] -bottom-9", h: "h-16 md:h-24", d: -2.1, prof: 0.8 },
  { img: "/img/pecas/amperimetro-cut.webp", pos: "hidden md:block right-[47%] -bottom-7", h: "h-16", d: -0.6, prof: 0.4 },
]
const VELOCIDADE = 46 // px por segundo
const CHAPA_MM = 3660 // largura da chapa na régua, como numa mesa de corte
const regua = Array.from({ length: 19 }, (_, i) => i * 250)

/** Abertura do catálogo: título largo e as máquinas passando numa esteira sobre uma chapa de vidro com o logo gravado */
export function HeroMaquinas({ onLinha }: { onLinha: (slug: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const chapa = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLDivElement>(null)
  const roletes = useRef<HTMLDivElement>(null)
  const ponte = useRef<HTMLDivElement>(null)
  const ponteMm = useRef<HTMLSpanElement>(null)

  // entrada
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
        .from(".hm-crumb", { y: 16, opacity: 0, duration: 0.9 })
        .from(".hm-title .word", { yPercent: 120, rotate: 5, duration: 1.3, stagger: 0.08 }, "-=0.6")
        .from(".hm-lado > *", { y: 20, opacity: 0, duration: 1, stagger: 0.07 }, "-=1")
        .from(".hm-chapa", { y: 60, opacity: 0, scale: 0.97, duration: 1.4 }, "-=1")
        .from(".hm-retalho", { opacity: 0, duration: 1.2, stagger: 0.08 }, "-=1")
    }, root)
    return () => ctx.revert()
  }, [])

  // paralaxe: ao rolar, cada camada anda numa velocidade e a chapa deita como vidro sobre a mesa;
  // com o mouse, as peças da frente e o diamante gravado se deslocam em profundidades diferentes
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const st = () => ({ trigger: root.current, start: "top top", end: "bottom top", scrub: 0.7 })
      gsap.to(".hm-fundo", { yPercent: 35, ease: "none", scrollTrigger: st() })
      gsap.to(".hm-brilho", { y: 240, scale: 1.3, ease: "none", scrollTrigger: st() })
      gsap.to(".hm-texto", { y: -110, opacity: 0.15, ease: "none", scrollTrigger: st() })
      gsap.to(".hm-palco", { rotateX: 24, y: -20, scale: 0.93, ease: "none", scrollTrigger: st() })
      gsap.to(".hm-gravado", { y: 80, ease: "none", scrollTrigger: st() })
      gsap.utils.toArray<HTMLElement>(".hm-retalho-rolagem").forEach((el) =>
        gsap.to(el, { y: -Number(el.dataset.prof) * 280, rotate: (Number(el.dataset.prof) - 0.6) * 18, ease: "none", scrollTrigger: st() })
      )
    }, root)
    if (!window.matchMedia("(pointer: fine)").matches) return () => ctx.revert()
    const camadas = gsap.utils.toArray<HTMLElement>(".hm-retalho-mouse", root.current).map((el) => ({
      prof: Number(el.dataset.prof),
      x: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }),
    }))
    const gx = gsap.quickTo(".hm-gravado-mouse", "x", { duration: 1.4, ease: "power3" })
    const gy = gsap.quickTo(".hm-gravado-mouse", "y", { duration: 1.4, ease: "power3" })
    const ry = gsap.quickTo(".hm-palco", "rotationY", { duration: 1.2, ease: "power3" })
    const move = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      for (const c of camadas) {
        c.x(nx * c.prof * 60)
        c.y(ny * c.prof * 36)
      }
      gx(-nx * 26)
      gy(-ny * 16)
      ry(nx * 5)
    }
    window.addEventListener("pointermove", move)
    return () => {
      window.removeEventListener("pointermove", move)
      ctx.revert()
    }
  }, [])

  // esteira: anda sozinha, freia com o mouse em cima e a máquina no meio da chapa cresce e acende
  useEffect(() => {
    const box = chapa.current!
    const el = trilho.current!
    if (prefersReducedMotion()) return
    const itens = [...el.children] as HTMLElement[]
    const vel = { v: VELOCIDADE }
    let x = 0
    const tick = (tempo: number, dt: number) => {
      // ponte de corte vai e volta devagar sobre a chapa, mostrando a posição na régua
      const vai = (Math.sin(tempo * 0.32) + 1) / 2
      if (ponte.current) ponte.current.style.transform = `translate3d(${vai * (box.clientWidth - 120) + 60}px,0,0)`
      if (ponteMm.current) {
        ponteMm.current.textContent = `X ${(vai * CHAPA_MM).toFixed(1)}`
        // da metade para a direita a etiqueta passa para o outro lado da ponte, para não sair da chapa
        ponteMm.current.style.transform = vai > 0.5 ? "translateX(calc(-100% - 24px))" : ""
      }
      const metade = el.scrollWidth / 2
      x = (x - (vel.v * dt) / 1000) % metade
      el.style.transform = `translate3d(${x}px,0,0)`
      if (roletes.current) roletes.current.style.backgroundPositionX = `${x}px`
      const w = box.clientWidth
      const centro = w / 2
      for (const it of itens) {
        const meio = it.offsetLeft + x + it.offsetWidth / 2
        const p = Math.max(0, 1 - Math.abs(meio - centro) / (w * 0.42))
        const s = p * p * (3 - 2 * p)
        it.style.setProperty("--p", s.toFixed(3))
      }
    }
    gsap.ticker.add(tick)
    const frear = () => gsap.to(vel, { v: 0, duration: 0.8, ease: "power2.out" })
    const soltar = () => gsap.to(vel, { v: VELOCIDADE, duration: 1.2, ease: "power2.in" })
    box.addEventListener("pointerenter", frear)
    box.addEventListener("pointerleave", soltar)
    return () => {
      gsap.ticker.remove(tick)
      box.removeEventListener("pointerenter", frear)
      box.removeEventListener("pointerleave", soltar)
    }
  }, [])

  const linhas = CATEGORIAS_MAQUINAS.length

  return (
    <section ref={root} className="relative overflow-hidden bg-ink pb-24 pt-28 md:pb-32 md:pt-36">
      <div className="hm-fundo blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_20%,black,transparent_70%)]" />
      <div className="hm-brilho pointer-events-none absolute left-1/2 top-[38%] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-azure/15 blur-[160px]" />

      <div className="hm-texto relative mx-auto max-w-7xl px-5 md:px-8">
        <nav aria-label={t("Você está em")} className="hm-crumb flex items-center gap-2 font-wide text-[13px] text-white/50">
          <a href="/" className="transition-colors hover:text-white">{t("Início")}</a>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ice" aria-current="page">{t("Máquinas")}</span>
        </nav>

        {/* selo: diamante num quadrado, como um rótulo de catálogo */}
        <p className="hm-crumb mt-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/60 md:mt-14">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-ice/40 bg-ice/[0.06]">
            <DiamondMark className="h-3 w-3.5 text-ice" />
          </span>
          China Glass <span className="text-white/25">/</span> {t("Catálogo completo")}
        </p>

        <h1 className="hm-title mt-5 font-wide text-[clamp(2.8rem,7.4vw,6.9rem)] font-semibold leading-[0.9] tracking-[-0.035em] text-white md:whitespace-nowrap">
          <SplitWords text={t("Todas as")} /> <SplitWords text={t("máquinas.")} className="word text-gradient" />
        </h1>

        <div className="mt-10 grid gap-10 border-t border-white/10 pt-8 md:mt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* números contando e diferenciais */}
          <div className="hm-lado flex flex-col gap-7">
            <dl className="grid w-fit grid-cols-3 divide-x divide-white/10">
              {[
                [TOTAL_MAQUINAS, t("Máquinas")],
                [linhas, t("Linhas")],
                [1, t("Ano de garantia")],
              ].map(([n, r], i) => (
                <div key={String(r)} className={i === 0 ? "pr-6 md:pr-10" : "px-6 md:px-10"}>
                  <dt className="sr-only">{r}</dt>
                  <dd className="font-wide text-4xl font-semibold tracking-tight text-white md:text-5xl">
                    <NumberTicker value={Number(n)} delay={0.6 + i * 0.12} />
                  </dd>
                  <dd aria-hidden="true" className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{r}</dd>
                </div>
              ))}
            </dl>
            <ul className="flex flex-wrap gap-2">
              {[t("Garantia de 1 ano"), t("Instalação e treinamento"), t("Assistência técnica"), t("Peças a pronta entrega")].map((d) => (
                <li key={d} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2.5 pr-3.5 text-xs text-white/70 backdrop-blur-md">
                  <Plus className="h-3 w-3 text-ice" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* texto e ações */}
          <div className="hm-lado flex flex-col gap-7 lg:items-end lg:text-right">
            <p className="max-w-md text-base leading-relaxed text-white/65 md:text-lg">
              {t("O catálogo completo da China Glass, separado pelas mesmas linhas do site atual. Abra a ficha técnica de cada máquina e peça o orçamento direto dela.")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollToId("catalogo")}
                className="group inline-flex h-12 cursor-pointer items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-ink transition-colors hover:bg-ice"
              >
                {t("Ver catálogo")}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:rotate-[-45deg]">
                  <ArrowDown className="h-4 w-4" />
                </span>
              </button>
              <button
                onClick={() => scrollToId("orcamento")}
                className="group inline-flex h-12 cursor-pointer items-center gap-3 rounded-full border border-white/15 py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition-colors hover:border-ice/50"
              >
                {t("Pedir orçamento")}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* a chapa de vidro com a esteira */}
      <div className="relative mt-10 px-3 [perspective:1600px] md:mt-12 md:px-8">
        <div className="hm-palco origin-bottom [transform-style:preserve-3d]">
        <div
          ref={chapa}
          className="hm-chapa vitrine-chapa relative mx-auto h-[300px] max-w-[1600px] overflow-hidden rounded-[2rem] md:h-[400px] md:rounded-[2.5rem]"
        >
          {/* gravado no vidro: o diamante e o nome */}
          <div className="blueprint pointer-events-none absolute inset-0 [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[38%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(143,233,255,0.16),transparent_65%)]" />
          <div className="hm-gravado pointer-events-none absolute inset-0">
            <div className="hm-gravado-mouse absolute inset-0">
              <Suspense fallback={<DiamondMark draw className="absolute left-1/2 top-1/2 h-[70%] w-auto -translate-x-1/2 -translate-y-[54%] text-ice/[0.13]" />}>
                <DiamanteVidro className="absolute left-1/2 top-[-12%] h-[96%] w-[42%] -translate-x-1/2 opacity-80 mix-blend-screen" />
              </Suspense>
            </div>
          </div>

          <BorderBeam size={220} duration={11} colorFrom="#8fe9ff" colorTo="#2f7bff" borderWidth={1.5} />
          <BorderBeam size={140} duration={11} delay={5.5} colorFrom="#ffffff" colorTo="#8fe9ff" borderWidth={1} />

          {/* aresta lapidada brilhando no topo */}
          <span className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),rgba(143,233,255,0.6),transparent)]" />

          {/* régua da mesa de corte */}
          <div className="pointer-events-none absolute inset-x-12 top-0 h-6 overflow-hidden md:inset-x-16" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-[5px] [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0_1px,transparent_1px_10px)]" />
            <div className="absolute inset-x-0 top-0 h-[10px] [background-image:repeating-linear-gradient(90deg,rgba(143,233,255,0.5)_0_1px,transparent_1px_100px)]" />
            {regua.map((mm, i) => (
              <span key={mm} className="absolute top-[11px] -translate-x-1/2 font-mono text-[8px] text-white/30" style={{ left: i * 100 }}>
                {mm}
              </span>
            ))}
          </div>

          {/* fixadores de inox nos cantos, como num painel de vidro */}
          {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((c) => (
            <span
              key={c}
              aria-hidden="true"
              className={`pointer-events-none absolute z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#a9b5c6_38%,#3b4658_78%)] shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.25)] ${c}`}
            >
              <span className="h-[1.5px] w-2 rotate-45 rounded-full bg-[#2a3342]" />
            </span>
          ))}

          <span className="pointer-events-none absolute left-6 top-9 font-wide text-[10px] font-semibold tracking-[0.42em] text-white/45 md:left-10 md:top-10 md:text-[11px]">CHINA GLASS</span>
          <span className="pointer-events-none absolute right-6 top-9 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 md:right-10 md:top-10">
            {t("{n} linhas", { n: linhas })} · {CHAPA_MM} mm
          </span>

          {/* ponte de corte CNC atravessando a chapa */}
          <div ref={ponte} className="pointer-events-none absolute bottom-[34px] left-0 top-6 z-10 w-0 md:bottom-[42px]" style={{ transform: "translate3d(30vw,0,0)" }} aria-hidden="true">
            <span className="absolute inset-y-0 -left-px w-[2px] bg-[linear-gradient(to_bottom,rgba(143,233,255,0.9),rgba(143,233,255,0.15)_70%,transparent)] shadow-[0_0_14px_rgba(143,233,255,0.7)]" />
            <span className="absolute inset-y-0 -left-8 w-16 bg-[linear-gradient(90deg,transparent,rgba(143,233,255,0.07),transparent)]" />
            <span className="absolute -left-[7px] -top-1 h-3.5 w-3.5 rotate-45 rounded-[3px] border border-ice/80 bg-ink shadow-[0_0_10px_rgba(143,233,255,0.8)]" />
            <span ref={ponteMm} className="absolute left-3 top-1 whitespace-nowrap rounded-md border border-ice/25 bg-ink/70 px-1.5 py-0.5 font-mono text-[9px] text-ice backdrop-blur-sm">
              X 0.0
            </span>
          </div>

          {/* máquinas: a lista vai duas vezes para a volta não ter emenda */}
          <div
            ref={trilho}
            className="absolute bottom-[34px] left-0 flex w-max items-end will-change-transform motion-reduce:relative motion-reduce:w-full motion-reduce:overflow-x-auto md:bottom-[42px]"
          >
            {[...ESTEIRA, ...ESTEIRA].map((m, n) => (
              <button
                key={n}
                type="button"
                onClick={() => onLinha(m.linha)}
                tabIndex={n < ESTEIRA.length ? 0 : -1}
                aria-hidden={n >= ESTEIRA.length || undefined}
                aria-label={t("Ver {linha} no catálogo", { linha: t(m.cat.nome) })}
                className="group relative flex w-[230px] shrink-0 cursor-pointer flex-col items-center px-4 [--p:0.4] md:w-[340px] md:px-6"
              >
                <span
                  className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors md:text-[11px]"
                  style={{ opacity: "calc(0.35 + var(--p) * 0.65)" }}
                >
                  <span className="text-ice">{t(m.cat.nome)}</span>
                  <span className="text-white/40">{m.cat.total}</span>
                  <ArrowUpRight className="h-3 w-3 text-white/50 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <img
                  src={m.img}
                  alt=""
                  loading={n < 4 ? "eager" : "lazy"}
                  className="h-[150px] w-full origin-bottom object-contain drop-shadow-[0_22px_22px_rgba(0,0,0,0.6)] transition-[filter] duration-300 group-hover:drop-shadow-[0_22px_30px_rgba(143,233,255,0.25)] md:h-[230px]"
                  style={{ transform: "scale(calc(0.72 + var(--p) * 0.34))", opacity: "calc(0.45 + var(--p) * 0.55)" }}
                />
              </button>
            ))}
          </div>

          {/* roletes da esteira, girando junto com as máquinas */}
          <div className="absolute inset-x-0 bottom-0 h-[34px] border-t border-white/10 bg-ink/40 md:h-[42px]">
            <div
              ref={roletes}
              className="absolute inset-x-0 top-2 h-3 [background-image:radial-gradient(circle_at_50%_50%,rgba(143,233,255,0.45)_0_2px,rgba(255,255,255,0.12)_2.5px_5.5px,transparent_6px)] [background-size:28px_12px] md:top-3"
            />
          </div>
          {/* reflexo forte do vidro por cima de tudo */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.05)_30%,transparent_38%,transparent_62%,rgba(255,255,255,0.04)_70%,transparent_76%)]" />
        </div>
        </div>

        {/* retalhos: peças na frente do vidro */}
        <div className="pointer-events-none absolute inset-x-3 bottom-0 mx-auto max-w-[1600px] md:inset-x-8">
          {RETALHOS.map((r) => (
            <span key={r.img} data-prof={r.prof} className={`hm-retalho-rolagem absolute ${r.pos}`}>
              <span data-prof={r.prof} className="hm-retalho-mouse block">
                <img
                  src={r.img}
                  alt=""
                  className={`hm-retalho vit-peca block w-auto drop-shadow-[0_18px_18px_rgba(0,0,0,0.65)] ${r.h}`}
                  style={{ animationDelay: `${r.d}s` }}
                />
              </span>
            </span>
          ))}
          <a
            href="/pecas"
            className="hm-retalho glass pointer-events-auto absolute -bottom-6 right-[4%] flex items-center gap-3 rounded-2xl py-2.5 pl-4 pr-3 transition-colors hover:border-ice/40 md:-bottom-7"
          >
            <span className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ice md:text-[10px]">{t("Peças")}</span>
              <span className="text-xs text-white md:text-sm">{t("Peças a pronta entrega")}</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
