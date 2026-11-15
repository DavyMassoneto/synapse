import {
  SHELL_WIRE_COMPLETED,
  SHELL_WIRE_CREATED,
  SHELL_WIRE_CREATED_BYTE,
  SHELL_WIRE_EMPTY_BYTE,
  SHELL_WIRE_ERROR_BYTE,
  SHELL_WIRE_ERROR_HEADER_BYTES,
  SHELL_WIRE_ERROR_MAX_BYTES,
  SHELL_WIRE_EXITED,
  SHELL_WIRE_FAILED,
  SHELL_WIRE_FATAL_UTF8,
  SHELL_WIRE_INVALID,
  SHELL_WIRE_RELEASED,
  SHELL_WIRE_STATUS_BYTES,
  SHELL_WIRE_WAITING,
  WIRE_BYTE_COUNT_OFFSET,
} from "./constants"
import { type ShellWireStatus } from "./types"

export class ShellStatusReader {
  state: ShellWireStatus = { kind: SHELL_WIRE_WAITING }
  empty = false
  private buffer = Buffer.alloc(0)

  receive(chunk: Buffer): void {
    if (
      this.state.kind === SHELL_WIRE_COMPLETED &&
      chunk.length === 1 &&
      chunk[0] === SHELL_WIRE_EMPTY_BYTE &&
      !this.empty
    ) {
      this.empty = true
    } else {
      this.receiveStatus(chunk)
    }
  }

  private receiveStatus(chunk: Buffer): void {
    if (
      this.state.kind === SHELL_WIRE_COMPLETED ||
      this.state.kind === SHELL_WIRE_FAILED ||
      this.buffer.length + chunk.length > SHELL_WIRE_ERROR_MAX_BYTES + SHELL_WIRE_ERROR_HEADER_BYTES
    ) {
      this.fail()
    }
    this.buffer = Buffer.concat([this.buffer, chunk])
    if (this.state.kind === SHELL_WIRE_WAITING && this.buffer.length > 0) {
      if (this.buffer[0] !== SHELL_WIRE_CREATED_BYTE) {
        this.fail()
      }
      this.buffer = this.buffer.subarray(1)
      this.state = { kind: SHELL_WIRE_CREATED }
    }
    if (this.buffer.length > 0) {
      if (
        this.state.kind !== SHELL_WIRE_RELEASED ||
        (this.buffer[0] !== SHELL_WIRE_EXITED && this.buffer[0] !== SHELL_WIRE_ERROR_BYTE)
      ) {
        this.fail()
      }
      if (this.buffer[0] === SHELL_WIRE_ERROR_BYTE) {
        this.errorFrame()
      } else {
        this.completeFrame()
      }
    }
  }

  private errorFrame(): void {
    if (this.buffer.length >= SHELL_WIRE_ERROR_HEADER_BYTES) {
      const bytes = this.buffer.readUInt16BE(1)
      if (bytes > SHELL_WIRE_ERROR_MAX_BYTES || this.buffer.length > bytes + SHELL_WIRE_ERROR_HEADER_BYTES) {
        this.fail()
      }
      if (this.buffer.length === bytes + SHELL_WIRE_ERROR_HEADER_BYTES) {
        const message = new TextDecoder(SHELL_WIRE_FATAL_UTF8, { fatal: true }).decode(
          this.buffer.subarray(SHELL_WIRE_ERROR_HEADER_BYTES),
        )
        this.state = { kind: SHELL_WIRE_FAILED }
        throw new Error(message)
      }
    }
  }

  private completeFrame(): void {
    if (this.buffer.length >= SHELL_WIRE_STATUS_BYTES) {
      this.state = {
        kind: SHELL_WIRE_COMPLETED,
        exitCode: this.buffer.readInt32BE(1),
        acceptedBytes: this.buffer.readUInt32BE(WIRE_BYTE_COUNT_OFFSET),
      }
      const trailing = this.buffer.subarray(SHELL_WIRE_STATUS_BYTES)
      this.buffer = Buffer.alloc(0)
      if (trailing.length > 0) {
        if (trailing.length !== 1 || trailing[0] !== SHELL_WIRE_EMPTY_BYTE) {
          this.fail()
        }
        this.empty = true
      }
    }
  }

  release(): void {
    if (this.state.kind !== SHELL_WIRE_CREATED) {
      this.fail()
    }
    this.state = { kind: SHELL_WIRE_RELEASED }
  }

  eof(): void {
    if (this.buffer.length > 0 || this.state.kind !== SHELL_WIRE_COMPLETED) {
      this.fail()
    }
  }

  private fail(): never {
    this.state = { kind: SHELL_WIRE_FAILED }
    throw new Error(SHELL_WIRE_INVALID)
  }
}
