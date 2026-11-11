export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"

export interface Config {
  model?: string
  thinking: ThinkingLevel
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
  resolve(model: string, thinking: ThinkingLevel, signal: AbortSignal): Promise<ModelResolution>
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

export type ModelResponse = ModelSuccess | Failure | Cancelled

export interface ModelResolved {
  kind: "resolved"
  model: ResolvedModel
}

export type ModelResolution = ModelResolved | Failure | Cancelled

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
  activeModel(): ActiveModel
  startSession(): void
  readonly consultationInstructions: string
  turn(event: ReminderTurn): ReminderDecision
  consult(input: Consultation, model: ModelPort): Promise<ConsultationResult>
}

export interface ModelActive {
  kind: "active"
  model: string
}

export interface ModelInactive {
  kind: "inactive"
}

export type ActiveModel = ModelActive | ModelInactive

export interface ReminderDue {
  kind: "due"
  text: string
}

export interface ReminderIdle {
  kind: "idle"
}

export type ReminderDecision = ReminderDue | ReminderIdle

export interface ReminderTurn {
  completed: boolean
  usedTools: boolean
}

export interface ConfigPort {
  load(): ConfigLoadResult
  save(config: Config): ConfigSaveResult
}

export interface ConfigSaved {
  kind: "saved"
}

export type ConfigSaveResult = ConfigSaved | Failure

export type ConfigLoadResult = ConfigMissing | ConfigLoaded | ConfigInvalid

export interface ConfigMissing {
  kind: "missing"
}

export interface StoredConfig {
  model?: string
  thinking?: ThinkingLevel
}

export interface ConfigLoaded {
  kind: "loaded"
  config: StoredConfig
}

export interface ConfigInvalid {
  kind: "invalid"
  message: string
}
