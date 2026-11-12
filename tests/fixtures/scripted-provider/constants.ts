import { Type } from "typebox"
import { PI_PROCESS_MODEL } from "../scripted-model"

export const PI_PROCESS_PROVIDER = "synapse-scripted"

export const PI_PROCESS_MODEL_REFERENCE = `${PI_PROCESS_PROVIDER}/${PI_PROCESS_MODEL}`

export const PI_PROCESS_API_KEY = "fixture-key"

export const PI_PROCESS_BASE_URL = "https://fixture.invalid"

export const PI_PROCESS_API = "synapse-scripted-api"

export const PI_PROCESS_SCRIPT_FILE = "script.json"

export const PI_PROCESS_PROVIDER_URL = new URL("./scripted-provider.ts", import.meta.url)

export const PI_PROCESS_SCRIPT_FAILURE = "Roteiro do provedor esgotado."

export const PI_PROCESS_ENV_FAILURE = "Variáveis do roteiro de teste ausentes."

export const PI_PROCESS_SCRIPT_VARIABLE = "SYNAPSE_TEST_SCRIPT"

export const PI_PROCESS_ERROR_KIND = "error"

export const PI_PROCESS_STREAM_ERROR_EVENT = "error"

export const PI_PROCESS_ERROR_REASON = "error"

export const PI_PROCESS_TEXT_KIND = "text"

export const PI_PROCESS_TEXT_CONTENT = "text"

export const PI_PROCESS_ASSISTANT_ROLE = "assistant"

export const PI_PROCESS_PENDING_REASON = "pending"

export const PI_PROCESS_START_EVENT = "start"

export const PI_PROCESS_TEXT_START_EVENT = "text_start"

export const PI_PROCESS_TEXT_DELTA_EVENT = "text_delta"

export const PI_PROCESS_TEXT_END_EVENT = "text_end"

export const PI_PROCESS_DONE_EVENT = "done"

export const PI_PROCESS_STOP_REASON = "stop"

export const PI_PROCESS_TOOL_CALL_KIND = "toolCall"

export const PI_PROCESS_TOOL_START_EVENT = "toolcall_start"

export const PI_PROCESS_TOOL_DELTA_EVENT = "toolcall_delta"

export const PI_PROCESS_TOOL_END_EVENT = "toolcall_end"

export const PI_PROCESS_TOOL_USE_REASON = "toolUse"

const PI_PROCESS_STEP_SCHEMA = Type.Union([
  Type.Object({ kind: Type.Literal(PI_PROCESS_ERROR_KIND), text: Type.String() }),
  Type.Object({ kind: Type.Literal(PI_PROCESS_TEXT_KIND), text: Type.String() }),
  Type.Object({ kind: Type.Literal(PI_PROCESS_TOOL_CALL_KIND), name: Type.String(), argumentsJson: Type.String() }),
])

export const PI_PROCESS_SCRIPT_SCHEMA = Type.Array(PI_PROCESS_STEP_SCHEMA)
