import {
  MEMBER_ACTIVITY_SETTLED,
  MEMBER_ACTIVITY_STARTED,
  MEMBER_ACTIVITY_TOOL_END,
  MEMBER_ACTIVITY_TOOL_START,
  MEMBER_ACTIVITY_TOOL_UPDATE,
  MEMBER_ACTIVITY_UPDATED,
  type MemberExecutionActivity,
} from "#synapse/modules/agent-team/public/contracts"
import { MEMBER_WATCHDOG_OBSERVATIONAL_TOOLS } from "./constants"
import { type MemberTurnWatchdog } from "./watchdog"

export class MemberTurnActivity {
  private readonly tools = new Set<string>()

  private readonly watchdog: MemberTurnWatchdog

  constructor(watchdog: MemberTurnWatchdog) {
    this.watchdog = watchdog
  }

  clear(): void {
    this.tools.clear()
  }

  record(event: MemberExecutionActivity): void {
    if (event.phase === MEMBER_ACTIVITY_STARTED) {
      this.tools.clear()
      this.watchdog.start(event.executionId)
    } else if (event.phase === MEMBER_ACTIVITY_SETTLED) {
      this.tools.clear()
      this.watchdog.invalidate()
    } else if (event.phase === MEMBER_ACTIVITY_UPDATED) {
      this.watchdog.update(event.executionId)
    } else if (event.phase === MEMBER_ACTIVITY_TOOL_START) {
      if (!MEMBER_WATCHDOG_OBSERVATIONAL_TOOLS.includes(event.name)) {
        this.tools.add(event.callId)
        this.watchdog.update(event.executionId)
      }
    } else if (
      (event.phase === MEMBER_ACTIVITY_TOOL_END || event.phase === MEMBER_ACTIVITY_TOOL_UPDATE) &&
      this.tools.has(event.callId)
    ) {
      this.watchdog.update(event.executionId)
      if (event.phase === MEMBER_ACTIVITY_TOOL_END) {
        this.tools.delete(event.callId)
      }
    }
  }
}
