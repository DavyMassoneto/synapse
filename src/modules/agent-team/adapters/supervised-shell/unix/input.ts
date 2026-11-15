import { type ChildProcess } from "node:child_process"
import { type Writable } from "node:stream"
import { UNIX_PARENT_STDIN_FD } from "./constants"

export function feedUnixShellInput(child: ChildProcess, input?: string): void {
  const stream = child.stdio.at(UNIX_PARENT_STDIN_FD)
  if (stream && "end" in stream) {
    stream.on("error", failedUnixInput.bind(undefined, stream))
    stream.end(input)
  }
}
function failedUnixInput(stream: Writable): void {
  stream.destroy()
}
