# Responsabilidade única

SRP é lei, não preferência. Cada função, arquivo e pasta tem uma única responsabilidade, e o nome a diz por inteiro.

## 1. Função

- Uma função faz uma coisa. Se descrevê-la exige "e", "ou" ou "depois", ela faz mais de uma e deve ser dividida.
- Tarefas diferentes são extrair, validar, decidir, transformar, formatar, ler, gravar e coordenar. Uma função executa uma delas; nunca duas.
- Uma função ou coordena, chamando outras funções em sequência, ou executa um único passo. Não faz as duas coisas.
- Dividir é obrigatório mesmo que cada parte fique com uma ou duas linhas (ver [Legibilidade](legibilidade.md), seção 5).

## 2. Sinais de que uma função tem mais de uma responsabilidade

- Duas ou mais tarefas da lista da seção 1 no mesmo corpo.
- Uma condição composta (`&&`, `||`) que decide um conceito sem nome: o conceito vira predicado.
- Uma conta ou transformação que alimenta uma decisão na mesma função: a transformação vira função própria.
- Um ternário, um `slice` ou um laço escondido dentro da expressão de outra tarefa.
- Variáveis intermediárias que só servem a uma das tarefas.
- Um nome com "And", "Or", "E" ou "Ou", ou um nome que cobre só parte do que a função faz.

## 3. Arquivo e pasta

- Um arquivo contém uma função, ou funções que mudam sempre pelo mesmo motivo.
- Uma pasta reúne arquivos de uma só capacidade, e o nome da pasta diz qual.

## 4. Classe

- Uma classe guarda um estado e as operações sobre esse estado. Uma classe com operações que não usam o mesmo estado deve ser dividida.
