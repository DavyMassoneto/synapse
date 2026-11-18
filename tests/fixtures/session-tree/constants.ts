import { fileURLToPath } from "node:url"
import { SCRIPTED_PROVIDER_MODEL, SCRIPTED_PROVIDER_PROVIDER, type ScriptedProviderScript } from "../scripted-provider"
import { SELECTION_PROVIDER_URL } from "../task-selection"
import {
  type TreeAcquisitionKind,
  type TreeAcquisitionPhase,
  type TreeCleanupThrow,
  type TreeDefaultCleanupThrow,
  type TreeSettings,
  type TreeTransitionAction,
} from "./types"

export const TREE_DEFAULT_THROW = "default"
export const TREE_EXPLICIT_THROW = "explicit"
export const TREE_DEFAULT_CLEANUP_THROW: TreeDefaultCleanupThrow = { kind: TREE_DEFAULT_THROW }
export const TREE_MISSING_FILE_CODE = "ENOENT"
export const TREE_REFUSED = "refused"
export const TREE_OPEN_METHOD = "open"
export const TREE_REOPEN_METHOD = "reopen"
export const TREE_ACQUISITION_BEFORE = "before"
export const TREE_ACQUISITION_AFTER = "after"
export const TREE_NAVIGATE_ACTION = "navigate"
export const TREE_SHUTDOWN_ACTION = "shutdown"
export const TREE_RELOAD_ACTION = "reload"
export const TREE_ACQUISITION_MATRIX =
  "aquisições pendentes antes/depois de open/reopen aguardam cleanup em navegação/shutdown/reload"
export const TREE_ACQUISITION_KINDS: TreeAcquisitionKind[] = [TREE_OPEN_METHOD, TREE_REOPEN_METHOD]
export const TREE_ACQUISITION_PHASES: TreeAcquisitionPhase[] = [TREE_ACQUISITION_BEFORE, TREE_ACQUISITION_AFTER]
export const TREE_TRANSITION_ACTIONS: TreeTransitionAction[] = [
  TREE_NAVIGATE_ACTION,
  TREE_SHUTDOWN_ACTION,
  TREE_RELOAD_ACTION,
]
export const TREE_ARBITRARY_CLEANUP = "throws arbitrários preservam causa e não interrompem cleanup real"
export const TREE_ARBITRARY_OBJECT = { failure: "fixture" }
export const TREE_EXPLICIT_ERROR = new Error("Falha explícita preservada por identidade")
export const TREE_ARBITRARY_FAILURES: TreeCleanupThrow[] = [
  42,
  false,
  0,
  "",
  TREE_ARBITRARY_OBJECT,
  TREE_EXPLICIT_ERROR,
]
export const TREE_STRING_FAILURE = "falha textual preservada"
export const TREE_WRITE_FILE_METHOD = "writeFileSync"
export const TREE_REMOVE_METHOD = "rmSync"
export const TREE_KILL_METHOD = "kill"
export const TREE_DISPOSE_METHOD = "dispose"
export const TREE_SHOW_METHOD = "show"
export const TREE_SUSPEND_METHOD = "suspend"
export const TREE_CLOSE_OBSERVATION_MS = 5000
export const TREE_PENDING_CLOSE_SCENARIO = "nova navegação aguarda lifetime antigo antes de reabrir mesma sessão"
export const TREE_SHOW_SHUTDOWN_SCENARIO = "show reentrante não restaura após shutdown"
export const TREE_CLOSE_PRIMARY_SCENARIO = "cleanup preserva identidade de falha única"
export const TREE_CLOSE_PAIR_SCENARIO = "cleanup preserva suspensão e dispose sem mascarar primário"
export const TREE_CLOSE_MULTIPLE_SCENARIO = "cleanup tenta todos os passos e preserva erros ordenados"
export const TREE_CLOSE_SUSPEND_ERROR = "Falha após suspensão real"
export const TREE_CLOSE_DISPOSE_ERROR = "Falha após dispose real"
export const TREE_CLOSE_REMOVE_ERROR = "Falha após remoção real"
export const TREE_ACQUISITION_PRIMARY = "Falha injetada de preparação"
export const TREE_ACQUISITION_SECONDARY = "Falha injetada de cleanup"
export const TREE_SETTINGS_FILE_SUFFIX = "settings.json"
export const TREE_SCRIPT_FILE_SUFFIX = "script.json"
export const TREE_FIRST_SETTINGS_WRITE = 1
export const TREE_SETTINGS_TARGET = "settings"
export const TREE_SCRIPT_TARGET = "script"
export const TREE_ISOLATION_SCENARIO = "HOME e XDG ficam no cenário e voltam após fechamento"
export const TREE_RUNTIME_FAILURE_SCENARIO = "falha de runtime encerra aquisição e restaura ambiente"
export const TREE_RUNTIME_CREATE = "create"
export const TREE_PARENT_FAILURE_SCENARIO = "falha durante super remove diretório desde primeira aquisição"
export const TREE_SETTINGS_FAILURE_SCENARIO = "falha de settings remove aquisição e preserva erro primário"
export const TREE_SCRIPT_FAILURE_SCENARIO = "falha de script remove aquisição e preserva erro primário"
export const TREE_CLEANUP_FAILURE_SCENARIO = "falha secundária mantém ambas identidades"
export const TREE_PID_ALIVE_SCENARIO = "PID atual é vivo"
export const TREE_PID_MISSING_SCENARIO = "somente ESRCH comprova morte"
export const TREE_PID_PERMISSION_SCENARIO = "EPERM não comprova morte"
export const TREE_PERMISSION_CODE = "EPERM"
export const TREE_PROBE_ERROR = "Falha injetada de probe PID"
export const TREE_CORRUPT_SCENARIO = "história inválida fecha projeção antiga e permite recuperação"
export const TREE_OVERLAP_SCENARIO = "navegação antiga não restaura nem encerra equipe do ramo mais recente"
export const TREE_RELOAD_SCENARIO = "reload invalida restauração do runtime anterior"
export const TREE_SESSION_TREE_EVENT = "session_tree"
export const TREE_SESSION_SHUTDOWN_EVENT = "session_shutdown"
export const TREE_QUIT_REASON = "quit"
export const TREE_SHUTDOWN_SCENARIO = "shutdown invalida restauração que aguarda suspensão"
export const TREE_BAD_TASK_ENTRY = "agent-team-task"
export const TREE_BAD_TASK_DATA = { invalid: true }
export const TREE_SUITE = "navegação de equipe no SDK real"
export const TREE_BRANCH_SCENARIO = "root e ramos isolam membros e tarefas, suspendem shells e retornam sem executar"
export const TREE_CANCEL_SCENARIO = "navegação cancelada preserva a equipe em execução"
export const TREE_INVALID_SCENARIO = "alvo inexistente não suspende nem troca a equipe"
export const TREE_TIMEOUT_MS = 30000
export const TREE_POLL_MS = 10
export const TREE_WORKER = "worker"
export const TREE_ALTERNATE = "alternate"
export const TREE_DESCRIPTION = "session tree fixture"
export const TREE_CHECKPOINT = "session-tree-checkpoint"
export const TREE_ROOT_PROMPT = "root"
export const TREE_MEMBER_PROMPT = "Execute o shell controlado."
export const TREE_INVALID_TARGET = "entry-does-not-exist"
export const TREE_PID_SUFFIX = ".pid"
export const TREE_PROBE_FILE = "lifecycle.jsonl"
export const TREE_PROBE_URL = new URL("./probe/register.ts", import.meta.url)
export const TREE_BEFORE_EVENT = "session_before_tree"
export const TREE_NO_RECORD = "Registro de membro não encontrado"
export const TREE_WAIT_FAILURE = "O shell do membro não iniciou dentro do prazo"
export const TREE_PID_INVALID = "PID do shell inválido"
export const TREE_FILE_ENCODING = "utf8"
export const TREE_BASH_TOOL = "bash"
export const TREE_TOOL_CALL_STEP = "toolCall"
export const TREE_STARTED_OUTCOME = "started"
export const TREE_CUSTOM_ENTRY = "custom"
export const TREE_SHELL_TIMEOUT_SECONDS = 120
export const TREE_WORKER_MARKER = 'Seu nome é \\"worker\\"'
export const TREE_ALTERNATE_MARKER = 'Seu nome é \\"alternate\\"'
export const TREE_NODE_COMMAND_PREFIX =
  "node -e \"function idle(){};const intervalMs=1000;require('node:fs').writeFileSync('"
export const TREE_NODE_COMMAND_SUFFIX = ".pid',String(process.pid));setInterval(idle,intervalMs)\""
export const TREE_SETTINGS: TreeSettings = {
  extensions: [fileURLToPath(SELECTION_PROVIDER_URL), fileURLToPath(TREE_PROBE_URL)],
  defaultProvider: SCRIPTED_PROVIDER_PROVIDER,
  defaultModel: SCRIPTED_PROVIDER_MODEL,
}
export const TREE_SCRIPT: ScriptedProviderScript = {
  tracks: [
    {
      marker: TREE_WORKER_MARKER,
      steps: [
        {
          kind: TREE_TOOL_CALL_STEP,
          name: TREE_BASH_TOOL,
          argumentsJson: JSON.stringify({
            command: TREE_NODE_COMMAND_PREFIX + TREE_WORKER + TREE_NODE_COMMAND_SUFFIX,
            timeout: TREE_SHELL_TIMEOUT_SECONDS,
          }),
        },
      ],
    },
    {
      marker: TREE_ALTERNATE_MARKER,
      steps: [
        {
          kind: TREE_TOOL_CALL_STEP,
          name: TREE_BASH_TOOL,
          argumentsJson: JSON.stringify({
            command: TREE_NODE_COMMAND_PREFIX + TREE_ALTERNATE + TREE_NODE_COMMAND_SUFFIX,
            timeout: TREE_SHELL_TIMEOUT_SECONDS,
          }),
        },
      ],
    },
    { steps: [{ kind: "text", text: "notice received" }] },
  ],
}
export const TREE_HOME_DIRECTORY = "home"
export const TREE_XDG_CONFIG_DIRECTORY = "xdg-config"
export const TREE_XDG_CACHE_DIRECTORY = "xdg-cache"
export const TREE_XDG_DATA_DIRECTORY = "xdg-data"
export const TREE_HOME_ENV = "HOME"
export const TREE_XDG_CONFIG_ENV = "XDG_CONFIG_HOME"
export const TREE_XDG_CACHE_ENV = "XDG_CACHE_HOME"
export const TREE_XDG_DATA_ENV = "XDG_DATA_HOME"
export const TREE_ACQUISITION_FAILURE = "Falha na aquisição e no cleanup do cenário de árvore"
export const TREE_MISSING_PROCESS_CODE = "ESRCH"
export const TREE_LEAD = "lead"
export const TREE_TASK = "task-2"
export const TREE_ACCEPTED = "accepted"
export const TREE_CLAIM = "claim"
export const TREE_REASSIGN = "reassign"
export const TREE_SELECTED = "selected"
export const TREE_UNSELECTED = "unselected"
export const TREE_INACTIVE = "inactive"
export const TREE_RUNNING = "running"
export const TREE_USER_ROLE = "user"
export const TREE_INVALID_TARGET_PATTERN = /not found/
