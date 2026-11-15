import {
  SHELL_WIRE_AUTH_CANCELLED,
  SHELL_WIRE_AUTH_FAILED,
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
  SHELL_WIRE_PREPARATION_CANCELLED,
  SHELL_WIRE_PREPARATION_EMPTY,
  SHELL_WIRE_PREPARATION_EMPTY_BYTE,
  SHELL_WIRE_PREPARATION_FAILED,
  SHELL_WIRE_PREPARATION_HEADER_BYTES,
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
  private executionError = false
  private errorMessage = ""

  receive(chunk: Buffer): void {
    if (
      (this.state.kind === SHELL_WIRE_COMPLETED || this.executionError) &&
      chunk.length === 1 &&
      chunk[0] === SHELL_WIRE_EMPTY_BYTE &&
      !this.empty
    ) {
      this.empty = true
    } else {
      this.receiveStatus(chunk)
    }
    if (this.errorMessage) {
      const message = this.errorMessage
      this.errorMessage = ""
      throw new Error(message)
    }
  }

  private preparationFrame(): void {
    if (this.state.kind === SHELL_WIRE_COMPLETED || this.state.kind === SHELL_WIRE_FAILED || this.empty) {
      this.fail()
    }
    if (this.buffer.length > SHELL_WIRE_ERROR_MAX_BYTES + SHELL_WIRE_PREPARATION_HEADER_BYTES) {
      this.fail()
    }
    if (this.buffer.length >= SHELL_WIRE_PREPARATION_HEADER_BYTES) {
      const reason = this.buffer[1]
      const size = this.buffer.readUInt16BE(2)
      if (
        (reason !== SHELL_WIRE_PREPARATION_CANCELLED && reason !== SHELL_WIRE_PREPARATION_FAILED) ||
        size > SHELL_WIRE_ERROR_MAX_BYTES ||
        this.buffer.length > size + SHELL_WIRE_PREPARATION_HEADER_BYTES
      ) {
        this.fail()
      }
      if (this.buffer.length === size + SHELL_WIRE_PREPARATION_HEADER_BYTES) {
        this.finishPreparation(reason)
        this.empty = true
        this.buffer = Buffer.alloc(0)
      }
    }
  }

  private finishPreparation(reason: number): void {
    const error = new TextDecoder(SHELL_WIRE_FATAL_UTF8, { fatal: true }).decode(
      this.buffer.subarray(SHELL_WIRE_PREPARATION_HEADER_BYTES),
    )
    if (reason === SHELL_WIRE_PREPARATION_CANCELLED) {
      if (error.length > 0) {
        this.fail()
      }
      this.state = { kind: SHELL_WIRE_PREPARATION_EMPTY, reason: SHELL_WIRE_AUTH_CANCELLED }
    } else {
      if (error.length === 0) {
        this.fail()
      }
      this.state = { kind: SHELL_WIRE_PREPARATION_EMPTY, reason: SHELL_WIRE_AUTH_FAILED, error }
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
    if (
      this.state.kind === SHELL_WIRE_WAITING &&
      this.buffer.length > 0 &&
      this.buffer[0] !== SHELL_WIRE_PREPARATION_EMPTY_BYTE
    ) {
      if (this.buffer[0] !== SHELL_WIRE_CREATED_BYTE) {
        this.fail()
      }
      this.buffer = this.buffer.subarray(1)
      this.state = { kind: SHELL_WIRE_CREATED }
    }
    this.consumeBufferedStatus()
  }

  private consumeBufferedStatus(): void {
    if (this.buffer.length > 0 && this.buffer[0] === SHELL_WIRE_PREPARATION_EMPTY_BYTE) {
      this.preparationFrame()
    } else if (this.buffer.length > 0) {
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
      if (bytes > SHELL_WIRE_ERROR_MAX_BYTES || this.buffer.length > bytes + SHELL_WIRE_ERROR_HEADER_BYTES + 1) {
        this.fail()
      }
      if (this.buffer.length >= bytes + SHELL_WIRE_ERROR_HEADER_BYTES) {
        const message = new TextDecoder(SHELL_WIRE_FATAL_UTF8, { fatal: true }).decode(
          this.buffer.subarray(SHELL_WIRE_ERROR_HEADER_BYTES, SHELL_WIRE_ERROR_HEADER_BYTES + bytes),
        )
        if (!message) {
          this.fail()
        }
        this.state = { kind: SHELL_WIRE_FAILED }
        this.executionError = true
        this.consumeEmptyTrailer(this.buffer.subarray(SHELL_WIRE_ERROR_HEADER_BYTES + bytes))
        this.buffer = Buffer.alloc(0)
        this.errorMessage = message
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
      this.consumeEmptyTrailer(trailing)
    }
  }

  private consumeEmptyTrailer(trailing: Buffer): void {
    if (trailing.length > 0) {
      if (trailing.length !== 1 || trailing[0] !== SHELL_WIRE_EMPTY_BYTE || this.empty) {
        this.fail()
      }
      this.empty = true
    }
  }

  release(): void {
    if (this.state.kind !== SHELL_WIRE_CREATED) {
      this.fail()
    }
    this.state = { kind: SHELL_WIRE_RELEASED }
  }

  eof(): void {
    if (
      this.buffer.length > 0 ||
      (this.state.kind !== SHELL_WIRE_COMPLETED &&
        this.state.kind !== SHELL_WIRE_PREPARATION_EMPTY &&
        !this.executionError)
    ) {
      this.fail()
    }
  }

  private fail(): never {
    this.state = { kind: SHELL_WIRE_FAILED }
    throw new Error(SHELL_WIRE_INVALID)
  }
}
