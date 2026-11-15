import { execFileSync, spawn } from "node:child_process"
import { once } from "node:events"
import { join } from "node:path"
import { expect } from "vitest"
import { confirmUnixGroupEmpty } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SHELL_KEEPER_BARRIER_ERROR, SHELL_KEEPER_BARRIER_FILE } from "./constants"

export class KeeperBarrierScenario {
  private readonly child = spawn(
    process.execPath,
    ["--import", "jiti/register", join(__dirname, SHELL_KEEPER_BARRIER_FILE)],
    { detached: true, stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"] },
  )
  private readonly control = this.child.stdio[3]
  private readonly barrier = this.child.stdio[4]
  private readonly closed = once(this.child, "close")
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
    this.control.on("error", this.onPipeError.bind(this))
    this.barrier.on("error", this.onPipeError.bind(this))
    const blocked = await once(this.child.stdout, "data")
    expect(blocked[0]).toEqual(Buffer.from([5]))
  }
  killOldGroup(): void {
    if (!this.child.pid) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    this.oldKill = true
    process.kill(-this.child.pid, "SIGKILL")
  }
  assertBlockedAlive(): void {
    if (!this.child.pid) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    const status = execFileSync("/bin/ps", ["-p", String(this.child.pid), "-o", "stat=,command="], {
      encoding: "utf8",
    }).trim()
    expect(status).not.toMatch(/^Z|<defunct>/)
    expect(status).toMatch(/^S/)
    expect(status).toContain(SHELL_KEEPER_BARRIER_FILE.slice(2))
  }
  assertOldKillRejected(): void {
    let rejected = false
    for (let attempt = 0; attempt < 100 && !rejected; attempt++) {
      try {
        this.assertBlockedAlive()
      } catch {
        rejected = true
      }
    }
    expect(rejected).toBe(true)
    expect(this.child.signalCode).toBeNull()
  }
  private onPipeError(error: Error): void {
    if (!(this.oldKill && "code" in error && error.code === "EPIPE")) {
      this.pipeFailure = error
    }
  }
  async close(): Promise<void> {
    if (this.barrier && "end" in this.barrier) {
      this.barrier.end(Buffer.from([1]))
    }
    await this.closed
    expect(this.child.signalCode).toBe("SIGKILL")
    if (this.pipeFailure) {
      throw this.pipeFailure
    }
    if (this.child.pid) {
      await confirmUnixGroupEmpty(this.child.pid)
    }
  }
}
