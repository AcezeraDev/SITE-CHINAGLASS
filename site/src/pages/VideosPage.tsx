import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Play } from "lucide-react"
import { Cursor } from "@/components/Cursor"
import { PageHero } from "@/components/PageHero"
import { VideoModal } from "@/components/VideoModal"
import { EMPRESA } from "@/data"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { usePage } from "@/lib/page"
import { cn } from "@/lib/utils"
import { CATEGORIAS_MAQUINAS, MAQUINAS } from "@/maquinasData"
import { Footer } from "@/sections/Footer"
import { Navbar } from "@/sections/Navbar"

type Video = { id: string; titulo: string; extra: string[]; categorias: string[] }

/** Um vídeo por id do YouTube; quando várias máquinas usam o mesmo vídeo, os nomes vão juntos */
const VIDEOS: Video[] = (() => {
  const porId = new Map<string, Video>()
  porId.set(EMPRESA.video, { id: EMPRESA.video, titulo: "China Glass: linha de lapidação em operação", extra: [], categorias: ["lapidacao"] })
  for (const m of MAQUINAS) {
    for (const id of m.videos) {
      const v = porId.get(id)
      if (v) {
        v.extra.push(m.nome)
        v.categorias = [...new Set([...v.categorias, ...m.categorias])]
      } else porId.set(id, { id, titulo: m.nome, extra: [], categorias: [...m.categorias] })
    }
  }
  return [...porId.values()]
})()

const FILTROS = [
  { slug: "todos", nome: "Todos" },
  ...CATEGORIAS_MAQUINAS.filter((c) => VIDEOS.some((v) => v.categorias.includes(c.slug))),
]
const nomeCat = (slug: string) => t(CATEGORIAS_MAQUINAS.find((c) => c.slug === slug)?.nome ?? "")

function Thumb({ v, big, onPlay }: { v: Video; big?: boolean; onPlay: () => void }) {
  return (
    <article className={cn("vid-card group", big && "sm:col-span-2 sm:row-span-2")}>
      <button
        onClick={onPlay}
        className="relative block w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-ink-2 text-left"
        aria-label={t("Assistir: {titulo}", { titulo: t(v.titulo) })}
      >
        <img
          src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="aspect-video w-full scale-[1.02] object-cover opacity-75 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <span
          className={cn(
            "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:scale-110",
            big ? "h-20 w-20" : "h-14 w-14"
          )}
        >
          <Play className={cn("ml-1 fill-current", big ? "h-7 w-7" : "h-5 w-5")} />
        </span>
        <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ice backdrop-blur-md">
          {nomeCat(v.categorias[0])}
        </span>
      </button>
      <h3 className={cn("mt-3 font-medium leading-snug text-white", big ? "text-xl md:text-2xl" : "text-base")}>{t(v.titulo)}</h3>
      {v.extra.length > 0 && (
        <p className="mt-1 text-sm text-white/50">{t("Também mostra: {lista}", { lista: v.extra.map((n) => t(n)).join(", ") })}</p>
      )}
    </article>
  )
}

export default function VideosPage() {
  usePage(
    "Vídeos das máquinas em funcionamento | China Glass",
    "Veja as máquinas China Glass trabalhando: mesas de corte CNC, lapidadoras, bilaterais, lavadoras, furadeiras, jateadoras, laser e carregadoras."
  )
  const root = useRef<HTMLElement>(null)
  const [filtro, setFiltro] = useState("todos")
  const [tocando, setTocando] = useState<Video | null>(null)
  const fechar = useCallback(() => setTocando(null), [])

  const lista = useMemo(() => (filtro === "todos" ? VIDEOS : VIDEOS.filter((v) => v.categorias.includes(filtro))), [filtro])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".vid-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out", overwrite: true })
    }, root)
    return () => ctx.revert()
  }, [lista])

  return (
    <>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main>
        <PageHero
          crumb={t("Vídeos")}
          title={t("Veja funcionando")}
          accent={t("antes de comprar.")}
          sub={t("Vídeos das máquinas China Glass em operação: corte, lapidação, lavagem, furação, jateamento, laser e carregamento automático.")}
          chips={[t("{n} vídeos", { n: VIDEOS.length }), t("Máquinas reais em operação")]}
          cta={{ label: t("Ver vídeos"), target: "videos" }}
        />
        <section id="videos" ref={root} className="relative bg-ink px-5 pb-28 md:px-8 md:pb-36">
          <div className="mx-auto max-w-7xl">
            <div className="sticky top-3 z-30 mb-10 md:top-24">
              <div className="glass flex gap-1 overflow-x-auto rounded-2xl p-3 [scrollbar-width:none]" role="group" aria-label={t("Filtrar vídeos por linha")}>
                {FILTROS.map((f) => (
                  <button
                    key={f.slug}
                    onClick={() => setFiltro(f.slug)}
                    aria-pressed={filtro === f.slug}
                    className={cn(
                      "h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm transition-colors duration-200",
                      filtro === f.slug ? "bg-white text-ink" : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {t(f.nome)}
                  </button>
                ))}
              </div>
            </div>
            <p className="mb-6 font-mono text-xs text-white/40" aria-live="polite">
              {t(lista.length === 1 ? "{n} vídeo" : "{n} vídeos", { n: lista.length })}
            </p>
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((v, i) => (
                <Thumb key={v.id} v={v} big={i === 0 && filtro === "todos"} onPlay={() => setTocando(v)} />
              ))}
            </div>
            <p className="mt-16 text-center text-sm text-white/50">
              {t("Ficou com dúvida sobre alguma máquina?")}{" "}
              <a href="/#orcamento" className="text-ice underline-offset-4 hover:underline">{t("Fale com a gente")}</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      {tocando && <VideoModal id={tocando.id} title={t(tocando.titulo)} onClose={fechar} />}
    </>
  )
}
