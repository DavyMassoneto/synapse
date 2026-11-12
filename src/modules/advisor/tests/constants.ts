import { CONFIG_INVALID } from "../adapters"
import { type ConfigInvalid, type ReminderTurn } from "../public"
import { type RenderedMessage } from "./types"

export const INVALID_FILE: ConfigInvalid = { kind: "invalid", message: CONFIG_INVALID }

export const RENDERED_MESSAGES: RenderedMessage[] = [
  { name: "sem blocos", message: { kind: "user", blocks: [] }, text: "[user]" },
  { name: "com bloco vazio", message: { kind: "user", blocks: [{ kind: "text", text: "" }] }, text: "[user]\n" },
  {
    name: "com texto e imagem",
    message: { kind: "summary", blocks: [{ kind: "text", text: "a" }, { kind: "image" }] },
    text: "[summary of earlier conversation]\na\n[image omitted]",
  },
]

export const BYTE_ORDER_MARK = "\uFEFF"

export const WITH_TOOLS: ReminderTurn = { completed: true, usedTools: true }
