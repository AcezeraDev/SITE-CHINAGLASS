import { cn } from "@/lib/utils"

/** Máquina recortada sobre um "chão" iluminado, com reflexo e linha de cota que aparece no hover */
export function MachineStage({
  src,
  alt,
  cota,
  className,
  imgClassName,
}: {
  src: string
  alt: string
  cota?: string
  className?: string
  imgClassName?: string
}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* luz de estúdio no chão */}
      <div className="pointer-events-none absolute inset-x-[6%] bottom-[6%] h-[40%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(143,233,255,0.2),rgba(47,123,255,0.07)_55%,transparent)] opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-[14%] bottom-[22%] h-px bg-gradient-to-r from-transparent via-ice/35 to-transparent" />

      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className={cn(
          "machine-img relative z-10 max-h-[72%] max-w-[86%] select-none object-contain drop-shadow-[0_22px_26px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [-webkit-box-reflect:below_0px_linear-gradient(transparent_62%,rgba(255,255,255,0.16))] group-hover:-translate-y-3",
          imgClassName
        )}
      />

      {cota && (
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[8%] z-20 flex origin-center scale-x-0 items-center gap-2 transition-transform duration-500 ease-out group-hover:scale-x-100">
          <span className="h-3 w-px bg-ice" />
          <span className="h-px flex-1 bg-ice/70" />
          <span className="rounded bg-ink px-2 py-0.5 font-mono text-[10px] text-ice">{cota}</span>
          <span className="h-px flex-1 bg-ice/70" />
          <span className="h-3 w-px bg-ice" />
        </div>
      )}
    </div>
  )
}

/** Marcas de corte nos cantos, como numa prancha de engenharia */
export function CropMarks({ className }: { className?: string }) {
  const c = "absolute h-4 w-4 border-ice/45"
  return (
    <div className={cn("pointer-events-none absolute inset-3", className)} aria-hidden="true">
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}
