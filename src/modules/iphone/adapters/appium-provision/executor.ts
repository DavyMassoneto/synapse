import { type ChildProcess, spawn } from "node:child_process"
import { IPHONE_APPIUM_WINDOWS_SHELL } from "#synapse/modules/iphone/adapters/appium-process"
import {
  IPHONE_PROVISION_ABORT_EVENT,
  IPHONE_PROVISION_CANCELLED,
  IPHONE_PROVISION_CLOSE_EVENT,
  IPHONE_PROVISION_COMMAND_TIMEOUT_MS,
  IPHONE_PROVISION_DATA_EVENT,
  IPHONE_PROVISION_ERROR_EVENT,
  IPHONE_PROVISION_FORCE_ARGUMENT,
  IPHONE_PROVISION_FORCE_SIGNAL,
  IPHONE_PROVISION_OUTPUT_BYTES,
  IPHONE_PROVISION_OUTPUT_EXCEEDED,
  IPHONE_PROVISION_PID_ARGUMENT,
  IPHONE_PROVISION_SCRIPT_FAILURE,
  IPHONE_PROVISION_TASKKILL,
  IPHONE_PROVISION_TERMINATION_GRACE_MS,
  IPHONE_PROVISION_TIMED_OUT,
  IPHONE_PROVISION_TREE_ARGUMENT,
  IPHONE_PROVISION_UTF8,
  IPHONE_PROVISION_WINDOWS,
} from "./constants"
import { IphoneProvisionInterrupted } from "./failure"
import {
  type IphoneAppiumProvisionCommand,
  type IphoneAppiumProvisionOutput,
  type IphoneProvisionReject,
  type IphoneProvisionResolve,
  type IphoneProvisionTimer,
} from "./types"

export class IphoneProvisionCommandRunner {
  private readonly command: IphoneAppiumProvisionCommand
  private child?: ChildProcess
  private terminator?: ChildProcess
  private readonly receiveStdout = this.readStdout.bind(this)
  private readonly receiveStderr = this.readStderr.bind(this)
  private readonly receiveFailure = this.recordFailure.bind(this)
  private readonly receiveClose = this.finish.bind(this)
  private resolve?: IphoneProvisionResolve
  private reject?: IphoneProvisionReject
  private timer?: IphoneProvisionTimer
  private terminationTimer?: IphoneProvisionTimer
  private readonly abort = this.interrupt.bind(this, IPHONE_PROVISION_CANCELLED)
  private stdout = ""
  private stderr = ""
  private bytes = 0
  private failure?: Error
  private settled = false
  private interrupted = false

  constructor(command: IphoneAppiumProvisionCommand) {
    this.command = command
  }

  run(): Promise<IphoneAppiumProvisionOutput> {
    this.command.signal.throwIfAborted()
    return new Promise<IphoneAppiumProvisionOutput>(this.launch.bind(this))
  }

  private launch(resolve: IphoneProvisionResolve, reject: IphoneProvisionReject): void {
    this.resolve = resolve
    this.reject = reject
    try {
      const child = spawn(this.command.executable, this.command.arguments, {
        cwd: this.command.directory,
        env: this.command.environment,
        windowsHide: true,
        windowsVerbatimArguments: this.command.executable === IPHONE_APPIUM_WINDOWS_SHELL,
        detached: process.platform !== IPHONE_PROVISION_WINDOWS,
        stdio: ["ignore", "pipe", "pipe"],
      })
      this.child = child
      this.observe(child)
    } catch (error) {
      this.failure = error instanceof Error ? error : new Error(IPHONE_PROVISION_SCRIPT_FAILURE)
      this.finish()
    }
  }

  private observe(child: ChildProcess): void {
    child.stdout?.setEncoding(IPHONE_PROVISION_UTF8)
    child.stderr?.setEncoding(IPHONE_PROVISION_UTF8)
    child.stdout?.on(IPHONE_PROVISION_DATA_EVENT, this.receiveStdout)
    child.stderr?.on(IPHONE_PROVISION_DATA_EVENT, this.receiveStderr)
    child.once(IPHONE_PROVISION_ERROR_EVENT, this.receiveFailure)
    child.once(IPHONE_PROVISION_CLOSE_EVENT, this.receiveClose)
    this.timer = setTimeout(this.interrupt.bind(this, IPHONE_PROVISION_TIMED_OUT), IPHONE_PROVISION_COMMAND_TIMEOUT_MS)
    this.command.signal.addEventListener(IPHONE_PROVISION_ABORT_EVENT, this.abort, { once: true })
    if (this.command.signal.aborted) {
      this.abort()
    }
  }

  private readStdout(chunk: string): void {
    if (this.acceptChunk(chunk)) {
      this.stdout += chunk
    }
  }

  private readStderr(chunk: string): void {
    if (this.acceptChunk(chunk)) {
      this.stderr += chunk
    }
  }

  private acceptChunk(chunk: string): boolean {
    if (this.interrupted || this.settled) {
      return false
    }
    this.bytes += Buffer.byteLength(chunk)
    if (this.bytes > IPHONE_PROVISION_OUTPUT_BYTES) {
      this.interrupt(IPHONE_PROVISION_OUTPUT_EXCEEDED)
      return false
    }
    return true
  }

  private recordFailure(error: Error): void {
    if (!this.interrupted && !this.settled) {
      this.failure = error
    }
  }

  private interrupt(reason: string): void {
    if (!this.interrupted && !this.settled) {
      this.interrupted = true
      this.failure = new IphoneProvisionInterrupted(reason, this.command.directory)
      this.terminationTimer = setTimeout(this.finish.bind(this), IPHONE_PROVISION_TERMINATION_GRACE_MS)
      this.terminate()
    }
  }

  private terminate(): void {
    const pid = this.child?.pid
    if (pid) {
      try {
        if (process.platform === IPHONE_PROVISION_WINDOWS) {
          this.terminateWindows(pid)
        } else {
          process.kill(-pid, IPHONE_PROVISION_FORCE_SIGNAL)
        }
      } catch (error) {
        if (error instanceof Error) {
          this.finish()
        } else {
          throw error
        }
      }
    }
  }

  private terminateWindows(pid: number): void {
    const terminator = spawn(
      IPHONE_PROVISION_TASKKILL,
      [IPHONE_PROVISION_PID_ARGUMENT, String(pid), IPHONE_PROVISION_TREE_ARGUMENT, IPHONE_PROVISION_FORCE_ARGUMENT],
      { windowsHide: true, stdio: "ignore" },
    )
    this.terminator = terminator
    terminator.once(IPHONE_PROVISION_ERROR_EVENT, this.receiveClose)
    terminator.once(IPHONE_PROVISION_CLOSE_EVENT, this.receiveClose)
  }

  private releaseLocalResources(): void {
    const child = this.child
    if (child) {
      child.stdout?.removeListener(IPHONE_PROVISION_DATA_EVENT, this.receiveStdout)
      child.stderr?.removeListener(IPHONE_PROVISION_DATA_EVENT, this.receiveStderr)
      child.removeListener(IPHONE_PROVISION_ERROR_EVENT, this.receiveFailure)
      child.removeListener(IPHONE_PROVISION_CLOSE_EVENT, this.receiveClose)
      child.on(IPHONE_PROVISION_ERROR_EVENT, child.unref.bind(child))
      child.stdout?.destroy()
      child.stderr?.destroy()
      child.unref()
    }
    const terminator = this.terminator
    if (terminator) {
      terminator.removeListener(IPHONE_PROVISION_ERROR_EVENT, this.receiveClose)
      terminator.removeListener(IPHONE_PROVISION_CLOSE_EVENT, this.receiveClose)
      terminator.on(IPHONE_PROVISION_ERROR_EVENT, terminator.unref.bind(terminator))
      terminator.unref()
    }
  }

  private finish(): void {
    if (!this.settled) {
      this.settled = true
      clearTimeout(this.timer)
      clearTimeout(this.terminationTimer)
      this.command.signal.removeEventListener(IPHONE_PROVISION_ABORT_EVENT, this.abort)
      if (this.interrupted) {
        this.releaseLocalResources()
      }
      if (this.failure) {
        this.reject?.(this.failure)
      } else if (this.child?.exitCode === 0) {
        this.resolve?.({ stdout: this.stdout, stderr: this.stderr })
      } else {
        this.reject?.(new Error(`${IPHONE_PROVISION_SCRIPT_FAILURE}\n${this.stdout}\n${this.stderr}`))
      }
    }
  }
}
