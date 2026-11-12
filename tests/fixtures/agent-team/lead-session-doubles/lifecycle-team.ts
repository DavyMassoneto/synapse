import { type PiTeamLeadSession, TEAM_PI_NO_SESSION } from "#synapse/integration"
import { ToolsTeamDouble } from "../tools"

export class LifecycleTeamDouble extends ToolsTeamDouble {
  attachedDuringSuspend = false

  private readonly lead: PiTeamLeadSession

  constructor(lead: PiTeamLeadSession) {
    super()
    this.lead = lead
  }

  override async suspend(): Promise<void> {
    try {
      this.attachedDuringSuspend = Boolean(this.lead.context())
    } catch (error) {
      if (error instanceof Error && error.message === TEAM_PI_NO_SESSION) {
        this.attachedDuringSuspend = false
      } else {
        throw error
      }
    }
  }
}
