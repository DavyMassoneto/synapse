import { type AdvisorResult, type ThinkingLevel } from "@/modules/advisor/public/config";
import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
} from "@/modules/advisor/public/consultation";
import { type ReminderTurn } from "@/modules/advisor/public/types";

export interface Advisor {
  status(): AdvisorResult;
  selectModel(model: string): AdvisorResult;
  disable(): AdvisorResult;
  setThinking(level: ThinkingLevel): AdvisorResult;
  timing: string;
  reset(): void;
  turn(event: ReminderTurn): string | undefined;
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>;
}
