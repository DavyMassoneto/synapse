import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import {
  SUPERVISED_TEST_WINDOWS_CLOSE_BYTE,
  SUPERVISED_TEST_WINDOWS_CLOSE_EVENT,
  SUPERVISED_TEST_WINDOWS_CREATED_BYTE,
  SUPERVISED_TEST_WINDOWS_ERROR_EVENT,
  SUPERVISED_TEST_WINDOWS_HEADER_BYTES,
  SUPERVISED_TEST_WINDOWS_LAUNCHER_URL,
  SUPERVISED_TEST_WINDOWS_MARKER,
  SUPERVISED_TEST_WINDOWS_RELEASE_BYTE,
  SUPERVISED_TEST_WINDOWS_STATUS_EVENT,
  SUPERVISED_TEST_WINDOWS_STDIO,
  WINDOWS_SHELL_FLAGS,
  WINDOWS_SHELL_POWERSHELL,
} from "./constants"
import { type WindowsChannelExitCode } from "./types"

export class WindowsRawChannel {
  readonly completion: Promise<number>
  output = ""
  error = ""
  private readonly statusChunks: Buffer[] = []
  get statusBytes(): Buffer {
    return Buffer.concat(this.statusChunks)
  }
  closeStarted?: number
  closeFinished?: number
  private readonly child: ChildProcessWithoutNullStreams
  private readonly result = Promise.withResolvers<number>()
  private closingHandle = false

  constructor(body: Buffer, closeHandle: boolean, declaredBytes?: number) {
    this.completion = this.result.promise
    this.closingHandle = closeHandle
    this.child = spawn(
      WINDOWS_SHELL_POWERSHELL,
      [...WINDOWS_SHELL_FLAGS, fileURLToPath(new URL(SUPERVISED_TEST_WINDOWS_LAUNCHER_URL, import.meta.url))],
      { stdio: [SUPERVISED_TEST_WINDOWS_STDIO, SUPERVISED_TEST_WINDOWS_STDIO, SUPERVISED_TEST_WINDOWS_STDIO] },
    )
    this.child.stdout.on(SUPERVISED_TEST_WINDOWS_STATUS_EVENT, this.status.bind(this))
    this.child.stderr.on(SUPERVISED_TEST_WINDOWS_STATUS_EVENT, this.receive.bind(this))
    this.child.on(SUPERVISED_TEST_WINDOWS_ERROR_EVENT, this.failed.bind(this))
    this.child.on(SUPERVISED_TEST_WINDOWS_CLOSE_EVENT, this.closed.bind(this))
    const header = Buffer.alloc(SUPERVISED_TEST_WINDOWS_HEADER_BYTES)
    if (typeof declaredBytes === "number") {
      header.writeUInt32BE(declaredBytes)
    } else {
      header.writeUInt32BE(body.length)
    }
    this.child.stdin.write(header)
    this.child.stdin.write(body)
    if (!closeHandle) {
      this.child.stdin.end()
    }
  }
  private failed(error: Error): void {
    this.result.reject(error)
  }
  private status(chunk: Buffer): void {
    this.statusChunks.push(chunk)
    if (chunk[0] === SUPERVISED_TEST_WINDOWS_CREATED_BYTE) {
      this.child.stdin.write(Buffer.from([SUPERVISED_TEST_WINDOWS_RELEASE_BYTE]))
    }
  }
  private receive(chunk: Buffer): void {
    this.error += chunk.toString()
    if (this.closingHandle && this.error.includes(SUPERVISED_TEST_WINDOWS_MARKER)) {
      this.closeStarted = performance.now()
      this.child.stdin.end(Buffer.from([SUPERVISED_TEST_WINDOWS_CLOSE_BYTE]))
      this.closingHandle = false
    }
  }
  private closed(code: WindowsChannelExitCode): void {
    this.closeFinished = performance.now()
    if (typeof code === "number") {
      this.result.resolve(code)
    } else {
      this.failed(new Error(this.error))
    }
  }
}
