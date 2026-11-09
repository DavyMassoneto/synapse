export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"

export interface Config {
  model?: string
  thinking: ThinkingLevel
}

export interface ConfiguredConfig extends Config {
  model: string
}

export interface AdvisorConfigOperations {
  status(): AdvisorResult
  selectModel(model: string): AdvisorResult
  disable(): AdvisorResult
  setThinking(level: string): AdvisorResult
}

export interface AdvisorSuccess {
  kind: "success"
  config: Config
}

export type AdvisorResult = AdvisorSuccess | Failure

export interface Failure {
  kind: "failure"
  message: string
}

export interface Cancelled {
  kind: "cancelled"
}

export type TranscriptBlock = TranscriptText | TranscriptImage | TranscriptCall

export interface TranscriptText {
  kind: "text"
  text: string
}

export interface TranscriptImage {
  kind: "image"
}

export interface TranscriptCall {
  kind: "call"
  name: string
  arguments: string
}

export interface UserTranscript {
  kind: "user"
  blocks: TranscriptBlock[]
}

export interface AssistantTranscript {
  kind: "assistant"
  blocks: TranscriptBlock[]
}

export interface ToolResultTranscript {
  kind: "toolResult"
  tool: string
  error: boolean
  blocks: TranscriptBlock[]
}

export interface ShellTranscript {
  kind: "shell"
  command: string
  hidden: boolean
  blocks: TranscriptBlock[]
}

export interface CustomTranscript {
  kind: "custom"
  customType: string
  blocks: TranscriptBlock[]
}

export interface SummaryTranscript {
  kind: "summary"
  blocks: TranscriptBlock[]
}

export type TranscriptMessage =
  | UserTranscript
  | AssistantTranscript
  | ToolResultTranscript
  | ShellTranscript
  | CustomTranscript
  | SummaryTranscript

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

export interface ValidReference {
  kind: "valid"
  provider: string
  id: string
}

export interface InvalidReference {
  kind: "invalid"
}

export type ParsedReference = ValidReference | InvalidReference

export interface Advisor {
  readonly configuration: AdvisorConfigOperations
  isEnabled(status: AdvisorResult): boolean
  readonly reminder: ReminderControl
  consultationInstructions: string
  turn(event: ReminderTurn): ReminderDecision
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>
}

export interface ReminderDue {
  kind: "due"
  text: string
}

export interface ReminderIdle {
  kind: "idle"
}

export type ReminderDecision = ReminderDue | ReminderIdle

export interface ReminderControl {
  reset(): void
}

export interface ReminderTurn {
  completed: boolean
  usedTools: boolean
}
