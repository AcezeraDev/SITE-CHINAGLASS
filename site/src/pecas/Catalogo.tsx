import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Check, Eye, Plus, Search, X } from "lucide-react"
import { CropMarks, MachineStage } from "@/components/MachineStage"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { PECAS_CATALOGO, type Maquina, type Peca } from "@/pecasData"
import { useQuote } from "./quote"

const FILTROS: ("Todas" | Maquina)[] = ["Todas", "Lapidadora", "Biseladora"]

/** Tira acentos e caixa para a busca */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function AddButton({ p, full }: { p: Peca; full?: boolean }) {
  const { has, toggle } = useQuote()
  const on = has(p.id)
  return (
    <button
      onClick={() => toggle({ key: p.id, nome: p.nome, codigo: p.codigo })}
      aria-pressed={on}
      className={cn(
        "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors duration-200",
        on ? "bg-ice text-ink hover:bg-white" : "bg-white text-ink hover:bg-ice",
        full && "w-full"
      )}
    >
      {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {on ? t("Na lista") : t("Adicionar à lista")}
    </button>
  )
}

function Card({ p, onView }: { p: Peca; onView: () => void }) {
  return (
    <article className="peca-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-2 transition-colors duration-300 hover:border-ice/30">
      <button onClick={onView} className="relative block aspect-[4/3] cursor-pointer overflow-hidden text-left" aria-label={t("Ver detalhes: {nome}", { nome: t(p.nome) })}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#13254a,#070c18_72%)]" />
        <div className="blueprint pointer-events-none absolute inset-0 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <CropMarks />
        <MachineStage src={p.img} alt={t(p.nome)} className="absolute inset-0 px-6 pt-6" />
        <span className="absolute left-5 top-5 z-20 font-mono text-[10px] uppercase tracking-[0.2em] text-ice">{t(p.maquina)}</span>
        <span className="absolute bottom-4 right-4 z-20 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Eye className="h-4 w-4" />
        </span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-medium leading-snug text-white">{t(p.nome)}</h3>
        <p className="mt-1 font-mono text-[11px] text-white/40">{t("Cód.")} {p.codigo}</p>
        <dl className="mt-4 grid gap-1 font-mono text-[11px]">
          {p.specs.slice(0, 2).map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <dt className="uppercase tracking-[0.1em] text-white/40">{t(k)}</dt>
              <span className="mb-[3px] flex-1 border-b border-dotted border-white/15" aria-hidden="true" />
              <dd className="text-white/85">{t(v)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto pt-5">
          <AddButton p={p} full />
        </div>
      </div>
    </article>
  )
}

/** Visão rápida da peça, sem sair da página */
function QuickView({ p, onClose }: { p: Peca; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    box.current?.querySelector<HTMLElement>("button")?.focus()
    gsap.fromTo(box.current, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" })
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-md md:items-center md:p-6" onClick={onClose}>
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={t(p.nome)}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="glass relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-3xl md:grid-cols-2 md:rounded-3xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink/60 text-white transition-colors hover:bg-white hover:text-ink"
          aria-label={t("Fechar")}
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative aspect-square bg-[radial-gradient(ellipse_at_50%_35%,#13254a,#070c18_72%)] md:aspect-auto md:min-h-[440px]">
          <div className="blueprint pointer-events-none absolute inset-0 [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <CropMarks />
          <MachineStage src={p.img} alt={t(p.nome)} className="group absolute inset-0 p-8" />
        </div>
        <div className="flex flex-col p-6 md:p-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ice">{t(p.maquina)}</p>
          <h2 className="font-wide mt-3 text-2xl font-semibold leading-tight text-white md:text-3xl">{t(p.nome)}</h2>
          <p className="mt-2 font-mono text-xs text-white/40">{t("Cód.")} {p.codigo}</p>
          <p className="mt-6 leading-relaxed text-white/70">{t(p.descricao)}</p>
          <dl className="mt-6 grid gap-2 border-t border-dashed border-white/12 pt-5 font-mono text-xs">
            {p.specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <dt className="uppercase tracking-[0.1em] text-white/45">{t(k)}</dt>
                <span className="mb-[3px] flex-1 border-b border-dotted border-white/15" aria-hidden="true" />
                <dd className="text-white">{t(v)}</dd>
              </div>
            ))}
            <div className="flex items-baseline gap-2">
              <dt className="uppercase tracking-[0.1em] text-white/45">{t("Preço")}</dt>
              <span className="mb-[3px] flex-1 border-b border-dotted border-white/15" aria-hidden="true" />
              <dd className="text-white">{t("Sob consulta")}</dd>
            </div>
          </dl>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <AddButton p={p} />
            <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-ice">
              {t("Página no site atual")} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Catalogo() {
  const root = useRef<HTMLElement>(null)
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todas")
  const [busca, setBusca] = useState("")
  const [aberta, setAberta] = useState<Peca | null>(null)
  const fechar = useCallback(() => setAberta(null), [])

  const lista = useMemo(() => {
    const q = norm(busca.trim())
    return PECAS_CATALOGO.filter(
      (p) =>
        (filtro === "Todas" || p.maquina === filtro) &&
        (!q || norm(`${p.nome} ${t(p.nome)} ${p.codigo} ${p.maquina} ${t(p.maquina)}`).includes(q))
    )
  }, [filtro, busca])

  // cartões entram em cascata a cada troca de filtro/busca
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".peca-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "expo.out", overwrite: true })
    }, root)
    return () => ctx.revert()
  }, [lista])

  const contagem = (f: (typeof FILTROS)[number]) => (f === "Todas" ? PECAS_CATALOGO.length : PECAS_CATALOGO.filter((p) => p.maquina === f).length)

  return (
    <section id="catalogo" ref={root} className="relative bg-ink px-5 pb-28 pt-10 md:px-8 md:pb-36">
      <div className="mx-auto max-w-7xl">
        {/* barra de filtros fixa no topo enquanto rola */}
        <div className="sticky top-3 z-30 mb-10 md:top-24">
          <div className="glass flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-1 overflow-x-auto" role="group" aria-label={t("Filtrar por máquina")}>
              {FILTROS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  aria-pressed={filtro === f}
                  className={cn(
                    "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm transition-colors duration-200",
                    filtro === f ? "bg-white text-ink" : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {t(f)}
                  <span className={cn("font-mono text-[10px]", filtro === f ? "text-ink/50" : "text-white/35")}>{contagem(f)}</span>
                </button>
              ))}
            </div>
            <label className="relative flex items-center md:w-80">
              <span className="sr-only">{t("Buscar peça")}</span>
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={t("Buscar por nome ou código")}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-base text-white placeholder:text-white/35 focus:border-ice/60 focus:outline-none md:text-sm"
              />
            </label>
          </div>
        </div>

        <p className="mb-6 font-mono text-xs text-white/40" aria-live="polite">
          {t(lista.length === 1 ? "{n} peça" : "{n} peças", { n: lista.length })}
          {filtro !== "Todas" && " " + t("para {maquina}", { maquina: t(filtro).toLowerCase() })}
          {busca && " " + t("com “{busca}”", { busca })}
        </p>

        {lista.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {lista.map((p) => (
              <Card key={p.id} p={p} onView={() => setAberta(p)} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="text-white">{t("Nenhuma peça encontrada.")}</p>
            <p className="mt-2 text-sm text-white/55">{t("Não achou? Peça pelo código ou mande uma foto da peça na seção abaixo.")}</p>
            <button onClick={() => { setBusca(""); setFiltro("Todas") }} className="mt-6 cursor-pointer text-sm text-ice underline">
              {t("Limpar filtros")}
            </button>
          </div>
        )}
      </div>
      {aberta && <QuickView p={aberta} onClose={fechar} />}
    </section>
  )
}
