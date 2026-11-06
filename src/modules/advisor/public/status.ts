import { type ThinkingLevel } from "@/modules/advisor/public/config";

export interface AdvisorStatus {
  model?: string;
  thinking: ThinkingLevel;
}

export interface AdvisorSuccess {
  kind: "success";
  status: AdvisorStatus;
}

export interface AdvisorFailure {
  kind: "failure";
  message: string;
}

export type AdvisorResult = AdvisorSuccess | AdvisorFailure;
