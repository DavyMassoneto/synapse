import { type ThinkingLevel } from "@/modules/advisor/public/config";
import { type TranscriptMessage } from "@/modules/advisor/public/transcript";

export interface UsageCost {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  total: number;
}

export interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: UsageCost;
}

export interface ModelRequest {
  system: string;
  prompt: string;
  model: string;
  thinking: ThinkingLevel;
  signal?: AbortSignal;
}

export interface ModelResponse {
  text: string;
  usage?: Usage;
}

export interface ModelPort {
  contextWindow(model: string, signal?: AbortSignal): Promise<number>;
  consult(request: ModelRequest): Promise<ModelResponse>;
}

export interface ConsultationSuccess {
  kind: "success";
  model: string;
  response: ModelResponse;
}

export interface ConsultationFailure {
  kind: "failure";
  message: string;
}

export interface ConsultationCancelled {
  kind: "cancelled";
}

export type ConsultationResult = ConsultationSuccess | ConsultationFailure | ConsultationCancelled;

export interface Consultation {
  system: string;
  messages: TranscriptMessage[];
  signal?: AbortSignal;
}
