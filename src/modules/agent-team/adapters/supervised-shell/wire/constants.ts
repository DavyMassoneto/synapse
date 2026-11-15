export const SHELL_WIRE_CREATED_BYTE = 1
export const SHELL_WIRE_EXITED = 2
export const SHELL_WIRE_GATE_RELEASE = 1
export const SHELL_WIRE_STATUS_BYTES = 9
export const SHELL_WIRE_INVALID = "Protocolo do keeper de shell inválido."

export const SHELL_WIRE_KILLED_EXIT = 137
export const SHELL_WIRE_STOP_WAIT_MS = 5000
export const SHELL_WIRE_PREPARATION_WAIT_MS = 15000

export const SHELL_WIRE_STATE_CREATED = "created"
export const SHELL_WIRE_STATE_RELEASED = "released"
export const SHELL_WIRE_STATE_EXITED = "exited"
export const SHELL_WIRE_STATE_QUARANTINED = "quarantined"

export const WIRE_BYTE_COUNT_OFFSET = 5

export const SHELL_WIRE_WAITING = "waiting"
export const SHELL_WIRE_CREATED = "created"
export const SHELL_WIRE_RELEASED = "released"
export const SHELL_WIRE_COMPLETED = "completed"
export const SHELL_WIRE_FAILED = "failed"

export const SHELL_WIRE_EMPTY_BYTE = 3

export const SHELL_WIRE_ERROR_BYTE = 4
export const SHELL_WIRE_ERROR_MAX_BYTES = 4096
export const SHELL_WIRE_ERROR_HEADER_BYTES = 3

export const SHELL_WIRE_STATE_ACKNOWLEDGED = "acknowledged"

export const SHELL_WIRE_MAX_SPEC_BYTES = 1048576
export const SHELL_WIRE_FRAME_LENGTH_BYTES = 4

export const SHELL_WIRE_EVENT_DATA = "data"
export const SHELL_WIRE_EVENT_END = "end"
export const SHELL_WIRE_EVENT_ERROR = "error"
export const SHELL_WIRE_EVENT_CLOSE = "close"
export const SHELL_WIRE_EVENT_ABORT = "abort"
export const SHELL_WIRE_FATAL_UTF8 = "utf-8"

export const SHELL_WIRE_PREPARATION_EMPTY_BYTE = 5
export const SHELL_WIRE_PREPARATION_EMPTY = "preparation-empty"
export const SHELL_WIRE_PREPARATION_HEADER_BYTES = 4
export const SHELL_WIRE_PREPARATION_CANCELLED = 0
export const SHELL_WIRE_PREPARATION_FAILED = 1

export const SHELL_WIRE_NANOSECONDS_PER_MS = 1000000n

export const SHELL_WIRE_AUTH_FORBIDDEN = "forbidden"
export const SHELL_WIRE_AUTH_AUTHORIZED = "authorized"
export const SHELL_WIRE_AUTH_ABSENT = "absent"
export const SHELL_WIRE_AUTH_CLOSED = "closed"
export const SHELL_WIRE_AUTH_REVOKED = "revoked"
export const SHELL_WIRE_AUTH_SENT = "sent"
export const SHELL_WIRE_AUTH_EXECUTION = "execution"
export const SHELL_WIRE_AUTH_EMPTY = "empty"
export const SHELL_WIRE_AUTH_CANCELLED = "cancelled"
export const SHELL_WIRE_AUTH_FAILED = "failed"

export const SHELL_WIRE_EXIT_STDIO_GRACE_MS = 100
