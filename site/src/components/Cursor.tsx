import { useEffect, useRef } from "react"
import { gsap } from "@/lib/motion"

/** Lente de vidro que segue o mouse (só em telas com ponteiro fino) */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return
    const r = ring.current!
    const d = dot.current!
    gsap.set([r, d], { xPercent: -50, yPercent: -50, opacity: 1 })
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" })
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" })
    const dx = gsap.quickTo(d, "x", { duration: 0.08 })
    const dy = gsap.quickTo(d, "y", { duration: 0.08 })
    const move = (e: PointerEvent) => {
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY)
      const hot = (e.target as HTMLElement).closest("a, button, [data-cursor], input, select, textarea")
      gsap.to(r, { scale: hot ? 1.9 : 1, duration: 0.35, ease: "back.out(2)" })
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [])

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 rounded-full border border-white/40 opacity-0 backdrop-blur-[2px] mix-blend-difference"
        aria-hidden="true"
      />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-ice opacity-0" aria-hidden="true" />
    </>
  )
}
