import {
  type MemberRecord,
  type MemberSessions,
  type MemberTurnRuntime,
  type OpenedMember,
  type StartMemberRequest,
  TEAM_STARTED,
  type TeamClock,
  type TeamLead,
  type TeamStartOutcome,
} from "#synapse/modules/agent-team/public/contracts"
import { TeamMember } from "../member"
import { rethrowTeamOperationError, TeamRuleError, teamAsyncOperationResult } from "../operation-results"
import { type TeamRecentEvents } from "../recent-events"
import { type TeamRoster } from "../roster"
import { type TaskBoard, taskBoardCopySnapshot } from "../task-board"
import { acceptMemberTask } from "./accept-task"
import {
  TEAM_ADMISSION_CLEANUP_FAILED,
  TEAM_ADMISSION_MESSAGE_SEPARATOR,
  TEAM_EVENT_STARTED,
  TEAM_MEMBERSHIP_CLOSED,
  TEAM_SESSION_REPLACED,
} from "./constants"
import { teamOpenRequest } from "./open-request"
import { rollbackPreparedMember } from "./rollback"
import { type TeamAdmissionAttempt, type TeamAdmissionJournal, type TeamMembershipContext } from "./types"

export class TeamMembership {
  private readonly team: TeamMembershipContext

  private readonly sessions: MemberSessions

  private readonly lead: TeamLead

  private readonly roster: TeamRoster

  private readonly events: TeamRecentEvents

  private readonly runtime: MemberTurnRuntime

  private readonly board: TaskBoard

  private readonly clock: TeamClock

  private readonly journal: TeamAdmissionJournal

  private generation = 0

  private closed = false

  constructor(
    team: TeamMembershipContext,
    sessions: MemberSessions,
    lead: TeamLead,
    roster: TeamRoster,
    events: TeamRecentEvents,
    runtime: MemberTurnRuntime,
    board: TaskBoard,
    clock: TeamClock,
    journal: TeamAdmissionJournal,
  ) {
    this.board = board
    this.clock = clock
    this.journal = journal
    this.runtime = runtime
    this.team = team
    this.sessions = sessions
    this.lead = lead
    this.roster = roster
    this.events = events
  }

  close(): void {
    this.closed = true
    this.generation += 1
  }

  start(request: StartMemberRequest): Promise<TeamStartOutcome> {
    return teamAsyncOperationResult(this.startMember.bind(this, request))
  }

  private async startMember(request: StartMemberRequest): Promise<TeamStartOutcome> {
    const name = this.reserve(request)
    const generation = this.generation
    try {
      this.board.validateAdmission(request.taskId, request.expectedRevision)
      const opened = await this.sessions.open(teamOpenRequest(name, request), this.team)
      return await this.admit(opened, request, generation)
    } catch (error) {
      if (generation === this.generation) {
        this.roster.release(name)
      }
      if (error instanceof Error) {
        rethrowTeamOperationError(error)
      }
      throw error
    }
  }

  private reserve(request: StartMemberRequest): string {
    if (this.closed) {
      throw new TeamRuleError(TEAM_MEMBERSHIP_CLOSED)
    }
    if (request.name) {
      return this.roster.reserve(request.name)
    }
    return this.roster.reserveDefault()
  }

  private ensureGeneration(generation: number): void {
    if (generation !== this.generation) {
      throw new TeamRuleError(TEAM_SESSION_REPLACED)
    }
  }

  private async admit(
    opened: OpenedMember,
    request: StartMemberRequest,
    generation: number,
  ): Promise<TeamStartOutcome> {
    const attempt: TeamAdmissionAttempt = {}
    try {
      this.ensureGeneration(generation)
      const member = new TeamMember(opened, this.team, this.runtime, this.clock)
      attempt.member = member
      return this.publishMember(member, opened.record, request, attempt)
    } catch (error) {
      try {
        if (!attempt.committed) {
          await rollbackPreparedMember(this.sessions, opened, attempt)
        }
      } catch (cleanup) {
        const failures = [error, cleanup]
        const message = `${TEAM_ADMISSION_CLEANUP_FAILED}${TEAM_ADMISSION_MESSAGE_SEPARATOR}${failures.join(TEAM_ADMISSION_MESSAGE_SEPARATOR)}`
        throw new AggregateError(failures, message)
      }
      throw error
    }
  }

  private publishMember(
    member: TeamMember,
    record: MemberRecord,
    request: StartMemberRequest,
    attempt: TeamAdmissionAttempt,
  ): TeamStartOutcome {
    const task = this.board.prepareAdmission(record.name, request.taskId, request.expectedRevision)
    acceptMemberTask(member, task)
    this.board.validateAdmission(request.taskId, request.expectedRevision)
    this.journal.recordAdmission({ ...record }, taskBoardCopySnapshot(task))
    attempt.committed = true
    const snapshot = this.board.acceptAdmission(task)
    this.roster.add(member)
    this.events.add(`${record.name}${TEAM_EVENT_STARTED}${request.description}`)
    member.startPending()
    return { kind: TEAM_STARTED, name: record.name, model: record.model, task: snapshot }
  }

  async restore(records: MemberRecord[]): Promise<void> {
    this.closed = false
    this.generation += 1
    const generation = this.generation
    for (const record of records) {
      if (generation === this.generation) {
        await this.restoreMember(record, generation)
      }
    }
    if (generation === this.generation) {
      this.team.refresh()
    }
  }

  private async admitRestored(opened: OpenedMember, generation: number): Promise<void> {
    try {
      this.ensureGeneration(generation)
      this.roster.add(new TeamMember(opened, this.team, this.runtime, this.clock))
    } catch (error) {
      await opened.session.dispose()
      throw error
    }
  }

  private async restoreMember(record: MemberRecord, generation: number): Promise<void> {
    try {
      this.roster.reserve(record.name)
      const opened = await this.sessions.reopen(record, this.team)
      await this.admitRestored(opened, generation)
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }
      if (generation === this.generation) {
        this.roster.failed(record, error.message)
        this.lead.reportFailure(record.name, error.message)
      }
    }
  }
}
