import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { ContactShadows, Edges, Environment, Lightformer, OrbitControls } from "@react-three/drei"
import { Minus, Plus } from "lucide-react"
import * as THREE from "three"
import { t } from "@/i18n"
import { prefersReducedMotion } from "@/lib/motion"
import { useCanvasNaTela } from "@/lib/webgl"
import { Carregando3D } from "@/components/Carregando3D"
import { Entrada, Pronto, useRevelar } from "./Revelar"

/*
 * Palco comum dos modelos 3D de máquinas: luzes, sombra no chão, câmera enquadrada e arrasto para girar.
 * 1 unidade = 1 m. Cada modelo diz o centro, o raio que o envolve e de onde a câmera começa.
 */

/**
 * Zoom do modelo, definido por quem mostra a vitrine: "botoes" põe + e − no cartão (a roda do mouse continua rolando a página);
 * "total" é a tela cheia, com roda do mouse, pinça, arrasto com o botão direito e também no toque.
 */
export const ZoomVitrine = createContext<false | "botoes" | "total">(false)

type Controles = {
  target: THREE.Vector3
  update: () => void
  minDistance: number
  maxDistance: number
}
type Limites = { min: number; max: number }

/** Chapa com contorno desenhado, para portas e painéis aparecerem como na máquina real */
export function Chapa({
  size,
  position,
  material,
  edges = true,
  linha = "#3d4f7c",
}: {
  size: [number, number, number]
  position: [number, number, number]
  material: THREE.Material
  edges?: boolean
  linha?: string
}) {
  return (
    <mesh position={position} material={material} castShadow receiveShadow>
      <boxGeometry args={size} />
      {edges && <Edges color={linha} threshold={15} />}
    </mesh>
  )
}

const DIAMANTE = ["M4 18 16 4h32l12 14L32 52z", "M4 18h56", "M16 4l6 14 10-14 10 14 6-14", "M22 18l10 34 10-34"]

/** Diamante + CHINA GLASS desenhados num canvas, para aplicar como adesivo */
export function useLogo(cor = "#11141c") {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 512
    c.height = 360
    const g = c.getContext("2d")!
    g.strokeStyle = cor
    g.fillStyle = cor
    g.lineJoin = "round"
    g.lineCap = "round"
    g.save()
    g.translate(256 - 32 * 3.4, 18)
    g.scale(3.4, 3.4)
    g.lineWidth = 2.2
    for (const d of DIAMANTE) g.stroke(new Path2D(d))
    g.restore()
    g.font = "600 64px 'Clash Display', 'Arial Narrow', sans-serif"
    g.textAlign = "center"
    g.fillText("CHINA GLASS", 256, 320)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [cor])
}

/** Põe a câmera na distância em que a esfera do modelo cabe no cartão: não corta girando para nenhum lado */
function Enquadrar({ alvo, raio, direcao, limites }: { alvo: THREE.Vector3; raio: number; direcao: THREE.Vector3; limites: Limites }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const controls = useThree((s) => s.controls) as unknown as Controles | null
  useEffect(() => {
    const vf = THREE.MathUtils.degToRad(camera.fov)
    const hf = 2 * Math.atan(Math.tan(vf / 2) * (size.width / size.height))
    const d = raio / Math.sin(Math.min(vf, hf) / 2)
    camera.position.copy(alvo).addScaledVector(direcao.clone().normalize(), d)
    camera.lookAt(alvo)
    // dá para chegar bem perto dos detalhes e afastar um pouco além do enquadramento inicial
    limites.min = d * 0.25
    limites.max = d * 1.4
    if (controls) {
      controls.target.copy(alvo)
      controls.minDistance = limites.min
      controls.maxDistance = limites.max
      controls.update()
    }
  }, [camera, size, controls, alvo, raio, direcao, limites])
  return null
}

/** Liga os botões + e − à câmera: aproxima ou afasta do ponto para onde ela olha, dentro dos limites */
function Aproximar({ acao, alvo, limites }: { acao: RefObject<(f: number) => void>; alvo: THREE.Vector3; limites: Limites }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as Controles | null
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    acao.current = (f) => {
      const centro = controls?.target ?? alvo
      const v = camera.position.clone().sub(centro)
      const d = THREE.MathUtils.clamp(v.length() * f, limites.min, limites.max)
      camera.position.copy(centro).addScaledVector(v.normalize(), d)
      camera.lookAt(centro)
      controls?.update()
      invalidate()
    }
  }, [acao, camera, controls, alvo, limites, invalidate])
  return null
}

/** Canvas do modelo: só existe perto da tela (ver useCanvasNaTela); no celular não tem arrasto (a página rola por cima) */
export function Vitrine({
  label,
  alvo,
  raio,
  direcao,
  className,
  sombra = 12,
  children,
}: {
  label: string
  alvo: THREE.Vector3
  raio: number
  direcao: THREE.Vector3
  className?: string
  /** lado do quadrado da sombra no chão (m); máquinas compridas pedem mais */
  sombra?: number
  /** recebe se o modelo pode se mexer (falso com movimento reduzido) */
  children: (animado: boolean) => ReactNode
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const { montar, vigiar } = useCanvasNaTela(wrap)
  const { pronto, aoPronto, classe } = useRevelar(montar)
  const [toque] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)
  const reduced = prefersReducedMotion()
  const inicio = useMemo(() => alvo.clone().addScaledVector(direcao.clone().normalize(), 10), [alvo, direcao])
  const zoom = useContext(ZoomVitrine)
  const limites = useMemo<Limites>(() => ({ min: 0, max: Infinity }), [])
  const aproximar = useRef<(f: number) => void>(() => {})
  const controles = !toque || zoom === "total"

  return (
    <div ref={wrap} className={className}>
      <div className="relative h-full w-full" role="img" aria-label={label}>
        <Carregando3D className={`absolute inset-0 transition-opacity duration-500 ${pronto ? "opacity-0" : "opacity-100"}`} />
        <div className={`absolute inset-0 ${classe}`}>
        {montar && (
          <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{ position: inicio.toArray(), fov: 30 }}
            gl={{ antialias: true, alpha: true }}
            frameloop={reduced ? "demand" : "always"}
            onCreated={({ gl }) => {
              vigiar(gl)
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.05
            }}
            className={controles ? "cursor-grab active:cursor-grabbing" : undefined}
          >
            <ambientLight intensity={0.35} />
            <directionalLight position={[-4, 7, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
            {/* contraluz: a traseira e a lateral direita também ficam legíveis ao girar */}
            <directionalLight position={[5, 5, -6]} intensity={1.1} />
            <Environment resolution={256} frames={1}>
              <Lightformer form="rect" intensity={4} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
              <Lightformer form="rect" intensity={2.5} color="#8fe9ff" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
              <Lightformer form="rect" intensity={2} color="#2f7bff" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
              <Lightformer form="rect" intensity={2} position={[0, 1, 9]} scale={[10, 5, 1]} />
              <Lightformer form="rect" intensity={2} position={[0, 1, -9]} rotation-y={Math.PI} scale={[10, 5, 1]} />
            </Environment>

            <Entrada animado={!reduced}>{children(!reduced)}</Entrada>
            <Pronto aoPronto={aoPronto} />
            <Enquadrar alvo={alvo} raio={raio} direcao={direcao} limites={limites} />
            {zoom && <Aproximar acao={aproximar} alvo={alvo} limites={limites} />}
            <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={sombra} blur={2.4} far={3} color="#000814" />

            {controles && (
              <OrbitControls
                makeDefault
                enableZoom={zoom === "total"}
                enablePan={zoom === "total"}
                minPolarAngle={Math.PI * 0.08}
                maxPolarAngle={Math.PI * 0.47}
              />
            )}
          </Canvas>
        )}
        </div>
      </div>
      {zoom && (
        <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
          {(
            [
              [1 / 1.35, Plus, "Aproximar"],
              [1.35, Minus, "Afastar"],
            ] as const
          ).map(([f, Icone, nome]) => (
            <button
              key={nome}
              type="button"
              onClick={() => aproximar.current(f)}
              aria-label={t(nome)}
              title={t(nome)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white backdrop-blur-md transition-colors hover:border-ice hover:text-ice"
            >
              <Icone className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
