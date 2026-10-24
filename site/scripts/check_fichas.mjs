import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const site = new URL("../", import.meta.url)
const catalogo = await readFile(new URL("src/maquinasData.ts", site), "utf8")
const maquinas = JSON.parse(catalogo.match(/export const MAQUINAS: MaquinaCatalogo\[\] = (\[[\s\S]*\])\s*$/)[1])
const fichas = JSON.parse(await readFile(new URL("src/fichasTecnicasData.json", site), "utf8"))

assert.equal(Object.keys(fichas).length, maquinas.length, "Quantidade de fichas diferente do catálogo")
for (const m of maquinas) {
  const f = fichas[m.id]
  assert.ok(f, `Ficha ausente: ${m.nome}`)
  for (const chave of ["resumo", "funcionamento", "dimensionamento"]) {
    assert.ok(typeof f[chave] === "string" && f[chave].trim().length > 30, `${m.id}: ${chave} vazio ou incompleto`)
  }
  for (const chave of ["aplicacoes", "recursos"]) {
    assert.ok(f[chave].length > 0 && f[chave].every((v) => v.trim()), `${m.id}: ${chave} vazio`)
  }
  assert.ok(f.especificacoes.every((v) => v.length === 2 && v.every((s) => typeof s === "string" && s.trim())), `${m.id}: especificação inválida`)
  assert.equal(new Set(f.especificacoes.map(([k]) => k)).size, f.especificacoes.length, `${m.id}: chave de especificação repetida`)
  const originais = new Set(m.specs.map(([k]) => k))
  assert.ok((f.removerEspecificacoes ?? []).every((k) => originais.has(k)), `${m.id}: remoção de campo inexistente`)
  if (f.tabela) {
    assert.ok(f.tabela.linhas.length > 0, `${m.id}: tabela sem versões`)
    assert.ok(f.tabela.linhas.every((l) => l.length === f.tabela.colunas.length && l.every((v) => v.trim())), `${m.id}: tabela desalinhada`)
  }
  assert.equal(new URL(m.url).hostname, "www.chinaglass.com.br", `${m.id}: fonte sem vínculo com o produto`)
}
assert.ok(Object.keys(fichas).every((id) => maquinas.some((m) => m.id === id)), "Ficha sem produto correspondente")

// Regressões editoriais: limites de modelos parecidos não podem se misturar.
assert.ok(fichas["242693919"].especificacoes.some(([k, v]) => k === "Potência" && v === "25 kW"))
assert.ok(fichas["398723570"].especificacoes.some(([k, v]) => k === "Curso Z" && v.includes("não equivale")))
assert.equal(fichas["34607218"].tabela.linhas.length, 3)
assert.equal(fichas["398723570"].tabela.linhas.length, 4)
assert.ok(fichas["402869343"].observacoes.some((v) => v.includes("três pares")))
assert.ok(fichas["398873522"].removerEspecificacoes.includes("Velocidade"))

console.log(`${maquinas.length}/${maquinas.length} fichas completas; IDs, fontes, especificações, variantes e divergências validados.`)
