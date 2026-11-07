import type { ThinkingLevel } from "../config";

export interface ResolvedModel {
  reference: string;
  contextWindow: number;
  maxOutputTokens: number;
  reasoningTokens: number;
  effectiveThinking: ThinkingLevel;
}
