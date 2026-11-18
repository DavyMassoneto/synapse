import {
  type BeforeAgentStartEvent,
  type MessageEndEvent,
  type SessionShutdownEvent,
  type TurnStartEvent,
} from "@earendil-works/pi-coding-agent"
import { type AgentTeam, TEAM_LEAD_NAME } from "#synapse/modules/agent-team"
import { TEAM_PI_LEAD_INSTRUCTIONS, TEAM_PI_PROMPT_SECTION } from "./constants"
import { type AgentTeamContext, type PiTeamLeadSession } from "./lead-session"
import { readTeamHistory } from "./session-history"
import { PiTeamTaskContext } from "./task-context"
import { type AgentTeamRestoreEvent } from "./types"

export class PiTeamLifecycle {
  private readonly lead: PiTeamLeadSession

  private readonly team: AgentTeam

  private readonly taskContext: PiTeamTaskContext

  private transition = 0

  constructor(lead: PiTeamLeadSession, team: AgentTeam) {
    this.lead = lead
    this.team = team
    this.taskContext = new PiTeamTaskContext(team, TEAM_LEAD_NAME)
  }

  async restoreSession(_event: AgentTeamRestoreEvent, context: AgentTeamContext): Promise<void> {
    const transition = ++this.transition
    await this.team.suspend()
    if (transition === this.transition) {
      this.lead.attach(context)
      this.lead.show(this.team.overview())
      const storage = context.sessionManager
      const history = readTeamHistory(storage, storage.getSessionId())
      if (transition === this.transition) {
        await this.team.restore(history.members, history.tasks)
      }
    }
  }

  async sessionShutdown(_event: SessionShutdownEvent): Promise<void> {
    const transition = ++this.transition
    try {
      await this.team.suspend()
    } finally {
      if (transition === this.transition) {
        this.lead.detach()
      }
    }
  }

  beforeAgentStart(event: BeforeAgentStartEvent, context: AgentTeamContext): void {
    this.lead.attach(context)
    event.systemPromptOptions.sections[TEAM_PI_PROMPT_SECTION] = TEAM_PI_LEAD_INSTRUCTIONS
    this.taskContext.beforeAgentStart(event)
  }

  turnStart(_event: TurnStartEvent, context: AgentTeamContext): void {
    this.lead.attach(context)
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
