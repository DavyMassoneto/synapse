import {
  type AgentTeam,
  type CreateTaskInput,
  type MemberRecord,
  type StartMemberRequest,
  type TaskFilter,
  type TaskOutcome,
  type TaskSnapshot,
  type TaskView,
  type TeamInterruptOutcome,
  type TeamOutcome,
  type TeamOverview,
  type TeamStartOutcome,
  type TeamWaitOutcome,
  type UpdateTaskInput,
} from "#synapse/modules"
import { TEAM_FIXTURE_REFUSAL, TEAM_FIXTURE_TASK } from "./constants"

export class ToolsTeamDouble implements AgentTeam {
  refused = false

  sender = ""

  target = ""

  update?: UpdateTaskInput

  startInput?: StartMemberRequest

  createInput?: CreateTaskInput

  filter?: TaskFilter

  async start(request: StartMemberRequest): Promise<TeamStartOutcome> {
    this.startInput = request
    if (this.refused) {
      return TEAM_FIXTURE_REFUSAL
    }
    return { kind: "started", name: "worker", model: "provider/model" }
  }

  async restore(_records: MemberRecord[], _tasks: TaskSnapshot[]): Promise<void> {}

  send(sender: string, target: string, _message: string): TeamOutcome {
    this.sender = sender
    this.target = target
    return this.outcome()
  }

  interrupt(target: string): TeamInterruptOutcome {
    this.target = target
    if (this.refused) {
      return TEAM_FIXTURE_REFUSAL
    }
    return { kind: "interrupt_requested" }
  }

  async wait(name: string, _timeout: number, signal?: AbortSignal): Promise<TeamWaitOutcome> {
    this.sender = name
    signal?.throwIfAborted()
    if (this.refused) {
      return TEAM_FIXTURE_REFUSAL
    }
    return { kind: "wait_completed", timedOut: false }
  }

  markLeadSeen(): void {}

  overview(): TeamOverview {
    return { agents: [], tasks: [], events: [] }
  }

  refresh(): void {}

  createTask(input: CreateTaskInput): TaskOutcome {
    this.createInput = input
    return this.taskOutcome()
  }

  getTask(_id: string): TaskOutcome {
    return this.taskOutcome()
  }

  listTasks(filter: TaskFilter): TaskView[] {
    this.filter = filter
    return [TEAM_FIXTURE_TASK]
  }

  updateTask(caller: string, input: UpdateTaskInput): TaskOutcome {
    this.sender = caller
    this.update = input
    return this.taskOutcome()
  }

  async suspend(): Promise<void> {}

  private outcome(): TeamOutcome {
    if (this.refused) {
      return TEAM_FIXTURE_REFUSAL
    }
    return { kind: "done" }
  }

  private taskOutcome(): TaskOutcome {
    if (this.refused) {
      return TEAM_FIXTURE_REFUSAL
    }
    return { kind: "accepted", task: TEAM_FIXTURE_TASK }
  }
}
