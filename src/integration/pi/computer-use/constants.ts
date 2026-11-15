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
  "Controle o computador via cua-driver em modo somente segundo plano: capturas, mouse, teclado, rolagem e arraste em macOS, Windows e Linux. Nenhuma ação traz janelas à frente, eleva a janela ou move o cursor do usuário; delivery_mode='foreground', bring_to_front e raise_window são recusados antes de qualquer chamada ao driver. Nunca repita entrada confirmada ou de resultado desconhecido; capture para verificar antes de decidir agir novamente. capture(mode='som') devolve elementos numerados: prefira element quando a árvore expõe a interface e coordinate sobre a última captura quando ela expõe apenas a moldura da janela, caso comum em aplicativos Unity. Em aplicativos Unity, a interface pode exigir uma bridge específica; a falta dela não autoriza primeiro plano. Os controles do título da janela (Sistema, Minimizar, Maximizar, Fechar) pertencem à janela, não ao conteúdo do aplicativo. set_value define diretamente o valor acessível de seletores e controles. Capturas incluem screenshotStorage com referência ao arquivo salvo. A resposta limita a lista a 100 elementos e rótulos a 120 caracteres; a árvore integral fica no arquivo de elementos. Arrastar não substitui scroll."

export const PI_COMPUTER_TOOL_SNIPPET =
  "Controle o computador somente em segundo plano via cua-driver, com capturas e elementos numerados."

export const PI_COMPUTER_TOOL_GUIDELINES = [
  "Use computer_use com action='capture' e mode='som' primeiro; clique por element quando a árvore expõe a interface e por coordinate sobre a última captura quando ela expõe apenas a moldura ou o aplicativo é Unity. Capture novamente após alterações ou use capture_after=true.",
  "O modo é somente segundo plano: nunca peça foreground, bring_to_front ou raise_window; se a entrada não tiver efeito, capture e confira sem repetir entrada de resultado incerto, e informe a limitação ou a necessidade de bridge Unity.",
  "Não trate Sistema, Minimizar, Maximizar e Fechar como conteúdo do jogo: são controles do título da janela.",
  "Siga o veredito de computer_use: nunca repita entrada confirmada ou de resultado desconhecido; capture para verificar uma entrada não verificável antes de decidir agir novamente.",
  "Prefira comandos de shell, APIs ou operações de arquivo ao computer_use quando a tarefa não exigir interface gráfica.",
]

export const PI_COMPUTER_COMMAND_NO_ARGUMENT = ""
