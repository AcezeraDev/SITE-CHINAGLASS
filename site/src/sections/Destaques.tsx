import { useEffect, useRef } from "react"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { CropMarks, MachineStage } from "@/components/MachineStage"
import { SplitWords } from "@/components/SplitWords"
import { DESTAQUES, type Destaque } from "@/data"
import { t } from "@/i18n"
import { gsap, scrollToId } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Kicker } from "@/components/Kicker"

/** Cartão que inclina em 3D na direção do cursor, com reflexo de vidro */
function TiltCard({ d, big }: { d: Destaque; big?: boolean }) {
  const ref = useRef<HTMLElement>(null)

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, { rotateY: px * 8, rotateX: -py * 8, duration: 0.6, ease: "power3.out" })
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`)
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`)
  }
  const onLeave = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.5)" })

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor
      className={cn(
        "dest-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-2 [transform-style:preserve-3d]",
        big && "md:col-span-2 md:row-span-2"
      )}
      style={{ transformPerspective: 900 } as React.CSSProperties}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#13254a,#070c18_70%)]",
          big ? "aspect-[16/10] md:aspect-auto md:flex-1" : "aspect-[16/10]"
        )}
      >
        <div className="blueprint pointer-events-none absolute inset-0 [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <CropMarks />
        <MachineStage src={d.img} alt={t(d.nome)} className="absolute inset-0 px-6 pt-8" />
        {/* brilho de vidro que acompanha o cursor */}
        <div className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(143,233,255,0.18),transparent_50%)]" />
        <span className="absolute left-6 top-6 z-20 font-mono text-[10px] uppercase tracking-[0.22em] text-ice">
          {t(d.linha)}
        </span>
        {d.selo && (
          <span className="absolute bottom-5 left-6 z-20 rounded-full bg-azure px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
            {t(d.selo)}
          </span>
        )}
      </div>
      <div className={cn("flex flex-col p-6 [transform:translateZ(30px)]", !big && "flex-1")}>
        <h3 className={cn("font-medium text-white", big ? "text-2xl" : "text-lg")}>{t(d.nome)}</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-white/60">
          {d.specs.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-ice" /> {t(s)}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center gap-4 pt-6">
          <button
            onClick={() => scrollToId("orcamento")}
            className="cursor-pointer whitespace-nowrap rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm text-white transition-colors duration-200 hover:bg-white hover:text-ink"
          >
            {t("Consultar preço")}
          </button>
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            aria-label={t("Detalhes: {nome}", { nome: t(d.nome) })}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-300 hover:border-ice hover:bg-ice hover:text-ink"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
      {big && <BorderBeam size={260} duration={9} colorFrom="#8fe9ff" colorTo="#2f7bff" />}
    </article>
  )
}

export function Destaques() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dest-title .word", {
        yPercent: 120,
        duration: 1.2,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: ".dest-title", start: "top 85%" },
      })
      gsap.from(".dest-card", {
        y: 80,
        opacity: 0,
        rotateX: 12,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".dest-grid", start: "top 80%" },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="maquinas" ref={root} className="relative bg-ink px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Kicker className="mb-5">{t("Destaques do catálogo")}</Kicker>
            <h2 className="dest-title font-wide max-w-[16ch] text-[clamp(2.2rem,4.6vw,4.2rem)] font-semibold leading-[0.98] tracking-tight text-white">
              <SplitWords text={t("Máquinas que vendem pelo resultado.")} />
            </h2>
          </div>
          <p className="max-w-sm leading-relaxed text-white/60">
            {t("Todos os preços são sob consulta: cada máquina é configurada para o tamanho e o volume da sua produção.")}
          </p>
        </div>

        <div className="dest-grid grid gap-5 md:grid-cols-3 md:grid-rows-[auto_auto]">
          {DESTAQUES.map((d, i) => (
            <TiltCard key={d.nome} d={d} big={i === 0} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <a
            href="/maquinas"
            className="group inline-flex h-14 items-center gap-3 rounded-2xl border border-white/15 px-7 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink"
          >
            {t("Ver todas as máquinas")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
