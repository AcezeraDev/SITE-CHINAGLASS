import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowRight, Check, Mail, Phone } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { EMPRESA, MAQUINAS_FORM } from "@/data"
import { langInfo, t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { Kicker } from "@/components/Kicker"

const campo =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-white placeholder:text-white/35 transition-colors duration-200 focus:border-ice/60 focus:bg-white/[0.06] focus:outline-none"

/** `opcoes` troca a lista de máquinas do formulário; `selecionada` já deixa uma escolhida */
export function Orcamento({ opcoes = MAQUINAS_FORM, selecionada }: { opcoes?: string[]; selecionada?: string } = {}) {
  const root = useRef<HTMLElement>(null)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".orc-anim", {
        y: 50,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // Sem servidor por enquanto: abre o e-mail do visitante com a mensagem pronta, no idioma do site
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const maquina = t(String(f.get("maquina")))
    const corpo = [
      `${t("Nome")}: ${f.get("nome")}`,
      `${t("E-mail")}: ${f.get("email")}`,
      `${t("Telefone")}: ${f.get("telefone")}`,
      `${t("Máquina")}: ${maquina}`,
      `${t("Idioma")}: ${langInfo().nome}`,
      "",
      String(f.get("mensagem") || ""),
    ].join("\n")
    window.location.href = `mailto:${EMPRESA.email}?subject=${encodeURIComponent(t("Orçamento: {maquina}", { maquina }))}&body=${encodeURIComponent(corpo)}`
    setEnviado(true)
  }

  return (
    <section id="orcamento" ref={root} className="relative overflow-hidden bg-ink px-5 py-28 md:px-8 md:py-36">
      <div className="pointer-events-none absolute right-[-10rem] top-1/3 h-[34rem] w-[34rem] rounded-full bg-azure/25 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-2">
        <div>
          <Kicker className="orc-anim mb-5">{t("Orçamento sem compromisso")}</Kicker>
          <h2 className="orc-anim font-wide text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.95] tracking-tight text-white">
            {t("Vamos montar a sua linha?")}
          </h2>
          <p className="orc-anim mt-6 max-w-md leading-relaxed text-white/60">
            {t("Conte qual máquina procura e o tamanho das chapas que você trabalha. Respondemos com a configuração ideal e o preço.")}
          </p>
          <ul className="orc-anim mt-10 space-y-4">
            <li>
              <a href={EMPRESA.telefoneLink} className="group flex items-center gap-4 text-white">
                <span className="glass flex h-12 w-12 items-center justify-center rounded-2xl"><Phone className="h-5 w-5 text-ice" /></span>
                <span>
                  <span className="block text-xs text-white/45">{t("Telefone")}</span>
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

        <div className="orc-anim glass relative overflow-hidden rounded-3xl p-6 md:p-10">
          <BorderBeam size={300} duration={12} colorFrom="#8fe9ff" colorTo="#2f7bff" />
          {enviado ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ice text-ink"><Check className="h-7 w-7" /></span>
              <h3 className="font-wide mt-6 text-2xl font-semibold text-white">{t("Mensagem pronta!")}</h3>
              <p className="mt-3 max-w-sm text-white/60">
                {t("Abrimos o seu aplicativo de e-mail com o pedido preenchido. É só enviar. Se nada abriu, escreva para")}{" "}
                <a className="text-ice underline" href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>.
              </p>
              <button onClick={() => setEnviado(false)} className="mt-8 cursor-pointer text-sm text-white/60 underline hover:text-white">
                {t("Fazer outro pedido")}
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
                  {t("Telefone / WhatsApp")}
                  <input name="telefone" required type="tel" autoComplete="tel" className={campo} placeholder={t("(00) 00000-0000")} />
                </label>
              </div>
              <label className="grid gap-2 text-sm text-white/70">
                {t("E-mail")}
                <input name="email" required type="email" autoComplete="email" className={campo} placeholder={t("voce@empresa.com.br")} />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                {t("Máquina de interesse")}
                <select
                  key={selecionada}
                  name="maquina"
                  className={`${campo} cursor-pointer appearance-none`}
                  defaultValue={selecionada ?? opcoes[0]}
                >
                  {opcoes.map((m) => (
                    <option key={m} value={m} className="bg-ink">{t(m)}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                {t("Mensagem")} <span className="sr-only">{t("(opcional)")}</span>
                <textarea name="mensagem" rows={4} className={`${campo} resize-none`} placeholder={t("Tamanho das chapas, espessuras, volume por dia…")} />
              </label>
              <button
                type="submit"
                className="group mt-2 inline-flex h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white font-medium text-ink transition-colors duration-200 hover:bg-ice"
              >
                {t("Enviar pedido de orçamento")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
