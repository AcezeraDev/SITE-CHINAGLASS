import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Lavadora horizontal em inox, modelada a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. A chapa corre ao longo de x (entra em +x, sai em -x) sobre roletes vermelhos:
 * mesa de entrada, caixa de lavagem com escovas, caixa de secagem com o soprador e mesa de saída.
 */

const LINHA = "#8e97a5"
const ROLO_Y = 0.85 // topo dos roletes
const L = 3.4 // comprimento total
const P = 1.7 // largura
const LAVAGEM = { x: 0.05, comp: 1.0 }
const SECAGEM = { x: -0.7, comp: 0.32 }

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      inox: new THREE.MeshStandardMaterial({ color: "#dfe4ea", metalness: 0.9, roughness: 0.25 }),
      aco: new THREE.MeshStandardMaterial({ color: "#4a4f57", metalness: 0.55, roughness: 0.45 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.3, roughness: 0.6 }),
      rolo: new THREE.MeshStandardMaterial({ color: "#e0412f", roughness: 0.55 }),
      bege: new THREE.MeshStandardMaterial({ color: "#e9e4d6", roughness: 0.5 }),
      latao: new THREE.MeshStandardMaterial({ color: "#c9a24a", metalness: 0.8, roughness: 0.3 }),
      vidro: new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false }),
    }),
    []
  )
}

/** Frente do quadro elétrico: botões, sinaleiros e etiqueta de alerta */
function useQuadro() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 200
    c.height = 200
    const g = c.getContext("2d")!
    g.fillStyle = "#e9e4d6"
    g.fillRect(0, 0, 200, 200)
    g.fillStyle = "#f5c518"
    g.beginPath(); g.moveTo(20, 40); g.lineTo(36, 12); g.lineTo(52, 40); g.closePath(); g.fill()
    const cores = ["#f5a524", "#e0352b", "#22c47a", "#16181d", "#16181d", "#e0352b"]
    cores.forEach((cor, i) => {
      g.fillStyle = cor
      g.beginPath(); g.arc(60 + (i % 3) * 45, 90 + Math.floor(i / 3) * 50, 13, 0, Math.PI * 2); g.fill()
    })
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Quadro de tubos escuros com rodízios */
function Quadro({ m }: { m: Mats }) {
  const xs = [-L / 2 + 0.05, -0.55, 0.6, L / 2 - 0.05]
  return (
    <group>
      {xs.flatMap((x) =>
        [-1, 1].map((sz) => (
          <group key={`${x}${sz}`} position={[x, 0, sz * (P / 2 - 0.04)]}>
            <mesh position={[0, 0.47, 0]} material={m.aco} castShadow>
              <boxGeometry args={[0.06, 0.74, 0.06]} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation-x={Math.PI / 2} material={m.preto}>
              <cylinderGeometry args={[0.045, 0.045, 0.035, 16]} />
            </mesh>
            <mesh position={[0, 0.1, 0]} material={m.grafite}>
              <boxGeometry args={[0.07, 0.03, 0.07]} />
            </mesh>
          </group>
        ))
      )}
      {/* longarinas de cima e de baixo, travessas */}
      {[-1, 1].flatMap((sz) =>
        [0.2, ROLO_Y - 0.06].map((y) => (
          <mesh key={`${sz}${y}`} position={[0, y, sz * (P / 2 - 0.04)]} material={m.aco} castShadow>
            <boxGeometry args={[L, 0.06, 0.06]} />
          </mesh>
        ))
      )}
      {xs.map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} material={m.aco}>
          <boxGeometry args={[0.05, 0.05, P - 0.1]} />
        </mesh>
      ))}
      {/* trilhos de inox onde os roletes giram */}
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, ROLO_Y - 0.03, sz * (P / 2)]} material={m.inox} castShadow>
          <boxGeometry args={[L + 0.04, 0.09, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

/** Roletes vermelhos de entrada e de saída, todos girando para a chapa andar em -x */
function Roletes({ m, rolos }: { m: Mats; rolos: THREE.Mesh[] }) {
  const xs = useMemo(() => {
    const lista: number[] = []
    const passo = 0.085
    for (let x = L / 2 - 0.08; x > LAVAGEM.x + LAVAGEM.comp / 2 + 0.03; x -= passo) lista.push(x)
    for (let x = SECAGEM.x - SECAGEM.comp / 2 - 0.06; x > -L / 2 + 0.06; x -= passo) lista.push(x)
    return lista
  }, [])
  return (
    <group>
      {xs.map((x) => (
        <mesh
          key={x}
          ref={(el) => void (el && !rolos.includes(el) && rolos.push(el))}
          position={[x, ROLO_Y - 0.03, 0]}
          rotation-x={Math.PI / 2}
          material={m.rolo}
          castShadow
        >
          <cylinderGeometry args={[0.03, 0.03, P - 0.06, 14]} />
        </mesh>
      ))}
    </group>
  )
}

/** Caixa de lavagem com tampa parafusada e alças, caixa de secagem, tanque, soprador e mangueira */
function Caixas({ m }: { m: Mats }) {
  const quadro = useQuadro()
  const mangueira = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          [[SECAGEM.x, ROLO_Y + 0.42, 0.55], [SECAGEM.x, ROLO_Y + 0.42, 0.95], [SECAGEM.x - 0.05, 0.75, 1.0], [-0.4, 0.42, 0.75], [-0.95, 0.42, 0.35]].map((p) => new THREE.Vector3(...p))
        ),
        60,
        0.05,
        12,
        false
      ),
    []
  )
  return (
    <group>
      {/* caixa de lavagem: corpo e tampa com parafusos e alças */}
      <Chapa size={[LAVAGEM.comp, 0.3, P + 0.06]} position={[LAVAGEM.x, ROLO_Y + 0.12, 0]} material={m.inox} linha={LINHA} />
      <Chapa size={[LAVAGEM.comp - 0.08, 0.06, P - 0.1]} position={[LAVAGEM.x, ROLO_Y + 0.3, 0]} material={m.inox} linha={LINHA} />
      {[-0.42, -0.14, 0.14, 0.42].flatMap((dx) =>
        [-0.75, 0.75].map((z) => (
          <mesh key={`${dx}${z}`} position={[LAVAGEM.x + dx, ROLO_Y + 0.34, z]} material={m.preto}>
            <boxGeometry args={[0.08, 0.025, 0.02]} />
          </mesh>
        ))
      )}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[LAVAGEM.x - 0.45 + i * 0.1, ROLO_Y + 0.34, -0.82]} material={m.inox}>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 6]} />
        </mesh>
      ))}
      {/* caixa de secagem (faca de ar) */}
      <Chapa size={[SECAGEM.comp, 0.42, P + 0.06]} position={[SECAGEM.x, ROLO_Y + 0.18, 0]} material={m.inox} linha={LINHA} />
      {/* tanque de água embaixo da lavagem, com registro de dreno */}
      <Chapa size={[LAVAGEM.comp + 0.1, 0.42, P - 0.3]} position={[LAVAGEM.x, 0.47, 0]} material={m.inox} linha={LINHA} />
      <mesh position={[LAVAGEM.x + 0.3, 0.22, 0.75]} material={m.latao}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 10]} />
      </mesh>
      <mesh position={[LAVAGEM.x + 0.3, 0.17, 0.79]} rotation-x={Math.PI / 2} material={m.latao}>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
      </mesh>
      {/* soprador: carcaça redonda com motor */}
      <group position={[-1.05, 0.42, 0.25]}>
        <mesh rotation-x={Math.PI / 2} material={m.grafite} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.18, 28]} />
          <Edges color="#121418" threshold={40} />
        </mesh>
        <mesh position={[0, 0, -0.17]} rotation-x={Math.PI / 2} material={m.grafite}>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 20]} />
        </mesh>
      </group>
      <mesh geometry={mangueira} material={m.preto} castShadow />
      {/* quadro elétrico na frente, sob a mesa de entrada */}
      <group position={[1.05, 0.5, P / 2 + 0.02]}>
        <Chapa size={[0.42, 0.42, 0.18]} position={[0, 0, -0.09]} material={m.bege} linha={LINHA} />
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[0.38, 0.38]} />
          <meshStandardMaterial map={quadro} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

const CICLO = 8

function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const vidro = useRef<THREE.Mesh>(null)
  const rolos = useMemo<THREE.Mesh[]>(() => [], [])
  useFrame(({ clock }, dt) => {
    const tempo = clock.elapsedTime
    if (vidro.current) vidro.current.position.x = animado ? 2.4 - ((tempo % CICLO) / CICLO) * 4.8 : 1.1
    // rolo de raio 0.03 girando na velocidade da chapa (0.6 m/s)
    if (animado) for (const r of rolos) r.rotation.y += dt * 20
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.25
  })
  return (
    <group ref={rig}>
      <Quadro m={m} />
      <Roletes m={m} rolos={rolos} />
      <Caixas m={m} />
      <mesh ref={vidro} position={[1.1, ROLO_Y + 0.005, 0]} material={m.vidro}>
        <boxGeometry args={[1.0, 0.008, 1.3]} />
        <Edges color="#7fd6ff" />
      </mesh>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 0.65, 0)
const RAIO = 2.15 // da mesa de entrada até a de saída
const DIRECAO = new THREE.Vector3(3.6, 3.4, 6.8) // de frente pela direita e por cima, como na perspectiva da referência

/** Lavadora horizontal em 3D: os roletes giram e a chapa atravessa a lavagem e a secagem */
export default function Lavadora({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da lavadora horizontal em inox")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
