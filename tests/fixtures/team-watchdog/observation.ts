import { type TeamLeadHost } from "../agent-team"
import { type WatchdogClock } from "./clock"
import { WATCHDOG_TOOL_RESULT_ROLE, WATCHDOG_UNCONFIRMED_NOTICE } from "./constants"
import { type WatchdogAgentSessions } from "./types"

export class WatchdogObservation {
  private readonly clock: WatchdogClock
  private readonly host: TeamLeadHost
  private readonly sessions: WatchdogAgentSessions
  private baseline = 0
  private index = 0

  constructor(clock: WatchdogClock, host: TeamLeadHost, sessions: WatchdogAgentSessions) {
    this.clock = clock
    this.host = host
    this.sessions = sessions
  }

  markTimers(): void {
    this.baseline = this.clock.timers.length
  }

  selectSession(index: number): void {
    this.index = index
  }

  hasNewTimer(): boolean {
    return this.clock.timers.length > this.baseline
  }

  isStreaming(): boolean {
    return this.sessions[this.index]?.isStreaming === true
  }

  isSettled(): boolean {
    return this.sessions[this.index]?.isStreaming === false
  }

  hasUnconfirmedNotice(): boolean {
    return JSON.stringify(this.host.notices).includes(WATCHDOG_UNCONFIRMED_NOTICE)
  }

  hasToolResult(): boolean {
    const session = this.sessions[this.index]
    if (session) {
      for (const message of session.messages) {
        if (message.role === WATCHDOG_TOOL_RESULT_ROLE) {
          return true
        }
      }
    }
    return false
  }
}
