import { type ThinkingLevel } from "../config"
import { type Cancelled, type Failure } from "../result"
import { type TranscriptMessage } from "../transcript"

export interface ConsultationSuccess {
  kind: "success"
  model: string
  response: ModelSuccess
}

export type ConsultationResult = ConsultationSuccess | Failure | Cancelled

export interface Consultation {
  system: string
  messages: TranscriptMessage[]
  signal: AbortSignal
}

export interface ModelPort {
  resolve(model: string, thinking: ThinkingLevel, signal: AbortSignal): Promise<ResolvedModel>
  consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse>
}

export interface ModelRequest {
  system: string
  prompt: string
  signal: AbortSignal
}

export interface ResolvedModel {
  reference: string
  contextWindow: number
  maxOutputTokens: number
  reasoningTokens: number
  effectiveThinking: ThinkingLevel
}

export interface ModelSuccess {
  kind: "success"
  text: string
  usage: Usage
}

export type ModelResponse = ModelSuccess | Cancelled

export interface UsageCost {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  total: number
}

export interface Usage {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  totalTokens: number
  cost: UsageCost
}
