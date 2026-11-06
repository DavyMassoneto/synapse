export const THINKING = ["off", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export interface Config { model?: string; thinking: (typeof THINKING)[number] }
export interface ConfigPort { load(): Config; save(config: Config): void }
export interface TranscriptMessage { role: string; content?: unknown; toolName?: string; isError?: boolean; command?: string; output?: string; excludeFromContext?: boolean; customType?: string; summary?: string }
export type ModelPort = (request: { system: string; prompt: string; model: string; thinking: Config["thinking"]; signal?: AbortSignal }) => Promise<{ text: string; usage?: unknown }>;
