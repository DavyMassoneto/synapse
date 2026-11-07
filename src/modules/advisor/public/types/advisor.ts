import { type AdvisorResult } from "@/modules/advisor/public/config";
import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
} from "@/modules/advisor/public/consultation";
import { type ReminderTurn } from "./reminder.ts";

export interface Advisor {
  status(): AdvisorResult;
  selectModel(model: string): AdvisorResult;
  disable(): AdvisorResult;
  setThinking(level: string): AdvisorResult;
  timing: string;
  reset(): void;
  turn(event: ReminderTurn): string | undefined;
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>;
}
