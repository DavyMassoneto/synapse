import { type MemberTimerCancel } from "#synapse/modules/agent-team/public/contracts"
import { MEMBER_TURN_IDLE_TIMEOUT_MS, MEMBER_WATCHDOG_IDLE, MEMBER_WATCHDOG_RUNNING } from "./constants"
import {
  type MemberWatchdogRunning,
  type MemberWatchdogRuntime,
  type MemberWatchdogState,
  type MemberWatchdogTarget,
} from "./types"

export class MemberTurnWatchdog {
  private state: MemberWatchdogState = { kind: MEMBER_WATCHDOG_IDLE }
  private cancel?: MemberTimerCancel
  private generation = 0
  private revision = 0

  constructor(privateRuntime: MemberWatchdogRuntime, privateTarget: MemberWatchdogTarget) {
    this.runtime = privateRuntime
    this.target = privateTarget
  }

  private readonly runtime: MemberWatchdogRuntime
  private readonly target: MemberWatchdogTarget

  start(executionId: number): void {
    if (this.state.kind !== MEMBER_WATCHDOG_RUNNING || this.state.executionId !== executionId) {
      this.invalidate()
      this.arm(executionId)
    }
  }

  update(executionId: number): void {
    if (this.state.kind === MEMBER_WATCHDOG_RUNNING && this.state.executionId === executionId) {
      this.cancel?.()
      this.arm(executionId)
    }
  }

  invalidate(): void {
    this.cancel?.()
    this.generation++
    this.state = { kind: MEMBER_WATCHDOG_IDLE }
  }

  private arm(executionId: number): void {
    const state: MemberWatchdogRunning = {
      kind: MEMBER_WATCHDOG_RUNNING,
      executionId,
      generation: this.generation,
      revision: ++this.revision,
      updatedAt: this.runtime.monotonic(),
    }
    this.state = state
    this.cancel = this.runtime.schedule(this.check.bind(this, state), MEMBER_TURN_IDLE_TIMEOUT_MS)
  }

  private check(expected: MemberWatchdogRunning): void {
    const current = this.state
    if (
      current.kind === MEMBER_WATCHDOG_RUNNING &&
      current.executionId === expected.executionId &&
      current.generation === expected.generation &&
      current.revision === expected.revision
    ) {
      const remaining = MEMBER_TURN_IDLE_TIMEOUT_MS - (this.runtime.monotonic() - current.updatedAt)
      if (remaining > 0) {
        this.cancel = this.runtime.schedule(this.check.bind(this, expected), remaining)
      } else {
        this.invalidate()
        this.target.expired(expected.executionId)
      }
    }
  }
}
