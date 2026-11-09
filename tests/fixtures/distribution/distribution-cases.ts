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
