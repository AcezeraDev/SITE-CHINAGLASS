import { useRef, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { Mesa } from "@/three/MesaCorteCNC"

/*
 * Ferramenta de desenvolvimento (só no `npm run dev`, em /exportar-ar.html): monta cada máquina como no site,
 * converte para GLB e grava em public/modelos/, de onde a realidade aumentada carrega.
 * Os modelos já estão em metros (1 unidade = 1 m), então aparecem no tamanho real no chão da fábrica.
 */

const MODELOS: Record<string, () => ReactNode> = {
  "mesa-corte-cnc": () => <Mesa animado={false} />,
}

/**
 * Deixa só o que os visualizadores de realidade aumentada do celular entendem: tira contornos,
 * peças escondidas e transforma as peças repetidas por instância (esteira porta-cabos) em malhas comuns.
 */
function prepararParaAR(raiz: THREE.Object3D) {
  const copia = raiz.clone(true)
  const remover: THREE.Object3D[] = []
  const instancias: THREE.InstancedMesh[] = []
  copia.traverse((o) => {
    // contornos do drei (<Edges>) são malhas de "linha grossa" com material de shader, que o GLB não representa
    const shader = o instanceof THREE.Mesh && o.material instanceof THREE.ShaderMaterial
    if (!o.visible || o instanceof THREE.Line || o instanceof THREE.Points || shader) remover.push(o)
    else if (o instanceof THREE.InstancedMesh) instancias.push(o)
  })
  remover.forEach((o) => o.removeFromParent())

  const m = new THREE.Matrix4()
  for (const im of instancias) {
    const partes = Array.from({ length: im.count }, (_, i) => {
      im.getMatrixAt(i, m)
      return im.geometry.clone().applyMatrix4(m)
    })
    const malha = new THREE.Mesh(mergeGeometries(partes), im.material)
    malha.position.copy(im.position)
    malha.quaternion.copy(im.quaternion)
    malha.scale.copy(im.scale)
    im.parent?.add(malha)
    im.removeFromParent()
  }
  return copia
}

async function exportar(nome: string, raiz: THREE.Object3D) {
  const glb = (await new GLTFExporter().parseAsync(prepararParaAR(raiz), { binary: true, maxTextureSize: 1024 })) as ArrayBuffer
  const r = await fetch(`/__salvar-modelo?nome=${nome}`, { method: "POST", body: glb })
  if (!r.ok) throw new Error(`falha ao gravar ${nome}`)
  return Number(await r.text())
}

/**
 * Espera alguns quadros (a esteira se posiciona no useFrame) e exporta. Só roda pelo botão: gravar em public/
 * faz o Vite recarregar a página, e uma exportação automática viraria um ciclo.
 */
function Exportador({ nome, aoTerminar }: { nome: string; aoTerminar: (msg: string) => void }) {
  const grupo = useRef<THREE.Group>(null)
  const quadros = useRef(0)
  useFrame(() => {
    quadros.current++
    if (quadros.current !== 5 || !grupo.current) return
    exportar(nome, grupo.current)
      .then((bytes) => aoTerminar(`${nome}: ${(bytes / 1024).toFixed(0)} KB gravados em public/modelos/${nome}.glb`))
      .catch((e) => aoTerminar(`${nome}: erro ${e}`))
  })
  return <group ref={grupo}>{MODELOS[nome]()}</group>
}

function Pagina() {
  const [log, setLog] = useState<string[]>([])
  const [rodando, setRodando] = useState(false)
  return (
    <div style={{ fontFamily: "monospace", padding: 16 }}>
      <h1>Exportar modelos para realidade aumentada</h1>
      <button id="exportar" onClick={() => setRodando(true)} disabled={rodando}>
        Exportar {Object.keys(MODELOS).length} modelo(s)
      </button>
      <pre id="log">{log.join("\n")}</pre>
      <div style={{ width: 320, height: 240 }}>
        {rodando && (
          <Canvas frameloop="always">
            {Object.keys(MODELOS).map((nome) => (
              <Exportador key={nome} nome={nome} aoTerminar={(msg) => setLog((l) => [...l, msg])} />
            ))}
          </Canvas>
        )}
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<Pagina />)
