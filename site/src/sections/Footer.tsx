import { Logo } from "@/components/Logo"
import { EMPRESA } from "@/data"
import { t } from "@/i18n"
import { CATEGORIAS_MAQUINAS } from "@/maquinasCategorias"

const PAGINAS = [
  ["Máquinas", "/maquinas"],
  ["Linha de produção", "/#processo"],
  ["Peças", "/pecas"],
  ["Vídeos", "/videos"],
  ["Assistência técnica", "/assistencia"],
  ["Contato", "/#orcamento"],
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink px-5 pt-20 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
            {t(
              "Máquinas para a indústria do vidro com o melhor custo-benefício, garantia de 1 ano, assistência técnica e peças de reposição a pronta entrega."
            )}
          </p>
        </div>
        <nav className="sm:col-span-2 lg:col-span-4" aria-label={t("Linhas de máquinas")}>
          <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{t("Linhas")}</h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-white/70">
            {CATEGORIAS_MAQUINAS.map((c) => (
              <li key={c.slug}><a className="hover:text-ice" href={`/maquinas?linha=${c.slug}`}>{t(c.nome)}</a></li>
            ))}
            <li><a className="hover:text-ice" href="/pecas">{t("Partes e peças")}</a></li>
          </ul>
        </nav>
        <nav className="lg:col-span-2" aria-label={t("Páginas")}>
          <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{t("Site")}</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {PAGINAS.map(([label, href]) => (
              <li key={href}><a className="hover:text-ice" href={href}>{t(label)}</a></li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-2">
          <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{t("Contato")}</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><a className="hover:text-ice" href={EMPRESA.telefoneLink}>{EMPRESA.telefone}</a></li>
            <li><a className="break-all hover:text-ice" href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a></li>
            <li className="pt-3 font-mono text-xs text-white/40">CNPJ {EMPRESA.cnpj}</li>
          </ul>
        </div>
      </div>
      <p
        aria-hidden="true"
        className="font-wide pointer-events-none mx-auto -mb-[0.18em] max-w-7xl select-none text-center text-[17vw] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(143,233,255,0.18)]"
      >
        CHINA GLASS
      </p>
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/40 md:flex-row">
        <span>{t("© {ano} China Glass. Todos os direitos reservados.", { ano: new Date().getFullYear() })}</span>
        <span>{t("Preços sob consulta.")}</span>
      </div>
    </footer>
  )
}
