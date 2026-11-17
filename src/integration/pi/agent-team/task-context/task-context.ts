import { type BeforeAgentStartEvent, type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { type AgentTeam, TASK_SELECTED } from "#synapse/modules/agent-team"
import { TEAM_PI_BEFORE_AGENT_START } from "../constants"
import {
  TEAM_EXECUTION_HEADER,
  TEAM_EXECUTION_INSTRUCTIONS,
  TEAM_EXECUTION_NONE,
  TEAM_EXECUTION_SECTION,
} from "./constants"

export class PiTeamTaskContext {
  private readonly team: AgentTeam

  private readonly caller: string

  constructor(team: AgentTeam, caller: string) {
    this.team = team
    this.caller = caller
  }

  register(pi: ExtensionAPI): void {
    pi.on(TEAM_PI_BEFORE_AGENT_START, this.beforeAgentStart.bind(this))
  }

  beforeAgentStart(event: BeforeAgentStartEvent): void {
    const selected = this.team.selectedTask(this.caller)
    let content = TEAM_EXECUTION_NONE
    if (selected.kind === TASK_SELECTED) {
      content = `${TEAM_EXECUTION_HEADER}${JSON.stringify(selected.task)}`
    }
    event.systemPromptOptions.sections[TEAM_EXECUTION_SECTION] = `${content}\n\n${TEAM_EXECUTION_INSTRUCTIONS}`
  }
}
