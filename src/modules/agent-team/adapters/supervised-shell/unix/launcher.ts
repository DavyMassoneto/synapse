import { spawn } from "node:child_process"
import { join } from "node:path"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellPreparedObserver,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { encodeShellSpec, prepareShellLease, writeShellSpec } from "../wire"
import {
  UNIX_KEEPER_IGNORE,
  UNIX_KEEPER_IMPORT,
  UNIX_KEEPER_INVALID,
  UNIX_KEEPER_JITI_REGISTER,
  UNIX_KEEPER_NODE,
  UNIX_KEEPER_PIPE,
  UNIX_KEEPER_URL,
} from "./constants"
import { feedUnixShellInput } from "./input"
import { ownUnixProcess } from "./owned-process"
import { provisionUnixLauncher } from "./provision"

export class UnixSupervisedShellLauncher implements SupervisedShellLauncher {
  async create(
    spec: SupervisedShellSpec,
    output: SupervisedShellOutput,
    signal?: AbortSignal,
    prepared?: SupervisedShellPreparedObserver,
  ): Promise<SupervisedShellLease> {
    signal?.throwIfAborted()
    const executable = await provisionUnixLauncher(signal)
    const content = encodeShellSpec(spec, UNIX_KEEPER_INVALID)
    const child = spawn(
      process.execPath,
      [UNIX_KEEPER_NODE, UNIX_KEEPER_IMPORT, UNIX_KEEPER_JITI_REGISTER, join(__dirname, UNIX_KEEPER_URL), executable],
      {
        detached: true,
        stdio: [
          UNIX_KEEPER_IGNORE,
          UNIX_KEEPER_PIPE,
          UNIX_KEEPER_PIPE,
          UNIX_KEEPER_PIPE,
          UNIX_KEEPER_IGNORE,
          UNIX_KEEPER_PIPE,
        ],
      },
    )
    const { lease, input } = ownUnixProcess(child, output, signal)
    prepared?.(lease)
    feedUnixShellInput(child, spec.input)
    writeShellSpec(input, content)
    return prepareShellLease(lease, signal)
  }
}
