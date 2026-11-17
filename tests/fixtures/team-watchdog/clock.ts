import { type MemberTurnRuntime } from "#synapse/modules/agent-team"
import { type WatchdogTimer, type WatchdogTimers } from "./types"

export class WatchdogClock implements MemberTurnRuntime {
  private now = 0

  readonly timers: WatchdogTimers = []

  monotonic(): number {
    return this.now
  }

  schedule(callback: WatchdogTimer["callback"], delayMs: number): WatchdogTimer["callback"] {
    const timer: WatchdogTimer = { at: this.now + delayMs, callback, cancelled: false }
    this.timers.push(timer)
    return this.cancel.bind(this, timer)
  }

  private cancel(timer: WatchdogTimer): void {
    timer.cancelled = true
  }

  elapse(milliseconds: number): void {
    this.now += milliseconds
  }

  advance(milliseconds: number): void {
    this.elapse(milliseconds)
    for (const timer of this.timers) {
      if (!timer.cancelled && timer.at <= this.now) {
        timer.cancelled = true
        timer.callback()
      }
    }
  }
}
