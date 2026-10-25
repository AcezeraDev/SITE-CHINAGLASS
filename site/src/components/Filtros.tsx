import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import { t } from "@/i18n"
import { cn } from "@/lib/utils"

export type OpcaoFiltro = { valor: string; rotulo: string; total?: number }

type Busca = { valor: string; onChange: (v: string) => void; placeholder: string; rotulo: string }

/**
 * Barra de filtros fixa do topo dos catálogos (máquinas, peças, vídeos).
 * O destaque branco desliza até a opção escolhida; quando as opções não cabem,
 * as bordas esmaecem e aparecem setas para rolar.
 */
export function Filtros({
  opcoes,
  valor,
  onChange,
  rotulo,
  busca,
}: {
  opcoes: OpcaoFiltro[]
  valor: string
  onChange: (v: string) => void
  rotulo: string
  busca?: Busca
}) {
  const trilho = useRef<HTMLDivElement>(null)
  const [pilula, setPilula] = useState<{ x: number; w: number } | null>(null)
  const [lados, setLados] = useState({ esq: false, dir: false })

  const medir = useCallback(() => {
    const el = trilho.current
    if (!el) return
    const ativo = el.querySelector<HTMLElement>("[aria-pressed=true]")
    if (ativo) setPilula({ x: ativo.offsetLeft, w: ativo.offsetWidth })
    setLados({ esq: el.scrollLeft > 4, dir: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }, [])

  // a opção escolhida sempre fica à vista, fora das setas (ex.: entrar por ?linha=laser)
  const mostrarAtivo = useCallback((behavior: ScrollBehavior) => {
    const el = trilho.current
    const ativo = el?.querySelector<HTMLElement>("[aria-pressed=true]")
    if (!el || !ativo) return
    const sobra = 56
    if (ativo.offsetLeft < el.scrollLeft + sobra) el.scrollTo({ left: ativo.offsetLeft - sobra, behavior })
    else if (ativo.offsetLeft + ativo.offsetWidth > el.scrollLeft + el.clientWidth - sobra)
      el.scrollTo({ left: ativo.offsetLeft + ativo.offsetWidth - el.clientWidth + sobra, behavior })
  }, [])

  // mede de novo ao redimensionar, carregar a fonte ou trocar de idioma (rótulos mudam de largura)
  useLayoutEffect(() => {
    const el = trilho.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      medir()
      mostrarAtivo("instant")
    })
    ro.observe(el)
    el.querySelectorAll("button").forEach((b) => ro.observe(b))
    return () => ro.disconnect()
  }, [medir, mostrarAtivo, opcoes])

  useLayoutEffect(() => {
    medir()
    mostrarAtivo("smooth")
  }, [medir, mostrarAtivo, valor])

  const rolar = (dir: 1 | -1) => {
    const el = trilho.current
    el?.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" })
  }

  // setas do teclado andam entre as opções, como numa lista de abas
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    const i = opcoes.findIndex((o) => o.valor === valor)
    const prox = opcoes[(i + (e.key === "ArrowRight" ? 1 : -1) + opcoes.length) % opcoes.length]
    e.preventDefault()
    onChange(prox.valor)
    requestAnimationFrame(() => trilho.current?.querySelector<HTMLElement>("[aria-pressed=true]")?.focus())
  }

  const mascara = `linear-gradient(to right, ${lados.esq ? "transparent, #000 56px" : "#000, #000"}, ${lados.dir ? "#000 calc(100% - 56px), transparent" : "#000, #000"})`
  const seta =
    "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-ink-2/90 text-white/80 shadow-lg backdrop-blur-md transition-[opacity,color,border-color] duration-200 hover:border-ice/50 hover:text-ice md:flex"

  return (
    <div className="sticky top-3 z-30 mb-10 md:top-24">
      <div className={cn("glass flex flex-col gap-2 rounded-2xl p-2 md:p-2.5", busca && "lg:flex-row lg:items-center lg:gap-3")}>
        <div className="relative min-w-0 flex-1">
          <div
            ref={trilho}
            onScroll={medir}
            onKeyDown={onKeyDown}
            role="group"
            aria-label={rotulo}
            className="relative flex gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ maskImage: mascara, WebkitMaskImage: mascara }}
          >
            {pilula && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 rounded-xl bg-white shadow-[0_6px_24px_-8px_rgba(169,224,255,0.55)] transition-[transform,width] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
                style={{ transform: `translateX(${pilula.x}px)`, width: pilula.w }}
              />
            )}
            {opcoes.map((o) => {
              const on = o.valor === valor
              return (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => onChange(o.valor)}
                  aria-pressed={on}
                  tabIndex={on ? 0 : -1}
                  className={cn(
                    "relative flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ice",
                    on ? "font-medium text-ink" : "text-white/65 hover:bg-white/[0.06] hover:text-white",
                    // antes da primeira medida o destaque ainda não existe
                    on && !pilula && "bg-white"
                  )}
                >
                  {o.rotulo}
                  {o.total !== undefined && (
                    <span
                      className={cn(
                        "min-w-5 rounded-md px-1 py-0.5 text-center font-mono text-[10px] leading-none transition-colors duration-300",
                        on ? "bg-ink/10 text-ink/70" : "bg-white/[0.06] text-white/40"
                      )}
                    >
                      {o.total}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => rolar(-1)}
            tabIndex={-1}
            aria-label={t("Anterior")}
            className={cn(seta, "left-0", !lados.esq && "pointer-events-none opacity-0")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => rolar(1)}
            tabIndex={-1}
            aria-label={t("Próxima")}
            className={cn(seta, "right-0", !lados.dir && "pointer-events-none opacity-0")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {busca && (
          <label className="relative flex shrink-0 items-center lg:w-72">
            <span className="sr-only">{busca.rotulo}</span>
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-white/40" />
            <input
              type="search"
              value={busca.valor}
              onChange={(e) => busca.onChange(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && busca.onChange("")}
              placeholder={busca.placeholder}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-10 text-base text-white transition-colors placeholder:text-white/35 hover:border-white/20 focus:border-ice/60 focus:bg-white/[0.06] focus:outline-none md:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {busca.valor && (
              <button
                type="button"
                onClick={() => busca.onChange("")}
                aria-label={t("Limpar busca")}
                className="absolute right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        )}
      </div>
    </div>
  )
}
