import { type AgentTeam, TEAM_CANCELLED } from "#synapse/modules"
import { TEAM_TOOL_ABORT_NAME, TEAM_TOOL_CANCELLED_MESSAGE } from "./constants"
import { teamAcceptedOrRefusedOutput, teamTextOutput } from "./tool-output"
import {
  type TeamInterruptInput,
  type TeamSendInput,
  type TeamSubagentInput,
  type TeamToolOutput,
  type TeamWaitInput,
} from "./types"

export class TeamAgentHandlers {
  private readonly team: AgentTeam

  private readonly caller: string

  constructor(team: AgentTeam, caller: string) {
    this.team = team
    this.caller = caller
  }

  async subagent(_id: string, input: TeamSubagentInput): Promise<TeamToolOutput> {
    return teamAcceptedOrRefusedOutput(await this.team.start(input))
  }

  async interrupt(_id: string, input: TeamInterruptInput): Promise<TeamToolOutput> {
    return teamAcceptedOrRefusedOutput(this.team.interrupt(input.agent))
  }

  async send(_id: string, input: TeamSendInput): Promise<TeamToolOutput> {
    return teamAcceptedOrRefusedOutput(this.team.send(this.caller, input.agent, input.message))
  }

  async list(): Promise<TeamToolOutput> {
    return teamTextOutput(JSON.stringify(this.team.overview().agents), false)
  }

  async wait(_id: string, input: TeamWaitInput, signal?: AbortSignal): Promise<TeamToolOutput> {
    const result = await this.team.wait(this.caller, input.timeout_ms, signal)
    if (result.kind === TEAM_CANCELLED) {
      throw new DOMException(TEAM_TOOL_CANCELLED_MESSAGE, TEAM_TOOL_ABORT_NAME)
    }
    return teamAcceptedOrRefusedOutput(result)
  }
}
