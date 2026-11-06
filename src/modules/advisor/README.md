# Advisor

O advisor consulta um modelo revisor sem ferramentas. Sem configuração, ele fica desligado. Use `/advisor` para escolher o modelo, `/advisor off` para desligar e `/advisor thinking <nível>` para alterar o raciocínio.

A configuração fica em `~/.pi/agent/advisor.json`. Se o arquivo for inválido, o erro é informado e o conteúdo não é substituído automaticamente.

O histórico do ramo ativo e o prompt são enviados ao provedor escolhido. Para caber na janela estimada, mensagens ou resultados podem ser omitidos; imagens não são enviadas. Não carregue simultaneamente outra extensão advisor.
