import { spawn } from "node:child_process"
import { join } from "node:path"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SupervisedWireLease } from "../wire"
import {
  WINDOWS_SHELL_FLAGS,
  WINDOWS_SHELL_LAUNCHER,
  WINDOWS_SHELL_LENGTH_BYTES,
  WINDOWS_SHELL_POWERSHELL,
} from "./constants"
import { encodeWindowsShellSpec } from "./encode-spec"
import { confirmWindowsShellEmpty, terminateWindowsShell } from "./terminate"

export class WindowsSupervisedShellLauncher implements SupervisedShellLauncher {
  async create(spec: SupervisedShellSpec, output: SupervisedShellOutput): Promise<SupervisedShellLease> {
    const body = encodeWindowsShellSpec(spec)
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
    )
    const header = Buffer.alloc(WINDOWS_SHELL_LENGTH_BYTES)
    header.writeUInt32BE(body.length)
    child.stdin.write(header)
    child.stdin.write(body)
    try {
      await lease.ready()
      return lease
    } catch (error) {
      await lease.terminate()
      throw error
    }
  }
}
