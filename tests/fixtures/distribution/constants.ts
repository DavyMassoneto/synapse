import { SCRIPTED_PROVIDER_MODEL_REFERENCE } from "../scripted-provider"
import { type InvalidConfigCase } from "./types"

export const INVALID_CASES: InvalidConfigCase[] = [
  { name: "nível inválido", content: JSON.stringify({ model: "openai/gpt-x", thinking: "banana" }) },
  { name: "nível numérico", content: JSON.stringify({ model: "openai/gpt-x", thinking: 42 }) },
  { name: "JSON malformado", content: "{broken" },
]

export const HOME_VARIABLE = "HOME"

export const PROFILE_VARIABLE = "USERPROFILE"

export const HOME_PREFIX = "synapse-config-"

export const VALID_CONFIG = JSON.stringify({ model: SCRIPTED_PROVIDER_MODEL_REFERENCE, thinking: "low" })

export const ADVISOR_PROMPT = "Consulte o advisor"

export const DISTRIBUTION_COMMANDS_COMMAND = "get_commands"

export const DISTRIBUTION_ADVISOR_NAME = "advisor"

export const DISTRIBUTION_EXTENSION_SOURCE = "extension"

export const DISTRIBUTION_ADVISOR_STATUS = `advisor: ${SCRIPTED_PROVIDER_MODEL_REFERENCE}`

export const DISTRIBUTION_ERROR_NOTICE = "error"

export const DISTRIBUTION_INVALID_CONFIGURATION_PATTERN = /inválida/

export const DISTRIBUTION_MISSING_EXTENSION_PATTERN = /extensão|extension/i

export const DISTRIBUTION_ADVISOR_ARGUMENTS_JSON = "{}"

export const DISTRIBUTION_ADVISOR_REPLY = "conselho"

export const DISTRIBUTION_COMPLETION_REPLY = "concluído"

export const DISTRIBUTION_DISABLED_ADVISOR_ERROR = "Tool advisor not found"

export const DISTRIBUTION_INVALID_ARGUMENTS_JSON = "[]"

export const DISTRIBUTION_INVALID_ARGUMENTS_ERROR = "Tool arguments must be a JSON object"

export const DISTRIBUTION_FINISHED_REPLY = "ok"
