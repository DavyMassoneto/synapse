import { type AgentTeam, type CreateTaskInput, TASK_REFUSED, type TaskFilter } from "#synapse/modules/agent-team"
import { translateTeamTaskUpdate } from "./task-input"
import { teamAcceptedOrRefusedOutput, teamTextOutput } from "./tool-output"
import {
  type TeamCreateTaskInput,
  type TeamGetTaskInput,
  type TeamListTasksInput,
  type TeamToolOutput,
  type TeamUpdateTaskInput,
} from "./types"

export class TeamTaskHandlers {
  private readonly team: AgentTeam

  private readonly caller: string

  constructor(team: AgentTeam, caller: string) {
    this.team = team
    this.caller = caller
  }

  async clean(): Promise<TeamToolOutput> {
    const result = this.team.cleanTasks(this.caller)
    return teamTextOutput(JSON.stringify(result), result.kind === TASK_REFUSED)
  }

  async create(_id: string, input: TeamCreateTaskInput): Promise<TeamToolOutput> {
    const request: CreateTaskInput = {
      subject: input.subject,
      description: input.description,
      blockedBy: input.blocked_by,
      writeScopes: input.write_scopes,
    }
    return teamAcceptedOrRefusedOutput(this.team.createTask(request))
  }

  async get(_id: string, input: TeamGetTaskInput): Promise<TeamToolOutput> {
    return teamAcceptedOrRefusedOutput(this.team.getTask(input.task_id))
  }

  async listTasks(_id: string, input: TeamListTasksInput): Promise<TeamToolOutput> {
    const filter: TaskFilter = { ...input }
    return teamTextOutput(JSON.stringify(this.team.listTasks(filter)), false)
  }

  async update(_id: string, input: TeamUpdateTaskInput): Promise<TeamToolOutput> {
    const request = translateTeamTaskUpdate(input)
    return teamAcceptedOrRefusedOutput(this.team.updateTask(this.caller, request))
  }
}
