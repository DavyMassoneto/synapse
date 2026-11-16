import { type UnixNativeStdio } from "./types"
export const UNIX_KEEPER_INVALID = "Protocolo do keeper de shell inválido."

export const UNIX_KEEPER_CONTROL_FD = 3
export const UNIX_KEEPER_INCOMPLETE_FRAME = "Frame de shell incompleto."

export const UNIX_KEEPER_STDERR_FD = 2

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

export const UNIX_CONTROL_RELEASE = "release"
export const UNIX_CONTROL_PARTIAL = "partial-stop"
export const UNIX_CONTROL_INVALID = "invalid"
export const UNIX_CONTROL_STOP = "stop"

export const UNIX_KEEPER_EVENT_DRAIN = "drain"

export const UNIX_KEEPER_OVERSIZE_FRAME = "Frame de shell excede o limite permitido."
