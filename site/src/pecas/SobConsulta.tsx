import { useEffect, useRef } from "react"
import { Camera, Check, Mail, Phone, Plus } from "lucide-react"
import { EMPRESA } from "@/data"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { PECAS_SOB_CONSULTA } from "@/pecasData"
import { useQuote } from "./quote"
import { Kicker } from "@/components/Kicker"

/** Linhas de peça sem cadastro no catálogo online: entram na lista como pedido de cotação */
export function SobConsulta() {
  const root = useRef<HTMLElement>(null)
  const { has, toggle } = useQuote()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sc-card", {
        y: 60,
        opacity: 0,
        rotateX: 10,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative bg-ink-2 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Kicker className="mb-4">{t("Sob consulta")}</Kicker>
            <h2 className="font-wide max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[0.98] tracking-tight text-white">
              {t("Mais linhas de peças para a sua fábrica.")}
            </h2>
          </div>
          <p className="max-w-sm leading-relaxed text-white/60">{t("Adicione a linha à sua lista e diga no pedido qual peça e qual máquina.")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {PECAS_SOB_CONSULTA.map((c) => {
            const key = `linha:${c.nome}`
            const on = has(key)
            return (
              <article key={c.nome} className="sc-card group overflow-hidden rounded-3xl border border-white/10 bg-ink">
                <div className="overflow-hidden bg-white">
                  <img src={c.img} alt={t(c.nome)} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col gap-4 p-4 md:p-5">
                  <h3 className="text-sm text-white md:text-base">{t(c.nome)}</h3>
                  <button
                    onClick={() => toggle({ key, nome: `${c.nome} (cotação)` })}
                    aria-pressed={on}
                    className={cn(
                      "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm transition-colors duration-200",
                      on ? "bg-ice text-ink" : "bg-white/[0.06] text-white hover:bg-white hover:text-ink"
                    )}
                  >
                    {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {on ? t("Na lista") : t("Pedir cotação")}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Não achou a peça: contato direto */
export function Ajuda() {
  return (
    <section id="orcamento" className="relative overflow-hidden bg-ink px-5 py-24 md:px-8 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-azure/20 blur-[140px]" />
      <div className="glass relative mx-auto grid max-w-5xl gap-10 overflow-hidden rounded-[32px] p-8 md:grid-cols-[1.2fr_1fr] md:p-14">
        <div>
          <span className="glass flex h-14 w-14 items-center justify-center rounded-2xl">
            <Camera className="h-6 w-6 text-ice" strokeWidth={1.6} />
          </span>
          <h2 className="font-wide mt-6 text-[clamp(1.8rem,3.4vw,3rem)] font-semibold leading-[1] tracking-tight text-white">
            {t("Não achou a peça?")}
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/65">
            {t("Mande o código, a medida ou uma foto da peça e o modelo da máquina. A gente identifica e responde com disponibilidade e preço.")}
          </p>
        </div>
        <ul className="grid content-center gap-3">
          <li>
            <a href={`mailto:${EMPRESA.email}?subject=${encodeURIComponent(t("Identificação de peça"))}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-ice/40">
              <Mail className="h-5 w-5 text-ice" />
              <span>
                <span className="block text-xs text-white/45">{t("Envie a foto por e-mail")}</span>
                <span className="font-mono text-sm text-white group-hover:text-ice">{EMPRESA.email}</span>
              </span>
            </a>
          </li>
          <li>
            <a href={EMPRESA.telefoneLink} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-ice/40">
              <Phone className="h-5 w-5 text-ice" />
              <span>
                <span className="block text-xs text-white/45">{t("Ligue")}</span>
                <span className="font-mono text-sm text-white group-hover:text-ice">{EMPRESA.telefone}</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
