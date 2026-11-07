import { type Cancelled, type Failure } from "#synapse/modules/advisor/public/result.js";
import { type TranscriptMessage } from "#synapse/modules/advisor/public/transcript/index.js";
import { type ModelSuccess } from "./model.ts";

export interface ConsultationSuccess {
  kind: "success";
  model: string;
  response: ModelSuccess;
}

export type ConsultationResult = ConsultationSuccess | Failure | Cancelled;

export interface Consultation {
  system: string;
  messages: TranscriptMessage[];
  signal?: AbortSignal;
}
