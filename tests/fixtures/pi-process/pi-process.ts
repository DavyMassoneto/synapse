import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { once } from "node:events"
import { setTimeout as delay } from "node:timers/promises"
import { type PiProcessModelSelection } from "../model-selection"
import {
  PI_PROCESS_ALREADY_STARTED,
  PI_PROCESS_CLOSE_EVENT,
  PI_PROCESS_COMMAND_TIMEOUT_MS,
  PI_PROCESS_DATA_EVENT,
  PI_PROCESS_DEFAULT_SELECTION,
  PI_PROCESS_DIAGNOSTIC_FAILURE,
  PI_PROCESS_DRAIN_EVENT,
  PI_PROCESS_ENCODING,
  PI_PROCESS_ERROR_EVENT,
  PI_PROCESS_EXIT_FAILURE,
  PI_PROCESS_KILL_SIGNAL,
  PI_PROCESS_NEWLINE,
  PI_PROCESS_NOT_STARTED,
  PI_PROCESS_QUERY_ERRORS,
  PI_PROCESS_RESPONSE_TYPE,
  PI_PROCESS_SHUTDOWN_TIMEOUT,
  PI_PROCESS_SHUTDOWN_TIMEOUT_MS,
  PI_PROCESS_STDIO,
} from "./constants"
import { PiProcessDiagnostics } from "./diagnostics"
import { PiProcessHome } from "./pi-process-home"
import { PiProcessRecords } from "./pi-process-records"
import { piProcessArguments, piProcessEnvironment, piProcessSessionArguments } from "./process-start"
import {
  type PiProcessAvailableModels,
  type PiProcessClosePromise,
  type PiProcessCloseResolver,
  type PiProcessCommand,
  type PiProcessCommands,
  type PiProcessExitCode,
  type PiProcessLastAssistantText,
  type PiProcessQuery,
  type PiProcessQueryResponse,
  type PiProcessRecord,
  type PiProcessScenarioHome,
  type PiProcessSession,
} from "./types"

export class PiProcess {
  homeDirectory: PiProcessScenarioHome = new PiProcessHome()

  private session?: PiProcessSession

  readonly received = new PiProcessRecords()

  private running = false

  private child?: ChildProcessWithoutNullStreams

  private readonly diagnostics = new PiProcessDiagnostics()

  private resolveClose?: PiProcessCloseResolver

  private readonly closePromise = new Promise<void>(this.observeClose.bind(this))

  private selection: PiProcessModelSelection = PI_PROCESS_DEFAULT_SELECTION

  private sequence = 0

  get stderr(): string {
    return this.diagnostics.text
  }

  configureSelection(selection: PiProcessModelSelection): void {
    this.selection = selection
  }

  configureSession(session: PiProcessSession): void {
    this.session = session
  }

  replaceHome(home: PiProcessScenarioHome): void {
    this.homeDirectory.remove()
    this.homeDirectory = home
  }

  start(entrypoint: string): void {
    if (this.child) {
      throw new Error(PI_PROCESS_ALREADY_STARTED)
    }
    this.running = true
    let args: string[]
    if (this.session) {
      args = piProcessSessionArguments(entrypoint, this.selection, this.session)
    } else {
      args = piProcessArguments(entrypoint, this.selection)
    }
    this.child = spawn(process.execPath, args, {
      cwd: this.homeDirectory.home,
      env: piProcessEnvironment(this.homeDirectory.home, this.homeDirectory.agentDirectory, this.selection),
      stdio: PI_PROCESS_STDIO,
    })
    this.child.stdout.setEncoding(PI_PROCESS_ENCODING)
    this.child.stderr.setEncoding(PI_PROCESS_ENCODING)
    this.child.stdout.on(PI_PROCESS_DATA_EVENT, this.received.receive.bind(this.received))
    this.child.stderr.on(PI_PROCESS_DATA_EVENT, this.diagnostic.bind(this))
    this.child.on(PI_PROCESS_ERROR_EVENT, this.received.fail.bind(this.received))
    this.child.on(PI_PROCESS_CLOSE_EVENT, this.closed.bind(this))
  }

  async command(command: PiProcessCommand): Promise<PiProcessRecord> {
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

  query(command: "get_available_models"): Promise<PiProcessAvailableModels>
  query(command: "get_commands"): Promise<PiProcessCommands>
  query(command: "get_last_assistant_text"): Promise<PiProcessLastAssistantText>
  async query(command: PiProcessQuery): Promise<PiProcessQueryResponse> {
    const record = await this.command({ type: command })
    if (record.type === PI_PROCESS_RESPONSE_TYPE && record.command === command && record.success) {
      return record
    }
    throw new Error(PI_PROCESS_QUERY_ERRORS[command])
  }

  async dispose(): Promise<void> {
    try {
      await this.close()
    } finally {
      this.homeDirectory.remove()
    }
  }

  async close(): Promise<void> {
    const child = this.child
    if (child && this.running) {
      const closed = this.closePromise
      child.stdin.end()
      try {
        await this.waitForClose(closed)
      } catch {
        child.kill(PI_PROCESS_KILL_SIGNAL)
        await this.waitForClose(closed)
      }
    }
  }

  private async waitForClose(closed: PiProcessClosePromise): Promise<void> {
    const timer = new AbortController()
    try {
      await Promise.race([
        closed,
        delay(PI_PROCESS_SHUTDOWN_TIMEOUT_MS, false, { signal: timer.signal }).then(this.shutdownTimeout),
      ])
    } finally {
      timer.abort()
    }
  }

  private observeClose(resolve: PiProcessCloseResolver): void {
    this.resolveClose = resolve
  }

  private shutdownTimeout(): never {
    throw new Error(PI_PROCESS_SHUTDOWN_TIMEOUT)
  }

  private requireChild(): ChildProcessWithoutNullStreams {
    if (this.child) {
      return this.child
    }
    throw new Error(PI_PROCESS_NOT_STARTED)
  }

  private diagnostic(chunk: string): void {
    const result = this.diagnostics.receive(chunk)
    if (result.kind === PI_PROCESS_DIAGNOSTIC_FAILURE) {
      this.received.fail(result.error)
    }
  }

  private closed(code: PiProcessExitCode): void {
    this.running = false
    this.resolveClose?.()
    this.received.fail(new Error(`${PI_PROCESS_EXIT_FAILURE}${code}${PI_PROCESS_NEWLINE}${this.diagnostics.text}`))
  }
}
