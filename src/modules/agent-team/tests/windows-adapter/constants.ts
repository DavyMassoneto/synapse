import { type WindowsNativeFaultCase } from "./types"
export const SUPERVISED_TEST_INCOMPLETE_JSON = "{"
export const SUPERVISED_TEST_NODE_EVAL_FLAG = "-e"
export const SUPERVISED_TEST_WINDOWS_CHILD_PID_PATTERN = /CHILD_PID:(\d+)/
export const SUPERVISED_TEST_WINDOWS_MISSING_PID = "CHILD_PID_MISSING"
export const SUPERVISED_TEST_WINDOWS_OVERSIZE_ERROR = "Shell frame exceeds byte limit"
export const SUPERVISED_TEST_WINDOWS_TRUNCATED_ERROR = "Incomplete shell frame body"
export const SUPERVISED_TEST_WINDOWS_CLEANUP_MARKER = "CLEANUP_ALL_ATTEMPTED"
export const SUPERVISED_TEST_PID_PATTERN = /^\d+$/
export const SUPERVISED_TEST_CHILD_ABSENT = "CHILD_ABSENT:"

export const SUPERVISED_TEST_WINDOWS_NATIVE_FAULT_CASES: WindowsNativeFaultCase[] = [
  { target: "WaitChecked", expected: "WaitChecked:CHECKED" },
  { target: "ResumeChecked", expected: "ResumeChecked:CHECKED" },
  { target: "AssignProcessToJobObject", expected: "AssignProcessToJobObject:REFUSED" },
]

export const SUPERVISED_TEST_TIMEOUT_MS = 15000

export const SUPERVISED_TEST_WINDOWS = "win32"
export const SUPERVISED_TEST_WINDOWS_MARKER = "WINDOWS_READY"
export const SUPERVISED_TEST_WINDOWS_CLOSE_TITLE = "fechar handle do Job encerra o processo sem TerminateJobObject"
export const SUPERVISED_TEST_WINDOWS_INVALID_TITLE =
  "canal Windows recusa JSON inválido e frame excedente antes de criar"
export const SUPERVISED_TEST_WINDOWS_LAUNCHER_URL = "../../adapters/supervised-shell/windows/launcher.ps1"

export const WINDOWS_SHELL_POWERSHELL = "powershell.exe"
export const WINDOWS_SHELL_FLAGS = ["-NoLogo", "-NoProfile", "-NonInteractive", "-File"]

export const SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE = "Windows recusa frame excedente antes de alocar corpo"
export const SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE = "Windows recusa frame truncado antes de criar shell"

export const SUPERVISED_TEST_WINDOWS_FAULTS_URL = "./windows-faults.ps1"
export const SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE = "Windows recusa falha nativa $target"

export const SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL = "./windows-fence.ps1"
export const SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE =
  "Windows tenta todos os cleanups mesmo com CloseHandle inválido"
export const SUPERVISED_TEST_WINDOWS_FAULT_BUFFER_BYTES = 65536
export const SUPERVISED_TEST_WINDOWS_OBSERVE_URL = "./windows-observe.ps1"
export const SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS = 60000
export const SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS = 15000
export const SUPERVISED_TEST_WINDOWS_PID_SCRIPT =
  "function idle(){};process.stderr.write('CHILD_PID:'+process.pid+'\\nWINDOWS_READY\\n');setTimeout(idle,60000)"

export const SUPERVISED_TEST_CLOSE_FRAME_BYTES = 11
export const SUPERVISED_TEST_CLOSE_CREATED_BYTE = 1
export const SUPERVISED_TEST_CLOSE_EXIT_BYTE = 2
export const SUPERVISED_TEST_CLOSE_EXIT_OFFSET = 2
export const SUPERVISED_TEST_CLOSE_ACCEPTED_OFFSET = 6
export const SUPERVISED_TEST_CLOSE_EMPTY_OFFSET = 10
export const SUPERVISED_TEST_CLOSE_EMPTY_BYTE = 3
export const SUPERVISED_TEST_WINDOWS_ENCODING = "utf8"
export const SUPERVISED_TEST_WINDOWS_STDIO = "pipe"
export const SUPERVISED_TEST_WINDOWS_STATUS_EVENT = "data"
export const SUPERVISED_TEST_WINDOWS_ERROR_EVENT = "error"
export const SUPERVISED_TEST_WINDOWS_CLOSE_EVENT = "close"
export const SUPERVISED_TEST_WINDOWS_HEADER_BYTES = 4
export const SUPERVISED_TEST_WINDOWS_CREATED_BYTE = 1
export const SUPERVISED_TEST_WINDOWS_RELEASE_BYTE = 1
export const SUPERVISED_TEST_WINDOWS_CLOSE_BYTE = 3
export const SUPERVISED_TEST_WINDOWS_UTF8_TITLE = "Windows recusa UTF-8 inválido sem executar shell"

export const SUPERVISED_TEST_CLOSE_INVALID_FRAME_TITLE = "contrato CloseJob recusa frame inválido %s"

export const SUPERVISED_TEST_CLOSE_OBSERVATION_TITLE = "contrato CloseJob recusa observação inválida %s"
export const SUPERVISED_TEST_CLOSE_PID = "1234"
export const SUPERVISED_TEST_HEX_ENCODING = "hex"
export const SUPERVISED_TEST_INVALID_CLOSE_FRAMES = [
  "0102000000000000001d",
  "0102000000000000001d0303",
  "0103000000000000001d02",
]
export const SUPERVISED_TEST_INVALID_OBSERVATIONS = ["CHILD_ALIVE:1234", "CHILD_ABSENT:5678", "CHILD_PID_MISSING"]
