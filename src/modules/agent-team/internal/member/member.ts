import {
  MEMBER_ASSISTANT_RESPONSE,
  MEMBER_EXECUTION_SETTLED,
  MEMBER_EXECUTION_STARTED,
  MEMBER_TOOL_ENDED,
  MEMBER_TOOL_STARTED,
  MEMBER_TURN_STARTED,
  type MemberSession,
  type MemberSessionEvent,
  type MemberUnsubscribe,
  type OpenedMember,
  TEAM_FAILED,
  TEAM_IDLE,
  TEAM_INTERRUPTED,
  type TeamAgentRow,
  type TeamAgentState,
} from "#synapse/modules/agent-team/public/contracts"
import { Inbox } from "../inbox"
import { TeamRuleError } from "../operation-results"
import { TEAM_MEMBER_CLOSED, TEAM_MESSAGE_BREAK } from "./constants"
import { teamMemberOutcome } from "./member-outcome"
import { TeamMemberQueue } from "./member-queue"
import { TeamMemberResponseState } from "./member-response-state"
import { teamMemberRow } from "./member-row"
import { type TeamActiveTools, type TeamMemberObserver, type TeamMemberOutcome } from "./types"

export class TeamMember {
  readonly inbox = new Inbox()

  readonly name: string

  private readonly opened: OpenedMember

  private readonly session: MemberSession

  private readonly queue: TeamMemberQueue

  private readonly observer: TeamMemberObserver

  private readonly unsubscribe: MemberUnsubscribe

  private readonly tools: TeamActiveTools = new Map()

  private busy = false

  private closed = false

  private lastState: TeamAgentState = TEAM_IDLE

  private readonly responseState: TeamMemberResponseState

  private run = Promise.resolve()

  constructor(opened: OpenedMember, observer: TeamMemberObserver) {
    this.opened = opened
    this.name = opened.record.name
    this.session = opened.session
    this.queue = new TeamMemberQueue(opened.journal)
    this.observer = observer
    if (this.queue.interrupted) {
      this.lastState = TEAM_INTERRUPTED
    }
    this.responseState = new TeamMemberResponseState(opened.lastModel)
    this.unsubscribe = opened.session.subscribe(this.onEvent.bind(this))
  }

  row(): TeamAgentRow {
    return teamMemberRow({
      opened: this.opened,
      lastState: this.lastState,
      busy: this.busy,
      waiting: this.inbox.hasWaiter,
      unconfirmed: this.queue.unconfirmedCount,
      tools: this.tools,
      responseState: this.responseState,
    })
  }

  deliver(text: string): void {
    this.accept(text)
    this.startPending()
  }

  accept(text: string): void {
    if (this.closed) {
      throw new TeamRuleError(TEAM_MEMBER_CLOSED)
    }
    this.queue.accept(text, this.busy)
    this.inbox.arrive()
  }

  interrupt(): void {
    this.session.abort().catch(this.onFailure.bind(this))
  }

  dispose(): void {
    this.closed = true
    this.inbox.close()
    this.unsubscribe()
    this.session.dispose()
  }

  async suspend(): Promise<void> {
    this.closed = true
    this.inbox.close()
    try {
      await this.checkpointAndStop()
    } finally {
      this.dispose()
    }
  }

  private async checkpointAndStop(): Promise<void> {
    try {
      this.queue.checkpoint(this.busy)
    } finally {
      await this.stopSession()
    }
  }

  private async stopSession(): Promise<void> {
    try {
      await this.session.abort()
    } finally {
      await this.run
    }
  }

  startPending(): void {
    try {
      this.pump()
    } catch (error) {
      if (error instanceof Error) {
        this.observer.memberStartFailed(this.name, error.message)
      } else {
        throw error
      }
    }
  }

  private pump(): void {
    if (this.queue.pendingCount > 0) {
      if (!this.busy) {
        this.start()
      } else if (this.session.isStreaming()) {
        this.steerPending()
      }
    }
  }

  private steerPending(): void {
    for (const text of this.queue.takePending()) {
      this.session.steer(text).catch(this.onFailure.bind(this))
    }
  }

  private start(): void {
    this.queue.checkpoint(true)
    this.responseState.clearFailure()
    this.busy = true
    const text = this.queue.takePending().join(TEAM_MESSAGE_BREAK)
    this.run = this.session.prompt(text).catch(this.onFailure.bind(this))
    this.observer.refresh()
  }

  private onFailure(error: Error): void {
    if (!this.closed && this.busy && !this.session.isStreaming()) {
      this.settle({ state: TEAM_FAILED, text: error.message })
    }
  }

  private onEvent(event: MemberSessionEvent): void {
    if (!this.closed) {
      this.applyEvent(event)
    } else if (event.kind === MEMBER_EXECUTION_STARTED) {
      this.session.abort().catch(this.onFailure.bind(this))
    }
  }

  private applyEvent(event: MemberSessionEvent): void {
    switch (event.kind) {
      case MEMBER_EXECUTION_STARTED:
        this.pump()
        break
      case MEMBER_TURN_STARTED:
        this.onTurnStarted()
        break
      case MEMBER_TOOL_STARTED:
        this.tools.set(event.callId, event.label)
        this.observer.refresh()
        break
      case MEMBER_TOOL_ENDED:
        this.tools.delete(event.callId)
        this.observer.refresh()
        break
      case MEMBER_ASSISTANT_RESPONSE:
        this.responseState.record(event)
        break
      case MEMBER_EXECUTION_SETTLED:
        this.settle(teamMemberOutcome(event, this.responseState.failure))
        break
    }
  }

  private onTurnStarted(): void {
    this.inbox.markSeen()
    this.queue.checkpoint(this.busy)
  }

  private settle(outcome: TeamMemberOutcome): void {
    if (this.busy) {
      this.queue.complete()
      this.busy = false
      this.lastState = outcome.state
      this.tools.clear()
      if (this.queue.pendingCount > 0) {
        this.start()
      } else {
        this.observer.memberSettled(this.name, outcome)
      }
      this.observer.refresh()
    }
  }
}
