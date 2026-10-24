import { useEffect, useRef } from "react"
import { GraduationCap, MapPinned, PackageCheck, ShieldCheck, Warehouse, Wrench } from "lucide-react"
import { MagicCard } from "@/components/ui/magic-card"
import { NumberTicker } from "@/components/ui/number-ticker"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { Kicker } from "@/components/Kicker"

const ITENS = [
  { icon: ShieldCheck, t: "Garantia de 1 ano", d: "Em todas as máquinas do catálogo." },
  { icon: Wrench, t: "Assistência técnica", d: "Técnicos próprios para manutenção preventiva e corretiva." },
  { icon: GraduationCap, t: "Instalação e treinamento", d: "Entregamos a máquina funcionando e sua equipe operando." },
  { icon: Warehouse, t: "Galpão técnico próprio", d: "Estrutura própria para preparar e dar suporte às máquinas." },
  { icon: PackageCheck, t: "Peças a pronta entrega", d: "Estoque de reposição para a máquina não ficar parada." },
  { icon: MapPinned, t: "Presença nacional", d: "Atendimento em todos os estados do Brasil." },
]

const NUMEROS = [
  { v: 38, suf: "", l: "modelos de máquinas no catálogo" },
  { v: 12, suf: "", l: "linhas de produto" },
  { v: 27, suf: "", l: "estados atendidos" },
  { v: 1, suf: " ano", l: "de garantia em cada máquina" },
]

export function Diferenciais() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dif-card", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        stagger: { each: 0.08, from: "start" },
        ease: "expo.out",
        scrollTrigger: { trigger: ".dif-grid", start: "top 82%" },
      })
      // foto da fábrica com parallax
      gsap.fromTo(".dif-photo img", { yPercent: -12, scale: 1.15 }, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ".dif-photo", start: "top bottom", end: "bottom top", scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="diferenciais" ref={root} className="relative overflow-hidden bg-ink px-5 py-28 md:px-8 md:py-36">
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-azure/20 blur-[120px]" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker className="mb-5">{t("Por que a China Glass")}</Kicker>
            <h2 className="font-wide text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[0.98] tracking-tight text-white">
              {t("Pós-venda que segura a sua produção.")}
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-white/60">
              {t("Máquina parada é dinheiro perdido. Por isso a gente não para na entrega: instala, treina, mantém e repõe peças.")}
            </p>
            <div className="dif-photo relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <img src="/img/fabrica.webp" alt={t("Carregadora automática China Glass em operação em uma fábrica")} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent" />
              <p className="absolute bottom-4 left-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
                {t("Carregadora para bilateral em operação")}
              </p>
            </div>
          </div>

          <div className="dif-grid grid content-start gap-4 sm:grid-cols-2 lg:col-span-7">
            {ITENS.map(({ icon: Icon, t: titulo, d }) => (
              <MagicCard key={titulo}className="dif-card rounded-3xl" gradientColor="#0e2347" gradientFrom="#8fe9ff" gradientTo="#2f7bff" gradientSize={260}>
                <div className="p-7">
                  <span className="glass flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Icon className="h-5 w-5 text-ice" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-6 text-lg font-medium text-white">{t(titulo)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t(d)}</p>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-y-10 border-t border-white/10 pt-12 md:grid-cols-4">
          {NUMEROS.map((n) => (
            <div key={n.l}>
              <dd className="font-wide text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-none text-white">
                <NumberTicker value={n.v} className="text-white" />
                <span className="text-ice">{n.suf && t(n.suf)}</span>
              </dd>
              <dt className="mt-3 max-w-[16ch] text-sm text-white/55">{t(n.l)}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
