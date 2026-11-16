import { type ChildProcess } from "node:child_process"
import { UNIX_KEEPER_EVENT_ERROR, UNIX_PARENT_STDIN_FD } from "./constants"

export function feedUnixShellInput(child: ChildProcess, input?: string): void {
  const stream = child.stdio.at(UNIX_PARENT_STDIN_FD)
  if (stream && "end" in stream) {
    stream.on(UNIX_KEEPER_EVENT_ERROR, stream.destroy.bind(stream, undefined))
    stream.end(input)
  }
}
