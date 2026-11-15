import { type ChildProcess } from "node:child_process"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SupervisedWireLease } from "../wire"
import { UNIX_KEEPER_CONTROL_FD, UNIX_KEEPER_INVALID } from "./constants"
import { confirmUnixKeeperClosed, terminateUnixKeeper } from "./terminate"
import { type UnixPreparedProcess } from "./types"

export function ownUnixProcess(
  child: ChildProcess,
  output: SupervisedShellOutput,
  signal?: AbortSignal,
): UnixPreparedProcess {
  const input = child.stdio[UNIX_KEEPER_CONTROL_FD]
  if (!child.pid || !child.stdout || !child.stderr || !input || !("write" in input)) {
    child.kill()
    throw new Error(UNIX_KEEPER_INVALID)
  }
  const lease = new SupervisedWireLease(
    {
      process: child,
      requiresEmptyAck: true,
      preparationTerminal: true,
      confirmEmpty: confirmUnixKeeperClosed.bind(undefined, child),
      status: child.stdout,
      output: child.stderr,
      input,
      terminate: terminateUnixKeeper.bind(undefined, child, input),
    },
    output,
    signal,
  )
  return { lease, input }
}
