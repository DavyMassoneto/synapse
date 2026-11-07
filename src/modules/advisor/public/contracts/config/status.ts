import type { Failure } from "../result";
import type { Config } from "./config";

export interface AdvisorSuccess {
  kind: "success";
  config: Config;
}

export type AdvisorResult = AdvisorSuccess | Failure;
