import type { AdvisorResult } from "./config";
import type { Consultation, ConsultationResult, ModelPort } from "./consultation";
import type { ReminderTurn } from "./reminder.ts";

export interface Advisor {
  status(): AdvisorResult;
  isEnabled(): boolean;
  selectModel(model: string): AdvisorResult;
  disable(): AdvisorResult;
  setThinking(level: string): AdvisorResult;
  consultationInstructions: string;
  resetReminder(): void;
  turn(event: ReminderTurn): string | undefined;
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>;
}
