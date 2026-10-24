import { useEffect, useState } from "react"
import { Cursor } from "@/components/Cursor"
import { Preloader } from "@/components/Preloader"
import { ScrollTrigger, scrollToId, startSmoothScroll } from "@/lib/motion"
import { Categorias } from "@/sections/Categorias"
import { Chapas3D } from "@/sections/Chapas3D"
import { Destaques } from "@/sections/Destaques"
import { Diferenciais } from "@/sections/Diferenciais"
import { Footer } from "@/sections/Footer"
import { Hero } from "@/sections/Hero"
import { Linha } from "@/sections/Linha"
import { Navbar } from "@/sections/Navbar"
import { Numeros } from "@/sections/Numeros"
import { Orcamento } from "@/sections/Orcamento"
import { Pecas } from "@/sections/Pecas"
import { Processo } from "@/sections/Processo"
import { Video } from "@/sections/Video"

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => startSmoothScroll(), [])

  // chegou de outra página com /#seção: rola até ela depois da abertura
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!ready || !id) return
    const t = setTimeout(() => scrollToId(id), 300)
    return () => clearTimeout(t)
  }, [ready])

  // recalcula as seções fixadas depois que fontes e imagens carregam
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener("load", refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener("load", refresh)
  }, [])

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero ready={ready} />
        <Numeros />
        <Categorias />
        <Processo />
        <Chapas3D />
        <Destaques />
        <Linha />
        <Diferenciais />
        <Pecas />
        <Video />
        <Orcamento />
      </main>
      <Footer />
    </>
  )
}
