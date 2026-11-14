import { type ComputerMountEvent, type ComputerMountFakeElement, type ComputerMountFakeState } from "./types"
export const COMPUTER_MOUNT_TOOL = "computer_use"

export const COMPUTER_MOUNT_REPLY = "computer mount verified"

export const COMPUTER_MOUNT_PROMPT = "Execute a operação pedida pela ferramenta computer_use."

export const COMPUTER_MOUNT_CAPTURE_ARGUMENTS = '{"action":"capture","pid":10,"window_id":20}'

export const COMPUTER_MOUNT_CLICK_ARGUMENTS = '{"action":"click","element":1,"capture_after":true}'

export const COMPUTER_MOUNT_COMPLETED = "completed"

export const COMPUTER_MOUNT_VERDICT = "verdict"

export const COMPUTER_MOUNT_SCREENSHOT_STORAGE = "screenshotStorage"

export const COMPUTER_MOUNT_INVALID_ARGUMENTS = '{"action":"type"}'

export const COMPUTER_MOUNT_LOG_FILE = "computer-driver-events.jsonl"

export const COMPUTER_MOUNT_DRIVER_FILE = "./driver.ts"

export const COMPUTER_MOUNT_TSX = "tsx"

export const COMPUTER_MOUNT_IMPORT_FLAG = "--import"

export const COMPUTER_MOUNT_MANIFEST = "manifest"

export const COMPUTER_MOUNT_JSONRPC = "2.0"

export const COMPUTER_MOUNT_PROTOCOL = "2025-06-18"

export const COMPUTER_MOUNT_VERSION = "0.21.0"

export const COMPUTER_MOUNT_INITIALIZE = "initialize"

export const COMPUTER_MOUNT_TOOLS_LIST = "tools/list"

export const COMPUTER_MOUNT_TOOLS_CALL = "tools/call"

export const COMPUTER_MOUNT_LINE_EVENT = "line"

export const COMPUTER_MOUNT_TEXT = "text"

export const COMPUTER_MOUNT_TOOL_CALL = "toolCall"

export const COMPUTER_MOUNT_GET_WINDOW = "get_window_state"

export const COMPUTER_MOUNT_TOOLS = [
  "start_session",
  "set_config",
  "set_cursor",
  "end_session",
  "list_apps",
  "list_windows",
  "get_window_state",
  "get_desktop_state",
  "screenshot",
  "bring_to_front",
  "click",
  "type_text",
]

export const COMPUTER_MOUNT_SOURCE = 'AXWindow "Documento"\n[1] AXButton "Salvar"'

export const COMPUTER_MOUNT_SESSION_END = "end_session"

export const COMPUTER_MOUNT_CAPTURE_RESULT = "computer-captured"

export const COMPUTER_MOUNT_LOG_MISSING = "O driver falso não recebeu caminho de log."

export const COMPUTER_MOUNT_NEWLINE = "\n"

export const COMPUTER_MOUNT_UTF8 = "utf8"

export const COMPUTER_MOUNT_TIMEOUT_MS = 30000

export const COMPUTER_MOUNT_LOG_MAX_BYTES = 1048576

export const COMPUTER_MOUNT_LOG_TOO_LARGE = "O log do driver falso excede o limite de leitura."

export const COMPUTER_MOUNT_LOG_READ_FLAG = "r"

export const COMPUTER_MOUNT_LOG_LIMIT_DESCRIPTION = "log excedente é recusado sem aceitar eventos parciais"

export const COMPUTER_MOUNT_REQUIRED_TEXT = "A ação exige text."

export const COMPUTER_MOUNT_ELEMENTS: ComputerMountFakeElement[] = [
  { element_index: 1, role: "AXButton", label: "Salvar", element_token: "snapshot-1" },
]

export const COMPUTER_MOUNT_STATE: ComputerMountFakeState = {
  screenshot_png_b64:
    "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAADEUlEQVR4nO3BgQAAAADDoPlTX+EAVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMBvArQAAVkUTe8AAAAASUVORK5CYII=",
  screenshot_mime_type: "image/png",
  message: "feito",
  verified: true,
  windows: [{ app_name: "Editor", pid: 10, window_id: 20, is_on_screen: true, title: "Documento", z_index: 1 }],
  apps: [{ name: "Editor", pid: 10, running: true }],
  elements: [],
  tree_markdown: COMPUTER_MOUNT_SOURCE,
}

export const COMPUTER_MOUNT_SUITE_DESCRIPTION = "montagem computer-use na distribuição"

export const COMPUTER_MOUNT_CAPTURE_DESCRIPTION = "entrada real registra computer_use e devolve captura ao modelo"

export const COMPUTER_MOUNT_VERDICT_DESCRIPTION = "ação montada preserva veredito e referência da captura"

export const COMPUTER_MOUNT_INVALID_DESCRIPTION = "entrada inválida é recusada antes de iniciar driver"

export const COMPUTER_MOUNT_SHUTDOWN_DESCRIPTION = "shutdown da entrada real encerra sessão e processo montados"

export const COMPUTER_MOUNT_TOOL_RESULT_ROLE = "toolResult"

export const COMPUTER_MOUNT_RESULT_MISSING = "O provedor falso não recebeu o resultado da ferramenta."

export const COMPUTER_MOUNT_RESULT_TEXT_PENDING = "result-text-pending"

export const COMPUTER_MOUNT_RESULT_TEXT_PRESENT = "result-text-present"

export const COMPUTER_MOUNT_RESULT_TEXT_MISSING = "result-text-missing"

export const COMPUTER_MOUNT_RESULT_LAST_DESCRIPTION = "texto vem do último toolResult, ignorando mensagem posterior"

export const COMPUTER_MOUNT_RESULT_FIRST_DESCRIPTION =
  "texto vem do primeiro bloco textual entre blocos de outros tipos"

export const COMPUTER_MOUNT_RESULT_EMPTY_DESCRIPTION = "último toolResult vazio não reutiliza resultado anterior"

export const COMPUTER_MOUNT_RESULT_EMPTY_FIRST_DESCRIPTION = "primeiro bloco textual vazio impede aceitar o segundo"

export const COMPUTER_MOUNT_RESULT_ABSENT_TEXT_DESCRIPTION = "primeiro bloco textual sem text impede aceitar o segundo"

export const COMPUTER_MOUNT_RESULT_STRING_DESCRIPTION = "conteúdo string no último toolResult é recusado"

export const COMPUTER_MOUNT_RESULT_NON_TEXT_DESCRIPTION = "último toolResult sem bloco textual é recusado"

export const COMPUTER_MOUNT_RESULT_NO_MESSAGE_DESCRIPTION = "histórico sem toolResult é recusado"

export const COMPUTER_MOUNT_RESULT_WHITESPACE_DESCRIPTION = "texto com espaço preserva o conteúdo original"

export const COMPUTER_MOUNT_RESULT_RECOVERY_DESCRIPTION = "toolResult válido substitui resultado anterior vazio"

export const COMPUTER_MOUNT_LIFECYCLE_DESCRIPTION = "resumo conta encerramentos antes e depois do início"

export const COMPUTER_MOUNT_LIFECYCLE_OPEN_DESCRIPTION = "resumo de processo ativo conta zero encerramentos"

export const COMPUTER_MOUNT_PID_REPEATED_DESCRIPTION = "prova PID recusa duas partidas com o mesmo identificador"

export const COMPUTER_MOUNT_STORED = "capture-stored"

export const COMPUTER_MOUNT_DRIVER_STARTED = "driver-started"

export const COMPUTER_MOUNT_PROCESS_ABSENT_CODE = "ESRCH"

export const COMPUTER_MOUNT_PROCESS_ERROR_CODE = "code"

export const COMPUTER_MOUNT_PID_ABSENT_DESCRIPTION = "prova PID recusa evento de início ausente"

export const COMPUTER_MOUNT_PID_DUPLICATE_DESCRIPTION = "prova PID recusa mais de um processo iniciado"

export const COMPUTER_MOUNT_PID_INVALID_DESCRIPTION = "prova PID recusa identificador inválido"

export const COMPUTER_MOUNT_PID_MISSING = "PID do driver falso não registrado."

export const COMPUTER_MOUNT_PROCESS_STILL_ALIVE = "O processo do driver falso permanece vivo."

export const COMPUTER_MOUNT_LIVE_NEGATIVE_DESCRIPTION = "prova de término recusa processo que permanece vivo"

export const COMPUTER_MOUNT_FAKE_SERVER_NAME = "computer-mount-fake"

export const COMPUTER_MOUNT_LIFECYCLE_EVENTS: ComputerMountEvent[] = [
  { name: COMPUTER_MOUNT_SESSION_END },
  { name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 12 },
  { name: COMPUTER_MOUNT_GET_WINDOW },
  { name: COMPUTER_MOUNT_SESSION_END },
]

export const COMPUTER_MOUNT_LIFECYCLE_OPEN_EVENTS: ComputerMountEvent[] = [
  { name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 12 },
]

export const COMPUTER_MOUNT_PID_REPEATED_EVENTS: ComputerMountEvent[] = [
  { name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 12 },
  { name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 12 },
]
