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
  signal?: AbortSignal;
}

export interface ResolvedModel {
  reference: string;
  contextWindow: number;
  maxOutputTokens: number;
  reasoningTokens: number;
  effectiveThinking: ThinkingLevel;
}

export interface ModelSuccess {
  kind: "success";
  text: string;
  usage?: Usage;
}

export interface ModelCancelled {
  kind: "cancelled";
}

export type ModelResponse = ModelSuccess | ModelCancelled;

export interface ModelPort {
  resolve(model: string, thinking: ThinkingLevel, signal?: AbortSignal): Promise<ResolvedModel>;
  consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse>;
}

export interface ConsultationSuccess {
  kind: "success";
  model: string;
  response: ModelSuccess;
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
