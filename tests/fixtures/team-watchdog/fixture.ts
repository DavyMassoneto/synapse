import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { captureShellCleanup } from "#synapse/integration/pi/agent-team"
import {
  WATCHDOG_DIRECTORY,
  WATCHDOG_FIXTURE_CLOSE_FAILURE,
  WATCHDOG_MEMBER,
  WATCHDOG_MEMBER_STARTED,
  WATCHDOG_PRIVATE_DESCRIPTION,
  WATCHDOG_PROMPT,
  WATCHDOG_SHELL_CLEANUP_UNCONFIRMED,
} from "./constants"
import { createWatchdogScenario } from "./scenario"
import { type WatchdogFixtureOptions } from "./types"

export class WatchdogFixture {
  private scenario?: ReturnType<typeof createWatchdogScenario>

  private directory = ""

  finishFailure?: Error

  resetFailure?: Error

  async start(options: WatchdogFixtureOptions): Promise<ReturnType<typeof createWatchdogScenario>> {
    this.directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
    const scenario = createWatchdogScenario(this.directory)
    this.scenario = scenario
    scenario.sessions.model.shell = options.shell
    scenario.sessions.failStop = options.failStop
    scenario.team.createTask({
      subject: WATCHDOG_PRIVATE_DESCRIPTION,
      description: WATCHDOG_PROMPT,
      blockedBy: [],
      writeScopes: [],
    })
    const started = await scenario.team.start({
      name: WATCHDOG_MEMBER,
      description: WATCHDOG_PRIVATE_DESCRIPTION,
      taskId: "task-1",
      expectedRevision: 1,
    })
    if (started.kind !== WATCHDOG_MEMBER_STARTED) {
      throw new Error(started.message)
    }
    return scenario
  }

  isRealShellCloseConfirmed(): boolean {
    if (this.scenario) {
      for (const shell of this.scenario.sessions.shells) {
        if (!shell.realClosed) {
          return false
        }
      }
    }
    return true
  }

  private resetStopFailure(): void {
    if (this.scenario) {
      this.scenario.sessions.failStop = false
      if (this.scenario.sessions.unconfirmedShell) {
        this.scenario.sessions.unconfirmedShell.fail = false
      }
      if (this.resetFailure) {
        throw this.resetFailure
      }
    }
  }

  private finishModel(): void {
    if (this.scenario) {
      this.scenario.sessions.model.finish()
      if (this.finishFailure) {
        throw this.finishFailure
      }
    }
  }

  private async finishScenario(failures: Error[]): Promise<void> {
    if (this.scenario) {
      const finished = await captureShellCleanup(this.finishModel.bind(this))
      if (finished.failed) {
        failures.push(finished.error)
      }
      const reset = await captureShellCleanup(this.resetStopFailure.bind(this))
      if (reset.failed) {
        failures.push(reset.error)
      }
      const suspended = await captureShellCleanup(this.scenario.team.suspend.bind(this.scenario.team))
      if (suspended.failed) {
        failures.push(suspended.error)
      }
      for (const shell of this.scenario.sessions.shells) {
        if (shell.failure) {
          failures.push(shell.failure)
        }
      }
    }
  }

  async close(): Promise<void> {
    const failures: Error[] = []
    await this.finishScenario(failures)
    if (!this.scenario || this.scenario.sessions.isShellCleanupConfirmed()) {
      if (this.directory) {
        const removed = await captureShellCleanup(rm.bind(undefined, this.directory, { recursive: true, force: true }))
        if (removed.failed) {
          failures.push(removed.error)
        }
      }
    } else {
      failures.push(new Error(WATCHDOG_SHELL_CLEANUP_UNCONFIRMED))
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, WATCHDOG_FIXTURE_CLOSE_FAILURE)
    }
  }
}
