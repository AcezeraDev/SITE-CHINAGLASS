import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, useLogo, Vitrine } from "./Vitrine"

/*
 * Forno de laminação EVA 3 bandejas, modelado a partir das fotos do produto.
 * 1 unidade = 1 m. Frente do forno em z = 0; a bandeja sai para +z, o gabinete de controle fica à direita (+x).
 */

const W = 2.6 // largura do corpo
const H = 2.1 // altura do corpo
const D = 2.0 // profundidade do corpo, pelas vistas lateral e superior (a bandeja longa sai pela frente)
const LINHA = "#3d4f7c" // contorno das chapas

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      azul: new THREE.MeshStandardMaterial({ color: "#8aa2da", metalness: 0.35, roughness: 0.45 }),
      porta: new THREE.MeshStandardMaterial({ color: "#97aee3", metalness: 0.3, roughness: 0.42 }),
      escuro: new THREE.MeshStandardMaterial({ color: "#1b2236", metalness: 0.4, roughness: 0.6 }),
      base: new THREE.MeshStandardMaterial({ color: "#1e2c5c", metalness: 0.5, roughness: 0.45 }),
      inox: new THREE.MeshStandardMaterial({ color: "#d9e1ec", metalness: 0.9, roughness: 0.2 }),
      aluminio: new THREE.MeshStandardMaterial({ color: "#b9c4d4", metalness: 0.85, roughness: 0.3 }),
      bandeja: new THREE.MeshStandardMaterial({ color: "#6f97dc", metalness: 0.2, roughness: 0.38 }),
      preto: new THREE.MeshStandardMaterial({ color: "#0b0d12", metalness: 0.2, roughness: 0.7 }),
      cabo: new THREE.MeshStandardMaterial({ color: "#14161c", metalness: 0.1, roughness: 0.6 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0352b", metalness: 0.2, roughness: 0.4 }),
      laranja: new THREE.MeshStandardMaterial({ color: "#ff7a2f", emissive: "#ff5a1a", emissiveIntensity: 0.4, roughness: 0.4 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0d2a4a", emissive: "#2f7bff", emissiveIntensity: 0.6, roughness: 0.2 }),
    }),
    []
  )
}

/** Ventilador de circulação da faixa superior */
function Ventilador({ x, girando }: { x: number; girando: boolean }) {
  const pas = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (girando && pas.current) pas.current.rotation.z -= dt * 9
  })
  return (
    <group position={[x, 1.76, 0.02]}>
      <mesh>
        <boxGeometry args={[0.44, 0.44, 0.04]} />
        <meshStandardMaterial color="#10131b" roughness={0.7} />
        <Edges color="#5b6f9e" />
      </mesh>
      <mesh position={[0, 0, 0.022]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.19, 0.19, 0.01, 40, 1, true]} />
        <meshStandardMaterial color="#2a3142" side={THREE.DoubleSide} />
      </mesh>
      <group ref={pas} position={[0, 0, 0.03]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} rotation-z={(i / 5) * Math.PI * 2} position={[0, 0, 0]}>
            <boxGeometry args={[0.06, 0.32, 0.008]} />
            <meshStandardMaterial color="#3a4256" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 24]} />
          <meshStandardMaterial color="#596179" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/** Corpo do forno: faixa superior aberta (dutos e ventiladores), duas portas com o logo e as laterais em painéis */
function Corpo({ m, animado }: { m: Mats; animado: boolean }) {
  const logo = useLogo()
  const luz = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (luz.current) luz.current.emissiveIntensity = animado ? 1.2 + Math.sin(clock.elapsedTime * 3) * 0.8 : 1.5
  })

  return (
    <group>
      {/* casco */}
      <mesh position={[0, 0.08 + H / 2, -D / 2]} material={m.azul} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <Edges color={LINHA} threshold={15} />
      </mesh>
      {/* rodapé e pés */}
      <Chapa size={[W + 0.02, 0.08, D + 0.02]} position={[0, 0.04, -D / 2]} material={m.escuro} edges={false} />
      {[-1, 1].flatMap((sx) =>
        [-0.1, -D + 0.1].map((z) => (
          <mesh key={`${sx}${z}`} position={[sx * (W / 2 - 0.08), 0.02, z]} material={m.inox}>
            <cylinderGeometry args={[0.05, 0.06, 0.04, 16]} />
          </mesh>
        ))
      )}

      {/* faixa superior: vão escuro com os dois ventiladores no centro e dutos dos dois lados */}
      <mesh position={[0, 1.76, 0.002]} material={m.escuro}>
        <planeGeometry args={[W - 0.12, 0.52]} />
      </mesh>
      <Chapa size={[W, 0.07, 0.06]} position={[0, 2.05, 0.03]} material={m.azul} />
      <Chapa size={[W, 0.08, 0.06]} position={[0, 1.47, 0.03]} material={m.azul} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Chapa size={[0.07, 0.6, 0.06]} position={[s * 0.56, 1.76, 0.03]} material={m.azul} />
          {[0.75, 1.1].map((x) => (
            <Chapa key={x} size={[0.04, 0.52, 0.05]} position={[s * x, 1.76, 0.03]} material={m.aluminio} edges={false} />
          ))}
          {[1.6, 1.76, 1.92].map((y) => (
            <mesh key={y} position={[s * 0.92, y, 0.07]} rotation-z={Math.PI / 2} material={m.inox}>
              <cylinderGeometry args={[0.018, 0.018, 0.68, 12]} />
            </mesh>
          ))}
          {/* braço da tampa aberta nas pontas */}
          <mesh position={[s * (W / 2 - 0.02), 2.12, -0.12]} rotation-x={0.9} material={m.azul}>
            <boxGeometry args={[0.04, 0.3, 0.04]} />
          </mesh>
        </group>
      ))}
      <Ventilador x={-0.27} girando={animado} />
      <Ventilador x={0.27} girando={animado} />

      {/* portas */}
      <Chapa size={[1.2, 1.24, 0.035]} position={[-0.62, 0.8, 0.018]} material={m.porta} />
      <Chapa size={[1.2, 1.24, 0.035]} position={[0.62, 0.8, 0.018]} material={m.porta} />
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.86, 0.05]} material={m.inox}>
          <boxGeometry args={[0.025, 0.12, 0.03]} />
        </mesh>
      ))}
      <mesh position={[0.64, 0.92, 0.037]}>
        <planeGeometry args={[0.92, 0.65]} />
        <meshStandardMaterial map={logo} transparent roughness={0.6} />
      </mesh>

      {/* laterais: faixa de cima inteira e duas portas embaixo */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (W / 2 + 0.015), 0, 0]}>
          <Chapa size={[0.03, 0.5, D - 0.12]} position={[0, 1.76, -D / 2]} material={m.porta} />
          {[-D * 0.27, -D * 0.73].map((z) => (
            <Chapa key={z} size={[0.03, 1.24, D * 0.44]} position={[0, 0.8, z]} material={m.porta} />
          ))}
        </group>
      ))}

      {/* traseira: três painéis em cima, duas portas grandes e faixas laterais embaixo */}
      {[-0.86, 0, 0.86].map((x) => (
        <Chapa key={x} size={[0.82, 0.5, 0.03]} position={[x, 1.76, -D - 0.015]} material={m.porta} />
      ))}
      {[-0.49, 0.49].map((x) => (
        <Chapa key={x} size={[0.94, 1.24, 0.03]} position={[x, 0.8, -D - 0.015]} material={m.porta} />
      ))}
      {[-1.13, 1.13].map((x) => (
        <Chapa key={x} size={[0.28, 1.24, 0.03]} position={[x, 0.8, -D - 0.015]} material={m.porta} />
      ))}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.86, -D - 0.045]} material={m.inox}>
          <boxGeometry args={[0.025, 0.12, 0.03]} />
        </mesh>
      ))}

      {/* teto em três chapas */}
      {[-0.86, 0, 0.86].map((x) => (
        <Chapa key={x} size={[0.84, 0.03, D - 0.1]} position={[x, H + 0.095, -D / 2]} material={m.porta} />
      ))}

      {/* sinaleiro no canto de cima */}
      <group position={[W / 2 - 0.12, H + 0.11, -0.15]}>
        <mesh position={[0, 0.03, 0]} material={m.inox}>
          <cylinderGeometry args={[0.04, 0.05, 0.06, 16]} />
        </mesh>
        {(
          [
            ["#e0352b", 0.12],
            ["#ffb020", 0.22],
          ] as const
        ).map(([c, y]) => (
          <mesh key={c} position={[0, y, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.09, 16]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} transparent opacity={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.09, 16]} />
          <meshStandardMaterial ref={luz} color="#33d46a" emissive="#33d46a" transparent opacity={0.95} />
        </mesh>
      </group>
    </group>
  )
}

/** Bandeja 2000 × 3000 mm sobre a base elevatória hidráulica, puxada para fora do forno */
function Bandeja({ m, animado }: { m: Mats; animado: boolean }) {
  const plataforma = useRef<THREE.Group>(null)
  // sobe e desce devagar, como o elevador escolhendo uma das 3 bandejas
  useFrame(({ clock }) => {
    if (plataforma.current) plataforma.current.position.y = animado ? 0.05 + (Math.sin(clock.elapsedTime * 0.6) + 1) * 0.06 : 0.05
  })

  return (
    // bandeja longa saindo reto da frente, quase da largura do corpo (vista superior)
    <group position={[0, 0, 1.65]}>
      {/* base elevatória, mais estreita que a bandeja */}
      <Chapa size={[1.9, 0.16, 2.5]} position={[0, 0.1, 0]} material={m.base} edges={false} />
      <Chapa size={[2.1, 0.05, 0.12]} position={[0, 0.03, 1.22]} material={m.base} edges={false} />
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.12, 1.26]} material={m.laranja}>
          <boxGeometry args={[0.16, 0.06, 0.015]} />
        </mesh>
      ))}
      {[-0.7, 0.7].flatMap((x) =>
        [-0.8, 0.8].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.3, z]} material={m.inox}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
          </mesh>
        ))
      )}

      <group ref={plataforma}>
        {/* moldura de alumínio e chapa da bandeja (2,5 × 3 m) */}
        <Chapa size={[2.5, 0.07, 3.0]} position={[0, 0.44, 0]} material={m.aluminio} />
        <mesh position={[0, 0.48, 0]} material={m.bandeja} receiveShadow castShadow>
          <boxGeometry args={[2.42, 0.02, 2.92]} />
        </mesh>
        {/* travessas por baixo */}
        {[-1.2, -0.4, 0.4, 1.2].map((z) => (
          <Chapa key={z} size={[2.42, 0.08, 0.08]} position={[0, 0.37, z]} material={m.base} edges={false} />
        ))}
      </group>
    </group>
  )
}

/** Gabinete de controle independente: tela, botões e duas portas */
function Gabinete({ m }: { m: Mats }) {
  const w = 0.82
  const h = 1.62
  const d = 0.62
  return (
    <group position={[W / 2 + 0.58, 0, 0.12]}>
      {/* traseira: duas grades de ventilação em cima e o ventilador embaixo */}
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, h - 0.2, -d - 0.012]}>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, -i * 0.035, 0]} material={m.escuro}>
              <boxGeometry args={[0.2, 0.014, 0.01]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.32, -d - 0.012]} material={m.preto}>
        <boxGeometry args={[0.26, 0.26, 0.012]} />
        <Edges color="#5b6f9e" />
      </mesh>
      <Chapa size={[w, h, d]} position={[0, 0.06 + h / 2, -d / 2]} material={m.azul} />
      {/* painel de comando */}
      <Chapa size={[w - 0.1, 0.36, 0.02]} position={[0, h - 0.3, 0.01]} material={m.porta} />
      <mesh position={[-0.16, h - 0.28, 0.025]} material={m.tela}>
        <boxGeometry args={[0.24, 0.16, 0.01]} />
      </mesh>
      {(
        [
          [0.06, h - 0.22, "#22c55e"],
          [0.16, h - 0.22, "#22c55e"],
          [0.06, h - 0.36, "#1b2236"],
          [0.16, h - 0.36, "#e0352b"],
        ] as const
      ).map(([x, y, c], i) => (
        <mesh key={i} position={[x, y, 0.03]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.028, 0.028, 0.03, 20]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={c === "#1b2236" ? 0 : 0.35} />
        </mesh>
      ))}
      {/* portas de baixo */}
      <Chapa size={[0.34, 1.05, 0.025]} position={[-0.18, 0.72, 0.012]} material={m.porta} />
      <Chapa size={[0.34, 1.05, 0.025]} position={[0.18, 0.72, 0.012]} material={m.porta} />
      <mesh position={[0.06, 0.78, 0.035]} material={m.inox}>
        <boxGeometry args={[0.02, 0.09, 0.02]} />
      </mesh>
      {/* rodízios */}
      {[-1, 1].flatMap((sx) =>
        [-0.08, -d + 0.08].map((z) => (
          <mesh key={`${sx}${z}`} position={[sx * (w / 2 - 0.07), 0.03, z]} material={m.inox}>
            <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
          </mesh>
        ))
      )}
    </group>
  )
}

/** Cabos no chão ligando gabinete, forno, pedal e base da bandeja */
function Cabos({ m }: { m: Mats }) {
  const tubos = useMemo(() => {
    const curva = (pts: [number, number, number][]) =>
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 48, 0.022, 8, false)
    return [
      // gabinete → lateral do forno
      curva([[1.55, 0.04, -0.2], [1.45, 0.03, -0.05], [1.36, 0.03, -0.25], [1.32, 0.06, -0.45]]),
      // gabinete → pedal (à frente, à direita da bandeja)
      curva([[1.7, 0.04, 0.12], [1.75, 0.03, 0.55], [1.6, 0.03, 0.9], [1.5, 0.05, 1.08]]),
      // pedal → base elevatória
      curva([[1.42, 0.05, 1.2], [1.2, 0.03, 1.35], [1.05, 0.03, 1.15], [0.96, 0.08, 1.0]]),
    ]
  }, [])
  return (
    <group>
      {tubos.map((g, i) => (
        <mesh key={i} geometry={g} material={m.cabo} castShadow />
      ))}
      {/* pedal de comando */}
      <group position={[1.5, 0, 1.18]} rotation-y={-0.4}>
        <mesh position={[0, 0.05, 0]} material={m.vermelho} castShadow>
          <boxGeometry args={[0.2, 0.09, 0.28]} />
        </mesh>
        <mesh position={[0, 0.1, 0.02]} rotation-x={-0.2} material={m.preto}>
          <boxGeometry args={[0.14, 0.02, 0.18]} />
        </mesh>
      </group>
    </group>
  )
}

function Forno({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  // balanço lento de um lado para o outro, com a frente (logo e bandeja) sempre à vista
  useFrame(({ clock }) => {
    if (animado && rig.current) rig.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.45
  })
  return (
    <group ref={rig}>
      {/* centraliza o conjunto (corpo + bandeja + gabinete) no eixo de giro */}
      <group position={[-0.45, 0, -0.55]}>
        <Corpo m={m} animado={animado} />
        <Bandeja m={m} animado={animado} />
        <Gabinete m={m} />
        <Cabos m={m} />
      </group>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 0.95, 0) // centro do conjunto
const RAIO = 3.5 // esfera que envolve corpo, bandeja e gabinete (o canto de cima, atrás, fica a ~3,4 m do centro)
const DIRECAO = new THREE.Vector3(-5.2, 3.4, 7.2).normalize() // vista inicial: diagonal frontal esquerda, como a foto

/** Forno EVA em 3D: balança sozinho; no computador também dá para arrastar e girar */
export default function FornoEVA({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D do forno de laminação EVA 3 bandejas")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Forno animado={animado} />}
    </Vitrine>
  )
}
