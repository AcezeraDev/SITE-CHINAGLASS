// Tempo do plano de corte das linhas com pórtico CNC, sem three.js: usado pelo 3D e pelos textos/painel da página

/** risco do plano de corte [x1, z1, x2, z2], no sistema da chapa */
export type Risco = [number, number, number, number]
/** onde está a roda de corte (no sistema da chapa) e se está riscando */
export type PosCorte = { x: number; z: number; cortando: boolean }

export const OFF = 0.17 // distância do centro da viga até a roda de corte
export const suave = (p: number) => p * p * (3 - 2 * p)
export const faixa = (r: number, a: number, b: number) => Math.min(Math.max((r - a) / (b - a), 0), 1)

/** Sequência de riscos: vai até o começo de cada um, risca, e no fim volta para a casa */
export function planoDeCorte(cortes: Risco[], casa: [number, number], ir = 0.7, cortar = 1.2) {
  return {
    duracao: cortes.length * (ir + cortar) + ir,
    /** posição da roda `r` segundos depois do início; preenche quanto de cada risco já foi feito */
    em(r: number, feitos: number[]): PosCorte {
      let antes = casa
      for (let i = 0; i < cortes.length; i++) {
        const [x1, z1, x2, z2] = cortes[i]
        if (r < ir) {
          const p = suave(Math.max(r, 0) / ir)
          feitos.fill(0, i)
          return { x: antes[0] + (x1 - antes[0]) * p, z: antes[1] + (z1 - antes[1]) * p, cortando: false }
        }
        r -= ir
        if (r < cortar) {
          const p = r / cortar
          feitos[i] = p
          feitos.fill(0, i + 1)
          return { x: x1 + (x2 - x1) * p, z: z1 + (z2 - z1) * p, cortando: true }
        }
        r -= cortar
        feitos[i] = 1
        antes = [x2, z2]
      }
      const p = suave(Math.min(r / ir, 1))
      return { x: antes[0] + (casa[0] - antes[0]) * p, z: antes[1] + (casa[1] - antes[1]) * p, cortando: false }
    },
  }
}
