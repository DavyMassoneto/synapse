import {
  type AgentTeam,
  type CreateTaskInput,
  type MemberRecord,
  type MemberSessions,
  type StartMemberRequest,
  TASK_ACCEPTED,
  type TaskFilter,
  type TaskOutcome,
  type TaskSnapshot,
  type TaskView,
  type TeamClock,
  type TeamInterruptOutcome,
  type TeamLead,
  type TeamOutcome,
  type TeamOverview,
  type TeamStartOutcome,
  type TeamWaitOutcome,
  type UpdateTaskInput,
} from "#synapse/modules/agent-team/public/contracts"
import { type TeamMemberOutcome } from "../member"
import { TeamMembership } from "../membership"
import { TeamMessages } from "../messaging"
import { teamLeadRow, teamOutcomePresentation } from "../presentation"
import { TeamRecentEvents } from "../recent-events"
import { TeamRoster } from "../roster"
import { TaskBoard } from "../task-board"
import { TeamBoardDirectory } from "./board-directory"
import { teamSuspendMembers } from "./suspend-members"

export class Team implements AgentTeam {
  private readonly lead: TeamLead

  private readonly roster = new TeamRoster()

  private readonly messages: TeamMessages

  private readonly board: TaskBoard

  private readonly admission: TeamMembership

  private readonly events: TeamRecentEvents

  private closed = false

  constructor(lead: TeamLead, sessions: MemberSessions, clock: TeamClock) {
    this.lead = lead
    this.board = new TaskBoard(lead, new TeamBoardDirectory(this.roster))
    this.events = new TeamRecentEvents(clock)
    this.messages = new TeamMessages(lead, this.roster, this.events, this)
    this.admission = new TeamMembership({ team: this, observer: this }, sessions, lead, this.roster, this.events)
  }

  start(request: StartMemberRequest): Promise<TeamStartOutcome> {
    return this.admission.start(request)
  }

  restore(records: MemberRecord[], tasks: TaskSnapshot[]): Promise<void> {
    this.closed = false
    this.messages.reopen()
    this.events.clear()
    for (const member of this.roster.clear()) {
      member.dispose()
    }
    this.board.restore(tasks)
    return this.admission.restore(records)
  }

  send(sender: string, target: string, message: string): TeamOutcome {
    return this.messages.send(sender, target, message)
  }

  interrupt(target: string): TeamInterruptOutcome {
    return this.messages.interrupt(target)
  }

  wait(name: string, timeoutMs: number, signal?: AbortSignal): Promise<TeamWaitOutcome> {
    return this.messages.wait(name, timeoutMs, signal)
  }

  markLeadSeen(): void {
    this.messages.inbox.markSeen()
  }

  overview(): TeamOverview {
    const agents = [teamLeadRow(this.lead, this.messages.inbox.hasWaiter)]
    for (const member of this.roster.all()) {
      agents.push(member.row())
    }
    agents.push(...this.roster.failures())
    return { agents, tasks: this.board.list({}), events: this.events.list() }
  }

  refresh(): void {
    if (!this.closed) {
      this.lead.show(this.overview())
    }
  }

  createTask(input: CreateTaskInput): TaskOutcome {
    return this.refreshTaskResult(this.board.create(input))
  }

  getTask(taskId: string): TaskOutcome {
    return this.board.get(taskId)
  }

  listTasks(filter: TaskFilter): TaskView[] {
    return this.board.list(filter)
  }

  updateTask(caller: string, input: UpdateTaskInput): TaskOutcome {
    return this.refreshTaskResult(this.board.update(caller, input))
  }

  async suspend(): Promise<void> {
    this.closed = true
    this.admission.close()
    this.messages.close()
    await teamSuspendMembers(this.roster.clear(), this.lead)
  }

  memberStartFailed(name: string, message: string): void {
    this.lead.reportFailure(name, message)
  }

  memberSettled(name: string, outcome: TeamMemberOutcome): void {
    if (!this.closed) {
      const presentation = teamOutcomePresentation(name, outcome)
      this.events.add(presentation.event)
      this.messages.deliverLead(presentation.notice)
    }
  }

  private refreshTaskResult(result: TaskOutcome): TaskOutcome {
    if (result.kind === TASK_ACCEPTED) {
      this.refresh()
    }
    return result
  }
}
