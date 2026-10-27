import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react"
import { DiamondMark } from "@/components/Logo"
import { Magnetic } from "@/components/Magnetic"
import { SplitWords } from "@/components/SplitWords"
import { NumberTicker } from "@/components/ui/number-ticker"
import { t } from "@/i18n"
import { gsap, prefersReducedMotion, scrollToId } from "@/lib/motion"
import { CATEGORIAS_MAQUINAS, TOTAL_MAQUINAS } from "@/maquinasCategorias"

// uma máquina de cada linha, com fundo recortado, na ordem do processo
const LINHAS = [
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

const INTERVALO = 4.2 // segundos em cada linha antes de passar para a próxima
const MOLA = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const
const num = (i: number) => String(i + 1).padStart(2, "0")

/** Abertura do catálogo: título à esquerda e, à direita, uma vitrine que troca de máquina conforme a linha escolhida no índice */
export function HeroMaquinas({ onLinha }: { onLinha: (slug: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const [ativo, setAtivo] = useState(0)
  const [parado, setParado] = useState(false)
  const [naTela, setNaTela] = useState(true)
  const reduzido = useRef(prefersReducedMotion()).current
  const linha = LINHAS[ativo]

  // inclinação da máquina seguindo o mouse, com mola
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), MOLA)
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), MOLA)
  const luzX = useSpring(useTransform(mx, [-0.5, 0.5], [30, 70]), MOLA)
  const luz = useTransform(luzX, (x) => `radial-gradient(ellipse 55% 45% at ${x}% 62%, rgba(143,233,255,0.18), transparent 70%)`)

  // passa sozinho de linha em linha; para com o mouse em cima, fora da tela ou com movimento reduzido
  useEffect(() => {
    if (reduzido || parado || !naTela) return
    const id = setTimeout(() => setAtivo((a) => (a + 1) % LINHAS.length), INTERVALO * 1000)
    return () => clearTimeout(id)
  }, [ativo, parado, naTela, reduzido])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting))
    io.observe(root.current!)
    return () => io.disconnect()
  }, [])

  // carrega as fotos de antemão para a troca não piscar
  useEffect(() => {
    LINHAS.forEach((l) => (new Image().src = l.img))
  }, [])

  // entrada e paralaxe de rolagem
  useEffect(() => {
    if (reduzido) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
        .from(".hm-crumb", { y: 16, opacity: 0, duration: 0.9 })
        .from(".hm-title .word", { yPercent: 120, rotate: 5, duration: 1.3, stagger: 0.08 }, "-=0.6")
        .from(".hm-conta", { scale: 0, opacity: 0, duration: 0.7, ease: "back.out(2.2)" }, "-=0.8")
        .from(".hm-lado > *", { y: 20, opacity: 0, duration: 1, stagger: 0.07 }, "-=1")
        .from(".hm-vitrine", { y: 70, opacity: 0, scale: 0.96, duration: 1.4 }, "-=1.2")
        .from(".hm-indice li", { x: 24, opacity: 0, duration: 0.8, stagger: 0.04 }, "-=1")
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 }
      gsap.to(".hm-fundo", { yPercent: 30, ease: "none", scrollTrigger: st })
      gsap.to(".hm-texto", { y: 80, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "60% top" } })
      gsap.to(".hm-vitrine", { y: -40, scale: 0.97, ease: "none", scrollTrigger: st })
    }, root)
    return () => ctx.revert()
  }, [reduzido])

  const linhas = CATEGORIAS_MAQUINAS.length

  return (
    <section ref={root} className="relative overflow-hidden bg-ink pb-20 pt-28 md:pb-28 md:pt-32">
      <div className="hm-fundo blueprint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute right-[-10%] top-[20%] h-[40rem] w-[50rem] rounded-full bg-azure/15 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* trilha de navegação e selo de catálogo */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={t("Você está em")} className="hm-crumb flex items-center gap-2 font-wide text-[13px] text-white/50">
            <a href="/" className="transition-colors hover:text-white">{t("Início")}</a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ice" aria-current="page">{t("Máquinas")}</span>
          </nav>
          <p className="hm-crumb flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/55">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-ice/40 bg-ice/[0.06]">
              <DiamondMark className="h-3 w-3.5 text-ice" />
            </span>
            China Glass <span className="text-white/25">/</span> {t("Catálogo completo")}
          </p>
        </div>

        <div className="mt-10 grid items-center gap-12 md:mt-14 lg:grid-cols-12 lg:gap-10">
          {/* texto, ações e números */}
          <div className="hm-texto lg:col-span-5">
            <h1 className="hm-title font-wide text-[clamp(2.7rem,6vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-white">
              <SplitWords text={t("Todas as")} />
              <br />
              <span className="whitespace-nowrap">
                <SplitWords text={t("máquinas.")} className="word text-gradient" />
                <sup className="hm-conta ml-2 inline-block align-top font-mono text-[clamp(0.75rem,1vw,0.95rem)] font-normal tracking-[0.1em] text-ice">
                  ({TOTAL_MAQUINAS})
                </sup>
              </span>
            </h1>

            <div className="hm-lado mt-8 flex flex-col gap-8">
              <p className="max-w-md text-base leading-relaxed text-white/65 md:text-lg">
                {t("Separado por linha de produção: abra a ficha técnica de cada máquina e peça o orçamento direto dela.")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Magnetic strength={0.12}>
                  <button
                    onClick={() => scrollToId("catalogo")}
                    className="group inline-flex h-12 cursor-pointer items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-ink transition-colors hover:bg-ice"
                  >
                    {t("Ver catálogo")}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:translate-y-0.5">
                      <ArrowDown className="h-4 w-4" />
                    </span>
                  </button>
                </Magnetic>
                <Magnetic strength={0.12}>
                  <button
                    onClick={() => scrollToId("orcamento")}
                    className="group inline-flex h-12 cursor-pointer items-center gap-3 rounded-full border border-white/15 py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition-colors hover:border-ice/50"
                  >
                    {t("Pedir orçamento")}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </Magnetic>
              </div>

              {/* números lado a lado, separados por fios */}
              <dl className="grid max-w-md grid-cols-3 border-t border-white/10">
                {[
                  [TOTAL_MAQUINAS, t("Máquinas")],
                  [linhas, t("Linhas")],
                  [1, t("Ano de garantia")],
                ].map(([n, r], i) => (
                  <div key={String(r)} className="flex flex-col-reverse gap-1 border-white/10 pt-5 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{r}</dt>
                    <dd className="font-wide text-3xl font-semibold tracking-tight text-white md:text-4xl">
                      <NumberTicker value={Number(n)} delay={0.6 + i * 0.12} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* vitrine: a máquina da linha ativa e o índice das linhas */}
          <div
            className="hm-vitrine lg:col-span-7"
            onPointerEnter={() => setParado(true)}
            onPointerLeave={() => {
              setParado(false)
              mx.set(0)
              my.set(0)
            }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              mx.set((e.clientX - r.left) / r.width - 0.5)
              my.set((e.clientY - r.top) / r.height - 0.5)
            }}
          >
            <div className="glass relative grid overflow-hidden rounded-[2rem] md:grid-cols-[1fr_17rem]">
              {/* palco */}
              <div className="relative h-[340px] overflow-hidden [perspective:1200px] md:h-[500px]">
                <div className="blueprint pointer-events-none absolute inset-0 [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_50%_60%,black,transparent_75%)]" />
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ background: luz }}
                />

                {/* sombra no chão */}
                <div className="pointer-events-none absolute bottom-[22%] left-1/2 h-10 w-[60%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />

                {/* a máquina entra como se o vidro fosse cortado: um risco de luz atravessa e revela a foto */}
                <motion.div className="absolute inset-x-4 bottom-[18%] top-[12%] md:inset-x-6" style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.img
                      key={linha.img}
                      src={linha.img}
                      alt={t(linha.cat.nome)}
                      initial={reduzido ? { opacity: 0 } : { clipPath: "inset(0% 0% 0% 100%)", x: 40, scale: 0.94 }}
                      animate={reduzido ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", x: 0, scale: 1 }}
                      exit={reduzido ? { opacity: 0 } : { opacity: 0, x: -50, scale: 0.94, transition: { duration: 0.35 } }}
                      transition={{ ...MOLA, clipPath: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } }}
                      className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.55)]"
                      draggable={false}
                    />
                  </AnimatePresence>
                  {!reduzido && (
                    <motion.span
                      key={`risco-${ativo}`}
                      aria-hidden="true"
                      initial={{ left: "100%", opacity: 1 }}
                      animate={{ left: "0%", opacity: [1, 1, 0] }}
                      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1], opacity: { duration: 0.9, times: [0, 0.75, 1] } }}
                      className="pointer-events-none absolute -bottom-4 -top-4 w-[2px] bg-[linear-gradient(to_bottom,transparent,#ffffff_20%,var(--ice)_80%,transparent)] shadow-[0_0_18px_4px_rgba(143,233,255,0.55)]"
                    />
                  )}
                </motion.div>

                {/* legenda da linha ativa */}
                <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4 md:inset-x-8 md:bottom-7">
                  <div className="min-w-0 overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div key={ativo} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={MOLA}>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ice">
                          {t("Linha")} {num(ativo)} · {linha.cat.total} {t(linha.cat.total === 1 ? "modelo" : "modelos")}
                        </p>
                        <p className="mt-1 line-clamp-2 font-wide text-xl leading-tight font-medium tracking-tight text-white md:text-2xl">{t(linha.cat.nome)}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLinha(linha.linha)}
                    aria-label={t("Ver {linha} no catálogo", { linha: t(linha.cat.nome) })}
                    className="group flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-ice"
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* índice das linhas: passar o mouse mostra, clicar abre no catálogo */}
              <ol className="hm-indice flex gap-1 overflow-x-auto border-t border-white/10 p-2 [scrollbar-width:none] md:flex-col md:overflow-visible md:border-l md:border-t-0 md:p-3">
                {LINHAS.map((l, i) => {
                  const sel = i === ativo
                  return (
                    <li key={l.linha} className="shrink-0">
                      <button
                        type="button"
                        onPointerEnter={() => setAtivo(i)}
                        onFocus={() => setAtivo(i)}
                        onClick={() => onLinha(l.linha)}
                        aria-current={sel || undefined}
                        aria-label={t("Ver {linha} no catálogo", { linha: t(l.cat.nome) })}
                        className="relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left md:py-[9px]"
                      >
                        {sel && (
                          <motion.span layoutId="hm-ativo" transition={MOLA} className="absolute inset-0 overflow-hidden rounded-xl bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(143,233,255,0.18)]">
                            {/* tempo até a próxima linha */}
                            {!reduzido && !parado && naTela && (
                              <motion.span
                                key={ativo}
                                className="absolute bottom-0 left-0 h-px bg-ice"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: INTERVALO, ease: "linear" }}
                              />
                            )}
                          </motion.span>
                        )}
                        <span className={`relative font-mono text-[10px] transition-colors ${sel ? "text-ice" : "text-white/30"}`}>{num(i)}</span>
                        <span className={`relative whitespace-nowrap text-[13px] transition-colors md:flex-1 md:truncate ${sel ? "text-white" : "text-white/55"}`}>
                          {t(l.cat.nome)}
                        </span>
                        <span className={`relative hidden font-mono text-[10px] transition-colors md:inline ${sel ? "text-white/60" : "text-white/25"}`}>{l.cat.total}</span>
                      </button>
                    </li>
                  )
                })}
                <li className="shrink-0 md:mt-auto md:border-t md:border-white/10 md:pt-2">
                  <a href="/pecas" className="group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/55 transition-colors hover:text-white">
                    <span className="font-mono text-[10px] text-ice">+</span>
                    <span className="whitespace-nowrap md:flex-1">{t("Peças a pronta entrega")}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
