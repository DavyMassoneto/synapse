import { type UnixNativeStdio } from "./types"
export const UNIX_KEEPER_URL = "./keeper.ts"
export const UNIX_KEEPER_PIPE = "pipe"
export const UNIX_KEEPER_IGNORE = "ignore"
export const UNIX_KEEPER_NODE = "--no-warnings"
export const UNIX_KEEPER_INVALID = "Protocolo do keeper de shell inválido."

export const UNIX_KEEPER_JITI_REGISTER = "jiti/register"
export const UNIX_KEEPER_IMPORT = "--import"
export const UNIX_KEEPER_CONTROL_FD = 3
export const UNIX_KEEPER_INCOMPLETE_FRAME = "Frame de shell incompleto."

export const UNIX_KEEPER_GROUP_WAIT_MS = 5000
export const UNIX_KEEPER_GROUP_RECHECK_MS = 20
export const UNIX_KEEPER_PS = "/bin/ps"
export const UNIX_KEEPER_PS_ARGUMENTS = ["-axo", "pgid="]
export const UNIX_KEEPER_PS_MAX_BYTES = 1048576

export const UNIX_KEEPER_STDERR_FD = 2
export const UNIX_KEEPER_UTF8 = "utf8"

export const SHELL_REQUIREMENT_PS = "Shell supervisionado requer /bin/ps executável para confirmar o grupo Unix."

export const UNIX_KEEPER_GROUP_PATTERN_PREFIX = "(?:^|\\n)[ \\t]*"
export const UNIX_KEEPER_GROUP_PATTERN_SUFFIX = "[ \\t]*(?:\\n|$)"

export const UNIX_NATIVE_CONTROL_FD = 3
export const UNIX_NATIVE_STATUS_FD = 4
export const UNIX_NATIVE_EXECUTABLE_ARGUMENT = 2
export const UNIX_NATIVE_STOP = 2
export const UNIX_NATIVE_STOP_BYTES = 9
export const UNIX_NATIVE_RECHECK_MS = 10
export const UNIX_PARENT_STDIN_FD = 5
export const UNIX_NATIVE_FAILURE_EXIT = 94
export const UNIX_NATIVE_STDIO: UnixNativeStdio = [
  "ignore",
  "ignore",
  "ignore",
  "pipe",
  "pipe",
  "ignore",
  UNIX_KEEPER_STDERR_FD,
  UNIX_PARENT_STDIN_FD,
]

export const UNIX_NATIVE_STOP_BUDGET_NS = 5000000000n

export const UNIX_KEEPER_EVENT_ERROR = "error"
export const UNIX_KEEPER_EVENT_DATA = "data"
export const UNIX_KEEPER_EVENT_CLOSE = "close"
export const UNIX_KEEPER_EVENT_END = "end"
