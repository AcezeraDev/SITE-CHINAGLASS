import { useEffect, useRef } from "react"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { Kicker } from "@/components/Kicker"

/** O desenho técnico da linha de lapidação vira a máquina real conforme você rola */
export function Linha() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const strip = root.current!.querySelector<HTMLElement>(".linha-strip")!
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=260%",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.to(strip, { x: () => -(strip.offsetWidth - window.innerWidth), ease: "none" }, 0)
          .fromTo(".linha-foto", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none" }, 0)
          .fromTo(".linha-scan", { left: "0%" }, { left: "100%", ease: "none" }, 0)
          .from(".linha-title", { opacity: 0.2, y: 30, duration: 0.2 }, 0)
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} aria-label={t("Linha de lapidação vertical automática")} className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-white py-20 text-ink">
      <div className="mx-auto mb-12 w-full max-w-7xl px-5 md:px-8">
        <Kicker light className="mb-4">{t("Projeto sob medida")}</Kicker>
        <h2 className="linha-title font-wide max-w-[18ch] text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[0.98] tracking-tight">
          {t("Do desenho técnico à linha instalada na sua fábrica.")}
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-ink/60">
          {t(
            "Linha de lapidação vertical automática com lapidadoras, transfers e carregadores integrados. Nossa equipe faz o layout, instala e treina sua operação."
          )}
        </p>
      </div>

      <div className="linha-strip relative w-[480vw] md:w-[250vw]">
        <img src="/img/linha-desenho.webp" alt="" className="block w-full select-none opacity-80 mix-blend-multiply" draggable={false} />
        <img
          src="/img/linha-foto.webp"
          alt={t("Linha de lapidação vertical automática China Glass")}
          className="linha-foto absolute inset-0 block w-full select-none mix-blend-multiply"
          draggable={false}
        />
        <span className="linha-scan pointer-events-none absolute -inset-y-6 left-0 w-px bg-azure shadow-[0_0_24px_4px_rgba(47,123,255,0.6)]" aria-hidden="true" />
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-7xl gap-10 px-5 font-mono text-xs uppercase tracking-[0.15em] text-ink/50 md:px-8">
        <span>{t("Layout")}</span>
        <span>→ {t("Instalação")}</span>
        <span>→ {t("Treinamento")}</span>
        <span>→ {t("Pós-venda")}</span>
      </div>
    </section>
  )
}
