import { execFileSync, spawn } from "node:child_process"
import { once } from "node:events"
import { join } from "node:path"
import { expect } from "vitest"
import { confirmUnixGroupEmpty } from "./confirm-group"
import { SHELL_KEEPER_BARRIER_ERROR, SHELL_KEEPER_BARRIER_FD, SHELL_KEEPER_BARRIER_FILE } from "./constants"
import { verifyBarrierStatus } from "./keeper-barrier-status"
import {
  SHELL_TEST_EVENT_CLOSE,
  SHELL_TEST_EVENT_DATA,
  SHELL_TEST_EVENT_ERROR,
  SHELL_TEST_NODE_IMPORT,
  SHELL_TEST_NODE_REGISTER,
  SHELL_TEST_PIPE_ERROR,
  SHELL_TEST_SIGNAL_KILL,
} from "./native-fixture-constants"
import {
  SHELL_BARRIER_CONTROL_FD,
  SHELL_BARRIER_MAX_ATTEMPTS,
  SHELL_BARRIER_PS_ARGUMENT,
  SHELL_BARRIER_PS_ENCODING,
  SHELL_BARRIER_PS_FORMAT,
  SHELL_BARRIER_PS_OUTPUT_ARGUMENT,
  SHELL_BARRIER_PS_PATH,
  SHELL_BARRIER_READY_BYTE,
  SHELL_BARRIER_RELEASE_BYTE,
  SHELL_BARRIER_STDIO,
  SHELL_TEST_PIPE_RESET,
} from "./native-scenario-constants"

export class KeeperBarrierScenario {
  private readonly child = spawn(
    process.execPath,
    [SHELL_TEST_NODE_IMPORT, SHELL_TEST_NODE_REGISTER, join(__dirname, SHELL_KEEPER_BARRIER_FILE)],
    { detached: true, stdio: SHELL_BARRIER_STDIO },
  )
  private readonly control = this.child.stdio[SHELL_BARRIER_CONTROL_FD]
  private readonly barrier = this.child.stdio[SHELL_KEEPER_BARRIER_FD]
  private readonly closed = once(this.child, SHELL_TEST_EVENT_CLOSE)
  private pipeFailure?: Error
  private oldKill = false
  async prepare(): Promise<void> {
    if (
      !this.child.stdout ||
      !this.control ||
      !("write" in this.control) ||
      !this.barrier ||
      !("write" in this.barrier)
    ) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    this.control.on(SHELL_TEST_EVENT_ERROR, this.onPipeError.bind(this))
    this.barrier.on(SHELL_TEST_EVENT_ERROR, this.onPipeError.bind(this))
    const blocked = await once(this.child.stdout, SHELL_TEST_EVENT_DATA)
    expect(blocked[0]).toEqual(Buffer.from([SHELL_BARRIER_READY_BYTE]))
  }
  killOldGroup(): void {
    if (!this.child.pid) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    this.oldKill = true
    process.kill(-this.child.pid, SHELL_TEST_SIGNAL_KILL)
  }
  assertBlockedAlive(): void {
    if (!this.barrier || !("writableEnded" in this.barrier) || this.barrier.writableEnded) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    verifyBarrierStatus(this.readStatus())
  }
  private readStatus(): string {
    if (!this.child.pid) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    return execFileSync(
      SHELL_BARRIER_PS_PATH,
      [SHELL_BARRIER_PS_ARGUMENT, String(this.child.pid), SHELL_BARRIER_PS_OUTPUT_ARGUMENT, SHELL_BARRIER_PS_FORMAT],
      {
        encoding: SHELL_BARRIER_PS_ENCODING,
      },
    ).trim()
  }
  assertOldKillRejected(): void {
    let rejected = false
    for (let attempt = 0; attempt < SHELL_BARRIER_MAX_ATTEMPTS && !rejected; attempt++) {
      try {
        verifyBarrierStatus(this.readStatus())
      } catch {
        rejected = true
      }
    }
    expect(rejected).toBe(true)
    expect(this.child.signalCode).toBeNull()
  }
  private onPipeError(error: Error): void {
    if (
      !(
        this.oldKill &&
        "code" in error &&
        (error.code === SHELL_TEST_PIPE_ERROR || error.code === SHELL_TEST_PIPE_RESET)
      )
    ) {
      this.pipeFailure = error
    }
  }
  async close(): Promise<void> {
    if (this.barrier && "end" in this.barrier) {
      this.barrier.end(Buffer.from([SHELL_BARRIER_RELEASE_BYTE]))
    }
    await this.closed
    expect(this.child.signalCode).toBe(SHELL_TEST_SIGNAL_KILL)
    if (this.pipeFailure) {
      throw this.pipeFailure
    }
    if (this.child.pid) {
      await confirmUnixGroupEmpty(this.child.pid)
    }
  }
}
