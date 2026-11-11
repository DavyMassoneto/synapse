import { Type } from "typebox"
import { type InvalidConfigCase } from "./types"

export const VALID_CONFIG = JSON.stringify({ model: "openai/gpt-x", thinking: "low" })

export const INVALID_CASES: InvalidConfigCase[] = [
  { name: "nível inválido", content: JSON.stringify({ model: "openai/gpt-x", thinking: "banana" }) },
  { name: "nível numérico", content: JSON.stringify({ model: "openai/gpt-x", thinking: 42 }) },
  { name: "JSON malformado", content: "{broken" },
]

export const HOME_VARIABLE = "HOME"

export const PROFILE_VARIABLE = "USERPROFILE"

export const HOME_PREFIX = "synapse-config-"

export const MANIFEST_URL = new URL("../../../package.json", import.meta.url)

export const PACKAGE_ROOT_URL = new URL("../../..", import.meta.url)

export const MANIFEST_ENCODING = "utf8"

export const AUTH_FILE = "auth.json"

export const MODELS_STORE_FILE = "models-store.json"

export const manifestSchema = Type.Object({ pi: Type.Object({ extensions: Type.Tuple([Type.String()]) }) })
