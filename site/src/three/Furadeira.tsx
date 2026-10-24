import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Furadeira 4 posições com duplo cabeçote, modelada a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. A chapa corre ao longo de x sobre as mesas de roletes; no meio fica a mesa de inox,
 * com quatro cabeçotes que descem por cima e quatro que sobem por baixo para furar dos dois lados.
 */

const MESA = 0.9 // topo da mesa
const CABECOTES = [-0.75, -0.25, 0.25, 0.75]
const CABECOTE_Z = 0.05
const CURSO = 0.18 // quanto a broca desce até encostar no vidro

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      inox: new THREE.MeshStandardMaterial({ color: "#dfe4ea", metalness: 0.92, roughness: 0.25 }),
      branco: new THREE.MeshStandardMaterial({ color: "#eef1f5", metalness: 0.15, roughness: 0.45 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.4, roughness: 0.4 }),
      azul: new THREE.MeshStandardMaterial({ color: "#1f6fd1", metalness: 0.45, roughness: 0.3 }),
      verde: new THREE.MeshStandardMaterial({ color: "#1e9e4a", roughness: 0.45 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0262f", roughness: 0.4 }),
      latao: new THREE.MeshStandardMaterial({ color: "#c9a24a", metalness: 0.8, roughness: 0.3 }),
      furo: new THREE.MeshBasicMaterial({ color: "#0b1a2a" }),
      vidro: new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false }),
    }),
    []
  )
}

/** Tampo de inox perfurado */
function useFuros() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 512
    c.height = 256
    const g = c.getContext("2d")!
    g.fillStyle = "#cfd6de"
    g.fillRect(0, 0, 512, 256)
    g.fillStyle = "#6b737e"
    for (let x = 12; x < 512; x += 24) for (let y = 12; y < 256; y += 24) {
      g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Frente da caixa de comando: mostrador, botões vermelho e verde */
function useComando() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 200
    const g = c.getContext("2d")!
    g.fillStyle = "#15171c"
    g.fillRect(0, 0, 256, 200)
    g.fillStyle = "#e8ecf2"
    g.fillRect(30, 20, 196, 18)
    g.beginPath(); g.arc(70, 90, 20, 0, Math.PI * 2); g.fill()
    g.fillStyle = "#e0352b"
    g.beginPath(); g.arc(70, 155, 18, 0, Math.PI * 2); g.fill()
    g.fillStyle = "#22c47a"
    for (const [x, y] of [[180, 90], [180, 155]]) {
      g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Mesa de roletes de um lado: quadro de inox com barras em z e roletes verdes de ponta vermelha */
function MesaRoletes({ lado, m }: { lado: 1 | -1; m: Mats }) {
  const xs = Array.from({ length: 6 }, (_, i) => lado * (1.2 + i * 0.27))
  const zs = Array.from({ length: 6 }, (_, i) => -0.5 + i * 0.2)
  return (
    <group>
      {[-0.6, 0.6].map((z) => (
        <mesh key={z} position={[lado * 1.9, MESA - 0.04, z]} material={m.inox} castShadow>
          <boxGeometry args={[1.7, 0.06, 0.05]} />
        </mesh>
      ))}
      {xs.map((x) => (
        <group key={x}>
          <mesh position={[x, MESA - 0.04, 0]} rotation-x={Math.PI / 2} material={m.inox}>
            <cylinderGeometry args={[0.012, 0.012, 1.2, 8]} />
          </mesh>
          {zs.map((z) => (
            <group key={z} position={[x, MESA - 0.02, z]}>
              <mesh material={m.verde}>
                <cylinderGeometry args={[0.018, 0.024, 0.045, 10]} />
              </mesh>
              <mesh position={[0, 0.03, 0]} material={m.vermelho}>
                <sphereGeometry args={[0.017, 10, 8]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* pernas com escora e o cilindro pneumático */}
      {[lado * 2.55].flatMap((x) =>
        [-0.55, 0.55].map((z) => (
          <mesh key={z} position={[x, (MESA - 0.07) / 2, z]} material={m.inox} castShadow>
            <boxGeometry args={[0.06, MESA - 0.07, 0.06]} />
          </mesh>
        ))
      )}
      <mesh position={[lado * 2.0, 0.42, 0.55]} rotation-z={lado * 0.75} material={m.inox}>
        <boxGeometry args={[0.04, 1.05, 0.04]} />
      </mesh>
      <mesh position={[lado * 1.25, 0.65, 0.55]} material={m.preto}>
        <cylinderGeometry args={[0.035, 0.035, 0.25, 14]} />
      </mesh>
    </group>
  )
}

/** Estrutura do meio: pernas, quadro de baixo, mesa perfurada, parede de trás e armários */
function Estrutura({ m }: { m: Mats }) {
  const furos = useFuros()
  return (
    <group>
      {[-1.05, 1.05].flatMap((x) =>
        [-0.55, 0.55].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh position={[0, (MESA - 0.06) / 2, 0]} material={m.inox} castShadow>
              <boxGeometry args={[0.07, MESA - 0.06, 0.07]} />
            </mesh>
            <mesh position={[0, 0.01, 0]} material={m.grafite}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 14]} />
            </mesh>
          </group>
        ))
      )}
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[0, 0.16, z]} material={m.inox}>
          <boxGeometry args={[2.2, 0.06, 0.06]} />
        </mesh>
      ))}
      {/* mesa de inox perfurada */}
      <mesh position={[0, MESA - 0.03, 0]} material={m.inox} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.05, 1.3]} />
      </mesh>
      <mesh position={[0, MESA - 0.004, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.25, 1.25]} />
        <meshStandardMaterial map={furos} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* parede de trás que segura os cabeçotes e armários de inox embaixo */}
      <Chapa size={[2.0, 1.25, 0.06]} position={[0, MESA + 0.62, -0.42]} material={m.inox} linha="#8e97a5" />
      <Chapa size={[1.6, 0.6, 0.45]} position={[0, 0.5, -0.32]} material={m.inox} linha="#8e97a5" />
    </group>
  )
}

/** Um cabeçote de cima (desce) ou de baixo (sobe): motor azul, mandril e broca diamantada */
function Cabecote({ x, cima, m, desce, brocas }: { x: number; cima: boolean; m: Mats; desce: { v: number }; brocas: THREE.Mesh[] }) {
  const carro = useRef<THREE.Group>(null)
  const comando = useComando()
  const sinal = cima ? 1 : -1
  useFrame(() => {
    // o de baixo só sobe até encostar por baixo da chapa
    if (carro.current) carro.current.position.y = -sinal * desce.v * (cima ? CURSO : 0.05)
  })
  // y do eixo do motor: em cima acima da mesa, embaixo abaixo
  const y0 = cima ? MESA + 0.62 : MESA - 0.42
  return (
    <group position={[x, 0, CABECOTE_Z]}>
      {cima && (
        <>
          {/* caixa de comando branca com a frente preta */}
          <Chapa size={[0.3, 0.3, 0.26]} position={[0, MESA + 1.1, -0.18]} material={m.branco} linha="#9aa3b2" />
          <mesh position={[0, MESA + 1.08, -0.048]}>
            <planeGeometry args={[0.24, 0.19]} />
            <meshStandardMaterial map={comando} roughness={0.4} />
          </mesh>
          {/* alavanca com bola vermelha */}
          <mesh position={[0.17, MESA + 0.82, -0.05]} rotation-z={-0.25} material={m.inox}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
          </mesh>
          <mesh position={[0.205, MESA + 0.96, -0.05]} material={m.vermelho}>
            <sphereGeometry args={[0.03, 12, 10]} />
          </mesh>
        </>
      )}
      <group ref={carro}>
        <mesh position={[0, y0, 0]} material={m.azul} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.32, 20]} />
          <Edges color="#134a8f" threshold={30} />
        </mesh>
        <mesh position={[0, y0 + sinal * 0.17, 0]} material={m.preto}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 20]} />
        </mesh>
        <mesh position={[0.1, y0, 0]} material={m.azul}>
          <boxGeometry args={[0.06, 0.12, 0.1]} />
        </mesh>
        {/* mandril de latão e broca de inox */}
        <mesh position={[0, y0 - sinal * 0.22, 0]} material={m.latao}>
          <cylinderGeometry args={[0.035, 0.035, 0.1, 14]} />
        </mesh>
        <mesh
          ref={(el) => void (el && !brocas.includes(el) && brocas.push(el))}
          position={[0, y0 - sinal * 0.33, 0]}
          material={m.inox}
        >
          <cylinderGeometry args={[0.022, 0.022, 0.13, 6]} />
        </mesh>
      </group>
    </group>
  )
}

const CICLO = 7
const suave = (p: number) => p * p * (3 - 2 * p)
const faixa = (r: number, a: number, b: number) => Math.min(Math.max((r - a) / (b - a), 0), 1)

function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const chapa = useRef<THREE.Group>(null)
  const furos = useRef<THREE.Group>(null)
  const desce = useMemo(() => ({ v: 0 }), [])
  const brocas = useMemo<THREE.Mesh[]>(() => [], [])
  useFrame(({ clock }, dt) => {
    const tempo = clock.elapsedTime
    const r = tempo % CICLO
    // chapa entra pela direita, os oito cabeçotes furam juntos, chapa sai pela esquerda
    const x = animado ? 2.6 * (1 - suave(faixa(r, 0, 1.5))) - 2.6 * suave(faixa(r, 3.7, 5.2)) : 0
    desce.v = animado ? suave(faixa(r, 1.5, 2.1)) * (1 - suave(faixa(r, 3.1, 3.7))) : 0
    if (chapa.current) {
      chapa.current.position.x = x
      chapa.current.visible = !animado || r < 5.2
    }
    if (furos.current) furos.current.visible = !animado || r > 2.3
    if (animado) for (const b of brocas) b.rotation.y += dt * 25
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.25
  })
  return (
    <group ref={rig}>
      <Estrutura m={m} />
      <MesaRoletes lado={-1} m={m} />
      <MesaRoletes lado={1} m={m} />
      {CABECOTES.map((x) => (
        <group key={x}>
          <Cabecote x={x} cima m={m} desce={desce} brocas={brocas} />
          <Cabecote x={x} cima={false} m={m} desce={desce} brocas={brocas} />
        </group>
      ))}
      <group ref={chapa} position={[0, MESA + 0.03, 0]}>
        <mesh material={m.vidro}>
          <boxGeometry args={[2.0, 0.008, 0.9]} />
          <Edges color="#7fd6ff" />
        </mesh>
        <group ref={furos}>
          {CABECOTES.map((x) => (
            <mesh key={x} position={[x, 0.005, CABECOTE_Z]} rotation-x={-Math.PI / 2} material={m.furo}>
              <circleGeometry args={[0.024, 16]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 1.05, 0)
const RAIO = 2.9 // de uma mesa de roletes à outra
const DIRECAO = new THREE.Vector3(2.2, 2.6, 7.5) // de frente, um pouco pela direita e por cima, como na perspectiva da referência

/** Furadeira 4 posições em 3D: a chapa entra, os cabeçotes de cima e de baixo furam juntos e ela sai */
export default function Furadeira({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da furadeira 4 posições duplo cabeçote")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
