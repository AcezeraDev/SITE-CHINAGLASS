import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js"
import { t } from "@/i18n"
import { Esteira } from "./Esteira"
import { Chapa, useLogo, Vitrine } from "./Vitrine"

/*
 * Máquina de marcação a laser 140 W, modelada a partir das fotos e das 6 vistas de referência.
 * 1 unidade = 1 m. A mesa corre ao longo de x (ponta preta à esquerda, monitor à direita), frente em +z.
 * O pórtico anda em x sobre a mesa e o cabeçote anda em z ao longo do pórtico.
 */

const L = 3.0 // comprimento da base branca
const P = 1.8 // profundidade da base
const MESA = 0.9 // altura do tampo
const LINHA = "#9aa3b2" // contorno das chapas brancas

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      branco: new THREE.MeshStandardMaterial({ color: "#e4e8ee", metalness: 0.25, roughness: 0.45 }),
      cinza: new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 0.4, roughness: 0.4 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.45, roughness: 0.35 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      azul: new THREE.MeshStandardMaterial({ color: "#2465d8", metalness: 0.35, roughness: 0.35 }),
      amarelo: new THREE.MeshStandardMaterial({ color: "#f5c518", roughness: 0.5 }),
      tela: new THREE.MeshStandardMaterial({ color: "#071426", emissive: "#2f7bff", emissiveIntensity: 0.08, roughness: 0.15 }),
      laranja: new THREE.MeshStandardMaterial({ color: "#ff7a2f", emissive: "#ff5a1a", emissiveIntensity: 0.9, transparent: true, opacity: 0.9 }),
    }),
    []
  )
}

/** Tampo grelhado: placa grafite com sulcos em quadrado e algumas marcas brancas, como na vista superior */
function useGrade() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 576
    const g = c.getContext("2d")!
    g.fillStyle = "#30343b"
    g.fillRect(0, 0, c.width, c.height)
    g.strokeStyle = "#121418"
    g.lineWidth = 5
    const passo = c.width / 26
    for (let x = passo; x < c.width; x += passo) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke()
    }
    for (let y = passo; y < c.height; y += passo) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke()
    }
    g.fillStyle = "#d9dee6"
    for (const [fx, fy] of [[0.08, 0.15], [0.08, 0.85], [0.45, 0.15], [0.45, 0.85], [0.92, 0.15], [0.92, 0.85]]) {
      g.fillRect(fx * c.width - 6, fy * c.height - 2, 12, 4)
      g.fillRect(fx * c.width - 2, fy * c.height - 6, 4, 12)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])
}

/** Faixa preta inclinada com CHINA GLASS em branco, da frente da base */
function useFaixa() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 160
    const g = c.getContext("2d")!
    g.fillStyle = "#1a1c21"
    g.beginPath()
    g.moveTo(0, 0); g.lineTo(880, 0); g.lineTo(1024, 160); g.lineTo(0, 160)
    g.closePath(); g.fill()
    g.fillStyle = "#f2f4f7"
    g.font = "700 96px 'Archivo', 'Arial', sans-serif"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText("CHINA GLASS", 470, 86)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])
}

/** Base branca, ponta preta chanfrada, tampo grelhado com trilhos e detalhes da frente e da traseira */
function Base({ m }: { m: Mats }) {
  const grade = useGrade()
  const faixa = useFaixa()
  // ponta preta: larga em cima e afunilando para baixo nos três lados (vistas frontal e lateral esquerda)
  const ponta = useMemo(() => {
    const x0 = -L / 2
    const pts = [
      [x0, MESA, -P / 2], [x0, MESA, P / 2], [x0 - 0.48, MESA, -P / 2 - 0.02], [x0 - 0.48, MESA, P / 2 + 0.02],
      [x0 - 0.48, 0.62, -P / 2 - 0.02], [x0 - 0.48, 0.62, P / 2 + 0.02],
      [x0, 0.2, -P / 2 + 0.3], [x0, 0.2, P / 2 - 0.3], [x0 - 0.1, 0.2, -P / 2 + 0.3], [x0 - 0.1, 0.2, P / 2 - 0.3],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z))
    return new ConvexGeometry(pts)
  }, [])

  return (
    <group>
      {/* caixa branca */}
      <Chapa size={[L, MESA - 0.12, P]} position={[0, 0.12 + (MESA - 0.12) / 2 - 0.02, 0]} material={m.branco} linha={LINHA} />
      {/* cantoneiras escuras nas pontas */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (L / 2 - 0.03), MESA / 2, sz * (P / 2 + 0.002)]} material={m.grafite}>
            <boxGeometry args={[0.07, MESA - 0.1, 0.012]} />
          </mesh>
        ))
      )}
      {/* painéis da traseira */}
      {[-0.95, 0, 0.95].map((x) => (
        <Chapa key={x} size={[0.9, 0.56, 0.01]} position={[x, 0.5, -P / 2 - 0.006]} material={m.branco} linha={LINHA} />
      ))}
      {/* grades de ventilação: três atrás perto da ponta preta, uma atrás e uma na frente perto do monitor */}
      {[
        [-1.1, -1], [-0.85, -1], [-0.6, -1], [1.2, -1], [1.25, 1],
      ].map(([x, sz], i) => (
        <group key={i} position={[x, 0.48, sz * (P / 2 + 0.012)]}>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} position={[0, -k * 0.03 + 0.075, 0]} material={m.grafite}>
              <boxGeometry args={[0.2, 0.012, 0.01]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* faixa CHINA GLASS na frente */}
      <mesh position={[-0.25, 0.39, P / 2 + 0.006]}>
        <planeGeometry args={[1.25, 0.18]} />
        <meshStandardMaterial map={faixa} transparent roughness={0.5} />
      </mesh>
      {/* pés niveladores */}
      {[-1.35, 0, 1.35].flatMap((x) =>
        [-1, 1].map((sz) => (
          <group key={`${x}${sz}`} position={[x, 0, sz * (P / 2 - 0.12)]}>
            <mesh position={[0, 0.06, 0]} material={m.inox}>
              <cylinderGeometry args={[0.018, 0.018, 0.12, 10]} />
            </mesh>
            <mesh position={[0, 0.012, 0]} material={m.grafite}>
              <cylinderGeometry args={[0.07, 0.08, 0.024, 20]} />
            </mesh>
          </group>
        ))
      )}

      {/* ponta preta */}
      <mesh geometry={ponta} material={m.preto} castShadow receiveShadow>
        <Edges color="#3a3f48" threshold={20} />
      </mesh>

      {/* tampo grelhado */}
      <mesh position={[0, MESA + 0.02, 0]} material={m.grafite} castShadow receiveShadow>
        <boxGeometry args={[L - 0.08, 0.04, P - 0.16]} />
      </mesh>
      <mesh position={[0, MESA + 0.041, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[L - 0.12, P - 0.2]} />
        <meshStandardMaterial map={grade} metalness={0.35} roughness={0.55} />
      </mesh>
      {/* trilhos lineares com cremalheira, na frente e atrás */}
      {[-1, 1].map((sz) => (
        <group key={sz} position={[0, MESA + 0.03, sz * (P / 2 - 0.04)]}>
          <mesh material={m.inox}>
            <boxGeometry args={[L - 0.1, 0.035, 0.04]} />
          </mesh>
          <mesh position={[0, -0.03, sz * 0.03]} material={m.grafite}>
            <boxGeometry args={[L - 0.1, 0.025, 0.015]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Mangueira corrugada, tubo de ar e cabos coloridos no chão da frente */
function Tubos({ m }: { m: Mats }) {
  const g = useMemo(() => {
    const tubo = (pts: [number, number, number][], r: number) =>
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 64, r, 10, false)
    return {
      mangueira: tubo([[0.45, 0.3, P / 2 + 0.03], [0.6, 0.12, P / 2 + 0.12], [0.85, 0.1, P / 2 + 0.12], [1.0, 0.27, P / 2 + 0.06]], 0.035),
      vermelho: tubo([[-0.7, 0.12, P / 2], [-0.6, 0.02, P / 2 + 0.3], [-0.2, 0.02, P / 2 + 0.25], [-0.1, 0.12, P / 2]], 0.01),
      azul: tubo([[-0.68, 0.12, P / 2], [-0.55, 0.02, P / 2 + 0.36], [-0.15, 0.02, P / 2 + 0.3], [-0.05, 0.12, P / 2]], 0.01),
    }
  }, [])
  return (
    <group>
      <mesh geometry={g.mangueira} material={m.preto} castShadow />
      <mesh geometry={g.vermelho}>
        <meshStandardMaterial color="#e0352b" roughness={0.5} />
      </mesh>
      <mesh geometry={g.azul}>
        <meshStandardMaterial color="#2f7bff" roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Monitor no braço tubular, com teclado e PC, na ponta direita (o operador fica de frente para a ponta) */
function Posto({ m }: { m: Mats }) {
  const tubo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          [[1.0, 0.27, P / 2 + 0.06], [1.6, 0.27, P / 2 + 0.06], [1.86, 0.28, P / 2 - 0.05], [1.88, 0.3, 0.3], [1.9, 0.4, 0.15]].map((p) => new THREE.Vector3(...p))
        ),
        64,
        0.03,
        12,
        false
      ),
    []
  )
  return (
    <group>
      <mesh geometry={tubo} material={m.inox} castShadow />
      {/* coluna */}
      <mesh position={[1.9, 0.78, 0.15]} material={m.inox} castShadow>
        <boxGeometry args={[0.08, 0.8, 0.08]} />
      </mesh>
      {/* PC preso na coluna */}
      <Chapa size={[0.2, 0.42, 0.34]} position={[1.74, 0.8, 0.15]} material={m.branco} linha={LINHA} />
      <mesh position={[1.635, 0.8, 0.15]} material={m.preto}>
        <boxGeometry args={[0.01, 0.38, 0.3]} />
      </mesh>
      {/* bandeja do teclado */}
      <mesh position={[2.04, 1.15, 0.15]} material={m.grafite} castShadow>
        <boxGeometry args={[0.3, 0.02, 0.5]} />
      </mesh>
      <mesh position={[2.06, 1.17, 0.15]} rotation-z={-0.08} material={m.preto}>
        <boxGeometry args={[0.16, 0.02, 0.44]} />
      </mesh>
      {/* braço e monitor virado para +x */}
      <mesh position={[1.9, 1.3, 0.15]} rotation-z={0.5} material={m.grafite}>
        <boxGeometry args={[0.05, 0.36, 0.05]} />
      </mesh>
      <group position={[1.98, 1.5, 0.15]} rotation-z={0.35}>
        <mesh material={m.preto} castShadow>
          <boxGeometry args={[0.04, 0.34, 0.54]} />
        </mesh>
        <mesh position={[0.021, 0, 0]} rotation-y={Math.PI / 2} material={m.tela}>
          <planeGeometry args={[0.5, 0.3]} />
        </mesh>
      </group>
    </group>
  )
}

/** Pórtico que anda em x, com o cabeçote que anda em z: coluna do trilho vertical, caixa azul e lente */
function Portico({ m, animado, pos }: { m: Mats; animado: boolean; pos: { x: number; z: number } }) {
  const portico = useRef<THREE.Group>(null)
  const cabeca = useRef<THREE.Group>(null)
  const ponto = useRef<THREE.Mesh>(null)
  const sinal = useRef<THREE.MeshStandardMaterial>(null)
  const logo = useLogo("#0e1a33")
  const logoTras = useLogo("#2a2e35")

  // cabos coloridos em laço do lado esquerdo da caixa azul
  const lacos = useMemo(
    () =>
      ["#e0352b", "#2f7bff", "#f5c518"].map((cor, i) => ({
        cor,
        g: new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(
            [[-0.42, 1.62, 0.12 - i * 0.05], [-0.56 - i * 0.03, 1.55, 0.1 - i * 0.05], [-0.58 - i * 0.03, 1.35, 0.06 - i * 0.05], [-0.42, 1.3, 0.04 - i * 0.05]].map(
              (p) => new THREE.Vector3(...p)
            )
          ),
          32,
          0.009,
          8,
          false
        ),
      })),
    []
  )

  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    // percurso de gravação: o pórtico vai e volta na mesa, o cabeçote varre o pórtico
    pos.x = animado ? 0.25 + Math.sin(tempo * 0.32) * 0.6 : 0.25
    pos.z = animado ? Math.sin(tempo * 0.9) * 0.35 : 0.05
    if (portico.current) portico.current.position.x = pos.x
    if (cabeca.current) cabeca.current.position.z = pos.z
    if (ponto.current) ponto.current.visible = animado && Math.sin(tempo * 7) > -0.6
    if (sinal.current) sinal.current.emissiveIntensity = animado ? 0.6 + Math.sin(tempo * 3) * 0.4 : 0.8
  })

  return (
    <group ref={portico}>
      {/* pernas: a da frente desce pela face da base, onde a esteira se prende */}
      <Chapa size={[0.42, 0.85, 0.2]} position={[0, 0.93, P / 2 + 0.11]} material={m.branco} linha={LINHA} />
      <Chapa size={[0.3, 0.45, 0.16]} position={[0, 1.12, -P / 2 - 0.08]} material={m.branco} linha={LINHA} />
      {/* viga de alumínio */}
      <Chapa size={[0.2, 0.16, P + 0.3]} position={[0, 1.27, 0]} material={m.cinza} linha={LINHA} />
      {/* esteira em cima da viga (anda junto com o pórtico): presa atrás, dobra para a frente e volta até o cabeçote */}
      <Esteira
        m={m}
        origem={[0, 1.37, 0]}
        s={[0, 0, 1]}
        h={[0, 1, 0]}
        w={[1, 0, 0]}
        s0={-0.85}
        ponta={() => pos.z}
        comprimento={1.95}
        raio={0.06}
        lado={1}
      />

      <group ref={cabeca}>
        {/* carro e coluna do trilho vertical */}
        <Chapa size={[0.06, 0.3, 0.3]} position={[-0.13, 1.27, 0]} material={m.cinza} linha={LINHA} />
        <Chapa size={[0.14, 1.0, 0.16]} position={[-0.22, 1.45, -0.02]} material={m.branco} linha={LINHA} />
        <mesh position={[-0.22, 1.98, -0.02]} material={m.grafite}>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
        </mesh>
        <mesh position={[-0.22, 2.04, -0.02]}>
          <cylinderGeometry args={[0.03, 0.03, 0.07, 16]} />
          <meshStandardMaterial ref={sinal} color="#ff8a3d" emissive="#ff6a1a" transparent opacity={0.9} />
        </mesh>
        {/* caixa azul da fonte laser, com logo na frente e plaqueta branca atrás */}
        <mesh position={[-0.36, 1.5, 0.08]} material={m.azul} castShadow>
          <boxGeometry args={[0.42, 0.44, 0.24]} />
          <Edges color="#173f8a" />
        </mesh>
        <mesh position={[-0.33, 1.52, 0.201]}>
          <planeGeometry args={[0.24, 0.17]} />
          <meshStandardMaterial map={logo} transparent roughness={0.4} />
        </mesh>
        {[1.62, 1.55, 1.47].map((y) => (
          <mesh key={y} position={[-0.52, y, 0.201]} material={m.amarelo}>
            <planeGeometry args={[0.05, 0.05]} />
          </mesh>
        ))}
        <mesh position={[-0.22, 1.62, -0.105]}>
          <planeGeometry args={[0.13, 0.1]} />
          <meshStandardMaterial map={logoTras} transparent />
        </mesh>
        {lacos.map(({ cor, g }) => (
          <mesh key={cor} geometry={g}>
            <meshStandardMaterial color={cor} roughness={0.45} />
          </mesh>
        ))}
        {/* galvo, lente 3D e bico */}
        <mesh position={[-0.33, 1.2, 0.08]} material={m.grafite}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
        </mesh>
        <mesh position={[-0.33, 1.06, 0.08]} material={m.preto}>
          <cylinderGeometry args={[0.04, 0.03, 0.14, 20]} />
        </mesh>
        <mesh position={[-0.25, 1.1, 0.14]} rotation-z={0.3}>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
          <meshStandardMaterial color="#2f7bff" />
        </mesh>
        {/* ponto do laser na peça */}
        <mesh ref={ponto} position={[-0.33, MESA + 0.045, 0.08]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#ff4a2a" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Laser({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  // posição atual do pórtico (x) e do cabeçote (z), lida pelas esteiras
  const pos = useMemo(() => ({ x: 0.25, z: 0.05 }), [])
  useFrame(({ clock }) => {
    if (animado && rig.current) rig.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.3
  })
  return (
    <group ref={rig}>
      <Base m={m} />
      <Tubos m={m} />
      <Posto m={m} />
      <Portico m={m} animado={animado} pos={pos} />
      {/* esteira da frente: presa perto da faixa, dobra à esquerda e sobe até a perna do pórtico */}
      <Esteira
        m={m}
        origem={[0, 0.27, P / 2 + 0.04]}
        s={[1, 0, 0]}
        h={[0, 1, 0]}
        w={[0, 0, 1]}
        s0={0.35}
        ponta={() => pos.x - 0.2}
        comprimento={2.95}
        raio={0.12}
        lado={-1}
      />
    </group>
  )
}

const ALVO = new THREE.Vector3(0.1, 0.85, 0)
const RAIO = 2.5 // da ponta preta até o teclado do posto
const DIRECAO = new THREE.Vector3(-2.6, 3.0, 7.5) // de frente, um pouco pela esquerda, como a perspectiva da referência

/** Marcação a laser 140 W em 3D: o pórtico e o cabeçote fazem um percurso de gravação */
export default function LaserCNC({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da máquina de marcação a laser 140 W")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Laser animado={animado} />}
    </Vitrine>
  )
}
