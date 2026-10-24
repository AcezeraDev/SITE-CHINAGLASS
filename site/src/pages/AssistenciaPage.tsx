import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowRight, Check, ChevronDown, GraduationCap, Mail, MapPinned, MonitorSmartphone, PackageCheck, Phone, ShieldCheck, Warehouse, Wrench } from "lucide-react"
import { Cursor } from "@/components/Cursor"
import { PageHero } from "@/components/PageHero"
import { BorderBeam } from "@/components/ui/border-beam"
import { MagicCard } from "@/components/ui/magic-card"
import { EMPRESA } from "@/data"
import { langInfo, t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { usePage } from "@/lib/page"
import { MAQUINAS } from "@/maquinasData"
import { Footer } from "@/sections/Footer"
import { Navbar } from "@/sections/Navbar"
import { Kicker } from "@/components/Kicker"

// Tudo aqui vem do que o site atual promete (rodapé e páginas de produto)
const INCLUSO = [
  { icon: ShieldCheck, t: "Garantia de 1 ano", d: "Em todas as máquinas China Glass." },
  { icon: Wrench, t: "Assistência técnica permanente", d: "Equipe técnica especializada para manter a máquina rendendo." },
  { icon: GraduationCap, t: "Instalação e treinamento", d: "Suporte na instalação e treinamento da equipe que vai operar." },
  { icon: PackageCheck, t: "Peças a pronta entrega", d: "Reposição em estoque para reduzir o tempo de máquina parada.", href: "/pecas" },
  { icon: Warehouse, t: "Galpão técnico equipado", d: "Estrutura própria para suporte e manutenção especializada." },
  { icon: MapPinned, t: "Todo o Brasil", d: "Máquinas instaladas e atendimento em todos os estados." },
]

const TIPOS = ["Máquina com defeito","Manutenção preventiva", "Instalação", "Treinamento de operadores", "Dúvida de operação", "Peça de reposição"]

const FAQ = [
  { p: "Qual é a garantia das máquinas?", r: "Todas as máquinas China Glass têm garantia de 1 ano." },
  {
    p: "Vocês têm peças de reposição?",
    r: "Sim. Peças como bombas d’água, correias, correntes, coifas, escovas e amperímetros ficam a pronta entrega. Veja o catálogo de peças e monte sua lista.",
    link: { href: "/pecas", label: "Ver peças" },
  },
  { p: "Atendem a minha região?", r: "A China Glass tem máquinas instaladas e atende em todos os estados do Brasil." },
  {
    p: "Dá para fazer diagnóstico a distância?",
    r: "Algumas máquinas, como o centro de usinagem CNC e o forno de laminação EVA, têm acesso remoto: com a sua autorização, a equipe técnica acompanha a máquina à distância.",
  },
  {
    p: "O que mandar para agilizar o atendimento?",
    r: "Modelo da máquina, o que está acontecendo, desde quando, e se possível fotos ou um vídeo curto do problema. Com isso a equipe entende o caso mais rápido.",
  },
]

const campo =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-white placeholder:text-white/35 transition-colors duration-200 focus:border-ice/60 focus:bg-white/[0.06] focus:outline-none"

function Incluso() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".inc-card", { y: 60, opacity: 0, duration: 1.1, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 78%" } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="incluso" ref={root} className="relative bg-ink px-5 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-7xl">
        <Kicker className="mb-4">{t("O que você tem")}</Kicker>
        <h2 className="font-wide max-w-[20ch] text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[0.98] tracking-tight text-white">
          {t("A máquina não fica sozinha depois da entrega.")}
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUSO.map(({ icon: Icon, t: titulo, d, href }) => (
            <MagicCard key={titulo} className="inc-card rounded-3xl" gradientColor="#0e2347" gradientFrom="#8fe9ff" gradientTo="#2f7bff" gradientSize={260}>
              <div className="p-7">
                <span className="glass flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Icon className="h-5 w-5 text-ice" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 text-lg font-medium text-white">{t(titulo)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t(d)}</p>
                {href && (
                  <a href={href} className="mt-4 inline-flex items-center gap-1 text-sm text-ice hover:underline">
                    {t("Ver catálogo de peças")} <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function Chamado() {
  const [enviado, setEnviado] = useState(false)

  // Sem servidor por enquanto: abre o e-mail do visitante com o chamado preenchido, no idioma do site
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const maquina = t(String(f.get("maquina")))
    const corpo = [
      `${t("Nome")}: ${f.get("nome")}`,
      `${t("Empresa")}: ${f.get("empresa") || "-"}`,
      `${t("Telefone")}: ${f.get("telefone")}`,
      `${t("E-mail")}: ${f.get("email")}`,
      `${t("Cidade / UF")}: ${f.get("cidade") || "-"}`,
      `${t("Máquina")}: ${maquina}`,
      `${t("Tipo de atendimento")}: ${t(String(f.get("tipo")))}`,
      `${t("Idioma")}: ${langInfo().nome}`,
      "",
      String(f.get("descricao") || ""),
    ].join("\n")
    window.location.href = `mailto:${EMPRESA.email}?subject=${encodeURIComponent(t("Assistência técnica: {maquina}", { maquina }))}&body=${encodeURIComponent(corpo)}`
    setEnviado(true)
  }

  return (
    <section id="chamado" className="relative overflow-hidden bg-ink-2 px-5 py-24 md:px-8 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-azure/20 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Kicker className="mb-5">{t("Abrir chamado")}</Kicker>
          <h2 className="font-wide text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[0.98] tracking-tight text-white">
            {t("Máquina parada? Conta pra gente.")}
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-white/60">
            {t("Preencha o chamado com o modelo da máquina e o que está acontecendo. Se for urgente, ligue direto.")}
          </p>
          <ol className="mt-10 space-y-5">
            {["Você abre o chamado com o modelo e o problema", "A equipe técnica entra em contato para entender o caso", "Atendimento, peça ou visita técnica, conforme a necessidade"].map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ice/40 font-mono text-xs text-ice">0{i + 1}</span>
                <span className="pt-1.5 text-white/75">{t(s)}</span>
              </li>
            ))}
          </ol>
          <ul className="mt-10 space-y-3">
            <li>
              <a href={EMPRESA.telefoneLink} className="group flex items-center gap-4 text-white">
                <span className="glass flex h-12 w-12 items-center justify-center rounded-2xl"><Phone className="h-5 w-5 text-ice" /></span>
                <span>
                  <span className="block text-xs text-white/45">{t("Urgente? Ligue")}</span>
                  <span className="font-mono text-lg transition-colors group-hover:text-ice">{EMPRESA.telefone}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${EMPRESA.email}`} className="group flex items-center gap-4 text-white">
                <span className="glass flex h-12 w-12 items-center justify-center rounded-2xl"><Mail className="h-5 w-5 text-ice" /></span>
                <span>
                  <span className="block text-xs text-white/45">{t("E-mail")}</span>
                  <span className="font-mono text-lg transition-colors group-hover:text-ice">{EMPRESA.email}</span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="glass relative overflow-hidden rounded-3xl p-6 md:p-10">
          <BorderBeam size={300} duration={12} colorFrom="#8fe9ff" colorTo="#2f7bff" />
          {enviado ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ice text-ink"><Check className="h-7 w-7" /></span>
              <h3 className="font-wide mt-6 text-2xl font-semibold text-white">{t("Chamado pronto!")}</h3>
              <p className="mt-3 max-w-sm text-white/60">
                {t("Abrimos o seu aplicativo de e-mail com o chamado preenchido. É só enviar. Se nada abriu, escreva para")}{" "}
                <a className="text-ice underline" href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.
              </p>
              <button onClick={() => setEnviado(false)} className="mt-8 cursor-pointer text-sm text-white/60 underline hover:text-white">
                {t("Abrir outro chamado")}
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-white/70">
                  {t("Nome")}
                  <input name="nome" required autoComplete="name" className={campo} placeholder={t("Seu nome")} />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  {t("Empresa")}
                  <input name="empresa" autoComplete="organization" className={campo} placeholder={t("Nome da vidraçaria")} />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  {t("Telefone / WhatsApp")}
                  <input name="telefone" required type="tel" autoComplete="tel" className={campo} placeholder={t("(00) 00000-0000")} />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  {t("E-mail")}
                  <input name="email" required type="email" autoComplete="email" className={campo} placeholder={t("voce@empresa.com.br")} />
                </label>
              </div>
              <label className="grid gap-2 text-sm text-white/70">
                {t("Cidade / UF")}
                <input name="cidade" autoComplete="address-level2" className={campo} placeholder={t("Ex.: Campinas / SP")} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-white/70">
                  {t("Máquina")}
                  <select name="maquina" className={`${campo} cursor-pointer appearance-none`} defaultValue="">
                    <option value="" disabled className="bg-ink">{t("Escolha a máquina")}</option>
                    {MAQUINAS.map((m) => (
                      <option key={m.id} value={m.nome} className="bg-ink">{t(m.nome)}</option>
                    ))}
                    <option value="Outra / não sei o modelo" className="bg-ink">{t("Outra / não sei o modelo")}</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  {t("Tipo de atendimento")}
                  <select name="tipo" className={`${campo} cursor-pointer appearance-none`} defaultValue={TIPOS[0]}>
                    {TIPOS.map((tipo) => (
                      <option key={tipo} value={tipo} className="bg-ink">{t(tipo)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm text-white/70">
                {t("O que está acontecendo?")}
                <textarea name="descricao" required rows={4} className={`${campo} resize-none`} placeholder={t("Descreva o problema, desde quando acontece e se aparece algum alarme na tela.")} />
              </label>
              <button
                type="submit"
                className="group mt-2 inline-flex h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white font-medium text-ink transition-colors duration-200 hover:bg-ice"
              >
                {t("Enviar chamado")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Perguntas() {
  return (
    <section className="bg-ink px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Kicker className="mb-4">{t("Perguntas frequentes")}</Kicker>
          <h2 className="font-wide text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[0.98] tracking-tight text-white">{t("Dúvidas sobre o pós-venda")}</h2>
          <p className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-white/55">
            <MonitorSmartphone className="mt-0.5 h-5 w-5 shrink-0 text-ice" />
            {t("Não achou sua dúvida? Ligue {tel}.", { tel: EMPRESA.telefone })}
          </p>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((f) => (
            <details key={f.p} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-lg text-white [&::-webkit-details-marker]:hidden">
                {t(f.p)}
                <ChevronDown className="h-5 w-5 shrink-0 text-white/50 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-5 pr-10 leading-relaxed text-white/60">
                {t(f.r)}{" "}
                {f.link && <a href={f.link.href} className="text-ice underline-offset-4 hover:underline">{t(f.link.label)}</a>}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AssistenciaPage() {
  usePage(
    "Assistência técnica e pós-venda | China Glass",
    "Assistência técnica China Glass: garantia de 1 ano, instalação, treinamento, peças a pronta entrega e atendimento em todo o Brasil. Abra um chamado para a sua máquina."
  )

  return (
    <>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main>
        <PageHero
          crumb={t("Assistência técnica")}
          title={t("Assistência")}
          accent={t("técnica.")}
          sub={t(
            "Garantia, instalação, treinamento, manutenção e peças de reposição. Abra um chamado e a equipe técnica da China Glass cuida da sua máquina."
          )}
          chips={[t("Garantia de 1 ano"), t("Peças a pronta entrega"), t("Atendimento em todo o Brasil")]}
          cta={{ label: t("Abrir chamado"), target: "chamado" }}
        />
        <Incluso />
        <Chamado />
        <Perguntas />
      </main>
      <Footer />
    </>
  )
}
