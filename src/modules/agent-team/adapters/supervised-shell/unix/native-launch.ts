import { spawn } from "node:child_process"
import { closeSync } from "node:fs"
import { type ShellWireSpec } from "../wire"
import {
  UNIX_KEEPER_INVALID,
  UNIX_KEEPER_STDERR_FD,
  UNIX_NATIVE_CONTROL_FD,
  UNIX_NATIVE_STATUS_FD,
  UNIX_NATIVE_STDIO,
  UNIX_PARENT_STDIN_FD,
} from "./constants"
import { createUnixShellEnvironment } from "./environment"
import { type UnixNativeProcess } from "./types"

export function launchUnixNative(spec: ShellWireSpec, executable: string): UnixNativeProcess {
  const child = spawn(executable, [spec.cwd, spec.executable, ...spec.arguments], {
    env: createUnixShellEnvironment(spec.environment),
    stdio: UNIX_NATIVE_STDIO,
  })
  const input = child.stdio[UNIX_NATIVE_CONTROL_FD]
  const status = child.stdio[UNIX_NATIVE_STATUS_FD]
  if (!input || !("write" in input) || !status || !("read" in status)) {
    throw new Error(UNIX_KEEPER_INVALID)
  }
  closeSync(UNIX_KEEPER_STDERR_FD)
  closeSync(UNIX_PARENT_STDIN_FD)
  return { child, input, status }
}
