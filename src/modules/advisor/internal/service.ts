import {
  type Advisor,
  type AdvisorResult,
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ReminderText,
  type ReminderTurn,
} from "#synapse/modules/advisor/public/contracts"
import { AdvisorConfiguration, type ConfigLoadResult, type ConfigPort } from "./config"
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

  isEnabled(status: AdvisorResult): boolean {
    return status.kind === "success" && Boolean(status.config.model)
  }

  turn(event: ReminderTurn): ReminderText {
    if (!this.isEnabled(this.configuration.status())) {
      return undefined
    }
    if (this.reminder.advance(event)) {
      return REMINDER
    }
    return undefined
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
