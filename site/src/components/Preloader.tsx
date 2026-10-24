import { useEffect, useRef, useState } from "react"
import { gsap, prefersReducedMotion } from "@/lib/motion"
import { DiamondMark } from "./Logo"

/** Abertura curta: o diamante se desenha e a cortina sobe */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setGone(true)
      onDone()
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setGone(true)
        },
      })
      tl.fromTo(".diamond-draw path", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.12, ease: "power2.inOut" })
        .fromTo(".pre-word", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out" }, "-=0.6")
        .to(".pre-count", { textContent: 100, duration: 1.5, snap: { textContent: 1 }, ease: "power1.inOut" }, 0)
        .add(onDone, "+=0.05")
        .to(root.current, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "+=0.05")
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-ink">
      <DiamondMark draw className="h-20 w-24 text-ice" />
      <div className="overflow-hidden">
        <p className="pre-word font-wide text-sm tracking-[0.4em] text-white">CHINA GLASS</p>
      </div>
      <p className="absolute bottom-8 right-8 font-mono text-xs text-steel">
        <span className="pre-count">0</span>%
      </p>
    </div>
  )
}
