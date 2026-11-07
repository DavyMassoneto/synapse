import type { Cancelled, Failure } from "../result";
import type { TranscriptMessage } from "../transcript";
import type { ModelSuccess } from "./response";

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
