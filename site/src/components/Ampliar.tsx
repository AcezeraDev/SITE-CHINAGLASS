import { Suspense, useCallback, useEffect, useRef, useState, type ComponentType } from "react"
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, Rotate3d, X } from "lucide-react"
import { Carregando3D } from "@/components/Carregando3D"
import { t } from "@/i18n"
import { cn } from "@/lib/utils"
import { ZoomVitrine } from "@/three/Vitrine"

/*
 * Tela cheia da ficha: fotos com zoom (roda do mouse, pinça, duplo clique, + e −) e arrasto para mover,
 * e o modelo 3D grande com zoom livre. `item` -1 é o modelo 3D, os outros são o índice da foto.
 */

const MAX = 5
const PASSO = 1.4
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)
const botao =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white backdrop-blur-md transition-colors hover:border-ice hover:text-ice disabled:cursor-default disabled:opacity-35"

type Vista = { s: number; x: number; y: number }
const INICIAL: Vista = { s: 1, x: 0, y: 0 }

/** Foto com zoom em volta do ponto apontado; com zoom, arrasta para mover sem sair da borda da foto */
function FotoZoom({ src, alt }: { src: string; alt: string }) {
  const area = useRef<HTMLDivElement>(null)
  const [v, setV] = useState<Vista>(INICIAL)
  const dedos = useRef(new Map<number, { x: number; y: number }>())
  const pinca = useRef<{ d: number; s: number } | null>(null)

  useEffect(() => setV(INICIAL), [src])

  /** muda a escala (a partir da atual) mantendo parado o ponto (cx, cy) da tela, relativo ao centro da área */
  const escalar = useCallback((nova: (s: number) => number, cx = 0, cy = 0) => {
    setV((a) => {
      const s = clamp(nova(a.s), 1, MAX)
      const el = area.current
      const w = el?.clientWidth ?? 0
      const h = el?.clientHeight ?? 0
      const x = cx - ((cx - a.x) * s) / a.s
      const y = cy - ((cy - a.y) * s) / a.s
      return { s, x: clamp(x, (-(s - 1) * w) / 2, ((s - 1) * w) / 2), y: clamp(y, (-(s - 1) * h) / 2, ((s - 1) * h) / 2) }
    })
  }, [])

  const doCentro = (e: { clientX: number; clientY: number }) => {
    const r = area.current!.getBoundingClientRect()
    return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2] as const
  }

  // a roda do mouse precisa de ouvinte não passivo para não rolar a página junto
  useEffect(() => {
    const el = area.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const [cx, cy] = doCentro(e)
      escalar((s) => s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), cx, cy)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [escalar])

  return (
    <div
      ref={area}
      className={cn("relative h-full w-full touch-none select-none overflow-hidden", v.s > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
      onDoubleClick={(e) => {
        const [cx, cy] = doCentro(e)
        escalar((s) => (s > 1 ? 1 : 2.5), cx, cy)
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (dedos.current.size === 2) {
          const [a, b] = [...dedos.current.values()]
          pinca.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: v.s }
        }
      }}
      onPointerMove={(e) => {
        const antes = dedos.current.get(e.pointerId)
        if (!antes) return
        dedos.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (dedos.current.size === 2 && pinca.current) {
          const [a, b] = [...dedos.current.values()]
          const [cx, cy] = doCentro({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 })
          const p = pinca.current
          escalar(() => (p.s * Math.hypot(a.x - b.x, a.y - b.y)) / p.d, cx, cy)
        } else if (dedos.current.size === 1) {
          const dx = e.clientX - antes.x
          const dy = e.clientY - antes.y
          setV((a) => {
            const w = area.current!.clientWidth
            const h = area.current!.clientHeight
            return {
              s: a.s,
              x: clamp(a.x + dx, (-(a.s - 1) * w) / 2, ((a.s - 1) * w) / 2),
              y: clamp(a.y + dy, (-(a.s - 1) * h) / 2, ((a.s - 1) * h) / 2),
            }
          })
        }
      }}
      onPointerUp={(e) => {
        dedos.current.delete(e.pointerId)
        if (dedos.current.size < 2) pinca.current = null
      }}
      onPointerCancel={(e) => {
        dedos.current.delete(e.pointerId)
        pinca.current = null
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-contain p-6 md:p-10"
        style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.s})`, transition: dedos.current.size ? "none" : "transform 0.2s ease-out" }}
      />
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
        <button type="button" className={botao} onClick={() => escalar((s) => s / PASSO)} disabled={v.s <= 1} aria-label={t("Afastar")} title={t("Afastar")}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-14 text-center font-mono text-xs text-ink/70">{Math.round(v.s * 100)}%</span>
        <button type="button" className={botao} onClick={() => escalar((s) => s * PASSO)} disabled={v.s >= MAX} aria-label={t("Aproximar")} title={t("Aproximar")}>
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" className={botao} onClick={() => setV(INICIAL)} disabled={v.s === 1} aria-label={t("Restaurar zoom")} title={t("Restaurar zoom")}>
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function Ampliar({
  imgs,
  alt,
  item,
  Modelo,
  onItem,
  onClose,
}: {
  imgs: string[]
  alt: string
  item: number
  Modelo?: ComponentType<{ className?: string }>
  onItem: (i: number) => void
  onClose: () => void
}) {
  const itens = Modelo ? [...imgs.map((_, i) => i), -1] : imgs.map((_, i) => i)
  const pos = itens.indexOf(item)
  const ir = useCallback((d: number) => onItem(itens[(pos + d + itens.length) % itens.length]), [itens, pos, onItem])
  const fechar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fechar.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") ir(1)
      else if (e.key === "ArrowLeft") ir(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, ir])

  return (
    <div id="zoom-modal" role="dialog" aria-modal="true" aria-label={alt} data-lenis-prevent className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-md">
      <div className="relative m-3 flex-1 overflow-hidden rounded-2xl md:m-5">
        {item === -1 && Modelo ? (
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#0d1730,#060a14_70%)]">
            <ZoomVitrine.Provider value="total">
              <Suspense fallback={<Carregando3D className="absolute inset-0" />}>
                <Modelo className="absolute inset-0" />
              </Suspense>
            </ZoomVitrine.Provider>
            <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ice backdrop-blur-md">
              <Rotate3d className="h-3.5 w-3.5" /> {t("Arraste para girar · role ou pince para zoom")}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-white">
            <FotoZoom src={imgs[item]} alt={alt} />
          </div>
        )}
        <button ref={fechar} type="button" onClick={onClose} className={cn(botao, "absolute right-4 top-4 z-10")} aria-label={t("Fechar")}>
          <X className="h-4 w-4" />
        </button>
        {itens.length > 1 && (
          <>
            <button type="button" onClick={() => ir(-1)} className={cn(botao, "absolute left-4 top-1/2 z-10 -translate-y-1/2")} aria-label={t("Anterior")}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => ir(1)} className={cn(botao, "absolute right-4 top-1/2 z-10 -translate-y-1/2")} aria-label={t("Próxima")}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
