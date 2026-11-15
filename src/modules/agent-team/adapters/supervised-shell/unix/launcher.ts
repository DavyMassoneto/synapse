import { spawn } from "node:child_process"
import { join } from "node:path"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SupervisedWireLease } from "../wire"
import { confirmUnixGroupEmpty } from "./confirm-group"
import {
  UNIX_KEEPER_CONTROL_FD,
  UNIX_KEEPER_IGNORE,
  UNIX_KEEPER_IMPORT,
  UNIX_KEEPER_INVALID,
  UNIX_KEEPER_JITI_REGISTER,
  UNIX_KEEPER_LENGTH_BYTES,
  UNIX_KEEPER_NODE,
  UNIX_KEEPER_PIPE,
  UNIX_KEEPER_URL,
} from "./constants"
import { encodeUnixKeeperSpec } from "./encode-spec"
import { terminateUnixKeeper } from "./terminate"

export class UnixSupervisedShellLauncher implements SupervisedShellLauncher {
  async create(spec: SupervisedShellSpec, output: SupervisedShellOutput): Promise<SupervisedShellLease> {
    const content = encodeUnixKeeperSpec(spec)
    const child = spawn(
      process.execPath,
      [UNIX_KEEPER_NODE, UNIX_KEEPER_IMPORT, UNIX_KEEPER_JITI_REGISTER, join(__dirname, UNIX_KEEPER_URL)],
      { detached: true, stdio: [UNIX_KEEPER_IGNORE, UNIX_KEEPER_PIPE, UNIX_KEEPER_PIPE, UNIX_KEEPER_PIPE] },
    )
    if (!child.pid) {
      throw new Error(UNIX_KEEPER_INVALID)
    }
    const input = child.stdio[UNIX_KEEPER_CONTROL_FD]
    if (!child.stdout || !child.stderr || !input || !("write" in input)) {
      child.kill()
      throw new Error(UNIX_KEEPER_INVALID)
    }
    const lease = new SupervisedWireLease(
      {
        process: child,
        requiresEmptyAck: false,
        confirmEmpty: confirmUnixGroupEmpty.bind(undefined, child.pid),
        status: child.stdout,
        output: child.stderr,
        input,
        terminate: terminateUnixKeeper.bind(undefined, child),
      },
      output,
    )
    const header = Buffer.alloc(UNIX_KEEPER_LENGTH_BYTES)
    header.writeUInt32BE(content.length)
    input.write(header)
    input.write(content)
    try {
      await lease.ready()
      return lease
    } catch (error) {
      await lease.terminate()
      throw error
    }
  }
}
