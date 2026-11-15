import { SHELL_WIRE_GATE_RELEASE } from "../wire"
import {
  UNIX_CONTROL_INVALID,
  UNIX_CONTROL_PARTIAL,
  UNIX_CONTROL_RELEASE,
  UNIX_CONTROL_STOP,
  UNIX_NATIVE_STOP,
  UNIX_NATIVE_STOP_BYTES,
} from "./constants"
import { type UnixControlInstruction } from "./types"

export class UnixControlDecoder {
  private pending = Buffer.alloc(0)
  receive(bytes: Buffer): UnixControlInstruction[] {
    this.pending = Buffer.concat([this.pending, bytes])
    const instructions: UnixControlInstruction[] = []
    while (this.pending.length > 0) {
      if (this.pending[0] === SHELL_WIRE_GATE_RELEASE) {
        instructions.push({ kind: UNIX_CONTROL_RELEASE })
        this.pending = this.pending.subarray(1)
      } else if (this.pending[0] !== UNIX_NATIVE_STOP) {
        instructions.push({ kind: UNIX_CONTROL_INVALID })
        this.pending = Buffer.alloc(0)
      } else if (this.pending.length < UNIX_NATIVE_STOP_BYTES) {
        instructions.push({ kind: UNIX_CONTROL_PARTIAL })
        break
      } else {
        instructions.push({ kind: UNIX_CONTROL_STOP, deadline: this.pending.readBigUInt64BE(1) })
        this.pending = this.pending.subarray(UNIX_NATIVE_STOP_BYTES)
      }
    }
    return instructions
  }
}
