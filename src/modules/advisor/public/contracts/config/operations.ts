import type { AdvisorResult } from "./status";

export interface AdvisorConfigOperations {
  status(): AdvisorResult;
  selectModel(model: string): AdvisorResult;
  disable(): AdvisorResult;
  setThinking(level: string): AdvisorResult;
}
