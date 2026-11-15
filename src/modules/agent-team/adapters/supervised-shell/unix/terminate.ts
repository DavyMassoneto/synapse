import { type ChildProcess } from "node:child_process"
import { UNIX_KEEPER_INVALID, UNIX_KEEPER_KILL } from "./constants"

export function terminateUnixKeeper(child: ChildProcess): void {
  if (!child.pid) {
    throw new Error(UNIX_KEEPER_INVALID)
  }
  process.kill(-child.pid, UNIX_KEEPER_KILL)
}
