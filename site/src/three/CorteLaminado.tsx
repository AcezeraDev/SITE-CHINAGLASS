import { useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { faixa, suave, useVidro } from "./Corte"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Linha de corte de vidro laminado, modelada a partir das 6 vistas de referência.
 * 1 unidade = 1 m. Duas bancadas de feltro lado a lado em x, com a ponte de corte entre elas correndo em z; frente em +z.
 * A chapa entra pela bancada da esquerda, para com a linha de corte embaixo da ponte, o cabeçote risca em cima e embaixo,
 * a resistência aquece o filme e a peça cortada segue para a bancada da direita.
 */

const TX = 3.0 // largura de cada bancada (x)
const TZ = 4.0 // profundidade das bancadas (z), ao longo da ponte
const VAO = 0.4 // vão entre as bancadas, onde fica a ponte
const MESA = 0.9
const LINHA = "#3b4048"
const BANCADAS = [-1, 1].map((s) => s * (VAO / 2 + TX / 2))
const PONTE_Y = MESA + 0.46 // centro da viga da ponte
const VIDRO_Z = 3.2
const PARTES = [1.7, 0.9] // largura da chapa antes e depois da linha de corte
const OPACO = 0.32

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      branco: new THREE.MeshStandardMaterial({ color: "#eef1f4", metalness: 0.2, roughness: 0.45 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#5b616b", metalness: 0.35, roughness: 0.5 }),
      escuro: new THREE.MeshStandardMaterial({ color: "#3f444c", metalness: 0.4, roughness: 0.5 }),
      ponte: new THREE.MeshStandardMaterial({ color: "#8a9099", metalness: 0.7, roughness: 0.35 }),
      laranja: new THREE.MeshStandardMaterial({ color: "#d68a3c", roughness: 0.55 }),
      feltro: new THREE.MeshStandardMaterial({ color: "#1c2027", roughness: 0.95 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.45, roughness: 0.35 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0262f", roughness: 0.35 }),
      amarelo: new THREE.MeshStandardMaterial({ color: "#f5c518", roughness: 0.5 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0a2a4a", emissive: "#3a8bff", emissiveIntensity: 0.35, roughness: 0.15 }),
      calor: new THREE.MeshStandardMaterial({ color: "#3a2a22", emissive: "#ff6a1a", emissiveIntensity: 0, roughness: 0.4 }),
    }),
    []
  )
}

/** Furação da chapa da ponte: fileiras de rasgos escuros sobre o cinza */
function useFuros() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 64
    const g = c.getContext("2d")!
    g.fillStyle = "#8a9099"
    g.fillRect(0, 0, 1024, 64)
    g.fillStyle = "#2f333a"
    for (let bloco = 0; bloco < 3; bloco++)
      for (let i = 0; i < 26; i++) for (let j = 0; j < 3; j++) g.fillRect(40 + bloco * 330 + i * 11, 14 + j * 14, 6, 6)
    g.fillStyle = "#e0262f"
    g.fillRect(14, 22, 14, 20)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])
}

/** Bancada: armário cinza com moldura branca, borda laranja e feltro dividido em cinco faixas */
function Bancada({ x, m }: { x: number; m: Mats }) {
  const cantos = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (TX / 2 - 0.04), sz * (TZ / 2 - 0.04)] as const))
  return (
    <group position={[x, 0, 0]}>
      {cantos.map(([cx, cz]) => (
        <group key={`${cx}${cz}`} position={[cx, 0, cz]}>
          <mesh position={[0, 0.48, 0]} material={m.branco} castShadow>
            <boxGeometry args={[0.08, 0.68, 0.08]} />
          </mesh>
          <mesh position={[0, 0.06, 0]} material={m.preto}>
            <cylinderGeometry args={[0.05, 0.06, 0.08, 14]} />
          </mesh>
        </group>
      ))}
      {/* divisão do meio nas laterais longas */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (TX / 2 - 0.04), 0.48, 0]} material={m.branco}>
          <boxGeometry args={[0.06, 0.62, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]} material={m.branco} castShadow>
        <boxGeometry args={[TX, 0.07, TZ]} />
      </mesh>
      <Chapa size={[TX - 0.1, 0.56, TZ - 0.1]} position={[0, 0.48, 0]} material={m.grafite} linha={LINHA} />
      {/* puxadores */}
      {[-1, 1].flatMap((sx) =>
        [-TZ / 4, TZ / 4].map((z) => (
          <mesh key={`${sx}${z}`} position={[sx * (TX / 2 - 0.045), 0.6, z]} rotation-y={(sx * Math.PI) / 2} material={m.escuro}>
            <planeGeometry args={[0.12, 0.03]} />
          </mesh>
        ))
      )}
      {/* tampo: moldura branca, borda laranja e feltro */}
      <mesh position={[0, MESA - 0.1, 0]} material={m.branco} castShadow receiveShadow>
        <boxGeometry args={[TX, 0.12, TZ]} />
      </mesh>
      <mesh position={[0, MESA - 0.024, 0]} material={m.laranja}>
        <boxGeometry args={[TX + 0.01, 0.03, TZ + 0.01]} />
      </mesh>
      <mesh position={[0, MESA - 0.004, 0]} material={m.feltro} receiveShadow>
        <boxGeometry args={[TX - 0.03, 0.01, TZ - 0.03]} />
      </mesh>
      {[1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, MESA + 0.002, -TZ / 2 + (i * TZ) / 5]} material={m.escuro}>
          <boxGeometry args={[TX - 0.03, 0.002, 0.015]} />
        </mesh>
      ))}
    </group>
  )
}

/** Ponte de corte: corpo entre as bancadas, colunas nas pontas, viga furada, resistência e cabeçote que corre em z */
function Ponte({ m, cabeca }: { m: Mats; cabeca: RefObject<THREE.Group | null> }) {
  const furos = useFuros()
  const C = TZ + 0.5
  return (
    <group>
      <Chapa size={[VAO - 0.06, MESA - 0.12, TZ + 0.2]} position={[0, (MESA - 0.12) / 2 + 0.04, 0]} material={m.escuro} linha={LINHA} />
      {/* fenda da roda de baixo */}
      <mesh position={[0, MESA - 0.05, 0]} material={m.preto}>
        <boxGeometry args={[VAO - 0.02, 0.08, TZ]} />
      </mesh>
      {[-1, 1].map((sz) => (
        <Chapa key={sz} size={[0.5, 0.8, 0.24]} position={[0, MESA + 0.24, sz * (C / 2 - 0.12)]} material={m.ponte} linha={LINHA} />
      ))}
      {/* viga com a chapa furada nas duas laterais e em cima */}
      <mesh position={[0, PONTE_Y, 0]} material={m.ponte} castShadow>
        <boxGeometry args={[0.42, 0.32, C]} />
        <Edges color={LINHA} threshold={15} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.211, PONTE_Y, 0]} rotation-y={(sx * Math.PI) / 2}>
          <planeGeometry args={[C - 0.1, 0.26]} />
          <meshStandardMaterial map={furos} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, PONTE_Y + 0.161, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[C - 0.1, 0.36]} />
        <meshStandardMaterial map={furos} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* resistência que aquece o filme ao longo da linha de corte */}
      <mesh position={[0, MESA + 0.06, 0]} material={m.calor}>
        <boxGeometry args={[0.06, 0.03, TZ - 0.1]} />
      </mesh>
      <group ref={cabeca}>
        <mesh position={[0, PONTE_Y - 0.24, 0]} material={m.inox} castShadow>
          <boxGeometry args={[0.24, 0.16, 0.26]} />
        </mesh>
        <mesh position={[0, MESA + 0.06, 0]} rotation-z={Math.PI / 2} material={m.preto}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        </mesh>
        <mesh position={[0, MESA + 0.11, 0]} material={m.inox}>
          <boxGeometry args={[0.03, 0.08, 0.03]} />
        </mesh>
      </group>
    </group>
  )
}

/** Console na frente da ponte: pedestal com ventilação, botoeira com emergência e monitor no braço */
function Console({ m }: { m: Mats }) {
  return (
    <group position={[-0.15, 0, TZ / 2 + 0.55]}>
      <Chapa size={[0.6, 0.9, 0.5]} position={[0, 0.45, 0]} material={m.grafite} linha={LINHA} />
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-0.12 + (i % 2) * 0.24, 0.3 + Math.floor(i / 2) * 0.05, 0.251]} material={m.escuro}>
          <planeGeometry args={[0.14, 0.018]} />
        </mesh>
      ))}
      <Chapa size={[0.56, 0.16, 0.42]} position={[0.02, 0.98, -0.02]} material={m.grafite} linha={LINHA} />
      <mesh position={[0.18, 1.065, 0.06]} material={m.vermelho}>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
      </mesh>
      <mesh position={[0.18, 1.055, 0.06]} material={m.amarelo}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
      </mesh>
      {[-0.15, -0.07, 0.01].map((x) => (
        <mesh key={x} position={[x, 1.065, 0.08]} material={m.escuro}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 10]} />
        </mesh>
      ))}
      {/* braço e monitor virados para quem fica na frente */}
      <mesh position={[-0.2, 1.2, -0.05]} material={m.escuro}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
      </mesh>
      <group position={[-0.25, 1.42, 0.02]} rotation={[-0.2, 0.35, 0]}>
        <Chapa size={[0.5, 0.36, 0.06]} position={[0, 0, 0]} material={m.escuro} linha={LINHA} />
        <mesh position={[0, 0, 0.031]} material={m.tela}>
          <planeGeometry args={[0.42, 0.28]} />
        </mesh>
      </group>
    </group>
  )
}

const CICLO = 10
const RISCO_Z: [number, number] = [-VIDRO_Z / 2 - 0.05, VIDRO_Z / 2 + 0.05]

function Linha({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const cabeca = useRef<THREE.Group>(null)
  const chapa = useRef<THREE.Group>(null)
  const peca = useRef<THREE.Mesh>(null)
  const risco = useRef<THREE.Mesh>(null)
  const v = useVidro(OPACO)

  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    const r = animado ? tempo % CICLO : 4.2
    // a chapa entra até a linha de corte (x = 0) ficar embaixo da ponte
    const g = -1.2 * (1 - suave(faixa(r, 0.6, 2.6)))
    const op = faixa(r, 0, 0.6) * (1 - faixa(r, 8.6, 9.6))
    v.vidro.opacity = OPACO * op
    v.risco.opacity = op
    if (chapa.current) {
      chapa.current.position.x = g
      chapa.current.visible = op > 0.001
    }
    // cabeçote risca de trás para a frente e volta
    const ida = faixa(r, 3.0, 5.0)
    const z = r < 5.0 ? RISCO_Z[0] + (RISCO_Z[1] - RISCO_Z[0]) * ida : RISCO_Z[1] + (RISCO_Z[0] - RISCO_Z[1]) * suave(faixa(r, 5.2, 6.4))
    if (cabeca.current) cabeca.current.position.z = z
    if (risco.current) {
      risco.current.visible = ida > 0
      risco.current.scale.z = Math.max(ida, 0.0001)
      risco.current.position.z = RISCO_Z[0] + ((RISCO_Z[1] - RISCO_Z[0]) * ida) / 2
    }
    // resistência acende e apaga; depois a peça cortada segue para a direita
    m.calor.emissiveIntensity = 2.2 * Math.sin(Math.PI * faixa(r, 5.0, 6.8))
    if (peca.current) peca.current.position.x = PARTES[1] / 2 + 0.02 + 1.4 * suave(faixa(r, 6.8, 8.4))
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.2
  })

  return (
    <group ref={rig}>
      {BANCADAS.map((x) => (
        <Bancada key={x} x={x} m={m} />
      ))}
      <Ponte m={m} cabeca={cabeca} />
      <Console m={m} />
      <group ref={chapa} position={[0, MESA + 0.01, 0]}>
        <mesh position={[-PARTES[0] / 2, 0, 0]} material={v.vidro}>
          <boxGeometry args={[PARTES[0], 0.014, VIDRO_Z]} />
          <Edges color="#7fd6ff" />
        </mesh>
        <mesh ref={peca} position={[PARTES[1] / 2 + 0.02, 0, 0]} material={v.vidro}>
          <boxGeometry args={[PARTES[1], 0.014, VIDRO_Z]} />
          <Edges color="#7fd6ff" />
        </mesh>
        <mesh ref={risco} position={[0.01, 0.0075, RISCO_Z[0]]} material={v.risco} visible={false}>
          <boxGeometry args={[0.008, 0.002, RISCO_Z[1] - RISCO_Z[0]]} />
        </mesh>
      </group>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 0.8, 0.25)
const RAIO = 4.3 // das pontas das bancadas até o console
const DIRECAO = new THREE.Vector3(-2.6, 3.4, 7) // de frente pela esquerda, com o console e a ponte à vista, como na perspectiva

/** Linha de corte de vidro laminado em 3D: risca em cima e embaixo, aquece o filme e separa a peça */
export default function CorteLaminado({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da linha de corte de vidro laminado")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Linha animado={animado} />}
    </Vitrine>
  )
}
