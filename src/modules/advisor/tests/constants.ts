import { CONFIG_INVALID } from "../adapters"
import { type ConfigInvalid, type ReminderTurn } from "../public"

export const INVALID_FILE: ConfigInvalid = { kind: "invalid", message: CONFIG_INVALID }

export const WITH_TOOLS: ReminderTurn = { completed: true, usedTools: true }
