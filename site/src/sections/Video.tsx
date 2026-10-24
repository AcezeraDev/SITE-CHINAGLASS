import { useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"
import { Magnetic } from "@/components/Magnetic"
import { t } from "@/i18n"
import { gsap } from "@/lib/motion"

const VIDEO = "/video/linha-lapidacao.mp4"

/** Vídeo da linha de lapidação hospedado no site: só baixa os primeiros quadros até o play, e cresce ao rolar */
export function Video() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".video-frame", { scale: 0.82, borderRadius: "48px" }, {
        scale: 1,
        borderRadius: "24px",
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // o vídeo é vertical: as laterais mostram o próprio vídeo, pequeno e desfocado
  const fundo = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!play) return
    const v = video.current
    const c = fundo.current?.getContext("2d")
    if (!v || !c) return
    let raf = 0
    const desenha = () => {
      c.drawImage(v, 0, 0, c.canvas.width, c.canvas.height)
      raf = requestAnimationFrame(desenha)
    }
    desenha()
    return () => cancelAnimationFrame(raf)
  }, [play])

  // a capa mostra um quadro do meio do vídeo; ao dar play, volta para o começo
  const tocar = () => {
    const v = video.current
    if (!v) return
    setPlay(true)
    v.currentTime = 0
    v.muted = false
    void v.play()
  }

  return (
    <section ref={root} aria-label={t("Vídeo da linha de lapidação")} className="bg-ink px-3 py-20 md:px-8 md:py-28">
      <div className="video-frame relative mx-auto aspect-video max-w-7xl overflow-hidden border border-white/10 bg-ink-2">
        {play && (
          <canvas ref={fundo} width={32} height={18} aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 opacity-50 blur-2xl" />
        )}
        <video
          ref={video}
          src={`${VIDEO}#t=6`}
          preload="metadata"
          playsInline
          muted
          controls={play}
          title={t("Máquinas China Glass em funcionamento")}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${play ? "opacity-100" : "scale-105 object-cover opacity-60"}`}
        />
        {!play && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
              <Magnetic strength={0.45}>
                <button
                  onClick={tocar}
                  className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-white text-ink md:h-28 md:w-28"
                  aria-label={t("Assistir ao vídeo")}
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/30 [animation-duration:2.4s]" />
                  <Play className="relative ml-1 h-7 w-7 fill-current md:h-9 md:w-9" />
                </button>
              </Magnetic>
              <p className="font-wide text-[clamp(1.4rem,3vw,2.6rem)] font-semibold tracking-tight text-white">{t("Veja as máquinas trabalhando")}</p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
