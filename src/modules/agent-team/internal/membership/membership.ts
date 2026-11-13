import {
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type StartMemberRequest,
  TEAM_STARTED,
  type TeamLead,
  type TeamStartOutcome,
} from "#synapse/modules/agent-team/public/contracts"
import { TeamMember } from "../member"
import { TeamRuleError, teamAsyncOperationResult } from "../operation-results"
import { type TeamRecentEvents } from "../recent-events"
import { type TeamRoster } from "../roster"
import { TEAM_EVENT_STARTED, TEAM_MEMBERSHIP_CLOSED, TEAM_SESSION_REPLACED } from "./constants"
import { teamOpenRequest } from "./open-request"
import { type TeamAdmissionAttempt, type TeamMembershipContext } from "./types"

export class TeamMembership {
  private readonly team: TeamMembershipContext

  private readonly sessions: MemberSessions

  private readonly lead: TeamLead

  private readonly roster: TeamRoster

  private readonly events: TeamRecentEvents

  private generation = 0

  private closed = false

  constructor(
    team: TeamMembershipContext,
    sessions: MemberSessions,
    lead: TeamLead,
    roster: TeamRoster,
    events: TeamRecentEvents,
  ) {
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
    return this.openReserved(name, request, this.generation)
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

  private async openReserved(name: string, request: StartMemberRequest, generation: number): Promise<TeamStartOutcome> {
    try {
      const opened = await this.sessions.open(teamOpenRequest(name, request), this.team)
      return await this.admit(opened, request, generation)
    } catch (error) {
      if (generation === this.generation) {
        this.roster.release(name)
      }
      throw error
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
      const member = new TeamMember(opened, this.team)
      attempt.member = member
      member.accept(request.task)
      this.lead.recordMember(opened.record)
      this.roster.add(member)
      this.events.add(`${opened.record.name}${TEAM_EVENT_STARTED}${request.description}`)
      member.startPending()
      return { kind: TEAM_STARTED, name: opened.record.name, model: opened.record.model }
    } catch (error) {
      if (attempt.member) {
        await attempt.member.dispose()
      } else {
        await opened.session.dispose()
      }
      throw error
    }
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
      this.roster.add(new TeamMember(opened, this.team))
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
