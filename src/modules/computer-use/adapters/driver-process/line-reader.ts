import { Buffer } from "node:buffer"
import { COMPUTER_PROCESS_ENCODING, COMPUTER_PROCESS_LINE_BREAK, COMPUTER_PROCESS_MAX_BUFFER_BYTES } from "./constants"
import { type ComputerProcessLineHandler } from "./types"

export class ComputerProcessLineReader {
  private readonly onLine: ComputerProcessLineHandler

  private buffer = ""

  private bufferBytes = 0

  constructor(onLine: ComputerProcessLineHandler) {
    this.onLine = onLine
  }

  receive(chunk: string): boolean {
    this.buffer += chunk
    this.bufferBytes += Buffer.byteLength(chunk, COMPUTER_PROCESS_ENCODING)
    if (this.bufferBytes > COMPUTER_PROCESS_MAX_BUFFER_BYTES) {
      return false
    }
    this.consumeLines()
    return true
  }

  reset(): void {
    this.buffer = ""
    this.bufferBytes = 0
  }

  private consumeLines(): void {
    let start = 0
    let newline = this.buffer.indexOf(COMPUTER_PROCESS_LINE_BREAK)
    while (newline >= 0) {
      this.onLine(this.buffer.slice(start, newline))
      start = newline + COMPUTER_PROCESS_LINE_BREAK.length
      newline = this.buffer.indexOf(COMPUTER_PROCESS_LINE_BREAK, start)
    }
    if (start > 0) {
      this.buffer = this.buffer.slice(start)
      this.bufferBytes = Buffer.byteLength(this.buffer, COMPUTER_PROCESS_ENCODING)
    }
  }
}
