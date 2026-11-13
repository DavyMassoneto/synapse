# Integração computer-use

`registerComputerUse(pi, computerUse)` registra a ferramenta `computer_use`, o comando `/computer-use` (`status`, `doctor`, `install`, `reset`) e encerra o módulo em `session_shutdown`.

A composição cria o módulo com `createComputerUse(createComputerUseHostDependencies())`. As dependências usam `getAgentDir()/computer-use/driver` para instalação e `getAgentDir()/computer-use/captures` para capturas. `PI_CUA_DRIVER_CMD` substitui o caminho do binário.

Opcionalmente, `getAgentDir()/computer-use-driver.json` substitui o lançamento do driver. O arquivo aceita apenas `command` (texto não vazio) e `arguments` (lista de textos). Exemplo: `{ "command": "node", "arguments": ["driver-falso.mjs"] }`. É configuração confiável do usuário, não configuração do projeto. Arquivo ausente mantém a localização normal; arquivo inválido informa erro e não é ignorado. O teste de distribuição usa esse arquivo no diretório isolado do agente para executar exclusivamente um processo Node falso.

A integração traduz argumentos snake_case e coordenadas `[x, y]` para os contratos do módulo; segurança, alvo e política de repetição permanecem no módulo. Cancelamento antes do início impede execução; cancelamento durante uma chamada não afirma ausência de efeito e exige nova observação.
