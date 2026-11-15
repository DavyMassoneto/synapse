export const UNIX_KEEPER_URL = "./keeper.ts"
export const UNIX_KEEPER_MAX_SPEC_BYTES = 1048576
export const UNIX_KEEPER_CREATED = 1
export const UNIX_KEEPER_EXITED = 2
export const UNIX_KEEPER_STATUS_BYTES = 9
export const UNIX_KEEPER_PIPE = "pipe"
export const UNIX_KEEPER_IGNORE = "ignore"
export const UNIX_KEEPER_KILL = "SIGKILL"
export const UNIX_KEEPER_NODE = "--no-warnings"
export const UNIX_KEEPER_INVALID = "Protocolo do keeper de shell inválido."
export const UNIX_KEEPER_INCOMPLETE = "Keeper de shell encerrou antes de confirmar a criação."

export const UNIX_KEEPER_JITI_REGISTER = "jiti/register"
export const UNIX_KEEPER_IMPORT = "--import"
export const UNIX_KEEPER_CONTROL_FD = 3
export const UNIX_KEEPER_LENGTH_BYTES = 4
export const UNIX_KEEPER_CONTROL_RELEASE = 1
export const UNIX_KEEPER_INTERVAL_MS = 1000
export const UNIX_KEEPER_SIGTERM = "SIGTERM"
export const UNIX_KEEPER_SIGHUP = "SIGHUP"
export const UNIX_KEEPER_INCOMPLETE_FRAME = "Frame de shell incompleto."

export const UNIX_KEEPER_SIGNAL_OFFSET = 128
export const UNIX_KEEPER_BYTE_COUNT_OFFSET = 5

export const UNIX_KEEPER_GROUP_WAIT_MS = 5000
export const UNIX_KEEPER_GROUP_RECHECK_MS = 20
export const UNIX_KEEPER_PS = "/bin/ps"
export const UNIX_KEEPER_PS_ARGUMENTS = ["-axo", "pgid="]
export const UNIX_KEEPER_PS_MAX_BYTES = 1048576

export const UNIX_KEEPER_ERROR_BYTE = 4
export const UNIX_KEEPER_ERROR_MAX_BYTES = 4096

export const UNIX_KEEPER_ERROR_HEADER_BYTES = 3
