// Gerado por scripts/gen_maquinas.py a partir de ../chinaglass/dados. Não edite à mão.

export { CATEGORIAS_MAQUINAS, TOTAL_MAQUINAS, type CategoriaMaquina } from "./maquinasCategorias"

export type MaquinaCatalogo = {
  id: string
  codigo: string
  nome: string
  nomeOriginal: string
  tipo: string
  categorias: string[]
  imgs: string[]
  specs: [string, string][]
  comando: string
  marcas: string
  destaques: string
  fichaEmImagem: boolean
  videos: string[]
  url: string
}

export const MAQUINAS: MaquinaCatalogo[] = [
  {
    "id": "81770856",
    "codigo": "53ZJ3GGV7",
    "nome": "Linha de corte automática 4200 / 6100 mm (Jumbo)",
    "nomeOriginal": "Linha automática de corte de vidro 4200mm ou 6100mm (Jumbo) China Glass",
    "tipo": "Linha de corte (carregadora + mesa CNC + mesa de destaque)",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/81770856-1.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "4200 x 2800 mm ou 6100 x 3300 mm (Jumbo)"
      ],
      [
        "Automação",
        "Automática"
      ]
    ],
    "comando": "CNC Galil (EUA); PLC Omron; touch MCGS; inversor Teco",
    "marcas": "Cremalheira KHK; guias Hiwin; ferramenta Bohle; servos Yaskawa; Optima/Guiyou; AirTAC; Schneider; válvula SMC",
    "destaques": "Bomba de vácuo 40 m³/h; mesa de destaque com colchão de ar e barras 1+2",
    "fichaEmImagem": false,
    "videos": [
      "sL9pPqb8hpM"
    ],
    "url": "https://www.chinaglass.com.br/linha-automatica-de-corte-de-vidro-china-glass"
  },
  {
    "id": "217194615",
    "codigo": "TDS6AQK95",
    "nome": "Linha de corte de vidro laminado",
    "nomeOriginal": "Mesa corte vidro Laminado China Glass",
    "tipo": "Linha de corte de vidro laminado",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/217194615-1.webp",
      "/img/maquinas/217194615-2.webp",
      "/img/maquinas/217194615-3.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3+3 a 10+10 mm (filme PVB/EVA 0,38 – 1,52 mm)"
      ],
      [
        "Vidro mínimo",
        "200 x 200 mm"
      ],
      [
        "Vidro máximo",
        "3700 mm"
      ],
      [
        "Velocidade",
        "0 – 100 m/min"
      ],
      [
        "Potência",
        "24 kW"
      ],
      [
        "Alimentação",
        "380 V / 60 Hz"
      ],
      [
        "Ar comprimido",
        "0,8 MPa"
      ],
      [
        "Peso",
        "4000 kg"
      ],
      [
        "Dimensões",
        "7000 x 5200 x 900 mm (área de trabalho 7500 x 5500 mm)"
      ]
    ],
    "comando": "Servo posicionamento; válvula proporcional",
    "marcas": "",
    "destaques": "Paralelismo ±0,20 mm/m; diagonal ±0,25 mm/m; detecção de borda por fibra óptica; separação por aquecimento",
    "fichaEmImagem": false,
    "videos": [
      "LdA8OZYQGus"
    ],
    "url": "https://www.chinaglass.com.br/mesa-corte-vidro-laminado-china-glass"
  },
  {
    "id": "81769971",
    "codigo": "7YJ88YDUV",
    "nome": "Mesa de corte CNC 3 em 1 (3660 mm)",
    "nomeOriginal": "Mesa de corte vidro automática CNC China Glass 3660 mm ( 3 em 1 ) carregamento + corte + destaque",
    "tipo": "Mesa de corte CNC 3 em 1",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/81769971-1.webp",
      "/img/maquinas/81769971-2.webp",
      "/img/maquinas/81769971-3.webp",
      "/img/maquinas/81769971-4.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "3660 mm"
      ],
      [
        "Automação",
        "Automática (carrega + corta + destaca)"
      ],
      [
        "Área ocupada",
        "18 m²"
      ]
    ],
    "comando": "PLC (carregamento) + CNC (corte)",
    "marcas": "",
    "destaques": "Colchão de ar; corte XYZ; posicionamento a laser; servo motores e cremalheiras; Optima básico incluso",
    "fichaEmImagem": false,
    "videos": [
      "oXOgytF9Ayc"
    ],
    "url": "https://www.chinaglass.com.br/mesa-de-corte-cnc-china-glass-cripton"
  },
  {
    "id": "397708527",
    "codigo": "7YJ88YDUV-LOS9M9NMH",
    "nome": "Mesa de corte CNC 4200 × 2800 mm",
    "nomeOriginal": "Mesa de corte CNC para vidros planos China Glass 4200 x 2800 mm",
    "tipo": "Mesa de corte CNC",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/397708527-1.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "4200 x 2800 mm"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Vidro máximo",
        "4200 x 2800 mm"
      ]
    ],
    "comando": "PLC + CNC",
    "marcas": "",
    "destaques": "Colchão de ar; corte XYZ; posicionamento a laser; servo e cremalheira; Optima básico incluso",
    "fichaEmImagem": true,
    "videos": [
      "DN4xjATpx_I"
    ],
    "url": "https://www.chinaglass.com.br/los9m9nmh-mesa-de-corte-vidro-automatica-cnc-china-glass-3600-mm-3-em-1-carregamento-corte-destaque"
  },
  {
    "id": "344423780",
    "codigo": "7YJ88YDUV-GFH6J0INR",
    "nome": "Mesa de corte CNC XYZ 3600 mm",
    "nomeOriginal": "Mesa de corte vidro automática xyz CNC China Glass 3600 mm",
    "tipo": "Mesa de corte CNC XYZ",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/344423780-1.webp",
      "/img/maquinas/344423780-2.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "3660 x 2400 mm"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "2 – 19 mm"
      ],
      [
        "Vidro máximo",
        "3660 x 2400 mm"
      ],
      [
        "Velocidade",
        "0 – 160 m/min"
      ],
      [
        "Potência",
        "12,8 kW"
      ],
      [
        "Alimentação",
        "380 V / 50 Hz"
      ],
      [
        "Área ocupada",
        "18 m²"
      ]
    ],
    "comando": "CNC High Control Card; software OPTIMA (Itália)",
    "marcas": "Fonte Mean Well; sensor de borda Panasonic; fotoelétrico Carlo Gavazzi; Siemens/Schneider; AirTAC; ferramenta Bohle",
    "destaques": "Cabeça de corte 360°; controle remoto; 1 operador no lugar de 4",
    "fichaEmImagem": false,
    "videos": [],
    "url": "https://www.chinaglass.com.br/-mesa-de-corte-vidro-automatica-cnc-china-glass-3600"
  },
  {
    "id": "384386974",
    "codigo": "7YJ88YDUV-YDI3O8WN8",
    "nome": "Mesa de corte CNC XYZ com braço basculante",
    "nomeOriginal": "Mesa de corte CNC para vidros monolítico xyz, c/ função de braço basculante",
    "tipo": "Mesa de corte CNC XYZ basculante (monolítico)",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/384386974-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Página sem descrição em texto — só foto e vídeo",
    "fichaEmImagem": false,
    "videos": [
      "DjgUCXt1GGI"
    ],
    "url": "https://www.chinaglass.com.br/ydi3o8wn8-mesa-de-corte-vidro-automatica-cnc-china-glass"
  },
  {
    "id": "355640119",
    "codigo": "7YJ88YDUV-GFH6J0INR-D7HOT683O",
    "nome": "Mesa de corte CNC basculante 3600 mm",
    "nomeOriginal": "Mesa de corte vidro automática basculante CNC China Glass 3600 mm",
    "tipo": "Mesa de corte CNC XYZ basculante",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/355640119-1.webp",
      "/img/maquinas/355640119-2.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "3660 x 2400 mm"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "2 – 19 mm"
      ],
      [
        "Vidro máximo",
        "3660 x 2400 mm"
      ],
      [
        "Velocidade",
        "0 – 160 m/min"
      ],
      [
        "Potência",
        "12,8 kW"
      ],
      [
        "Alimentação",
        "380 V / 50 Hz"
      ],
      [
        "Área ocupada",
        "18 m²"
      ]
    ],
    "comando": "CNC High Control Card; software OPTIMA (Itália)",
    "marcas": "Mean Well; Panasonic; Carlo Gavazzi; Siemens/Schneider; AirTAC; Bohle",
    "destaques": "Mesa bascula para carregar o vidro; cabeça 360°; controle remoto",
    "fichaEmImagem": false,
    "videos": [
      "ctloGfgBGyg"
    ],
    "url": "https://www.chinaglass.com.br/-mesa-de-corte-vidro-automatica-xyz-cnc-china-glass-3600-mm"
  },
  {
    "id": "355775590",
    "codigo": "TDS6AQK95-5KFA3YVJM",
    "nome": "Mesa de corte de laminado semi-automática",
    "nomeOriginal": "Mesa corte vidro Laminado semi - automática China Glass",
    "tipo": "Mesa de corte de vidro laminado",
    "categorias": [
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/355775590-1.webp"
    ],
    "specs": [
      [
        "Modelo",
        "SLM-3826 / SLM-2621"
      ],
      [
        "Automação",
        "Semi-automática"
      ],
      [
        "Espessura",
        "2+0,38+2 a 8+3,04+8 mm"
      ],
      [
        "Vidro mínimo",
        "100 x 100 mm"
      ],
      [
        "Vidro máximo",
        "2500 x 2000 mm / 3770 x 2550 mm"
      ],
      [
        "Velocidade",
        "1 chapa a cada 2 – 4 min"
      ],
      [
        "Dimensões",
        "SLM-3826: 4800 x 2150 x 1150 mm; SLM-2621: 3400 x 2400 x 1150 mm"
      ]
    ],
    "comando": "CLP Delta; servo Huichuan (Inovance); touch Haiwei com controle remoto",
    "marcas": "AirTAC; guias Taiwan; placa E0 e feltro de Taiwan",
    "destaques": "Precisão ±1 mm; diagonal ±2 mm/m; vida da roda 30–50 mil m; aquecimento infravermelho; 1–2 operadores",
    "fichaEmImagem": false,
    "videos": [
      "N261B0GBGrg"
    ],
    "url": "https://www.chinaglass.com.br/-mesa-corte-vidro-laminado-china-glass"
  },
  {
    "id": "211000219",
    "codigo": "UH7Y7G7XC",
    "nome": "Canteadeira automática",
    "nomeOriginal": "Máquina canteadeira automática China Glass tamanhos 1000 / 1600 / 2300 mm",
    "tipo": "Canteadeira (lapidação de cantos)",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/211000219-1.webp",
      "/img/maquinas/211000219-2.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1000 / 1600 / 2300 mm"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 15 mm"
      ],
      [
        "Vidro mínimo",
        "350 x 350 mm"
      ],
      [
        "Vidro máximo",
        "largura 1000 / 1600 / 2300 mm"
      ],
      [
        "Velocidade",
        "≈ 3 peças/min"
      ],
      [
        "Rebolos / motores",
        "2 rebolos por mandril (desbaste + polimento)"
      ],
      [
        "Potência",
        "6 kW"
      ]
    ],
    "comando": "PLC + IHM touch; servo motor e guia linear",
    "marcas": "",
    "destaques": "Raios R5 a R60 (3 raios inclusos); detecção automática do vidro; cabeçotes pneumáticos; lubrificação automática",
    "fichaEmImagem": false,
    "videos": [
      "i1LZnHxgQGU"
    ],
    "url": "https://www.chinaglass.com.br/maquina-canteadeira-automatica-china-glass-tamanhos-1000-1600-2300-mm"
  },
  {
    "id": "242693919",
    "codigo": "TZ6TYJS7K-3MTW9EVYU",
    "nome": "Lapidadora copo 10 rebolos inox",
    "nomeOriginal": "Lapidadora de vidro copo 10 rebolos Inox automática China Glass",
    "tipo": "Lapidadora retilínea (copo)",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/242693919-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Rebolos / motores",
        "10 rebolos"
      ]
    ],
    "comando": "CLP + touchscreen + painel digital (espessura, velocidade, contagem de peças)",
    "marcas": "",
    "destaques": "Vigas em caixa de aço; trilhos com aço temperado (vida 10x maior); rolamento de esferas na transmissão; inversor + redutor RV; carcaça inox",
    "fichaEmImagem": true,
    "videos": [
      "tyxofaLkk2Q"
    ],
    "url": "https://www.chinaglass.com.br/-lapidadora-de-vidro-copo-10-rebolos-china-glass"
  },
  {
    "id": "26195533",
    "codigo": "Lapidadorachinesa9325A",
    "nome": "Lapidadora copo 9 rebolos com display digital",
    "nomeOriginal": "Lapidadora de Vidro Copo 9 rebolos c/ ajuste cavalete e Display Digital para abrir e fechar o bloco, caregangens INOX - 380v 60hz",
    "tipo": "Lapidadora retilínea (copo)",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/26195533-1.webp",
      "/img/maquinas/26195533-2.webp",
      "/img/maquinas/26195533-3.webp",
      "/img/maquinas/26195533-4.webp"
    ],
    "specs": [
      [
        "Modelo",
        "ZM9325A (modelo display digital \"A\")"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "até 19 mm"
      ],
      [
        "Vidro mínimo",
        "80 x 80 mm"
      ],
      [
        "Velocidade",
        "até 8 m/min"
      ],
      [
        "Rebolos / motores",
        "9 rebolos"
      ],
      [
        "Alimentação",
        "380 V / 60 Hz"
      ]
    ],
    "comando": "Display digital; ajuste de espessura por motor",
    "marcas": "Motores JIANQIANG; correia Nylon (Itália)",
    "destaques": "Desbaste, fino, polimento e chanfro em uma passada; motor de esteira 2,2 kW com caixa helicoidal; cavalete com ajuste; carenagens inox",
    "fichaEmImagem": true,
    "videos": [
      "jDqQYmte3IU"
    ],
    "url": "https://www.chinaglass.com.br/lapidadora-de-vidro-copo-9-rebolos-c-ajuste-cavalete"
  },
  {
    "id": "23523155",
    "codigo": "TZ6TYJS7K",
    "nome": "Lapidadora copo 9 rebolos inox automática",
    "nomeOriginal": "Lapidadora de vidro em Inox copo 9 rebolos automática China Glass",
    "tipo": "Lapidadora retilínea (copo)",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/23523155-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "até 25 mm (extra clear)"
      ],
      [
        "Velocidade",
        "até 10 m/min"
      ],
      [
        "Rebolos / motores",
        "9 rebolos"
      ]
    ],
    "comando": "Display digital (velocidade e espessura por motor); inversor de frequência no transporte",
    "marcas": "",
    "destaques": "Último motor com 2 velocidades (3400 rpm polimento / 1700 rpm óxido de cério); correias Nylon AT20 com guias em Nylon; estrutura fundida recozida; suporte em alumínio; tanque inox",
    "fichaEmImagem": true,
    "videos": [
      "jDqQYmte3IU"
    ],
    "url": "https://www.chinaglass.com.br/lapidadora-de-copo-com-9-rebolos"
  },
  {
    "id": "299665459",
    "codigo": "U27GLLRKK",
    "nome": "Lapidadora copo 9 rebolos inox com PLC Siemens",
    "nomeOriginal": "Lapidadora de Vidro Copo 9 rebolos Inox c/ PLC Siemens - 380v 60hz",
    "tipo": "Lapidadora retilínea (copo)",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/299665459-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 25 mm"
      ],
      [
        "Vidro mínimo",
        "80 x 80 mm"
      ],
      [
        "Vidro máximo",
        "2500 x 2500 mm"
      ],
      [
        "Velocidade",
        "0,5 – 6 m/min"
      ],
      [
        "Rebolos / motores",
        "9 rebolos"
      ],
      [
        "Potência",
        "19 kW"
      ],
      [
        "Alimentação",
        "380 V / 60 Hz"
      ],
      [
        "Peso",
        "3100 kg"
      ],
      [
        "Dimensões",
        "6400 x 1000 x 2500 mm"
      ]
    ],
    "comando": "PLC + IHM Siemens",
    "marcas": "Elétrica Schneider; PLC/IHM Siemens",
    "destaques": "Lapidação máx. topo 3 mm; filete 2,5 mm; carenagem inox",
    "fichaEmImagem": true,
    "videos": [
      "jDqQYmte3IU"
    ],
    "url": "https://www.chinaglass.com.br/lapidadora_plc"
  },
  {
    "id": "277831702",
    "codigo": "Z4YARJGKF",
    "nome": "Linha de lapidação bilateral 20 ou 24 motores",
    "nomeOriginal": "Linha lapidação bilateral China Glass 20 motores ou 24 motores com transfer l ou em linha",
    "tipo": "Linha de lapidação bilateral",
    "categorias": [
      "lapidacao",
      "bilateral"
    ],
    "imgs": [
      "/img/maquinas/277831702-1.webp",
      "/img/maquinas/277831702-2.webp",
      "/img/maquinas/277831702-3.webp",
      "/img/maquinas/277831702-4.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "Transfer em L ou em linha"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Rebolos / motores",
        "20 ou 24 motores"
      ]
    ],
    "comando": "PLC Inovance + touchscreen MCGS; inversor Inovance",
    "marcas": "Motor CDQC; fusos e guias HIWIN; rolamentos NSK/HRB; redutor STARTSHINE; encoder OMRON; elétrica ABB; pneumática AirTAC; correia MEGADYNE (Itália); cabos Chancheng",
    "destaques": "Base em tubo de 12 mm; polimento pneumático; autolimpeza da correia (Low-E); lubrificação automática; trilho inox 304; tanque inox; suporte central móvel",
    "fichaEmImagem": false,
    "videos": [
      "P1JNHaUUWD4"
    ],
    "url": "https://www.chinaglass.com.br/linha-lapidacao-bilateral-china-glass"
  },
  {
    "id": "34607018",
    "codigo": "Modelada-ChinaGlass",
    "nome": "Modeladora semi-automática",
    "nomeOriginal": "Biseladora e Lapidadora Modeladora de vidros Chinesa semi-automática China Glass",
    "tipo": "Modeladora (lapidadora/biseladora de formas)",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/34607018-1.webp",
      "/img/maquinas/34607018-2.webp",
      "/img/maquinas/34607018-3.webp",
      "/img/maquinas/34607018-4.webp"
    ],
    "specs": [
      [
        "Automação",
        "Semi-automática"
      ]
    ],
    "comando": "Manual para formatos; automático para peças redondas",
    "marcas": "Rolamentos NSK; elétrica Schneider",
    "destaques": "Vidros ovais/irregulares; mesa giratória com 9 ventosas a vácuo; moto-mandril 2 velocidades com inclinação; cilindro pneumático; estrutura em ferro fundido",
    "fichaEmImagem": true,
    "videos": [
      "i0XiZ3EiD48"
    ],
    "url": "https://www.chinaglass.com.br/modeladora-de-vidros-chinesa-semi-automatica-china-glass-cgyx1321"
  },
  {
    "id": "25036002",
    "codigo": "HS3B7BRU5",
    "nome": "Turnover: mesa de transferência automática",
    "nomeOriginal": "Turnover mesa de transferência de vidros automática p/ linha de Lapidação China Glass",
    "tipo": "Turnover / mesa de transferência",
    "categorias": [
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/25036002-1.webp",
      "/img/maquinas/25036002-2.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Vidro mínimo",
        "350 x 350 mm"
      ],
      [
        "Vidro máximo",
        "3600 x 2400 mm"
      ],
      [
        "Velocidade",
        "3 – 5 peças/min"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Para linha de lapidação (5ª geração); opera 24 h; elimina em média 3 funcionários; normas CE",
    "fichaEmImagem": false,
    "videos": [
      "StEaWtlA7So"
    ],
    "url": "https://www.chinaglass.com.br/mesa-vertical-de-transferencia-automatica"
  },
  {
    "id": "180212740",
    "codigo": "KEXL99YEM",
    "nome": "Bilateral periférica 12 ou 8 rebolos",
    "nomeOriginal": "Bilateral 12 rebolos / 8 rebolos periférica China Glass",
    "tipo": "Linha bilateral periférica",
    "categorias": [
      "bilateral"
    ],
    "imgs": [
      "/img/maquinas/180212740-1.webp",
      "/img/maquinas/180212740-2.webp",
      "/img/maquinas/180212740-3.webp",
      "/img/maquinas/180212740-4.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Rebolos / motores",
        "12 ou 8 rebolos"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Página só traz layouts em imagem",
    "fichaEmImagem": true,
    "videos": [],
    "url": "https://www.chinaglass.com.br/bilateral-12-rebolos-periferica-china-glass"
  },
  {
    "id": "91095488",
    "codigo": "lapidadora_bilateral",
    "nome": "Lapidadora bilateral 20 rebolos",
    "nomeOriginal": "Lapidadora de vidros Bilateral China Glass 20 rebolos - tamanhos 1500mm 2500mm e 4200mm",
    "tipo": "Lapidadora bilateral",
    "categorias": [
      "bilateral"
    ],
    "imgs": [
      "/img/maquinas/91095488-1.webp",
      "/img/maquinas/91095488-2.webp",
      "/img/maquinas/91095488-3.webp",
      "/img/maquinas/91095488-4.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1500 / 2000 / 4200 mm (o título cita 2500 mm)"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 25 mm"
      ],
      [
        "Vidro mínimo",
        "350 x 350 mm"
      ],
      [
        "Velocidade",
        "1 – 7 m/min"
      ],
      [
        "Rebolos / motores",
        "20 rebolos (10 por lado)"
      ],
      [
        "Potência",
        "110 kW"
      ],
      [
        "Alimentação",
        "380 V / 60 Hz"
      ],
      [
        "Ar comprimido",
        "0,4 – 0,6 MPa"
      ]
    ],
    "comando": "PLC Siemens + touchscreen; ajuste automático de largura, espessura e filetes",
    "marcas": "Motores ABB; correias Barbieri (Itália); Schneider; PLC Siemens; encoders Nemicon (Japão)",
    "destaques": "Desbaste máx. 2 mm (borda) / 3 mm (filete); abertura do bloco 4 m/min; mesa 920 mm; tabela de rebolos completa na descrição",
    "fichaEmImagem": false,
    "videos": [
      "P1JNHaUUWD4"
    ],
    "url": "https://www.chinaglass.com.br/lapidadora-de-vidros-bilateral-china-glass-20-rebolos-tamanhos-1500mm-2500mm-e-4200mm"
  },
  {
    "id": "81791287",
    "codigo": "4BBKW8DGV",
    "nome": "Biseladora 9 rebolos",
    "nomeOriginal": "Biseladora de Vidros 9 rebolos com Display Digital ou PLC Siemens",
    "tipo": "Biseladora retilínea",
    "categorias": [
      "biseladora"
    ],
    "imgs": [
      "/img/maquinas/81791287-1.webp",
      "/img/maquinas/81791287-2.webp",
      "/img/maquinas/81791287-3.webp",
      "/img/maquinas/81791287-4.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 19 mm"
      ],
      [
        "Vidro mínimo",
        "100 x 100 mm"
      ],
      [
        "Vidro máximo",
        "4000 x 4000 mm"
      ],
      [
        "Velocidade",
        "0,7 – 4,5 m/min"
      ],
      [
        "Rebolos / motores",
        "9 rebolos"
      ],
      [
        "Potência",
        "21,5 kW"
      ],
      [
        "Peso",
        "4000 kg"
      ]
    ],
    "comando": "Display digital ou PLC Siemens",
    "marcas": "Motores CDQC",
    "destaques": "Bisotê em espelhos e vidros",
    "fichaEmImagem": true,
    "videos": [
      "HIERWwt47q4"
    ],
    "url": "https://www.chinaglass.com.br/biseladora-com-display-digital-china-glass-motores-abb"
  },
  {
    "id": "55679219",
    "codigo": "WP2V7TKNJ",
    "nome": "Furadeira 3 posições duplo cabeçote",
    "nomeOriginal": "Furadeira 3 Posições com duplo cabeçotes semi automática c/ opcional de 100% automática",
    "tipo": "Furadeira 3 posições",
    "categorias": [
      "furadeira"
    ],
    "imgs": [
      "/img/maquinas/55679219-1.webp",
      "/img/maquinas/55679219-2.webp"
    ],
    "specs": [
      [
        "Automação",
        "Semi-automática (opcional 100% automática)"
      ],
      [
        "Espessura",
        "3 – 40 mm"
      ],
      [
        "Vidro máximo",
        "2200 x 3000 mm"
      ],
      [
        "Potência",
        "9 kW"
      ],
      [
        "Peso",
        "850 kg"
      ],
      [
        "Dimensões",
        "2200 x 2200 x 1700 mm"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Furos Ø5 – Ø110 mm; duplo cabeçote; mesa flutuante; altura da mesa 1000 mm",
    "fichaEmImagem": false,
    "videos": [
      "NUCIqrACKY0"
    ],
    "url": "https://www.chinaglass.com.br/furadeira-3-posicoes-com-duplo-cabecotes"
  },
  {
    "id": "402869343",
    "codigo": "WP2V7TKNJ-XV78XNSHI",
    "nome": "Furadeira 4 posições duplo cabeçote",
    "nomeOriginal": "Furadeira 4 Posições com duplo cabeçotes semi- automática c/ opcional 100% automática",
    "tipo": "Furadeira 4 posições",
    "categorias": [
      "furadeira"
    ],
    "imgs": [
      "/img/maquinas/402869343-1.webp",
      "/img/maquinas/402869343-2.webp"
    ],
    "specs": [
      [
        "Automação",
        "Semi-automática (opcional 100% automática)"
      ],
      [
        "Espessura",
        "3 – 40 mm"
      ],
      [
        "Vidro máximo",
        "2200 x 3000 mm"
      ],
      [
        "Potência",
        "12 kW"
      ],
      [
        "Peso",
        "850 kg"
      ],
      [
        "Dimensões",
        "2600 x 2200 x 1700 mm"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Furos Ø5 – Ø110 mm; duplo cabeçote; mesa em inox flutuante; altura da mesa 1000 mm",
    "fichaEmImagem": false,
    "videos": [],
    "url": "https://www.chinaglass.com.br/furadeira-4-posicoes-com-duplo-cabecotes"
  },
  {
    "id": "23525454",
    "codigo": "S8JQBH89S",
    "nome": "Furadeira automática duplo cabeçote",
    "nomeOriginal": "Furadeira de vidro automática duplo cabeçote",
    "tipo": "Furadeira",
    "categorias": [
      "furadeira"
    ],
    "imgs": [
      "/img/maquinas/23525454-1.webp",
      "/img/maquinas/23525454-2.webp",
      "/img/maquinas/23525454-3.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Duplo cabeçote; fixação pneumática; mesa pneumática; display",
    "fichaEmImagem": false,
    "videos": [
      "zOP5yQzZLzE"
    ],
    "url": "https://www.chinaglass.com.br/furadeira-automatica"
  },
  {
    "id": "59082959",
    "codigo": "D5F3SYD5N",
    "nome": "Lavadora horizontal inox",
    "nomeOriginal": "Lavadora de vidros Inox horizontal China Glass- tamanhos: 1200 mm , 1600mm e 2000mm",
    "tipo": "Lavadora horizontal",
    "categorias": [
      "lavadora"
    ],
    "imgs": [
      "/img/maquinas/59082959-1.webp",
      "/img/maquinas/59082959-2.webp",
      "/img/maquinas/59082959-3.webp",
      "/img/maquinas/59082959-4.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1200 / 1600 / 2000 mm"
      ],
      [
        "Automação",
        "Automática"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "4 pares de escovas + 3 pares de rolos de esponja; secagem com ar quente regulável; peças em contato com água em inox; layout 1200 mm na página",
    "fichaEmImagem": false,
    "videos": [
      "qcvIXuZBbXo"
    ],
    "url": "https://www.chinaglass.com.br/lavadora-vidro-horizontal-china-glass"
  },
  {
    "id": "34607218",
    "codigo": "Lavadora-Chinesa",
    "nome": "Lavadora horizontal inox com turbo ventilador",
    "nomeOriginal": "Lavadora de Vidros Horizontal Inox China Glass com turbo ventilador - Tamanhos 1600mm, 2000mm e 2500mm 380V - 60HZ -Low-e opcional",
    "tipo": "Lavadora horizontal com turbo ventilador",
    "categorias": [
      "lavadora"
    ],
    "imgs": [
      "/img/maquinas/34607218-1.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1600 / 2000 / 2500 mm"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 25 mm"
      ],
      [
        "Vidro mínimo",
        "350 x 350 mm (2500: 400 x 400)"
      ],
      [
        "Velocidade",
        "0 – 10 m/min (2500: 0,5 – 12)"
      ],
      [
        "Potência",
        "17 / 25 / 28 kW"
      ],
      [
        "Alimentação",
        "380 V / 60 Hz"
      ],
      [
        "Peso",
        "1800 / 2800 / 3500 kg"
      ],
      [
        "Dimensões",
        "1600: 4200x2500x2200; 2000: 5700x3000x2400; 2500: 5700x3500x2500 mm"
      ]
    ],
    "comando": "Inversor de frequência; display digital",
    "marcas": "Elétrica Schneider",
    "destaques": "3 escovas em cima + 3 embaixo; 2 pares de facas de ar; Low-E opcional (escova lisa); tanque de água quente opcional; elevação de 350 mm do topo (opcional)",
    "fichaEmImagem": false,
    "videos": [
      "OtZFcYnrRuE"
    ],
    "url": "https://www.chinaglass.com.br/lavadora-de-vidros-chinesa-2500mm-china-glass"
  },
  {
    "id": "25035495",
    "codigo": "AFLYRWZK3",
    "nome": "Lavadora vertical Open Top",
    "nomeOriginal": "Lavadora de vidro vertical China Glass Open Top. Tamanhos 1600mm - 2000mm - 2500mm",
    "tipo": "Lavadora vertical Open Top",
    "categorias": [
      "lavadora"
    ],
    "imgs": [
      "/img/maquinas/25035495-1.webp",
      "/img/maquinas/25035495-2.webp",
      "/img/maquinas/25035495-3.webp",
      "/img/maquinas/25035495-4.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1600 / 2000 / 2500 mm"
      ],
      [
        "Automação",
        "Automática"
      ]
    ],
    "comando": "",
    "marcas": "Detector OMRON",
    "destaques": "3 pares de escovas; 4 jatos turbo; 4 facas de ar inox com aquecimento até 40 °C; caixa em inox 8/5/2 mm; projeto italiano; detecta vidro revestido",
    "fichaEmImagem": false,
    "videos": [
      "sxBv1-2eamo"
    ],
    "url": "https://www.chinaglass.com.br/lavadora-vertical-2500l"
  },
  {
    "id": "35239646",
    "codigo": "Jateadoradevidros",
    "nome": "Jateadora automática M3",
    "nomeOriginal": "Jateadora de vidros automática China Glass tam. 1600 mm / 2000mm / 2500mm",
    "tipo": "Jateadora automática",
    "categorias": [
      "jateadora"
    ],
    "imgs": [
      "/img/maquinas/35239646-1.webp",
      "/img/maquinas/35239646-2.webp",
      "/img/maquinas/35239646-3.webp",
      "/img/maquinas/35239646-4.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1600 / 2000 / 2500 mm"
      ],
      [
        "Modelo",
        "Série M3 (3ª geração)"
      ],
      [
        "Automação",
        "Automática / manual"
      ],
      [
        "Velocidade",
        "até 30 m²/h"
      ]
    ],
    "comando": "PLC Mitsubishi + touchscreen",
    "marcas": "Elétrica Siemens",
    "destaques": "3 pistolas automáticas + 1 manual; bicos de material especial; compressor não acompanha",
    "fichaEmImagem": true,
    "videos": [
      "sO6wU7-21Yc"
    ],
    "url": "https://www.chinaglass.com.br/jateadora-de-vidros-china-glass"
  },
  {
    "id": "278452532",
    "codigo": "CP8RHGPFP",
    "nome": "Marcação a laser 140 W",
    "nomeOriginal": "Máquina de Marcação a Laser 140w China Glass",
    "tipo": "Gravação / marcação a laser",
    "categorias": [
      "laser",
      "jateadora"
    ],
    "imgs": [
      "/img/maquinas/278452532-1.webp",
      "/img/maquinas/278452532-2.webp",
      "/img/maquinas/278452532-3.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática (CNC)"
      ],
      [
        "Espessura",
        "até 70 mm"
      ],
      [
        "Vidro máximo",
        "1300 x 2500 mm"
      ],
      [
        "Potência do laser",
        "140 W"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "5 eixos; lente 3D; trilho vertical; viga de alumínio aeronáutico; mesa PVC 2,5 cm; chiller duplo 26–28 °C; também fura; exclusivo China Glass",
    "fichaEmImagem": true,
    "videos": [
      "i5IIhwUN0ss"
    ],
    "url": "https://www.chinaglass.com.br/maquina-de-marcacao-a-laser-140w"
  },
  {
    "id": "398723570",
    "codigo": "LJR2MQSYB-FAKKMJPHA",
    "nome": "Centro de usinagem CNC",
    "nomeOriginal": "Centro de Usinagem CNC para Vidro China Glass – Alta Precisão e Versatilidade",
    "tipo": "Centro de usinagem CNC",
    "categorias": [
      "centro-usinagem"
    ],
    "imgs": [
      "/img/maquinas/398723570-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática (CNC 3 eixos)"
      ]
    ],
    "comando": "CNC baseado em PC; acesso remoto",
    "marcas": "",
    "destaques": "Spindle até 15.000 rpm refrigerado a água; troca automática de ferramentas; dupla estação; ferro fundido; lapida, fura, fresa e pole formatos",
    "fichaEmImagem": true,
    "videos": [
      "bmHs9fDjkNo"
    ],
    "url": "https://www.chinaglass.com.br/centro_usinagem_cnc"
  },
  {
    "id": "398873522",
    "codigo": "YJ2YT634Z",
    "nome": "Forno de laminação EVA 3 bandejas",
    "nomeOriginal": "Forno para Laminação de Vidros EVA com 3 Bandejas",
    "tipo": "Forno de laminação EVA",
    "categorias": [
      "forno-eva"
    ],
    "imgs": [
      "/img/maquinas/398873522-1.webp"
    ],
    "specs": [
      [
        "Modelo",
        "3 bandejas"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Vidro máximo",
        "2000 x 3000 mm"
      ],
      [
        "Velocidade",
        "ciclo de 90 – 140 min"
      ],
      [
        "Capacidade",
        "até 54 m² por ciclo"
      ],
      [
        "Potência",
        "55 kW"
      ],
      [
        "Alimentação",
        "Conforme padrão do cliente (cabo 25 mm²)"
      ],
      [
        "Peso",
        "3500 kg"
      ],
      [
        "Dimensões",
        "2530 x 4000 x 2120 mm (piso 3720 x 9000 mm)"
      ]
    ],
    "comando": "PLC Siemens Smart + IHM",
    "marcas": "",
    "destaques": "60 – 150 °C; vácuo independente por saco; abertura automática; autoaprendizagem; elevador hidráulico; isolamento 50 mm; monitoramento remoto",
    "fichaEmImagem": false,
    "videos": [],
    "url": "https://www.chinaglass.com.br/forno-laminacao-vidros"
  },
  {
    "id": "364216038",
    "codigo": "LJR2MQSYB",
    "nome": "Carregadora móvel 3660 mm com controle remoto",
    "nomeOriginal": "Carregadora para mesa de corte 3660 mm automática com movimento ( frente, trás, direita e esquerda ) por controle remoto",
    "tipo": "Carregadora móvel para mesa de corte",
    "categorias": [
      "carregadoras",
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/364216038-1.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "3660 mm"
      ],
      [
        "Automação",
        "Automática + controle remoto"
      ],
      [
        "Espessura",
        "2 – 19 mm"
      ],
      [
        "Capacidade",
        "1,5 t"
      ],
      [
        "Potência",
        "7 (máx. 3 simultâneos) kW"
      ],
      [
        "Alimentação",
        "380 V / 50 Hz trifásico"
      ],
      [
        "Dimensões",
        "3660 x 2100 x 800 mm"
      ]
    ],
    "comando": "PLC alemão; inversores 3,7 kW",
    "marcas": "Sensor Delixi; contatores Chint",
    "destaques": "Movimento 4D (frente/trás/direita/esquerda) por controle remoto; 3 braços com 12 ventosas; redutor RV; freio de emergência",
    "fichaEmImagem": false,
    "videos": [
      "5SBeBR-S3aw"
    ],
    "url": "https://www.chinaglass.com.br/carregadora-para-mesa-de-corte-3600-mm-automatica-com-movimento-frente-tras-direita-e-esquerda-por-controle-remoto"
  },
  {
    "id": "237682619",
    "codigo": "JPFSBW3HE",
    "nome": "Carregadora para lapidadora bilateral",
    "nomeOriginal": "Carregadora para lapidadora bilateral",
    "tipo": "Carregadora para bilateral",
    "categorias": [
      "carregadoras",
      "bilateral"
    ],
    "imgs": [
      "/img/maquinas/237682619-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 19 mm"
      ],
      [
        "Vidro mínimo",
        "600 x 400 mm"
      ],
      [
        "Vidro máximo",
        "3000 x 2000 mm"
      ],
      [
        "Velocidade",
        "4 – 6 peças/min"
      ],
      [
        "Potência",
        "19,7 kW"
      ],
      [
        "Ar comprimido",
        "0,6 MPa"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Ventosas do cavalete para mesa de alinhamento; elimina 1–2 funcionários; sob medida",
    "fichaEmImagem": false,
    "videos": [
      "-RI-cCwuhCg"
    ],
    "url": "https://www.chinaglass.com.br/carregadora-e-descarregadora-para-lapidadora-bilateral"
  },
  {
    "id": "380647494",
    "codigo": "ALNZSDHWC",
    "nome": "Carregadora para lapidadora vertical",
    "nomeOriginal": "Carregadora para Lapidadora Vertical China Glass",
    "tipo": "Carregadora para lapidadora vertical",
    "categorias": [
      "carregadoras"
    ],
    "imgs": [
      "/img/maquinas/380647494-1.webp",
      "/img/maquinas/380647494-2.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Vidro mínimo",
        "400 x 400 mm"
      ],
      [
        "Vidro máximo",
        "3600 x 2400 mm"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Configurável por cliente",
    "fichaEmImagem": false,
    "videos": [
      "dWU0sZQl6K0"
    ],
    "url": "https://www.chinaglass.com.br/oe183pr58-carregadora-e-desgarregadora-p-lapidadora-vertical"
  },
  {
    "id": "275917064",
    "codigo": "5TTZSGWXT",
    "nome": "Carregadora para mesa de corte (1 a 6 cavaletes)",
    "nomeOriginal": "Carregadora de chapas de vidro para mesa de corte CNC automática p/ 1 cavalete / 2 cavaletes / 4 cavaletes / 6 cavaletes",
    "tipo": "Carregadora para mesa de corte",
    "categorias": [
      "carregadoras",
      "mesa-de-corte"
    ],
    "imgs": [
      "/img/maquinas/275917064-1.webp"
    ],
    "specs": [
      [
        "Tamanhos",
        "1, 2, 4 ou 6 cavaletes"
      ],
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "3 – 19 mm"
      ]
    ],
    "comando": "PLC Teco; touch MCGS (inglês); inversor Teco; sensor Omron",
    "marcas": "",
    "destaques": "Profundidade de sucção 750 mm; bomba de vácuo 40 m³/h; ponte em aço Q345A; rodas PU; modos automático e manual",
    "fichaEmImagem": false,
    "videos": [
      "WAgEPEicOCs"
    ],
    "url": "https://www.chinaglass.com.br/carregadora-de-chapas-para-mesa-de-corte-chinaglass"
  },
  {
    "id": "343610648",
    "codigo": "crP2MGCS9Q3",
    "nome": "Carregadora robótica 4 eixos para bilateral",
    "nomeOriginal": "Carregadora de vidros automática p/ Lapidadora Bilateral com Ventosa – 4 Eixos",
    "tipo": "Carregadora robótica para bilateral (4 eixos)",
    "categorias": [
      "carregadoras",
      "lapidacao",
      "bilateral"
    ],
    "imgs": [
      "/img/maquinas/343610648-1.webp",
      "/img/maquinas/343610648-2.webp",
      "/img/maquinas/343610648-3.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Espessura",
        "2 – 12 mm"
      ],
      [
        "Vidro mínimo",
        "200 x 300 mm"
      ],
      [
        "Vidro máximo",
        "800 x 1800 mm"
      ],
      [
        "Velocidade",
        "5 – 7 peças/min"
      ],
      [
        "Capacidade",
        "8 – 50 kg"
      ],
      [
        "Potência",
        "5 kW"
      ]
    ],
    "comando": "PLC + touchscreen; servo motores",
    "marcas": "",
    "destaques": "Eixos X/Y, Z e rotação A 180°; estrutura em alumínio; ventosas sob medida",
    "fichaEmImagem": false,
    "videos": [
      "FoPNe9BR2q8"
    ],
    "url": "https://www.chinaglass.com.br/carregadora-vidro-bilateral"
  },
  {
    "id": "380651875",
    "codigo": "ULRL2WECW",
    "nome": "Descarregadora para lapidadora vertical",
    "nomeOriginal": "Descarregadora para Lapidadora Vertical China Glass",
    "tipo": "Descarregadora para lapidadora vertical",
    "categorias": [
      "carregadoras",
      "lapidacao"
    ],
    "imgs": [
      "/img/maquinas/380651875-1.webp",
      "/img/maquinas/380651875-2.webp"
    ],
    "specs": [
      [
        "Automação",
        "Automática"
      ],
      [
        "Vidro mínimo",
        "400 x 400 mm"
      ],
      [
        "Vidro máximo",
        "3600 x 2400 mm"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Configurável por cliente",
    "fichaEmImagem": false,
    "videos": [
      "KShpWqMOptU"
    ],
    "url": "https://www.chinaglass.com.br/descarregadora-para-lapidadora-vertical-china-glass"
  },
  {
    "id": "400260991",
    "codigo": "WW7MRC9LT",
    "nome": "Elevador a vácuo com braço articulado",
    "nomeOriginal": "Elevador de vidro a vácuo com braço articulado – China Glass",
    "tipo": "Elevador a vácuo com braço articulado",
    "categorias": [
      "carregadoras"
    ],
    "imgs": [
      "/img/maquinas/400260991-1.webp",
      "/img/maquinas/400260991-2.webp",
      "/img/maquinas/400260991-3.webp",
      "/img/maquinas/400260991-4.webp"
    ],
    "specs": [
      [
        "Automação",
        "Manual assistida (bateria + controle remoto)"
      ],
      [
        "Capacidade",
        "400 kg (4 ventosas)"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Braço hidráulico; elevação até 3,5 m; inclinação para instalação; monitoramento de vácuo, anti-queda e alarme; a bateria; exclusivo China Glass no Brasil",
    "fichaEmImagem": false,
    "videos": [],
    "url": "https://www.chinaglass.com.br/elevador-de-vidro-chinaglass"
  },
  {
    "id": "401747760",
    "codigo": "WW7MRC9LT-M3IWU1C7I-9GOPZPQ8E",
    "nome": "Ventosa elétrica a bateria 400 kg",
    "nomeOriginal": "Ventosa elétrica a bateria para movimentação de chapas de vidro até 400kg (4 ventosas )",
    "tipo": "Ventosa elétrica a bateria",
    "categorias": [
      "carregadoras"
    ],
    "imgs": [
      "/img/maquinas/401747760-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Manual assistida (bateria 12 V)"
      ],
      [
        "Capacidade",
        "até 400 kg (4 ventosas)"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Giro 360°; basculamento 90°; sistema de manutenção de pressão",
    "fichaEmImagem": false,
    "videos": [
      "F83TD599mvY"
    ],
    "url": "https://www.chinaglass.com.br/ventosa-eletrica-bateria"
  },
  {
    "id": "401747573",
    "codigo": "WW7MRC9LT-M3IWU1C7I",
    "nome": "Ventosa pneumática 350 kg",
    "nomeOriginal": "Ventosa pneumática para movimentação de chapas de vidro – 350 kg – 4 ventosas – rotação 0° a 90° ( opcional inclinação 0° a 90°)",
    "tipo": "Ventosa pneumática",
    "categorias": [
      "carregadoras"
    ],
    "imgs": [
      "/img/maquinas/401747573-1.webp"
    ],
    "specs": [
      [
        "Automação",
        "Manual assistida (pneumática)"
      ],
      [
        "Capacidade",
        "350 kg (4 ventosas)"
      ]
    ],
    "comando": "",
    "marcas": "",
    "destaques": "Alcance vertical ≈ 1,2 m; rotação 0–90°; inclinação 0–90° opcional",
    "fichaEmImagem": false,
    "videos": [
      "sQaJ65lsG0A"
    ],
    "url": "https://www.chinaglass.com.br/ventosa-pneumatica_vidro_350kg"
  }
]
