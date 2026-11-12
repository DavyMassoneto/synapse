import { Type } from "typebox"
import { type PiProcessMatch } from "../pi-process-matching"
import { type PiProcessSettings } from "../pi-process-settings"

export const PI_PROCESS_TIMEOUT_MS = 60_000

export const PI_PROCESS_COMMAND_TIMEOUT_MS = 30_000

export const PI_PROCESS_SHUTDOWN_TIMEOUT_MS = 5_000

export const PI_PROCESS_REMOVE_RETRIES = 10

export const PI_PROCESS_MAX_BUFFER_BYTES = 8_388_608

export const PI_PROCESS_PREFIX = "synapse-pi-process-"

export const PI_PROCESS_ENCODING = "utf8"

export const PI_PROCESS_SETTINGS_FILE = "settings.json"

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

export const PI_PROCESS_RETRY_SETTINGS: PiProcessSettings = {
  retry: { enabled: true, maxRetries: 1, baseDelayMs: 10, maxAgentDelayMs: 10 },
  enableInstallTelemetry: false,
  enableAnalytics: false,
}

export const PI_PROCESS_MANIFEST_SCHEMA = Type.Object({ pi: Type.Object({ extensions: Type.Tuple([Type.String()]) }) })

export const PI_PROCESS_SDK_SCHEMA = Type.Object({ bin: Type.Object({ pi: Type.String() }) })

export const PI_PROCESS_RECORD_SCHEMA = Type.Object({
  type: Type.String(),
  id: Type.Optional(Type.String()),
  success: Type.Optional(Type.Boolean()),
  method: Type.Optional(Type.String()),
  message: Type.Optional(
    Type.Union([
      Type.String(),
      Type.Object({
        role: Type.String(),
        stopReason: Type.Optional(Type.String()),
        errorMessage: Type.Optional(Type.String()),
      }),
    ]),
  ),
  notifyType: Type.Optional(Type.String()),
  statusKey: Type.Optional(Type.String()),
  statusText: Type.Optional(Type.String()),
})

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

export const PI_PROCESS_FLAGS = ["--mode", "rpc", "--no-session", "--no-extensions", "--offline"]

export const PI_PROCESS_EXTENSION_FLAG = "-e"

export const PI_PROCESS_MODEL_FLAG = "--model"

export const PI_PROCESS_RESPONSE_TYPE = "response"

export const PI_PROCESS_NOT_STARTED = "Processo pi não iniciado: chame start() antes de enviar comandos"

export const PI_PROCESS_GET_COMMANDS_SCHEMA = Type.Object({
  data: Type.Object({ commands: Type.Array(Type.Object({ name: Type.String(), source: Type.String() })) }),
})

export const PI_PROCESS_LAST_ASSISTANT_TEXT_SCHEMA = Type.Object({
  data: Type.Object({ text: Type.Union([Type.String(), Type.Null()]) }),
})

export const PI_PROCESS_DIAGNOSTIC_OVERLAP = 128

export const PI_PROCESS_PROMPT_COMMAND = "prompt"

export const PI_PROCESS_SEARCH_FOUND = "found"

export const PI_PROCESS_SEARCH_PENDING = "pending"

export const PI_PROCESS_ALREADY_STARTED = "Processo pi já iniciado; não é possível iniciá-lo novamente."
