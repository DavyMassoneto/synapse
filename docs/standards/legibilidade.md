# Legibilidade

## 1. Comentário

- Código legível não tem comentário.
- Se é preciso comentário para entender o que o código está fazendo, ele não está legível e deve ser reescrito: o que o comentário explicaria vira nome de função ou variável, ou uma estrutura mais simples.
- Um código simples não deveria precisar de tanto comentário.

## 2. Alternativas

**Alternativa** é um valor reserva usado quando a primeira tentativa falha: `unwrap_or`, `or_else`, valor padrão.

- Se o código precisa de alternativa para conseguir executar, algo está errado nele.
- Toda alternativa precisa de justificativa: o que justifica a alternativa?

## 3. Linhas

- Não colocar tudo em uma única linha.
- Menos linhas não é necessariamente melhor, nem mais performático.

## 4. Predicados

**Predicado** é uma função que recebe um valor e devolve `bool`.

- O nome de um predicado começa com `is` ou `has` (`is_`/`has_` nas linguagens que usam `snake_case`, como Rust; em TypeScript, `isX`/`hasX`).
- Predicado não fica misturado com lógica no mesmo arquivo.

## 5. Duplicação

- Trecho de código repetido que pode virar uma função e ser reutilizado em mais de um lugar é duplicação.
- Texto ou template repetido não é código repetido, mesmo que uma mudança no formato tivesse de ser feita em cada lugar: a função que só o devolveria é desnecessária, conforme [AGENTS.md](../../AGENTS.md). Exemplo: o mesmo `${provider}/${id}` em dois `map` sobre listas diferentes não vira função.
- Semelhança casual não é duplicação: uma expressão curta e comum, como `lista.length === 0`, não vira função. Só é duplicação o trecho cuja mudança futura teria de ser feita em todos os lugares onde ele aparece.
- A mesma chamada única repetida em mais de um lugar não é duplicação: ela segue [Responsabilidade](responsabilidade.md) §1 e só vira função quando o nome expressa um conceito que a chamada esconde. Fora isso, a chamada é escrita em cada lugar.
- Vale mesmo que a extração quebre o código original e deixe uma função menor.

## 6. Números mágicos

**Número mágico** é um número solto no código, sem nome.

- Todo número solto ganha uma constante com nome, e a unidade entra no nome quando houver.
- Ficam sem nome: 0, 1 e 2 em contas triviais, e os valores de entrada e de expectativa dos testes.

## 7. Asserção de não-nulo

- No TypeScript não se usa o `!` (não-nulo). Um helper que lança erro com mensagem ocupa o lugar dele.
- Nos testes Rust não se usa `.unwrap()`. Usa-se `.expect("mensagem")`, e a mensagem diz o que faltou.

## 8. Return vazio

- `return` sem valor é proibido. Estruture o fluxo com `if`/`else`, `switch` ou funções menores, de modo que o fim da função seja o fim natural do fluxo.
- Um `else` que existe só para sair da função (`else { return }`) é proibido.
- Função sem resultado não tem `return` e declara `void`.
- `return undefined` é proibido: se não há valor, a função não retorna nada. Um retorno que ninguém usa é ruído.

## 9. Ausência de valor e validação positiva

- Nunca se valida um dado comparando-o com `undefined` ou `null` (`=== undefined`, `!== undefined`, `== null`, `typeof x === "undefined"`). Isso trata uma única forma de "vazio" e deixa passar `null`, `0`, `""` e qualquer outro tipo de dado.
- Sempre se valida o dado POSITIVO, isto é, que ele é o dado esperado. Quando o tipo declarado já diz o que o valor é e só falta saber se ele veio, a condição direta (`if (valor)`) é a validação positiva, conforme [Tipagem](tipagem.md). Quando o formato é desconhecido, valida-se com esquema na fronteira, com `typeof`, com `Array.isArray` ou com o discriminante `kind` de uma união.
- A validação positiva inclui as restrições do dado, e não só o seu tipo. `typeof x === "string"` aceita `""`: um texto vazio pode ser válido como conteúdo, mas não como referência de modelo, que exige o formato `provedor/id`. `typeof x === "object"` aceita `null`: valide as propriedades esperadas ou use um esquema. Uma escolha feita entre opções apresentadas deve ser uma dessas opções.
- Dado vindo de fora do programa é validado uma vez, na fronteira; os consumidores internos confiam no tipo já validado e não validam de novo nenhuma parte dele. A função que lê o dado recebe o esquema do formato esperado e valida o dado inteiro numa só chamada. Validar na leitura só uma parte (o envelope) e depois, no consumidor, outra parte (o conteúdo) é repetição: o consumidor que chama de novo um parser ou um esquema sobre dado que já passou pela fronteira, inclusive sobre o texto bruto guardado junto do resultado, viola esta regra, e a correção é passar o esquema completo à leitura.
- Exceção: o `undefined` que a API de uma biblioteca exige como argumento (por exemplo, `setStatus(chave, undefined)` para limpar um status) não é validação.
- Asserções do Vitest (`toBeUndefined`) verificam o resultado de um teste e não se aplicam a esta regra.
- Resultado que pode vir sem dado é uma união discriminada por `kind`, não um valor que às vezes é `undefined`.

## 10. Parâmetros e retornos sem uso

- Parâmetro que a função não usa é removido. Só permanece quando a assinatura é imposta pelo host ou pela biblioteca, e o nome começa com `_`.
- Valor retornado que nenhum chamador usa não é retornado. Exceção: o retorno que o contrato do host ou da biblioteca exige, mesmo sem consumidor no repositório.

## 11. Função que precisa de explicação

- Se o revisor precisa perguntar por que uma função existe ou o que ela faz, o nome ou a estrutura não está claro: renomeie ou simplifique até a resposta estar no código.
- Laço manual que reimplementa uma única operação conhecida (remover itens, filtrar, procurar) é substituído pela operação (`filter`, `find`, `includes`). O laço que filtra, limita e transforma na mesma passagem não é reimplementação: encadear `filter`, `slice` e `map` para isso cria coleções intermediárias, conforme [Desempenho](desempenho.md).
