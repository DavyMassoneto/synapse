import type { AdvisorConfigOperations, AdvisorResult } from "./config";
import type { Consultation, ConsultationResult, ModelPort } from "./consultation";
import type { ReminderControl, ReminderTurn } from "./reminder";

export interface Advisor {
  readonly configuration: AdvisorConfigOperations;
  isEnabled(status?: AdvisorResult): boolean;
  readonly reminder: ReminderControl;
  consultationInstructions: string;
  turn(event: ReminderTurn): string | undefined;
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>;
}
