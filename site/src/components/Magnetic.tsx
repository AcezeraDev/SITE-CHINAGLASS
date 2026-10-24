import { useRef, type ReactNode } from "react"
import { gsap } from "@/lib/motion"

/** Puxa levemente o filho na direção do cursor e volta com mola ao sair */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  return (
    <span
      ref={ref}
      className="inline-block"
      onPointerMove={(e) => {
        const el = ref.current!
        const r = el.getBoundingClientRect()
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.4,
          ease: "power3.out",
        })
      }}
      onPointerLeave={() => gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" })}
    >
      {children}
    </span>
  )
}
