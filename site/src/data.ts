// Conteúdo real extraído de chinaglass.com.br (ver ../chinaglass/dados)

import type { Modelo3D } from "@/three/modelos"

export const EMPRESA = {
  nome: "China Glass",
  telefone: "(11) 2896-7088",
  telefoneLink: "tel:+551128967088",
  email: "rubens@chinaglass.com.br",
  cnpj: "26.455.018/0001-71",
  video: "vEz4jPgXGbY",
  site: "https://www.chinaglass.com.br",
}

const P = (slug: string) => `${EMPRESA.site}/${slug}`

export const CATEGORIAS = [
  "Mesas de corte CNC",
  "Linhas de lapidação",
  "Bilaterais",
  "Biseladoras",
  "Furadeiras",
  "Lavadoras",
  "Jateadoras",
  "Laser",
  "Centro de usinagem CNC",
  "Forno de laminação EVA",
  "Carregadoras e descarregadoras",
  "Partes e peças",
]

export type Etapa = {
  n: string
  etapa: string
  nome: string
  img: string
  cota: string
  specs: [string, string][]
  url: string
  /** mostra este modelo 3D interativo no lugar da foto (ver MODELOS_3D em three/modelos.ts) */
  modelo3d?: Modelo3D
}

/** Fluxo de produção de uma vidraçaria, do recebimento da chapa ao acabamento */
export const PROCESSO: Etapa[] = [
  {
    n: "01",
    etapa: "Carregar",
    nome: "Carregadora para mesa de corte 3660 mm",
    img: "/img/carregadora-mesa-cut.webp",
    cota: "3660 mm",
    specs: [["Capacidade", "1,5 t"], ["Ventosas", "12 em 3 braços"], ["Comando", "Controle remoto 4D"]],
    url: P("carregadora-para-mesa-de-corte-3600-mm-automatica-com-movimento-frente-tras-direita-e-esquerda-por-controle-remoto"),
    modelo3d: "carregadora",
  },
  {
    n: "02",
    etapa: "Cortar",
    nome: "Mesa de corte CNC 4200 × 2800 mm",
    img: "/img/mesa-corte-4200-cut.webp",
    cota: "4200 × 2800 mm",
    specs: [["Corte", "XYZ"], ["Mesa", "Colchão de ar"], ["Software", "Optima incluso"]],
    url: P("los9m9nmh-mesa-de-corte-vidro-automatica-cnc-china-glass-360"),
    modelo3d: "mesa-corte",
  },
  {
    n: "03",
    etapa: "Lapidar",
    nome: "Lapidadora bilateral 20 rebolos",
    img: "/img/bilateral-20-cut.webp",
    cota: "até 4200 mm",
    specs: [["Espessura", "3 – 25 mm"], ["Velocidade", "1 – 7 m/min"], ["Rebolos", "10 por lado"]],
    url: P("lapidadora-de-vidros-bilateral-china-glass-20-rebolos-tamanhos-1500mm-2500mm-e-4200mm"),
    modelo3d: "bilateral",
  },
  {
    n: "04",
    etapa: "Polir",
    nome: "Lapidadora copo 10 rebolos em inox",
    img: "/img/lapidadora-copo-10-cut.webp",
    cota: "10 rebolos",
    specs: [["Rebolos", "10"], ["Transmissão", "Redutor RV"], ["Carcaça", "Inox"]],
    url: P("-lapidadora-de-vidro-copo-10-rebolos-china-glass"),
    modelo3d: "copo",
  },
  {
    n: "05",
    etapa: "Furar",
    nome: "Furadeira 4 posições duplo cabeçote",
    img: "/img/furadeira-4-cut.webp",
    cota: "2200 × 3000 mm",
    specs: [["Furos", "Ø5 – Ø110 mm"], ["Espessura", "3 – 40 mm"], ["Mesa", "Inox flutuante"]],
    url: P("furadeira-4-posicoes-com-duplo-cabecotes"),
    modelo3d: "furadeira",
  },
  {
    n: "06",
    etapa: "Usinar",
    nome: "Centro de usinagem CNC",
    img: "/img/centro-usinagem-cut.webp",
    cota: "CNC 3 eixos",
    specs: [["Spindle", "15.000 rpm"], ["Ferramentas", "Troca automática"], ["Estações", "Dupla"]],
    url: P("centro_usinagem_cnc"),
    modelo3d: "usinagem",
  },
  {
    n: "07",
    etapa: "Lavar",
    nome: "Lavadora horizontal em inox",
    img: "/img/lavadora-horizontal-cut.webp",
    cota: "1200 / 1600 / 2000 mm",
    specs: [["Escovas", "4 pares"], ["Esponjas", "3 pares de rolos"], ["Secagem", "Ar quente"]],
    url: P("lavadora-vidro-horizontal-china-glass"),
    modelo3d: "lavadora",
  },
  {
    n: "08",
    etapa: "Laminar",
    nome: "Forno de laminação EVA 3 bandejas",
    img: "/img/forno-eva-cut.webp",
    cota: "2000 × 3000 mm",
    specs: [["Por ciclo", "Até 54 m²"], ["Temperatura", "60 – 150 °C"], ["Ciclo", "90 – 140 min"]],
    url: P("forno-laminacao-vidros"),
    modelo3d: "forno-eva",
  },
  {
    n: "09",
    etapa: "Gravar",
    nome: "Marcação a laser 140 W",
    img: "/img/laser-140w-cut.webp",
    cota: "1300 × 2500 mm",
    specs: [["Potência", "140 W"], ["Eixos", "5, lente 3D"], ["Espessura", "Até 70 mm"]],
    url: P("maquina-de-marcacao-a-laser-140w"),
    modelo3d: "laser",
  },
]

export type Destaque = {
  nome: string
  linha: string
  img: string
  specs: string[]
  url: string
  selo?: string
}

export const DESTAQUES: Destaque[] = [
  {
    nome: "Linha de lapidação bilateral",
    linha: "Bilateral",
    img: "/img/linha-bilateral-cut.webp",
    specs: ["20 ou 24 motores", "Transfer em L ou em linha", "Trilho inox 304"],
    url: P("linha-lapidacao-bilateral-china-glass"),
    selo: "Linha completa",
  },
  {
    nome: "Mesa de corte CNC 3 em 1",
    linha: "Mesa de corte",
    img: "/img/mesa-3em1-cut.webp",
    specs: ["Carrega, corta e destaca", "3660 mm", "Posicionamento a laser"],
    url: P("mesa-de-corte-cnc-china-glass-cripton"),
  },
  {
    nome: "Lavadora vertical Open Top",
    linha: "Lavadora",
    img: "/img/lavadora-vertical-cut.webp",
    specs: ["1600 / 2000 / 2500 mm", "4 jatos turbo", "Projeto italiano"],
    url: P("lavadora-vertical-2500l"),
  },
  {
    nome: "Canteadeira automática",
    linha: "Lapidação",
    img: "/img/canteadeira-cut.webp",
    specs: ["Raios R5 a R60", "≈ 3 peças/min", "PLC + IHM touch"],
    url: P("maquina-canteadeira-automatica-china-glass-tamanhos-1000-1600-2300-mm"),
  },
  {
    nome: "Jateadora automática",
    linha: "Jateadora",
    img: "/img/jateadora-cut.webp",
    specs: ["Até 30 m²/h", "3 pistolas automáticas", "1600 a 2500 mm"],
    url: P("jateadora-de-vidros-china-glass"),
  },
  {
    nome: "Elevador a vácuo com braço articulado",
    linha: "Movimentação",
    img: "/img/elevador-cut.webp",
    specs: ["400 kg", "Elevação até 3,5 m", "Alarme anti-queda"],
    url: P("elevador-de-vidro-chinaglass"),
    selo: "Exclusivo no Brasil",
  },
]

export const PECAS = [
  { nome: "Peças para mesas de corte", img: "/img/pecas-mesa-corte.webp" },
  { nome: "Peças para pinças", img: "/img/pecas-pincas.webp" },
  { nome: "Escovas de vedação", img: "/img/pecas-escovas.webp" },
  { nome: "Partes para mandril", img: "/img/pecas-mandril.webp" },
]

export const MAQUINAS_FORM = [
  ...new Set([...PROCESSO.map((p) => p.nome), ...DESTAQUES.map((d) => d.nome)]),
  "Peças de reposição",
  "Outra máquina",
]
