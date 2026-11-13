import { type PiProcessModelSelection } from "../model-selection"
import { type PiProcessSettings } from "../pi-process-settings"
import {
  SCRIPTED_PROVIDER_MODEL,
  SCRIPTED_PROVIDER_MODEL_REFERENCE,
  SCRIPTED_PROVIDER_PROVIDER,
} from "../scripted-provider"
import { type PiProcessMatch, type PiProcessQueryErrors, type PiProcessUiMatches } from "./types"

export const PI_PROCESS_TIMEOUT_MS = 60_000

export const PI_PROCESS_COMMAND_TIMEOUT_MS = 30_000

export const PI_PROCESS_SHUTDOWN_TIMEOUT_MS = 5_000

export const PI_PROCESS_REMOVE_RETRIES = 10

export const PI_PROCESS_MAX_BUFFER_BYTES = 8_388_608

export const PI_PROCESS_PREFIX = "synapse-pi-process-"

export const PI_PROCESS_ENCODING = "utf8"

export const PI_PROCESS_PI_DIRECTORY = ".pi"

export const PI_PROCESS_AGENT_DIRECTORY = "agent"

export const PI_PROCESS_SDK_PACKAGE = "@earendil-works/pi-coding-agent"

export const PI_PROCESS_MANIFEST_FILE = "package.json"

export const PI_PROCESS_PACKAGE_URL = new URL("../../../package.json", import.meta.url)

export const PI_PROCESS_ROOT_URL = new URL("../../../", import.meta.url)

export const PI_PROCESS_NEWLINE = "\n"

export const PI_PROCESS_CARRIAGE_RETURN = /\r$/

export const PI_PROCESS_LOADING_ERROR =
  /Failed to load extension|Error loading extension|Cannot find module|Extension.*not found/i

export const PI_PROCESS_LOAD_FAILURE = "Falha ao carregar extensão do pi: "

export const PI_PROCESS_EXIT_FAILURE = "Processo pi encerrado antes da resposta: "

export const PI_PROCESS_TIMEOUT_FAILURE = "Tempo limite ao aguardar registro RPC: "

export const PI_PROCESS_BUFFER_FAILURE = "Saída do pi excedeu o limite de leitura."

export const PI_PROCESS_MISSING_ENTRY = "missing-extension.js"

export const PI_PROCESS_STATUS_EVENT: PiProcessMatch = {
  type: "extension_ui_request",
  method: "setStatus",
  statusKey: "advisor",
}

export const PI_PROCESS_SETTLED_EVENT: PiProcessMatch = { type: "agent_settled" }

export const PI_PROCESS_NOTICE_EVENT: PiProcessMatch = { type: "extension_ui_request", method: "notify" }

export const PI_PROCESS_DATA_EVENT = "data"

export const PI_PROCESS_ERROR_EVENT = "error"

export const PI_PROCESS_CLOSE_EVENT = "close"

export const PI_PROCESS_RECORD_EVENT = "record"

export const PI_PROCESS_DRAIN_EVENT = "drain"

export const PI_PROCESS_KILL_SIGNAL = "SIGKILL"

export const PI_PROCESS_STDIO = "pipe"

export const PI_PROCESS_HOME_VARIABLE = "HOME"

export const PI_PROCESS_PROFILE_VARIABLE = "USERPROFILE"

export const PI_PROCESS_AGENT_VARIABLE = "PI_CODING_AGENT_DIR"

export const PI_PROCESS_PATH_VARIABLE = "PATH"

export const PI_PROCESS_SYSTEM_ROOT_VARIABLE = "SystemRoot"

export const PI_PROCESS_WINDOWS_VARIABLE = "WINDIR"

export const PI_PROCESS_APPDATA_VARIABLE = "APPDATA"

export const PI_PROCESS_LOCAL_APPDATA_VARIABLE = "LOCALAPPDATA"

export const PI_PROCESS_CONFIG_VARIABLE = "XDG_CONFIG_HOME"

export const PI_PROCESS_CACHE_VARIABLE = "XDG_CACHE_HOME"

export const PI_PROCESS_FLAGS = ["--mode", "rpc", "--no-extensions", "--offline"]

export const PI_PROCESS_NO_SESSION_FLAG = "--no-session"

export const PI_PROCESS_SESSION_FLAG = "--session"

export const PI_PROCESS_SESSION_DIRECTORY_FLAG = "--session-dir"

export const PI_PROCESS_EXTENSION_FLAG = "-e"

export const PI_PROCESS_MODEL_FLAG = "--model"

export const PI_PROCESS_RESPONSE_TYPE = "response"

export const PI_PROCESS_NOT_STARTED = "Processo pi não iniciado: chame start() antes de enviar comandos"

export const PI_PROCESS_DIAGNOSTIC_OVERLAP = 128

export const PI_PROCESS_PROMPT_COMMAND = "prompt"

export const PI_PROCESS_SEARCH_FOUND = "found"

export const PI_PROCESS_SEARCH_PENDING = "pending"

export const PI_PROCESS_ALREADY_STARTED = "Processo pi já iniciado; não é possível iniciá-lo novamente."

export const PI_PROCESS_SHUTDOWN_TIMEOUT = "O pi não encerrou dentro do prazo."

export const PI_PROCESS_COMMANDS_RESPONSE_MISSING = "Resposta de comandos ausente"

export const PI_PROCESS_DIAGNOSTIC_FAILURE = "failure"

export const PI_PROCESS_DIAGNOSTIC_ACCEPTED = "accepted"

export const PI_PROCESS_UI_REQUEST_TYPE = "extension_ui_request"

export const PI_PROCESS_STATUS_METHOD = "setStatus"

export const PI_PROCESS_NOTICE_METHOD = "notify"

export const PI_PROCESS_UI_RESPONSE_MISSING = "Registro RPC recebido não corresponde ao evento de interface esperado."

export const PI_PROCESS_UI_MATCHES: PiProcessUiMatches = {
  setStatus: PI_PROCESS_STATUS_EVENT,
  notify: PI_PROCESS_NOTICE_EVENT,
}

export const PI_PROCESS_SETTINGS_FILE = "settings.json"

export const PI_PROCESS_RETRY_SETTINGS: PiProcessSettings = {
  retry: { enabled: true, maxRetries: 1, baseDelayMs: 10, maxAgentDelayMs: 10 },
  enableInstallTelemetry: false,
  enableAnalytics: false,
}

export const PI_PROCESS_LAST_ASSISTANT_TEXT_COMMAND = "get_last_assistant_text"

export const PI_PROCESS_LAST_ASSISTANT_TEXT_MISSING = "Registro RPC recebido não corresponde ao texto final do modelo."

export const PI_PROCESS_GET_COMMANDS_COMMAND = "get_commands"

export const PI_PROCESS_AVAILABLE_MODELS_MISSING = "Registro RPC recebido não corresponde aos modelos disponíveis."

export const PI_PROCESS_QUERY_ERRORS: PiProcessQueryErrors = {
  get_available_models: PI_PROCESS_AVAILABLE_MODELS_MISSING,
  get_commands: PI_PROCESS_COMMANDS_RESPONSE_MISSING,
  get_last_assistant_text: PI_PROCESS_LAST_ASSISTANT_TEXT_MISSING,
}

export const PI_PROCESS_DEFAULT_SELECTION: PiProcessModelSelection = {
  provider: SCRIPTED_PROVIDER_PROVIDER,
  model: SCRIPTED_PROVIDER_MODEL,
  startupModel: SCRIPTED_PROVIDER_MODEL_REFERENCE,
}
