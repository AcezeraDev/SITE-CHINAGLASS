import { Fragment } from "react"

/** Quebra o texto em palavras com máscara, para revelar uma a uma */
export function SplitWords({ text, className = "word" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i, arr) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span className={`${className} inline-block will-change-transform`}>{w}</span>
          </span>
          {i < arr.length - 1 && " "}
        </Fragment>
      ))}
    </>
  )
}
