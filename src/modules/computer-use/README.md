# Computer-use

O módulo controla o computador via cua-driver. `createComputerUse(dependencies)` devolve `execute`, `diagnose`, `install` e `stop`. O núcleo mantém o alvo, a segurança e os resultados explícitos; timeouts e quedas de transporte de entradas nunca provocam reenvio.

A instalação usa `tar -xf` para os arquivos `.tar.gz` e `.zip`. O `tar.exe` fornecido no Windows 10 ou posterior suporta ZIP. Não houve execução dos testes nesta máquina Windows: a seleção de plataforma é testada por entradas simuladas. Se o executável `tar` não estiver disponível, a extração é recusada com mensagem explícita orientando extração manual.

Os testes do transporte executam exclusivamente um processo Node falso. Não executam cua-driver real nem ações de mouse, teclado ou janela.

O módulo recebe `driverPath` ou `driverLaunch` diretamente nas dependências e não lê configuração privada do host.
