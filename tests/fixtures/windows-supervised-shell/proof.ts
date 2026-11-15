import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import {
  WINDOWS_PROOF_FLAGS,
  WINDOWS_PROOF_LAUNCHER,
  WINDOWS_PROOF_POWERSHELL,
  WINDOWS_PROOF_READY,
  WINDOWS_PROOF_RELEASE,
  WINDOWS_PROOF_RELEASED,
  WINDOWS_PROOF_TERMINATE,
} from "./constants"
import {
  type WindowsProofExitCode,
  type WindowsProofReject,
  type WindowsProofResolve,
  type WindowsProofResult,
  type WindowsProofSpec,
} from "./types"

export class WindowsJobProof {
  readonly completion: Promise<WindowsProofResult>
  private readonly child: ChildProcessWithoutNullStreams
  private output = ""
  private error = ""
  private released = false
  private resolve?: WindowsProofResolve
  private reject?: WindowsProofReject

  constructor(spec: WindowsProofSpec) {
    this.completion = new Promise<WindowsProofResult>(this.capture.bind(this))
    this.child = spawn(
      WINDOWS_PROOF_POWERSHELL,
      [...WINDOWS_PROOF_FLAGS, fileURLToPath(new URL(WINDOWS_PROOF_LAUNCHER, import.meta.url))],
      { stdio: ["pipe", "pipe", "pipe"] },
    )
    this.child.stdout.on("data", this.onOutput.bind(this))
    this.child.stderr.on("data", this.onErrorOutput.bind(this))
    this.child.on("error", this.onError.bind(this))
    this.child.on("close", this.closed.bind(this))
    this.child.stdin.write(`${JSON.stringify(spec)}\n`)
  }
  private capture(resolve: WindowsProofResolve, reject: WindowsProofReject): void {
    this.resolve = resolve
    this.reject = reject
  }
  private onError(error: Error): void {
    this.reject?.(error)
  }
  private onErrorOutput(chunk: Buffer): void {
    this.error += chunk.toString()
  }
  private onOutput(chunk: Buffer): void {
    this.output += chunk.toString()
    if (this.output.includes(WINDOWS_PROOF_READY) && !this.released) {
      this.released = true
      this.child.stdin.write(WINDOWS_PROOF_RELEASE)
    }
    if (this.output.includes(WINDOWS_PROOF_RELEASED)) {
      this.child.stdin.write(WINDOWS_PROOF_TERMINATE)
    }
  }
  private closed(code: WindowsProofExitCode): void {
    if (typeof code === "number") {
      this.resolve?.({ code, output: this.output, error: this.error })
    } else {
      this.reject?.(new Error(this.error))
    }
  }
}
