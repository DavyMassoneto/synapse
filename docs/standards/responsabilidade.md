# Responsabilidade única

SRP é lei, não preferência. Cada função, arquivo e pasta tem uma única responsabilidade coesa e explícita, e o nome a diz.

## 1. Função

- Uma função tem um único motivo para mudar. Para julgar, nomeie os motivos pelos quais ela mudaria: o formato da entrada, a regra de uma decisão, a política de repetição, o formato da saída, a origem dos dados. Mais de um motivo independente é violação, e a função se divide por motivo.
- Passos que mudam sempre juntos são uma responsabilidade só. Um parser lê e avança a sua posição; uma validação compara várias condições do mesmo dado; uma política de repetição decide e repete; "buscar ou criar" é uma operação. Nada disso, sozinho, é violação.
- Uma função ou coordena, chamando outras funções em sequência, ou executa o seu passo. Uma função que coordena não contém a lógica dos passos.
- Não se divide uma função apenas para ter funções menores: uma função que só esconde uma linha de outra não é uma responsabilidade.

## 2. Sinais de que uma função tem mais de um motivo para mudar

- Ela interpreta um formato e, no mesmo corpo, decide o que fazer com o resultado, e as duas partes mudariam por razões distintas.
- Ela reúne leitura de entrada, regra de negócio e formatação de saída.
- Uma conta, uma busca ou uma transformação que alimenta uma decisão de outro assunto está dentro dela.
- Um conceito sem nome está escondido numa condição composta, num ternário ou num laço dentro de uma expressão.
- Um nome que cobre só parte do que a função faz, ou um nome com "And", "Or", "E" ou "Ou".

## 3. Arquivo e pasta

- Um arquivo contém uma função, ou funções que mudam sempre pelo mesmo motivo.
- Uma pasta reúne arquivos de uma só capacidade, e o nome da pasta diz qual.

## 4. Classe

- Uma classe guarda um estado e as operações sobre esse estado. Uma classe com operações que não usam o mesmo estado deve ser dividida.
