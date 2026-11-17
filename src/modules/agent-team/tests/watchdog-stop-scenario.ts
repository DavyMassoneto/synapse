import { type TeamMemberObserver, TeamMemberTurnControl } from "#synapse/modules/agent-team/internal/member"
import { type MemberTurnRuntime } from "../public"
import { TeamTestSession } from "./doubles"
import {
  WATCHDOG_STOP_CONFIRMED,
  WATCHDOG_STOP_JOURNAL_ERROR,
  WATCHDOG_STOP_NAME,
  WATCHDOG_STOP_REPORT_ERROR,
} from "./watchdog-stop-constants"

export class WatchdogStopScenario implements TeamMemberObserver {
  readonly session = new TeamTestSession()

  readonly control: TeamMemberTurnControl

  readonly journalError = new Error(WATCHDOG_STOP_JOURNAL_ERROR)

  reports = 0

  settled = 0

  refreshes = 0

  confirmed = 0

  failReport = false

  readonly reportError = new Error(WATCHDOG_STOP_REPORT_ERROR)

  failJournal = false

  reenter = false

  nextId = 0

  constructor(runtime: MemberTurnRuntime) {
    this.control = new TeamMemberTurnControl(WATCHDOG_STOP_NAME, this.session, this, runtime, this.finish.bind(this))
  }

  memberNotice(message: string): void {
    if (this.reenter && message === WATCHDOG_STOP_CONFIRMED) {
      this.nextId = this.control.begin()
    }
  }

  memberStartFailed(_name: string, _message: string): void {
    this.reports++
    if (this.failReport) {
      throw this.reportError
    }
  }

  memberSettled(): void {
    this.settled++
  }

  refresh(): void {
    this.refreshes++
  }

  private finish(): void {
    if (this.failJournal) {
      throw this.journalError
    }
    this.confirmed++
  }
}
