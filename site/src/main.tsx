import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { LangWidget } from "./components/LangSwitcher"
import { initI18n } from "./i18n"
import "./index.css"

// rotas simples por caminho (cada página carrega só o seu código);
// o servidor precisa devolver o index.html para cada caminho abaixo
const App = lazy(() => import("./App"))
const PAGINAS: Record<string, ReturnType<typeof lazy>> = {
  "/pecas": lazy(() => import("./pages/PecasPage")),
  "/maquinas": lazy(() => import("./pages/MaquinasPage")),
  "/videos": lazy(() => import("./pages/VideosPage")),
  "/assistencia": lazy(() => import("./pages/AssistenciaPage")),
}

const path = window.location.pathname.replace(/\/+$/, "")
const Page = PAGINAS[path] ?? App

// o dicionário do idioma chega antes da primeira renderização
initI18n().then(() =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Suspense fallback={<div className="min-h-screen bg-ink" />}>
        <Page />
      </Suspense>
      <LangWidget />
    </StrictMode>
  )
)
