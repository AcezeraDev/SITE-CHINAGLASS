import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

/**
 * Entrada das cenas 3D. Sem isso o canvas aparece de uma vez, já com o modelo no lugar, quando termina de carregar.
 * `useRevelar` guarda se a cena já desenhou; `<Pronto>` vai dentro do <Canvas> e só monta depois que tudo que a cena
 * carrega (modelos, ambiente) resolveu; `classe` é a transição do canvas (surge do desfoque, um pouco maior, e assenta).
 */
export function useRevelar(montar: boolean) {
  const [pronto, setPronto] = useState(false)
  // ao desmontar (cena saiu de perto da tela), volta ao estado escondido para entrar de novo depois
  useEffect(() => {
    if (!montar) setPronto(false)
  }, [montar])
  const classe = `transition-[opacity,transform,filter] duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${
    pronto ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[1.04] blur-md"
  }`
  const aoPronto = useCallback(() => setPronto(true), [])
  return { pronto, aoPronto, classe }
}

/** Avisa quando o primeiro quadro da cena já foi desenhado */
export function Pronto({ aoPronto }: { aoPronto: () => void }) {
  useEffect(() => {
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(aoPronto)))
    return () => cancelAnimationFrame(id)
  }, [aoPronto])
  return null
}

/** O modelo assenta com mola: começa menor, um pouco acima e girado, e pousa com uma leve sobra */
export function Entrada({
  children,
  animado = true,
  de = 0.86,
  queda = 0.35,
  giro = 0.5,
}: {
  children: ReactNode
  animado?: boolean
  de?: number
  queda?: number
  giro?: number
}) {
  const g = useRef<THREE.Group>(null)
  const mola = useRef({ p: 0, v: 0, parado: false })

  useFrame((_, dt) => {
    const m = mola.current
    if (!g.current || m.parado) return
    // mola subamortecida (razão ~0,6): passa um pouco do ponto e volta
    const h = Math.min(dt, 1 / 30)
    m.v += (110 * (1 - m.p) - 13 * m.v) * h
    m.p += m.v * h
    if (Math.abs(1 - m.p) < 1e-4 && Math.abs(m.v) < 1e-4) {
      m.p = 1
      m.parado = true
    }
    const falta = 1 - m.p
    g.current.scale.setScalar(1 - (1 - de) * falta)
    g.current.position.y = queda * Math.max(0, falta)
    g.current.rotation.y = -giro * falta
  })

  if (!animado) return <>{children}</>
  return (
    <group ref={g} scale={de} position-y={queda} rotation-y={-giro}>
      {children}
    </group>
  )
}
