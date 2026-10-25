import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Check, Eye, Plus, X } from "lucide-react"
import { CropMarks, MachineStage } from "@/components/MachineStage"
import { Filtros } from "@/components/Filtros"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { PECAS_CATALOGO, type Maquina, type Peca } from "@/pecasData"
import { FICHAS_PECAS } from "@/pecasFichas"
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
        <img src={p.capa ?? p.img} alt={t(p.nome)} loading="lazy" className="h-full w-full bg-white object-contain" />
        <span className="absolute bottom-4 right-4 z-20 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Eye className="h-4 w-4" />
        </span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ice">{t(p.maquina)}</p>
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

/** Ficha da peça. O dialog nativo contém o foco e devolve-o ao botão de origem. */
function QuickView({ p, onClose }: { p: Peca; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const ficha = FICHAS_PECAS[p.id]

  useEffect(() => {
    const el = dialog.current
    el?.showModal()
    const anterior = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      el?.close()
      document.body.style.overflow = anterior
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`peca-titulo-${p.id}`}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      data-lenis-prevent
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none items-end justify-center bg-transparent p-0 text-white backdrop:bg-ink/70 backdrop:backdrop-blur-md open:flex md:items-center md:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="glass relative grid max-h-[92svh] w-full max-w-6xl overflow-y-auto rounded-t-3xl pb-[env(safe-area-inset-bottom)] md:grid-cols-[0.9fr_1.1fr] md:rounded-3xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink/60 text-white transition-colors hover:bg-white hover:text-ink"
          aria-label={t("Fechar")}
        >
          <X className="h-4 w-4" />
        </button>
        <div className="md:sticky md:top-0 md:self-start">
          <div className="relative aspect-[4/3] bg-ink-2 md:aspect-square">
            {p.capa ? (
              <img src={p.capa} alt={t(p.nome)} className="h-full w-full bg-white object-contain" />
            ) : (
              <>
                <CropMarks />
                <MachineStage src={p.img} alt={t(p.nome)} className="group absolute inset-0 p-8" />
              </>
            )}
          </div>
          {p.capa && (
            <div className="border-b border-white/10 bg-ink-2 p-4">
              <p className="text-xs leading-relaxed text-white/55">{t("Imagem de estúdio gerada por IA a partir da foto original.")}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col p-6 md:p-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ice">{t(p.maquina)}</p>
          <h2 id={`peca-titulo-${p.id}`} className="font-wide mt-3 text-balance pr-8 text-2xl font-semibold leading-tight text-white md:text-3xl">{t(p.nome)}</h2>
          <p className="mt-2 font-mono text-xs text-white/40">{t("Cód.")} {p.codigo}</p>
          <p className="mt-6 text-pretty text-sm leading-relaxed text-white/75">{t(ficha?.resumo ?? p.descricao)}</p>
          <h3 className="mt-7 text-base font-semibold text-white">{t("Dados publicados")}</h3>
          <dl className="mt-3 grid gap-3 border-y border-white/10 py-4 text-sm tabular-nums">
            {p.specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 gap-4">
                <dt className="text-white/55">{t(k)}</dt>
                <dd className="break-words text-right text-white">{t(v)}</dd>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-white/55">{t("Preço")}</dt>
              <dd className="text-right text-white">{t("Sob consulta")}</dd>
            </div>
          </dl>
          {ficha && (
            <>
              <section className="mt-7" aria-label={t("Aplicação e compatibilidade")}>
                <h3 className="text-balance text-base font-semibold text-white">{t("Aplicação e compatibilidade")}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-white/70">{t(ficha.aplicacao)}</p>
              </section>
              <section className="mt-7" aria-label={t("Antes de pedir esta peça")}>
                <h3 className="text-balance text-base font-semibold text-white">{t("Antes de pedir esta peça")}</h3>
                <ol className="mt-4 space-y-3">
                  {ficha.conferir.map((item, i) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/70">
                      <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-xs text-ice tabular-nums">{i + 1}</span>
                      <span className="text-pretty">{t(item)}</span>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="mt-7 rounded-2xl border border-ice/20 bg-ice/5 p-4" aria-label={t("Confirmar na cotação")}>
                <h3 className="text-base font-semibold text-ice">{t("Confirmar na cotação")}</h3>
                <p className="mt-2 text-pretty text-xs leading-relaxed text-white/60">{t("Estes dados não estão informados no catálogo. Nossa equipe confirma a versão adequada à sua máquina.")}</p>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-white/80">
                  {ficha.confirmar.map((item) => <li key={item}>{t(item)}</li>)}
                </ul>
              </section>
              <section className="mt-7" aria-label={t("Orientação de manutenção")}>
                <h3 className="text-base font-semibold text-white">{t("Orientação de manutenção")}</h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-white/70">{t(ficha.orientacao)}</p>
              </section>
            </>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <AddButton p={p} />
            <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-ice">
              {t("Fonte: catálogo China Glass")} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </dialog>
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
        <Filtros
          rotulo={t("Filtrar por máquina")}
          opcoes={FILTROS.map((f) => ({ valor: f, rotulo: t(f), total: contagem(f) }))}
          valor={filtro}
          onChange={(v) => setFiltro(v as (typeof FILTROS)[number])}
          busca={{ valor: busca, onChange: setBusca, placeholder: t("Buscar por nome ou código"), rotulo: t("Buscar peça") }}
        />

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
