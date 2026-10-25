# Revisão das fichas de peças — 25/10/2026

## Conteúdo

As oito fichas receberam resumo, aplicação e compatibilidade, três conferências para identificar a reposição, dados a confirmar na cotação e orientação de manutenção. O conteúdo está em `src/pecasFichas.ts`; as especificações publicadas continuam em `src/pecasData.ts`.

As orientações de seleção são conteúdo editorial. Elas não acrescentam dimensões, materiais, equivalências, disponibilidade ou desempenho não publicados. Em particular, a referência comercial de 100 mm não foi interpretada como um diâmetro específico sem documentação.

Fontes consultadas, além das descrições arquivadas em `chinaglass/dados/descricoes`:

- [Bomba](https://www.chinaglass.com.br/bomba-de-agua-lapidadora-chinesa-lapidadora-china-glass)
- [Correia](https://www.chinaglass.com.br/correia-lapidadora-chinesa-9-rebolos)
- [Corrente](https://www.chinaglass.com.br/corrente-para-lapidadora-chinesa)
- [Amperímetro](https://www.chinaglass.com.br/amperimetro-lapidadora-chinesa)
- [Coifa para lapidadora](https://www.chinaglass.com.br/coifa-lapidadora-chinesa)
- [Coifa para lapidadora 100 mm](https://www.chinaglass.com.br/coifa-lapidadora-chinesa-100mm)
- [Coifa para biseladora](https://www.chinaglass.com.br/coifa-biseladora-chinesa-biseladora-china-glass)
- [Escova para biseladora 100 mm](https://www.chinaglass.com.br/escova-biseladora-100mm)

## Imagens aprovadas — 25/10/2026

Ferramenta: imagegen nativo. Foram produzidas oito imagens, cada uma a partir da foto existente da respectiva peça. O usuário aprovou as oito prévias. As imagens aprovadas foram convertidas para WebP, sem mudança de composição, e aplicadas em `public/img/pecas/{slug}-capa-v2.webp`. O campo `capa` identifica a imagem de estúdio; `img` preserva a fotografia original nos dados. Após a revisão de duplicatas, a ficha mostra somente a imagem de estúdio, identificada como gerada por IA, sem repetir o mesmo enquadramento em outra miniatura.

Diretório das prévias: `C:/Users/aceze/.codex/generated_images/01a173f3-0746-7422-895d-e7db8b9234af/`.

Após a aprovação, o usuário pediu capas sem nenhuma letra ou palavra. O amperímetro recebeu uma nova edição sem a letra A e sem algarismos, preservando os traços da escala. Arquivo final: `public/img/pecas/amperimetro-capa-v3.webp`, a partir de `exec-acb04e90-83a4-44dc-99cd-9fd926699c1c.png`. As outras sete capas aprovadas já não contêm texto.

Prompt da correção do amperímetro:

```text
Edit this product photograph only. Remove the letter A and every numeric digit and every other written character from the ammeter face. Keep the curved scale line and its plain tick marks but no digits, unit letters, logos, words or labels. Preserve exactly the shape, screws, needle, transparent housing, dark base, camera angle, lighting and white studio background. Absolutely zero letters, numbers, typography or writing in the image.
```

| Peça | Arquivo da prévia |
| --- | --- |
| Bomba d’água | exec-909c520f-9825-4f76-9a57-795fe47a96f9.png |
| Correia | exec-8897b1d2-72a0-488a-9955-59c04379734c.png |
| Corrente | exec-19ab4382-d246-4c45-85a9-c8331b6256b6.png |
| Amperímetro | exec-4098270a-440d-43ee-89ab-785b71e2c8d1.png |
| Coifa para lapidadora | exec-3c5c196a-30a5-4f10-a8a5-b0081aa10ec8.png |
| Coifa para lapidadora 100 mm | exec-dfef0913-37e7-4d7f-b6e0-413de5fbdf7e.png |
| Coifa para biseladora | exec-aeacc8b4-f34a-4dc3-b911-ead882028b4d.png |
| Escova para biseladora | exec-c9fe7f3c-f56d-4552-8b90-2824c0cae172.png |

### Prompt final

O prompt abaixo foi usado uma vez para cada `{slug}`: `bomba-agua`, `correia`, `corrente`, `amperimetro`, `coifa-lapidadora`, `coifa-lapidadora-100`, `coifa-biseladora`, `escova-biseladora`. Referência de cada chamada: `site/public/img/pecas/{slug}-cut.webp`. Fundo opaco.

```text
Use case: product-mockup / precise-object-edit. Edit the supplied reference photo of the industrial glass machinery spare part ({slug}) into a premium studio catalog product photograph, square composition on a seamless very light neutral gray background with a soft natural contact shadow. This is an identity-preserving product retouch, not a redesign. Match EXACTLY the reference silhouette, proportions, number of components, holes, folds, teeth, connections, winding, color and viewing angle. Keep the complete item uncropped with generous 12 percent margins. Improve lighting, sharpness and separation, clean poor cutout edges and low quality background. Realistic metal/rubber/textile texture, natural restrained contrast, neutral color balance. Do not add parts, change geometry, invent labels, markings, dimensions or logos. Preserve the exact analog ammeter scale if present. No titles, captions or decorative objects. Preview for human approval, not yet a website asset.
```
