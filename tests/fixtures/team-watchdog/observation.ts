import { type AgentSessionEvent } from "@earendil-works/pi-coding-agent"
import { type TeamLeadHost } from "../agent-team"
import { type WatchdogClock } from "./clock"
import {
  WATCHDOG_EVENT_TEXT_DELTA,
  WATCHDOG_EVENT_THINKING_DELTA,
  WATCHDOG_EVENT_TOOL_DELTA,
  WATCHDOG_SESSION_MESSAGE_UPDATE,
  WATCHDOG_SESSION_MISSING,
  WATCHDOG_TOOL_RESULT_ROLE,
  WATCHDOG_UNCONFIRMED_NOTICE,
} from "./constants"
import { type WatchdogAgentSessions } from "./types"

export class WatchdogObservation {
  private readonly clock: WatchdogClock

  private readonly host: TeamLeadHost

  private readonly sessions: WatchdogAgentSessions

  private index = 0

  private textUpdates = 0

  private thinkingUpdates = 0

  private toolUpdates = 0

  constructor(clock: WatchdogClock, host: TeamLeadHost, sessions: WatchdogAgentSessions) {
    this.clock = clock
    this.host = host
    this.sessions = sessions
  }

  selectSession(index: number): void {
    this.index = index
  }

  hasNewTimer(): boolean {
    return this.clock.timers.length > 0
  }

  selectedSession(): WatchdogAgentSessions[number] {
    const session = this.sessions[this.index]
    if (!session) {
      throw new Error(WATCHDOG_SESSION_MISSING)
    }
    return session
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

  observe(event: AgentSessionEvent): void {
    if (event.type === WATCHDOG_SESSION_MESSAGE_UPDATE) {
      switch (event.assistantMessageEvent.type) {
        case WATCHDOG_EVENT_TEXT_DELTA:
          this.textUpdates++
          break
        case WATCHDOG_EVENT_THINKING_DELTA:
          this.thinkingUpdates++
          break
        case WATCHDOG_EVENT_TOOL_DELTA:
          this.toolUpdates++
          break
      }
    }
  }

  hasTextUpdate(): boolean {
    return this.textUpdates > 0
  }

  hasThinkingUpdate(): boolean {
    return this.thinkingUpdates > 0
  }

  hasToolUpdate(): boolean {
    return this.toolUpdates > 0
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
