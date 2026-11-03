# Memória

A memória mantém entre sessões observações do histórico, conhecimento durável em notas Markdown e o controle necessário para continuar o processamento sem perder cobertura, pendências ou efeitos já persistidos. O histórico preserva o ocorrido; as observações alimentam a consolidação; as notas fornecem conhecimento para recall no escopo aplicável.

## Dados e responsabilidades

| Entidade | Dados lógicos e responsabilidade |
| --- | --- |
| Histórico identificado | Sessão, ramo, entradas identificáveis e sua ordem no histórico do host; fonte do ocorrido. |
| Observação | Texto simples datado, IDs das entradas de origem e associação ao ramo; resultado confirmado disponível para consolidação. |
| Cobertura confirmada | Relação entre entradas e processamento de observação confirmado; distingue trechos cobertos, lacunas e trabalho pendente. |
| Pendência e tentativas | Trabalho por concluir, observações necessárias, contador de postergações deliberadas e progresso de tentativas; permite retomada após reinício. |
| Nota durável | Conteúdo Markdown, escopo global ou de projeto, identidade da revisão, estado e vínculos de sucessão; fonte do conhecimento durável. |
| Hash de referência e controle de operação | Referência conhecida do conteúdo, efeitos confirmados, etapas pendentes e resultados desconhecidos; sustenta detecção de edição e recuperação idempotente. |
| Índice derivado | Representações de busca e referências às notas; reconstruível a partir das notas, sem substituir o controle operacional. |

Cobertura, hashes, pendências, contadores e checkpoints têm persistência própria. Reconstruir o índice não modifica esse controle nem reativa versões arquivadas. A versão ativa é determinada pelo estado da nota no vault, não pelo índice.

## Sessões, ramos e escopos

A memória obtém a identidade e o histórico do ramo ativo por um port de integração com o host. Retomada de sessão, bifurcação e navegação na árvore preservam essa associação. Conteúdo exclusivo de um ramo abandonado não é processado como pertencente ao ramo atual. Entradas compartilhadas e entradas exclusivas continuam distinguíveis por sua identidade e relação com o ramo.

A proveniência de sessão e ramo é diferente do escopo de conhecimento. Uma nota global ou de projeto pode ser recuperada em outra sessão; isso não autoriza processar um ramo abandonado, misturar escopos ou promover automaticamente uma nota de projeto para global. O recall seleciona apenas o escopo aplicável.

```mermaid
flowchart TD
    sessao["histórico do host: sessão"] --> ramo["ramo ativo"]
    ramo --> entradas["entradas identificáveis"]
    entradas --> observer["Observer + controle de cobertura"]
    observer --> observacoes["observações confirmadas"]
    observacoes --> consolidador["Consolidador"]
    consolidador --> notas["notas Markdown com escopo e versões"]
    notas --> indice["índice derivado"]
    indice --> recall["Recall"]
```

## Observer e confirmação da cobertura

O Observer seleciona entradas identificáveis do ramo ativo e solicita ao modelo observações em linhas datadas de texto simples, sem emoji. Conclusões usam `completed:`. IDs de origem, relação com o ramo e cobertura são metadados separados do texto, não um mecanismo de controle embutido nas linhas.

```mermaid
flowchart TD
    selecao["selecionar entradas identificáveis do ramo ativo"] --> modelo["modelo produz texto simples datado"]
    modelo --> validacao["validar resultado e relacionar às entradas selecionadas"]
    validacao --> persistencia["persistir resultado e cobertura correspondente"]
    persistencia --> confirmacao["confirmar observação e cobertura"]
    falha["falha / cancelamento / timeout / resultado desconhecido"] --> pendente["manter processamento pendente e possibilidade de retry"]
    pendente --> cobertura["não avançar cobertura"]
```

O resultado de observação distingue:

- **Confirmado:** resultado persistido e relacionado às entradas de origem, com cobertura correspondente confirmada; pode alimentar o Consolidador.
- **Pendente:** processamento por concluir ou sem confirmação suficiente do resultado e de sua cobertura; mantém as referências necessárias à retomada e não autoriza liberar o trecho de origem.

Uma resposta do modelo, isoladamente, não confirma processamento. Se houver interrupção entre persistir o resultado e confirmar a cobertura, a recuperação precisa resolver esse estado sem presumir sucesso nem perder a possibilidade de retry. Nenhuma falha avança o prefixo confirmado por inferência.

### Compactação do contexto

Compactação administra o contexto do host; consolidação transforma observações em conhecimento durável. A memória participa do ciclo de compactação do host, sem criar um segundo loop e sem usar compactação como substituta da consolidação.

Só pode ser liberado um trecho necessário do contexto quando todas as entradas desse trecho estiverem cobertas por observação confirmada. A cobertura de uma entrada posterior não cobre lacunas anteriores: o maior ID observado ou a última observação não bastam para declarar um prefixo inteiro coberto.

```mermaid
flowchart LR
    a["A: cobertura confirmada"] ---|"ordem das entradas"| b["B: pendente, sem cobertura confirmada"]
    b ---|"ordem das entradas"| c["C: cobertura confirmada"]
    c ---|"ordem das entradas"| d["D: cobertura confirmada"]
    b --> resultado["B continua necessário e impede liberar o prefixo A–D; C e D não confirmam o prefixo"]
```

As entradas originais permanecem no histórico do host. Liberar contexto não exclui originais nem promete sua exclusão.

## Consolidador

O Consolidador transforma observações confirmadas em propostas de manutenção do conhecimento durável, sem um Reflector separado. O modelo extrai e propõe; não grava diretamente no vault.

A referência para iniciar a consolidação é um pool de aproximadamente 15.000 tokens, buscando mantê-lo em aproximadamente 10.000. Ambos são parâmetros configuráveis. O alvo de redução nunca autoriza descartar pendências ou observações sem resultado salvo. Se pendências impedirem atingir o alvo, essa condição deve ser registrada em vez de declarar sucesso falso.

```mermaid
flowchart TD
    pool["pool de observações confirmadas (~15 mil tokens)"] --> plano["planejar operações"]
    plano --> validacao["validar propostas"]
    validacao --> aplicacao["aplicar alterações autorizadas e registrar progresso recuperável"]
    aplicacao --> confirmacao["confirmar cada efeito efetivamente persistido"]
    confirmacao --> restante["pool remanescente (alvo ~10 mil tokens) + pendências preservadas"]
```

1. **Planejar:** propor operações a partir das observações e do estado conhecido das notas.
2. **Validar:** verificar schema, escopo, tipo e referências de evidência/proveniência antes da aplicação. Essas verificações determinísticas verificam conformidade e relações exigidas, não comprovam a verdade semântica do conhecimento proposto.
3. **Aplicar:** executar somente as alterações autorizadas pela memória, preservando conteúdo humano e progresso recuperável.
4. **Confirmar:** reconhecer apenas os efeitos efetivamente persistidos. Aplicação parcial não confirma o lote inteiro.

### Dúvida e postergação

Dúvida sobre tipo de nota ou escopo global/de projeto permite duas postergações. Na primeira e na segunda deliberações, a observação necessária e a pendência são retidas, com o contador persistido. Na terceira consolidação, o Consolidador escolhe a alternativa mais provável e emite aviso. Perguntar ao humano não é o fallback padrão, e abandonar definitivamente a pendência não é permitido.

O contador sobrevive a reinícios. Falha operacional não constitui, por si só, uma nova deliberação e não incrementa automaticamente esse contador. O evento preciso de contagem e o canal/formato do aviso precisam ser especificados sem alterar a regra das duas postergações e da decisão na terceira consolidação.

### Efeitos parciais e retry

Notas já gravadas por uma aplicação parcial permanecem como efeitos persistidos. A retomada identifica o que foi confirmado, o que falta e o que tem conclusão desconhecida. Não duplica sucessoras, não reaplica efeitos já confirmados e não confirma todo o lote apenas porque uma parte foi gravada. A redução do pool respeita esse estado e conserva as observações necessárias às pendências.

## Vault, revisões e escrita concorrente

Markdown é a fonte da verdade das notas. A memória responde pelas alterações que aplica, considerando edições humanas e escrita externa, inclusive Obsidian e outros processos.

- `archive` aposenta uma versão sem excluí-la.
- `succeed` arquiva a versão anterior em `archive/` e cria uma sucessora, com links entre as versões.

Antes de reescrever uma nota, a memória compara seu conteúdo com o hash de referência persistido. Hash alterado ou ausente exige tratar o conteúdo como editado e preservá-lo por sucessão, não sobrescrevê-lo: a versão existente vai para `archive/` e uma sucessora é criada com os vínculos entre ambas.

```mermaid
flowchart TD
    nota["nota existente + hash de referência"] --> verificacao["verificar conteúdo atual"]
    verificacao --> divergencia["hash mudou ou não há referência"]
    divergencia --> arquivo["preservar versão existente em archive/"]
    arquivo --> sucessora["criar sucessora e vincular versões"]
    sucessora --> confirmacao["confirmar os efeitos persistidos"]
```

Hash detecta diferenças; não é lock, compare-and-swap ou garantia de atomicidade. Uma proteção interna não controla automaticamente escritores externos. Conflitos e serialização precisam ter alcance conhecido, inclusive diante de múltiplos processos e alterações pelo Obsidian.

Operações entre vários arquivos podem ser interrompidas por falha ou cancelamento. O controle persistido deve permitir reconhecer as etapas já aplicadas e retomar as restantes sem perder conteúdo, duplicar sucessoras ou declarar conclusão sem evidência persistida. A recuperação também deve resolver efeitos de conclusão desconhecida antes de tratá-los como sucesso. O mecanismo de persistência e coordenação permanece em aberto.

Arquivar não é excluir. Retenção, exclusão, purga de backups, caches e embeddings e reimportação precisam de especificações próprias.

## Recall

O fluxo padrão usa Jev TypeSafe para classificar necessidade de memória e relevância dos candidatos:

```mermaid
flowchart TD
    necessidade["necessidade de memória (Jev TypeSafe)"] --> busca["busca no escopo aplicável"]
    busca --> leitura["leitura das notas e verificação de versão/estado na fonte Markdown"]
    leitura --> relevancia["relevância (Jev TypeSafe)"]
    relevancia --> contexto["composição dentro do orçamento de contexto com origem, versão e escopo"]
```

Busca textual e semântica são possibilidades. Embeddings localizam candidatos; não são fonte da verdade nem prova de relevância. O recall lê a fonte durável para verificar a versão e o estado atuais: índice obsoleto não torna ativa uma nota arquivada ou uma versão corrigida.

Os thresholds de necessidade e relevância e o orçamento de contexto dependem de especificação própria. O conteúdo selecionado deve ser delimitado e identificado por origem, versão e escopo.

Texto recuperado é dado, não instrução com autoridade sobre o host ou o modelo. Falha, timeout ou resultado desconhecido na busca, leitura ou classificação não equivalem a sucesso, nem autorizam presumir um fallback.

## Ports e provedores

Domínio e casos de uso não importam pi nem SDKs de provedores; prompts e adaptadores ficam na fronteira de integração.

Os ports de observação, consolidação, classificação e embeddings são separados por responsabilidade, sem uma interface universal de provedor. A integração com o host fornece acesso ao ramo, histórico e ciclo de compactação; seus contratos concretos precisam preservar as identidades e confirmações descritas acima.

Embeddings devem admitir OmniRoute e provedores diretos com URL personalizável. Credenciais ficam fora das notas, dos logs e dos prompts. Configuração de modelos, endpoints, limites, timeout, custos e políticas de envio de dados permanece aberta.

Uma falha de provedor não autoriza trocar silenciosamente o modelo ou o endpoint. A estratégia de fallback e seu aviso precisam de definição antes de serem incorporados ao adaptador.

## Cenários e consequências exigidas

| Entrada ou situação | Consequência exigida |
| --- | --- |
| Uma sessão bifurca após entradas compartilhadas; o usuário retoma o outro ramo. | Preservar identidade e cobertura das entradas; não processar conteúdo exclusivo do ramo abandonado como ativo. Notas duráveis continuam elegíveis em outra sessão apenas no escopo aplicável. |
| Observer confirma A e C, mas falha em B antes da compactação de A–C. | B permanece pendente; o trecho inteiro não é liberado com base em C. Retry continua possível e originais permanecem no host. |
| Processo reinicia após a segunda postergação por dúvida de escopo. | Recuperar observação e contador; a terceira consolidação escolhe a alternativa provável e avisa. Um timeout intermediário não conta automaticamente como deliberação. |
| O índice está corrompido ou ainda aponta para uma versão arquivada. | Reconstruir o índice sem substituir o controle persistido; consultar estado e versão no Markdown, sem reativar a versão arquivada nem perder pendências. |
| Obsidian altera uma nota, ou a memória encontra uma nota sem hash de referência. | Preservar o conteúdo por `succeed`, arquivar a versão existente em `archive/` e vincular a sucessora; não tratar hash como exclusão de concorrência. |
| Cancelamento interrompe `succeed` entre alterações de arquivos; outra nota do lote já foi gravada. | Conservar efeitos persistidos e recuperar as etapas restantes sem duplicar sucessora ou confirmar o lote inteiro. Escrita externa concorrente exige tratamento de conflito, não confiança apenas na serialização interna. |
| Pendências retidas impedem reduzir o pool ao alvo de 10 mil tokens. | Registrar o impedimento, preservar observações e pendências e não declarar redução concluída. |
| Uma nota contém instruções maliciosas ou o classificador retorna erro/timeout. | Tratar o texto como dado sem autoridade; respeitar orçamento e identificação da origem, sem transformar falha em sucesso ou fallback presumido. |

## Especificações abertas

- Metadados, schema e catálogo de tipos das notas, preservando escopo, revisão, estado e sucessão.
- Persistência do controle, confirmação, coordenação, conflitos e recuperação multi-arquivo/multiprocesso, incluindo escritores externos; contratos concretos dos ports e integração com o host.
- Orçamentos, tokenizador, thresholds de necessidade/relevância e critérios de avaliação de modelos e integração; tecnologia de índice, com SQLite/FTS como opção, não escolha fixada.
- Configuração dos fornecedores: modelos, URLs, limites, timeout, custos e políticas de envio de dados.
- Evento de contagem de deliberação e formato/canal de avisos de incerteza e eventual fallback.
- Retenção, exclusão, purga de backups/caches/embeddings e reimportação.
