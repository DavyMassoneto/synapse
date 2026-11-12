import { PI_PROCESS_MODEL_REFERENCE } from "../scripted-provider"
import { type InvalidConfigCase } from "./types"

export const INVALID_CASES: InvalidConfigCase[] = [
  { name: "nível inválido", content: JSON.stringify({ model: "openai/gpt-x", thinking: "banana" }) },
  { name: "nível numérico", content: JSON.stringify({ model: "openai/gpt-x", thinking: 42 }) },
  { name: "JSON malformado", content: "{broken" },
]

export const HOME_VARIABLE = "HOME"

export const PROFILE_VARIABLE = "USERPROFILE"

export const AGENT_DIRECTORY_VARIABLE = "PI_CODING_AGENT_DIR"

export const HOME_PREFIX = "synapse-config-"

export const DISTRIBUTION_PI_DIRECTORY = ".pi"

export const DISTRIBUTION_AGENT_DIRECTORY = "agent"

export const VALID_CONFIG = JSON.stringify({ model: PI_PROCESS_MODEL_REFERENCE, thinking: "low" })

export const ADVISOR_PROMPT = "Consulte o advisor"
