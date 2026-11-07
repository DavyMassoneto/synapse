import { type Config } from "./config.ts";

export interface AdvisorSuccess {
  kind: "success";
  config: Config;
}

export interface AdvisorFailure {
  kind: "failure";
  message: string;
}

export type AdvisorResult = AdvisorSuccess | AdvisorFailure;
