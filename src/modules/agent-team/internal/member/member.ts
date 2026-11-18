import * as contracts from "#synapse/modules/agent-team/public/contracts"
import { captureMemberOutcome, finishMemberOutcomes } from "../member-outcome"
import { TeamRuleError } from "../operation-results"
import { MemberRunObservation } from "../run-observation"
import { TEAM_MEMBER_CLOSE_FAILED, TEAM_MEMBER_CLOSED, TEAM_MESSAGE_BREAK } from "./constants"
import { teamMemberOutcome } from "./member-outcome"
import { TeamMemberQueue } from "./member-queue"
import { TeamMemberResponseState } from "./member-response-state"
import { teamMemberRow } from "./member-row"
import { suspendMemberSession } from "./suspend-session"
import { TeamMemberTurnControl } from "./turn-control"
import { type TeamMemberObserver, type TeamMemberOutcome } from "./types"

export class TeamMember {
  readonly name: string

  private readonly opened: contracts.OpenedMember

  private readonly queue: TeamMemberQueue

  private readonly observer: TeamMemberObserver

  private readonly unsubscribe: contracts.MemberUnsubscribe

  private readonly observation: MemberRunObservation

  private busy = false

  private executionStarted = false

  private closed = false

  private lastState: contracts.TeamAgentState = contracts.TEAM_IDLE

  private readonly responseState: TeamMemberResponseState

  private run = Promise.resolve()

  private readonly turn: TeamMemberTurnControl

  constructor(
    opened: contracts.OpenedMember,
    observer: TeamMemberObserver,
    runtime: contracts.MemberTurnRuntime,
    clock: contracts.TeamClock,
  ) {
    this.observation = new MemberRunObservation(runtime, clock)
    this.turn = new TeamMemberTurnControl(
      opened.record.name,
      opened.session,
      observer,
      runtime,
      this.confirmStopped.bind(this),
    )
    this.name = opened.record.name
    this.opened = opened
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
      progress: this.observation.snapshot(),
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
    const executionId = this.turn.currentExecutionId
    this.turn.interrupt()
    this.opened.session.abort().catch(this.promptFailed.bind(this, executionId))
  }

  async dispose(): Promise<void> {
    this.turn.invalidate()
    this.closed = true
    this.unsubscribe()
    const closed = captureMemberOutcome(this.opened.session.dispose.bind(this.opened.session))
    const health = captureMemberOutcome(this.turn.ensureHealthy.bind(this.turn))
    await finishMemberOutcomes([closed, health], TEAM_MEMBER_CLOSE_FAILED)
  }

  async suspend(): Promise<void> {
    this.turn.invalidate()
    this.closed = true
    try {
      await suspendMemberSession(this.opened.session, this.queue, this.busy, this.run)
    } finally {
      await this.dispose()
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
      } else if (this.opened.session.isStreaming() && !this.turn.stopping) {
        this.steerPending()
      }
    }
  }

  private steerPending(): void {
    const executionId = this.turn.currentExecutionId
    for (const text of this.queue.takePending(false)) {
      this.opened.session.steer(text).catch(this.promptFailed.bind(this, executionId))
    }
  }

  private start(): void {
    this.queue.checkpoint(true)
    this.responseState.clearFailure()
    this.busy = true
    this.executionStarted = false
    const text = this.queue.takePending(true).join(TEAM_MESSAGE_BREAK)
    const executionId = this.turn.begin()
    this.observation.start(executionId)
    this.run = this.opened.session.prompt(text, executionId).catch(this.promptFailed.bind(this, executionId))
    this.observer.refresh()
  }

  private confirmStopped(): void {
    this.settle({ state: contracts.TEAM_INTERRUPTED })
  }

  private promptFailed(executionId: number, error: Error): void {
    if (this.turn.isCurrentExecution(executionId) && !this.closed && this.busy && !this.opened.session.isStreaming()) {
      this.settle({ state: contracts.TEAM_FAILED, text: error.message })
    }
  }

  private onEvent(event: contracts.MemberSessionEvent): void {
    if (!this.closed) {
      this.applyEvent(event)
    } else if (event.kind === contracts.MEMBER_EXECUTION_STARTED) {
      this.opened.session.abort().catch(this.promptFailed.bind(this, event.executionId))
    }
  }

  private applyEvent(event: contracts.MemberSessionEvent): void {
    this.observation.observe(event)
    switch (event.kind) {
      case contracts.MEMBER_EXECUTION_ACTIVITY:
        this.turn.activity(event)
        break
      case contracts.MEMBER_EXECUTION_STARTED:
        if (this.turn.isCurrentExecution(event.executionId)) {
          this.executionStarted = true
          if (this.turn.interrupted) {
            this.opened.session.abort().catch(this.promptFailed.bind(this, event.executionId))
          } else {
            this.pump()
          }
        }
        break
      case contracts.MEMBER_TURN_STARTED:
        this.queue.checkpoint(this.busy)
        break
      case contracts.MEMBER_TOOL_STARTED:
      case contracts.MEMBER_TOOL_ENDED:
        this.observer.refresh()
        break
      case contracts.MEMBER_ASSISTANT_RESPONSE:
        this.responseState.record(event)
        break
      case contracts.MEMBER_EXECUTION_SETTLED:
        if (this.executionStarted && this.turn.isCurrentExecution(event.executionId)) {
          this.settle(teamMemberOutcome(event, this.responseState.failure))
        }
        break
    }
  }

  private settle(outcome: TeamMemberOutcome): void {
    if (this.busy && this.turn.acceptSettlement()) {
      if (this.turn.interrupted && outcome.state === contracts.TEAM_FINISHED) {
        outcome = { state: contracts.TEAM_INTERRUPTED }
      }
      this.turn.invalidate()
      if (outcome.state === contracts.TEAM_FINISHED) {
        this.queue.complete()
      } else {
        this.queue.interrupt()
      }
      this.busy = false
      this.lastState = outcome.state
      this.observation.finish()
      if (outcome.state === contracts.TEAM_FINISHED && this.queue.pendingCount > 0) {
        this.start()
      } else {
        this.observer.memberSettled(this.name, outcome)
      }
      this.observer.refresh()
    }
  }
}
