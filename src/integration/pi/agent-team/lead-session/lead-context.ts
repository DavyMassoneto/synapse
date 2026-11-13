import { type TeamOverview } from "#synapse/modules"
import { teamPanelLines } from "../team-panel"
import {
  TEAM_PI_CONTEXT_ATTACHED,
  TEAM_PI_CONTEXT_DETACHED,
  TEAM_PI_FAILURE_LEVEL,
  TEAM_PI_NO_SESSION,
  TEAM_PI_WIDGET_KEY,
} from "./constants"
import { teamLeadWidgetRepresentation } from "./lead-widget"
import { type AgentTeamContext, type TeamLeadContextState } from "./types"

export class PiTeamLeadContext {
  private attachedContext?: AgentTeamContext

  attach(context: AgentTeamContext): void {
    this.attachedContext = context
  }

  detach(): void {
    delete this.attachedContext
  }

  current(): TeamLeadContextState {
    if (this.attachedContext) {
      return { kind: TEAM_PI_CONTEXT_ATTACHED, context: this.attachedContext }
    }
    return { kind: TEAM_PI_CONTEXT_DETACHED }
  }

  context(): AgentTeamContext {
    if (this.attachedContext) {
      return this.attachedContext
    }
    throw new Error(TEAM_PI_NO_SESSION)
  }

  show(overview: TeamOverview): void {
    const context = this.attachedContext
    if (context?.hasUI) {
      const content = teamLeadWidgetRepresentation(teamPanelLines(overview), context.mode)
      context.ui.setWidget(TEAM_PI_WIDGET_KEY, content)
    }
  }

  isRunning(): boolean {
    if (this.attachedContext) {
      return !this.attachedContext.isIdle()
    }
    return false
  }

  reportFailure(name: string, message: string): void {
    this.context().ui.notify(`${name}: ${message}`, TEAM_PI_FAILURE_LEVEL)
  }
}
