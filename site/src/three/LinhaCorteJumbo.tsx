import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { faixa, Portico, Riscos, suave, useVidro, type PosCorte } from "./Corte"
import { CASA, CORTE0, CORTES, DESTACA, DESTAQUE0, FIM, PECAS, PLANO, ROLA, VIDRO } from "./jumboTempo"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Linha de corte automática 4200 / 6100 mm (Jumbo), modelada a partir das 6 vistas de referência.
 * 1 unidade = 1 m. A linha corre ao longo de x: mesa de destaque em -x, mesa CNC no meio e carregadora em +x, frente em +z.
 * Os braços de ventosas da carregadora giram num eixo junto à borda da frente: deitam a chapa, ela rola até a mesa CNC,
 * o pórtico risca o plano de corte e a chapa segue para a mesa de destaque.
 */

const P = 3.0 // largura das mesas
const MESA = 0.9 // altura do tampo
const LINHA = "#9aa3b2"
const DESTAQUE = { x: -4.4, L: 3.6 }
const CNC = { x: 0, L: 4.6 }
const CARGA = { x: 4.75, L: 4.0 }
const BRACOS = [3.15, 3.95, 4.75, 5.55, 6.35]
const VENTOSAS = [-0.5, -1.15, -1.8, -2.45]
const PIVO = new THREE.Vector3(0, MESA - 0.125, P / 2 + 0.06) // eixo dos braços, na frente da carregadora
const EM_PE = 1.25 // braços levantados (rad), inclinados para trás com as ventosas para a frente
const OPACO = 0.3

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      branco: new THREE.MeshStandardMaterial({ color: "#e4e8ee", metalness: 0.25, roughness: 0.45 }),
      alu: new THREE.MeshStandardMaterial({ color: "#d3d9e1", metalness: 0.85, roughness: 0.3 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.45, roughness: 0.35 }),
      feltro: new THREE.MeshStandardMaterial({ color: "#1c2027", roughness: 0.95 }),
      correia: new THREE.MeshStandardMaterial({ color: "#1d3a6b", roughness: 0.6 }),
      azul: new THREE.MeshStandardMaterial({ color: "#1f8be0", metalness: 0.35, roughness: 0.35 }),
      amarelo: new THREE.MeshStandardMaterial({ color: "#f5c518", roughness: 0.5 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0262f", metalness: 0.1, roughness: 0.35 }),
      bege: new THREE.MeshStandardMaterial({ color: "#e6e1d3", metalness: 0.15, roughness: 0.55 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0a2a4a", emissive: "#3a8bff", emissiveIntensity: 0.35, roughness: 0.15 }),
    }),
    []
  )
}

/** Estrutura de perfis brancos: pernas com sapata, longarinas e travessas */
function Quadro({ x, L, pernas, m }: { x: number; L: number; pernas: number; m: Mats }) {
  const zs = [-1, 1].map((s) => s * (P / 2 - 0.12))
  const xs = Array.from({ length: pernas }, (_, i) => -L / 2 + 0.15 + (i * (L - 0.3)) / (pernas - 1))
  return (
    <group position={[x, 0, 0]}>
      {xs.flatMap((px) =>
        zs.map((z) => (
          <group key={`${px}${z}`} position={[px, 0, z]}>
            <mesh position={[0, (MESA - 0.1) / 2, 0]} material={m.branco} castShadow>
              <boxGeometry args={[0.08, MESA - 0.1, 0.08]} />
            </mesh>
            <mesh position={[0, 0.012, 0]} material={m.grafite}>
              <cylinderGeometry args={[0.06, 0.07, 0.024, 16]} />
            </mesh>
          </group>
        ))
      )}
      {zs.flatMap((z) =>
        [0.22, MESA - 0.14].map((y) => (
          <mesh key={`${z}${y}`} position={[0, y, z]} material={m.branco} castShadow>
            <boxGeometry args={[L - 0.2, 0.07, 0.07]} />
          </mesh>
        ))
      )}
      {xs.map((px) => (
        <mesh key={px} position={[px, 0.22, 0]} material={m.branco}>
          <boxGeometry args={[0.07, 0.07, P - 0.24]} />
        </mesh>
      ))}
    </group>
  )
}

/** Tampo com chassi de alumínio e feltro preto dividido em placas; `correias` desenha as faixas ao longo de x */
function Tampo({ x, L, placas, correias = [], m }: { x: number; L: number; placas: number; correias?: number[]; m: Mats }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, MESA - 0.05, 0]} material={m.alu} castShadow receiveShadow>
        <boxGeometry args={[L, 0.1, P]} />
      </mesh>
      <mesh position={[0, MESA + 0.001, 0]} rotation-x={-Math.PI / 2} material={m.feltro} receiveShadow>
        <planeGeometry args={[L - 0.08, P - 0.08]} />
      </mesh>
      {Array.from({ length: placas - 1 }, (_, i) => (
        <mesh key={i} position={[-L / 2 + ((i + 1) * L) / placas, MESA + 0.002, 0]} material={m.alu}>
          <boxGeometry args={[0.02, 0.003, P - 0.08]} />
        </mesh>
      ))}
      {correias.map((z) => (
        <mesh key={z} position={[0, MESA + 0.002, z]} material={m.correia}>
          <boxGeometry args={[L - 0.1, 0.003, 0.03]} />
        </mesh>
      ))}
    </group>
  )
}

/** Mesa CNC: estrutura, tampo com correias e trilhos do pórtico */
function MesaCNC({ m }: { m: Mats }) {
  return (
    <group>
      <Quadro x={CNC.x} L={CNC.L} pernas={4} m={m} />
      <Tampo x={CNC.x} L={CNC.L} placas={1} correias={[-1.1, -0.55, 0, 0.55, 1.1]} m={m} />
      <Chapa size={[0.8, 0.34, P - 0.8]} position={[CNC.x, 0.55, 0]} material={m.branco} linha={LINHA} />
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[CNC.x, MESA + 0.01, sz * (P / 2 + 0.06)]} material={m.inox}>
          <boxGeometry args={[CNC.L, 0.03, 0.05]} />
        </mesh>
      ))}
      {/* grampos pretos nas laterais */}
      {[-1, 1].flatMap((sz) =>
        Array.from({ length: 15 }, (_, i) => (
          <mesh key={`${sz}${i}`} position={[CNC.x - CNC.L / 2 + 0.3 + i * 0.29, MESA - 0.12, sz * (P / 2 + 0.035)]} material={m.preto}>
            <boxGeometry args={[0.05, 0.08, 0.05]} />
          </mesh>
        ))
      )}
    </group>
  )
}

/** Console em pé entre a mesa de destaque e a mesa CNC, com monitor inclinado, teclado e cabos */
function Console({ m }: { m: Mats }) {
  const cabos = useMemo(
    () =>
      [0, 0.06].map(
        (d) =>
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(
              [[-2.45, 0.3, P / 2 + 0.3 - d], [-2.35, 0.03, P / 2 + 0.1 - d], [-2.25, 0.05, P / 2 - 0.1 - d], [-2.15, 0.4, P / 2 - 0.2 - d]].map(
                (p) => new THREE.Vector3(...p)
              )
            ),
            32,
            0.018,
            8,
            false
          )
      ),
    []
  )
  return (
    <group>
      <group position={[-2.5, 0, P / 2 + 0.48]}>
        <Chapa size={[0.56, 1.1, 0.42]} position={[0, 0.55, 0]} material={m.branco} linha={LINHA} />
        {/* grade de ventilação */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[0, 0.2 + i * 0.035, 0.211]} material={m.grafite}>
            <planeGeometry args={[0.3, 0.012]} />
          </mesh>
        ))}
        <mesh position={[0, 1.13, 0.24]} material={m.grafite}>
          <boxGeometry args={[0.46, 0.03, 0.14]} />
        </mesh>
        <group position={[0, 1.4, 0.02]} rotation-x={-0.22}>
          <Chapa size={[0.56, 0.42, 0.14]} position={[0, 0, 0]} material={m.branco} linha={LINHA} />
          <mesh position={[0, 0.01, 0.071]} material={m.tela}>
            <planeGeometry args={[0.44, 0.3]} />
          </mesh>
        </group>
      </group>
      {cabos.map((g, i) => (
        <mesh key={i} geometry={g} material={m.preto} />
      ))}
    </group>
  )
}

/** Carregadora: moldura, eixos com rodas vermelhas onde a chapa rola, eixo dos braços e quadro elétrico bege */
function Carga({ m }: { m: Mats }) {
  const { x, L } = CARGA
  const eixos = [-1.15, -0.7, -0.25, 0.2, 0.65, 1.1]
  const rodas = useMemo(() => {
    const xs: number[] = []
    for (let px = x - L / 2 + 0.2; px < x + L / 2 - 0.1; px += 0.19) if (BRACOS.every((b) => Math.abs(b - px) > 0.14)) xs.push(px)
    return xs
  }, [x, L])
  return (
    <group>
      <Quadro x={x} L={L} pernas={4} m={m} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x, MESA - 0.1, s * (P / 2 - 0.04)]} material={m.branco} castShadow>
          <boxGeometry args={[L, 0.12, 0.08]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`t${s}`} position={[x + s * (L / 2 - 0.04), MESA - 0.1, 0]} material={m.branco}>
          <boxGeometry args={[0.08, 0.12, P]} />
        </mesh>
      ))}
      {eixos.map((z) => (
        <group key={z}>
          <mesh position={[x, MESA - 0.07, z]} rotation-z={Math.PI / 2} material={m.inox}>
            <cylinderGeometry args={[0.014, 0.014, L - 0.1, 8]} />
          </mesh>
          {rodas.map((px) => (
            <mesh key={px} position={[px, MESA - 0.07, z]} rotation-z={Math.PI / 2} material={m.vermelho} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.06, 18]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* mancais do eixo dos braços, na frente */}
      {BRACOS.map((bx) => (
        <mesh key={bx} position={[bx, PIVO.y / 2, PIVO.z]} material={m.alu} castShadow>
          <boxGeometry args={[0.08, PIVO.y, 0.08]} />
        </mesh>
      ))}
      <mesh position={[x, PIVO.y, PIVO.z]} rotation-z={Math.PI / 2} material={m.inox}>
        <cylinderGeometry args={[0.035, 0.035, L - 0.3, 16]} />
      </mesh>
      {/* quadro elétrico na ponta, com o motor do basculamento embaixo */}
      <Chapa size={[0.4, 0.9, 1.3]} position={[x + L / 2 + 0.22, 0.6, 0]} material={m.bege} linha={LINHA} />
      <group position={[x + L / 2 + 0.421, 0.82, 0.25]} rotation-y={Math.PI / 2}>
        <mesh rotation-z={Math.PI / 2} material={m.amarelo}>
          <circleGeometry args={[0.07, 3]} />
        </mesh>
      </group>
      {[-0.3, -0.12].map((dz) => (
        <mesh key={dz} position={[x + L / 2 + 0.421, 0.95, dz]} rotation-y={Math.PI / 2} material={m.vermelho}>
          <circleGeometry args={[0.025, 16]} />
        </mesh>
      ))}
      <mesh position={[x + L / 2 - 0.35, 0.3, -0.4]} rotation-z={Math.PI / 2} material={m.grafite} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.36, 20]} />
      </mesh>
    </group>
  )
}

/** Um braço, no sistema do eixo: deitado aponta para -z (sobre a carregadora), ventosas pretas viradas para +y */
function Braco({ x, m }: { x: number; m: Mats }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0, -1.55]} material={m.alu} castShadow>
        <boxGeometry args={[0.1, 0.1, 2.9]} />
        <Edges color={LINHA} threshold={15} />
      </mesh>
      <mesh position={[0, -0.13, -1.2]} material={m.alu} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.8]} />
      </mesh>
      {[-0.4, -1.2, -2.0].map((z) => (
        <mesh key={z} position={[0, -0.065, z]} material={m.alu}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
        </mesh>
      ))}
      {VENTOSAS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.075, 0]} material={m.inox}>
            <cylinderGeometry args={[0.014, 0.014, 0.05, 8]} />
          </mesh>
          <mesh position={[0, 0.11, 0]} material={m.preto} castShadow>
            <cylinderGeometry args={[0.09, 0.06, 0.03, 24]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const CICLO = DESTAQUE0 + DESTACA + 2

/**
 * Ciclo: chapa aparece nos braços em pé, eles deitam e a pousam na carregadora, voltam a levantar enquanto a chapa
 * rola até a mesa CNC, o pórtico risca, a chapa vai para a mesa de destaque e as peças se separam.
 * Com `tempo` (jornada de scroll) o ciclo segue esse valor em vez do relógio e a máquina não balança.
 */
export function Linha({ animado, tempo: externo }: { animado: boolean; tempo?: () => number }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const eixo = useRef<THREE.Group>(null)
  const vidroBraco = useRef<THREE.Mesh>(null)
  const vidro = useRef<THREE.Group>(null)
  const inteira = useRef<THREE.Group>(null)
  const pecas = useRef<(THREE.Mesh | null)[]>([])
  const pos = useMemo<PosCorte>(() => ({ x: CASA[0], z: CASA[1], cortando: false }), [])
  const feitos = useMemo(() => CORTES.map(() => 0), [])
  const braco = useVidro(OPACO)
  const linha = useVidro(OPACO)

  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    const r = externo ? externo() : animado ? tempo % CICLO : CORTE0 + 4.5
    let a = EM_PE
    if (r >= 0.8 && r < 3.3) a = EM_PE * (1 - suave(faixa(r, 0.8, 3.3)))
    else if (r >= 3.3 && r < 3.6) a = 0
    else if (r >= 3.6 && r < 5.6) a = EM_PE * suave(faixa(r, 3.6, 5.6))
    if (eixo.current) eixo.current.rotation.x = a

    const noBraco = r < 3.45
    braco.vidro.opacity = OPACO * faixa(r, 0, 0.8)
    if (vidroBraco.current) vidroBraco.current.visible = noBraco

    let gx = CARGA.x + (CNC.x - CARGA.x) * suave(faixa(r, 3.8, 3.8 + ROLA))
    if (r >= FIM) gx = CNC.x + (DESTAQUE.x - CNC.x) * suave(faixa(r, FIM, FIM + ROLA))
    const op = 1 - faixa(r, DESTAQUE0 + DESTACA + 0.4, DESTAQUE0 + DESTACA + 1.2)
    linha.vidro.opacity = OPACO * op
    linha.risco.opacity = op
    if (vidro.current) {
      vidro.current.visible = !noBraco && op > 0.001
      vidro.current.position.x = gx
    }
    // destaque: a chapa inteira dá lugar às peças, que se afastam umas das outras
    const d = suave(faixa(r, DESTAQUE0, DESTAQUE0 + DESTACA))
    if (inteira.current) inteira.current.visible = d === 0
    PECAS.forEach(([cx, cz], i) => {
      const pc = pecas.current[i]
      if (!pc) return
      pc.visible = d > 0
      pc.position.set(cx * (1 + 0.06 * d), 0, cz * (1 + 0.12 * d))
    })

    if (r < CORTE0) {
      feitos.fill(0)
      Object.assign(pos, { x: CASA[0], z: CASA[1], cortando: false })
    } else Object.assign(pos, PLANO.em(r - CORTE0, feitos))

    if (animado && !externo && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.25) * 0.15
  })

  return (
    <group ref={rig}>
      <Quadro x={DESTAQUE.x} L={DESTAQUE.L} pernas={3} m={m} />
      <Tampo x={DESTAQUE.x} L={DESTAQUE.L} placas={3} m={m} />
      <MesaCNC m={m} />
      <Console m={m} />
      <Carga m={m} />
      <group ref={eixo} position={PIVO}>
        {BRACOS.map((x) => (
          <Braco key={x} x={x} m={m} />
        ))}
        <mesh ref={vidroBraco} position={[CARGA.x, 0.129, -P / 2 - 0.06]} material={braco.vidro}>
          <boxGeometry args={[VIDRO[0], 0.008, VIDRO[1]]} />
          <Edges color="#7fd6ff" />
        </mesh>
      </group>
      <group ref={vidro} position={[CARGA.x, MESA + 0.006, 0]} visible={false}>
        <group ref={inteira}>
          <mesh material={linha.vidro}>
            <boxGeometry args={[VIDRO[0], 0.008, VIDRO[1]]} />
            <Edges color="#7fd6ff" />
          </mesh>
          <Riscos cortes={CORTES} feitos={feitos} y={0.0055} material={linha.risco} />
        </group>
        {PECAS.map(([cx, cz, w, dz], i) => (
          <mesh key={i} ref={(el) => void (pecas.current[i] = el)} position={[cx, 0, cz]} material={linha.vidro} visible={false}>
            <boxGeometry args={[w - 0.01, 0.008, dz - 0.01]} />
            <Edges color="#7fd6ff" />
          </mesh>
        ))}
      </group>
      <Portico m={m} P={P} mesa={MESA} pos={pos} x0={CNC.x} />
    </group>
  )
}

const ALVO = new THREE.Vector3(0.4, 1.0, 0)
const RAIO = 6.9 // da ponta da mesa de destaque até o quadro elétrico e os braços em pé
const DIRECAO = new THREE.Vector3(-1.6, 3.4, 8) // de frente, um pouco pela esquerda, com o console em primeiro plano

/** Linha de corte Jumbo em 3D: carrega, risca e manda a chapa para o destaque */
export default function LinhaCorteJumbo({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da linha de corte automática 4200 / 6100 mm")} alvo={ALVO} raio={RAIO} direcao={DIRECAO} sombra={16}>
      {(animado) => <Linha animado={animado} />}
    </Vitrine>
  )
}
