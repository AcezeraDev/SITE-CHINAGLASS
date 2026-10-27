import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Grid, Lightformer, PerformanceMonitor } from "@react-three/drei"
import * as THREE from "three"
import { pointer, scrollState } from "@/lib/motion"
import { useCanvasNaTela } from "@/lib/webgl"
import { CORTE0, CORTES, FIM, PLANO, tempoDaJornada } from "./jumboTempo"
import { Linha } from "./LinhaCorteJumbo"

/*
 * Jornada de scroll da linha de corte Jumbo: o progresso da seção (scrollState.jornada, 0 → 1) vira o tempo do ciclo
 * da máquina, e a câmera segue um roteiro de planos de cinema: em cada etapa um plano aberto que apresenta a cena
 * e um close que avança até a ação (ventosas, rodas, roda de corte, peças), trocando de lente entre um e outro.
 */

type Plano = {
  em: number // progresso do scroll em que a câmera chega neste plano
  pos: [number, number, number]
  olha: [number, number, number]
  lente: number // campo de visão vertical (graus): menor é teleobjetiva, close
  giro?: number // inclinação da câmera (graus), o "dutch angle" dos closes
  seguir?: number // 0 → 1: quanto o plano acompanha a roda de corte (pos e olha viram relativos ao cabeçote)
}

const ROTEIRO: Plano[] = [
  // 1 · carregamento
  { em: 0, pos: [13, 7.5, 13], olha: [2.5, 1, 0], lente: 38 }, // a linha inteira, de cima
  { em: 0.07, pos: [11.0, 4.2, 8.0], olha: [4.9, 1.7, -0.4], lente: 30 }, // avança até os braços com a chapa
  { em: 0.18, pos: [9.0, 2.6, 6.0], olha: [5.0, 1.0, 0.2], lente: 24, giro: -3 }, // close nas ventosas pousando a chapa
  // 2 · alimentação
  { em: 0.28, pos: [8.2, 1.7, 5.0], olha: [4.0, 0.9, 0.2], lente: 22, giro: 2 }, // rente às rodas vermelhas
  { em: 0.38, pos: [5.6, 2.8, 7.0], olha: [1.2, 0.95, 0.2], lente: 28 }, // acompanha a chapa entrando na CNC
  // 3 · corte
  { em: 0.45, pos: [2.6, 6.2, 7.2], olha: [0.2, 0.9, 0], lente: 32 }, // apresenta a mesa CNC e o pórtico
  { em: 0.54, pos: [2.6, 1.6, 3.6], olha: [0, 0, 0], lente: 22, giro: 2, seguir: 1 }, // close na roda de corte
  { em: 0.66, pos: [-0.8, 3.4, 2.4], olha: [0, 0, 0], lente: 24, giro: -2, seguir: 1 }, // de cima, o risco sendo desenhado
  { em: 0.74, pos: [-1.6, 5.8, 7.2], olha: [0.1, 0.9, 0], lente: 34 }, // abre e revela a chapa riscada
  // 4 · destaque
  { em: 0.86, pos: [-1.6, 5.4, 7.0], olha: [-3.4, 0.95, 0], lente: 27, giro: -1.5 }, // acompanha a chapa saindo
  { em: 1, pos: [-6.2, 6.8, 5.2], olha: [-4.4, 0.9, 0], lente: 30 }, // de cima, as peças separadas
]
const CABECA_Y = 0.95 // altura da roda de corte sobre a chapa (m)
const ASPECTO_BASE = 1.6 // proporção de tela em que as lentes foram escolhidas

const curva = (pts: [number, number, number][]) =>
  new THREE.CatmullRomCurve3(
    pts.map((p) => new THREE.Vector3(...p)),
    false,
    "centripetal"
  )
const suaviza = (x: number) => x * x * (3 - 2 * x)

/** progresso → plano atual e quanto falta para o próximo, com entrada e saída suaves entre planos */
function noRoteiro(p: number) {
  let i = 0
  while (i < ROTEIRO.length - 2 && p > ROTEIRO[i + 1].em) i++
  const a = ROTEIRO[i]
  const b = ROTEIRO[i + 1]
  const k = suaviza(THREE.MathUtils.clamp((p - a.em) / (b.em - a.em), 0, 1))
  return { a, b, k, u: (i + k) / (ROTEIRO.length - 1) }
}

function Camera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const caminho = useMemo(() => ({ pos: curva(ROTEIRO.map((q) => q.pos)), olha: curva(ROTEIRO.map((q) => q.olha)) }), [])
  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      olha: new THREE.Vector3(),
      atual: new THREE.Vector3(...ROTEIRO[0].olha),
      cabeca: new THREE.Vector3(),
      rel: new THREE.Vector3(),
      feitos: CORTES.map(() => 0),
      lente: ROTEIRO[0].lente,
      giro: 0,
    }),
    []
  )

  // desloca o enquadramento: máquina à direita do texto (computador) ou no alto (celular)
  useEffect(() => {
    const desvio = size.width < 1200 ? 0.2 : 0.16
    if (size.width >= 768) camera.setViewOffset(size.width, size.height, -size.width * desvio, 0, size.width, size.height)
    else camera.setViewOffset(size.width, size.height, 0, size.height * 0.18, size.width, size.height)
    camera.updateProjectionMatrix()
  }, [camera, size])

  // tela estreita (celular): abre a lente para manter na largura o mesmo enquadramento do computador
  const abrir = Math.max(1, ASPECTO_BASE / (size.width / size.height))

  useFrame(({ clock }, delta) => {
    const pr = scrollState.jornada
    const { a, b, k, u } = noRoteiro(pr)
    caminho.pos.getPoint(u, v.pos)
    caminho.olha.getPoint(u, v.olha)

    // planos que seguem a roda de corte: a posição e o alvo passam a ser relativos ao cabeçote
    const seguir = THREE.MathUtils.lerp(a.seguir ?? 0, b.seguir ?? 0, k)
    if (seguir > 0) {
      const r = THREE.MathUtils.clamp(tempoDaJornada(pr), CORTE0, FIM)
      const roda = PLANO.em(r - CORTE0, v.feitos)
      v.cabeca.set(roda.x, CABECA_Y, roda.z)
      v.rel.copy(v.pos).sub(v.olha)
      v.pos.lerp(v.rel.add(v.cabeca), seguir)
      v.olha.lerp(v.cabeca, seguir)
    }

    // closes ficam mais quietos: menos paralaxe do mouse, mas com a respiração leve de câmera na mão
    const lente = THREE.MathUtils.lerp(a.lente, b.lente, k)
    const perto = THREE.MathUtils.clamp((34 - lente) / 16, 0, 1)
    const t = clock.elapsedTime
    v.pos.x += pointer.x * 0.35 * (1 - perto * 0.7) + Math.sin(t * 0.9) * 0.02 * perto
    v.pos.y += pointer.y * 0.2 * (1 - perto * 0.7) + Math.sin(t * 1.3 + 1) * 0.015 * perto

    // amortecimento independente da taxa de quadros: os planos "assentam" como num travelling
    const amortece = 1 - Math.exp(-delta * 4)
    camera.position.lerp(v.pos, amortece)
    v.atual.lerp(v.olha, amortece)
    v.lente += (lente - v.lente) * amortece
    v.giro += (THREE.MathUtils.lerp(a.giro ?? 0, b.giro ?? 0, k) - v.giro) * amortece
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(v.lente) / 2) * abrir))
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = Math.min(fov, 80)
      camera.updateProjectionMatrix()
    }
    camera.lookAt(v.atual)
    camera.rotateZ(THREE.MathUtils.degToRad(v.giro))
  })
  return null
}

export default function JornadaCorte() {
  const wrap = useRef<HTMLDivElement>(null)
  // a cena é guiada pela rolagem e tem que estar pronta quando chega na tela: o canvas nasce junto com a página,
  // desenha um quadro (compila todos os materiais) e fica parado até a seção chegar perto
  const { montar, vigiar } = useCanvasNaTela(wrap, { margem: "100000px 0px", inicial: true })
  const [perto, setPerto] = useState(false)
  const [dpr, setDpr] = useState(1.75)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPerto(e.isIntersecting), { rootMargin: "100% 0px" })
    io.observe(wrap.current!)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      {montar && (
        <Canvas
          dpr={[1, dpr]}
          camera={{ position: ROTEIRO[0].pos, fov: ROTEIRO[0].lente, near: 0.05, far: 80 }}
          gl={{ antialias: true, alpha: true }}
          // o movimento vem do scroll de quem lê, então segue rodando mesmo com movimento reduzido
          frameloop={perto ? "always" : "demand"}
          onCreated={({ gl }) => {
            vigiar(gl)
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
      )}
    </div>
  )
}
