import type { Lang } from "@/i18n"
import { cn } from "@/lib/utils"

/** Bandeiras em vetor, simplificadas para o tamanho de ícone. Todas cortadas em 3:2 */
export function Flag({ lang, className }: { lang: Lang; className?: string }) {
  const cls = cn("inline-block h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.15)]", className)

  if (lang === "pt")
    return (
      <svg viewBox="0 0 21 14" className={cls} aria-hidden="true">
        <rect width="21" height="14" fill="#009c3b" />
        <path d="M10.5 1.4 19.3 7l-8.8 5.6L1.7 7z" fill="#ffdf00" />
        <circle cx="10.5" cy="7" r="3.5" fill="#002776" />
        <path d="M7.1 6.3c2.3-.6 4.7-.2 6.8 1.1" stroke="#fff" strokeWidth=".7" fill="none" />
      </svg>
    )

  if (lang === "fr")
    return (
      <svg viewBox="0 0 3 2" className={cls} aria-hidden="true">
        <rect width="1" height="2" fill="#002395" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#ed2939" />
      </svg>
    )

  if (lang === "es")
    return (
      <svg viewBox="0 0 750 500" className={cls} aria-hidden="true">
        <rect width="750" height="500" fill="#aa151b" />
        <rect y="125" width="750" height="250" fill="#f1bf00" />
        {/* brasão reduzido: coroa, escudo e as duas colunas */}
        <rect x="150" y="160" width="20" height="150" fill="#fff" stroke="#aa151b" strokeWidth="6" />
        <rect x="300" y="160" width="20" height="150" fill="#fff" stroke="#aa151b" strokeWidth="6" />
        <path d="M185 175h100v80c0 35-22 55-50 55s-50-20-50-55z" fill="#aa151b" stroke="#c8a400" strokeWidth="8" />
        <path d="M235 175v135M185 240h100" stroke="#f1bf00" strokeWidth="8" />
        <path d="M190 165c10-30 80-30 90 0z" fill="#c8102e" stroke="#c8a400" strokeWidth="8" />
      </svg>
    )

  // en: Estados Unidos, com as 50 estrelas como pontos
  const listras = Array.from({ length: 13 }, (_, i) => i)
  const estrelas: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    const n = r % 2 ? 5 : 6
    for (let c = 0; c < n; c++) estrelas.push([(r % 2 ? 1.27 : 0.63) + c * 1.27, 0.54 + r * 0.54])
  }
  return (
    <svg viewBox="0 0 19 10" preserveAspectRatio="xMidYMid slice" className={cls} aria-hidden="true">
      {listras.map((i) => (
        <rect key={i} y={(i * 10) / 13} width="19" height={10 / 13 + 0.01} fill={i % 2 ? "#fff" : "#b22234"} />
      ))}
      <rect width="7.6" height={(7 * 10) / 13} fill="#3c3b6e" />
      {estrelas.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r=".2" fill="#fff" />
      ))}
    </svg>
  )
}
