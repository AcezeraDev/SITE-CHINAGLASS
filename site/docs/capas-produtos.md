# Capas dos produtos — 25/10/2026

## Direção aprovada pelo usuário

Novas capas para todos os produtos, usando imagegen. As imagens finais não podem conter frases, palavras ou letras. Para atender à restrição, também foram removidos logotipos, algarismos e textos impressos nos equipamentos nas versões de estúdio. O nome do produto continua como texto da interface, fora do arquivo de imagem.

As fotografias de origem permanecem nos arquivos do projeto. Na galeria, a capa nova substitui a foto de referência do mesmo enquadramento. As imagens geradas são identificadas na interface como imagens de estúdio criadas por IA. As especificações técnicas não foram alteradas com base nos desenhos gerados.

## Problemas identificados nas capas anteriores

- **Máquinas dos prints:** a linha de corte laminado (`217194615`) usava uma prancha com título, tabela e fotos menores; a mesa 3 em 1 (`81769971`) trazia seta e texto de acessório opcional. As mesas `355640119` e `355775590` apareciam em fotos de fábrica, com fundo ocupado; a segunda também tinha uma marca-d'água grande sobre a máquina.
- **Outras pranchas e montagens:** lapidadoras `26195533` e `299665459`, biseladora `81791287`, modeladora `34607018`, furadeira `23525454` e lavadora `34607218` dividiam o enquadramento com títulos, imagens auxiliares, detalhes ou selos.
- **Fundos e elementos gráficos:** a bilateral `180212740` tinha fundo promocional e selos; a carregadora `237682619` tinha elementos gráficos ao redor; a robótica `343610648` aparecia em uma fábrica com outros equipamentos ao fundo.
- **Baixa definição e enquadramento inconsistente:** especialmente carregadoras `380647494`, `380651875` e `275917064`, além da linha bilateral `277831702`. Mesmo as fotos originalmente mais limpas foram padronizadas conforme o pedido de trocar todas as capas.
- **Peças:** oito fotos com recorte e definição irregulares receberam imagens de estúdio aprovadas. O amperímetro teve uma edição adicional para retirar a unidade e os algarismos da imagem de capa.

## Implementação

- Peças: campo `capa` em `src/pecasData.ts`, arquivos `public/img/pecas/*-capa-v2.webp` (amperímetro: `-capa-v3.webp`).
- Máquinas: mapa separado em `src/capasMaquinas.ts`, preservando o catálogo gerado por `scripts/gen_maquinas.py` e todas as fotografias de origem.
- Formato WebP com qualidade 90; a conversão de formato não altera a composição produzida pelo imagegen.
- A seleção de fotos e a ampliação usam `fotosDaMaquina`, em `src/lib/galeriaMaquinas.ts`: a capa substitui a primeira foto e 11 repetições adicionais, identificadas por comparação de pixels, similaridade e conferência visual, ficam fora da galeria. Fotos de outros ângulos e detalhes permanecem.
- Nas peças, a versão antiga do mesmo enquadramento deixou de aparecer como segunda miniatura. Os arquivos originais foram preservados.

## Ferramenta e prompt final das máquinas

Ferramenta: imagegen nativo, uma chamada por imagem. Referência: primeira imagem de cada produto em `maquinasData.ts`. As primeiras tentativas que apresentaram frases foram descartadas. O prompt final foi aplicado sem acrescentar o nome do produto:

```text
Edit the supplied image. ABSOLUTE REQUIREMENT: ZERO TEXT anywhere in the finished image. Erase ALL words, letters, numbers, branding, logos, labels, writing, watermarks, captions and typographic marks, including writing physically printed on the machine, keyboard keycaps, control panel labels and screen contents. Replace printed areas with the matching plain unmarked material. Display screens must be dark blank glass. Do not write the product name. Do not create a poster or advertisement. If the source is a brochure, remove all titles, tables, arrows, inset images and surrounding graphics; keep ONLY the large main machine. Keep EXACTLY the reference machine shape, physical parts, arrangement, colors, viewing angle and operating position. No new features, parts or invented accessories. Isolate the full uncropped machine in a landscape 4:3 studio product photograph against a seamless white background, with soft natural contact shadows, clean neutral lighting, crisp realistic surfaces and comfortable margins. Absolutely no text, characters or logos anywhere, not even small ones. The final image must show only an unmarked machine and its shadow.
```

Os prompts e caminhos das peças estão em `docs/fichas-pecas.md`. A revisão das imagens inclui inspeção visual e OCR local do Windows; formas mecânicas como botões circulares e grades podem produzir falsos positivos e exigem conferência visual.

## Ajuste final dos painéis da furadeira 402869343

Uma segunda edição removeu pequenos rótulos nos painéis. Prompt final dessa correção:

```text
Make ONE surgical cleanup to this exact photo. On each of the four black rectangular control panels at the top, erase the tiny white labels immediately above the red and green pushbuttons. Every black control panel must be completely unmarked apart from the plain blank screen and physical colored buttons. Also erase any remaining small letters, digits, logos or written marks anywhere on motor plates or elsewhere. Keep the four drilling heads, eight blue motors, every support, glass table, colors, framing, lighting and white background exactly as shown. NO WORDS, NO LETTERS, NO TEXT, NO NUMBERS. Do not add a title or caption.
```

Resultado: 38 capas de máquinas em `public/img/maquinas/capas/`, totalizando 4.088.800 bytes. O manifesto `docs/capas-maquinas-manifesto.json` relaciona produto, origem e nova capa. Somadas às oito peças, são 46 produtos com capa nova no projeto local.
