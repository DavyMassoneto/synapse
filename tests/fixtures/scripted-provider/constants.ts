import { type ScriptedProviderModelDefinition } from "./types"

export const SCRIPTED_PROVIDER_MODEL = "scripted-model"

export const SCRIPTED_PROVIDER_CONTEXT_WINDOW = 128_000

export const SCRIPTED_PROVIDER_MAX_TOKENS = 4096

export const SCRIPTED_PROVIDER_TEXT_INPUT = "text"

export const SCRIPTED_PROVIDER_MODEL_DEFINITION: ScriptedProviderModelDefinition = {
  id: SCRIPTED_PROVIDER_MODEL,
  name: SCRIPTED_PROVIDER_MODEL,
  reasoning: true,
  input: [SCRIPTED_PROVIDER_TEXT_INPUT],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: SCRIPTED_PROVIDER_CONTEXT_WINDOW,
  maxTokens: SCRIPTED_PROVIDER_MAX_TOKENS,
}

export const SCRIPTED_PROVIDER_PROVIDER = "synapse-scripted"

export const SCRIPTED_PROVIDER_MODEL_REFERENCE = `${SCRIPTED_PROVIDER_PROVIDER}/${SCRIPTED_PROVIDER_MODEL}`

export const SCRIPTED_PROVIDER_API_KEY = "fixture-key"

export const SCRIPTED_PROVIDER_BASE_URL = "https://fixture.invalid"

export const SCRIPTED_PROVIDER_API = "synapse-scripted-api"

export const SCRIPTED_PROVIDER_SCRIPT_FILE = "script.json"

export const SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX = ".offset.json"

export const SCRIPTED_PROVIDER_TRACK_SELECTED = "selected"

export const SCRIPTED_PROVIDER_TRACK_MISSING = "missing"

export const SCRIPTED_PROVIDER_SYSTEM_ROLE = "system"

export const SCRIPTED_PROVIDER_PROVIDER_NEWLINE = "\n"

export const SCRIPTED_PROVIDER_PROVIDER_URL = new URL("./scripted-provider.ts", import.meta.url)

export const SCRIPTED_PROVIDER_SCRIPT_FAILURE = "Roteiro do provedor esgotado."

export const SCRIPTED_PROVIDER_ENV_FAILURE = "Variáveis do roteiro de teste ausentes."

export const SCRIPTED_PROVIDER_SCRIPT_VARIABLE = "SYNAPSE_TEST_SCRIPT"

export const SCRIPTED_PROVIDER_ERROR_KIND = "error"

export const SCRIPTED_PROVIDER_STREAM_ERROR_EVENT = "error"

export const SCRIPTED_PROVIDER_ERROR_REASON = "error"

export const SCRIPTED_PROVIDER_TEXT_KIND = "text"

export const SCRIPTED_PROVIDER_TEXT_CONTENT = "text"

export const SCRIPTED_PROVIDER_ASSISTANT_ROLE = "assistant"

export const SCRIPTED_PROVIDER_PENDING_REASON = "pending"

export const SCRIPTED_PROVIDER_START_EVENT = "start"

export const SCRIPTED_PROVIDER_TEXT_START_EVENT = "text_start"

export const SCRIPTED_PROVIDER_TEXT_DELTA_EVENT = "text_delta"

export const SCRIPTED_PROVIDER_TEXT_END_EVENT = "text_end"

export const SCRIPTED_PROVIDER_DONE_EVENT = "done"

export const SCRIPTED_PROVIDER_STOP_REASON = "stop"

export const SCRIPTED_PROVIDER_TOOL_CALL_KIND = "toolCall"

export const SCRIPTED_PROVIDER_TOOL_START_EVENT = "toolcall_start"

export const SCRIPTED_PROVIDER_TOOL_DELTA_EVENT = "toolcall_delta"

export const SCRIPTED_PROVIDER_TOOL_END_EVENT = "toolcall_end"

export const SCRIPTED_PROVIDER_TOOL_USE_REASON = "toolUse"

export const SCRIPTED_PROVIDER_PROVIDER_VARIABLE = "SYNAPSE_TEST_PROVIDER"

export const SCRIPTED_PROVIDER_MODEL_VARIABLE = "SYNAPSE_TEST_MODEL"
