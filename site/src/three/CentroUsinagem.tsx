import { useMemo, useRef, type Ref } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, useLogo, Vitrine } from "./Vitrine"

/*
 * Centro de usinagem CNC, modelado a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. A viga anda em z sobre os trilhos laterais (cobertos por sanfonas), o cabeçote anda em x
 * ao longo da viga e o fuso desce em y. Console à esquerda e armário elétrico à direita.
 */

const LINHA = "#9aa3b2"
const BASE_Y = 0.88 // topo da base
const TRILHO_X = 1.65
const COLUNA_Z = 0.42 // quanto o fuso fica à frente do centro da viga
const VIDRO = { x: 1.7, z: 0.95, y: BASE_Y + 0.09 }

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      branco: new THREE.MeshStandardMaterial({ color: "#e8ebef", metalness: 0.2, roughness: 0.45 }),
      cinza: new THREE.MeshStandardMaterial({ color: "#c2c8d0", metalness: 0.55, roughness: 0.4 }),
      alu: new THREE.MeshStandardMaterial({ color: "#d3d9e1", metalness: 0.85, roughness: 0.3 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#33373e", metalness: 0.45, roughness: 0.5 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.4, roughness: 0.4 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#d9283a", roughness: 0.4 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0a2a4a", emissive: "#3a8bff", emissiveIntensity: 0.3, roughness: 0.15 }),
      vidro: new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false }),
    }),
    []
  )
}

/** Sanfona preta: listras claras e escuras alternadas, repetidas ao longo do comprimento */
function useSanfona(repeticoes: number) {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 64
    c.height = 16
    const g = c.getContext("2d")!
    const grad = g.createLinearGradient(0, 0, 64, 0)
    grad.addColorStop(0, "#0d0f13")
    grad.addColorStop(0.5, "#3a3f48")
    grad.addColorStop(1, "#0d0f13")
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 16)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.repeat.set(repeticoes, 1)
    return tex
  }, [repeticoes])
}

/** Elos de esteira porta-cabos ao longo de uma curva fixa, com ponto vermelho em cada elo */
function Corrente({ pontos, m }: { pontos: [number, number, number][]; m: Mats }) {
  const elos = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)))
    const n = Math.round(curva.getLength() / 0.05)
    return Array.from({ length: n }, (_, i) => {
      const u = (i + 0.5) / n
      return {
        p: curva.getPointAt(u),
        q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), curva.getTangentAt(u)),
      }
    })
  }, [pontos])
  return (
    <group>
      {elos.map(({ p, q }, i) => (
        <group key={i} position={p} quaternion={q}>
          <mesh material={m.preto}>
            <boxGeometry args={[0.1, 0.045, 0.07]} />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[0, 0, 0.036]} material={m.vermelho}>
              <boxGeometry args={[0.02, 0.02, 0.004]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/** Base com rodapé escuro, faixa vermelha, mesa de réguas com ventosas e sanfonas dos trilhos */
function Base({ m }: { m: Mats }) {
  const sanfona = useSanfona(28)
  return (
    <group>
      <Chapa size={[3.6, BASE_Y - 0.13, 2.0]} position={[0, 0.13 + (BASE_Y - 0.13) / 2, 0]} material={m.branco} linha={LINHA} />
      <mesh position={[0, 0.07, 0]} material={m.grafite} castShadow>
        <boxGeometry args={[3.5, 0.14, 1.9]} />
      </mesh>
      {[-1.6, -0.55, 0.55, 1.6].flatMap((x) =>
        [-0.85, 0.85].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.015, z]} material={m.grafite}>
            <cylinderGeometry args={[0.08, 0.09, 0.03, 16]} />
          </mesh>
        ))
      )}
      {/* faixa vermelha da frente e painel cinza embaixo dela */}
      <mesh position={[0, BASE_Y - 0.1, 1.003]} material={m.vermelho}>
        <boxGeometry args={[3.2, 0.07, 0.01]} />
      </mesh>
      <mesh position={[0, 0.42, 1.003]} material={m.cinza}>
        <boxGeometry args={[3.3, 0.5, 0.01]} />
      </mesh>
      {/* réguas de alumínio da mesa, com as ventosas que seguram a chapa */}
      {[-0.65, -0.39, -0.13, 0.13, 0.39, 0.65].map((z) => (
        <mesh key={z} position={[0, BASE_Y + 0.015, z]} material={m.alu} receiveShadow>
          <boxGeometry args={[2.9, 0.03, 0.2]} />
        </mesh>
      ))}
      {[-0.6, 0, 0.6].flatMap((x) =>
        [-0.3, 0.3].map((z) => (
          <mesh key={`${x}${z}`} position={[x, BASE_Y + 0.055, z]} material={m.preto}>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 20]} />
          </mesh>
        ))
      )}
      {/* trilhos laterais em z cobertos por sanfonas */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * TRILHO_X, BASE_Y + 0.12, 0]}>
          <mesh material={m.preto}>
            <boxGeometry args={[0.28, 0.24, 1.95]} />
          </mesh>
          <mesh position={[0, 0.121, 0]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2}>
            <planeGeometry args={[1.95, 0.28]} />
            <meshStandardMaterial map={sanfona} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Viga móvel em z: selas brancas sobre os trilhos, sanfona na frente, e o cabeçote que anda em x */
function Viga({ m, refs }: { m: Mats; refs: { viga: Ref<THREE.Group>; cabeca: Ref<THREE.Group>; fuso: Ref<THREE.Group>; ferramenta: Ref<THREE.Mesh> } }) {
  const sanfona = useSanfona(40)
  const logo = useLogo("#1a1d23")
  return (
    <group ref={refs.viga}>
      {[-1, 1].map((sx) => (
        <Chapa key={sx} size={[0.5, 0.55, 0.6]} position={[sx * TRILHO_X, BASE_Y + 0.5, 0]} material={m.branco} linha={LINHA} />
      ))}
      <mesh position={[TRILHO_X, BASE_Y + 0.55, 0.302]}>
        <planeGeometry args={[0.36, 0.25]} />
        <meshStandardMaterial map={logo} transparent roughness={0.4} />
      </mesh>
      <mesh position={[0, BASE_Y + 0.5, 0]} material={m.preto} castShadow>
        <boxGeometry args={[2.85, 0.36, 0.3]} />
      </mesh>
      <mesh position={[0, BASE_Y + 0.5, 0.151]}>
        <planeGeometry args={[2.85, 0.36]} />
        <meshStandardMaterial map={sanfona} roughness={0.7} />
      </mesh>

      <group ref={refs.cabeca}>
        {/* carro e coluna do eixo Z */}
        <Chapa size={[0.5, 0.55, 0.26]} position={[0, BASE_Y + 0.55, 0.26]} material={m.branco} linha={LINHA} />
        <Chapa size={[0.36, 1.05, 0.34]} position={[0, BASE_Y + 1.0, COLUNA_Z]} material={m.branco} linha={LINHA} />
        <Corrente
          m={m}
          pontos={[[0, BASE_Y + 1.53, COLUNA_Z - 0.05], [0, BASE_Y + 1.75, COLUNA_Z - 0.05], [0, BASE_Y + 1.88, COLUNA_Z - 0.2], [0, BASE_Y + 1.75, COLUNA_Z - 0.35], [0, BASE_Y + 1.4, COLUNA_Z - 0.38]]}
        />
        <Corrente
          m={m}
          pontos={[[0.19, BASE_Y + 1.1, 0.3], [0.45, BASE_Y + 1.18, 0.25], [0.62, BASE_Y + 1.02, 0.2], [0.5, BASE_Y + 0.86, 0.17], [0.3, BASE_Y + 0.82, 0.16]]}
        />
        <group ref={refs.fuso}>
          <mesh position={[0, BASE_Y + 0.42, COLUNA_Z]} material={m.cinza} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.32, 20]} />
          </mesh>
          <mesh ref={refs.ferramenta} position={[0, BASE_Y + 0.21, COLUNA_Z]} material={m.inox}>
            <cylinderGeometry args={[0.035, 0.035, 0.1, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** Console branco de rodinhas à esquerda e armário elétrico à direita */
function Armarios({ m }: { m: Mats }) {
  const espiral = useMemo(() => {
    const pts = Array.from({ length: 80 }, (_, i) => new THREE.Vector3(0.05 * Math.cos(i * 0.6), 0.65 - i * 0.006, 0.05 * Math.sin(i * 0.6)))
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.008, 6, false)
  }, [])
  return (
    <group>
      <group position={[-2.5, 0, 0.35]} rotation-y={0.25}>
        <Chapa size={[0.55, 1.35, 0.5]} position={[0, 0.75, 0]} material={m.branco} linha={LINHA} />
        <mesh position={[0, 1.2, 0.252]} material={m.preto}>
          <planeGeometry args={[0.5, 0.42]} />
        </mesh>
        <mesh position={[0, 1.24, 0.254]} material={m.tela}>
          <planeGeometry args={[0.36, 0.25]} />
        </mesh>
        {["#e0352b", "#f5a524", "#22c47a"].map((cor, i) => (
          <mesh key={cor} position={[-0.12 + i * 0.12, 1.05, 0.256]}>
            <circleGeometry args={[0.018, 14]} />
            <meshStandardMaterial color={cor} />
          </mesh>
        ))}
        {/* bandeja do teclado e cabo espiral */}
        <mesh position={[0, 0.92, 0.36]} material={m.inox}>
          <boxGeometry args={[0.5, 0.02, 0.22]} />
        </mesh>
        <mesh geometry={espiral} position={[0.2, 0.25, 0.27]} material={m.preto} />
        {[-0.2, 0.2].flatMap((x) =>
          [-0.18, 0.18].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.04, z]} rotation-z={Math.PI / 2} material={m.preto}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
            </mesh>
          ))
        )}
      </group>
      <group position={[2.45, 0, -0.45]}>
        <Chapa size={[0.5, 1.5, 0.65]} position={[0, 0.8, 0]} material={m.branco} linha={LINHA} />
        {[-0.12, 0.12].map((z) => (
          <mesh key={z} position={[0.252, 0.3, z]} rotation-y={Math.PI / 2} material={m.grafite}>
            <planeGeometry args={[0.18, 0.2]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Percurso de lapidação: o fuso desce num canto, contorna a chapa e sobe */
const DESCE = 0.6
const VOLTA = 6
const SOBE = 0.6
const PAUSA = 1.2
const CICLO = DESCE + VOLTA + SOBE + PAUSA
const MX = VIDRO.x / 2
const MZ = VIDRO.z / 2
const PERIMETRO = 2 * (VIDRO.x + VIDRO.z)

function noContorno(u: number): [number, number] {
  let d = u * PERIMETRO
  if (d < VIDRO.x) return [-MX + d, MZ]
  d -= VIDRO.x
  if (d < VIDRO.z) return [MX, MZ - d]
  d -= VIDRO.z
  if (d < VIDRO.x) return [MX - d, -MZ]
  d -= VIDRO.x
  return [-MX, -MZ + d]
}

function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const viga = useRef<THREE.Group>(null)
  const cabeca = useRef<THREE.Group>(null)
  const fuso = useRef<THREE.Group>(null)
  const ferramenta = useRef<THREE.Mesh>(null)
  useFrame(({ clock }, dt) => {
    const tempo = clock.elapsedTime
    let x = -MX
    let z = MZ
    let baixo = 0
    if (animado) {
      const r = tempo % CICLO
      if (r < DESCE) baixo = r / DESCE
      else if (r < DESCE + VOLTA) {
        baixo = 1
        ;[x, z] = noContorno((r - DESCE) / VOLTA)
      } else if (r < DESCE + VOLTA + SOBE) baixo = 1 - (r - DESCE - VOLTA) / SOBE
    }
    // a ferramenta encosta na borda da chapa: viga em z, cabeçote em x, fuso em y
    if (viga.current) viga.current.position.z = z - COLUNA_Z
    if (cabeca.current) cabeca.current.position.x = x
    if (fuso.current) fuso.current.position.y = -baixo * 0.1
    if (ferramenta.current && animado) ferramenta.current.rotation.y += dt * 30
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.25
  })
  return (
    <group ref={rig}>
      <Base m={m} />
      <Viga m={m} refs={{ viga, cabeca, fuso, ferramenta }} />
      <Armarios m={m} />
      <mesh position={[0, VIDRO.y, 0]} material={m.vidro}>
        <boxGeometry args={[VIDRO.x, 0.01, VIDRO.z]} />
        <Edges color="#7fd6ff" />
      </mesh>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 1.1, 0)
const RAIO = 3.0 // do console até o armário elétrico
const DIRECAO = new THREE.Vector3(2.4, 3.0, 7.5) // de frente, um pouco pela direita e por cima, como na perspectiva da referência

/** Centro de usinagem CNC em 3D: a ferramenta desce e contorna a borda da chapa */
export default function CentroUsinagem({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D do centro de usinagem CNC")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
