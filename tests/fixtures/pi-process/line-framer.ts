import {
  PI_PROCESS_BUFFER_FAILURE,
  PI_PROCESS_CARRIAGE_RETURN,
  PI_PROCESS_MAX_BUFFER_BYTES,
  PI_PROCESS_NEWLINE,
} from "./constants"

export class PiProcessLineFramer {
  private buffer = ""

  private pendingBytes = 0

  append(chunk: string): string[] {
    this.buffer += chunk
    this.pendingBytes += Buffer.byteLength(chunk)
    if (this.pendingBytes > PI_PROCESS_MAX_BUFFER_BYTES) {
      throw new Error(PI_PROCESS_BUFFER_FAILURE)
    }
    const lines: string[] = []
    let start = 0
    let boundary = this.buffer.indexOf(PI_PROCESS_NEWLINE, start)
    while (boundary >= 0) {
      const line = this.buffer.slice(start, boundary).replace(PI_PROCESS_CARRIAGE_RETURN, "")
      start = boundary + 1
      if (line) {
        lines.push(line)
      }
      boundary = this.buffer.indexOf(PI_PROCESS_NEWLINE, start)
    }
    if (start > 0) {
      this.buffer = this.buffer.slice(start)
      this.pendingBytes = Buffer.byteLength(this.buffer)
    }
    return lines
  }
}
