import { type AdvisorConfigOperations, type AdvisorResult } from "./config"
import { type Consultation, type ConsultationResult, type ModelPort } from "./consultation"

export interface Advisor {
  readonly configuration: AdvisorConfigOperations
  isEnabled(status: AdvisorResult): boolean
  readonly reminder: ReminderControl
  consultationInstructions: string
  turn(event: ReminderTurn): ReminderText
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>
}

export type ReminderText = string | undefined

export interface ReminderControl {
  reset(): void
}

export interface ReminderTurn {
  completed: boolean
  usedTools: boolean
}
