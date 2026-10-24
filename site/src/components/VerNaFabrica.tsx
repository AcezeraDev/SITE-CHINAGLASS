import { useEffect, useMemo, useRef, useState } from "react"
import { ScanLine, X } from "lucide-react"
import { renderSVG } from "uqr"
import { t } from "@/i18n"
import { cn } from "@/lib/utils"

/*
 * Realidade aumentada: a máquina em tamanho real no chão da fábrica do cliente.
 * No celular usa o <model-viewer> do Google (Scene Viewer no Android, Quick Look no iPhone), carregado só aqui e
 * hospedado em public/vendor com o three.js dele embutido, separado do 3D do site. No computador mostra um QR Code
 * que abre esta ficha no celular. Os modelos (public/modelos/*.glb) saem de /exportar-ar.html no `npm run dev`.
 */

const SCRIPT = "/vendor/model-viewer-4.3.1.min.js"
let carregando: Promise<void> | null = null

function carregarModelViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve()
  carregando ??= new Promise<void>((ok, erro) => {
    const s = document.createElement("script")
    s.type = "module"
    s.src = SCRIPT
    s.onload = () => customElements.whenDefined("model-viewer").then(() => ok())
    s.onerror = () => {
      carregando = null
      erro(new Error("model-viewer"))
    }
    document.head.appendChild(s)
  })
  return carregando
}

type ModelViewer = HTMLElement & { canActivateAR: boolean; activateAR: () => Promise<void> }
type Estado = "carregando" | "pronto" | "sem-ar" | "falhou"

const toque = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches

export function VerNaFabrica({ src, nome, link, destaque = false }: { src: string; nome: string; link: string; destaque?: boolean }) {
  const caixa = useRef<HTMLDivElement>(null)
  const mv = useRef<ModelViewer | null>(null)
  const [estado, setEstado] = useState<Estado>(toque ? "carregando" : "sem-ar")
  const [qr, setQr] = useState(false)
  const svg = useMemo(() => (qr ? renderSVG(link, { border: 2, whiteColor: "#ffffff", blackColor: "#05080f" }) : ""), [qr, link])

  // só no celular: prepara o visualizador escondido, para a câmera abrir no toque do botão
  useEffect(() => {
    if (!toque) return
    let vivo = true
    carregarModelViewer()
      .then(() => {
        if (!vivo || !caixa.current) return
        const el = document.createElement("model-viewer") as ModelViewer
        el.setAttribute("src", src)
        el.setAttribute("alt", nome)
        el.setAttribute("ar", "")
        el.setAttribute("ar-modes", "webxr scene-viewer quick-look")
        el.setAttribute("ar-scale", "fixed") // tamanho real, sem deixar encolher
        el.setAttribute("ar-placement", "floor")
        el.setAttribute("loading", "eager")
        el.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none"
        el.addEventListener("load", () => vivo && setEstado(el.canActivateAR ? "pronto" : "sem-ar"))
        el.addEventListener("error", () => vivo && setEstado("falhou"))
        el.addEventListener("ar-status", (e) => vivo && (e as CustomEvent<{ status: string }>).detail.status === "failed" && setEstado("falhou"))
        caixa.current.appendChild(el)
        mv.current = el
      })
      .catch(() => vivo && setEstado("falhou"))
    return () => {
      vivo = false
      mv.current?.remove()
      mv.current = null
    }
  }, [src, nome])

  const abrir = () => {
    if (estado === "pronto") void mv.current?.activateAR()
    else if (!toque) setQr((v) => !v)
  }

  const legenda = {
    carregando: t("Preparando o modelo em tamanho real..."),
    pronto: t("Aponte a câmera para o chão: a máquina aparece em tamanho real"),
    "sem-ar": toque ? t("Este celular não tem suporte a realidade aumentada") : t("Abra no celular e veja a máquina em tamanho real no seu chão"),
    falhou: t("Não foi possível abrir a realidade aumentada neste aparelho"),
  }[estado]

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={abrir}
        disabled={toque && estado !== "pronto"}
        aria-expanded={toque ? undefined : qr}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border bg-white/[0.03] p-3 text-left transition-colors hover:border-ice/40 disabled:cursor-default disabled:hover:border-white/10",
          destaque ? "border-ice/60" : "border-white/10"
        )}
      >
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ice text-ink", destaque && estado === "pronto" && "animate-pulse")}>
          <ScanLine className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-white">{t("Ver na minha fábrica")}</span>
          <span className="block text-xs leading-snug text-white/50">{legenda}</span>
        </span>
      </button>

      {qr && (
        <div className="mt-2 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="w-28 shrink-0 overflow-hidden rounded-lg bg-white" role="img" aria-label={t("QR Code para abrir no celular")} dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="text-xs leading-relaxed text-white/70">
            {t("Aponte a câmera do celular para o QR Code, toque em “Ver na minha fábrica” e depois aponte para o chão.")}
          </p>
          <button type="button" onClick={() => setQr(false)} aria-label={t("Fechar")} className="ml-auto self-start text-white/50 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
