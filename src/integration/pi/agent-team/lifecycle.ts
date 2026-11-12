import {
  type BeforeAgentStartEvent,
  type MessageEndEvent,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type TurnStartEvent,
} from "@earendil-works/pi-coding-agent"
import { type AgentTeam } from "#synapse/modules"
import { TEAM_PI_LEAD_INSTRUCTIONS, TEAM_PI_PROMPT_SECTION } from "./constants"
import { readTeamHistory } from "./session-history"
import { type AgentTeamContext, type PiTeamLeadSession } from "./types"

export class PiTeamLifecycle {
  private readonly lead: PiTeamLeadSession

  private readonly team: AgentTeam

  constructor(lead: PiTeamLeadSession, team: AgentTeam) {
    this.lead = lead
    this.team = team
  }

  async sessionStart(_event: SessionStartEvent, context: AgentTeamContext): Promise<void> {
    await this.team.suspend()
    this.lead.attach(context)
    const storage = context.sessionManager
    const history = readTeamHistory(storage, storage.getSessionId())
    await this.team.restore(history.members, history.tasks)
  }

  async sessionShutdown(_event: SessionShutdownEvent): Promise<void> {
    try {
      await this.team.suspend()
    } finally {
      this.lead.detach()
    }
  }

  beforeAgentStart(event: BeforeAgentStartEvent, context: AgentTeamContext): void {
    this.lead.attach(context)
    event.systemPromptOptions.sections[TEAM_PI_PROMPT_SECTION] = TEAM_PI_LEAD_INSTRUCTIONS
  }

  turnStart(_event: TurnStartEvent, context: AgentTeamContext): void {
    this.lead.attach(context)
    this.team.markLeadSeen()
    this.team.refresh()
  }

  messageEnd(event: MessageEndEvent): void {
    this.lead.recordMessage(event)
    this.team.refresh()
  }

  agentSettled(): void {
    this.team.refresh()
  }
}
