import {
  type BeforeAgentStartEvent,
  type SessionStartEvent,
  type ToolResultEvent,
  type TurnEndEvent,
} from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host-contracts"
import { ADVISOR_NAME } from "../tool"
import { REMINDER_DISPLAY, REMINDER_TYPE } from "./constants"
import { syncAdvisor } from "./sync-advisor"
import { type AdvisorToolActivation, type TurnEndOutcome } from "./types"

export class AdvisorEvents {
  private readonly pi: AdvisorToolActivation
  private readonly advisor: Advisor

  constructor(pi: AdvisorToolActivation, advisor: Advisor) {
    this.pi = pi
    this.advisor = advisor
  }

  sessionStart(_event: SessionStartEvent, context: AdvisorContext): void {
    this.advisor.reminder.reset()
    syncAdvisor(this.pi, this.advisor, context)
    this.reportConfigurationFailure(context)
  }

  private reportConfigurationFailure(context: AdvisorContext): void {
    const status = this.advisor.configuration.status()
    if (status.kind === "failure" && context.hasUI) {
      context.ui.notify(status.message, "error")
    }
  }

  beforeStart(event: BeforeAgentStartEvent, context: AdvisorContext): void {
    syncAdvisor(this.pi, this.advisor, context)
    this.applyInstructions(event)
  }

  private applyInstructions(event: BeforeAgentStartEvent): void {
    if (this.advisor.activeModel().kind === "active") {
      event.systemPromptOptions.sections.advisor = this.advisor.consultationInstructions
    } else {
      delete event.systemPromptOptions.sections.advisor
    }
  }

  toolResult(event: ToolResultEvent): void {
    if (event.toolName === ADVISOR_NAME) {
      this.advisor.reminder.reset()
    }
  }

  turnEnd(event: TurnEndEvent): TurnEndOutcome {
    const reminder = this.advisor.turn({
      completed: event.outcome === "completed",
      usedTools: event.toolResults.length > 0,
    })
    if (reminder.kind === "due") {
      return {
        entries: [
          ...event.entries,
          { type: "custom_message", customType: REMINDER_TYPE, content: reminder.text, display: REMINDER_DISPLAY },
        ],
      }
    }
  }
}
