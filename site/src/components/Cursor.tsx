import { useEffect, useRef } from "react"
import { gsap, prefersReducedMotion } from "@/lib/motion"

// lente lapidada: octógono com facetas, como um vidro bisotado visto de frente
const OCTO = "polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)"
const VIDA_RISCO = 420 // ms que a linha de corte leva para sumir
const VIDA_CACO = 700

type Ponto = { x: number; y: number; t: number }
type Caco = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; t: number }

/**
 * Cursor de cortador de vidro (só em telas com ponteiro fino): a ponta de diamante fica no ponteiro,
 * a lente lapidada segue atrás, o movimento deixa um risco de corte que some e o clique solta cacos.
 */
export function Cursor() {
  const lente = useRef<HTMLDivElement>(null)
  const ponta = useRef<HTMLDivElement>(null)
  const tela = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return
    const l = lente.current!
    const p = ponta.current!
    const cv = tela.current!
    const ctx = cv.getContext("2d")!
    const calmo = prefersReducedMotion()

    gsap.set([l, p], { xPercent: -50, yPercent: -50, opacity: 1 })
    const lx = gsap.quickTo(l, "x", { duration: 0.45, ease: "power3" })
    const ly = gsap.quickTo(l, "y", { duration: 0.45, ease: "power3" })
    const px = gsap.quickTo(p, "x", { duration: 0.06 })
    const py = gsap.quickTo(p, "y", { duration: 0.06 })

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const medir = () => {
      cv.width = innerWidth * dpr
      cv.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    medir()

    const risco: Ponto[] = []
    const cacos: Caco[] = []
    let quente = false
    let raf = 0

    // só desenha enquanto há risco ou caco na tela
    const desenhar = () => {
      const agora = performance.now()
      while (risco.length && agora - risco[0].t > VIDA_RISCO) risco.shift()
      for (let i = cacos.length - 1; i >= 0; i--) if (agora - cacos[i].t > VIDA_CACO) cacos.splice(i, 1)
      ctx.clearRect(0, 0, innerWidth, innerHeight)

      ctx.lineCap = "round"
      for (let i = 1; i < risco.length; i++) {
        const a = 1 - (agora - risco[i].t) / VIDA_RISCO
        ctx.strokeStyle = `rgba(143,233,255,${a * 0.75})`
        ctx.lineWidth = 0.6 + a * 1.1
        ctx.beginPath()
        ctx.moveTo(risco[i - 1].x, risco[i - 1].y)
        ctx.lineTo(risco[i].x, risco[i].y)
        ctx.stroke()
      }
      // brilho na ponta do risco, como a faísca do diamante no vidro
      const ult = risco[risco.length - 1]
      if (ult) {
        const a = 1 - (agora - ult.t) / VIDA_RISCO
        const g = ctx.createRadialGradient(ult.x, ult.y, 0, ult.x, ult.y, 10)
        g.addColorStop(0, `rgba(255,255,255,${a * 0.5})`)
        g.addColorStop(1, "rgba(143,233,255,0)")
        ctx.fillStyle = g
        ctx.fillRect(ult.x - 10, ult.y - 10, 20, 20)
      }

      for (const c of cacos) {
        const dt = (agora - c.t) / 1000
        const a = 1 - (agora - c.t) / VIDA_CACO
        ctx.save()
        ctx.translate(c.x + c.vx * dt, c.y + c.vy * dt + 260 * dt * dt)
        ctx.rotate(c.r + c.vr * dt)
        ctx.beginPath()
        ctx.moveTo(0, -c.s)
        ctx.lineTo(c.s * 0.8, c.s * 0.6)
        ctx.lineTo(-c.s * 0.6, c.s * 0.4)
        ctx.closePath()
        ctx.fillStyle = `rgba(190,240,255,${a * 0.28})`
        ctx.strokeStyle = `rgba(255,255,255,${a * 0.85})`
        ctx.lineWidth = 0.8
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      raf = risco.length || cacos.length ? requestAnimationFrame(desenhar) : 0
    }
    const acordar = () => { if (!raf) raf = requestAnimationFrame(desenhar) }

    let ux = 0, uy = 0
    const move = (e: PointerEvent) => {
      lx(e.clientX); ly(e.clientY); px(e.clientX); py(e.clientY)
      // a lente inclina na direção do movimento, como a cabeça do cortador
      const dx = e.clientX - ux, dy = e.clientY - uy
      ux = e.clientX; uy = e.clientY
      const vel = Math.min(Math.hypot(dx, dy), 40)
      if (vel > 1) gsap.to(l, { rotate: (Math.atan2(dy, dx) * 180) / Math.PI, duration: 0.6, ease: "power3", overwrite: "auto" })

      const hot = !!(e.target as HTMLElement).closest("a, button, [data-cursor], input, select, textarea, label")
      if (hot !== quente) {
        quente = hot
        gsap.to(l, { scale: hot ? 1.75 : 1, duration: 0.45, ease: "back.out(2)" })
        l.dataset.quente = hot ? "1" : ""
      }
      if (!calmo && vel > 1.5) {
        risco.push({ x: e.clientX, y: e.clientY, t: performance.now() })
        if (risco.length > 60) risco.shift()
        acordar()
      }
    }
    const down = (e: PointerEvent) => {
      gsap.to(l, { scale: quente ? 1.45 : 0.8, duration: 0.15, ease: "power2.out" })
      if (calmo) return
      const agora = performance.now()
      for (let i = 0; i < 9; i++) {
        const ang = (i / 9) * Math.PI * 2 + Math.random() * 0.6
        const v = 90 + Math.random() * 170
        cacos.push({ x: e.clientX, y: e.clientY, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 60, r: Math.random() * 6, vr: (Math.random() - 0.5) * 14, s: 3 + Math.random() * 5, t: agora })
      }
      acordar()
    }
    const up = () => gsap.to(l, { scale: quente ? 1.75 : 1, duration: 0.5, ease: "elastic.out(1, 0.4)" })
    const sair = () => gsap.to([l, p], { opacity: 0, duration: 0.25 })
    const entrar = () => gsap.to([l, p], { opacity: 1, duration: 0.25 })

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointerup", up)
    window.addEventListener("resize", medir)
    document.documentElement.addEventListener("pointerleave", sair)
    document.documentElement.addEventListener("pointerenter", entrar)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("resize", medir)
      document.documentElement.removeEventListener("pointerleave", sair)
      document.documentElement.removeEventListener("pointerenter", entrar)
    }
  }, [])

  return (
    <>
      <canvas ref={tela} className="pointer-events-none fixed inset-0 z-[89] h-full w-full" aria-hidden="true" />
      <div
        ref={lente}
        className="group/lente pointer-events-none fixed left-0 top-0 z-[90] h-10 w-10 opacity-0"
        aria-hidden="true"
      >
        {/* vidro: desfoca e clareia o que está atrás */}
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(143,233,255,0.05)_45%,rgba(255,255,255,0.12))] backdrop-blur-[3px] backdrop-brightness-125 transition-colors duration-300 group-data-[quente=1]/lente:bg-[linear-gradient(135deg,rgba(143,233,255,0.22),rgba(143,233,255,0.04)_45%,rgba(143,233,255,0.12))] group-data-[quente=1]/lente:backdrop-blur-none"
          style={{ clipPath: OCTO }}
        />
        {/* aresta e facetas */}
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full overflow-visible">
          <polygon
            points="12,0.5 28,0.5 39.5,12 39.5,28 28,39.5 12,39.5 0.5,28 0.5,12"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
            className="transition-[stroke] duration-300 group-data-[quente=1]/lente:stroke-ice"
          />
          <path d="M12 0.5 20 12 28 0.5M39.5 12 28 20l11.5 8M28 39.5 20 28l-8 11.5M0.5 28 12 20 0.5 12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
          <polygon points="20,12 28,20 20,28 12,20" fill="none" stroke="rgba(143,233,255,0.35)" strokeWidth="0.75" />
        </svg>
      </div>
      {/* ponta de diamante: o desenho do logo, em miniatura */}
      <div ref={ponta} className="pointer-events-none fixed left-0 top-0 z-[91] opacity-0" aria-hidden="true">
        <svg viewBox="0 0 64 56" className="h-2.5 w-3 drop-shadow-[0_0_6px_rgba(143,233,255,0.9)]">
          <path d="M4 18 16 4h32l12 14L32 52z" fill="var(--ice)" />
          <path d="M4 18h56M22 18l10 34 10-34" fill="none" stroke="#05080f" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  )
}
