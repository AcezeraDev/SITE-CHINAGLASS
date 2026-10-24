import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Carregadora para mesa de corte 3660 mm, modelada a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. A mesa basculante corre ao longo de x, com os três braços de ventosas na frente (+z).
 * Os braços giram num eixo junto à borda da frente: em pé pegam a chapa do cavalete, deitados a pousam na mesa.
 */

const L = 3.9 // comprimento do tampo
const P = 2.6 // largura do tampo
const MESA = 0.86 // altura do tampo
const LINHA = "#8e97a5"
const BRACOS = [-1.15, 0, 1.15]
const PIVO = new THREE.Vector3(0, MESA - 0.16, P / 2 + 0.08) // eixo dos braços
const EM_PE = 1.95 // ângulo dos braços levantados (rad), inclinados para fora como na foto
const VENTOSAS = [0.35, -0.35, -1.05, -1.75]
const OPACO = 0.32

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      cinza: new THREE.MeshStandardMaterial({ color: "#bcc3cc", metalness: 0.45, roughness: 0.45 }),
      claro: new THREE.MeshStandardMaterial({ color: "#d5dae1", metalness: 0.4, roughness: 0.4 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      feltro: new THREE.MeshStandardMaterial({ color: "#1f2228", roughness: 0.95 }),
      madeira: new THREE.MeshStandardMaterial({ color: "#d8b98a", roughness: 0.7 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0262f", metalness: 0.1, roughness: 0.35 }),
      borracha: new THREE.MeshStandardMaterial({ color: "#8f1118", roughness: 0.6 }),
    }),
    []
  )
}

/** Quadro elétrico aberto: placa azul com disjuntores, bornes e fios */
function usePainel() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 512
    c.height = 192
    const g = c.getContext("2d")!
    g.fillStyle = "#c9ced6"
    g.fillRect(0, 0, 512, 192)
    g.fillStyle = "#2465d8"
    g.fillRect(24, 22, 300, 70)
    g.fillStyle = "#f2f4f7"
    for (let i = 0; i < 12; i++) g.fillRect(36 + i * 23, 32, 14, 48)
    g.fillStyle = "#e0352b"
    for (let i = 0; i < 4; i++) g.fillRect(36 + i * 23, 40, 14, 10)
    g.fillStyle = "#1a1c21"
    g.fillRect(340, 22, 150, 90)
    g.fillStyle = "#3a3f48"
    for (let i = 0; i < 18; i++) g.fillRect(30 + i * 26, 110, 18, 22)
    g.lineWidth = 3
    for (let i = 0; i < 24; i++) {
      g.strokeStyle = ["#e0352b", "#2f7bff", "#1a1c21", "#f5c518"][i % 4]
      g.beginPath()
      g.moveTo(30 + i * 19, 132)
      g.bezierCurveTo(30 + i * 19, 170, 60 + i * 14, 150, 50 + i * 17, 190)
      g.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])
}

/** Rodízio com garfo cinza e roda vermelha */
function Rodizio({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.13, 0]} material={m.grafite}>
        <boxGeometry args={[0.1, 0.05, 0.1]} />
      </mesh>
      <mesh position={[0, 0.09, 0]} material={m.cinza}>
        <boxGeometry args={[0.07, 0.06, 0.06]} />
      </mesh>
      <mesh position={[0, 0.065, 0]} rotation-z={Math.PI / 2} material={m.vermelho} castShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.045, 20]} />
      </mesh>
      <mesh position={[0, 0.065, 0]} rotation-z={Math.PI / 2} material={m.grafite}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
      </mesh>
    </group>
  )
}

/** Barra reta entre dois pontos fixos */
function Barra({ a, b, esp, material }: { a: [number, number, number]; b: [number, number, number]; esp: number; material: THREE.Material }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a)
    const d = new THREE.Vector3(...b).sub(va)
    return {
      pos: va.clone().addScaledVector(d, 0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()),
      len: d.length(),
    }
  }, [a, b])
  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow>
      <boxGeometry args={[esp, len, esp]} />
    </mesh>
  )
}

/** Mesa basculante: estrutura de tubos, tampo de feltro com borda de madeira, réguas nos braços e quadro elétrico */
function Mesa({ m }: { m: Mats }) {
  const painel = usePainel()
  const pernasX = [-1.8, -0.6, 0.6, 1.8]
  const zs = [-1, 1].map((s) => s * (P / 2 - 0.12))
  return (
    <group>
      {pernasX.flatMap((x) =>
        zs.map((z) => (
          <mesh key={`${x}${z}`} position={[x, (MESA - 0.1) / 2, z]} material={m.cinza} castShadow>
            <boxGeometry args={[0.09, MESA - 0.1, 0.09]} />
          </mesh>
        ))
      )}
      {/* longarinas no chão e logo abaixo do tampo */}
      {zs.flatMap((z) =>
        [0.06, 0.5].map((y) => (
          <mesh key={`${z}${y}`} position={[0, y, z]} material={m.cinza} castShadow>
            <boxGeometry args={[3.7, 0.09, 0.09]} />
          </mesh>
        ))
      )}
      {pernasX.map((x) => (
        <mesh key={x} position={[x, 0.06, 0]} material={m.cinza}>
          <boxGeometry args={[0.08, 0.08, P - 0.24]} />
        </mesh>
      ))}
      {/* sapatas niveladoras */}
      {pernasX.flatMap((x) =>
        zs.map((z) => (
          <mesh key={`p${x}${z}`} position={[x, 0.01, z]} material={m.grafite}>
            <boxGeometry args={[0.14, 0.02, 0.14]} />
          </mesh>
        ))
      )}

      {/* quadro elétrico aberto na ponta esquerda */}
      <Chapa size={[0.5, 0.42, 1.9]} position={[-1.55, 0.3, -0.1]} material={m.claro} linha={LINHA} edges={false} />
      <mesh position={[-1.806, 0.3, -0.1]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshStandardMaterial map={painel} roughness={0.6} />
      </mesh>
      {/* motor e redutor do basculamento, embaixo do centro */}
      <mesh position={[0.3, 0.32, 0.3]} rotation-z={Math.PI / 2} material={m.inox} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.38, 20]} />
      </mesh>
      <Chapa size={[0.22, 0.24, 0.22]} position={[0.6, 0.32, 0.3]} material={m.grafite} edges={false} />

      {/* tampo */}
      <mesh position={[0, MESA - 0.06, 0]} material={m.cinza} castShadow receiveShadow>
        <boxGeometry args={[L, 0.1, P]} />
      </mesh>
      <mesh position={[0, MESA - 0.006, 0]} material={m.madeira}>
        <boxGeometry args={[L + 0.02, 0.012, P + 0.02]} />
      </mesh>
      <mesh position={[0, MESA + 0.001, 0]} rotation-x={-Math.PI / 2} material={m.feltro} receiveShadow>
        <planeGeometry args={[L - 0.05, P - 0.05]} />
      </mesh>
      {/* réguas de alumínio onde os braços deitam, e as divisões das placas de feltro */}
      {BRACOS.map((x) => (
        <mesh key={x} position={[x, MESA + 0.003, 0]} material={m.claro}>
          <boxGeometry args={[0.13, 0.006, P - 0.05]} />
        </mesh>
      ))}
      {[-0.58, 0.58].map((x) => (
        <mesh key={x} position={[x, MESA + 0.003, 0]} material={m.grafite}>
          <boxGeometry args={[0.012, 0.004, P - 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, MESA + 0.003, -0.35]} material={m.grafite}>
        <boxGeometry args={[L - 0.05, 0.004, 0.012]} />
      </mesh>
      {/* controle remoto em cima da mesa */}
      <group position={[-1.6, MESA + 0.02, -1.0]} rotation-y={0.3}>
        <mesh material={m.grafite}>
          <boxGeometry args={[0.24, 0.035, 0.08]} />
        </mesh>
        <mesh position={[0.06, 0.02, 0]} material={m.vermelho}>
          <cylinderGeometry args={[0.018, 0.018, 0.01, 12]} />
        </mesh>
      </group>
    </group>
  )
}

/** Carro dos braços: trilho no chão, montantes até o eixo e rodízios vermelhos */
function Carro({ m }: { m: Mats }) {
  const zc = P / 2 + 0.38
  return (
    <group>
      <mesh position={[0, 0.17, zc]} material={m.cinza} castShadow>
        <boxGeometry args={[3.5, 0.09, 0.1]} />
      </mesh>
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.17, (zc + P / 2 - 0.12) / 2]} material={m.cinza}>
          <boxGeometry args={[0.09, 0.09, zc - P / 2 + 0.12]} />
        </mesh>
      ))}
      {[-1.7, 1.7].map((x) => (
        <Rodizio key={x} position={[x, 0, zc]} m={m} />
      ))}
      {BRACOS.map((x) => (
        <group key={x}>
          {[-0.09, 0.09].map((dx) => (
            <Barra key={dx} a={[x + dx, 0.2, zc]} b={[x + dx, PIVO.y, PIVO.z]} esp={0.06} material={m.cinza} />
          ))}
          <Rodizio position={[x, 0, zc]} m={m} />
        </group>
      ))}
      {/* eixo comum dos braços */}
      <mesh position={[0, PIVO.y, PIVO.z]} rotation-z={Math.PI / 2} material={m.inox}>
        <cylinderGeometry args={[0.035, 0.035, 2.8, 16]} />
      </mesh>
    </group>
  )
}

/** Um braço, no sistema do eixo: deitado aponta para -z (sobre a mesa), com as ventosas viradas para +y */
function Braco({ x, m }: { x: number; m: Mats }) {
  return (
    <group position={[x, 0, 0]}>
      {/* viga principal e trilho de trás, ligados como escada */}
      <mesh position={[0, 0, -0.75]} material={m.claro} castShadow>
        <boxGeometry args={[0.09, 0.09, 2.5]} />
        <Edges color={LINHA} threshold={15} />
      </mesh>
      <mesh position={[0, -0.17, -0.6]} material={m.claro} castShadow>
        <boxGeometry args={[0.06, 0.06, 1.5]} />
      </mesh>
      {[0.1, -0.6, -1.3].map((z) => (
        <mesh key={z} position={[0, -0.085, z]} material={m.claro}>
          <boxGeometry args={[0.05, 0.13, 0.05]} />
        </mesh>
      ))}
      {/* ventosas vermelhas com haste de inox */}
      {VENTOSAS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.085, 0]} material={m.inox}>
            <cylinderGeometry args={[0.016, 0.016, 0.08, 10]} />
          </mesh>
          <mesh position={[0, 0.14, 0]} material={m.vermelho} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.04, 28]} />
          </mesh>
          <mesh position={[0, 0.1605, 0]} rotation-x={-Math.PI / 2} material={m.borracha}>
            <ringGeometry args={[0.04, 0.085, 28]} />
          </mesh>
          <mesh position={[0, 0.162, 0]} material={m.claro}>
            <cylinderGeometry args={[0.022, 0.022, 0.006, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Cilindro de acionamento entre o carro e o braço: corpo fixo e haste que estica conforme o braço gira */
function Atuador({ x, angulo, m }: { x: number; angulo: { a: number }; m: Mats }) {
  const corpo = useRef<THREE.Mesh>(null)
  const haste = useRef<THREE.Mesh>(null)
  const v = useMemo(
    () => ({
      base: new THREE.Vector3(x + 0.13, 0.26, P / 2 + 0.38),
      ponto: new THREE.Vector3(),
      d: new THREE.Vector3(),
      y: new THREE.Vector3(0, 1, 0),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
    }),
    [x]
  )
  const CORPO = 0.45
  useFrame(() => {
    if (!corpo.current || !haste.current) return
    // ponto de fixação no braço, girado junto com ele
    v.ponto.set(0, -0.17, -0.45).applyEuler(v.e.set(angulo.a, 0, 0)).add(PIVO)
    v.ponto.x = x + 0.13
    v.d.subVectors(v.ponto, v.base)
    const len = v.d.length()
    v.d.normalize()
    v.q.setFromUnitVectors(v.y, v.d)
    corpo.current.quaternion.copy(v.q)
    corpo.current.position.copy(v.base).addScaledVector(v.d, CORPO / 2)
    haste.current.quaternion.copy(v.q)
    haste.current.position.copy(v.base).addScaledVector(v.d, (CORPO + len) / 2)
    haste.current.scale.y = Math.max(len - CORPO, 0.01)
  })
  return (
    <group>
      <mesh ref={corpo} material={m.inox} castShadow>
        <cylinderGeometry args={[0.045, 0.045, CORPO, 16]} />
      </mesh>
      <mesh ref={haste} material={m.claro}>
        <cylinderGeometry args={[0.016, 0.016, 1, 10]} />
      </mesh>
    </group>
  )
}

const CICLO = 11
const suave = (p: number) => p * p * (3 - 2 * p)
const faixa = (r: number, a: number, b: number) => Math.min(Math.max((r - a) / (b - a), 0), 1)

/**
 * Ciclo de carga: chapa aparece nos braços em pé, braços deitam e pousam a chapa na mesa,
 * voltam a ficar em pé e a chapa desliza para a mesa de corte.
 */
function ciclo(tempo: number) {
  const r = tempo % CICLO
  let a = EM_PE
  if (r >= 1.8 && r < 4.8) a = EM_PE * (1 - suave(faixa(r, 1.8, 4.8)))
  else if (r >= 4.8 && r < 5.6) a = 0
  else if (r >= 5.6 && r < 8.6) a = EM_PE * suave(faixa(r, 5.6, 8.6))
  const noBraco = r < 5.2
  return {
    a,
    noBraco,
    opBraco: noBraco ? OPACO * faixa(r, 0, 0.8) : 0,
    opMesa: noBraco ? 0 : OPACO * (1 - faixa(r, 9.2, 10.2)),
    desliza: -1.6 * suave(faixa(r, 8.6, 10.2)),
  }
}

function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const eixo = useRef<THREE.Group>(null)
  const vidroBraco = useRef<THREE.Mesh>(null)
  const vidroMesa = useRef<THREE.Mesh>(null)
  const angulo = useMemo(() => ({ a: EM_PE }), [])
  const mats = useMemo(() => {
    const base = { color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, depthWrite: false }
    return { braco: new THREE.MeshStandardMaterial({ ...base, opacity: OPACO }), mesa: new THREE.MeshStandardMaterial({ ...base, opacity: 0 }) }
  }, [])

  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    const s = animado ? ciclo(tempo) : { a: EM_PE, noBraco: true, opBraco: OPACO, opMesa: 0, desliza: 0 }
    angulo.a = s.a
    if (eixo.current) eixo.current.rotation.x = s.a
    mats.braco.opacity = s.opBraco
    mats.mesa.opacity = s.opMesa
    if (vidroBraco.current) vidroBraco.current.visible = s.noBraco
    if (vidroMesa.current) {
      vidroMesa.current.visible = !s.noBraco && s.opMesa > 0.001
      vidroMesa.current.position.x = s.desliza
    }
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.25
  })

  return (
    <group ref={rig}>
      <Mesa m={m} />
      <Carro m={m} />
      <group ref={eixo} position={PIVO}>
        {BRACOS.map((x) => (
          <Braco key={x} x={x} m={m} />
        ))}
        <mesh ref={vidroBraco} position={[0, 0.167, -0.85]} material={mats.braco}>
          <boxGeometry args={[3.3, 0.008, 2.3]} />
          <Edges color="#7fd6ff" />
        </mesh>
      </group>
      {BRACOS.map((x) => (
        <Atuador key={x} x={x} angulo={angulo} m={m} />
      ))}
      <mesh ref={vidroMesa} position={[0, PIVO.y + 0.167, PIVO.z - 0.85]} material={mats.mesa} visible={false}>
        <boxGeometry args={[3.3, 0.008, 2.3]} />
        <Edges color="#7fd6ff" />
      </mesh>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 1.0, 0.3)
const RAIO = 2.9 // da ponta da mesa até a ventosa mais alta dos braços em pé
const DIRECAO = new THREE.Vector3(-4.5, 3.2, 6.5) // de frente pela esquerda, com o quadro elétrico e os braços à vista, como na foto

/** Carregadora para mesa de corte em 3D: os braços de ventosas levantam a chapa e a deitam na mesa */
export default function Carregadora({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da carregadora para mesa de corte 3660 mm")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
