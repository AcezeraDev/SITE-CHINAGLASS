# Análise do site chinaglass.com.br

Levantamento feito em 24/10/2026.

## Resumo
- Catálogo B2B de máquinas para a indústria do vidro, montado na plataforma **Loja Integrada** com o tema padrão.
- Tem carrinho e checkout, mas todos os produtos aparecem como **"Preço sob consulta"**: o site serve para captar contatos, não para vender online.
- Tamanho: 46 produtos (38 máquinas + 8 peças), 15 categorias, 1 marca (China Glass).

## Empresa
- Nome: China Glass
- CNPJ: 26.455.018/0001-71
- Telefone: (11) 2896-7088
- E-mail: rubens@chinaglass.com.br
- Texto "Sobre a loja": melhor custo-benefício em máquinas para a indústria do vidro, pós-venda, garantia de 1 ano, assistência técnica e peças de reposição a pronta entrega.
- Nas páginas de produto, a empresa também cita: equipe técnica para instalação e treinamento, galpão técnico próprio e presença em todos os estados do Brasil.

## Tecnologia
- Plataforma: Loja Integrada.
- Imagens hospedadas em `cdn.awsli.com.br`. Cada foto existe em vários tamanhos (300×300 nas listagens, 600×450 na página, 2500×2500 no zoom) e também no arquivo original, sem redimensionar.
- Scripts: jQuery, Slick (carrossel), Fancybox (janelas de zoom e carrinho), Google Analytics 4 e Enviou (e-mail marketing e carrinho abandonado).
- Mapa do site: `/sitemap.xml`, dividido em produtos, categorias e marca.

## Menu (abas)
Carregadoras / Descarregadoras · Centro Usinagem CNC · Forno Laminação EVA · Laser · Linha Lapidação (submenu: Lapidação, Modelada) · Mesa corte vidro automática · Biseladora · Furadeira · Jateadora (submenu: Gravação / Perfuração a Laser) · Lavadora · Partes e Peças · Bilateral

## Página inicial, de cima para baixo
1. Barra do topo: "Fale Conosco", telefone, login, "Meus pedidos" e carrinho.
2. Logo (diamante desenhado com o nome "CHINA GLASS"), busca e menu de categorias.
3. Carrossel com 3 banners largos: linha de lapidação automática e fachada de vidro. Um deles leva a um vídeo no YouTube.
4. Três banners menores: Peças para Mesa de Corte, Escovas e Vedação, Partes para Mandril. Todos levam para "Partes e Peças".
5. Destaques: grade com cerca de 25 máquinas, cada uma com foto, nome, "Preço sob consulta" e botão "Ver mais".
6. Rodapé: categorias, texto "Sobre a loja", contato, CNPJ e selos de site seguro.

## Página de categoria
Grade simples de produtos, sem filtros e sem paginação.

## Página de produto
- Caminho de navegação (Início › Categoria), título e código do produto.
- Galeria com foto principal e miniaturas. Algumas máquinas têm muitas fotos: a Linha Bilateral tem 19, com desenho técnico e closes de cada componente.
- Botão "Assistir Vídeo", que abre um vídeo do YouTube na própria página (a maioria das máquinas tem vídeo).
- Botão de WhatsApp que só compartilha o link do produto, sem abrir conversa com a empresa.
- **"Consulte o preço"**: abre um formulário na página com Nome, E-mail e Telefone. É assim que a empresa recebe pedidos de orçamento.
- Descrição longa com características e especificações. Em 14 máquinas, a tabela técnica completa aparece só como imagem.
- Produtos relacionados no fim.

## Pontos fracos
- A home não tem título principal (o H1 está vazio) e quase não tem texto para o Google indexar.
- Nomes de produto longos e sem padrão (alguns em caixa alta) e com erros de digitação ("caregangens", "Escolhas e Vedação").
- Fotos de tamanhos e proporções muito diferentes entre si.
- Fichas técnicas importantes só em imagem: não aparecem na busca do Google e são difíceis de ler no celular.
- Não há página "Sobre a empresa", fotos da fábrica, depoimentos de clientes nem WhatsApp direto com a empresa.
- O visual é o tema genérico da plataforma, com cara de site antigo.

## Arquivos desta pasta
- `chinaglass.xlsx`: planilha com Máquinas (fichas técnicas), Peças, Categorias, Descrições completas, Imagens e Empresa.
- `catalogo_maquinas.md`: as fichas técnicas das máquinas em texto.
- `imagens/`: 224 imagens na resolução original (`produtos/`, `banners/`, `logo/`). Em cada produto, a subpasta `descricao/` tem as imagens que aparecem no meio do texto (tabelas técnicas, desenhos, logos de marcas).
- `dados/`: os mesmos dados em JSON e uma descrição em texto por produto.
- `scripts/` (na pasta acima de `chinaglass/`): os scripts que fizeram a extração.
