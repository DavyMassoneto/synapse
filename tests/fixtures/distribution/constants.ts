import { Type } from "typebox"
import { type ConfigCase } from "./types"

export const CASES: ConfigCase[] = [
  { name: "ausente", expected: /Advisor: desligado, thinking high/ },
  {
    name: "válida",
    content: JSON.stringify({ model: "openai/gpt-x", thinking: "low" }),
    expected: /Advisor: openai\/gpt-x, thinking low/,
  },
  {
    name: "nível inválido",
    content: JSON.stringify({ model: "openai/gpt-x", thinking: "banana" }),
    expected: /Configuração do advisor inválida/,
    invalid: true,
  },
  {
    name: "nível numérico",
    content: JSON.stringify({ model: "openai/gpt-x", thinking: 42 }),
    expected: /Configuração do advisor inválida/,
    invalid: true,
  },
  {
    name: "JSON malformado",
    content: "{broken",
    expected: /Configuração do advisor inválida/,
    invalid: true,
  },
]

export const MANIFEST_URL = new URL("../../../package.json", import.meta.url)

export const PACKAGE_ROOT_URL = new URL("../../..", import.meta.url)

export const MANIFEST_ENCODING = "utf8"

export const AUTH_FILE = "auth.json"

export const MODELS_STORE_FILE = "models-store.json"

export const manifestSchema = Type.Object({ pi: Type.Object({ extensions: Type.Tuple([Type.String()]) }) })
