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
- Um predicado ou type guard só existe quando nomeia um conceito que a condição direta não diz, ou quando distingue as variantes de uma união.

## 3. Tipagem inline

- Objeto e função tipados no ponto de uso são proibidos: o contrato vira `interface` ou `type` com nome.
- Chaves abertas são proibidas: assinatura de índice, `{ [K in string]: T }` e `Record`.
- Conjunto fechado de chaves vira `interface` com propriedades nomeadas.

## 4. Asserções

- `as`, `<T>valor`, `as const` e `satisfies` são proibidos.
- O `!` (não-nulo) é proibido, conforme [Legibilidade](legibilidade.md).
- Dado de fora do programa é validado na fronteira, e o resultado ganha um tipo que diz exatamente o formato aceito.

## 5. Onde ficam os tipos

- `interface` e `type` ficam no `types.ts` do módulo, separados das funções.

## 6. Supressões

- `@ts-ignore` é proibido.
