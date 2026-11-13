export interface RouterCandidate {
  provider: string
  authorized: boolean
  id: string
  name: string
  input: string[]
  contextWindow: number
  maxTokens: number
  efforts: string[]
}

export interface RouterToolCall {
  name: string
  arguments: string
}

export interface RouterToolResult {
  name: string
  error: boolean
}

export interface RouterMessage {
  role: string
  text: string
  image: boolean
  calls: RouterToolCall[]
  result?: RouterToolResult
}

export interface RouterPrevious {
  provider: string
  efforts: string[]
  modelId: string
  effort?: string
}

export interface RouteRequest {
  reason?: string
  failed?: RouterPrevious
  messages: readonly RouterMessage[]
  candidates: readonly RouterCandidate[]
  previous?: RouterPrevious
  signal?: AbortSignal
}

export interface RouteSelected {
  provider: string
  kind: "selected"
  modelId: string
  effort: string
  reason: string
}

export interface RouteKept {
  kind: "kept"
  provider: string
  modelId: string
  effort: string
}

export interface RouteReserve {
  kind: "reserve"
  modelId: string
  provider: string
  effort: string
  reason: string
}

export interface RouteUnavailable {
  kind: "unavailable"
  reason: string
}

export interface RouteCancelled {
  kind: "cancelled"
}

export type RouteOutcome = RouteSelected | RouteReserve | RouteKept | RouteUnavailable | RouteCancelled

export interface RouterHistoryEntry {
  index: number
  role: string
  content: string
}

export interface RouterConversation {
  currentRequest: string
  currentIndex?: number
  history: RouterHistoryEntry[]
  omittedMessages: number
  imageNotice: string
}

export interface RouterClassifierState {
  conversation: RouterConversation
  pilot: string
  previous?: RouterPrevious
  selectedModel?: string
}

export interface RouterChoiceOption {
  id: string
  criteria: string
}

export interface RouterChoiceQuestion {
  name: string
  instructions: string
  options: RouterChoiceOption[]
}

export interface ClassifierRequest {
  state: RouterClassifierState
  question: RouterChoiceQuestion
}

export interface RouterChoiceProbability {
  option: string
  probability: number
}

export interface RouterClassifierChoice {
  kind: "choice"
  choice: string
  probabilities: RouterChoiceProbability[]
}

export interface RouterClassifierFailed {
  kind: "failed"
  reason: string
}

export type ClassifierOutcome = RouterClassifierChoice | RouterClassifierFailed | RouteCancelled

export interface RouterClassifier {
  classify(request: ClassifierRequest, signal?: AbortSignal): Promise<ClassifierOutcome>
}

export interface ModelRouter {
  route(request: RouteRequest): Promise<RouteOutcome>
}

export type ModelRouterFactory = (classifier: RouterClassifier) => ModelRouter

export type RouterReserveOutcome = RouteReserve | RouteUnavailable

export type RouterOptionOutcome = string | RouteCancelled
