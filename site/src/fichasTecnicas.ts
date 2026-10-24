import { MAQUINAS as CATALOGO_ORIGINAL, type MaquinaCatalogo } from "./maquinasData"
import pesquisa from "./fichasTecnicasData.json"

export type TabelaVariantes = {
  colunas: string[]
  linhas: string[][]
}

export type FichaTecnica = {
  resumo: string
  aplicacoes: string[]
  funcionamento: string
  recursos: string[]
  especificacoes: [string, string][]
  removerEspecificacoes?: string[]
  observacoes?: string[]
  opcionais?: string[]
  dimensionamento: string
  tabela?: TabelaVariantes
  tabelaFonte?: string
}

// Conteúdo editorial separado dos dados gerados: uma nova importação do catálogo
// não apaga a pesquisa. Cada registro corresponde ao ID exato do produto.
export const FICHAS_TECNICAS: Record<string, FichaTecnica> = Object.fromEntries(
  Object.entries(pesquisa).map(([id, ficha]) => [id, {
    ...ficha,
    especificacoes: ficha.especificacoes.map(([chave, valor]): [string, string] => [chave, valor]),
  }]),
)
export const DATA_REVISAO_FICHAS = "2026-10-24"

export function especificacoesDaFicha(m: MaquinaCatalogo): [string, string][] {
  const ficha = FICHAS_TECNICAS[m.id]
  if (!ficha) return m.specs
  const linhas = new Map(m.specs)
  ficha.removerEspecificacoes?.forEach((chave) => linhas.delete(chave))
  ficha.especificacoes.forEach(([chave, valor]) => linhas.set(chave, valor))
  return [...linhas]
}

// Cartões e modal exibem os mesmos parâmetros revisados.
export const MAQUINAS: MaquinaCatalogo[] = CATALOGO_ORIGINAL.map((m) => ({
  ...m,
  specs: especificacoesDaFicha(m),
}))

const INSTALACAO = new Set(["Potência", "Potência instalada", "Potência do spindle", "Potência do laser", "Alimentação", "Ar comprimido", "Peso", "Dimensões", "Área ocupada", "Área de instalação", "Altura da mesa", "Refrigeração", "Bateria"])

export function gruposDeEspecificacoes(m: MaquinaCatalogo) {
  const desempenho = m.specs.filter(([chave]) => !INSTALACAO.has(chave))
  const instalacao = m.specs.filter(([chave]) => INSTALACAO.has(chave))
  return [
    { titulo: "Capacidade e processamento", linhas: desempenho },
    { titulo: "Instalação e infraestrutura", linhas: instalacao },
  ].filter((grupo) => grupo.linhas.length > 0)
}
