import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Esteira } from "./Esteira"
import { Chapa, useLogo, Vitrine } from "./Vitrine"

/*
 * Mesa de corte CNC 4200 × 2800 mm, modelada a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. A mesa corre ao longo de x (pórtico em -x, extremo livre com rolo em +x), frente em +z.
 * O pórtico anda em x e o cabeçote anda em z ao longo dele, riscando a chapa de vidro.
 */

const L = 4.4 // comprimento do tampo
const P = 2.9 // largura do tampo
const MESA = 0.88 // altura do tampo
const LINHA = "#9aa3b2"
const OFF = 0.17 // distância do centro da viga até a roda de corte

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      branco: new THREE.MeshStandardMaterial({ color: "#e4e8ee", metalness: 0.25, roughness: 0.45 }),
      alu: new THREE.MeshStandardMaterial({ color: "#d3d9e1", metalness: 0.85, roughness: 0.3 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.45, roughness: 0.35 }),
      feltro: new THREE.MeshStandardMaterial({ color: "#1c2027", roughness: 0.95 }),
      verde: new THREE.MeshStandardMaterial({ color: "#1fc47a", emissive: "#0d8a50", emissiveIntensity: 0.35, roughness: 0.5 }),
      azul: new THREE.MeshStandardMaterial({ color: "#1f8be0", metalness: 0.35, roughness: 0.35 }),
      amarelo: new THREE.MeshStandardMaterial({ color: "#f5c518", roughness: 0.5 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0a2a4a", emissive: "#3a8bff", emissiveIntensity: 0.35, roughness: 0.15 }),
      vidro: new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false }),
      risco: new THREE.MeshBasicMaterial({ color: "#eaf8ff", toneMapped: false }),
    }),
    []
  )
}

/** Faixa amarela da viga com CHINA GLASS entre barras pretas */
function useFaixa() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 96
    const g = c.getContext("2d")!
    g.fillStyle = "#f5c518"
    g.fillRect(0, 0, c.width, c.height)
    g.fillStyle = "#16181d"
    for (const x0 of [40, 860]) for (let k = 0; k < 3; k++) g.fillRect(x0 + k * 36, 14, 16, 68)
    g.font = "800 64px 'Archivo', 'Arial', sans-serif"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText("CHINA GLASS", 512, 52)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])
}

/** Painel de botões do console: teclas coloridas e botão de emergência */
function useBotoes() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 128
    const g = c.getContext("2d")!
    g.fillStyle = "#eef1f5"
    g.fillRect(0, 0, 256, 128)
    const cores = ["#e0352b", "#f5c518", "#22c47a", "#2f7bff"]
    for (let i = 0; i < 8; i++) {
      g.fillStyle = cores[i % 4]
      g.beginPath()
      g.arc(34 + (i % 4) * 34, 40 + Math.floor(i / 4) * 40, 11, 0, Math.PI * 2)
      g.fill()
    }
    g.fillStyle = "#c81e1e"
    g.beginPath()
    g.arc(208, 60, 26, 0, Math.PI * 2)
    g.fill()
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Estrutura de tubos com rodízios, tampo com feltro e correias verdes, trilhos e grampos pretos nas laterais */
function Base({ m }: { m: Mats }) {
  const pernasX = [-1.9, -0.65, 0.65, 1.9]
  const zs = [-1, 1].map((s) => s * (P / 2 - 0.3))
  return (
    <group>
      {/* pernas com rodízio */}
      {pernasX.flatMap((x) =>
        zs.map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.47, 0]} material={m.branco} castShadow>
              <boxGeometry args={[0.09, 0.78, 0.09]} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation-x={Math.PI / 2} material={m.grafite}>
              <cylinderGeometry args={[0.05, 0.05, 0.035, 18]} />
            </mesh>
          </group>
        ))
      )}
      {/* longarinas em cima e embaixo, travessas nas pernas */}
      {zs.flatMap((z) =>
        [0.28, MESA - 0.13].map((y) => (
          <mesh key={`${z}${y}`} position={[0, y, z]} material={m.branco} castShadow>
            <boxGeometry args={[4.0, 0.09, 0.09]} />
          </mesh>
        ))
      )}
      {pernasX.map((x) => (
        <mesh key={x} position={[x, 0.28, 0]} material={m.branco}>
          <boxGeometry args={[0.08, 0.08, P - 0.6]} />
        </mesh>
      ))}
      {/* caixa central embaixo da mesa */}
      <Chapa size={[0.8, 0.36, P - 0.75]} position={[0, 0.55, 0]} material={m.branco} linha={LINHA} />

      {/* tampo: chassi de alumínio, feltro preto e correias verdes ao longo de x */}
      <mesh position={[0, MESA - 0.05, 0]} material={m.alu} castShadow receiveShadow>
        <boxGeometry args={[L, 0.1, P]} />
      </mesh>
      <mesh position={[0.05, MESA + 0.001, 0]} rotation-x={-Math.PI / 2} material={m.feltro} receiveShadow>
        <planeGeometry args={[L - 0.2, P - 0.12]} />
      </mesh>
      {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((z) => (
        <mesh key={z} position={[0.05, MESA + 0.002, z]} material={m.verde}>
          <boxGeometry args={[L - 0.2, 0.003, 0.03]} />
        </mesh>
      ))}
      {/* rolo do extremo livre */}
      <mesh position={[L / 2 + 0.04, MESA - 0.03, 0]} rotation-x={Math.PI / 2} material={m.branco} castShadow>
        <cylinderGeometry args={[0.05, 0.05, P - 0.05, 20]} />
      </mesh>
      {/* grampos pretos ao longo das duas laterais */}
      {[-1, 1].flatMap((sz) =>
        Array.from({ length: 15 }, (_, i) => (
          <mesh key={`${sz}${i}`} position={[-L / 2 + 0.45 + i * 0.27, MESA - 0.12, sz * (P / 2 + 0.035)]} material={m.preto}>
            <boxGeometry args={[0.05, 0.08, 0.05]} />
          </mesh>
        ))
      )}
      {/* trilhos do pórtico */}
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, MESA + 0.01, sz * (P / 2 + 0.06)]} material={m.inox}>
          <boxGeometry args={[L, 0.03, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

/** Console em pé com monitor inclinado, teclas, logo e cabos até a mesa */
function Console({ m }: { m: Mats }) {
  const logo = useLogo("#2a2e35")
  const botoes = useBotoes()
  const cabos = useMemo(
    () =>
      [0, 0.06].map(
        (d) =>
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(
              [[-L / 2 - 0.5, 0.3, 1.05 - d], [-L / 2 - 0.3, 0.03, 1.0 - d], [-L / 2 - 0.12, 0.05, 0.9 - d], [-L / 2 + 0.05, 0.4, 0.85 - d]].map(
                (p) => new THREE.Vector3(...p)
              )
            ),
            40,
            0.018,
            8,
            false
          )
      ),
    []
  )
  return (
    <group>
      <group position={[-L / 2 - 0.75, 0, 1.2]} rotation-y={0.55}>
        <Chapa size={[0.52, 1.2, 0.42]} position={[0, 0.6, 0]} material={m.branco} linha={LINHA} />
        <mesh position={[0, 0.6, 0.212]}>
          <planeGeometry args={[0.36, 0.26]} />
          <meshStandardMaterial map={logo} transparent roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.05, 0.212]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshStandardMaterial map={botoes} roughness={0.4} />
        </mesh>
        {/* cabeça do console com monitor inclinado */}
        <group position={[0, 1.42, 0.04]} rotation-x={-0.22}>
          <Chapa size={[0.56, 0.42, 0.14]} position={[0, 0, 0]} material={m.branco} linha={LINHA} />
          <mesh position={[0, 0.01, 0.071]} material={m.tela}>
            <planeGeometry args={[0.44, 0.3]} />
          </mesh>
        </group>
      </group>
      {cabos.map((g, i) => (
        <mesh key={i} geometry={g} material={m.preto} />
      ))}
    </group>
  )
}

// riscos do plano de corte [x1, z1, x2, z2]: três transversais e dois longitudinais
const CORTES: [number, number, number, number][] = [
  [-0.95, -1.15, -0.95, 1.15],
  [0.05, 1.15, 0.05, -1.15],
  [1.05, -1.15, 1.05, 1.15],
  [1.85, -0.3, -1.75, -0.3],
  [-1.75, 0.45, 1.85, 0.45],
]
const CASA: [number, number] = [-1.95, -1.3]
const IR = 0.9
const CORTAR = 1.7
const PAUSA = 1.6
const CICLO = CORTES.length * (IR + CORTAR) + IR + PAUSA

const suave = (p: number) => p * p * (3 - 2 * p)

/** Onde está a roda de corte no tempo `tempo`, se está riscando e quanto de cada risco já foi feito */
function plano(tempo: number, feitos: number[]) {
  let r = tempo % CICLO
  let antes = CASA
  for (let i = 0; i < CORTES.length; i++) {
    const [x1, z1, x2, z2] = CORTES[i]
    if (r < IR) {
      const p = suave(r / IR)
      feitos.fill(0, i)
      return { x: antes[0] + (x1 - antes[0]) * p, z: antes[1] + (z1 - antes[1]) * p, cortando: false }
    }
    r -= IR
    if (r < CORTAR) {
      const p = r / CORTAR
      feitos[i] = p
      feitos.fill(0, i + 1)
      return { x: x1 + (x2 - x1) * p, z: z1 + (z2 - z1) * p, cortando: true }
    }
    r -= CORTAR
    feitos[i] = 1
    antes = [x2, z2]
  }
  const p = suave(Math.min(r / IR, 1))
  return { x: antes[0] + (CASA[0] - antes[0]) * p, z: antes[1] + (CASA[1] - antes[1]) * p, cortando: false }
}

/** Chapa de vidro sobre o feltro, com os riscos crescendo atrás da roda */
function Vidro({ m, feitos }: { m: Mats; feitos: number[] }) {
  const riscos = useRef<(THREE.Mesh | null)[]>([])
  const geo = useMemo(() => new THREE.BoxGeometry(1, 0.002, 0.006).translate(0.5, 0, 0), [])
  useFrame(() => {
    CORTES.forEach((_, i) => {
      const r = riscos.current[i]
      if (!r) return
      r.visible = feitos[i] > 0
      r.scale.x = Math.max(feitos[i], 0.0001)
    })
  })
  return (
    <group>
      <mesh position={[0.05, MESA + 0.008, 0]} material={m.vidro}>
        <boxGeometry args={[3.6, 0.008, 2.3]} />
        <Edges color="#7fd6ff" />
      </mesh>
      {CORTES.map(([x1, z1, x2, z2], i) => {
        const len = Math.hypot(x2 - x1, z2 - z1)
        return (
          <group key={i} position={[x1, MESA + 0.0135, z1]} rotation-y={Math.atan2(-(z2 - z1), x2 - x1)} scale={[len, 1, 1]}>
            <mesh ref={(el) => void (riscos.current[i] = el)} geometry={geo} material={m.risco} visible={false} />
          </group>
        )
      })}
    </group>
  )
}

/** Pórtico com carros azuis, viga com faixa amarela, esteira em cima e cabeçote de corte */
function Portico({ m, animado, pos, feitos }: { m: Mats; animado: boolean; pos: { x: number; z: number }; feitos: number[] }) {
  const portico = useRef<THREE.Group>(null)
  const cabeca = useRef<THREE.Group>(null)
  const faisca = useRef<THREE.Mesh>(null)
  const faixa = useFaixa()

  useFrame(({ clock }) => {
    const s = animado ? plano(clock.elapsedTime, feitos) : { x: -0.6, z: 0.2, cortando: false }
    pos.x = s.x
    pos.z = s.z
    if (portico.current) portico.current.position.x = s.x - OFF
    if (cabeca.current) cabeca.current.position.z = s.z
    if (faisca.current) {
      faisca.current.visible = s.cortando
      faisca.current.scale.setScalar(0.8 + Math.sin(clock.elapsedTime * 40) * 0.25)
    }
  })

  return (
    <group ref={portico}>
      {/* carros azuis nas duas laterais */}
      {[-1, 1].map((sz) => (
        <group key={sz} position={[0, 0, sz * (P / 2 + 0.12)]}>
          <mesh position={[0, MESA + 0.2, 0]} material={m.azul} castShadow>
            <boxGeometry args={[0.46, 0.4, 0.18]} />
            <Edges color="#155a99" />
          </mesh>
          <mesh position={[0, MESA - 0.05, 0]} material={m.azul} castShadow>
            <boxGeometry args={[0.3, 0.18, 0.12]} />
          </mesh>
        </group>
      ))}
      {/* viga de alumínio */}
      <Chapa size={[0.2, 0.2, P + 0.36]} position={[0, MESA + 0.34, 0]} material={m.alu} linha={LINHA} />
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.101, MESA + 0.34, 0]} rotation-y={(sx * Math.PI) / 2}>
          <planeGeometry args={[1.2, 0.11]} />
          <meshStandardMaterial map={faixa} roughness={0.45} />
        </mesh>
      ))}
      {/* esteira porta-cabos em cima da viga, presa atrás e puxada pelo cabeçote */}
      <Esteira
        m={m}
        origem={[0, MESA + 0.46, 0]}
        s={[0, 0, 1]}
        h={[0, 1, 0]}
        w={[1, 0, 0]}
        s0={-P / 2 - 0.1}
        ponta={() => pos.z}
        comprimento={3.4}
        raio={0.12}
        lado={1}
      />

      <group ref={cabeca}>
        {/* carro na frente da viga, cabeçote preto com tampa azul e roda de corte */}
        <Chapa size={[0.06, 0.3, 0.24]} position={[0.13, MESA + 0.34, 0]} material={m.branco} linha={LINHA} />
        <mesh position={[OFF, MESA + 0.15, 0]} material={m.preto} castShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
        </mesh>
        <mesh position={[OFF, MESA + 0.29, 0]} material={m.azul}>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 18]} />
        </mesh>
        <mesh position={[OFF, MESA + 0.03, 0]} material={m.inox}>
          <cylinderGeometry args={[0.012, 0.02, 0.05, 12]} />
        </mesh>
        <mesh ref={faisca} position={[OFF, MESA + 0.016, 0]} visible={false}>
          <sphereGeometry args={[0.012, 10, 8]} />
          <meshBasicMaterial color="#bff0ff" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Mesa({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const pos = useMemo(() => ({ x: -0.6, z: 0.2 }), [])
  const feitos = useMemo(() => CORTES.map(() => 0), [])
  useFrame(({ clock }) => {
    if (animado && rig.current) rig.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.25
  })
  return (
    <group ref={rig}>
      <Base m={m} />
      <Console m={m} />
      <Vidro m={m} feitos={feitos} />
      <Portico m={m} animado={animado} pos={pos} feitos={feitos} />
    </group>
  )
}

const ALVO = new THREE.Vector3(-0.3, 0.75, 0)
const RAIO = 3.0 // do console até o rolo do extremo livre
const DIRECAO = new THREE.Vector3(-3.2, 3.6, 7.5) // de frente pela esquerda, com o console e o pórtico em primeiro plano, como na foto

/** Mesa de corte CNC 4200 × 2800 em 3D: o pórtico risca um plano de corte na chapa de vidro */
export default function MesaCorteCNC({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da mesa de corte CNC 4200 × 2800 mm")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Mesa animado={animado} />}
    </Vitrine>
  )
}
