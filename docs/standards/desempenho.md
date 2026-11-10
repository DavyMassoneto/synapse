# Desempenho

Desempenho é critério de avaliação, não preferência. O código do produto e a automação do repositório seguem este padrão.

Violação é trabalho ou alocação que o código comprova dispensável, com uma correção que preserva o comportamento. Alocação dispensável se aponta sem benchmark; chamar um custo de gargalo exige medição.

## 1. Como apontar

Um apontamento de desempenho nomeia:

- a operação custosa;
- a dimensão da entrada que a faz crescer (o número de grupos, de linhas do diff, de páginas lidas). O valor concreto não é necessário para reconhecer uma alocação intermediária;
- o trabalho ou a alocação evitável;
- uma correção que preserva a ordem, os efeitos colaterais e o contrato.

Quando a dimensão da entrada ou o efeito da mudança dependem de código que o diff não mostra, o apontamento é `insufficient_context`.

## 2. Custos evitáveis

Estes são exemplos do que o código pode comprovar. Cada um vale quando a correção mantém o resultado.

- Coleção intermediária que uma operação direta dispensa: `[...grupos.values()].map(converter)` vira `Array.from(grupos.values(), converter)`, com o mesmo resultado e a mesma ordem.
- Várias passagens sobre a mesma coleção para um resultado que uma passagem produz, quando juntar os passos mantém a ordem dos efeitos.
- Busca linear repetida dentro de laço sobre uma coleção que cresce com a entrada, quando indexá-la uma vez custa menos que as buscas.
- Cópia cumulativa dentro de laço: `resultado = [...resultado, item]` e `resultado = { ...resultado, chave }`.
- Cálculo invariante repetido a cada volta do laço.
- Alocação feita só para contar ou testar quando uma conta direta responde.

## 3. Entrada e I/O

- Dado que cresce com a entrada (arquivos do diff, páginas de uma API, linhas de um fluxo) é lido com um limite explícito, em fluxo ou em páginas. O limite é de recurso e diz o que acontece ao excedê-lo.
- A mesma leitura não se repete sem motivo. Reler para obter um estado que pode ter mudado é um motivo, e quem relê o diz pelo nome da função.

## 4. O que não é violação

- Custo que não cresce com a entrada: uma coleção pequena e de tamanho limitado, quando a forma atual é mais clara.
- Cache, paralelismo e estrutura auxiliar sem necessidade demonstrada: são YAGNI, não otimização.
- Uma mudança que altera a ordem dos efeitos, o resultado ou o contrato.
