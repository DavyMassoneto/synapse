import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { once } from "node:events"
import { type PiProcessModelSelection } from "../model-selection"
import { PI_PROCESS_DEFAULT_SELECTION } from "../scripted-provider"
import {
  PI_PROCESS_ALREADY_STARTED,
  PI_PROCESS_CLOSE_EVENT,
  PI_PROCESS_COMMAND_TIMEOUT_MS,
  PI_PROCESS_DATA_EVENT,
  PI_PROCESS_DRAIN_EVENT,
  PI_PROCESS_ENCODING,
  PI_PROCESS_ERROR_EVENT,
  PI_PROCESS_EXIT_FAILURE,
  PI_PROCESS_KILL_SIGNAL,
  PI_PROCESS_NEWLINE,
  PI_PROCESS_NOT_STARTED,
  PI_PROCESS_RESPONSE_TYPE,
  PI_PROCESS_STDIO,
} from "./constants"
import { PiProcessDiagnostics } from "./diagnostics"
import { PiProcessHome } from "./pi-process-home"
import { PiProcessRecords } from "./pi-process-records"
import { piProcessSelectedArguments, piProcessSelectedEnvironment } from "./process-start"
import { type PiProcessCommand, type PiProcessExitCode, type PiProcessResponse } from "./types"
import { waitForPiProcessClose } from "./wait-for-close"

export class PiProcess {
  readonly homeDirectory = new PiProcessHome()

  readonly received = new PiProcessRecords()

  private selection: PiProcessModelSelection = PI_PROCESS_DEFAULT_SELECTION

  private running = false

  private child?: ChildProcessWithoutNullStreams

  private readonly diagnostics = new PiProcessDiagnostics()

  private sequence = 0

  get stderr(): string {
    return this.diagnostics.text
  }

  configureSelection(selection: PiProcessModelSelection): void {
    this.selection = selection
  }

  start(entrypoint: string): void {
    if (this.child) {
      throw new Error(PI_PROCESS_ALREADY_STARTED)
    }
    const selection = this.selection
    this.running = true
    this.child = spawn(process.execPath, piProcessSelectedArguments(entrypoint, selection), {
      cwd: this.homeDirectory.home,
      env: piProcessSelectedEnvironment(this.homeDirectory.home, this.homeDirectory.agentDirectory, selection),
      stdio: PI_PROCESS_STDIO,
    })
    this.child.stdout.setEncoding(PI_PROCESS_ENCODING)
    this.child.stderr.setEncoding(PI_PROCESS_ENCODING)
    this.child.stdout.on(PI_PROCESS_DATA_EVENT, this.received.receive.bind(this.received))
    this.child.stderr.on(PI_PROCESS_DATA_EVENT, this.diagnostic.bind(this))
    this.child.on(PI_PROCESS_ERROR_EVENT, this.received.fail.bind(this.received))
    this.child.on(PI_PROCESS_CLOSE_EVENT, this.closed.bind(this))
  }

  async command(command: PiProcessCommand): Promise<PiProcessResponse> {
    const child = this.requireChild()
    this.sequence += 1
    const id = String(this.sequence)
    const response = this.received.waitFor({ type: PI_PROCESS_RESPONSE_TYPE, id }, PI_PROCESS_COMMAND_TIMEOUT_MS)
    const written = child.stdin.write(`${JSON.stringify({ ...command, id })}${PI_PROCESS_NEWLINE}`)
    if (!written) {
      await once(child.stdin, PI_PROCESS_DRAIN_EVENT, { signal: AbortSignal.timeout(PI_PROCESS_COMMAND_TIMEOUT_MS) })
    }
    return response
  }

  async dispose(): Promise<void> {
    const child = this.child
    if (child && this.running) {
      const closed = waitForPiProcessClose(child)
      child.stdin.end()
      try {
        await closed
      } catch {
        const killed = waitForPiProcessClose(child)
        child.kill(PI_PROCESS_KILL_SIGNAL)
        await killed
      }
    }
    this.homeDirectory.remove()
  }

  private requireChild(): ChildProcessWithoutNullStreams {
    if (this.child) {
      return this.child
    }
    throw new Error(PI_PROCESS_NOT_STARTED)
  }

  private diagnostic(chunk: string): void {
    const result = this.diagnostics.receive(chunk)
    if (result.kind === "failure") {
      this.received.fail(result.error)
    }
  }

  private closed(code: PiProcessExitCode): void {
    this.running = false
    this.received.fail(new Error(`${PI_PROCESS_EXIT_FAILURE}${code}${PI_PROCESS_NEWLINE}${this.diagnostics.text}`))
  }
}
