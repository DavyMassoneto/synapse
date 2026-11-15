import { type WindowsNativeFaultCase } from "./types"

export const SUPERVISED_TEST_OUTPUT_BACKGROUND_COMMAND = "head -c 200000 /dev/zero; sleep 1 &"
export const SUPERVISED_TEST_OUTPUT_FOREGROUND_COMMAND = "head -c 200000 /dev/zero"
export const SUPERVISED_TEST_CLEANUP_RESULT = 7
export const SUPERVISED_TEST_CANCEL_OUTPUT = "canceled-user-code"
export const SUPERVISED_TEST_EXCLUSION_PREFIX = "-"
export const SUPERVISED_TEST_SIGNAL_ID = "signal"
export const SUPERVISED_TEST_SIGNAL_COMMAND = "kill -HUP $$"
export const SUPERVISED_TEST_FORBIDDEN_SCRIPT = "process.stdout.write('forbidden')"
export const SUPERVISED_TEST_INVALID_TIMEOUT_ERROR = "Invalid timeout: must be a finite number of seconds"
export const SUPERVISED_TEST_ABSENT_MARKER_PREFIX = "WINDOW"
export const SUPERVISED_TEST_ABSENT_MARKER_SUFFIX = "S_ABSENT"
export const SUPERVISED_TEST_ABSENT_MARKER = "WINDOWS_ABSENT"
export const SUPERVISED_TEST_NATIVE_CALL_ID = "native"
export const SUPERVISED_TEST_OWNED_CALL_ID = "owned"
export const SUPERVISED_TEST_CONTENT_TEXT_TYPE = "text"
export const SUPERVISED_TEST_RESULT_SEPARATOR = "\n\n"
export const SUPERVISED_TEST_MEMBER_SLEEP_COMMAND = "sleep 20"
export const SUPERVISED_TEST_BACKGROUND_COMMAND_PREFIX = "sleep 30 & printf '%s' $! > '"
export const SUPERVISED_TEST_BACKGROUND_COMMAND_SUFFIX = "'; exit 7"
export const SUPERVISED_TEST_PS_EXECUTABLE = "/bin/ps"
export const SUPERVISED_TEST_PS_PID_FLAG = "-p"
export const SUPERVISED_TEST_PS_FORMAT_FLAG = "-o"
export const SUPERVISED_TEST_PS_ALL_FLAG = "-axo"
export const SUPERVISED_TEST_PS_PID_FORMAT = "pid="
export const SUPERVISED_TEST_LINE_SEPARATOR = "\n"
export const SUPERVISED_TEST_INCOMPLETE_JSON = "{"
export const SUPERVISED_TEST_CLOSE_PID = "1234"
export const SUPERVISED_TEST_HEX_ENCODING = "hex"
export const SUPERVISED_TEST_INVALID_OBSERVATIONS = ["CHILD_ALIVE:1234", "CHILD_ABSENT:5678", "CHILD_PID_MISSING"]
export const SUPERVISED_TEST_INVALID_CLOSE_FRAMES = [
  "0102000000000000001d",
  "0102000000000000001d0303",
  "0103000000000000001d02",
]
export const SUPERVISED_TEST_NODE_EVAL_FLAG = "-e"
export const SUPERVISED_TEST_IGNORED_STDIO = "ignore"
export const SUPERVISED_TEST_WINDOWS_CHILD_PID_PATTERN = /CHILD_PID:(\d+)/
export const SUPERVISED_TEST_WINDOWS_MISSING_PID = "CHILD_PID_MISSING"
export const SUPERVISED_TEST_WINDOWS_OVERSIZE_ERROR = "Shell frame exceeds byte limit"
export const SUPERVISED_TEST_WINDOWS_TRUNCATED_ERROR = "Incomplete shell frame body"
export const SUPERVISED_TEST_CONFIGURED_OUTPUT = "configured"
export const SUPERVISED_TEST_STDERR_OUTPUT = "stderr"
export const SUPERVISED_TEST_WINDOWS_DRAIN_SCRIPT = "process.stdout.write(Buffer.alloc(200000,120))"
export const SUPERVISED_TEST_WINDOWS_CLEANUP_MARKER = "CLEANUP_ALL_ATTEMPTED"
export const SUPERVISED_TEST_ABORT_PATTERN = /^Command aborted$/
export const SUPERVISED_TEST_CLOSED_PATTERN = /^Supervisor de shell encerrado\.$/
export const SUPERVISED_TEST_MISSING_EXECUTABLE = "/nonexistent/synapse-executable"
export const SUPERVISED_TEST_MISSING_EXECUTABLE_ERROR = "No such file"
export const SUPERVISED_TEST_NATIVE_INPUT_COMMAND = "printf WINDOWS_READY; sleep 20"
export const SUPERVISED_TEST_INPUT_FILLER = "x"
export const SUPERVISED_TEST_RELEASED_STATE = "released"
export const SUPERVISED_TEST_PID_PATTERN = /^\d+$/
export const SUPERVISED_TEST_CHILD_ABSENT = "CHILD_ABSENT:"

export const SUPERVISED_TEST_WINDOWS_NATIVE_FAULT_CASES: WindowsNativeFaultCase[] = [
  { target: "WaitChecked", expected: "WaitChecked:CHECKED" },
  { target: "ResumeChecked", expected: "ResumeChecked:CHECKED" },
  { target: "AssignProcessToJobObject", expected: "AssignProcessToJobObject:REFUSED" },
]

export const SUPERVISED_TEST_ENV: NodeJS.ProcessEnv = { PATH: "/usr/bin:/bin", MARKER: "configured" }
export const SUPERVISED_TEST_COMMAND = "printf '%s\n' \"$MARKER\"; printf 'stderr\n' >&2; exit 7"
export const SUPERVISED_TEST_NO_ACK = "printf 'must-not-run'"
export const SUPERVISED_TEST_TIMEOUT_MS = 15000

export const SUPERVISED_TEST_NATIVE_PARITY = "factory nativa e operações supervisionadas preservam saída e exit code"
export const SUPERVISED_TEST_PARITY_OUTPUTS = ["stdout\nstderr\n", "stderr\nstdout\n"]
export const SUPERVISED_TEST_PARITY_EXIT_STATUS = "Command exited with code 7"
export const SUPERVISED_TEST_PARITY_COMMAND = "printf 'stdout\n'; printf 'stderr\n' >&2; exit 7"

export const SUPERVISED_TEST_BACKGROUND = "(sleep 0.05; printf 'background-finished') & exit 0"
export const SUPERVISED_TEST_BACKGROUND_TITLE = "resultado do líder não fecha ownership dos filhos em segundo plano"
export const SUPERVISED_TEST_KILL_ERROR = "simulated kill failure"

export const SUPERVISED_TEST_OVERRIDE_SOURCE =
  'async function execute(){return{content:[{type:"text",text:"override"}]}};export default function register(pi){pi.registerTool({name:"bash",label:"override",description:"external-override",defaultActive:false,parameters:{type:"object",properties:{},required:[]},execute})}'
export const SUPERVISED_TEST_OVERRIDE_DESCRIPTION = "external-override"
export const SUPERVISED_TEST_TIMEOUT_COMMAND = "printf entered; sleep 5; printf NEVER"
export const SUPERVISED_TEST_BACKGROUND_TIMEOUT = "sleep 5 & exit 7"
export const SUPERVISED_TEST_TIMEOUT_TITLE = "timeout supervisionado preserva erro nativo sem virar abort"
export const SUPERVISED_TEST_EXIT_TIMEOUT_TITLE = "saída do líder precede timeout com pipes herdados"
export const SUPERVISED_TEST_INTERRUPT_TITLE = "interrupção do membro encerra leases de shell registrados"

export const SUPERVISED_TEST_WINDOWS = "win32"
export const SUPERVISED_TEST_WINDOWS_ARGUMENT = 'space and "quote"'
export const SUPERVISED_TEST_WINDOWS_MARKER = "WINDOWS_READY"
export const SUPERVISED_TEST_WINDOWS_SCRIPT =
  "function idle(){};process.stdout.write(JSON.stringify({arg:process.argv[1],cwd:process.cwd(),env:process.env.PROOF_ENV})+'\\nWINDOWS_READY\\n');setInterval(idle,1000)"
export const SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE =
  "Job de produção preserva argumentos com espaço e aspas e termina pelo lease"
export const SUPERVISED_TEST_WINDOWS_NOACK_TITLE = "Job de produção não executa antes do release"

export const SUPERVISED_TEST_WINDOWS_CLOSE_TITLE = "fechar handle do Job encerra o processo sem TerminateJobObject"
export const SUPERVISED_TEST_WINDOWS_INVALID_TITLE =
  "canal Windows recusa JSON inválido e frame excedente antes de criar"
export const SUPERVISED_TEST_WINDOWS_NOACK_EFFECT = "pre-release-effect"
export const SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT =
  "function idle(){};require('node:fs').writeFileSync(process.argv[1],'executed');setInterval(idle,1000)"

export const SUPERVISED_TEST_WINDOWS_LAUNCHER_URL =
  "../../../src/modules/agent-team/adapters/supervised-shell/windows/launcher.ps1"

export const WINDOWS_SHELL_POWERSHELL = "powershell.exe"
export const WINDOWS_SHELL_FLAGS = ["-NoLogo", "-NoProfile", "-NonInteractive", "-File"]

export const SUPERVISED_TEST_DRAIN_TITLE = "resultado aguarda saída foreground e sink assíncrono"
export const SUPERVISED_TEST_CANCEL_CREATE_TITLE = "abort durante criação não libera código do usuário"
export const SUPERVISED_TEST_STOP_CREATE_TITLE = "stop inclui criação pendente e revoga release"
export const SUPERVISED_TEST_DRAIN_COMMAND = "head -c 200000 /dev/zero"
export const SUPERVISED_TEST_CANCEL_COMMAND = "printf canceled-user-code"
export const SUPERVISED_TEST_SIGNAL_TITLE = "sinal conserva código 128 mais sinal"
export const SUPERVISED_TEST_INVALID_TIMEOUT_TITLE = "timeout inválido recusa antes de criar keeper"
export const SUPERVISED_TEST_UNIX_SUITE_FIRST = "keeper libera apenas após ACK e preserva argumentos e saída"
export const SUPERVISED_TEST_UNIX_SUITE_SECOND = "lease sem ACK não executa comando"

export const SUPERVISED_TEST_BACKGROUND_INTERRUPT_TITLE =
  "sleep em segundo plano continua após resultado e morre na interrupção"
export const SUPERVISED_TEST_BACKGROUND_PID_FILE = "background.pid"
export const SUPERVISED_TEST_BACKGROUND_TEMP = "supervised-background-"

export const SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE = "Windows recusa frame excedente antes de alocar corpo"
export const SUPERVISED_TEST_WINDOWS_UTF8_TITLE = "Windows recusa UTF-8 inválido sem executar shell"
export const SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE = "Windows recusa frame truncado antes de criar shell"

export const SUPERVISED_TEST_WINDOWS_FAULTS_URL = "./windows-faults.ps1"
export const SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE = "Windows recusa falha nativa $target"

export const SUPERVISED_TEST_DEADLINE_FAILURE_TITLE = "deadline propaga falha de kill sem esperar completion pendente"

export const SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL = "./windows-fence.ps1"
export const SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE =
  "Windows tenta todos os cleanups mesmo com CloseHandle inválido"
export const SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE = "Windows interrompe stdin grande sem leitor no filho"

export const SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE =
  "Windows drena fence do produtor e sink lento antes do resultado"

export const SUPERVISED_TEST_MARKER_SPLIT_TITLE = "marcador reconhece cada ponto de fragmentação e preserva texto %i"
export const SUPERVISED_TEST_MARKER_ABSENT_TITLE = "texto sem marcador não altera ordem dos chunks"
export const SUPERVISED_TEST_WINDOWS_FAULT_BUFFER_BYTES = 65536
export const SUPERVISED_TEST_WINDOWS_OBSERVE_URL = "./windows-observe.ps1"
export const SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS = 60000
export const SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS = 15000
export const SUPERVISED_TEST_WINDOWS_PID_SCRIPT =
  "function idle(){};process.stderr.write('CHILD_PID:'+process.pid+'\\nWINDOWS_READY\\n');setTimeout(idle,60000)"

export const SUPERVISED_TEST_OUTPUT_FAILURE = "foreground lost"
export const SUPERVISED_TEST_CANCEL_RESULT_ABORT_TITLE = "abort aguarda T após C falhar e preserva falhas: Tfail=%s"
export const SUPERVISED_TEST_CANCEL_RESULT_TIMEOUT_TITLE = "timeout aguarda T após C falhar e preserva falhas: Tfail=%s"
export const SUPERVISED_TEST_IMMEDIATE_ABORT_TITLE = "abort imediato antes da admissão preserva Command aborted"
export const SUPERVISED_TEST_CLOSED_ABORT_TITLE = "supervisor fechado não é ocultado por abort concorrente"

export const SUPERVISED_TEST_CLOSE_FRAME_BYTES = 11
export const SUPERVISED_TEST_CLOSE_CREATED_BYTE = 1
export const SUPERVISED_TEST_CLOSE_EXIT_BYTE = 2
export const SUPERVISED_TEST_CLOSE_EXIT_OFFSET = 2
export const SUPERVISED_TEST_CLOSE_ACCEPTED_OFFSET = 6
export const SUPERVISED_TEST_CLOSE_EMPTY_OFFSET = 10
export const SUPERVISED_TEST_CLOSE_EMPTY_BYTE = 3
export const SUPERVISED_TEST_MARKER_WAIT_MS = 10000
export const SUPERVISED_TEST_SLOW_OUTPUT_MS = 100

export const SUPERVISED_TEST_PARITY_TIMEOUT_SECONDS = 0.25
export const SUPERVISED_TEST_PARITY_TIMEOUT_MESSAGE = "entered\n\nCommand timed out after 0.25 seconds"

export const SUPERVISED_TEST_CLOSE_OBSERVATION_TITLE = "contrato CloseJob recusa observação inválida %s"
export const SUPERVISED_TEST_CLOSE_INVALID_FRAME_TITLE = "contrato CloseJob recusa frame inválido %s"

export const SUPERVISED_TEST_SYNC_CLEANUP_TITLE = "cleanup captura throw síncrono sem impedir outra limpeza"
export const SUPERVISED_TEST_ASYNC_CLEANUP_TITLE = "cleanup preserva identidade da rejeição assíncrona"
export const SUPERVISED_TEST_VALUE_CLEANUP_TITLE = "cleanup thunk retorna valor exato da operação"

export const SUPERVISED_TEST_RELOAD_DEFAULT_TITLE = "bash supervisionado nasce ativo pela configuração nativa"
export const SUPERVISED_TEST_RELOAD_INACTIVE_TITLE = "reload com override preserva inativação explícita"
export const SUPERVISED_TEST_RELOAD_ACTIVE_TITLE = "reload com override preserva ativação explícita"
export const SUPERVISED_TEST_RELOAD_REMOVAL_TITLE = "remoção do override em reload restaura bash supervisionado ativo"

export const SUPERVISED_TEST_NATIVE_BURST_TITLE = "trinta shells em fork simultâneo terminam somente com ESRCH"
export const SUPERVISED_TEST_NATIVE_BURST_COMMAND = "printf WINDOWS_READY; for i in {1..20}; do sleep 8 & done; wait"

export const SUPERVISED_TEST_NATIVE_INPUT_TITLE = "stdin Unix de 600KB sem leitor não bloqueia STOP"

export const SUPERVISED_TEST_NATIVE_EXEC_FAILURE_TITLE =
  "exec nativo falho preserva errno e confirma cleanup sem exit falso"

export const SUPERVISED_BURST_PREPARATION = "prepare-ms"
export const SUPERVISED_BURST_STOP = "release-to-stop-ms"
export const SUPERVISED_BURST_COMPLETION = "release-to-CT-ms"
export const SUPERVISED_BURST_PHASE_SEPARATOR = "\n"

export const SUPERVISED_TEST_WINDOWS_SENTINEL_SCRIPT = "function idle(){};setInterval(idle,1000)"
export const SUPERVISED_TEST_WINDOWS_READY_SCRIPT =
  "function idle(){};process.stdout.write('WINDOWS_READY\\n');setInterval(idle,1000)"

export const SUPERVISED_BURST_LEASE_COUNT = 30
export const SUPERVISED_BURST_PREPARATION_HOOK_MS = SUPERVISED_BURST_LEASE_COUNT * SUPERVISED_TEST_TIMEOUT_MS

export const SUPERVISED_TEST_SHELL_EXECUTABLE = "/bin/bash"
export const SUPERVISED_TEST_SHELL_COMMAND_FLAG = "-c"
export const SUPERVISED_TEST_EXITED_STATE = "exited"
export const SUPERVISED_TEST_QUARANTINED_STATE = "quarantined"
export const SUPERVISED_BURST_LOG_SEPARATOR = " "
export const SUPERVISED_BURST_DELAY_SLOTS = 3
export const SUPERVISED_TEST_WINDOWS_ENCODING = "utf8"
export const SUPERVISED_TEST_WINDOWS_STDIO = "pipe"
export const SUPERVISED_TEST_WINDOWS_STATUS_EVENT = "data"
export const SUPERVISED_TEST_WINDOWS_ERROR_EVENT = "error"
export const SUPERVISED_TEST_WINDOWS_CLOSE_EVENT = "close"
export const SUPERVISED_TEST_WINDOWS_HEADER_BYTES = 4
export const SUPERVISED_TEST_WINDOWS_CREATED_BYTE = 1
export const SUPERVISED_TEST_WINDOWS_RELEASE_BYTE = 1
export const SUPERVISED_TEST_WINDOWS_CLOSE_BYTE = 3
export const SUPERVISED_TEST_SETTINGS_FILE = "settings.json"
export const SUPERVISED_TEST_BASH_TOOL = "bash"
export const SUPERVISED_TEST_CAUSAL_SINK_DELAY_MS = 150
export const SUPERVISED_TEST_NATIVE_OUTPUT_PARITY_TITLE = "saída 200 KB aceita com paridade nativa background=%s"
