import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"
import { pointer, prefersReducedMotion, scrollState } from "@/lib/motion"
import { useCanvasNaTela } from "@/lib/webgl"

/* ---------- Fundo: fachada de vidro em perspectiva, com reflexo passando pelos painéis ---------- */

const bgVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const bgFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform vec2 uGlow;
  uniform float uMobile;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // simplex 2D (Ashima Arts)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * snoise(p); p *= 2.02; a *= 0.5; }
    return s;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

    vec3 ink = vec3(0.010, 0.020, 0.045);
    vec3 deep = vec3(0.045, 0.12, 0.28);
    vec3 azure = vec3(0.18, 0.48, 1.0);
    vec3 ice = vec3(0.56, 0.91, 1.0);

    // perspectiva: quina de uma torre de vidro no centro, as duas faces fugindo para os lados
    vec2 sp = p + uPointer * 0.025;
    float depth = 1.0 + abs(sp.x) * 0.9 - sp.y * 0.25;
    vec2 g = vec2(abs(sp.x) * 1.5, sp.y + 0.6 + uScroll * 0.25) / depth;

    // painéis: 4 colunas por 6 andares no enquadramento
    vec2 cells = g * vec2(3.2, 3.6);
    vec2 id = floor(cells);
    vec2 f = fract(cells);
    float rnd = hash(id);

    // montantes de alumínio: linhas finas e nítidas em qualquer tela
    vec2 w = fwidth(cells) * 1.4;
    vec2 edge = smoothstep(vec2(0.0), w, f) * smoothstep(vec2(0.0), w, 1.0 - f);
    float frame = 1.0 - edge.x * edge.y;

    // céu refletido: nuvens lentas, cada vidro com um leve desvio (vidros nunca são perfeitamente planos)
    vec2 r = g * 0.6 + vec2(rnd * 0.08, 0.0) + vec2(uTime * 0.012, 0.0);
    float sky = fbm(r * 1.6);
    vec3 col = mix(ink, deep, smoothstep(-0.5, 0.7, sky + g.y * 0.35));
    col *= 0.75 + rnd * 0.35;

    // faixa de reflexo que atravessa a fachada na diagonal
    float sweep = sin((g.x * 0.9 - g.y * 0.55) * 2.2 - uTime * 0.32 + rnd * 0.35);
    col += ice * pow(max(sweep, 0.0), 28.0) * 0.45;
    col += azure * pow(max(sweep, 0.0), 6.0) * 0.1;

    // luz morna de dentro em poucos painéis
    col += azure * step(0.93, rnd) * 0.05 * (0.6 + 0.4 * sin(uTime * 0.4 + rnd * 20.0));

    // montantes com brilho de metal, mais claros onde o reflexo passa
    col = mix(col, mix(vec3(0.1, 0.17, 0.29), ice * 0.6, pow(max(sweep, 0.0), 10.0)), frame * 0.9);

    // quina da torre: aresta vertical acesa no centro, atrás do diamante
    float corner = smoothstep(0.012, 0.0, abs(sp.x)) * smoothstep(-0.6, 0.5, sp.y);
    col += ice * corner * 0.35;

    // a fachada some atrás do texto (embaixo, no centro) e fica viva em cima e nas laterais
    vec2 tq = (uv - vec2(0.5, mix(0.2, 0.22, uMobile))) * vec2(mix(0.85, 0.6, uMobile), 1.5);
    float side = smoothstep(0.12, 0.6, length(tq));
    col = mix(ink, col, side);

    float glow = smoothstep(0.7, 0.0, distance(uv, uGlow + uPointer * 0.03));
    col += azure * glow * 0.16;

    // vinheta e escurecimento conforme rola
    col *= smoothstep(1.7, 0.3, length(p * vec2(0.8, 1.0)));
    col *= 1.0 - uScroll * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`

function CausticBackground({ mobile }: { mobile: boolean }) {
  const { viewport } = useThree()
  const mat = useRef<THREE.ShaderMaterial>(null)
  // o brilho fica atrás do diamante, no centro e acima do texto
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
      uGlow: { value: mobile ? new THREE.Vector2(0.5, 0.8) : new THREE.Vector2(0.5, 0.7) },
      uMobile: { value: mobile ? 1 : 0 },
      uAspect: { value: 1.8 },
    }),
    [mobile]
  )
  const z = -6
  const vp = viewport.getCurrentViewport(undefined, new THREE.Vector3(0, 0, z))
  uniforms.uAspect.value = vp.width / vp.height

  useFrame((state) => {
    if (!mat.current) return
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
    mat.current.uniforms.uPointer.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.04)
    mat.current.uniforms.uScroll.value = scrollState.hero
  })

  return (
    <mesh position={[0, 0, z]} scale={[vp.width * 1.15, vp.height * 1.15, 1]}>
      <planeGeometry />
      <shaderMaterial ref={mat} vertexShader={bgVertex} fragmentShader={bgFragment} uniforms={uniforms} depthWrite={false} />
    </mesh>
  )
}

/* ---------- Diamante lapidado (o mesmo símbolo do logo) ---------- */

function useBrilliantGeometry(segments = 16) {
  return useMemo(() => {
    // perfil de um brilhante: culet → pavilhão → cintura → coroa → mesa
    const profile = [
      new THREE.Vector2(0.0001, -1.05),
      new THREE.Vector2(0.52, -0.48),
      new THREE.Vector2(1.0, -0.02),
      new THREE.Vector2(1.0, 0.06),
      new THREE.Vector2(0.84, 0.27),
      new THREE.Vector2(0.58, 0.42),
      new THREE.Vector2(0.0001, 0.42),
    ]
    const g = new THREE.LatheGeometry(profile, segments).toNonIndexed()
    g.computeVertexNormals() // não indexada = faces planas, lapidação nítida
    return g
  }, [segments])
}

function Diamond({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null)
  const geo = useBrilliantGeometry(mobile ? 12 : 16)
  const viewport = useThree((s) => s.viewport)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const s = scrollState.hero
    g.rotation.y += dt * (0.25 + s * 1.6)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.42 + pointer.y * 0.25 + s * 0.9, 0.05)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -pointer.x * 0.2, 0.05)
    // diamante no centro, acima do título (no celular, mais alto e menor)
    const baseY = viewport.height / 2 - viewport.height * (mobile ? 0.2 : 0.25)
    g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.x * 0.12, 0.06)
    g.position.y = THREE.MathUtils.lerp(g.position.y, baseY + Math.sin(state.clock.elapsedTime * 0.8) * 0.06 + s * 1.6, 0.06)
    const sc = (mobile ? viewport.width * 0.3 : Math.min(0.72, viewport.height * 0.16)) * (1 - s * 0.35)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, sc, 0.08))
  })

  return (
    <group ref={group} scale={0.01}>
      <mesh geometry={geo}>
        <MeshTransmissionMaterial
          samples={mobile ? 3 : 6}
          resolution={mobile ? 256 : 512}
          transmission={1}
          thickness={1.4}
          roughness={0}
          ior={2.1}
          chromaticAberration={0.9}
          anisotropicBlur={0.2}
          distortion={0.25}
          distortionScale={0.4}
          temporalDistortion={0.08}
          backside
          backsideThickness={0.6}
          color="#eaf8ff"
          attenuationColor="#bfe9ff"
          attenuationDistance={2.5}
        />
      </mesh>
      {/* arestas acesas: desenho técnico sobre a pedra */}
      <lineSegments>
        <edgesGeometry args={[geo, 20]} />
        <lineBasicMaterial color="#8fe9ff" transparent opacity={0.22} />
      </lineSegments>
    </group>
  )
}

/* ---------- Cacos de vidro flutuando ---------- */

function makeShardGeometry(seed: number) {
  const rnd = (i: number) => {
    const x = Math.sin(seed * 91.7 + i * 47.3) * 43758.5453
    return x - Math.floor(x)
  }
  const shape = new THREE.Shape()
  const pts = 3 + Math.floor(rnd(0) * 3)
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2 + rnd(i + 1) * 0.9
    const r = 0.35 + rnd(i + 10) * 0.45
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r * (0.6 + rnd(i + 20) * 0.8)
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 1,
  })
  g.center()
  return g
}

function Shards({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null)
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        const r = 2.6 + ((i * 37) % 10) / 4
        return {
          geo: makeShardGeometry(i + 1),
          pos: [Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.62, -1.5 - ((i * 13) % 7) * 0.45] as [number, number, number],
          rot: [i * 0.7, i * 1.3, i * 0.4] as [number, number, number],
          scale: 0.35 + ((i * 17) % 10) / 16,
          speed: 0.6 + ((i * 7) % 10) / 10,
        }
      }),
    [count]
  )

  useFrame(() => {
    const g = group.current
    if (!g) return
    const s = scrollState.hero
    // ao rolar, os cacos se espalham em direção à câmera
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, 1 + s * 0.9, 0.06))
    g.position.z = THREE.MathUtils.lerp(g.position.z, s * 2.2, 0.06)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, s * 0.6 + pointer.x * 0.05, 0.05)
  })

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={1.4} floatIntensity={1.2}>
          <mesh geometry={s.geo} position={s.pos} rotation={s.rot} scale={s.scale}>
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.4}
              roughness={0.04}
              ior={1.52}
              metalness={0}
              clearcoat={1}
              iridescence={0.6}
              iridescenceIOR={1.3}
              color="#d8f3ff"
              attenuationColor="#7fd6c9"
              attenuationDistance={1.2}
              envMapIntensity={1.6}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

/* ---------- Poeira de vidro brilhando ---------- */

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aScale;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * 0.06 * aScale + position.y + 4.0, 8.0) - 4.0 - position.y;
    p.x += sin(uTime * 0.3 + position.z * 3.0) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * 34.0 * uPixelRatio / -mv.z;
    vTwinkle = 0.5 + 0.5 * sin(uTime * 2.0 + position.x * 12.0);
  }
`
const dustFragment = /* glsl */ `
  varying float vTwinkle;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0);
    gl_FragColor = vec4(vec3(0.62, 0.92, 1.0), a * (0.35 + vTwinkle * 0.65));
  }
`

function Dust({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()
  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sc = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1
      sc[i] = 0.3 + Math.random()
    }
    return [pos, sc]
  }, [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }), [gl])

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ---------- Luzes de estúdio para os reflexos (sem baixar HDR) ---------- */

function StudioLights() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={8} color="#ffffff" position={[0, 5, -2]} scale={[10, 1.2, 1]} />
      <Lightformer form="rect" intensity={4} color="#8fe9ff" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 0.6, 1]} />
      <Lightformer form="rect" intensity={4} color="#2f7bff" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 0.6, 1]} />
      <Lightformer form="ring" intensity={6} color="#ffffff" position={[2, 2, 4]} scale={1.6} />
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[-3, -3, 3]} scale={[3, 0.4, 1]} />
    </Environment>
  )
}

/* ---------- Canvas ---------- */

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  // acima da dobra: começa montado
  const { montar, vigiar } = useCanvasNaTela(wrap, { margem: "100px", inicial: true })
  const [mobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768)
  const reduced = prefersReducedMotion()

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      {montar && (
        <Canvas
          dpr={[1, mobile ? 1.5 : 1.75]}
          camera={{ position: [0, 0, 6], fov: 40 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          frameloop={reduced ? "demand" : "always"}
          onCreated={({ gl }) => {
            vigiar(gl)
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.15
          }}
        >
          <CausticBackground mobile={mobile} />
          <StudioLights />
          <Dust count={mobile ? 260 : 650} />
          <Shards count={mobile ? 7 : 14} />
          <Diamond mobile={mobile} />
        </Canvas>
      )}
    </div>
  )
}
