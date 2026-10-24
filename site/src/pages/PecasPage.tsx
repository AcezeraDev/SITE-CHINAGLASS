import { Cursor } from "@/components/Cursor"
import { usePage } from "@/lib/page"
import { Catalogo } from "@/pecas/Catalogo"
import { PecasHero } from "@/pecas/PecasHero"
import { QuoteProvider } from "@/pecas/quote"
import { QuoteDrawer, QuoteFab } from "@/pecas/QuoteDrawer"
import { Ajuda, SobConsulta } from "@/pecas/SobConsulta"
import { Footer } from "@/sections/Footer"
import { Navbar } from "@/sections/Navbar"

export default function PecasPage() {
  usePage(
    "Partes e peças para lapidadora e biseladora | China Glass",
    "Peças de reposição a pronta entrega para lapidadoras e biseladoras chinesas: bombas d’água, correias, correntes, coifas, escovas e amperímetros. Monte sua lista e peça orçamento."
  )

  return (
    <QuoteProvider>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main>
        <PecasHero />
        <Catalogo />
        <SobConsulta />
        <Ajuda />
      </main>
      <Footer />
      <QuoteFab />
      <QuoteDrawer />
    </QuoteProvider>
  )
}
