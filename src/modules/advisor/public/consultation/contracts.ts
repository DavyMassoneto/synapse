import { type ThinkingLevel } from "@/modules/advisor/public/config";
import { type Cancelled, type Failure } from "@/modules/advisor/public/result.ts";
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

export type ModelResponse = ModelSuccess | Cancelled;

export interface ModelPort {
  resolve(model: string, thinking: ThinkingLevel, signal?: AbortSignal): Promise<ResolvedModel>;
  consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse>;
}

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
