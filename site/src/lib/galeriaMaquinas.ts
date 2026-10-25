import { CAPAS_MAQUINAS } from "@/capasMaquinas"
import { FOTOS_EXTRAS_MAQUINAS } from "@/fotosExtrasMaquinas"
import type { MaquinaCatalogo } from "@/maquinasData"

// Imagens de descrição que repetem uma foto da galeria, inclusive em outra compressão.
// Conferidas visualmente; os arquivos de origem permanecem preservados.
const REPETIDAS = new Set([
  "/img/maquinas/397708527-d0.webp",
  "/img/maquinas/344423780-d0.webp",
  "/img/maquinas/355640119-d0.webp",
  "/img/maquinas/277831702-d0.webp",
  "/img/maquinas/277831702-d1.webp",
  "/img/maquinas/91095488-d0.webp",
  "/img/maquinas/81791287-d0.webp",
  "/img/maquinas/34607218-d0.webp",
  "/img/maquinas/278452532-d0.webp",
  "/img/maquinas/398723570-d0.webp",
  "/img/maquinas/237682619-d0.webp",
])

export function fotosDaMaquina(m: Pick<MaquinaCatalogo, "id" | "imgs">): string[] {
  const capa = CAPAS_MAQUINAS[m.id]
  // A imagem de estúdio substitui a foto usada como referência, em vez de duplicá-la.
  const fotos = capa ? [capa, ...m.imgs.slice(1)] : m.imgs
  const extras = FOTOS_EXTRAS_MAQUINAS[m.id] ?? []
  return [...new Set([...fotos.filter((src) => !REPETIDAS.has(src)), ...extras])]
}

export function imagemDeEstudio(src: string | undefined): boolean {
  return Boolean(src?.startsWith("/img/maquinas/capas/") || src?.startsWith("/img/maquinas/detalhes/"))
}
