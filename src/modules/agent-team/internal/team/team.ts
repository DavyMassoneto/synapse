import {
  type AgentTeam,
  type CreateTaskInput,
  type MemberRecord,
  type MemberSessions,
  type MemberTurnRuntime,
  TASK_ACCEPTED,
  type TaskCleanOutcome,
  type TaskOutcome,
  type TaskSnapshot,
  type TeamClock,
  type TeamLead,
  type TeamOverview,
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

  readonly memberNotice: TeamLead["deliver"]

  readonly start: AgentTeam["start"]

  readonly send: AgentTeam["send"]

  readonly interrupt: AgentTeam["interrupt"]

  readonly selectedTask: AgentTeam["selectedTask"]

  readonly getTask: AgentTeam["getTask"]

  readonly listTasks: AgentTeam["listTasks"]

  constructor(lead: TeamLead, sessions: MemberSessions, clock: TeamClock, runtime: MemberTurnRuntime) {
    this.lead = lead
    this.memberNotice = lead.deliver.bind(lead)
    this.board = new TaskBoard(lead, new TeamBoardDirectory(this.roster))
    this.events = new TeamRecentEvents(clock)
    this.messages = new TeamMessages(lead, this.roster, this.events, this)
    this.admission = new TeamMembership(this, sessions, lead, this.roster, this.events, runtime)
    this.start = this.admission.start.bind(this.admission)
    this.send = this.messages.send.bind(this.messages)
    this.interrupt = this.messages.interrupt.bind(this.messages)
    this.selectedTask = this.board.selectedTask.bind(this.board)
    this.getTask = this.board.get.bind(this.board)
    this.listTasks = this.board.list.bind(this.board)
  }

  async restore(records: MemberRecord[], tasks: TaskSnapshot[]): Promise<void> {
    this.closed = false
    this.messages.reopen()
    this.events.clear()
    for (const member of this.roster.clear()) {
      await member.dispose()
    }
    this.board.restore(tasks)
    return this.admission.restore(records)
  }

  overview(): TeamOverview {
    const agents = [teamLeadRow(this.lead)]
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

  cleanTasks(caller: string): TaskCleanOutcome {
    const result = this.board.clean(caller)
    this.refresh()
    return result
  }

  createTask(input: CreateTaskInput): TaskOutcome {
    return this.refreshTaskResult(this.board.create(input))
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
