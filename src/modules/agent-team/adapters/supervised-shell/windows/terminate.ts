import { type ChildProcess as WindowsShellChild } from "node:child_process"
import { type Writable } from "node:stream"
import { WINDOWS_SHELL_INVALID, WINDOWS_SHELL_TERMINATE } from "./constants"

export function terminateWindowsShell(input: Writable): void {
  input.end(Buffer.from([WINDOWS_SHELL_TERMINATE]))
}

export async function confirmWindowsShellEmpty(child: WindowsShellChild): Promise<void> {
  if (typeof child.exitCode !== "number") {
    throw new Error(WINDOWS_SHELL_INVALID)
  }
}
