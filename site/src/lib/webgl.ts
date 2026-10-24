import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import type { WebGLRenderer } from "three"

/**
 * Cada <Canvas> é um contexto WebGL, e o navegador do celular só aguenta uns 8 ao mesmo tempo: passando disso ele
 * derruba o mais antigo, que vira um retângulo branco por cima da página. Por isso cada cena 3D só existe perto da
 * tela e é desmontada (liberando o contexto) quando sai dela.
 *
 * `montar` diz se o canvas deve existir agora; `vigiar` vai no onCreated do Canvas: se o contexto for derrubado
 * mesmo assim, o canvas some em vez de cobrir o conteúdo, e volta na próxima vez que a cena chegar perto da tela.
 */
export function useCanvasNaTela(ref: RefObject<HTMLElement | null>, { margem = "300px", inicial = false } = {}) {
  const [perto, setPerto] = useState(inicial)
  const [perdido, setPerdido] = useState(false)
  const pertoAgora = useRef(inicial)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        pertoAgora.current = e.isIntersecting
        setPerto(e.isIntersecting)
        if (!e.isIntersecting) setPerdido(false)
      },
      { rootMargin: margem }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margem])

  const vigiar = useCallback((gl: WebGLRenderer) => {
    // ao desmontar, o próprio canvas derruba o contexto para liberar a GPU: isso não conta como falha
    gl.domElement.addEventListener("webglcontextlost", () => pertoAgora.current && setPerdido(true), { once: true })
  }, [])

  return { montar: perto && !perdido, vigiar }
}
