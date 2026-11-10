# Tipagem

## 1. any e unknown

- `any` e `unknown` são proibidos, escritos no código ou vindos de uma biblioteca.
- `object`, `Object`, `Function` e `{}` aceitam qualquer valor e também são proibidos.
- `let` sem tipo e sem valor, e coleção vazia sem tipo, evoluem para `any` e são proibidos.
- `new Map()`, `new Set()`, `new Array()` e `new Promise(...)` levam os argumentos de tipo ou a anotação da declaração.

## 2. Inferência

- Tipo inferível não se anota. Anotação que repete o que o TypeScript já infere é proibida.
- Parâmetros declaram o tipo. Só o callback passado como argumento recebe o tipo da chamada.
- Propriedade de classe sem valor declara o tipo.
- Não se verifica de novo o que o tipo declarado já garante: `typeof valor === "string"` sobre um `string` opcional, `instanceof` sobre um objeto opcional e uma função `valor is T` criada só para isso são redundantes.
- A condição direta (`if (valor)`) estreita quando o valor falso também deve ser rejeitado, como um texto que não pode ser vazio. Quando `0`, `false` ou `""` são valores válidos, a verificação de presença continua explícita.
- Um predicado ou type guard só existe quando nomeia um conceito que a condição direta não diz, quando distingue as variantes de uma união ou quando confirma que um texto recebido é uma das chaves de um conjunto fechado.
- O compilador não confere o que um type guard afirma: `valor is T` vale como `as`. Um guard de chaves (`texto is keyof Contrato`) só consulta a constante declarada com esse contrato. Nunca consulta um objeto recebido por parâmetro, que pode ter propriedades a mais. Quando comparar com os valores conhecidos (`===`) resolve, o compilador estreita sozinho e não há guard.

## 3. Tipagem inline

- Objeto e função tipados no ponto de uso são proibidos: o contrato vira `interface` ou `type` com nome.
- Chaves abertas são proibidas: assinatura de índice, `{ [K in string]: T }` e `Record`.
- Conjunto fechado de chaves vira `interface` com propriedades nomeadas, declarada em `types.ts`. O objeto que guarda o conjunto declara essa interface: a anotação é o contrato do conjunto e não conta como tipo inferível.
- Trocar a forma não cumpre a regra. Chaves escritas no código e guardadas em `Map<string, T>`, em lista de pares chave e valor ou em `Object.fromEntries` são chaves abertas, tanto quanto `Record`.
- `Map` só guarda chaves que só existem em execução, como caminhos de arquivo e identificadores recebidos.
- A relação entre um valor e outro é dado, não controle de fluxo. Uma cadeia de `if` ou um `switch` em que cada ramo compara a mesma variável com um valor fixo e devolve outro valor fixo é uma tabela escondida: ela vira um objeto tipado por `interface`, com uma propriedade por chave, e a consulta é o acesso à propriedade. A chave é o próprio valor consultado, não um apelido que exija outra tradução. Escolher entre operações diferentes continua sendo controle de fluxo. Escolher entre valores que só existem em execução (um campo de um objeto recebido, um argumento) também é controle de fluxo: não se monta um objeto a cada chamada só para ser indexado.
- Um tipo descreve só os valores que chegam. Parâmetro que aceita variantes que nunca recebe, e função que devolve sempre o mesmo valor, estão com o tipo largo demais.
- Todo tipo responde à pergunta "o que este tipo representa?". `Map<string, string>`, `string[][]` e pares soltos dizem o formato, não o significado, e não respondem. O nome do tipo e os nomes das propriedades dizem o que cada valor é. Um `Map` de chaves de execução ganha um tipo com nome em `types.ts` (`DiffLines`, não `Map<string, FileLines>` no ponto de uso).

## 4. Asserções

- `as`, `<T>valor`, `as const` e `satisfies` são proibidos.
- O `!` (não-nulo) é proibido, conforme [Legibilidade](legibilidade.md).
- Dado de fora do programa é validado na fronteira, e o resultado ganha um tipo que diz exatamente o formato aceito.

## 5. Onde ficam os tipos

- `interface` e `type` ficam no `types.ts` do módulo, separados das funções.

## 6. Supressões

- `@ts-ignore` é proibido.
