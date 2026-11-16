import { type CompiledNativeSpec, type ShellTestStdioOptions } from "./native-test-types"

export const SHELL_COMPILED_NATIVE_CC = "cc"
export const SHELL_COMPILED_NATIVE_POSIX = "-D_POSIX_C_SOURCE=200809L"
export const SHELL_COMPILED_NATIVE_INCLUDE = "-I"
export const SHELL_COMPILED_NATIVE_OUTPUT = "-o"
export const SHELL_COMPILED_NATIVE_SOURCE_DIRECTORY = "../adapters/supervised-shell/unix/native"

export const SHELL_COMPILED_CLOCK_FAILURE: CompiledNativeSpec = {
  directoryPrefix: "native-clock-failure-",
  executable: "clock-failure-launcher",
  fixture: "native-clock-failure.c",
  sources: [],
}
export const SHELL_COMPILED_CONTROL_DEADLINE: CompiledNativeSpec = {
  directoryPrefix: "native-deadline-",
  executable: "deadline-test",
  fixture: "native-control-deadline.c",
  sources: ["control.c", "clock.c"],
}
export const SHELL_COMPILED_EXEC_CLASSIFICATION: CompiledNativeSpec = {
  directoryPrefix: "native-exec-order-",
  executable: "classification",
  fixture: "native-exec-classification.c",
  sources: ["child.c", "control.c", "clock.c", "wire.c"],
}
export const SHELL_COMPILED_JOIN_FAILURE: CompiledNativeSpec = {
  directoryPrefix: "native-join-failure-",
  executable: "join-test",
  fixture: "native-join-failure.c",
  sources: ["child.c", "control.c", "clock.c", "wire.c", "reservation.c"],
}
export const SHELL_COMPILED_JOIN_KERNEL: CompiledNativeSpec = {
  directoryPrefix: "native-kernel-join-",
  executable: "join-test",
  fixture: "native-join-kernel.c",
  sources: ["control.c", "clock.c", "wire.c", "reservation.c"],
}
export const SHELL_COMPILED_TERMINAL_COMMIT: CompiledNativeSpec = {
  directoryPrefix: "native-terminal-",
  executable: "terminal-test",
  fixture: "native-terminal-commit.c",
  sources: ["child.c", "control.c", "clock.c", "wire.c"],
}

export const SHELL_NATIVE_RESUME_DELAY_MS = 20

export const SHELL_ADMISSION_FAILURE_PROTOCOL = "protocol"
export const SHELL_ADMISSION_FAILURE_READY = "ready"
export const SHELL_ADMISSION_FAILURE_ABORT = "abort"
export const SHELL_ADMISSION_BEFORE_SPAWN = "before spawn"
export const SHELL_ADMISSION_READY_FAILURE = "ready failed"
export const SHELL_ADMISSION_ERROR_EVENT = "error"
export const SHELL_ADMISSION_INVALID_FRAME = 99
export const SHELL_ADMISSION_FAILURE_MODES = [
  SHELL_ADMISSION_FAILURE_PROTOCOL,
  SHELL_ADMISSION_FAILURE_READY,
  SHELL_ADMISSION_FAILURE_ABORT,
]

export const SHELL_TEST_NODE_IMPORT = "--import"
export const SHELL_TEST_NODE_REGISTER = "jiti/register"
export const SHELL_TEST_EVENT_DATA = "data"
export const SHELL_TEST_EVENT_CLOSE = "close"
export const SHELL_TEST_EVENT_ERROR = "error"
export const SHELL_TEST_BASH = "/bin/bash"
export const SHELL_TEST_BASH_COMMAND_FLAG = "-c"
export const SHELL_TEST_SIGNAL_KILL = "SIGKILL"
export const SHELL_TEST_PIPE_ERROR = "EPIPE"
export const SHELL_RUNTIME_CONTROL_FD = 3
export const SHELL_RUNTIME_INPUT_FD = 5
export const SHELL_RUNTIME_HEADER_BYTES = 4
export const SHELL_FIXTURE_FAILURE_EXIT = 94
export const SHELL_FIXTURE_IDENTITY_FD = 8
export const SHELL_FIXTURE_STDIO: ShellTestStdioOptions = ["ignore", "ignore", "ignore", 3, 4, "ignore", 2, 5]
export const SHELL_FIXTURE_PID_TERMINATOR = "\n"
export const SHELL_TRANSPORT_STDIO: ShellTestStdioOptions = [
  "ignore",
  "ignore",
  "pipe",
  "pipe",
  "pipe",
  "pipe",
  "ignore",
  "ignore",
  "pipe",
]
export const SHELL_TRANSPORT_CONTROL_FD = 3
export const SHELL_TRANSPORT_STATUS_FD = 4
export const SHELL_TRANSPORT_INPUT_FD = 5
export const SHELL_TRANSPORT_IDENTITY_FD = 8
export const SHELL_TRANSPORT_PID_PATTERN = /^\d+\n$/
export const SHELL_TRANSPORT_RELEASE_BYTE = 1
export const SHELL_TRANSPORT_STOP_BYTES = 9
export const SHELL_TRANSPORT_STOP_BYTE = 2
export const SHELL_TRANSPORT_STOP_DEADLINE_OFFSET = 1
export const SHELL_LIFECYCLE_READY_BYTE = 1
export const SHELL_LIFECYCLE_EXIT_FRAME_BYTES = 9
export const SHELL_LIFECYCLE_EXIT_BYTE = 2
export const SHELL_LIFECYCLE_EXIT_OFFSET = 5
export const SHELL_LIFECYCLE_EMPTY_BYTE = 3
export const SHELL_LIFECYCLE_KILLED_CODE = 137
