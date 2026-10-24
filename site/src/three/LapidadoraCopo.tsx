import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Lapidadora copo 10 rebolos em inox, modelada a partir das 6 vistas de referência e da foto.
 * 1 unidade = 1 m. A chapa anda em pé ao longo de x sobre a esteira de taliscas, encostada no cavalete
 * inclinado para trás (-z); o corpo de inox com o painel de comando fica no meio da linha.
 */

const LINHA = "#9aa3b2"
const ESTEIRA_Y = 0.83 // topo das taliscas
const ESTEIRA_Z = 0.42
const INCLINA = 0.31 // inclinação do cavalete e da chapa para trás (rad)
const POSTES = [-2.9, -1.25, 1.25, 2.9]

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      inox: new THREE.MeshStandardMaterial({ color: "#dfe4ea", metalness: 0.9, roughness: 0.28 }),
      cinza: new THREE.MeshStandardMaterial({ color: "#a9b0b9", metalness: 0.5, roughness: 0.45 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.4, roughness: 0.4 }),
      azul: new THREE.MeshStandardMaterial({ color: "#2d5fb0", metalness: 0.5, roughness: 0.35 }),
      madeira: new THREE.MeshStandardMaterial({ color: "#d9b48a", roughness: 0.7 }),
      janela: new THREE.MeshStandardMaterial({ color: "#9fb4c8", metalness: 0.3, roughness: 0.1, transparent: true, opacity: 0.45 }),
      vidro: new THREE.MeshStandardMaterial({ color: "#bfe6f5", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }),
    }),
    []
  )
}

/** Painel preto de comando: logo, amperímetros, teclas verdes, botão de emergência e tela */
function usePainel() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 300
    const g = c.getContext("2d")!
    g.fillStyle = "#15171c"
    g.fillRect(0, 0, 1024, 300)
    // diamante
    g.strokeStyle = "#e8ecf2"
    g.lineWidth = 4
    g.save()
    g.translate(60, 60)
    g.scale(2, 2)
    for (const d of ["M4 18 16 4h32l12 14L32 52z", "M4 18h56", "M22 18l10 34 10-34"]) g.stroke(new Path2D(d))
    g.restore()
    g.fillStyle = "#e8ecf2"
    g.font = "600 30px 'Archivo', Arial, sans-serif"
    g.textAlign = "center"
    g.fillText("CHINA GLASS", 125, 210)
    // amperímetros
    for (let i = 0; i < 7; i++) {
      g.fillStyle = "#e8ecf2"
      g.fillRect(270 + i * 72, 40, 52, 52)
      g.fillStyle = "#2f7bff"
      g.fillRect(278 + i * 72, 72, 36, 6)
    }
    // teclas verdes e vermelhas
    for (let i = 0; i < 7; i++) {
      g.fillStyle = "#22c47a"
      g.beginPath(); g.arc(296 + i * 72, 160, 16, 0, Math.PI * 2); g.fill()
      g.fillStyle = "#e0352b"
      g.beginPath(); g.arc(296 + i * 72, 230, 12, 0, Math.PI * 2); g.fill()
    }
    // tela
    g.fillStyle = "#cfd6df"
    g.fillRect(800, 30, 190, 150)
    g.fillStyle = "#0e3a66"
    g.fillRect(810, 40, 170, 130)
    g.fillStyle = "#22c47a"
    for (let i = 0; i < 6; i++) g.fillRect(825 + i * 26, 150 - i * 14, 16, 14 + i * 14)
    g.fillStyle = "#c81e1e"
    g.beginPath(); g.arc(895, 245, 30, 0, Math.PI * 2); g.fill()
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])
}

/** Chapa de inox perfurada da frente */
function useFuros() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 512
    c.height = 128
    const g = c.getContext("2d")!
    g.fillStyle = "#d9dee5"
    g.fillRect(0, 0, 512, 128)
    g.fillStyle = "#5a616b"
    for (let x = 8; x < 512; x += 14) for (let y = 8; y < 128; y += 14) {
      g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** z de um ponto do cavalete na altura y (o cavalete deita para trás) */
const zCavalete = (y: number) => ESTEIRA_Z - 0.06 - (y - ESTEIRA_Y) * Math.tan(INCLINA)

/** Corpo de inox: caixa perfurada, janela dos rebolos, manípulos azuis, painel de comando e motor */
function Corpo({ m }: { m: Mats }) {
  const painel = usePainel()
  const furos = useFuros()
  return (
    <group>
      <Chapa size={[1.9, 0.92, 0.7]} position={[0, 0.6, -0.15]} material={m.inox} linha={LINHA} />
      <mesh position={[0, 0.92, 0.201]}>
        <planeGeometry args={[1.86, 0.26]} />
        <meshStandardMaterial map={furos} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* janela dos rebolos com manípulos azuis embaixo */}
      <mesh position={[0.25, 0.6, 0.23]} material={m.janela}>
        <boxGeometry args={[0.95, 0.26, 0.06]} />
        <Edges color="#6b7480" />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.12 + i * 0.15, 0.4, 0.22]} rotation-x={Math.PI / 2} material={m.azul}>
          <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
        </mesh>
      ))}
      {/* caixa da bomba à esquerda da janela */}
      <Chapa size={[0.28, 0.24, 0.1]} position={[-0.55, 0.62, 0.24]} material={m.inox} linha={LINHA} />
      {/* motor azul do lado esquerdo */}
      <mesh position={[-1.02, 0.45, 0.1]} rotation-z={Math.PI / 2} material={m.azul} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.22, 20]} />
      </mesh>
      {/* capota de trás */}
      <Chapa size={[1.55, 0.2, 0.42]} position={[0, 1.15, -0.3]} material={m.inox} linha={LINHA} />
      {/* painel de comando, levemente inclinado */}
      <group position={[0, 1.3, 0.0]} rotation-x={-0.12}>
        <mesh material={m.preto} castShadow>
          <boxGeometry args={[1.3, 0.38, 0.12]} />
        </mesh>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[1.26, 0.36]} />
          <meshStandardMaterial map={painel} roughness={0.4} emissive="#ffffff" emissiveMap={painel} emissiveIntensity={0.08} />
        </mesh>
      </group>
      {/* pés */}
      {[-0.8, 0.8].flatMap((x) =>
        [-0.42, 0.12].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.07, z]} material={m.cinza}>
            <boxGeometry args={[0.1, 0.14, 0.1]} />
          </mesh>
        ))
      )}
    </group>
  )
}

/** Cavaletes inclinados com as três réguas de apoio, e as pernas da esteira */
function Cavalete({ m }: { m: Mats }) {
  const alturas = [1.15, 1.6, 2.05]
  const topo = 2.15
  const comprimentoPoste = (topo - ESTEIRA_Y) / Math.cos(INCLINA)
  return (
    <group>
      {POSTES.map((x) => (
        <group key={x}>
          {/* poste inclinado */}
          <mesh
            position={[x, (ESTEIRA_Y + topo) / 2, (zCavalete(ESTEIRA_Y) + zCavalete(topo)) / 2 - 0.03]}
            rotation-x={-INCLINA}
            material={m.cinza}
            castShadow
          >
            <boxGeometry args={[0.07, comprimentoPoste, 0.07]} />
          </mesh>
          {/* perna da frente sob a esteira e escora de trás até o chão, formando o A */}
          {Math.abs(x) > 2 && (
            <>
              <mesh position={[x, ESTEIRA_Y / 2 - 0.05, ESTEIRA_Z]} material={m.cinza} castShadow>
                <boxGeometry args={[0.08, ESTEIRA_Y - 0.1, 0.08]} />
              </mesh>
              <mesh position={[x, 0.7, -0.15]} rotation-x={0.42} material={m.cinza} castShadow>
                <boxGeometry args={[0.07, 1.55, 0.07]} />
              </mesh>
              <mesh position={[x, 0.02, 0.05]} material={m.grafite}>
                <boxGeometry args={[0.2, 0.04, 1.0]} />
              </mesh>
            </>
          )}
        </group>
      ))}
      {alturas.map((y) => (
        <mesh key={y} position={[0, y, zCavalete(y) - 0.07]} material={m.cinza} castShadow>
          <boxGeometry args={[6.2, 0.05, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

/** Esteira de taliscas de madeira, correndo de +x para -x */
function Esteira({ m, animado }: { m: Mats; animado: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const passo = 0.09
  const comp = 6.4
  const n = Math.floor(comp / passo)
  const mat = useMemo(() => new THREE.Matrix4(), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const desl = animado ? (clock.elapsedTime * 0.5) % passo : 0
    for (let i = 0; i < n; i++) {
      mat.makeTranslation(comp / 2 - i * passo - desl, ESTEIRA_Y - 0.015, ESTEIRA_Z)
      ref.current.setMatrixAt(i, mat)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <mesh position={[0, ESTEIRA_Y - 0.08, ESTEIRA_Z]} material={m.inox} castShadow>
        <boxGeometry args={[comp + 0.1, 0.1, 0.2]} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} material={m.madeira} frustumCulled={false}>
        <boxGeometry args={[0.06, 0.03, 0.16]} />
      </instancedMesh>
    </group>
  )
}

const CICLO = 10

function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const vidro = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    if (vidro.current) vidro.current.position.x = animado ? 3.4 - ((tempo % CICLO) / CICLO) * 6.8 : 1.6
    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.25
  })
  return (
    <group ref={rig}>
      <Corpo m={m} />
      <Cavalete m={m} />
      <Esteira m={m} animado={animado} />
      {/* chapa em pé, encostada no cavalete */}
      <group ref={vidro} position={[1.6, ESTEIRA_Y, ESTEIRA_Z - 0.02]} rotation-x={-INCLINA}>
        <mesh position={[0, 0.38, 0]} material={m.vidro}>
          <boxGeometry args={[1.2, 0.76, 0.008]} />
          <Edges color="#7fd6ff" />
        </mesh>
      </group>
    </group>
  )
}

const ALVO = new THREE.Vector3(0, 1.05, 0)
const RAIO = 3.3 // de uma ponta da esteira à outra
const DIRECAO = new THREE.Vector3(3.2, 2.2, 7.0) // de frente, um pouco pela direita e por cima, como na perspectiva da referência

/** Lapidadora copo 10 rebolos em 3D: a chapa passa em pé pela esteira, encostada no cavalete */
export default function LapidadoraCopo({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da lapidadora copo 10 rebolos em inox")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
