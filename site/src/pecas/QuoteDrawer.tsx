import { useEffect, useRef, useState, type FormEvent } from "react"
import { ClipboardList, Minus, Plus, Trash2, X } from "lucide-react"
import { EMPRESA } from "@/data"
import { langInfo, t } from "@/i18n"
import { gsap } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { nomeItem, useQuote } from "./quote"

const campo =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-ice/60 focus:outline-none"

/** Botão flutuante com o total de itens: pula quando a lista muda */
export function QuoteFab() {
  const { items, setOpen } = useQuote()
  const btn = useRef<HTMLButtonElement>(null)
  const total = items.reduce((s, i) => s + i.qtd, 0)

  useEffect(() => {
    if (!btn.current || !items.length) return
    gsap.fromTo(btn.current, { scale: 1.15 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" })
  }, [items.length])

  return (
    <button
      ref={btn}
      onClick={() => setOpen(true)}
      className={cn(
        "fixed bottom-5 right-5 z-50 flex h-14 cursor-pointer items-center gap-3 rounded-2xl pl-5 pr-2 font-medium shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] transition-all duration-500",
        items.length ? "translate-y-0 bg-white text-ink opacity-100" : "pointer-events-none translate-y-24 opacity-0"
      )}
      aria-label={t("Abrir lista de orçamento, {n} itens", { n: items.length })}
    >
      <ClipboardList className="h-5 w-5" />
      <span className="hidden sm:inline">{t("Lista de orçamento")}</span>
      <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-ink px-2 font-mono text-sm text-white">{total}</span>
    </button>
  )
}

/** Gaveta lateral: ajusta quantidades e envia um pedido único */
export function QuoteDrawer() {
  const { items, open, setOpen, setQtd, remove, clear } = useQuote()
  const panel = useRef<HTMLDivElement>(null)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (!open) return
    setEnviado(false)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: "expo.out" })
    panel.current?.querySelector<HTMLElement>("button")?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open, setOpen])

  // sem servidor por enquanto: abre o e-mail do visitante com o pedido pronto, no idioma do site
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const linhas = items.map((i) => `- ${i.qtd}x ${nomeItem(i)}${i.codigo ? ` (${t("cód.")} ${i.codigo})` : ""}`)
    const corpo = [
      `${t("Nome")}: ${f.get("nome")}`,
      `${t("Empresa")}: ${f.get("empresa") || "-"}`,
      `${t("E-mail")}: ${f.get("email")}`,
      `${t("Telefone")}: ${f.get("telefone")}`,
      `${t("Idioma")}: ${langInfo().nome}`,
      "",
      `${t("Peças")}:`,
      ...linhas,
      "",
      `${t("Máquina / observações")}: ${f.get("obs") || "-"}`,
    ].join("\n")
    window.location.href = `mailto:${EMPRESA.email}?subject=${encodeURIComponent(t("Orçamento de peças ({n} itens)", { n: items.length }))}&body=${encodeURIComponent(corpo)}`
    setEnviado(true)
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("Lista de orçamento")}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="glass flex h-full w-full max-w-md flex-col overflow-y-auto bg-ink/90"
      >
        <header className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ice">{t("Pedido de orçamento")}</p>
            <h2 className="font-wide mt-1 text-xl font-semibold text-white">{t("Sua lista")}</h2>
          </div>
          <button onClick={() => setOpen(false)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/10" aria-label={t("Fechar")}>
            <X className="h-5 w-5" />
          </button>
        </header>

        {enviado ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <h3 className="font-wide text-2xl font-semibold text-white">{t("Pedido pronto!")}</h3>
            <p className="mt-3 text-white/60">
              {t("Abrimos o seu e-mail com a lista preenchida. É só enviar. Se nada abriu, escreva para")}{" "}
              <a className="text-ice underline" href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>{" "}
              {t("ou ligue {tel}.", { tel: EMPRESA.telefone })}
            </p>
            <button onClick={() => { clear(); setOpen(false) }} className="mt-8 cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-ice">
              {t("Limpar lista e fechar")}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-white/60">{t("Sua lista está vazia.")}</div>
        ) : (
          <>
            <ul className="divide-y divide-white/10 px-5">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{nomeItem(i)}</p>
                    {i.codigo && <p className="font-mono text-[11px] text-white/40">{t("Cód.")} {i.codigo}</p>}
                  </div>
                  <div className="flex items-center rounded-xl border border-white/10">
                    <button onClick={() => setQtd(i.key, i.qtd - 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white" aria-label={t("Diminuir {nome}", { nome: nomeItem(i) })}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center font-mono text-sm text-white" aria-label={t("Quantidade")}>{i.qtd}</span>
                    <button onClick={() => setQtd(i.key, i.qtd + 1)} className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/70 hover:text-white" aria-label={t("Aumentar {nome}", { nome: nomeItem(i) })}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => remove(i.key)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white" aria-label={t("Remover {nome}", { nome: nomeItem(i) })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={enviar} className="mt-auto grid gap-3 border-t border-white/10 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs text-white/60">{t("Nome")}<input name="nome" required autoComplete="name" className={campo} /></label>
                <label className="grid gap-1.5 text-xs text-white/60">{t("Empresa")}<input name="empresa" autoComplete="organization" className={campo} /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs text-white/60">{t("E-mail")}<input name="email" type="email" required autoComplete="email" className={campo} /></label>
                <label className="grid gap-1.5 text-xs text-white/60">{t("Telefone")}<input name="telefone" type="tel" required autoComplete="tel" className={campo} /></label>
              </div>
              <label className="grid gap-1.5 text-xs text-white/60">
                {t("Modelo da máquina / observações")}
                <textarea name="obs" rows={2} className={`${campo} resize-none`} placeholder={t("Ex.: lapidadora 9 rebolos, ano 2019")} />
              </label>
              <button type="submit" className="mt-1 h-13 cursor-pointer rounded-2xl bg-white py-3.5 font-medium text-ink transition-colors hover:bg-ice">
                {t(items.length === 1 ? "Enviar pedido ({n} item)" : "Enviar pedido ({n} itens)", { n: items.length })}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
