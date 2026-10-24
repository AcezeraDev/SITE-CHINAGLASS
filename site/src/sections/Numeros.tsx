import { useEffect, useRef } from "react"
import { Factory, MapPinned, PackageCheck, ShieldCheck } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"

const NUMEROS = [
  { icon: ShieldCheck, n: 1, v: " ano", l: "de garantia em toda máquina" },
  { icon: Factory, n: 38, v: "", l: "modelos de máquina no catálogo" },
  { icon: MapPinned, n: 27, v: "", l: "estados atendidos no Brasil" },
  { icon: PackageCheck, v: "Pronta", l: "entrega de peças de reposição" },
]

/** Faixa de números logo abaixo da abertura: ícone, valor grande e legenda, separados por linhas finas */
export function Numeros() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".num-item", {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 90%" },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="numeros" ref={root} aria-label={t("China Glass em números")} className="relative bg-ink px-5 py-14 md:px-8 md:py-20">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 lg:grid-cols-4">
        {NUMEROS.map(({ icon: Icon, n, v, l }, i) => (
          <div
            key={l}
            className={`num-item flex flex-col gap-4 px-4 md:px-8 ${i % 2 ? "border-l border-white/10" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <Icon className="h-5 w-5 text-ice" strokeWidth={1.6} />
            {/* dt vem antes no HTML (exigência do <dl>) e aparece embaixo pelo order */}
            <dt className="order-last max-w-[18ch] text-sm leading-snug text-white/55">{t(l)}</dt>
            <dd className="font-wide text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold leading-none tracking-tight text-white">
              {n !== undefined && <NumberTicker value={n} className="text-white" />}
              <span className={n !== undefined ? "text-ice" : "text-gradient"}>{v && t(v)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
