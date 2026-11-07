import type { Cancelled } from "../result";
import type { Usage } from "./usage";

export interface ModelSuccess {
  kind: "success";
  text: string;
  usage?: Usage;
}

export type ModelResponse = ModelSuccess | Cancelled;
