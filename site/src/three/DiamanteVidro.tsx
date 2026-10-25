import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Edges, Environment, Lightformer, Sparkles } from "@react-three/drei"
import * as THREE from "three"
import { pointer, prefersReducedMotion } from "@/lib/motion"
import { useCanvasNaTela } from "@/lib/webgl"

// lapidação octogonal, a mesma do logo e da lente do cursor: ponta embaixo, cinta, coroa e mesa em cima
const PERFIL = [
  new THREE.Vector2(0, -1.15),
  new THREE.Vector2(1, 0),
  new THREE.Vector2(1, 0.1),
  new THREE.Vector2(0.6, 0.52),
  new THREE.Vector2(0, 0.52),
]

function Diamante({ animado }: { animado: boolean }) {
  const grupo = useRef<THREE.Group>(null)
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(PERFIL, 8)
    g.computeVertexNormals()
    return g
  }, [])

  useFrame((state, dt) => {
    const g = grupo.current
    if (!g) return
    // gira sozinho, gira mais com a rolagem e inclina para o lado do mouse
    const rolagem = window.scrollY / window.innerHeight
    const giro = state.clock.elapsedTime * 0.25 + rolagem * 2.2
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, giro, 4, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.32 - pointer.y * 0.25, 3, dt)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -pointer.x * 0.18, 3, dt)
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06
  })

  return (
    <group ref={grupo} rotation={[0.32, 0, 0]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          color="#9feeff"
          roughness={0.12}
          metalness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.05}
          iridescence={1}
          iridescenceIOR={1.7}
          iridescenceThicknessRange={[180, 620]}
          envMapIntensity={4.5}
          flatShading
          transparent
          opacity={0.42}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <Edges threshold={12} color="#d8f9ff" />
      </mesh>
      {animado && <Sparkles count={36} scale={[3.4, 2.4, 2]} size={2.2} speed={0.35} opacity={0.7} color="#bff4ff" />}
    </group>
  )
}

/** Diamante de vidro em 3D gravado no meio da chapa da abertura do catálogo (só existe perto da tela) */
export default function DiamanteVidro({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const { montar, vigiar } = useCanvasNaTela(wrap, { inicial: true })
  const reduzido = prefersReducedMotion()

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      {montar && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 5.4], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={reduzido ? "demand" : "always"}
          onCreated={({ gl }) => {
            vigiar(gl)
            gl.toneMapping = THREE.ACESFilmicToneMapping
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={9} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
            <Lightformer form="rect" intensity={3} color="#8fe9ff" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
            <Lightformer form="rect" intensity={3} color="#2f7bff" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
            <Lightformer form="ring" intensity={2} position={[0, 0, 6]} scale={3} />
          </Environment>
          <Diamante animado={!reduzido} />
        </Canvas>
      )}
    </div>
  )
}
