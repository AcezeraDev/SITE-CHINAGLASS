import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react"
import { Logo } from "@/components/Logo"
import { EMPRESA } from "@/data"
import { t } from "@/i18n"
import { ScrollTrigger, gsap, scrollToId } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { CATEGORIAS_MAQUINAS, TOTAL_MAQUINAS } from "@/maquinasCategorias"

// id = seção da página inicial; href = outra página. label e desc em português, traduzidos na tela
type Link = { label: string; id?: string; href?: string; desc?: string }
type Item = Link & { menu?: "maquinas" | Link[] }

const EMPRESA_MENU: Link[] = [
  { id: "diferenciais", label: "Por que nós", desc: "Garantia, instalação e presença nacional" },
  { href: "/assistencia", label: "Assistência técnica", desc: "Pós-venda e abertura de chamado" },
  { id: "orcamento", label: "Contato", desc: "Orçamento, telefone e e-mail" },
]

const ITENS: Item[] = [
  { label: "Máquinas", href: "/maquinas", menu: "maquinas" },
  { id: "processo", label: "Linha de produção" },
  { href: "/pecas", label: "Peças" },
  { href: "/videos", label: "Vídeos" },
  { label: "Empresa", menu: EMPRESA_MENU },
]

const hrefOf = (l: Link) => l.href ?? `/#${l.id}`

/** Item do menu está ativo se ele (ou algo do seu submenu) é a página atual */
const ativo = (i: Item, path: string) =>
  i.href === path || (Array.isArray(i.menu) && i.menu.some((l) => l.href === path))

export function Navbar() {
  const bar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [sub, setSub] = useState<string | null>(null)
  const fechaSub = useRef<ReturnType<typeof setTimeout>>(undefined)
  const path = window.location.pathname.replace(/\/+$/, "") || "/"

  // esconde ao rolar para baixo, volta ao rolar para cima
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 120,
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1) setSub(null)
        gsap.to(bar.current, { yPercent: self.direction === 1 ? -160 : 0, duration: 0.5, ease: "power3.out" })
      },
    })
    return () => st.kill()
  }, [])

  // Esc ou clique fora fecha o submenu
  useEffect(() => {
    if (!sub) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSub(null)
    const onDown = (e: PointerEvent) => !bar.current?.contains(e.target as Node) && setSub(null)
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [sub])

  // se a seção existe nesta página, rola suave até ela; senão o link leva para /#seção
  const go = (e: React.MouseEvent, id?: string) => {
    setOpen(false)
    setSub(null)
    if (id && document.getElementById(id)) {
      e.preventDefault()
      scrollToId(id)
    }
  }

  // no mouse, abre ao passar por cima; o atraso evita fechar no caminho até o painel
  const hover = (label: string | null) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    clearTimeout(fechaSub.current)
    if (label) setSub(label)
    else fechaSub.current = setTimeout(() => setSub(null), 180)
  }

  const linkCls =
    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white aria-[current=page]:bg-white/[0.07] aria-[current=page]:text-white"

  return (
    <>
      <header ref={bar} className="fixed inset-x-3 top-3 z-50 md:inset-x-6 md:top-5">
        <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 md:px-6" aria-label={t("Principal")}>
          <a href="/#topo" onClick={(e) => go(e, "topo")} aria-label={t("China Glass, início")}>
            <Logo />
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {ITENS.map((i) => (
              <li key={i.label} className="relative" onPointerEnter={i.menu ? hover(i.label) : undefined} onPointerLeave={i.menu ? hover(null) : undefined}>
                {i.menu ? (
                  <button
                    // com mouse o painel já abriu no hover, então o clique só confirma; teclado e toque alternam
                    onClick={(e) => {
                      const mouse = (e.nativeEvent as PointerEvent).pointerType === "mouse"
                      setSub((s) => (s === i.label && !mouse ? null : i.label))
                    }}
                    aria-expanded={sub === i.label}
                    aria-controls={`sub-${i.label}`}
                    aria-current={ativo(i, path) ? "page" : undefined}
                    className={cn(linkCls, "cursor-pointer", sub === i.label && "bg-white/5 text-white")}
                  >
                    {t(i.label)}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", sub === i.label && "rotate-180")} />
                  </button>
                ) : (
                  <a href={hrefOf(i)} onClick={(e) => go(e, i.id)} aria-current={i.href === path ? "page" : undefined} className={linkCls}>
                    {t(i.label)}
                  </a>
                )}

                {i.menu && (
                  <div
                    id={`sub-${i.label}`}
                    className={cn(
                      "absolute left-1/2 top-full pt-4 transition-all duration-300 ease-out",
                      i.menu === "maquinas" ? "w-[640px] -translate-x-[35%]" : "w-80 -translate-x-1/2",
                      sub === i.label ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
                    )}
                  >
                    <div className="rounded-2xl border border-white/10 bg-ink-2/95 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
                      {i.menu === "maquinas" ? (
                        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
                          <ul className="grid grid-cols-2 gap-0.5">
                            {CATEGORIAS_MAQUINAS.map((c) => (
                              <li key={c.slug}>
                                <a
                                  href={`/maquinas?linha=${c.slug}`}
                                  onClick={() => setSub(null)}
                                  className="flex items-baseline justify-between gap-2 rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                                >
                                  {t(c.nome)}
                                  <span className="font-mono text-[10px] text-white/35">{c.total}</span>
                                </a>
                              </li>
                            ))}
                            <li>
                              <a href="/pecas" onClick={() => setSub(null)} className="flex rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white">
                                {t("Partes e peças")}
                              </a>
                            </li>
                          </ul>
                          <a
                            href="/maquinas"
                            onClick={() => setSub(null)}
                            className="group relative flex flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_20%,#13254a,#070c18_75%)] p-4"
                          >
                            <img src="/img/linha-bilateral-cut.webp" alt="" className="absolute inset-x-2 top-3 w-[calc(100%-1rem)] object-contain transition-transform duration-700 group-hover:-translate-y-1" />
                            <span className="relative mt-24 font-mono text-[10px] uppercase tracking-[0.2em] text-ice">{t("Catálogo completo")}</span>
                            <span className="relative mt-1 flex items-center gap-1 text-sm font-medium text-white">
                              {t("Ver as {n} máquinas", { n: TOTAL_MAQUINAS })} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </span>
                          </a>
                        </div>
                      ) : (
                        <ul className="grid gap-0.5">
                          {i.menu.map((l) => (
                            <li key={l.label}>
                              <a
                                href={hrefOf(l)}
                                onClick={(e) => go(e, l.id)}
                                aria-current={l.href === path ? "page" : undefined}
                                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.06] aria-[current=page]:bg-white/[0.07]"
                              >
                                <span className="block text-sm text-white">{t(l.label)}</span>
                                <span className="block text-xs text-white/45">{l.desc && t(l.desc)}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a
              href={EMPRESA.telefoneLink}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs text-white/70 transition-colors hover:text-white md:flex"
            >
              <Phone className="h-3.5 w-3.5 text-ice" /> {EMPRESA.telefone}
            </a>
            <a
              href="/#orcamento"
              onClick={(e) => go(e, "orcamento")}
              className="hidden whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-ice sm:block"
            >
              {t("Pedir orçamento")}
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-white hover:bg-white/5 lg:hidden"
              aria-label={open ? t("Fechar menu") : t("Abrir menu")}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* menu do celular: tudo aberto, em grupos */}
      <div
        data-lenis-prevent
        className={`fixed inset-0 z-40 overflow-y-auto bg-ink/90 backdrop-blur-2xl transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className={`px-8 pb-12 pt-28 transition-all duration-500 ${open ? "translate-y-0" : "translate-y-4"}`}>
          <a href="/maquinas" onClick={() => setOpen(false)} className="font-wide block py-2 text-3xl font-semibold text-white">
            {t("Máquinas")}
          </a>
          <ul className="mb-4 mt-2 flex flex-wrap gap-2">
            {CATEGORIAS_MAQUINAS.map((c) => (
              <li key={c.slug}>
                <a href={`/maquinas?linha=${c.slug}`} onClick={() => setOpen(false)} className="block rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/75">
                  {t(c.nome)}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            {[...ITENS.filter((i) => !i.menu), ...EMPRESA_MENU].map((l) => (
              <li key={l.label}>
                <a href={hrefOf(l)} onClick={(e) => go(e, l.id)} className="font-wide block py-2 text-3xl font-semibold text-white">
                  {t(l.label)}
                </a>
              </li>
            ))}
          </ul>
          <a href={EMPRESA.telefoneLink} className="mt-8 block font-mono text-ice">{EMPRESA.telefone}</a>        </div>
      </div>
    </>
  )
}
