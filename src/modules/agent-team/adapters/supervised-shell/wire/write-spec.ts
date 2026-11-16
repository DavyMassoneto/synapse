import { type Writable } from "node:stream"
import { SHELL_WIRE_FRAME_LENGTH_BYTES } from "./constants"

export function writeShellSpec(input: Writable, body: Buffer): void {
  const header = Buffer.alloc(SHELL_WIRE_FRAME_LENGTH_BYTES)
  header.writeUInt32BE(body.length)
  input.write(header)
  input.write(body)
}
