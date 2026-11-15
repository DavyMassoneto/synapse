export const UNIX_KEEPER_URL = "./keeper.ts"
export const UNIX_KEEPER_PIPE = "pipe"
export const UNIX_KEEPER_IGNORE = "ignore"
export const UNIX_KEEPER_KILL = "SIGKILL"
export const UNIX_KEEPER_NODE = "--no-warnings"
export const UNIX_KEEPER_INVALID = "Protocolo do keeper de shell inválido."

export const UNIX_KEEPER_JITI_REGISTER = "jiti/register"
export const UNIX_KEEPER_IMPORT = "--import"
export const UNIX_KEEPER_CONTROL_FD = 3
export const UNIX_KEEPER_INTERVAL_MS = 1000
export const UNIX_KEEPER_SIGTERM = "SIGTERM"
export const UNIX_KEEPER_SIGHUP = "SIGHUP"
export const UNIX_KEEPER_INCOMPLETE_FRAME = "Frame de shell incompleto."

export const UNIX_KEEPER_SIGNAL_OFFSET = 128

export const UNIX_KEEPER_GROUP_WAIT_MS = 5000
export const UNIX_KEEPER_GROUP_RECHECK_MS = 20
export const UNIX_KEEPER_PS = "/bin/ps"
export const UNIX_KEEPER_PS_ARGUMENTS = ["-axo", "pgid="]
export const UNIX_KEEPER_PS_MAX_BYTES = 1048576

export const UNIX_KEEPER_STDERR_FD = 2
export const UNIX_KEEPER_EVENT_ERROR = "error"
export const UNIX_KEEPER_EVENT_EXIT = "exit"
export const UNIX_KEEPER_EVENT_END = "end"
export const UNIX_KEEPER_LINE_SEPARATOR = "\n"
export const UNIX_KEEPER_UTF8 = "utf8"

export const SHELL_REQUIREMENT_PS = "Shell supervisionado requer /bin/ps executável para confirmar o grupo Unix."

export const UNIX_KEEPER_GROUP_PATTERN_PREFIX = "(?:^|\\n)[ \\t]*"
export const UNIX_KEEPER_GROUP_PATTERN_SUFFIX = "[ \\t]*(?:\\n|$)"
