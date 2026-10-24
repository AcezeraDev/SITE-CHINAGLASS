import { useEffect, useRef, useState } from "react"
import { Check, ChevronUp, Languages } from "lucide-react"
import { Flag } from "@/components/Flag"
import { LANGS, lang, langInfo, setLang, t } from "@/i18n"
import { cn } from "@/lib/utils"

/** Widget fixo no canto inferior esquerdo: mostra o idioma atual e abre para cima com os quatro idiomas */
export function LangWidget() {
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const atual = langInfo()

  // Esc ou clique fora fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [open])

  return (
    <div ref={root} className="fixed bottom-5 left-5 z-[60]">
      {/* painel que sobe a partir do botão */}
      <div
        id="lang-widget"
        className={cn(
          "absolute bottom-full left-0 mb-3 origin-bottom-left transition-all duration-300 ease-out",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-2 scale-95 opacity-0"
        )}
      >
        <div className="w-56 rounded-2xl border border-white/10 bg-ink-2/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
          <p className="flex items-center gap-2 px-3 pb-2 pt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <Languages className="h-3.5 w-3.5 text-ice" /> {t("Idioma")}
          </p>
          <ul>
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    setOpen(false)
                    setLang(l.code)
                  }}
                  lang={l.html}
                  aria-current={l.code === lang() ? "true" : undefined}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white aria-[current=true]:bg-white/[0.05] aria-[current=true]:text-white"
                >
                  <Flag lang={l.code} />
                  <span className="flex-1">{l.nome}</span>
                  {l.code === lang() && <Check className="h-4 w-4 text-ice" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="lang-widget"
        aria-label={t("Idioma: {nome}", { nome: atual.nome })}
        className={cn(
          "glass flex h-12 cursor-pointer items-center gap-2.5 rounded-2xl pl-3.5 pr-3 font-mono text-xs uppercase text-white/80 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] transition-colors hover:text-white",
          open && "text-white"
        )}
      >
        <Flag lang={atual.code} />
        {atual.code}
        <ChevronUp className={cn("h-3.5 w-3.5 transition-transform duration-300", !open && "rotate-180")} />
      </button>
    </div>
  )
}
