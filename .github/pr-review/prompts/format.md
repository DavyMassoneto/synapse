# Formato da resposta (obrigatório)

Responda SOMENTE com um objeto JSON, sem texto fora dele e sem cercas de código:

{"coverage": ["C01", "C02"], "findings": [{"rule": "C01", "path": "caminho/do/arquivo", "line": 123, "body": "texto em português"}]}

- `coverage`: o código de TODAS as regras da lista, sem faltar nenhuma.
- `rule`: o código da regra violada, exatamente como na lista.
- `path`: o arquivo. Para um defeito da PR inteira ou de uma pasta, use o caminho da pasta ou "PR".
- `line`: o número da linha do arquivo, exatamente a linha do defeito (não a do início da função ou do arquivo). Para defeito que não pertence a uma linha, use 0.
- `body`: diz o que está errado e a correção exata. Direto, sem elogio e sem preâmbulo. No máximo 400 caracteres.
- Cada arquivo é mostrado inteiro, com o número da linha à esquerda e a coluna `+` quando a PR alterou ou criou a linha.
- No máximo 80 achados por resposta, os mais graves primeiro. O que sobrar entra na rodada de complemento: não o resuma nem o omita por cansaço.
- Sem defeitos novos: `findings` vazio, e `coverage` continua completo.
