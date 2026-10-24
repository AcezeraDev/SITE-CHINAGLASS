import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { gsap, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  delay?: number
  decimalPlaces?: number
}

/**
 * Conta de startValue até value quando aparece na tela.
 * Usa IntersectionObserver + GSAP (a versão com motion/react ficava parada em 0 com a rolagem do Lenis).
 */
export function NumberTicker({ value, startValue = 0, delay = 0, className, decimalPlaces = 0, ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (n: number) =>
      Intl.NumberFormat("pt-BR", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(n)
    if (prefersReducedMotion()) {
      el.textContent = fmt(value)
      return
    }
    const state = { n: startValue }
    let tween: gsap.core.Tween | undefined
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      tween = gsap.to(state, {
        n: value,
        duration: 1.6,
        delay,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = fmt(state.n)
        },
      })
    })
    io.observe(el)
    return () => {
      io.disconnect()
      tween?.kill()
    }
  }, [value, startValue, delay, decimalPlaces])

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {startValue}
    </span>
  )
}
