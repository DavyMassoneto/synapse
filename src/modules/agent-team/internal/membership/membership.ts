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
import { type MemberOutcome } from "../member-outcome"
import { rethrowTeamOperationError, TeamRuleError, teamAsyncOperationResult } from "../operation-results"
import { type TeamRecentEvents } from "../recent-events"
import { type TeamRoster } from "../roster"
import { type TaskBoard, taskBoardCopySnapshot } from "../task-board"
import { acceptMemberTask } from "./accept-task"
import { admitRestoredTeamMember } from "./admit-restored"
import { cleanupPreparedTeamAdmission } from "./cleanup-prepared"
import {
  TEAM_ADMISSION_CLEANUP_FAILED,
  TEAM_ADMISSION_MESSAGE_SEPARATOR,
  TEAM_EVENT_STARTED,
  TEAM_SESSION_REPLACED,
} from "./constants"
import { finishTeamAcquisitions } from "./finish-acquisitions"
import { teamOpenRequest } from "./open-request"
import { recordTeamAdmission } from "./persist-admission"
import { reserveTeamMember } from "./reserve-member"
import {
  type TeamAdmissionAttempt,
  type TeamAdmissionPersistencePorts,
  type TeamMembershipContext,
  type TeamPendingAcquisitions,
} from "./types"

export class TeamMembership {
  private readonly team: TeamMembershipContext

  private readonly sessions: MemberSessions

  private readonly lead: TeamLead

  private readonly roster: TeamRoster

  private readonly events: TeamRecentEvents

  private readonly runtime: MemberTurnRuntime

  private readonly board: TaskBoard

  private readonly clock: TeamClock

  private readonly persistence: TeamAdmissionPersistencePorts

  private generation = 0

  private closed = false

  private readonly pending: TeamPendingAcquisitions = new Set()

  constructor(
    team: TeamMembershipContext,
    sessions: MemberSessions,
    lead: TeamLead,
    roster: TeamRoster,
    events: TeamRecentEvents,
    runtime: MemberTurnRuntime,
    board: TaskBoard,
    clock: TeamClock,
    persistence: TeamAdmissionPersistencePorts,
  ) {
    this.board = board
    this.clock = clock
    this.persistence = persistence
    this.runtime = runtime
    this.team = team
    this.sessions = sessions
    this.lead = lead
    this.roster = roster
    this.events = events
  }

  close(): Promise<void> {
    this.closed = true
    this.generation += 1
    return finishTeamAcquisitions(this.pending)
  }

  start(request: StartMemberRequest): Promise<TeamStartOutcome> {
    return teamAsyncOperationResult(this.startMember.bind(this, request))
  }

  private async startMember(request: StartMemberRequest): Promise<TeamStartOutcome> {
    const name = reserveTeamMember(request, this.roster, this.closed)
    const generation = this.generation
    const acquisition = Promise.withResolvers<MemberOutcome>()
    this.pending.add(acquisition)
    const attempt: TeamAdmissionAttempt = { outcome: { failed: false } }
    try {
      this.board.validateAdmission(request.taskId, request.expectedRevision)
      this.ensureGeneration(generation)
      const opened = await this.sessions.open(teamOpenRequest(name, request), this.team)
      return await this.admit(opened, request, generation, attempt)
    } catch (error) {
      if (generation === this.generation) {
        this.roster.release(name)
      }
      if (error instanceof Error) {
        rethrowTeamOperationError(error)
      }
      throw error
    } finally {
      acquisition.resolve(attempt.outcome)
      if (!attempt.outcome.failed) {
        this.pending.delete(acquisition)
      }
    }
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
    attempt: TeamAdmissionAttempt,
  ): Promise<TeamStartOutcome> {
    try {
      this.ensureGeneration(generation)
      const member = new TeamMember(opened, this.team, this.runtime, this.clock)
      attempt.member = member
      this.ensureGeneration(generation)
      return this.publishMember(member, opened.record, request, attempt, generation)
    } catch (error) {
      try {
        await cleanupPreparedTeamAdmission(this.sessions, opened, attempt)
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
    generation: number,
  ): TeamStartOutcome {
    const task = this.board.prepareAdmission(record.name, request.taskId, request.expectedRevision)
    acceptMemberTask(member, task)
    this.board.validateAdmission(request.taskId, request.expectedRevision)
    this.ensureGeneration(generation)
    const observation = this.persistence.observation.generation
    recordTeamAdmission(this.persistence.journal, { ...record }, taskBoardCopySnapshot(task), attempt)
    this.ensureGeneration(generation)
    this.persistence.observation.observeAdmission(task, observation)
    this.ensureGeneration(generation)
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

  private async restoreMember(record: MemberRecord, generation: number): Promise<void> {
    const acquisition = Promise.withResolvers<MemberOutcome>()
    this.pending.add(acquisition)
    const attempt: TeamAdmissionAttempt = { outcome: { failed: false } }
    try {
      this.roster.reserve(record.name)
      const opened = await this.sessions.reopen(record, this.team)
      await admitRestoredTeamMember(opened, attempt, {
        observer: this.team,
        runtime: this.runtime,
        clock: this.clock,
        roster: this.roster,
        validateGeneration: this.ensureGeneration.bind(this, generation),
      })
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }
      if (generation === this.generation) {
        this.roster.failed(record, error.message)
        this.lead.reportFailure(record.name, error.message)
      }
    } finally {
      acquisition.resolve(attempt.outcome)
      if (!attempt.outcome.failed) {
        this.pending.delete(acquisition)
      }
    }
  }
}
