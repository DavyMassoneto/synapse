# Desempenho

Desempenho é critério de avaliação, não preferência. O custo desnecessário que o código comprova é violação, sem exigir benchmark. Chamar um custo de gargalo exige medição.

## 1. Custo comprovável

Um apontamento de desempenho nomeia a operação custosa, a dimensão da entrada que a faz crescer, o trabalho ou a alocação evitável e uma correção que preserva o comportamento.

- Coleção intermediária que uma operação direta dispensa é proibida: `Array.from(grupos.values(), converter)` no lugar de `[...grupos.values()].map(converter)`; `Array.from(texto, converter)` no lugar de `texto.split("").map(converter)`.
- Duas ou mais passagens sobre a mesma coleção para produzir um resultado que uma passagem produz são proibidas: `.filter(...).map(...)` com os dois passos sobre o mesmo elemento vira um laço ou um `flatMap`.
- Busca linear dentro de laço sobre a mesma coleção (`includes`, `find`, `indexOf`, `some` em corpo de `for` ou de callback) é proibida quando a coleção cresce com a entrada: o dado vira `Map` ou `Set` uma vez, fora do laço.
- Cópia cumulativa dentro de laço é proibida: `resultado = [...resultado, item]`, `resultado = { ...resultado, chave }` e concatenação de texto que reconstrói o acumulado a cada volta. Acumula-se no lugar, com `push`, `set` ou o texto montado no final.
- Cálculo que não depende do laço fica fora dele: expressão regular criada, valor lido ou conversão repetida a cada volta com o mesmo resultado.
- Alocação para medir ou testar é proibida quando a conta direta responde: `new Array(n)` ou `Array.from({ length: n })` só para contar, e laço limitado por um valor vindo da entrada sem teto.

## 2. Entrada e I/O

- Dado que cresce com a entrada (arquivos do diff, páginas de uma API, linhas de um fluxo) é lido em fluxo ou em páginas, com limite explícito. Carregar tudo em memória exige que o tamanho tenha teto conhecido.
- A mesma leitura de disco, de rede ou do ambiente não se repete: o resultado é lido uma vez e passado adiante.
- Requisições independentes não esperam uma pela outra sem motivo; requisições que dependem uma da outra, ou que a API limita, esperam.

## 3. O que não é violação

- Duas passagens sobre uma coleção pequena e de tamanho fixo, quando a leitura fica mais clara. O apontamento cita o tamanho da entrada; sem ele, é `insufficient_context`.
- Preservar a ordem, os efeitos colaterais e o contrato é obrigatório: a correção de desempenho não muda o resultado.
- Cache, paralelismo e estrutura auxiliar sem necessidade demonstrada são YAGNI, não otimização.
