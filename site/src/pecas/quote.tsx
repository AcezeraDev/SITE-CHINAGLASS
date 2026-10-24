import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { t } from "@/i18n"

/** Lista de orçamento: o visitante junta várias peças e pede preço de todas de uma vez */

export type QuoteItem = { key: string; nome: string; codigo?: string; qtd: number }

/** Nome do item no idioma atual (a lista salva guarda o nome em português) */
export const nomeItem = (i: Pick<QuoteItem, "key" | "nome">) =>
  i.key.startsWith("linha:") ? t("{nome} (cotação)", { nome: t(i.key.slice(6)) }) : t(i.nome)

type QuoteCtx = {
  items: QuoteItem[]
  open: boolean
  setOpen: (v: boolean) => void
  has: (key: string) => boolean
  toggle: (item: Omit<QuoteItem, "qtd">) => void
  add: (item: Omit<QuoteItem, "qtd">) => void
  setQtd: (key: string, qtd: number) => void
  remove: (key: string) => void
  clear: () => void
}

const Ctx = createContext<QuoteCtx | null>(null)
const STORE = "cg-lista-orcamento"

function load(): QuoteItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) || "[]")
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(load)
  const [open, setOpen] = useState(false)

  // conveniência por visitante: a lista sobrevive a um recarregamento
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(items))
    } catch {
      /* armazenamento indisponível: segue só em memória */
    }
  }, [items])

  const has = useCallback((key: string) => items.some((i) => i.key === key), [items])
  const add = useCallback((it: Omit<QuoteItem, "qtd">) => {
    setItems((cur) => (cur.some((i) => i.key === it.key) ? cur : [...cur, { ...it, qtd: 1 }]))
  }, [])
  const toggle = useCallback((it: Omit<QuoteItem, "qtd">) => {
    setItems((cur) => (cur.some((i) => i.key === it.key) ? cur.filter((i) => i.key !== it.key) : [...cur, { ...it, qtd: 1 }]))
  }, [])
  const setQtd = useCallback((key: string, qtd: number) => {
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, qtd: Math.max(1, Math.min(999, qtd)) } : i)))
  }, [])
  const remove = useCallback((key: string) => setItems((cur) => cur.filter((i) => i.key !== key)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({ items, open, setOpen, has, toggle, add, setQtd, remove, clear }),
    [items, open, has, toggle, add, setQtd, remove, clear]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useQuote() {
  const c = useContext(Ctx)
  if (!c) throw new Error("useQuote fora do QuoteProvider")
  return c
}
