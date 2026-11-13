# iPhone

A grade foi medida em iPhone18,2 com iOS 26.6 e viewport 440×956 pontos: quatro colunas e seis linhas; widgets ocupam várias posições e o Dock não integra a grade. Outros viewports são recusados.

O arrasto depende do modo de edição: segurar, levantar lentamente 14 pontos, saltar ao destino em 30 ms e aguardar antes de soltar. Um movimento final lento pode reordenar ícones. Ao levantar um ícone, os seguintes podem ocupar sua posição; mover o último ícone para uma lacuna anterior evita esse deslocamento. A tela deve ser relida após cada movimento.

A borda mantém a virada contínua de páginas. Uma virada observada usou espera de 0,85 segundo e destino livre na página seguinte. Um widget entre o ícone e a borda pode impedir a virada; não soltar na borda nem em página cheia.

No modo de edição há uma página vazia adicional. Pastas devem ser lidas fora do modo de edição, pois a paginação interna durante a edição não é confiável. A ausência de um ícone não comprova sua entrada na pasta: é preciso conferir o conteúdo. O teclado observado descarta alguns acentos, mas aceita cedilha. Uma pasta com um aplicativo permanece até o último sair.

O cliente limita respostas HTTP a 16 MiB para acomodar capturas PNG codificadas em base64 e árvores de acessibilidade sem aceitar fluxo ilimitado; a configuração é limitada a 1 MiB, suficiente para os campos suportados. Exceder qualquer limite recusa a leitura antes do parse, sem truncar dados. Entidades numéricas XML seguem os caracteres válidos do XML; a quebra de linha numérica é normalizada para espaço, como na extensão original.

O leitor aceita o formato de XML esperado do WebDriverAgent e recusa explicitamente comentário, CDATA, entidade desconhecida e estrutura malformada. O adaptador de arquivo valida a configuração JSON com TypeBox; o núcleo valida as regras de uso. Aparelho físico exige UDID explícito em qualquer host.

O cliente WebDriver usa a URL configurada e serializa operações. O módulo não repete ações de efeito incerto: as alternativas são usadas somente quando o servidor informa comando desconhecido ou operação não suportada.
