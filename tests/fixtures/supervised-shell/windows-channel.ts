import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { SUPERVISED_TEST_WINDOWS_LAUNCHER_URL, WINDOWS_SHELL_FLAGS, WINDOWS_SHELL_POWERSHELL } from "./constants"
import { type WindowsChannelExitCode, type WindowsChannelReject, type WindowsChannelResolve } from "./types"

export class WindowsRawChannel {
  readonly completion: Promise<number>
  output = ""
  error = ""
  statusBytes = Buffer.alloc(0)
  private readonly child: ChildProcessWithoutNullStreams
  private resolve?: WindowsChannelResolve
  private reject?: WindowsChannelReject
  private closingHandle = false

  constructor(body: Buffer, closeHandle: boolean, declaredBytes?: number) {
    this.completion = new Promise<number>(this.capture.bind(this))
    this.closingHandle = closeHandle
    this.child = spawn(
      WINDOWS_SHELL_POWERSHELL,
      [...WINDOWS_SHELL_FLAGS, fileURLToPath(new URL(SUPERVISED_TEST_WINDOWS_LAUNCHER_URL, import.meta.url))],
      { stdio: ["pipe", "pipe", "pipe"] },
    )
    this.child.stdout.on("data", this.status.bind(this))
    this.child.stderr.on("data", this.receive.bind(this))
    this.child.on("error", this.failed.bind(this))
    this.child.on("close", this.closed.bind(this))
    const header = Buffer.alloc(4)
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
  private capture(resolve: WindowsChannelResolve, reject: WindowsChannelReject): void {
    this.resolve = resolve
    this.reject = reject
  }
  private failed(error: Error): void {
    this.reject?.(error)
  }
  private status(chunk: Buffer): void {
    this.statusBytes = Buffer.concat([this.statusBytes, chunk])
    if (chunk[0] === 1) {
      this.child.stdin.write(Buffer.from([1]))
    }
  }
  private receive(chunk: Buffer): void {
    this.error += chunk.toString()
    if (this.closingHandle && this.error.includes("WINDOWS_READY")) {
      this.child.stdin.end(Buffer.from([3]))
      this.closingHandle = false
    }
  }
  private closed(code: WindowsChannelExitCode): void {
    if (typeof code === "number") {
      this.resolve?.(code)
    } else {
      this.failed(new Error(this.error))
    }
  }
}
