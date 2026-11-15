import { spawn } from "node:child_process"
import { join } from "node:path"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellPreparedObserver,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { encodeShellSpec, prepareShellLease, requireWindowsShell, SupervisedWireLease, writeShellSpec } from "../wire"
import {
  WINDOWS_SHELL_FLAGS,
  WINDOWS_SHELL_INVALID,
  WINDOWS_SHELL_LAUNCHER,
  WINDOWS_SHELL_PIPE,
  WINDOWS_SHELL_POWERSHELL,
} from "./constants"
import { confirmWindowsShellEmpty, terminateWindowsShell } from "./terminate"

export class WindowsSupervisedShellLauncher implements SupervisedShellLauncher {
  async create(
    spec: SupervisedShellSpec,
    output: SupervisedShellOutput,
    signal?: AbortSignal,
    prepared?: SupervisedShellPreparedObserver,
  ): Promise<SupervisedShellLease> {
    await requireWindowsShell(WINDOWS_SHELL_POWERSHELL, signal)
    signal?.throwIfAborted()
    const body = encodeShellSpec(spec, WINDOWS_SHELL_INVALID)
    const child = spawn(WINDOWS_SHELL_POWERSHELL, [...WINDOWS_SHELL_FLAGS, join(__dirname, WINDOWS_SHELL_LAUNCHER)], {
      windowsHide: true,
      stdio: [WINDOWS_SHELL_PIPE, WINDOWS_SHELL_PIPE, WINDOWS_SHELL_PIPE],
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
    prepared?.(lease)
    writeShellSpec(child.stdin, body)
    return prepareShellLease(lease, signal)
  }
}
