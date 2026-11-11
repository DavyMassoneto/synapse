import { type BeforeAgentStartEvent, type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host-contracts"
import { syncAdvisor } from "./sync-advisor"
import { type AdvisorToolActivation } from "./types"

export class SessionSync {
  private readonly pi: AdvisorToolActivation
  private readonly advisor: Advisor

  constructor(pi: AdvisorToolActivation, advisor: Advisor) {
    this.pi = pi
    this.advisor = advisor
  }

  sessionStart(_event: SessionStartEvent, context: AdvisorContext): void {
    syncAdvisor(this.pi, this.advisor, context)
    this.reportConfigurationFailure(context)
  }

  beforeStart(event: BeforeAgentStartEvent, context: AdvisorContext): void {
    syncAdvisor(this.pi, this.advisor, context)
    this.applyInstructions(event)
  }

  private reportConfigurationFailure(context: AdvisorContext): void {
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
