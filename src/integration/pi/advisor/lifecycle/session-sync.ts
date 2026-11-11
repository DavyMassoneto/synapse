import { type BeforeAgentStartEvent, type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { syncAdvisor } from "./sync-advisor"
import { type AdvisorToolActivation, type SessionContext } from "./types"

export class SessionSync {
  private readonly pi: AdvisorToolActivation
  private readonly advisor: Advisor

  constructor(pi: AdvisorToolActivation, advisor: Advisor) {
    this.pi = pi
    this.advisor = advisor
  }

  sessionStart(_event: SessionStartEvent, context: SessionContext): void {
    syncAdvisor(this.pi, this.advisor, context)
    this.reportConfigurationFailure(context)
  }

  beforeStart(event: BeforeAgentStartEvent, context: SessionContext): void {
    syncAdvisor(this.pi, this.advisor, context)
    this.applyInstructions(event)
  }

  private reportConfigurationFailure(context: SessionContext): void {
    const status = this.advisor.configuration.status()
    if (status.kind === "failure" && context.hasUI) {
      context.ui.notify(status.message, "error")
    }
  }

  private applyInstructions(event: BeforeAgentStartEvent): void {
    if (this.advisor.activeModel().kind === "active") {
      event.systemPromptOptions.sections.advisor = this.advisor.consultationInstructions
    } else {
      delete event.systemPromptOptions.sections.advisor
    }
  }
}
