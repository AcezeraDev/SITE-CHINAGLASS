import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Grid, Lightformer, PerformanceMonitor } from "@react-three/drei"
import * as THREE from "three"
import { pointer, scrollState } from "@/lib/motion"
import { ETAPAS, tempoDaJornada } from "./jumboTempo"
import { Linha } from "./LinhaCorteJumbo"

/*
 * Jornada de scroll da linha de corte Jumbo: o progresso da seção (scrollState.jornada, 0 → 1) vira o tempo do ciclo
 * da máquina e a câmera percorre uma curva que passa por um enquadramento de cada etapa:
 * carregadora → alimentação da mesa CNC → corte → mesa de destaque.
 */

// um enquadramento por etapa e um no fim; posição da câmera e ponto para onde ela olha (m)
const QUADROS = [
  { pos: [11.5, 5.0, 9.5], olha: [4.9, 1.2, 0] }, // carregadora com os braços em pé
  { pos: [8.6, 5.4, 10.8], olha: [3.0, 1.0, 0] }, // chapa rolando para a mesa CNC
  { pos: [2.8, 6.8, 8.0], olha: [0.2, 0.9, 0] }, // por cima do pórtico, riscando
  { pos: [-1.6, 5.8, 7.2], olha: [0.1, 0.9, 0] }, // o corte pelo lado do console
  { pos: [-9.6, 6.2, 8.6], olha: [-4.5, 0.9, 0.2] }, // peças separadas na mesa de destaque
] as const
const MARCOS = [...ETAPAS, 1] // progresso em que a câmera chega a cada quadro

const curva = (pts: readonly (readonly number[])[]) =>
  new THREE.CatmullRomCurve3(
    pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    false,
    "centripetal"
  )

/** progresso do scroll → parâmetro da curva, chegando em cada quadro no início da etapa */
function naCurva(p: number) {
  let i = 0
  while (i < MARCOS.length - 2 && p > MARCOS[i + 1]) i++
  const k = Math.min(Math.max((p - MARCOS[i]) / (MARCOS[i + 1] - MARCOS[i]), 0), 1)
  return (i + k) / (MARCOS.length - 1)
}

function Camera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const caminho = useMemo(() => ({ pos: curva(QUADROS.map((q) => q.pos)), olha: curva(QUADROS.map((q) => q.olha)) }), [])
  const v = useMemo(() => ({ pos: new THREE.Vector3(), olha: new THREE.Vector3(), atual: new THREE.Vector3(...QUADROS[0].olha) }), [])

  // desloca o enquadramento: máquina à direita do texto (computador) ou no alto (celular)
  useEffect(() => {
    const desvio = size.width < 1200 ? 0.2 : 0.16
    if (size.width >= 768) camera.setViewOffset(size.width, size.height, -size.width * desvio, 0, size.width, size.height)
    else camera.setViewOffset(size.width, size.height, 0, size.height * 0.18, size.width, size.height)
    camera.updateProjectionMatrix()
  }, [camera, size])

  const afastar = THREE.MathUtils.clamp(1.3 / (size.width / size.height), 1, 2.3)

  useFrame((_, delta) => {
    const u = naCurva(scrollState.jornada)
    caminho.pos.getPoint(u, v.pos)
    caminho.olha.getPoint(u, v.olha)
    // tela estreita (celular) corta a máquina dos lados: afasta a câmera na mesma proporção
    v.pos.sub(v.olha).multiplyScalar(afastar).add(v.olha)
    v.pos.x += pointer.x * 0.35
    v.pos.y += pointer.y * 0.2
    // amortecimento independente da taxa de quadros
    const k = 1 - Math.exp(-delta * 5)
    camera.position.lerp(v.pos, k)
    v.atual.lerp(v.olha, k)
    camera.lookAt(v.atual)
  })
  return null
}

export default function JornadaCorte() {
  const wrap = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)
  const [dpr, setDpr] = useState(1.75)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { rootMargin: "200px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, dpr]}
        camera={{ position: [...QUADROS[0].pos], fov: 34, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        // o movimento vem do scroll de quem lê, então segue rodando mesmo com movimento reduzido
        frameloop={visivel ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-4, 8, 6]} intensity={1.6} />
        <directionalLight position={[6, 5, -6]} intensity={1.0} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={4} position={[0, 7, 2]} rotation-x={Math.PI / 2} scale={[16, 4, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#8fe9ff" position={[-9, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2} color="#2f7bff" position={[9, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2} position={[0, 1, 10]} scale={[16, 5, 1]} />
        </Environment>

        <Camera />
        <Linha animado tempo={() => tempoDaJornada(scrollState.jornada)} />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.6} scale={20} blur={2.4} far={3} color="#000814" />
        {/* piso técnico, como no resto do site */}
        <Grid
          position={[0, -0.01, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#14335f"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#1f5aa8"
          fadeDistance={22}
          fadeStrength={2}
          infiniteGrid
        />
      </Canvas>
    </div>
  )
}
