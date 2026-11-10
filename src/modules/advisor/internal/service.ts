import {
  type ActiveModel,
  type Advisor,
  type ConfigLoadResult,
  type ConfigPort,
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ReminderDecision,
  type ReminderTurn,
} from "#synapse/modules/advisor/public/contracts"
import { AdvisorConfiguration } from "./configuration"
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

  activeModel(): ActiveModel {
    const status = this.configuration.status()
    if (status.kind === "success" && status.config.model) {
      return { kind: "active", model: status.config.model }
    }
    return { kind: "inactive" }
  }

  turn(event: ReminderTurn): ReminderDecision {
    if (this.activeModel().kind === "inactive") {
      return { kind: "idle" }
    }
    this.reminder.count(event)
    if (this.reminder.isDue(event)) {
      this.reminder.reset()
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
