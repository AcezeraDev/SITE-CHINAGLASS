import { planoDeCorte, type Risco } from "./corteTempo"

// Ciclo da linha de corte Jumbo (em segundos), sem three.js: usado pelo modelo 3D, pela jornada de scroll e pelo painel CNC

export const VIDRO: [number, number] = [3.7, 2.5] // chapa no sistema da cena (m)
export const VIDRO_MM: [number, number] = [4200, 2800]

// riscos no sistema da chapa: três transversais e um longitudinal
export const CORTES: Risco[] = [
  [-1.0, -1.15, -1.0, 1.15],
  [0.1, 1.15, 0.1, -1.15],
  [1.05, -1.15, 1.05, 1.15],
  [1.8, 0.3, -1.8, 0.3],
]
export const CASA: [number, number] = [-2.05, -1.4]
export const PLANO = planoDeCorte(CORTES, CASA)

export const CORTE0 = 5.8 // início do corte
export const FIM = CORTE0 + PLANO.duracao
export const ROLA = 2 // segundos para a chapa passar de uma mesa para a outra
export const DESTACA = 1.6 // as peças se separam na mesa de destaque
export const DESTAQUE0 = FIM + ROLA

/** Peças que saem do plano de corte: [centro x, centro z, largura, profundidade], no sistema da chapa */
export const PECAS: [number, number, number, number][] = (() => {
  const xs = [-VIDRO[0] / 2, -1.0, 0.1, 1.05, VIDRO[0] / 2]
  const zs = [-VIDRO[1] / 2, 0.3, VIDRO[1] / 2]
  const p: [number, number, number, number][] = []
  for (let i = 0; i < xs.length - 1; i++)
    for (let j = 0; j < zs.length - 1; j++) p.push([(xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2, xs[i + 1] - xs[i], zs[j + 1] - zs[j]])
  return p
})()

/* ---------- jornada de scroll: progresso 0 → 1 vira tempo do ciclo ---------- */

// [progresso, tempo]: carregamento, alimentação, corte e destaque
const MARCOS: [number, number][] = [
  [0, 0],
  [0.24, 3.6],
  [0.42, CORTE0],
  [0.74, FIM],
  [1, DESTAQUE0 + DESTACA],
]

/** Início de cada etapa no progresso do scroll */
export const ETAPAS = MARCOS.slice(0, 4).map(([p]) => p)

export function tempoDaJornada(p: number) {
  let i = 0
  while (i < MARCOS.length - 2 && p > MARCOS[i + 1][0]) i++
  const [p0, t0] = MARCOS[i]
  const [p1, t1] = MARCOS[i + 1]
  return t0 + (t1 - t0) * Math.min(Math.max((p - p0) / (p1 - p0), 0), 1)
}

/** Índice da etapa: 0 carregamento, 1 alimentação, 2 corte, 3 destaque */
export function etapaDaJornada(p: number) {
  let i = 0
  while (i < ETAPAS.length - 1 && p >= ETAPAS[i + 1]) i++
  return i
}
