export const WINDOWS_SHELL_POWERSHELL = "powershell.exe"
export const WINDOWS_SHELL_FLAGS = ["-NoLogo", "-NoProfile", "-NonInteractive", "-File"]
export const WINDOWS_SHELL_LAUNCHER = "./launcher.ps1"
export const WINDOWS_SHELL_TERMINATE = 2
export const WINDOWS_SHELL_INVALID = "Especificação de shell Windows inválida."

export const WINDOWS_SHELL_PIPE = "pipe"

export const SHELL_REQUIREMENT_POWERSHELL =
  "Shell supervisionado requer powershell.exe (Windows PowerShell 5.1), mas o executável não foi encontrado."
export const SHELL_REQUIREMENT_ADD_TYPE = "Shell supervisionado requer Add-Type funcional no Windows PowerShell 5.1."
export const SHELL_REQUIREMENT_ADD_TYPE_MARKER = "ADD_TYPE_AVAILABLE"
export const SHELL_REQUIREMENT_PROBE_FLAGS = ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]
export const SHELL_REQUIREMENT_PROBE =
  "$ErrorActionPreference='Stop';Add-Type -TypeDefinition 'public sealed class SupervisedShellCapabilityProbe { public static string Check() { return \"ADD_TYPE_AVAILABLE\"; } }';[Console]::Out.WriteLine([SupervisedShellCapabilityProbe]::Check())"
export const SHELL_REQUIREMENT_PROBE_MS = 15000
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
export const WINDOWS_SHELL_UTF8 = "utf8"
