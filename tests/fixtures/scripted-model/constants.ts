import { type PiProcessModelDefinition } from "./types"

export const PI_PROCESS_MODEL = "scripted-model"

export const PI_PROCESS_CONTEXT_WINDOW = 128_000

export const PI_PROCESS_MAX_TOKENS = 4096

export const PI_PROCESS_TEXT_INPUT = "text"

export const PI_PROCESS_MODEL_DEFINITION: PiProcessModelDefinition = {
  id: PI_PROCESS_MODEL,
  name: PI_PROCESS_MODEL,
  reasoning: true,
  input: [PI_PROCESS_TEXT_INPUT],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: PI_PROCESS_CONTEXT_WINDOW,
  maxTokens: PI_PROCESS_MAX_TOKENS,
}
