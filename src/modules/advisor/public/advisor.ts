import { type AdvisorResult } from "#synapse/modules/advisor/public/config/index.js";
import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
} from "#synapse/modules/advisor/public/consultation/index.js";
import { type ReminderTurn } from "./reminder.ts";

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
