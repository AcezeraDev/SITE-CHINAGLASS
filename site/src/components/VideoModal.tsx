import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"

/** Vídeo do YouTube em tela cheia; fecha no Esc, no X ou clicando fora */
export function VideoModal({ id, title, onClose }: { id: string; title: string; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    box.current?.querySelector<HTMLElement>("button")?.focus()
    gsap.fromTo(box.current, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" })
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div id="video-modal" className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 p-3 backdrop-blur-md md:p-8" onClick={onClose}>
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="truncate text-sm text-white/80">{title}</p>
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-ink"
            aria-label={t("Fechar vídeo")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-2">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
