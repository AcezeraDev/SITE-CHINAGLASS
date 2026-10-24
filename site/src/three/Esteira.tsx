import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Esteira porta-cabos: elos pretos com ponto amarelo, presa numa ponta e puxada pela outra.
 * Comprimento fixo; a curva em U se desloca conforme a ponta móvel anda, como numa esteira de verdade.
 * `s` é o eixo de movimento, `h` o lado para onde a esteira dobra e `w` a largura (onde fica o ponto amarelo).
 */
export function Esteira({
  origem,
  s: eixoS,
  h: eixoH,
  w: eixoW,
  s0,
  ponta,
  comprimento,
  raio,
  lado,
  m,
}: {
  origem: [number, number, number]
  s: [number, number, number]
  h: [number, number, number]
  w: [number, number, number]
  s0: number
  /** posição atual da ponta móvel, no eixo s */
  ponta: () => number
  comprimento: number
  raio: number
  /** -1: a curva fica antes das duas pontas; +1: depois */
  lado: -1 | 1
  m: { preto: THREE.Material; amarelo: THREE.Material }
}) {
  const elos = useRef<THREE.InstancedMesh>(null)
  const pontos = useRef<THREE.InstancedMesh>(null)
  const passo = 0.045
  const n = Math.floor(comprimento / passo)
  const v = useMemo(
    () => ({
      o: new THREE.Vector3(...origem),
      S: new THREE.Vector3(...eixoS),
      H: new THREE.Vector3(...eixoH),
      W: new THREE.Vector3(...eixoW),
      T: new THREE.Vector3(),
      B: new THREE.Vector3(),
      p: new THREE.Vector3(),
      mat: new THREE.Matrix4(),
    }),
    [origem, eixoS, eixoH, eixoW]
  )

  useFrame(() => {
    if (!elos.current || !pontos.current) return
    const e = ponta()
    const curva = (comprimento - Math.PI * raio + lado * (s0 + e)) / 2
    const sb = lado * curva // posição da curva no eixo s
    const a = Math.abs(sb - s0)
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * passo
      let s: number, hh: number, th: number
      if (u < a) {
        s = s0 + lado * u; hh = 0; th = 0
      } else if (u < a + Math.PI * raio) {
        th = (u - a) / raio
        s = sb + lado * raio * Math.sin(th)
        hh = raio - raio * Math.cos(th)
      } else {
        s = sb - lado * (u - a - Math.PI * raio); hh = 2 * raio; th = Math.PI
      }
      // tangente e normal do elo para ele seguir a curva
      v.T.copy(v.S).multiplyScalar(lado * Math.cos(th)).addScaledVector(v.H, Math.sin(th)).normalize()
      v.B.crossVectors(v.W, v.T)
      v.p.copy(v.o).addScaledVector(v.S, s).addScaledVector(v.H, hh)
      v.mat.makeBasis(v.T, v.B, v.W).setPosition(v.p)
      elos.current.setMatrixAt(i, v.mat)
      v.p.addScaledVector(v.W, 0.038)
      v.mat.setPosition(v.p)
      pontos.current.setMatrixAt(i, v.mat)
    }
    elos.current.instanceMatrix.needsUpdate = true
    pontos.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={elos} args={[undefined, undefined, n]} material={m.preto} castShadow frustumCulled={false}>
        <boxGeometry args={[passo * 0.92, 0.035, 0.075]} />
      </instancedMesh>
      <instancedMesh ref={pontos} args={[undefined, undefined, n]} material={m.amarelo} frustumCulled={false}>
        <boxGeometry args={[0.014, 0.014, 0.004]} />
      </instancedMesh>
    </group>
  )
}
