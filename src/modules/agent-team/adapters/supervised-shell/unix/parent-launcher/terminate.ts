import { type ChildProcess } from "node:child_process"
import { type Writable } from "node:stream"
import { UNIX_KEEPER_INVALID, UNIX_NATIVE_STOP, UNIX_NATIVE_STOP_BUDGET_NS, UNIX_NATIVE_STOP_BYTES } from "./constants"

export function terminateUnixKeeper(child: ChildProcess, input: Writable, deadline?: bigint): void {
  if (!child.pid || typeof child.exitCode === "number" || typeof child.signalCode === "string") {
    throw new Error(UNIX_KEEPER_INVALID)
  }
  const bytes = Buffer.alloc(UNIX_NATIVE_STOP_BYTES)
  bytes[0] = UNIX_NATIVE_STOP
  let expires = process.hrtime.bigint() + UNIX_NATIVE_STOP_BUDGET_NS
  if (deadline) {
    expires = deadline
  }
  bytes.writeBigUInt64BE(expires, 1)
  input.end(bytes)
}

export async function confirmUnixKeeperClosed(child: ChildProcess): Promise<void> {
  if (child.exitCode !== 0) {
    throw new Error(UNIX_KEEPER_INVALID)
  }
}
