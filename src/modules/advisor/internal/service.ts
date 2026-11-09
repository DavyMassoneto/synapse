import {
  type Advisor,
  type Consultation,
  type ConsultationResult,
  hasModel,
  type ModelPort,
  type ReminderDecision,
  type ReminderTurn,
} from "#synapse/modules/advisor/public/contracts"
import { AdvisorConfiguration, type ConfigLoadResult, type ConfigPort } from "./configuration"
import { CONSULTATION_INSTRUCTIONS } from "./constants"
import { consultAdvisor } from "./consultation"
import { REMINDER, ReminderCounter } from "./reminder"

export class AdvisorService implements Advisor {
  readonly consultationInstructions = CONSULTATION_INSTRUCTIONS
  readonly configuration: AdvisorConfiguration
  readonly reminder = new ReminderCounter()

  constructor(config: ConfigPort, loaded: ConfigLoadResult) {
    this.configuration = new AdvisorConfiguration(config, loaded)
  }

  isEnabled(): boolean {
    const status = this.configuration.status()
    return status.kind === "success" && hasModel(status.config)
  }

  turn(event: ReminderTurn): ReminderDecision {
    if (this.isEnabled() && this.reminder.advance(event)) {
      return { kind: "due", text: REMINDER }
    }
    return { kind: "idle" }
  }

  async consult(input: Consultation, model: ModelPort): Promise<ConsultationResult> {
    if (input.signal.aborted) {
      return { kind: "cancelled" }
    }
    const status = this.configuration.status()
    if (status.kind === "failure") {
      return status
    }
    return consultAdvisor(input, model, status.config)
  }
}
