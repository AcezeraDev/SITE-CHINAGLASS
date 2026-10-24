import { Suspense, useEffect, useRef } from "react"
import { ArrowUpRight, Camera, Rotate3d } from "lucide-react"
import { DiamondMark } from "@/components/Logo"
import { CropMarks, MachineStage } from "@/components/MachineStage"
import { PROCESSO } from "@/data"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { Kicker } from "@/components/Kicker"
import { MODELOS_3D, type Modelo3D as Qual } from "@/three/modelos"

const etiqueta =
  "pointer-events-none absolute top-2 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ice backdrop-blur-md"

function Modelo3D({ qual }: { qual: Qual }) {
  const Modelo = MODELOS_3D[qual]
  return <Modelo className="absolute inset-0" />
}
// em tela de toque o modelo gira sozinho, sem arrastar
const toque = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

export function Processo() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      // computador: trilho horizontal fixado na tela
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!
        const dist = () => t.scrollWidth - window.innerWidth
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        gsap.to(".proc-bar", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), scrub: true },
        })
        // cada cartão gira levemente ao entrar, como uma chapa sendo posicionada
        gsap.utils.toArray<HTMLElement>(".proc-card").forEach((card) => {
          gsap.fromTo(
            card.querySelector(".proc-img"),
            { xPercent: 18, scale: 0.9, opacity: 0.4 },
            {
              xPercent: 0,
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center center", scrub: true },
            }
          )
        })
      })
      // celular: cartões aparecem ao rolar
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>(".proc-card").forEach((card) => {
          gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 88%" } })
        })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section id="processo" ref={root} className="blueprint relative overflow-hidden bg-ink-2 md:h-screen">
      <div className="absolute inset-x-0 top-0 hidden h-px bg-white/10 md:block">
        <div className="proc-bar h-full origin-left scale-x-0 bg-gradient-to-r from-azure to-ice" />
      </div>

      <div ref={track} className="flex flex-col gap-6 px-5 py-24 md:h-full md:w-max md:flex-row md:items-center md:gap-8 md:px-[6vw] md:py-0">
        <header className="shrink-0 md:w-[34vw] md:pr-10">
          <Kicker className="mb-5">{t("Linha de produção")}</Kicker>
          <h2 className="font-wide text-[clamp(2.2rem,4.6vw,4.4rem)] font-semibold leading-[0.98] tracking-tight text-white">
            {t("Uma máquina para cada etapa.")}
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-white/60">
            {t(
              "Da chapa que chega no cavalete à peça gravada a laser. Monte sua linha inteira com um único fornecedor e um único pós-venda."
            )}
          </p>
          <p className="mt-8 hidden items-center gap-3 font-mono text-xs text-white/40 md:flex">
            <span className="h-px w-10 bg-white/30" /> {t("role para percorrer")}
          </p>
        </header>

        {PROCESSO.map((e, i) => (
          <article
            key={e.n}
            // com modelo 3D o cartão é mais largo, para a foto e o 3D caberem lado a lado
            className={`proc-card group relative flex shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,#0d1730,#060a14_70%)] md:h-[76vh] ${
              e.modelo3d ? "md:w-[min(58rem,66vw)]" : "md:w-[min(34rem,40vw)]"
            }`}
          >
            {/* grade fina da prancha, mais forte no centro */}
            <div className="blueprint pointer-events-none absolute inset-0 [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_50%_45%,black,transparent_75%)]" />
            <CropMarks />

            <header className="relative z-10 flex items-center gap-3 px-7 pt-7">
              <DiamondMark className="h-3.5 w-4 text-ice" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
                {t("Etapa {n} / {total}", { n: e.n, total: String(PROCESSO.length).padStart(2, "0") })}
              </span>
            </header>
            <p className="font-wide relative z-10 px-7 pt-2 text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-none tracking-tight text-white">
              {t(e.etapa)}
              <span className="text-ice">.</span>
            </p>

            {e.modelo3d ? (
              // foto real à esquerda, modelo 3D à direita
              <div className="proc-img relative z-10 grid aspect-[4/3] grid-cols-2 md:aspect-auto md:min-h-0 md:flex-1">
                <div className="relative border-r border-dashed border-white/12">
                  <MachineStage src={e.img} alt={t(e.nome)} className="absolute inset-0 px-3" />
                  <span className={`${etiqueta} left-4 md:left-6`}>
                    <Camera className="h-3.5 w-3.5" /> {t("Foto real")}
                  </span>
                </div>
                <div className="relative">
                  <Suspense fallback={null}>
                    <Modelo3D qual={e.modelo3d} />
                  </Suspense>
                  <span className={`${etiqueta} right-4 md:right-6`}>
                    <Rotate3d className="h-3.5 w-3.5" /> {toque ? "3D" : t("3D · arraste para girar")}
                  </span>
                </div>
                <span className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded bg-ink px-2 py-0.5 font-mono text-[10px] text-ice">
                  {t(e.cota)}
                </span>
              </div>
            ) : (
              <MachineStage
                src={e.img}
                alt={t(e.nome)}
                cota={t(e.cota)}
                className="proc-img relative z-10 aspect-[4/3] px-4 md:aspect-auto md:min-h-0 md:flex-1"
              />
            )}

            <div className="relative z-10 border-t border-dashed border-white/12 px-7 pb-9 pt-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[15px] font-medium leading-snug text-white">{t(e.nome)}</h3>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("Ficha técnica: {nome}", { nome: t(e.nome) })}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-300 hover:border-ice hover:bg-ice hover:text-ink"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <dl className="mt-4 grid gap-1.5 font-mono text-[11px]">
                {e.specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <dt className="uppercase tracking-[0.12em] text-white/40">{t(k)}</dt>
                    <span className="mb-[3px] flex-1 border-b border-dotted border-white/15" aria-hidden="true" />
                    <dd className="text-white/85">{t(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* fio de conexão para a próxima etapa */}
            {i < PROCESSO.length - 1 && (
              <span className="absolute -right-8 top-1/2 hidden h-px w-8 bg-gradient-to-r from-ice/50 to-transparent md:block" aria-hidden="true" />
            )}
          </article>
        ))}
        <div className="hidden w-[6vw] shrink-0 md:block" />
      </div>
    </section>
  )
}
