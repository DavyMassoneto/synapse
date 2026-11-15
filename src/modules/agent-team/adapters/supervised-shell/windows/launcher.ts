import { spawn } from "node:child_process"
import { join } from "node:path"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { encodeShellSpec, SupervisedWireLease, writeShellSpec } from "../wire"
import {
  WINDOWS_SHELL_FLAGS,
  WINDOWS_SHELL_INVALID,
  WINDOWS_SHELL_LAUNCHER,
  WINDOWS_SHELL_POWERSHELL,
} from "./constants"
import { confirmWindowsShellEmpty, terminateWindowsShell } from "./terminate"

export class WindowsSupervisedShellLauncher implements SupervisedShellLauncher {
  async create(
    spec: SupervisedShellSpec,
    output: SupervisedShellOutput,
    signal?: AbortSignal,
  ): Promise<SupervisedShellLease> {
    const body = encodeShellSpec(spec, WINDOWS_SHELL_INVALID)
    const child = spawn(WINDOWS_SHELL_POWERSHELL, [...WINDOWS_SHELL_FLAGS, join(__dirname, WINDOWS_SHELL_LAUNCHER)], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    })
    const lease = new SupervisedWireLease(
      {
        process: child,
        requiresEmptyAck: true,
        confirmEmpty: confirmWindowsShellEmpty.bind(undefined, child),
        status: child.stdout,
        output: child.stderr,
        input: child.stdin,
        terminate: terminateWindowsShell.bind(undefined, child.stdin),
      },
      output,
      signal,
    )
    writeShellSpec(child.stdin, body)
    try {
      await lease.ready()
      return lease
    } catch (error) {
      await lease.terminate()
      if (signal?.aborted && signal.reason instanceof Error) {
        throw signal.reason
      }
      throw error
    }
  }
}
