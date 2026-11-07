import { type Cancelled, type Failure } from "@/modules/advisor/public/result.ts";
import { type TranscriptMessage } from "@/modules/advisor/public/transcript";
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
