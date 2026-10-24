// Tradução simples: o texto em português é a chave e cada idioma tem um dicionário.
// O que faltar no dicionário aparece em português, então nada quebra quando surge texto novo.

export type Lang = "pt" | "en" | "es" | "fr"
type Dict = Record<string, string>

export const LANGS: { code: Lang; nome: string; html: string }[] = [
  { code: "pt", nome: "Português", html: "pt-BR" },
  { code: "en", nome: "English", html: "en" },
  { code: "es", nome: "Español", html: "es" },
  { code: "fr", nome: "Français", html: "fr" },
]

const STORE = "cg-idioma"

// cada idioma carrega só o seu dicionário (textos do site + catálogo)
const LOADERS: Record<Exclude<Lang, "pt">, () => Promise<Dict[]>> = {
  en: () => Promise.all([import("./en"), import("./catalogo.en")]).then((m) => m.map((d) => d.default)),
  es: () => Promise.all([import("./es"), import("./catalogo.es")]).then((m) => m.map((d) => d.default)),
  fr: () => Promise.all([import("./fr"), import("./catalogo.fr")]).then((m) => m.map((d) => d.default)),
}

const valido = (v: string | null | undefined): Lang | null =>
  LANGS.some((l) => l.code === v) ? (v as Lang) : null

/** ?lang= na barra de endereço > escolha salva > idioma do navegador > português */
function detectar(): Lang {
  const daUrl = valido(new URLSearchParams(window.location.search).get("lang"))
  if (daUrl) {
    salvar(daUrl)
    return daUrl
  }
  try {
    const salvo = valido(localStorage.getItem(STORE))
    if (salvo) return salvo
  } catch {
    /* armazenamento indisponível */
  }
  for (const l of navigator.languages ?? [navigator.language]) {
    const v = valido(l?.slice(0, 2).toLowerCase())
    if (v) return v
  }
  return "pt"
}

function salvar(l: Lang) {
  try {
    localStorage.setItem(STORE, l)
  } catch {
    /* segue sem lembrar */
  }
}

let atual: Lang = "pt"
let dict: Dict = {}

export const lang = () => atual
export const langInfo = () => LANGS.find((l) => l.code === atual)!

/** Carrega o dicionário antes da primeira renderização */
export async function initI18n() {
  const l = detectar()
  atual = l
  if (l !== "pt") {
    try {
      dict = Object.assign({}, ...(await LOADERS[l]()))
    } catch {
      atual = "pt"
    }
  }
  const info = langInfo()
  document.documentElement.lang = info.html
  // título e descrição do index.html também são chaves
  document.title = t(document.title)
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute("content", t(desc.getAttribute("content") ?? ""))
}

/** Troca de idioma: salva e recarrega, para todas as animações recomeçarem no texto novo */
export function setLang(l: Lang) {
  if (l === atual) return
  salvar(l)
  const url = new URL(window.location.href)
  url.searchParams.delete("lang")
  window.location.replace(url.toString())
}

/** Traduz um texto em português; `{nome}` no texto é trocado pelo valor em `vars` */
export function t(pt: string, vars?: Record<string, string | number>) {
  let s = dict[pt] ?? pt
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
  return s
}
