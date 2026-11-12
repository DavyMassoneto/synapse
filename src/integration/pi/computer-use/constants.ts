export const PI_COMPUTER_TOOL_NAME = "computer_use"

export const PI_COMPUTER_TOOL_LABEL = "Uso do computador"

export const PI_COMPUTER_COMMAND_NAME = "computer-use"

export const PI_COMPUTER_SHUTDOWN_EVENT = "session_shutdown"

export const PI_COMPUTER_SEQUENTIAL = "sequential"

export const PI_COMPUTER_TEXT_CONTENT = "text"

export const PI_COMPUTER_IMAGE_CONTENT = "image"

export const PI_COMPUTER_CANCELLED_MESSAGE =
  "Operação computer_use cancelada; se uma entrada já estava em andamento, observe o estado antes de decidir agir novamente."

export const PI_COMPUTER_COMMAND_DESCRIPTION = "Uso do computador: status | install | doctor | reset"

export const PI_COMPUTER_COMMAND_INSTALL = "install"

export const PI_COMPUTER_COMMAND_RESET = "reset"

export const PI_COMPUTER_COMMAND_STATUS = "status"

export const PI_COMPUTER_COMMAND_DOCTOR = "doctor"

export const PI_COMPUTER_COMMAND_UNKNOWN = "Subcomando inválido. Use status, install, doctor ou reset."

export const PI_COMPUTER_COMMAND_STOPPED = "Sessão de uso do computador encerrada."

export const PI_COMPUTER_NOTICE_INFO = "info"

export const PI_COMPUTER_NOTICE_ERROR = "error"

export const PI_COMPUTER_TOOL_DESCRIPTION =
  "Controle o computador via cua-driver: capturas, mouse, teclado, rolagem e arraste em macOS, Windows e Linux. A entrada é enviada em segundo plano por padrão; siga o veredito para escalar a coordenadas ou ao primeiro plano, que altera o foco. Nunca repita entrada confirmada ou de resultado desconhecido. Capture para verificar antes de repetir entrada não verificável. capture(mode='som') devolve elementos numerados; prefira element ao invés de coordenadas. set_value define diretamente o valor acessível de seletores e controles. Capturas incluem screenshotStorage com referência ao arquivo salvo. A resposta limita a lista a 100 elementos e rótulos a 120 caracteres; a árvore integral fica no arquivo de elementos. Arrastar não substitui scroll."

export const PI_COMPUTER_TOOL_SNIPPET =
  "Controle o computador em segundo plano via cua-driver, com capturas e elementos numerados."

export const PI_COMPUTER_TOOL_GUIDELINES = [
  "Use computer_use com action='capture' e mode='som' primeiro; clique por element e capture novamente após alterações ou use capture_after=true.",
  "Siga o veredito de computer_use: nunca repita entrada confirmada ou de resultado desconhecido; capture para verificar uma entrada não verificável antes de decidir agir novamente.",
  "Prefira comandos de shell, APIs ou operações de arquivo ao computer_use quando a tarefa não exigir interface gráfica.",
]

export const PI_COMPUTER_COMMAND_NO_ARGUMENT = ""
