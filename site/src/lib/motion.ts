import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Valores de rolagem lidos pelas cenas 3D a cada quadro (0 → 1) */
export const scrollState = { hero: 0, jornada: 0 }

/** Ponteiro normalizado (-1 → 1), compartilhado pelas cenas 3D */
export const pointer = { x: 0, y: 0 }

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (typeof window !== "undefined") {
    window.addEventListener("pointermove", (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    })
  }
  if (prefersReducedMotion() || lenis) return () => {}
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
  lenis.on("scroll", ScrollTrigger.update)
  const tick = (t: number) => lenis?.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" })
}
