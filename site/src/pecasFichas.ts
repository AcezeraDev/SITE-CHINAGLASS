/** Conteúdo de orientação para seleção. Especificações publicadas permanecem em pecasData.ts.
 * Medidas, materiais e compatibilidade não documentados devem ser confirmados na cotação.
 */
export type FichaPeca = {
  resumo: string
  aplicacao: string
  conferir: string[]
  confirmar: string[]
  orientacao: string
}

export const FICHAS_PECAS: Record<string, FichaPeca> = {
  "34607747": {
    resumo: "Bomba de reposição para o circuito de água da lapidadora chinesa de 9 rebolos China Glass. A seleção deve considerar os dados elétricos e a instalação hidráulica da máquina, além da aparência da bomba existente.",
    aplicacao: "Indicada no catálogo para a lapidadora 9 rebolos China Glass. A aplicação em outros modelos depende de conferência técnica; potência e vazão iguais, isoladamente, não garantem o encaixe.",
    conferir: [
      "Envie uma foto legível da placa da bomba atual e da identificação da lapidadora.",
      "Informe as medidas de fixação, o espaço disponível e as conexões de entrada e saída de água.",
      "Compare tensão e frequência da instalação com os valores publicados: 380 V e 60 Hz.",
    ],
    confirmar: ["Dimensões e padrão de fixação", "Conexões hidráulicas e altura manométrica", "Número de fases, ligação e itens inclusos"],
    orientacao: "A instalação e a ligação elétrica devem seguir o manual da máquina e ser realizadas por profissional habilitado. Informe também o problema observado no circuito para que a equipe avalie a reposição adequada.",
  },
  "34607867": {
    resumo: "Correia de reposição anunciada para lapidadora chinesa de 9 rebolos. Para identificar a versão correta, compare o perfil da correia instalada e sua marcação com o conjunto da máquina.",
    aplicacao: "Destinada à lapidadora 9 rebolos indicada no catálogo. A quantidade de rebolos identifica a aplicação anunciada, mas não define sozinha o comprimento, a largura ou o perfil da correia.",
    conferir: [
      "Fotografe a correia inteira, a região de encaixe e qualquer código impresso na peça.",
      "Informe largura, comprimento ou perímetro e, quando houver dentes, o passo e o perfil.",
      "Envie modelo e número de série da lapidadora e uma foto do conjunto onde a correia trabalha.",
    ],
    confirmar: ["Comprimento, largura e perfil", "Material e referência equivalente", "Forma de fornecimento e quantidade por máquina"],
    orientacao: "Na substituição, siga o procedimento de tensionamento e alinhamento do fabricante. Desgaste irregular pode exigir a inspeção dos componentes associados antes da montagem da nova correia.",
  },
  "34607434": {
    resumo: "Corrente de reposição para lapidadoras chinesas. O catálogo menciona máquinas China Glass e outras marcas; cada aplicação precisa ser identificada pelo conjunto instalado e pelas medidas dos elos.",
    aplicacao: "A indicação para outras marcas não representa compatibilidade universal. Passo, largura, comprimento e elementos de apoio devem corresponder à configuração da lapidadora.",
    conferir: [
      "Envie fotos dos elos, dos pinos, das superfícies de apoio e da união da corrente.",
      "Informe o passo entre pinos, a largura e o comprimento total ou a quantidade de elos.",
      "Identifique a marca e o modelo da máquina e informe se a necessidade é de trecho ou conjunto completo.",
    ],
    confirmar: ["Passo, largura e número de elos", "Tipo de apoio e união", "Fornecimento por trecho ou conjunto"],
    orientacao: "A condição das guias, rodas e pontos de ajuste deve ser avaliada durante a manutenção. Siga as instruções do fabricante para montagem, ajuste e eventual lubrificação do conjunto.",
  },
  "34607827": {
    resumo: "Amperímetro de painel para reposição em lapidadora chinesa. A identificação correta depende da escala, do sinal de entrada e das dimensões do instrumento instalado no painel.",
    aplicacao: "Utilizado para indicação de corrente elétrica no painel da lapidadora. O instrumento deve corresponder ao circuito de medição da máquina; a aparência frontal não confirma a equivalência elétrica.",
    conferir: [
      "Envie fotos nítidas da escala frontal, da etiqueta traseira e das identificações dos terminais.",
      "Informe a abertura do painel e as dimensões externas do amperímetro atual.",
      "Informe se há transformador de corrente no circuito e encaminhe sua identificação, quando disponível.",
    ],
    confirmar: ["Faixa de medição e tipo de corrente", "Sinal de entrada e relação do transformador, se aplicável", "Dimensões de montagem e terminais"],
    orientacao: "A seleção e a substituição devem ser realizadas por profissional habilitado, com base no diagrama elétrico da máquina. Não adote os números visíveis na foto como confirmação da versão fornecida.",
  },
  "34607582": {
    resumo: "Coifa de reposição para lapidadora chinesa. A identificação da peça deve considerar o formato do conjunto e os pontos de encaixe, pois o nome comercial não informa todas as dimensões necessárias.",
    aplicacao: "Anunciada para lapidadoras chinesas. Confirme com a equipe qual elemento da imagem corresponde à sua necessidade e se o fornecimento inclui uma peça individual ou mais componentes.",
    conferir: [
      "Envie uma foto da coifa instalada e outra da peça removida, quando possível.",
      "Informe os diâmetros de encaixe, a altura e o formato das bordas de fixação.",
      "Identifique o modelo da lapidadora e a posição da coifa no conjunto.",
    ],
    confirmar: ["Diâmetros, altura e geometria de encaixe", "Material e condições de uso", "Componentes e quantidade inclusos"],
    orientacao: "Na manutenção, verifique o estado das bordas e dos pontos de fixação. A reposição deve reproduzir o encaixe previsto pelo fabricante, sem adaptações que prejudiquem o movimento do conjunto.",
  },
  "34607701": {
    resumo: "Coifa para lapidadora chinesa anunciada com medida de 100 mm. Essa medida é a referência comercial publicada; a dimensão exata a que se refere deve ser confirmada antes do pedido.",
    aplicacao: "Destinada à reposição em lapidadoras chinesas com o encaixe correspondente. Não considere a indicação de 100 mm suficiente para confirmar todos os diâmetros e a altura da peça.",
    conferir: [
      "Envie uma foto da coifa e do local de instalação na lapidadora.",
      "Informe diâmetros interno e externo, altura e medidas das bordas de encaixe.",
      "Confirme com a equipe a qual dimensão corresponde a referência comercial de 100 mm.",
    ],
    confirmar: ["Referência dimensional dos 100 mm", "Demais medidas e padrão de encaixe", "Material e quantidade fornecida"],
    orientacao: "Compare a geometria completa da coifa antiga com a reposição. Siga o procedimento de montagem da máquina e confira se a peça permanece corretamente assentada durante o movimento do conjunto.",
  },
  "34607720": {
    resumo: "Coifa de reposição para biseladora chinesa e biseladora China Glass. O formato e a posição de montagem devem ser comparados com a peça atual para identificar a reposição adequada.",
    aplicacao: "A aplicação publicada inclui biseladoras chinesas e China Glass. A compatibilidade depende do modelo da máquina e das dimensões de fixação e abertura da coifa.",
    conferir: [
      "Fotografe a peça inteira, a abertura central e a região de fixação na biseladora.",
      "Informe comprimento, largura, abertura central e detalhes das bordas de encaixe.",
      "Envie a identificação da máquina e uma foto mostrando a posição da coifa instalada.",
    ],
    confirmar: ["Dimensões externas e abertura central", "Formato de fixação e material", "Versão compatível e quantidade fornecida"],
    orientacao: "Observe rasgos, deformações e perda de assentamento durante a inspeção. A escolha da reposição deve preservar o formato e a movimentação previstos para o conjunto da biseladora.",
  },
  "34607552": {
    resumo: "Escova para biseladora China Glass anunciada com medida de 100 mm. Para solicitar a reposição, identifique o perfil da escova, a base de fixação e o comprimento necessário.",
    aplicacao: "Indicada no catálogo para biseladora China Glass. A referência de 100 mm precisa ser relacionada à dimensão correta da escova; comprimento de fornecimento e perfil devem ser confirmados separadamente.",
    conferir: [
      "Envie fotos da escova inteira, das cerdas e do perfil da base de fixação.",
      "Informe o comprimento necessário, a largura da base e a altura das cerdas.",
      "Identifique a máquina e confirme com a equipe a qual dimensão se refere a medida de 100 mm.",
    ],
    confirmar: ["Referência dimensional dos 100 mm", "Perfil da base e material das cerdas", "Comprimento e unidade de fornecimento"],
    orientacao: "Na manutenção, observe falhas nas cerdas e danos na base de fixação. Confira o assentamento e o perfil da reposição com a peça instalada, seguindo as orientações do fabricante da biseladora.",
  },
} satisfies Record<string, FichaPeca>
