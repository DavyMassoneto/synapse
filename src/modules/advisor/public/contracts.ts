export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

export interface Config {
  model?: string;
  thinking: ThinkingLevel;
}

export interface ConfigPort {
  load(): Config;
  save(config: Config): void;
}

export interface TranscriptPart {
  text: string;
  clip: boolean;
}

export interface TranscriptMessage {
  role: string;
  parts: TranscriptPart[];
}

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

export type ModelPort = (request: ModelRequest) => Promise<ModelResponse>;

export interface Consultation {
  config: Config;
  system: string;
  messages: TranscriptMessage[];
  contextWindow: number;
  signal?: AbortSignal;
}

export interface Advisor {
  config: ConfigPort;
  timing: string;
  reset(): void;
  turn(completed: boolean, hasTools: boolean): string | undefined;
  consult(input: Consultation, model: ModelPort): Promise<ModelResponse>;
}
