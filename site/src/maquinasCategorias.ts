// Gerado por scripts/gen_maquinas.py. Não edite à mão.
// Separado de maquinasData para o menu não carregar o catálogo inteiro.

export type CategoriaMaquina = { slug: string; nome: string; original: string; total: number }

export const TOTAL_MAQUINAS = 38

/** Categorias do menu do site original (chinaglass.com.br), sem "Partes e Peças", que tem página própria */
export const CATEGORIAS_MAQUINAS: CategoriaMaquina[] = [
  {
    "slug": "mesa-de-corte",
    "nome": "Mesas de corte",
    "original": "Mesa corte vidro automática",
    "total": 10
  },
  {
    "slug": "lapidacao",
    "nome": "Linha de lapidação",
    "original": "Linha Lapidação",
    "total": 10
  },
  {
    "slug": "bilateral",
    "nome": "Bilateral",
    "original": "Bilateral",
    "total": 5
  },
  {
    "slug": "biseladora",
    "nome": "Biseladora",
    "original": "Biseladora",
    "total": 1
  },
  {
    "slug": "furadeira",
    "nome": "Furadeira",
    "original": "Furadeira",
    "total": 3
  },
  {
    "slug": "lavadora",
    "nome": "Lavadora",
    "original": "Lavadora",
    "total": 3
  },
  {
    "slug": "jateadora",
    "nome": "Jateadora",
    "original": "Jateadora",
    "total": 2
  },
  {
    "slug": "laser",
    "nome": "Laser",
    "original": "Laser",
    "total": 1
  },
  {
    "slug": "centro-usinagem",
    "nome": "Centro de usinagem CNC",
    "original": "Centro Usinagem CNC",
    "total": 1
  },
  {
    "slug": "forno-eva",
    "nome": "Forno laminação EVA",
    "original": "Forno Laminação EVA",
    "total": 1
  },
  {
    "slug": "carregadoras",
    "nome": "Carregadoras e movimentação",
    "original": "Carregadoras / Descarregadoras",
    "total": 9
  }
]
