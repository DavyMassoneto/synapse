# Advisor

O advisor consulta um modelo revisor sem ferramentas. Sem configuração, ele fica desligado. Use `/advisor` para escolher o modelo, `/advisor off` para desligar e `/advisor thinking <nível>` para alterar o raciocínio.

A configuração fica em `~/.pi/agent/advisor.json`, com `model` (`provedor/id`) e `thinking` (`off`, `minimal`, `low`, `medium`, `high`, `xhigh` ou `max`). Se o arquivo for inválido, o erro é informado e o conteúdo não é substituído automaticamente. Corrija `advisor.json` e recarregue a sessão para retomar os comandos.

Depois de 5 turnos completados sem consulta, o agente recebe um lembrete no primeiro turno seguinte que usar ferramentas, para avaliar se deve consultar o advisor. A consulta zera a contagem. Nada é bloqueado.

O histórico do ramo ativo e o prompt são enviados ao provedor escolhido. O orçamento usa uma estimativa por caracteres, não uma contagem exata de tokens. A reserva conservadora do limite máximo de saída pode recusar modelos com janela pequena, mesmo quando uma resposta menor seria possível. Para caber na janela estimada, mensagens ou resultados podem ser omitidos; imagens não são enviadas. Não carregue simultaneamente outra extensão advisor.
