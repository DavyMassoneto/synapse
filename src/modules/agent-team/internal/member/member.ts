import * as contracts from "#synapse/modules/agent-team/public/contracts"
import { TeamRuleError } from "../operation-results"
import { captureShellCleanup, finishShellCleanups } from "../supervised-shell"
import { TEAM_MEMBER_CLOSE_FAILED, TEAM_MEMBER_CLOSED, TEAM_MESSAGE_BREAK } from "./constants"
import { teamMemberOutcome } from "./member-outcome"
import { TeamMemberQueue } from "./member-queue"
import { TeamMemberResponseState } from "./member-response-state"
import { teamMemberRow } from "./member-row"
import { TeamMemberTurnControl } from "./turn-control"
import { type TeamActiveTools, type TeamMemberObserver, type TeamMemberOutcome } from "./types"

export class TeamMember {
  readonly name: string

  private readonly opened: contracts.OpenedMember

  private readonly session: contracts.MemberSession

  private readonly queue: TeamMemberQueue

  private readonly observer: TeamMemberObserver

  private readonly unsubscribe: contracts.MemberUnsubscribe

  private readonly tools: TeamActiveTools = new Map()

  private busy = false

  private closed = false

  private lastState: contracts.TeamAgentState = contracts.TEAM_IDLE

  private readonly responseState: TeamMemberResponseState

  private run = Promise.resolve()

  private readonly turn: TeamMemberTurnControl

  constructor(opened: contracts.OpenedMember, observer: TeamMemberObserver, runtime: contracts.MemberTurnRuntime) {
    this.turn = new TeamMemberTurnControl(
      opened.record.name,
      opened.session,
      observer,
      runtime,
      this.confirmStopped.bind(this),
    )
    this.opened = opened
    this.name = opened.record.name
    this.session = opened.session
    this.queue = new TeamMemberQueue(opened.journal)
    this.observer = observer
    if (this.queue.interrupted) {
      this.lastState = contracts.TEAM_INTERRUPTED
    }
    this.responseState = new TeamMemberResponseState(opened.lastModel)
    this.unsubscribe = opened.session.subscribe(this.onEvent.bind(this))
  }

  row(): contracts.TeamAgentRow {
    return teamMemberRow({
      opened: this.opened,
      lastState: this.lastState,
      busy: this.busy,
      unconfirmed: this.queue.unconfirmedCount,
      tools: this.tools,
      effectiveModel: this.responseState.effectiveModel,
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
  }

  interrupt(): void {
    this.turn.invalidate()
    this.session.abort().catch(this.onFailure.bind(this))
  }

  async dispose(): Promise<void> {
    this.turn.invalidate()
    this.closed = true
    this.unsubscribe()
    const closed = captureShellCleanup(this.session.dispose.bind(this.session))
    const health = captureShellCleanup(this.turn.ensureHealthy.bind(this.turn))
    await finishShellCleanups([closed, health], TEAM_MEMBER_CLOSE_FAILED)
  }

  async suspend(): Promise<void> {
    this.turn.invalidate()
    this.closed = true
    try {
      await this.checkpointAndStop()
    } finally {
      await this.dispose()
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
      } else if (this.session.isStreaming() && !this.turn.stopping) {
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
    const executionId = this.turn.begin()
    this.run = this.session.prompt(text, executionId).catch(this.promptFailed.bind(this, executionId))
    this.observer.refresh()
  }

  private confirmStopped(): void {
    this.settle({ state: contracts.TEAM_INTERRUPTED })
  }

  private promptFailed(executionId: number, error: Error): void {
    if (this.turn.accepts(executionId)) {
      this.onFailure(error)
    }
  }

  private onFailure(error: Error): void {
    if (!this.closed && this.busy && !this.session.isStreaming()) {
      this.settle({ state: contracts.TEAM_FAILED, text: error.message })
    }
  }

  private onEvent(event: contracts.MemberSessionEvent): void {
    if (!this.closed) {
      this.applyEvent(event)
    } else if (event.kind === contracts.MEMBER_EXECUTION_STARTED) {
      this.session.abort().catch(this.onFailure.bind(this))
    }
  }

  private applyEvent(event: contracts.MemberSessionEvent): void {
    switch (event.kind) {
      case contracts.MEMBER_EXECUTION_ACTIVITY:
        this.turn.activity(event)
        break
      case contracts.MEMBER_EXECUTION_STARTED:
        this.pump()
        break
      case contracts.MEMBER_TURN_STARTED:
        this.onTurnStarted()
        break
      case contracts.MEMBER_TOOL_STARTED:
        this.tools.set(event.callId, event.label)
        this.observer.refresh()
        break
      case contracts.MEMBER_TOOL_ENDED:
        this.tools.delete(event.callId)
        this.observer.refresh()
        break
      case contracts.MEMBER_ASSISTANT_RESPONSE:
        this.responseState.record(event)
        break
      case contracts.MEMBER_EXECUTION_SETTLED:
        this.settle(teamMemberOutcome(event, this.responseState.failure))
        break
    }
  }

  private onTurnStarted(): void {
    this.queue.checkpoint(this.busy)
  }

  private settle(outcome: TeamMemberOutcome): void {
    if (this.busy && this.turn.acceptSettlement()) {
      this.turn.invalidate()
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
