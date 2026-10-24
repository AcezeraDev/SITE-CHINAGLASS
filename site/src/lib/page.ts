import { useEffect } from "react"
import { t } from "@/i18n"
import { ScrollTrigger, startSmoothScroll } from "@/lib/motion"

/** Título, descrição (em português, traduzidos aqui) e rolagem suave das páginas internas */
export function usePage(title: string, description: string) {
  useEffect(() => {
    document.title = t(title)
    document.querySelector('meta[name="description"]')?.setAttribute("content", t(description))
    const stop = startSmoothScroll()
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener("load", refresh)
    return () => {
      stop()
      window.removeEventListener("load", refresh)
    }
  }, [title, description])
}
