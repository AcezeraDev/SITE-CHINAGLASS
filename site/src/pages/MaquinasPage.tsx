import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, ArrowUpRight, Camera, FileImage, Maximize2, Play, Rotate3d, Search, X } from "lucide-react"
import { Ampliar } from "@/components/Ampliar"
import { Cursor } from "@/components/Cursor"
import { PageHero } from "@/components/PageHero"
import { VideoModal } from "@/components/VideoModal"
import { t } from "@/i18n"
import { gsap, scrollToId } from "@/lib/motion"
import { usePage } from "@/lib/page"
import { cn } from "@/lib/utils"
import { CATEGORIAS_MAQUINAS, type MaquinaCatalogo } from "@/maquinasData"
import { DATA_REVISAO_FICHAS, FICHAS_TECNICAS, gruposDeEspecificacoes, MAQUINAS } from "@/fichasTecnicas"
import { Footer } from "@/sections/Footer"
import { Navbar } from "@/sections/Navbar"
import { Orcamento } from "@/sections/Orcamento"
import { MODELOS_3D, type Modelo3D } from "@/three/modelos"
import { ZoomVitrine } from "@/three/Vitrine"

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const nomeCat = (slug: string) => t(CATEGORIAS_MAQUINAS.find((c) => c.slug === slug)?.nome ?? "")
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const OPCOES_FORM = [...MAQUINAS.map((m) => m.nome), "Outra máquina"]

/** Lê ?linha= da barra de endereço (links do menu do topo) */
const linhaDaUrl = () => {
  const l = new URLSearchParams(window.location.search).get("linha")
  return CATEGORIAS_MAQUINAS.some((c) => c.slug === l) ? l! : "todas"
}

function Card({ m, onView, onQuote }: { m: MaquinaCatalogo; onView: () => void; onQuote: () => void }) {
  return (
    <article className="maq-card group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-2 transition-colors duration-300 hover:border-ice/30">
      <button onClick={onView} className="relative block cursor-pointer overflow-hidden bg-white text-left" aria-label={t("Ver ficha: {nome}", { nome: t(m.nome) })}>
        <img
          src={m.imgs[0]}
          alt={t(m.nome)}
          loading="lazy"
          className="aspect-[4/3] w-full object-contain p-4 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-105"
        />
        {m.videos.length > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur-md">
            <Play className="h-3 w-3 fill-current" /> {t("Vídeo")}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ice">{nomeCat(m.categorias[0])}</p>
        <h3 className="mt-2 font-medium leading-snug text-white">{t(m.nome)}</h3>
        <dl className="mt-4 grid gap-1 font-mono text-[11px]">
          {m.specs.slice(0, 3).map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <dt className="shrink-0 uppercase tracking-[0.1em] text-white/40">{t(k)}</dt>
              <span className="mb-[3px] min-w-3 flex-1 border-b border-dotted border-white/15" aria-hidden="true" />
              <dd className="truncate text-right text-white/85" title={t(v)}>{t(v)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <button
            onClick={onView}
            className="h-11 cursor-pointer rounded-xl border border-white/15 text-sm text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/5"
          >
            {t("Ver ficha")}
          </button>
          <button
            onClick={onQuote}
            className="h-11 cursor-pointer rounded-xl bg-white text-sm font-medium text-ink transition-colors duration-200 hover:bg-ice"
          >
            {t("Orçamento")}
          </button>
        </div>
      </div>
    </article>
  )
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-1 border-b border-dashed border-white/10 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/45">{t(k)}</dt>
      <dd className="min-w-0 break-words text-sm leading-relaxed text-white">{t(v)}</dd>
    </div>
  )
}

/** Ficha técnica completa, sem sair da página */
// máquinas do catálogo (pelo código) que têm modelo 3D interativo na ficha
const MODELO_DA_MAQUINA: Partial<Record<string, Modelo3D>> = {
  LJR2MQSYB: "carregadora",
  "7YJ88YDUV-LOS9M9NMH": "mesa-corte",
  lapidadora_bilateral: "bilateral",
  "TZ6TYJS7K-3MTW9EVYU": "copo",
  "WP2V7TKNJ-XV78XNSHI": "furadeira",
  "LJR2MQSYB-FAKKMJPHA": "usinagem",
  D5F3SYD5N: "lavadora",
  YJ2YT634Z: "forno-eva",
  CP8RHGPFP: "laser",
  "53ZJ3GGV7": "linha-jumbo",
  TDS6AQK95: "laminado",
  "7YJ88YDUV": "corte-3em1",
}
const EM_3D = -1 // item da tela cheia quando é o modelo 3D
const etiqueta =
  "pointer-events-none absolute top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ice backdrop-blur-md"
const ampliarBotao =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white backdrop-blur-md transition-colors hover:border-ice hover:text-ice"
// em tela de toque o modelo gira sozinho, sem arrastar
const toque = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

function Ficha({ m, onClose, onQuote, onVideo }: { m: MaquinaCatalogo; onClose: () => void; onQuote: () => void; onVideo: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const [foto, setFoto] = useState(0)
  // item aberto em tela cheia: índice da foto, EM_3D ou nada
  const [ampliado, setAmpliado] = useState<number | null>(null)
  const qual = MODELO_DA_MAQUINA[m.codigo]
  const Modelo = qual && MODELOS_3D[qual]
  const ficha = FICHAS_TECNICAS[m.id]
  const recursos = ficha?.recursos ?? m.destaques.split("; ").filter(Boolean).map(cap)

  useEffect(() => {
    // com o vídeo aberto por cima, o Esc fecha só o vídeo
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.getElementById("video-modal") && !document.getElementById("zoom-modal") && onClose()
    window.addEventListener("keydown", onKey)
    box.current?.querySelector<HTMLElement>("button")?.focus()
    gsap.fromTo(box.current, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" })
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 backdrop-blur-md md:items-center md:p-6" onClick={onClose}>
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={t(m.nome)}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className={cn(
          "glass relative grid max-h-[92svh] w-full overflow-y-auto rounded-t-3xl md:rounded-3xl",
          // com modelo 3D a foto e o 3D ficam lado a lado em cima, na largura toda, e o texto vai embaixo
          Modelo ? "max-w-6xl" : "max-w-5xl md:grid-cols-[1fr_1.1fr]"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink/60 text-white transition-colors hover:bg-white hover:text-ink"
          aria-label={t("Fechar")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className={cn("flex flex-col gap-3 p-4 md:p-6", !Modelo && "md:sticky md:top-0 md:self-start")}>
          <div className={cn("grid gap-3", Modelo && "sm:grid-cols-2")}>
            {/* foto real: clique para ampliar com zoom */}
            <button
              type="button"
              onClick={() => setAmpliado(foto)}
              aria-label={t("Ampliar foto")}
              className="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-white"
            >
              <img src={m.imgs[foto]} alt={t(m.nome)} className="aspect-[4/3] w-full object-contain p-4" />
              {Modelo && (
                <span className={`${etiqueta} left-3`}>
                  <Camera className="h-3.5 w-3.5" /> {t("Foto real")}
                </span>
              )}
              <span className={cn(ampliarBotao, "pointer-events-none absolute bottom-3 right-3")}>
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
            {Modelo && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#0d1730,#060a14_70%)]">
                <ZoomVitrine.Provider value="botoes">
                  <Suspense fallback={null}>
                    <Modelo className="absolute inset-0" />
                  </Suspense>
                </ZoomVitrine.Provider>
                <span className={`${etiqueta} left-3`}>
                  <Rotate3d className="h-3.5 w-3.5" /> {toque ? "3D" : t("3D · arraste para girar")}
                </span>
                <button
                  type="button"
                  onClick={() => setAmpliado(EM_3D)}
                  aria-label={t("Ampliar modelo 3D")}
                  title={t("Ampliar modelo 3D")}
                  className={cn(ampliarBotao, "absolute bottom-3 left-3 z-20")}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {m.imgs.length > 1 && (
            <div className={cn("grid gap-2", Modelo ? "grid-cols-5 sm:grid-cols-8" : "grid-cols-5")} role="group" aria-label={t("Fotos")}>
              {m.imgs.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setFoto(i)}
                  aria-pressed={foto === i}
                  aria-label={t("Foto {n}", { n: i + 1 })}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition-colors",
                    foto === i ? "border-ice" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={src} alt="" loading="lazy" className="aspect-square w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
          {m.videos.length > 0 && (
            <button
              onClick={() => onVideo(m.videos[0])}
              className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-ice/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink">
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </span>
              <span className="text-sm text-white">{t("Ver a máquina funcionando")}</span>
            </button>
          )}
        </div>

        <div className={cn("flex flex-col p-6 pt-2 md:p-9", Modelo ? "md:pt-3" : "md:pl-3")}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ice">{m.categorias.map(nomeCat).join(" · ")}</p>
          <h2 className="font-wide mt-3 pr-10 text-2xl font-semibold leading-tight text-white md:text-3xl">{t(m.nome)}</h2>
          <p className="mt-2 text-sm text-white/50">{t(m.tipo)} · {t("Cód.")} {m.codigo}</p>

          {ficha && (
            <>
              <p className="mt-5 text-sm leading-relaxed text-white/80">{t(ficha.resumo)}</p>
              <div className="mt-5">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">{t("Aplicações")}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {ficha.aplicacoes.map((aplicacao) => (
                    <li key={aplicacao} className="rounded-lg border border-ice/15 bg-ice/5 px-2.5 py-1.5 text-xs leading-relaxed text-ice">{t(aplicacao)}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {gruposDeEspecificacoes(m).map((grupo) => (
            <section key={grupo.titulo} className="mt-7" aria-label={t(grupo.titulo)}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ice">{t(grupo.titulo)}</h3>
              <dl className="mt-2">{grupo.linhas.map(([k, v]) => <Linha key={k} k={k} v={v} />)}</dl>
            </section>
          ))}

          {ficha?.tabela && (
            <section className="mt-7" aria-label={t("Comparativo de versões")}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ice">{t("Comparativo de versões")}</h3>
              <div className="mt-3 overflow-x-auto rounded-xl border border-white/10" tabIndex={0} role="region" aria-label={t("Tabela de versões")}>
                <table className="w-full text-left text-xs leading-relaxed">
                  <thead className="bg-white/5 text-white/60">
                    <tr>{ficha.tabela.colunas.map((coluna) => <th key={coluna} scope="col" className="whitespace-nowrap px-3 py-3 font-medium">{t(coluna)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {ficha.tabela.linhas.map((linha) => (
                      <tr key={linha[0]} className="border-t border-white/10 text-white/85">
                        {linha.map((valor, i) => i === 0
                          ? <th key={i} scope="row" className="whitespace-nowrap px-3 py-3 font-medium text-white">{t(valor)}</th>
                          : <td key={i} className="whitespace-nowrap px-3 py-3">{t(valor)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {ficha && (
            <section className="mt-7">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">{t("Como funciona")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{t(ficha.funcionamento)}</p>
            </section>
          )}

          {recursos.length > 0 && (
            <div className="mt-6">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">{t("Recursos e configuração")}</h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-white/70">
                {recursos.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ice" />
                    <span>{t(d)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ficha?.opcionais && (
            <section className="mt-6">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">{t("Opcionais e fornecimento")}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-white/75">
                {ficha.opcionais.map((opcional) => <li key={opcional}>{t(opcional)}</li>)}
              </ul>
            </section>
          )}

          {ficha?.observacoes && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-medium text-white">{t("Observações técnicas")}</h3>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-white/65">
                {ficha.observacoes.map((observacao) => <li key={observacao}>{t(observacao)}</li>)}
              </ul>
            </section>
          )}

          {ficha && (
            <section className="mt-6 rounded-2xl border border-ice/15 bg-ice/5 p-4">
              <h3 className="text-sm font-medium text-ice">{t("Para dimensionar sua máquina")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{t(ficha.dimensionamento)}</p>
            </section>
          )}

          <details className="mt-6 border-y border-white/10 py-3">
            <summary className="cursor-pointer text-sm text-white/65 hover:text-white">{t("Comando e componentes publicados")}</summary>
            <dl className="mt-2">
              {m.comando && <Linha k="Comando" v={m.comando} />}
              {m.marcas && <Linha k="Componentes" v={m.marcas} />}
              <Linha k="Preço" v="Sob consulta" />
            </dl>
          </details>

          {ficha && (
            <div className="mt-5 text-xs leading-relaxed text-white/45">
              <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4 transition-colors hover:text-ice">
                {t("Fonte técnica: China Glass")} <ArrowUpRight className="h-3 w-3" />
              </a>
              <p className="mt-1">{t("Revisão do conteúdo")}: <time dateTime={DATA_REVISAO_FICHAS}>24/10/2026</time></p>
              {ficha.tabelaFonte && (
                <a href={ficha.tabelaFonte} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-white/60 underline underline-offset-4 hover:text-ice">
                  <FileImage className="h-3.5 w-3.5" />{t("Consultar tabela do fornecedor")}
                </a>
              )}
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <button
              onClick={onQuote}
              className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-ink transition-colors hover:bg-ice"
            >
              {t("Pedir orçamento")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-ice">
              {t("Página de referência")} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      {ampliado !== null && (
        <div onClick={(e) => e.stopPropagation()}>
          <Ampliar imgs={m.imgs} alt={t(m.nome)} item={ampliado} Modelo={Modelo || undefined} onItem={setAmpliado} onClose={() => setAmpliado(null)} />
        </div>
      )}
    </div>
  )
}

function Catalogo({ onQuote }: { onQuote: (m: MaquinaCatalogo) => void }) {
  const root = useRef<HTMLElement>(null)
  const [linha, setLinha] = useState(linhaDaUrl)
  const [busca, setBusca] = useState("")
  const [aberta, setAberta] = useState<MaquinaCatalogo | null>(null)
  const [video, setVideo] = useState<string | null>(null)
  const fechar = useCallback(() => setAberta(null), [])
  const fecharVideo = useCallback(() => setVideo(null), [])

  const escolher = (slug: string) => {
    setLinha(slug)
    const url = slug === "todas" ? "/maquinas" : `/maquinas?linha=${slug}`
    window.history.replaceState(null, "", url)
  }

  const lista = useMemo(() => {
    const q = norm(busca.trim())
    return MAQUINAS.filter(
      (m) =>
        (linha === "todas" || m.categorias.includes(linha)) &&
        (!q || norm(`${m.nome} ${t(m.nome)} ${m.nomeOriginal} ${m.tipo} ${t(m.tipo)} ${m.codigo}`).includes(q))
    )
  }, [linha, busca])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".maq-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out", overwrite: true })
    }, root)
    return () => ctx.revert()
  }, [lista])

  const contagem = (slug: string) => (slug === "todas" ? MAQUINAS.length : MAQUINAS.filter((m) => m.categorias.includes(slug)).length)
  const filtros = [{ slug: "todas", nome: "Todas" }, ...CATEGORIAS_MAQUINAS]

  return (
    <section id="catalogo" ref={root} className="relative bg-ink px-5 pb-28 md:px-8 md:pb-36">
      <div className="mx-auto max-w-7xl">
        <div className="sticky top-3 z-30 mb-10 md:top-24">
          <div className="glass flex flex-col gap-3 rounded-2xl p-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]" role="group" aria-label={t("Filtrar por linha")}>
              {filtros.map((f) => (
                <button
                  key={f.slug}
                  onClick={() => escolher(f.slug)}
                  aria-pressed={linha === f.slug}
                  className={cn(
                    "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm transition-colors duration-200",
                    linha === f.slug ? "bg-white text-ink" : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {t(f.nome)}
                  <span className={cn("font-mono text-[10px]", linha === f.slug ? "text-ink/50" : "text-white/35")}>{contagem(f.slug)}</span>
                </button>
              ))}
            </div>
            <label className="relative flex shrink-0 items-center lg:w-72">
              <span className="sr-only">{t("Buscar máquina")}</span>
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={t("Buscar máquina")}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-base text-white placeholder:text-white/35 focus:border-ice/60 focus:outline-none md:text-sm"
              />
            </label>
          </div>
        </div>

        <p className="mb-6 font-mono text-xs text-white/40" aria-live="polite">
          {t(lista.length === 1 ? "{n} máquina" : "{n} máquinas", { n: lista.length })}
          {linha !== "todas" && " " + t("em {linha}", { linha: nomeCat(linha).toLowerCase() })}
          {busca && " " + t("com “{busca}”", { busca })}
        </p>

        {lista.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lista.map((m) => (
              <Card key={m.id} m={m} onView={() => setAberta(m)} onQuote={() => onQuote(m)} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="text-white">{t("Nenhuma máquina encontrada.")}</p>
            <p className="mt-2 text-sm text-white/55">{t("Procura algo fora do catálogo? Descreva no pedido de orçamento abaixo.")}</p>
            <button onClick={() => { setBusca(""); escolher("todas") }} className="mt-6 cursor-pointer text-sm text-ice underline">
              {t("Limpar filtros")}
            </button>
          </div>
        )}
      </div>
      {aberta && (
        <Ficha
          m={aberta}
          onClose={fechar}
          onQuote={() => { setAberta(null); onQuote(aberta) }}
          onVideo={setVideo}
        />
      )}
      {video && <VideoModal id={video} title={t(aberta?.nome ?? "Vídeo da máquina")} onClose={fecharVideo} />}
    </section>
  )
}

export default function MaquinasPage() {
  usePage(
    "Máquinas para vidro: catálogo completo | China Glass",
    "Catálogo completo de máquinas China Glass: mesas de corte CNC, lapidadoras, bilaterais, biseladoras, furadeiras, lavadoras, jateadoras, laser, centro de usinagem, forno EVA e carregadoras. Ficha técnica e orçamento."
  )
  const [escolhida, setEscolhida] = useState<string>()

  const pedir = (m: MaquinaCatalogo) => {
    setEscolhida(m.nome)
    requestAnimationFrame(() => scrollToId("orcamento"))
  }

  return (
    <>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main>
        <PageHero
          crumb={t("Máquinas")}
          title={t("Todas as")}
          accent={t("máquinas.")}
          sub={t(
            "O catálogo completo da China Glass, separado pelas mesmas linhas do site atual. Abra a ficha técnica de cada máquina e peça o orçamento direto dela."
          )}
          chips={[
            t("{n} máquinas", { n: MAQUINAS.length }),
            t("{n} linhas", { n: CATEGORIAS_MAQUINAS.length }),
            t("Garantia de 1 ano"),
            t("Preço sob consulta"),
          ]}
          cta={{ label: t("Ver catálogo"), target: "catalogo" }}
        />
        <Catalogo onQuote={pedir} />
        <Orcamento opcoes={OPCOES_FORM} selecionada={escolhida} />
      </main>
      <Footer />
    </>
  )
}
