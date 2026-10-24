import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { Esteira } from "./Esteira"
import { OFF, type PosCorte, type Risco } from "./corteTempo"
import { Chapa } from "./Vitrine"

/*
 * Peças comuns das linhas de corte com pórtico CNC: plano de corte, riscos na chapa e o pórtico com cabeçote.
 * O pórtico anda em x e o cabeçote anda em z ao longo dele. Os riscos ficam no sistema da chapa (centro em 0, 0).
 */

export { faixa, OFF, planoDeCorte, suave, type PosCorte, type Risco } from "./corteTempo"

/** Riscos crescendo na chapa conforme `feitos` (0 a 1 cada) */
export function Riscos({ cortes, feitos, y, material }: { cortes: Risco[]; feitos: number[]; y: number; material: THREE.Material }) {
  const riscos = useRef<(THREE.Mesh | null)[]>([])
  const geo = useMemo(() => new THREE.BoxGeometry(1, 0.002, 0.008).translate(0.5, 0, 0), [])
  useFrame(() => {
    cortes.forEach((_, i) => {
      const r = riscos.current[i]
      if (!r) return
      r.visible = feitos[i] > 0
      r.scale.x = Math.max(feitos[i], 0.0001)
    })
  })
  return (
    <group>
      {cortes.map(([x1, z1, x2, z2], i) => (
        <group key={i} position={[x1, y, z1]} rotation-y={Math.atan2(-(z2 - z1), x2 - x1)} scale={[Math.hypot(x2 - x1, z2 - z1), 1, 1]}>
          <mesh ref={(el) => void (riscos.current[i] = el)} geometry={geo} material={material} visible={false} />
        </group>
      ))}
    </group>
  )
}

type MatsPortico = Record<"azul" | "alu" | "branco" | "preto" | "inox" | "amarelo", THREE.Material>

/** Pórtico com carros azuis nas laterais, viga de alumínio, esteira em cima e cabeçote; segue `pos` a cada quadro */
export function Portico({ m, P, mesa, pos, x0 = 0, linha = "#9aa3b2" }: { m: MatsPortico; P: number; mesa: number; pos: PosCorte; x0?: number; linha?: string }) {
  const portico = useRef<THREE.Group>(null)
  const cabeca = useRef<THREE.Group>(null)
  const faisca = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (portico.current) portico.current.position.x = x0 + pos.x - OFF
    if (cabeca.current) cabeca.current.position.z = pos.z
    if (faisca.current) {
      faisca.current.visible = pos.cortando
      faisca.current.scale.setScalar(0.8 + Math.sin(clock.elapsedTime * 40) * 0.25)
    }
  })

  return (
    <group ref={portico}>
      {[-1, 1].map((sz) => (
        <group key={sz} position={[0, 0, sz * (P / 2 + 0.12)]}>
          <mesh position={[0, mesa + 0.2, 0]} material={m.azul} castShadow>
            <boxGeometry args={[0.46, 0.4, 0.18]} />
            <Edges color="#155a99" />
          </mesh>
          <mesh position={[0, mesa - 0.05, 0]} material={m.azul} castShadow>
            <boxGeometry args={[0.3, 0.18, 0.12]} />
          </mesh>
        </group>
      ))}
      <Chapa size={[0.2, 0.2, P + 0.36]} position={[0, mesa + 0.34, 0]} material={m.alu} linha={linha} />
      <Esteira
        m={m}
        origem={[0, mesa + 0.46, 0]}
        s={[0, 0, 1]}
        h={[0, 1, 0]}
        w={[1, 0, 0]}
        s0={-P / 2 - 0.1}
        ponta={() => pos.z}
        comprimento={P + 0.5}
        raio={0.12}
        lado={1}
      />
      <group ref={cabeca}>
        <Chapa size={[0.06, 0.3, 0.24]} position={[0.13, mesa + 0.34, 0]} material={m.branco} linha={linha} />
        <mesh position={[OFF, mesa + 0.16, 0]} material={m.azul} castShadow>
          <boxGeometry args={[0.13, 0.24, 0.13]} />
        </mesh>
        <mesh position={[OFF, mesa + 0.31, 0]} material={m.preto}>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 18]} />
        </mesh>
        <mesh position={[OFF, mesa + 0.03, 0]} material={m.inox}>
          <cylinderGeometry args={[0.012, 0.02, 0.05, 12]} />
        </mesh>
        <mesh ref={faisca} position={[OFF, mesa + 0.016, 0]} visible={false}>
          <sphereGeometry args={[0.012, 10, 8]} />
          <meshBasicMaterial color="#bff0ff" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/** Materiais da chapa de vidro e do risco, com a opacidade controlada por quem anima */
export function useVidro(opacidade: number) {
  return useMemo(() => {
    const vidro = new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: opacidade, depthWrite: false })
    const risco = new THREE.MeshBasicMaterial({ color: "#eaf8ff", toneMapped: false, transparent: true })
    return { vidro, risco }
  }, [opacidade])
}
