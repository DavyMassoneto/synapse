import { type Failure } from "@/modules/advisor/public/result";
import { type Config } from "./config.ts";

export interface AdvisorSuccess {
  kind: "success";
  config: Config;
}

export type AdvisorResult = AdvisorSuccess | Failure;
