import { type ThinkingLevel } from "#synapse/modules/advisor/public/config";
import { type Cancelled } from "#synapse/modules/advisor/public/result";

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
