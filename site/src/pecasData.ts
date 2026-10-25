// Peças de reposição do catálogo de chinaglass.com.br (ver ../chinaglass/dados/produtos.json)
import { EMPRESA } from "@/data"

export type Maquina = "Lapidadora" | "Biseladora"

export type Peca = {
  id: string
  codigo: string
  nome: string
  maquina: Maquina
  img: string
  /** Imagem de estúdio gerada por IA e aprovada; a foto original continua em img. */
  capa?: string
  descricao: string
  specs: [string, string][]
  url: string
}

const P = (slug: string) => `${EMPRESA.site}/${slug}`

export const PECAS_CATALOGO: Peca[] = [
  {
    id: "34607747",
    codigo: "Bomba-Lapidadora",
    nome: "Bomba d’água para lapidadora",
    maquina: "Lapidadora",
    img: "/img/pecas/bomba-agua-cut.webp",
    capa: "/img/pecas/bomba-agua-capa-v2.webp",
    descricao: "Bomba d’água para lapidadora chinesa, usada na lapidadora 9 rebolos China Glass.",
    specs: [["Potência", "200 W"], ["Vazão", "100 L/min"], ["Tensão", "380 V"], ["Frequência", "60 Hz"]],
    url: P("bomba-de-agua-lapidadora-chinesa-lapidadora-china-glass"),
  },
  {
    id: "34607867",
    codigo: "Correia-lapidadora-chinesa",
    nome: "Correia para lapidadora 9 rebolos",
    maquina: "Lapidadora",
    img: "/img/pecas/correia-cut.webp",
    capa: "/img/pecas/correia-capa-v2.webp",
    descricao: "Correia para lapidadora chinesa de 9 rebolos.",
    specs: [["Aplicação", "Lapidadora 9 rebolos"]],
    url: P("correia-lapidadora-chinesa-9-rebolos"),
  },
  {
    id: "34607434",
    codigo: "Corrente-lapidadora",
    nome: "Corrente para lapidadora",
    maquina: "Lapidadora",
    img: "/img/pecas/corrente-cut.webp",
    capa: "/img/pecas/corrente-capa-v2.webp",
    descricao: "Corrente para lapidadora chinesa, China Glass e outras marcas.",
    specs: [["Aplicação", "Lapidadoras chinesas"]],
    url: P("corrente-para-lapidadora-chinesa"),
  },
  {
    id: "34607827",
    codigo: "Amperimetro-Lapidadora",
    nome: "Amperímetro para lapidadora",
    maquina: "Lapidadora",
    img: "/img/pecas/amperimetro-cut.webp",
    capa: "/img/pecas/amperimetro-capa-v3.webp",
    descricao: "Amperímetro de painel para lapidadora chinesa.",
    specs: [["Aplicação", "Painel da lapidadora"]],
    url: P("amperimetro-lapidadora-chinesa"),
  },
  {
    id: "34607582",
    codigo: "coifa-lapidadora",
    nome: "Coifa para lapidadora",
    maquina: "Lapidadora",
    img: "/img/pecas/coifa-lapidadora-cut.webp",
    capa: "/img/pecas/coifa-lapidadora-capa-v2.webp",
    descricao: "Coifa para lapidadora chinesa.",
    specs: [["Aplicação", "Lapidadoras chinesas"]],
    url: P("coifa-lapidadora-chinesa"),
  },
  {
    id: "34607701",
    codigo: "coifa-lapidadora-chinesa",
    nome: "Coifa para lapidadora 100 mm",
    maquina: "Lapidadora",
    img: "/img/pecas/coifa-lapidadora-100-cut.webp",
    capa: "/img/pecas/coifa-lapidadora-100-capa-v2.webp",
    descricao: "Coifa para lapidadora chinesa, medida de 100 mm.",
    specs: [["Medida", "100 mm"]],
    url: P("coifa-lapidadora-chinesa-100mm"),
  },
  {
    id: "34607720",
    codigo: "Coifa-Biseladora",
    nome: "Coifa para biseladora",
    maquina: "Biseladora",
    img: "/img/pecas/coifa-biseladora-cut.webp",
    capa: "/img/pecas/coifa-biseladora-capa-v2.webp",
    descricao: "Coifa para biseladora chinesa e biseladora China Glass.",
    specs: [["Aplicação", "Biseladoras chinesas"]],
    url: P("coifa-biseladora-chinesa-biseladora-china-glass"),
  },
  {
    id: "34607552",
    codigo: "escova-biseladora",
    nome: "Escova para biseladora 100 mm",
    maquina: "Biseladora",
    img: "/img/pecas/escova-biseladora-cut.webp",
    capa: "/img/pecas/escova-biseladora-capa-v2.webp",
    descricao: "Escova para biseladora China Glass, medida de 100 mm.",
    specs: [["Medida", "100 mm"]],
    url: P("escova-biseladora-100mm"),
  },
]

/** Linhas de peças que aparecem nos banners do site, sem produtos cadastrados: cotação sob consulta */
export const PECAS_SOB_CONSULTA = [
  { nome: "Peças para mesas de corte", img: "/img/pecas-mesa-corte.webp" },
  { nome: "Peças para pinças", img: "/img/pecas-pincas.webp" },
  { nome: "Escovas de vedação", img: "/img/pecas-escovas.webp" },
  { nome: "Partes para mandril", img: "/img/pecas-mandril.webp" },
]
