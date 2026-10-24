import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, Lightformer } from "@react-three/drei"
import * as THREE from "three"
import { pointer, prefersReducedMotion, scrollState } from "@/lib/motion"
import { useCanvasNaTela } from "@/lib/webgl"

/* ---------- engrenagem: perfil de dentes trapezoidais, extrudado ---------- */

function useGearGeometry(teeth: number, rOuter: number, rRoot: number, rHole: number, depth: number) {
  return useMemo(() => {
    const s = new THREE.Shape()
    const step = (Math.PI * 2) / teeth
    for (let i = 0; i < teeth; i++) {
      const a = i * step
      const pts: [number, number][] = [
        [a, rRoot],
        [a + step * 0.18, rOuter],
        [a + step * 0.5, rOuter],
        [a + step * 0.68, rRoot],
      ]
      pts.forEach(([ang, r], k) => {
        const x = Math.cos(ang) * r
        const y = Math.sin(ang) * r
        if (i === 0 && k === 0) s.moveTo(x, y)
        else s.lineTo(x, y)
      })
    }
    s.closePath()
    const hole = new THREE.Path()
    hole.absarc(0, 0, rHole, 0, Math.PI * 2, true)
    s.holes.push(hole)
    // furos de alívio no corpo da engrenagem
    const n = 5
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const h = new THREE.Path()
      h.absarc(Math.cos(a) * (rRoot + rHole) * 0.5, Math.sin(a) * (rRoot + rHole) * 0.5, (rRoot - rHole) * 0.22, 0, Math.PI * 2, true)
      s.holes.push(h)
    }
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2, curveSegments: 24 })
    g.center()
    return g
  }, [teeth, rOuter, rRoot, rHole, depth])
}

/* ---------- rolamento: anéis torneados + esferas ---------- */

function Bearing({ metal, chrome }: { metal: THREE.Material; chrome: THREE.Material }) {
  const inner = useRef<THREE.Group>(null)
  // perfil retangular com chanfro, girado em torno do eixo = anel torneado
  const ring = (r0: number, r1: number, h: number) =>
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(r0, -h / 2),
        new THREE.Vector2(r1 - 0.03, -h / 2),
        new THREE.Vector2(r1, -h / 2 + 0.03),
        new THREE.Vector2(r1, h / 2 - 0.03),
        new THREE.Vector2(r1 - 0.03, h / 2),
        new THREE.Vector2(r0, h / 2),
        new THREE.Vector2(r0, -h / 2),
      ],
      64
    )
  const outerGeo = useMemo(() => ring(0.78, 1.0, 0.36), [])
  const innerGeo = useMemo(() => ring(0.32, 0.52, 0.36), [])
  const balls = 11

  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.y += dt * 1.4
  })

  return (
    <group>
      <mesh geometry={outerGeo} material={metal} />
      <group ref={inner}>
        <mesh geometry={innerGeo} material={metal} />
        {Array.from({ length: balls }, (_, i) => {
          const a = (i / balls) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.65, 0, Math.sin(a) * 0.65]} material={chrome}>
              <sphereGeometry args={[0.12, 24, 24]} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function Parts({ mobile }: { mobile: boolean }) {
  const rig = useRef<THREE.Group>(null)
  const gearA = useRef<THREE.Mesh>(null)
  const gearB = useRef<THREE.Mesh>(null)
  const viewport = useThree((s) => s.viewport)

  const big = useGearGeometry(18, 1.25, 1.05, 0.32, 0.28)
  const small = useGearGeometry(11, 0.8, 0.62, 0.2, 0.28)

  const mats = useMemo(
    () => ({
      steel: new THREE.MeshStandardMaterial({ color: "#dfe7f0", metalness: 0.85, roughness: 0.22, envMapIntensity: 1.6 }),
      dark: new THREE.MeshStandardMaterial({ color: "#8794a6", metalness: 0.9, roughness: 0.3, envMapIntensity: 1.5 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 1, roughness: 0.05 }),
      blue: new THREE.MeshStandardMaterial({ color: "#2f7bff", metalness: 0.9, roughness: 0.3 }),
    }),
    []
  )

  useFrame((_, dt) => {
    const s = scrollState.hero
    const speed = 0.35 + s * 2
    // engrenagens engatadas giram em sentidos opostos, na razão dos dentes
    if (gearA.current) gearA.current.rotation.z += dt * speed
    if (gearB.current) gearB.current.rotation.z -= dt * speed * (18 / 11)
    if (rig.current) {
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, -0.35 + pointer.x * 0.35 + s * 0.6, 0.05)
      rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, 0.15 - pointer.y * 0.2, 0.05)
      rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, (mobile ? viewport.height * 0.2 : 0) + s * 1.2, 0.08)
      rig.current.position.x = mobile ? 0 : Math.max(2.5, viewport.width * 0.31)
      rig.current.scale.setScalar(mobile ? 0.62 : 0.9)
    }
  })

  return (
    <group ref={rig}>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
        <mesh ref={gearA} geometry={big} material={mats.steel} position={[-0.55, 0.35, 0]} />
        <mesh ref={gearB} geometry={small} material={mats.dark} position={[1.12, -0.52, 0.05]} rotation-z={0.14} />
        {/* eixo azul no centro da engrenagem grande */}
        <mesh position={[-0.55, 0.35, 0]} rotation-x={Math.PI / 2} material={mats.blue}>
          <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1}>
        <group position={[0.6, 1.55, -0.9]} rotation={[1.1, 0.3, 0.2]} scale={0.62}>
          <Bearing metal={mats.steel} chrome={mats.chrome} />
        </group>
      </Float>
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.4}>
        {/* parafusos soltos */}
        {[
          [-1.9, -1.1, 0.6],
          [1.9, 1.0, 0.4],
          [-1.6, 1.5, -0.4],
        ].map((p, i) => (
          <group key={i} position={p as [number, number, number]} rotation={[i, i * 2, i * 0.5]} scale={0.5}>
            <mesh material={mats.chrome} position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 6]} />
            </mesh>
            <mesh material={mats.steel}>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  )
}

export default function PartsScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const { montar, vigiar } = useCanvasNaTela(wrap, { inicial: true })
  const [mobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    // no celular o canvas às vezes mede o tamanho antes do layout assentar: força uma nova medição
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      {montar && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 7], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={reduced ? "demand" : "always"}
          onCreated={({ gl }) => {
            vigiar(gl)
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.1
          }}
        >
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={6} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} />
            <Lightformer form="rect" intensity={4} color="#8fe9ff" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} />
            <Lightformer form="rect" intensity={4} color="#2f7bff" position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} />
            <Lightformer form="ring" intensity={5} position={[2, 2, 5]} scale={1.5} />
            <Lightformer form="rect" intensity={1.5} color="#9fb4d6" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
            <Lightformer form="rect" intensity={2.5} position={[0, 0, 8]} scale={[10, 6, 1]} />
          </Environment>
          <Parts mobile={mobile} />
        </Canvas>
      )}
    </div>
  )
}
