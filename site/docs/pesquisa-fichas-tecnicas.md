# Pesquisa das fichas técnicas

Revisão: 24/10/2026. Escopo: os 38 produtos únicos de `src/maquinasData.ts`.

Foram consultadas individualmente as páginas oficiais da China Glass indicadas no campo `url` de cada produto. As páginas das duas ventosas foram verificadas por requisição HTTP direta após falha do leitor de páginas. Ambas responderam HTTP 200 e suas descrições foram lidas.

O conteúdo editorial fica em `src/fichasTecnicasData.json`, separado do catálogo gerado por `scripts/gen_maquinas.py`. A fonte de cada ficha é a página do mesmo ID no catálogo original. `src/fichasTecnicas.ts` aplica os complementos e as correções; cartões e modal compartilham os valores revisados. As orientações de dimensionamento são perguntas e critérios para selecionar a configuração, não novas garantias de desempenho.

## Tabelas em imagem transcritas

| Produto / ID | Fonte primária | Informações incorporadas |
| --- | --- | --- |
| Lapidadora 10 rebolos / 242693919 | [Parâmetros técnicos](https://cdn.awsli.com.br/564/564711/arquivos/parametros-t-cnicos.png) | Espessura 2–50 mm; peças 30 × 30 a 2500 × 3600 mm; avanço 0,5–7 m/min; 25 kW; 5500 kg; dimensões. |
| Lapidadora 9 rebolos inox / 23523155 | [Tabela ZM9325](https://cdn.awsli.com.br/564/564711/arquivos/Lapidadora%20Chinesa%20informacoes%20tecnicas.jpg) | Faixa 3–25 mm; avanço 0,8–8 m/min; 18,5 kW; 2800 kg; dimensões. Divergência com os 10 m/min do texto sinalizada na ficha. |
| Lavadora vertical / 25035495 | [Tabela por versão](https://cdn.awsli.com.br/564/564711/arquivos/especifica-es-t-cnicas-lavadora-de-vidro-vertical-1600---2000---2500-mm.jpg) | Faixa 3–19 mm; avanço 2–10 m/min; potência e peso separados para 1600, 2000 e 2500 mm. |
| Centro CNC / 398723570 | [Tabela de parâmetros](https://cdn.awsli.com.br/564/564711/arquivos/foto-parametro-tecnico.jpg) | Spindle de 15 kW; alimentação 380 V/60 Hz trifásica e indicação de 24 kW; curso Z; avanço de fresagem; quatro versões com curso XY, limite de lapidação e peso. |

As três primeiras imagens online foram baixadas e seus hashes SHA-256 comparados às imagens locais inspecionadas: iguais. A tabela do centro CNC foi baixada da URL atual e inspecionada diretamente. Campos ambíguos e unidades inconsistentes não foram convertidos em números novos.

## Divergências e limites preservados

- **397708527, mesa CNC 4200:** título e descrição principal indicam 4200 × 2800 mm; subtítulo cita 3600 mm. Observação incluída.
- **23523155, copo 9 rebolos:** tabela ZM9325 informa até 8 m/min; texto comercial cita até 10 m/min. Mantido o valor da tabela com indicação da divergência.
- **91095488, bilateral 20 rebolos:** título cita 2500 mm; descrição técnica cita 2000 mm. Potência publicada de 110 kW mantida como dado a confirmar para o conjunto ofertado.
- **402869343, furadeira 4 posições:** título indica quatro posições; texto menciona três pares de brocas. Não foi inferida uma nova contagem de cabeçotes.
- **25035495, lavadora vertical:** a tabela lista 3000 mm na coluna máxima da versão 2500 mm. Limite de lavagem e passagem Open Top indicado como ponto de confirmação. A indicação incompleta de peça mínima não foi transformada em duas dimensões.
- **398873522, forno EVA:** capacidade anunciada de 54 m²/ciclo mantida com observação sobre a disposição de carga não detalhada. Cabo recomendado não tratado como especificação universal de instalação.
- **364216038, carregadora móvel:** fonte informa potência total de 7 kW e “máx. 3 kW” sem explicar o regime. Removida a interpretação anterior de potência simultânea. Alimentação 50 Hz não convertida em 60 Hz.
- **343610648, robô:** “pressão de sucção: 5 kgf” não foi incorporada como pressão, pois kgf sozinho não é unidade de pressão.
- **278452532, laser:** 140 W identificado como potência do laser; 70 mm não apresentado como diâmetro ou profundidade garantida de furação.
- **398723570, centro CNC:** curso Z de 380 mm explicitamente diferenciado da espessura processável. Curso XY separado da área máxima de lapidação; fresagem em mm/min separada do avanço de lapidação em m/min.
- **384386974, 180212740 e 23525454:** ausência de parâmetros numéricos suficientes preservada; não foram preenchidos por analogia com modelos parecidos.

## Verificação

`node scripts/check_fichas.mjs` verifica cobertura dos 38 IDs, campos informativos, pares de especificações, remoções, tabelas de versões e regressões editoriais de modelos semelhantes.

`npm run build` verifica TypeScript e o pacote de produção. A verificação no navegador cobre abertura e leitura das fichas, tabelas e vínculo com o orçamento. O texto novo é em português e passa pelo mecanismo existente `t()`, que usa português como fallback para chaves ainda não traduzidas.
