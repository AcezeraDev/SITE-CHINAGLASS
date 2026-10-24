import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { t } from "@/i18n"
import { faixa, OFF, planoDeCorte, Portico, Riscos, suave, useVidro, type PosCorte, type Risco } from "./Corte"
import { Esteira } from "./Esteira"
import { Chapa, Vitrine } from "./Vitrine"

/*
 * Mesa de corte CNC 3 em 1 (3660 mm) com mesa auxiliar opcional, modelada a partir das 6 vistas de referência.
 * 1 unidade = 1 m. A mesa corre ao longo de x: mesa auxiliar em -x, pórtico no começo da mesa e três braços de
 * ventosas na ponta +x, que giram num eixo junto à borda e deitam a chapa sobre o feltro. Frente em +z.
 * Carrega, risca e manda a chapa para a mesa auxiliar destacar: as três funções numa máquina só.
 */

const L = 4.0 // comprimento do tampo
const P = 2.7 // largura do tampo
const MESA = 0.9
const LINHA = "#9aa3b2"
const AUX = { x: -3.45, L: 2.4, P: 2.4 }
const BRACOS = [-0.85, 0, 0.85]
const VENTOSAS = [-0.4, -1.1, -1.8, -2.5]
const PIVO = new THREE.Vector3(L / 2 + 0.1, MESA - 0.16, 0) // eixo dos braços, na ponta da mesa
const EM_PE = 1.95 // braços levantados (rad), inclinados para fora como na foto
const VIDRO: [number, number] = [3.6, 2.3]
const OPACO = 0.3

type Mats = ReturnType<typeof useMats>

function useMats() {
  return useMemo(
    () => ({
      branco: new THREE.MeshStandardMaterial({ color: "#e8ebf0", metalness: 0.25, roughness: 0.45 }),
      alu: new THREE.MeshStandardMaterial({ color: "#d3d9e1", metalness: 0.85, roughness: 0.3 }),
      grafite: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.5, roughness: 0.45 }),
      preto: new THREE.MeshStandardMaterial({ color: "#16181d", metalness: 0.45, roughness: 0.35 }),
      feltro: new THREE.MeshStandardMaterial({ color: "#2a2d33", roughness: 0.95 }),
      verde: new THREE.MeshStandardMaterial({ color: "#1fc47a", emissive: "#0d8a50", emissiveIntensity: 0.35, roughness: 0.5 }),
      azul: new THREE.MeshStandardMaterial({ color: "#1f6fd0", metalness: 0.35, roughness: 0.35 }),
      amarelo: new THREE.MeshStandardMaterial({ color: "#f5c518", roughness: 0.5 }),
      inox: new THREE.MeshStandardMaterial({ color: "#dfe5ee", metalness: 0.95, roughness: 0.18 }),
      vermelho: new THREE.MeshStandardMaterial({ color: "#e0262f", metalness: 0.1, roughness: 0.35 }),
      borracha: new THREE.MeshStandardMaterial({ color: "#8f1118", roughness: 0.6 }),
      tela: new THREE.MeshStandardMaterial({ color: "#0a2a4a", emissive: "#3a8bff", emissiveIntensity: 0.35, roughness: 0.15 }),
    }),
    []
  )
}

/** Teclado do console: teclas claras em grade */
function useTeclado() {
  return useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 256
    c.height = 96
    const g = c.getContext("2d")!
    g.fillStyle = "#2a2e35"
    g.fillRect(0, 0, 256, 96)
    g.fillStyle = "#c9ced6"
    for (let i = 0; i < 14; i++) for (let j = 0; j < 4; j++) g.fillRect(8 + i * 17.5, 10 + j * 20, 13, 14)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Mesa principal: base preta, tampo de alumínio, feltro em placas com correias verdes e trilhos do pórtico */
function Mesa({ m }: { m: Mats }) {
  const pernasX = [-1.75, -0.6, 0.6, 1.75]
  const zs = [-1, 1].map((s) => s * (P / 2 - 0.2))
  return (
    <group>
      {pernasX.flatMap((x) =>
        zs.map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.46, 0]} material={m.grafite} castShadow>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
            </mesh>
            <mesh position={[0, 0.03, 0]} material={m.preto}>
              <cylinderGeometry args={[0.06, 0.07, 0.06, 14]} />
            </mesh>
          </group>
        ))
      )}
      {zs.flatMap((z) =>
        [0.12, MESA - 0.16].map((y) => (
          <mesh key={`${z}${y}`} position={[0, y, z]} material={y < 0.5 ? m.branco : m.grafite} castShadow>
            <boxGeometry args={[L - 0.2, 0.1, 0.1]} />
          </mesh>
        ))
      )}
      {pernasX.map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} material={m.branco}>
          <boxGeometry args={[0.09, 0.09, P - 0.4]} />
        </mesh>
      ))}
      <mesh position={[0, MESA - 0.05, 0]} material={m.alu} castShadow receiveShadow>
        <boxGeometry args={[L, 0.1, P]} />
      </mesh>
      <mesh position={[0, MESA + 0.001, 0]} rotation-x={-Math.PI / 2} material={m.feltro} receiveShadow>
        <planeGeometry args={[L - 0.08, P - 0.08]} />
      </mesh>
      {[-L / 6, L / 6].map((x) => (
        <mesh key={x} position={[x, MESA + 0.002, 0]} material={m.grafite}>
          <boxGeometry args={[0.012, 0.003, P - 0.08]} />
        </mesh>
      ))}
      <mesh position={[0, MESA + 0.002, 0]} material={m.grafite}>
        <boxGeometry args={[L - 0.08, 0.003, 0.012]} />
      </mesh>
      {[-0.95, -0.45, 0.45, 0.95].map((z) => (
        <mesh key={z} position={[0, MESA + 0.0025, z]} material={m.verde}>
          <boxGeometry args={[L - 0.1, 0.003, 0.025]} />
        </mesh>
      ))}
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, MESA + 0.01, sz * (P / 2 + 0.06)]} material={m.inox}>
          <boxGeometry args={[L, 0.03, 0.05]} />
        </mesh>
      ))}
      {/* motores azuis embaixo, atrás, na ponta dos braços */}
      {[-1].map((sz) => (
        <group key={sz} position={[L / 2 - 0.25, 0.14, sz * (P / 2 - 0.05)]}>
          <mesh rotation-x={Math.PI / 2} material={m.azul} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.26, 18]} />
          </mesh>
          <mesh position={[0, 0, -sz * 0.18]} material={m.azul}>
            <boxGeometry args={[0.16, 0.16, 0.12]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Mesa auxiliar de destaque: estrutura branca com rodízios e feltro em quatro placas */
function Auxiliar({ m }: { m: Mats }) {
  const { x, L: la, P: pa } = AUX
  const cantos = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (la / 2 - 0.08), sz * (pa / 2 - 0.08)] as const))
  return (
    <group position={[x, 0, 0]}>
      {cantos.map(([cx, cz]) => (
        <group key={`${cx}${cz}`} position={[cx, 0, cz]}>
          <mesh position={[0, 0.5, 0]} material={m.branco} castShadow>
            <boxGeometry args={[0.07, 0.72, 0.07]} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation-z={Math.PI / 2} material={m.grafite}>
            <cylinderGeometry args={[0.05, 0.05, 0.035, 16]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={m.grafite}>
            <boxGeometry args={[0.06, 0.04, 0.06]} />
          </mesh>
        </group>
      ))}
      {[0.2, MESA - 0.14].flatMap((y) =>
        [-1, 1].map((s) => (
          <group key={`${y}${s}`}>
            <mesh position={[0, y, s * (pa / 2 - 0.08)]} material={m.branco}>
              <boxGeometry args={[la - 0.1, 0.06, 0.06]} />
            </mesh>
            <mesh position={[s * (la / 2 - 0.08), y, 0]} material={m.branco}>
              <boxGeometry args={[0.06, 0.06, pa - 0.1]} />
            </mesh>
          </group>
        ))
      )}
      <mesh position={[0, MESA - 0.05, 0]} material={m.branco} castShadow receiveShadow>
        <boxGeometry args={[la, 0.1, pa]} />
      </mesh>
      <mesh position={[0, MESA + 0.001, 0]} rotation-x={-Math.PI / 2} material={m.feltro} receiveShadow>
        <planeGeometry args={[la - 0.06, pa - 0.06]} />
      </mesh>
      <mesh position={[0, MESA + 0.002, 0]} material={m.branco}>
        <boxGeometry args={[0.02, 0.003, pa - 0.06]} />
      </mesh>
      <mesh position={[0, MESA + 0.002, 0]} material={m.branco}>
        <boxGeometry args={[la - 0.06, 0.003, 0.02]} />
      </mesh>
    </group>
  )
}

/** Console na quina da frente, entre a mesa auxiliar e o pórtico: monitor, botoeira e teclado */
function Console({ m }: { m: Mats }) {
  const teclado = useTeclado()
  return (
    <group position={[-2.15, 0, P / 2 + 0.25]} rotation-y={0.25}>
      <mesh position={[0, 0.5, 0]} material={m.branco} castShadow>
        <boxGeometry args={[0.12, 1.0, 0.12]} />
      </mesh>
      <group position={[0, 1.15, 0]} rotation-x={-0.25}>
        <Chapa size={[0.62, 0.42, 0.12]} position={[0, 0, 0]} material={m.branco} linha={LINHA} />
        <mesh position={[-0.1, 0.01, 0.061]} material={m.tela}>
          <planeGeometry args={[0.36, 0.28]} />
        </mesh>
        {[0, 1, 2].flatMap((i) =>
          [0, 1, 2].map((j) => (
            <mesh key={`${i}${j}`} position={[0.15 + i * 0.045, 0.1 - j * 0.06, 0.062]} material={j === 0 && i === 2 ? m.vermelho : m.grafite}>
              <circleGeometry args={[0.014, 12]} />
            </mesh>
          ))
        )}
      </group>
      <mesh position={[0, 0.88, 0.16]} rotation-x={-1.2}>
        <planeGeometry args={[0.5, 0.18]} />
        <meshStandardMaterial map={teclado} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.86, 0.12]} rotation-x={-1.2} material={m.grafite}>
        <boxGeometry args={[0.54, 0.22, 0.02]} />
      </mesh>
    </group>
  )
}

/** Mancais e eixo dos três braços na ponta da mesa */
function Eixo({ m }: { m: Mats }) {
  return (
    <group>
      {BRACOS.map((z) => (
        <group key={z}>
          {[-0.09, 0.09].map((dz) => (
            <mesh key={dz} position={[PIVO.x, PIVO.y / 2, z + dz]} material={m.grafite} castShadow>
              <boxGeometry args={[0.07, PIVO.y, 0.05]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[PIVO.x, PIVO.y, 0]} rotation-x={Math.PI / 2} material={m.inox}>
        <cylinderGeometry args={[0.035, 0.035, P - 0.2, 16]} />
      </mesh>
    </group>
  )
}

/** Um braço, no sistema do eixo: deitado aponta para -x (sobre a mesa), ventosas vermelhas viradas para +y */
function Braco({ z, m }: { z: number; m: Mats }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-1.45, 0, 0]} material={m.branco} castShadow>
        <boxGeometry args={[2.9, 0.09, 0.09]} />
        <Edges color={LINHA} threshold={15} />
      </mesh>
      <mesh position={[-1.2, -0.16, 0]} material={m.preto} castShadow>
        <boxGeometry args={[1.9, 0.06, 0.06]} />
      </mesh>
      {[-0.3, -1.2, -2.1].map((x) => (
        <mesh key={x} position={[x, -0.08, 0]} material={m.preto}>
          <boxGeometry args={[0.05, 0.12, 0.05]} />
        </mesh>
      ))}
      {VENTOSAS.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.085, 0]} material={m.inox}>
            <cylinderGeometry args={[0.016, 0.016, 0.08, 10]} />
          </mesh>
          <mesh position={[0, 0.14, 0]} material={m.vermelho} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.04, 28]} />
          </mesh>
          <mesh position={[0, 0.1605, 0]} rotation-x={-Math.PI / 2} material={m.borracha}>
            <ringGeometry args={[0.04, 0.085, 28]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// riscos no sistema da chapa: dois transversais e dois longitudinais
const CORTES: Risco[] = [
  [-0.75, -1.1, -0.75, 1.1],
  [0.45, 1.1, 0.45, -1.1],
  [1.75, 0.35, -1.75, 0.35],
  [-1.75, -0.45, 1.75, -0.45],
]
const CASA: [number, number] = [-1.95, -1.3]
const PLANO = planoDeCorte(CORTES, CASA)
const CORTE0 = 4.4
const FIM = CORTE0 + PLANO.duracao
const ROLA = 2
const CICLO = FIM + ROLA + 1.5

/**
 * Ciclo: chapa aparece nos braços em pé, eles deitam e a pousam no feltro, voltam a levantar, o pórtico risca
 * e as correias levam a chapa para a mesa auxiliar.
 */
function Maquina({ animado }: { animado: boolean }) {
  const m = useMats()
  const rig = useRef<THREE.Group>(null)
  const eixo = useRef<THREE.Group>(null)
  const vidroBraco = useRef<THREE.Mesh>(null)
  const vidro = useRef<THREE.Group>(null)
  const pos = useMemo<PosCorte>(() => ({ x: CASA[0], z: CASA[1], cortando: false }), [])
  const feitos = useMemo(() => CORTES.map(() => 0), [])
  const braco = useVidro(OPACO)
  const mesa = useVidro(OPACO)

  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime
    const r = animado ? tempo % CICLO : CORTE0 + 4.5
    let a = EM_PE
    if (r >= 0.8 && r < 3.4) a = EM_PE * (1 - suave(faixa(r, 0.8, 3.4)))
    else if (r >= 3.4 && r < 3.7) a = 0
    else if (r >= 3.7 && r < 6.2) a = EM_PE * suave(faixa(r, 3.7, 6.2))
    if (eixo.current) eixo.current.rotation.z = -a

    const noBraco = r < 3.55
    braco.vidro.opacity = OPACO * faixa(r, 0, 0.8)
    if (vidroBraco.current) vidroBraco.current.visible = noBraco

    const op = 1 - faixa(r, FIM + ROLA, FIM + ROLA + 0.8)
    mesa.vidro.opacity = OPACO * op
    mesa.risco.opacity = op
    if (vidro.current) {
      vidro.current.visible = !noBraco && op > 0.001
      vidro.current.position.x = AUX.x * suave(faixa(r, FIM, FIM + ROLA))
    }

    if (r < CORTE0) {
      feitos.fill(0)
      Object.assign(pos, { x: CASA[0], z: CASA[1], cortando: false })
    } else Object.assign(pos, PLANO.em(r - CORTE0, feitos))

    if (animado && rig.current) rig.current.rotation.y = Math.sin(tempo * 0.3) * 0.22
  })

  return (
    <group ref={rig}>
      <Mesa m={m} />
      <Auxiliar m={m} />
      <Console m={m} />
      <Eixo m={m} />
      {/* esteira porta-cabos no chão, na frente, puxada pelo pórtico */}
      <Esteira
        m={m}
        origem={[0, 0.06, P / 2 - 0.02]}
        s={[1, 0, 0]}
        h={[0, 1, 0]}
        w={[0, 0, 1]}
        s0={-L / 2 - 0.1}
        ponta={() => pos.x - OFF + 0.08}
        comprimento={4.4}
        raio={0.12}
        lado={1}
      />
      <group ref={eixo} position={PIVO}>
        {BRACOS.map((z) => (
          <Braco key={z} z={z} m={m} />
        ))}
        <mesh ref={vidroBraco} position={[-PIVO.x, 0.167, 0]} material={braco.vidro}>
          <boxGeometry args={[VIDRO[0], 0.008, VIDRO[1]]} />
          <Edges color="#7fd6ff" />
        </mesh>
      </group>
      <group ref={vidro} position={[0, MESA + 0.006, 0]} visible={false}>
        <mesh material={mesa.vidro}>
          <boxGeometry args={[VIDRO[0], 0.008, VIDRO[1]]} />
          <Edges color="#7fd6ff" />
        </mesh>
        <Riscos cortes={CORTES} feitos={feitos} y={0.0055} material={mesa.risco} />
      </group>
      <Portico m={m} P={P} mesa={MESA} pos={pos} />
    </group>
  )
}

const ALVO = new THREE.Vector3(-0.6, 1.0, 0)
const RAIO = 4.6 // da ponta da mesa auxiliar até as ventosas dos braços em pé
const DIRECAO = new THREE.Vector3(-2.4, 3.6, 7.5) // de frente pela esquerda, com o console, o pórtico e os braços à vista, como na perspectiva

/** Mesa de corte CNC 3 em 1 em 3D: carrega com os braços, risca e destaca na mesa auxiliar */
export default function Corte3em1({ className }: { className?: string }) {
  return (
    <Vitrine className={className} label={t("Modelo 3D da mesa de corte CNC 3 em 1 (3660 mm)")} alvo={ALVO} raio={RAIO} direcao={DIRECAO}>
      {(animado) => <Maquina animado={animado} />}
    </Vitrine>
  )
}
