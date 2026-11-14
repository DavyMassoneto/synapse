# Computer-use

O módulo controla o computador via cua-driver. `createComputerUse(dependencies)` devolve `execute`, `diagnose`, `install` e `stop`. O núcleo mantém o alvo, a segurança e os resultados explícitos; timeouts e quedas de transporte de entradas nunca provocam reenvio.

`execute(action, context, signal?)` aceita um `AbortSignal` opcional. Antes do próximo envio ao driver, o cancelamento devolve `result.kind = "cancelled"` e impede a entrada. Uma entrada já enviada não é desfeita: o módulo espera a resposta ou o timeout configurado e preserva confirmação, ausência de verificação ou resultado desconhecido, sempre sem repetição automática da entrada. O cancelamento também impede uma nova tentativa de leitura.

Uma captura opcional cancelada depois da entrada não apaga o resultado: `captureFailure` registra a falha. `precedingEffects` preserva o efeito de trazer a janela à frente quando a entrada seguinte é cancelada. Inicialização, espera e chamada já iniciadas podem continuar até terminar; o sinal não promete interrupção imediata nem reversão de efeito.

O primeiro `execute` que precisa inicializar o driver provisiona automaticamente o artefato fixado quando o executável gerenciado está ausente. O download passa pela verificação SHA-256 antes da extração; a versão completa é publicada por renomeação, sem substituir uma versão existente. Chamadas seguintes reutilizam o executável instalado. Falhas de download ou extração não publicam versão nem ponteiro e permitem nova tentativa.

`diagnose` apenas verifica a instalação existente e não baixa nem instala. `driverPath` e `driverLaunch` explícitos nunca acionam provisionamento; falhas desses comandos ou uma versão incompatível são devolvidas sem substituição automática. As permissões de Acessibilidade e Gravação de Tela do macOS continuam sendo pré-requisitos do sistema operacional.

A instalação usa `tar -xf` para os arquivos `.tar.gz` e `.zip`. O `tar.exe` fornecido no Windows 10 ou posterior suporta ZIP. Não houve execução dos testes nesta máquina Windows: a seleção de plataforma é testada por entradas simuladas. Se o executável `tar` não estiver disponível, a extração é recusada com mensagem explícita orientando extração manual.

Os testes do transporte executam exclusivamente um processo Node falso. Não executam cua-driver real nem ações de mouse, teclado ou janela.

O módulo recebe `driverPath` ou `driverLaunch` diretamente nas dependências e não lê configuração privada do host.
