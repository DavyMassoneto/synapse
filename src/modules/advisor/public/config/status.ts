import { type Config } from "@/modules/advisor/public/config";

export interface AdvisorSuccess {
  kind: "success";
  config: Config;
}

export interface AdvisorFailure {
  kind: "failure";
  message: string;
}

export type AdvisorResult = AdvisorSuccess | AdvisorFailure;
