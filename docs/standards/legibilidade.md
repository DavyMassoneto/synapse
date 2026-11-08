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

- O nome de um predicado começa com `is_` ou `has_`.
- Predicado não fica misturado com lógica no mesmo arquivo.

## 5. Duplicação

- Trecho que pode virar uma função e ser reutilizado em mais de um lugar é duplicação.
- Vale mesmo que a extração quebre o código original e deixe uma função menor.

## 6. Números mágicos

**Número mágico** é um número solto no código, sem nome.

- Todo número solto ganha uma constante com nome, e a unidade entra no nome quando houver.
- Ficam sem nome: 0, 1 e 2 em contas triviais, e os valores de entrada e de expectativa dos testes.

## 7. Asserção de não-nulo

- No TypeScript não se usa o `!` (não-nulo). Um helper que lança erro com mensagem ocupa o lugar dele.
- Nos testes Rust não se usa `.unwrap()`. Usa-se `.expect("mensagem")`, e a mensagem diz o que faltou.
