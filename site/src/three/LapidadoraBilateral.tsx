import { useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Lapidadora bilateral 20 rebolos, modelada a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. O vidro corre ao longo de x (entra em +x, sai em -x) entre as duas unidades de lapidação:
 * a de trás (-z) é fixa e a da frente (+z) anda em z para ajustar a largura. Cada unidade tem 10 motores.
 */

const LINHA = "#9aa3b2"
const VIDRO_Y = 0.96 // altura da chapa sobre as esteiras
const MEIA = 0.58 // meia largura da chapa: as bordas entram nos rebolos
const MOTORES = Array.from({ length: 10 }, (_, i) => -1.75 + i * 0.38)

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      claro: new THREE.MeshStandardMaterial({ color: "#e6e9ee", metalness: 0.25, roughness: 0.45 }),
      cinza: new THREE.MeshStandardMaterial({ color: "#c3c9d1", metalness: 0.45, roughness: 0.4 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#3a3f47", metalness: 0.4, roughness: 0.55 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.45, roughness: 0.4 }),
      azul: new THREE.MeshStandardMaterial({ color: "#3d6f9e", metalness: 0.55, roughness: 0.35 }),
      laranja: new THREE.MeshStandardMaterial({ color: "#f26a1b", metalness: 0.3, roughness: 0.4 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0352b", roughness: 0.45 }),
      rebolo: new THREE.MeshStandardMaterial({ color: "#8a8f98", metalness: 0.6, roughness: 0.5 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0a2a4a", emissive: "#3a8bff", emissiveIntensity: 0.35, roughness: 0.15 }),
      vidro: new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false }),
    }),
    []
  )
}

/** Faixa preta com os amperímetros brancos da frente da unidade */
function useAmperimetros() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 64
    const g = c.getContext("2d")!
    g.fillStyle = "#14161b"
    g.fillRect(0, 0, 1024, 64)
    g.fillStyle = "#f2f4f7"
    for (let i = 0; i < 10; i++) g.fillRect(40 + i * 100, 14, 36, 36)
    g.fillStyle = "#14161b"
    for (let i = 0; i < 10; i++) g.fillRect(48 + i * 100, 30, 20, 3)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Chapa de grade escura da plataforma de entrada */
function useGrade() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 256
    const g = c.getContext("2d")!
    g.fillStyle = "#2a2e35"
    g.fillRect(0, 0, 256, 256)
    g.strokeStyle = "#15171c"
    g.lineWidth = 3
    for (let i = 0; i < 256; i += 10) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 2)
    return tex
  }, [])
}

/** Furo oval da base: retângulo de cantos totalmente arredondados */
function useOval(w: number, h: number) {
  return useMemo(() => {
    const r = h / 2
    const s = new THREE.Shape()
    s.moveTo(-w / 2 + r, -r)
    s.lineTo(w / 2 - r, -r)
    s.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false)
    s.lineTo(-w / 2 + r, r)
    s.absarc(-w / 2 + r, 0, r, Math.PI / 2, (Math.PI * 3) / 2, false)
    return new THREE.ShapeGeometry(s, 16)
  }, [w, h])
}

/** Esteira de taliscas laranja que puxa a chapa, em z = `z` */
function Esteira({ z, m, animado }: { z: number; m: Mats; animado: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const passo = 0.07
  const comp = 5.8
  const n = Math.floor(comp / passo)
  const mat = useMemo(() => new THREE.Matrix4(), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const desl = animado ? (clock.elapsedTime * 0.45) % passo : 0
    for (let i = 0; i < n; i++) {
      mat.makeTranslation(comp / 2 - i * passo - desl, VIDRO_Y - 0.015, z)
      ref.current.setMatrixAt(i, mat)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <mesh position={[0, VIDRO_Y - 0.07, z]} material={m.grafite} castShadow>
        <boxGeometry args={[comp + 0.1, 0.09, 0.12]} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} material={m.vermelho} frustumCulled={false}>
        <boxGeometry args={[0.05, 0.03, 0.1]} />
      </instancedMesh>
      {/* viga de pressão por cima, dentro da máquina */}
      <mesh position={[-0.1, VIDRO_Y + 0.12, z]} material={m.cinza}>
        <boxGeometry args={[4.0, 0.1, 0.12]} />
      </mesh>
    </group>
  )
}

/** Uma unidade de lapidação; `s` = -1 atrás, +1 na frente. Motores para fora, rebolos para dentro */
function Unidade({ s, m, rebolos, animado }: { s: 1 | -1; m: Mats; rebolos: RefObject<THREE.Group[]>; animado: boolean }) {
  const amp = useAmperimetros()
  const fora = s * 1.1 // face de fora do corpo
  return (
    <group>
      {/* corpo e capota de cima */}
      <Chapa size={[4.0, 0.55, 0.5]} position={[-0.1, 0.7, s * 0.85]} material={m.claro} linha={LINHA} />
      <Chapa size={[4.0, 0.4, 0.78]} position={[-0.1, 1.34, s * 0.82]} material={m.claro} linha={LINHA} />
      <mesh position={[-0.1, 1.37, s * 1.212]} rotation-y={s > 0 ? 0 : Math.PI}>
        <planeGeometry args={[3.7, 0.15]} />
        <meshStandardMaterial map={amp} roughness={0.4} />
      </mesh>
      {MOTORES.map((x, i) => {
        // os dois do meio são os rebolos de bisotê, inclinados
        const inclinado = i === 4 || i === 5
        return (
          <group key={x} position={[x, 1.03, fora + s * 0.12]} rotation-x={inclinado ? -s * 0.6 : 0}>
            <mesh rotation-x={Math.PI / 2} material={m.azul} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.24, 20]} />
            </mesh>
            <mesh position={[0, 0, s * 0.13]} rotation-x={Math.PI / 2} material={m.grafite}>
              <cylinderGeometry args={[0.085, 0.085, 0.03, 20]} />
            </mesh>
            <mesh position={[0, 0.11, 0]} material={m.azul}>
              <boxGeometry args={[0.08, 0.05, 0.08]} />
            </mesh>
          </group>
        )
      })}
      {/* manípulos brancos de ajuste, um por motor */}
      {MOTORES.map((x) => (
        <mesh key={x} position={[x, 0.8, fora + s * 0.02]} rotation-x={Math.PI / 2} material={m.claro}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 14]} />
          <Edges color="#3a3f48" />
        </mesh>
      ))}
      {/* rebolos na face de dentro, na altura da borda do vidro */}
      {MOTORES.map((x, i) => (
        <group
          key={x}
          position={[x, VIDRO_Y, s * (MEIA + 0.02)]}
          ref={(el) => {
            if (el && rebolos.current) rebolos.current[(s > 0 ? 10 : 0) + i] = el
          }}
        >
          <mesh rotation-x={Math.PI / 2} material={m.rebolo}>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 6]} />
          </mesh>
        </group>
      ))}
      <Esteira z={s * 0.4} m={m} animado={animado} />
    </group>
  )
}

/** Pórtico laranja que liga as unidades, com a esteira porta-cabos em arco */
function Portico({ m }: { m: Mats }) {
  const elos = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(
      [[-0.3, 1.55, -0.8], [-0.35, 1.95, -0.8], [-0.7, 2.15, -0.8], [-1.15, 2.12, -0.8], [-1.4, 2.02, -0.75]].map((p) => new THREE.Vector3(...p))
    )
    const n = 34
    return Array.from({ length: n }, (_, i) => {
      const u = i / (n - 1)
      const p = curva.getPointAt(u)
      const tg = curva.getTangentAt(u)
      return { p, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tg) }
    })
  }, [])
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-1.5, 1.72, s * 0.85]} material={m.laranja} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.16]} />
        </mesh>
      ))}
      <mesh position={[-1.5, 1.95, 0]} material={m.laranja} castShadow>
        <boxGeometry args={[0.2, 0.12, 1.95]} />
        <Edges color="#a8430c" />
      </mesh>
      {elos.map(({ p, q }, i) => (
        <mesh key={i} position={p} quaternion={q} material={m.preto}>
          <boxGeometry args={[0.05, 0.035, 0.11]} />
        </mesh>
      ))}
    </group>
  )
}

function Base({ m }: { m: Mats }) {
  const oval = useOval(0.7, 0.2)
  const grade = useGrade()
  return (
    <group>
      <mesh position={[-0.1, 0.21, 0]} material={m.grafite} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.42, 2.5]} />
      </mesh>
      {[-1.3, -0.25, 0.8].map((x) => (
        <mesh key={x} geometry={oval} position={[x, 0.22, 1.252]} material={m.preto} />
      ))}
      {/* torre escura na ponta de saída */}
      <mesh position={[-2.42, 0.8, 0]} material={m.grafite} castShadow>
        <boxGeometry args={[0.45, 1.6, 2.5]} />
        <Edges color="#22262c" />
      </mesh>
      {/* plataforma de entrada com grade e as duas bombas d'água */}
      <Chapa size={[0.95, 0.14, 2.3]} position={[2.5, 0.07, 0]} material={m.claro} linha={LINHA} />
      <mesh position={[2.5, 0.142, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.85, 2.2]} />
        <meshStandardMaterial map={grade} roughness={0.8} />
      </mesh>
      {[2.3, 2.7].map((x) => (
        <group key={x} position={[x, 0.14, 0.75]}>
          <mesh position={[0, 0.16, 0]} material={m.grafite} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.32, 16]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={m.grafite}>
            <boxGeometry args={[0.18, 0.06, 0.18]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Painel de toque com moldura laranja, num braço na ponta de entrada da unidade da frente */
function Painel({ m }: { m: Mats }) {
  return (
    <group position={[2.15, 1.3, 1.3]} rotation-y={-0.45}>
      <mesh position={[-0.12, -0.05, -0.15]} rotation-x={Math.PI / 2} material={m.cinza}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 10]} />
      </mesh>
      <mesh material={m.laranja}>
        <boxGeometry args={[0.5, 0.36, 0.05]} />
      </mesh>
      <mesh position={[0, 0, 0.012]} material={m.cinza}>
        <boxGeometry args={[0.46, 0.32, 0.05]} />
      </mesh>
      <mesh position={[0, 0.02, 0.038]} material={m.tela}>
        <planeGeometry args={[0.36, 0.22]} />
      </mesh>
    </group>
  )
}

const CICLO = 9

function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const vidro = useRef<THREE.Mesh>(null)
  const rebolos = useRef<THREE.Group[]>([])
  useFrame(({ clock }, dt) => {
    const tempo = clock.elapsedTime
    // a chapa atravessa a máquina de +x para -x
    if (vidro.current) vidro.current.position.x = animado ? 3.3 - ((tempo % CICLO) / CICLO) * 6.6 : 0.3
    if (animado) for (const r of rebolos.current) if (r) r.rotation.z += dt * 12
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.25
  })
  return (
    <group ref={rig}>
      <Base m={m} />
      <Unidade s={-1} m={m} rebolos={rebolos} animado={animado} />
      <Unidade s={1} m={m} rebolos={rebolos} animado={animado} />
      <Portico m={m} />
      <Painel m={m} />
      <mesh ref={vidro} position={[0.3, VIDRO_Y + 0.005, 0]} material={m.vidro}>
        <boxGeometry args={[1.3, 0.008, MEIA * 2]} />
        <Edges color="#7fd6ff" />
      </mesh>
    </group>
  )
}

const ALVO = new THREE.Vector3(0.1, 0.95, 0)
const RAIO = 3.1 // da torre de saída até a ponta das esteiras de entrada
const DIRECAO = new THREE.Vector3(3.4, 5.2, 6.6) // de frente pela direita e de cima, para ver a chapa passando entre as unidades

/** Lapidadora bilateral 20 rebolos em 3D: a chapa atravessa entre as duas unidades e os rebolos giram */
export default function LapidadoraBilateral({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da lapidadora bilateral 20 rebolos")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
