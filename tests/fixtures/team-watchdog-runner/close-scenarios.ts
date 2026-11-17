import { existsSync } from "node:fs"
import { expect } from "vitest"
import { type ShellCleanupOutcome } from "#synapse/integration/pi/agent-team"
import {
  WATCHDOG_FINISH_FAILURE,
  WATCHDOG_INJECTED_CLOSE_FAILURE,
  WATCHDOG_RESET_FAILURE,
  WATCHDOG_TRACKED_SHELL_MISSING,
  type WatchdogFixture,
  type WatchdogTrackedShell,
} from "../team-watchdog"
import { type WatchdogCloseVerification, type WatchdogScenario } from "./types"

export class UnconfirmedCloseScenario implements WatchdogCloseVerification {
  private readonly scenario: WatchdogScenario

  private readonly shell: WatchdogTrackedShell

  private readonly failure = new Error(WATCHDOG_INJECTED_CLOSE_FAILURE)

  constructor(scenario: WatchdogScenario) {
    this.scenario = scenario
    const shell = scenario.sessions.shells[0]
    if (!shell) {
      throw new Error(WATCHDOG_TRACKED_SHELL_MISSING)
    }
    this.shell = shell
    shell.injectedFailure = this.failure
  }

  verify(result: ShellCleanupOutcome): void {
    expect(result.failed).toBe(true)
    if (result.failed) {
      expect(result.error).toBeInstanceOf(AggregateError)
      if (result.error instanceof AggregateError) {
        expect(result.error.errors).toContain(this.failure)
      }
    }
    expect(this.shell.confirmed).toBe(false)
    expect(existsSync(this.scenario.directory)).toBe(true)
  }
}

export class ConfirmedCloseScenario implements WatchdogCloseVerification {
  private readonly scenario: WatchdogScenario

  private readonly finishFailure = new Error(WATCHDOG_FINISH_FAILURE)

  private readonly resetFailure = new Error(WATCHDOG_RESET_FAILURE)

  constructor(scenario: WatchdogScenario, fixture: WatchdogFixture) {
    this.scenario = scenario
    fixture.finishFailure = this.finishFailure
    fixture.resetFailure = this.resetFailure
  }

  verify(result: ShellCleanupOutcome): void {
    expect(result.failed).toBe(true)
    if (result.failed) {
      expect(result.error).toBeInstanceOf(AggregateError)
      if (result.error instanceof AggregateError) {
        expect(result.error.errors).toContain(this.finishFailure)
        expect(result.error.errors).toContain(this.resetFailure)
      }
    }
    expect(this.scenario.sessions.isShellCleanupConfirmed()).toBe(true)
    expect(existsSync(this.scenario.directory)).toBe(false)
  }
}
