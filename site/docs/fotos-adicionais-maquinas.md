# Fotos adicionais das máquinas

As 19 máquinas que tinham uma ou duas imagens recebem 30 fotografias adicionais de detalhes, para completar pelo menos três fotos por galeria.

As imagens foram geradas individualmente com imagegen, usando como referência a capa de estúdio da própria máquina. Os enquadramentos destacam componentes visíveis: cabeçotes, painéis, roletes, estruturas, ventosas e braços de movimentação. Não foram pedidos interiores ou vistas traseiras que a referência não mostra. As imagens são ilustrativas; não servem para deduzir dimensões, acessórios ou especificações técnicas.

Cada arquivo foi conferido visualmente e com OCR local antes da inclusão. A exigência é ausência de frases, letras, números, marcas e logotipos. Botões e peças circulares podem produzir falsos positivos no OCR e foram conferidos visualmente.

Os arquivos finais ficam em `public/img/maquinas/detalhes/<id>-detalhe-<indice>.webp`, em WebP com qualidade 90. A conversão altera somente o formato. O mapa `src/fotosExtrasMaquinas.ts` adiciona as imagens sem modificar o catálogo gerado ou os arquivos de origem. O seletor de miniaturas e a ampliação usam a mesma lista de fotos. A identificação de imagem gerada por IA aparece fora da fotografia.

O manifesto `fotos-adicionais-maquinas-manifesto.json` registra o produto, o arquivo de referência, o detalhe solicitado, o prompt completo e o destino de cada imagem.
