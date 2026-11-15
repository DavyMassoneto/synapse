export const SUPERVISED_TEST_ENV: NodeJS.ProcessEnv = { PATH: "/usr/bin:/bin", MARKER: "configured" }
export const SUPERVISED_TEST_COMMAND = "printf '%s\n' \"$MARKER\"; printf 'stderr\n' >&2; exit 7"
export const SUPERVISED_TEST_NO_ACK = "printf 'must-not-run'"
export const SUPERVISED_TEST_TIMEOUT_MS = 15000

export const SUPERVISED_TEST_NATIVE_PARITY = "factory nativa e operações supervisionadas preservam saída e exit code"
export const SUPERVISED_TEST_PARITY_COMMAND = "printf 'stdout\n'; printf 'stderr\n' >&2; exit 7"

export const SUPERVISED_TEST_BACKGROUND = "(sleep 0.05; printf 'background-finished') & exit 0"
export const SUPERVISED_TEST_BACKGROUND_TITLE = "resultado do líder não fecha ownership dos filhos em segundo plano"
export const SUPERVISED_TEST_KILL_FAILURE_TITLE = "falha de kill deixa lease em quarentena sem repetir sinal"
export const SUPERVISED_TEST_KILL_ERROR = "simulated kill failure"

export const SUPERVISED_TEST_OVERRIDE_SOURCE =
  'export default function(pi){pi.registerTool({name:"bash",label:"override",description:"external-override",defaultActive:false,parameters:{type:"object",properties:{},required:[]},async execute(){return{content:[{type:"text",text:"override"}]}}})}'
export const SUPERVISED_TEST_OVERRIDE_DESCRIPTION = "external-override"
export const SUPERVISED_TEST_OVERRIDE_TITLE = "override do bash após reload preserva substituição e ativação"
export const SUPERVISED_TEST_TIMEOUT_COMMAND = "printf entered; sleep 5; printf NEVER"
export const SUPERVISED_TEST_BACKGROUND_TIMEOUT = "sleep 5 & exit 7"
export const SUPERVISED_TEST_TIMEOUT_TITLE = "timeout supervisionado preserva erro nativo sem virar abort"
export const SUPERVISED_TEST_EXIT_TIMEOUT_TITLE = "saída do líder precede timeout com pipes herdados"
export const SUPERVISED_TEST_INTERRUPT_TITLE = "interrupção do membro encerra leases de shell registrados"

export const SUPERVISED_TEST_WINDOWS = "win32"
export const SUPERVISED_TEST_WINDOWS_ARGUMENT = 'space and "quote"'
export const SUPERVISED_TEST_WINDOWS_MARKER = "WINDOWS_READY"
export const SUPERVISED_TEST_WINDOWS_SCRIPT =
  "process.stdout.write(JSON.stringify({arg:process.argv[1],cwd:process.cwd(),env:process.env.PROOF_ENV})+'\\nWINDOWS_READY\\n');setInterval(()=>{},1000)"
export const SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE =
  "Job de produção preserva argumentos com espaço e aspas e termina pelo lease"
export const SUPERVISED_TEST_WINDOWS_NOACK_TITLE = "Job de produção não executa antes do release"

export const SUPERVISED_TEST_WINDOWS_CLOSE_TITLE = "fechar handle do Job encerra o processo sem TerminateJobObject"
export const SUPERVISED_TEST_WINDOWS_INVALID_TITLE =
  "canal Windows recusa JSON inválido e frame excedente antes de criar"
export const SUPERVISED_TEST_WINDOWS_NOACK_EFFECT = "pre-release-effect"
export const SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT =
  "require('node:fs').writeFileSync(process.argv[1],'executed');setInterval(()=>{},1000)"

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
export const SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE = "Windows detecta WAIT_FAILED e ResumeThread inválido"

export const SUPERVISED_TEST_DEADLINE_FAILURE_TITLE = "deadline propaga falha de kill sem esperar completion pendente"

export const SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL = "./windows-fence.ps1"
export const SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE =
  "Windows tenta todos os cleanups mesmo com CloseHandle inválido"
export const SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE = "Windows interrompe stdin grande sem leitor no filho"

export const SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE =
  "Windows drena fence do produtor e sink lento antes do resultado"
