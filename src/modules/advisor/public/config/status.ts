import { type Failure } from "#synapse/modules/advisor/public/result.js";
import { type Config } from "./config.ts";

export interface AdvisorSuccess {
  kind: "success";
  config: Config;
}

export type AdvisorResult = AdvisorSuccess | Failure;
