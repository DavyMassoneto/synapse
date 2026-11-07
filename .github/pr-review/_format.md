# Formato da resposta (obrigatório)

Responda SOMENTE com um objeto JSON, sem texto fora dele e sem cercas de código:

{"verdict": "OK" ou "ATENÇÃO", "summary": "resumo de 1 a 3 frases em português", "findings": [{"path": "caminho/do/arquivo", "line": 123, "body": "comentário em português"}]}

Regras:
- O diff mostrado tem o número da linha do arquivo novo à esquerda de cada linha. `line` é esse número, exatamente a linha com o defeito, e só pode ser uma linha que tenha número. Escolha a linha do defeito, não a do início da função ou do arquivo.
- `body` descreve o problema e a correção, curto e direto. Sem elogios, sem desculpas, sem preâmbulo.
- Só inclua achados que o diff mostra. Não invente. Sem achados: verdict "OK" e findings [].
- Problemas que não pertencem a uma linha específica (arquivo grande demais, pasta com arquivos demais, estrutura) vão no `summary`.
- No máximo 60 achados por resposta, os mais graves primeiro; o resto resuma em `summary`. Mantenha `body` abaixo de 300 caracteres.
