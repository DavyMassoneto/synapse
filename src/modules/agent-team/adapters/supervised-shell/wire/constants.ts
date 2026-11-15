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

export const SHELL_REQUIREMENT_PS = "Shell supervisionado requer /bin/ps executável para confirmar o grupo Unix."
export const SHELL_REQUIREMENT_POWERSHELL =
  "Shell supervisionado requer powershell.exe (Windows PowerShell 5.1), mas o executável não foi encontrado."
export const SHELL_REQUIREMENT_ADD_TYPE = "Shell supervisionado requer Add-Type funcional no Windows PowerShell 5.1."
export const SHELL_REQUIREMENT_ADD_TYPE_MARKER = "ADD_TYPE_AVAILABLE"
export const SHELL_REQUIREMENT_PROBE_FLAGS = ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]
export const SHELL_REQUIREMENT_PROBE =
  "$ErrorActionPreference='Stop';Add-Type -TypeDefinition 'public sealed class SupervisedShellCapabilityProbe { public static string Check() { return \"ADD_TYPE_AVAILABLE\"; } }';[Console]::Out.WriteLine([SupervisedShellCapabilityProbe]::Check())"
export const SHELL_REQUIREMENT_PROBE_MS = 15000

export const SHELL_WIRE_EVENT_DATA = "data"
export const SHELL_WIRE_EVENT_END = "end"
export const SHELL_WIRE_EVENT_ERROR = "error"
export const SHELL_WIRE_EVENT_CLOSE = "close"
export const SHELL_WIRE_EVENT_ABORT = "abort"
export const SHELL_WIRE_UTF8 = "utf8"
export const SHELL_WIRE_FATAL_UTF8 = "utf-8"

export const SHELL_PROBE_DIAGNOSTIC_BYTES = 2048
export const SHELL_PROBE_DIAGNOSTIC_PREFIX = " Diagnóstico do probe: "

export const SHELL_PROBE_CODE_SUCCESS = "0"
export const SHELL_PROBE_SIGNAL_NONE = "none"
export const SHELL_PROBE_CODE_UNAVAILABLE = "unavailable"
export const SHELL_PROBE_PROPERTY_CODE = "code"
export const SHELL_PROBE_PROPERTY_SIGNAL = "signal"
export const SHELL_PROBE_PROPERTY_KILLED = "killed"
export const SHELL_PROBE_CODE_LABEL = "code="
export const SHELL_PROBE_SIGNAL_LABEL = "; signal="
export const SHELL_PROBE_KILLED_LABEL = "; killed="
export const SHELL_PROBE_STDERR_LABEL = "; stderr="
export const SHELL_PROBE_STDOUT_LABEL = "; stdout="
export const SHELL_REQUIREMENT_NOT_FOUND_CODE = "ENOENT"
export const SHELL_REQUIREMENT_ACCESS_DENIED_CODE = "EACCES"
